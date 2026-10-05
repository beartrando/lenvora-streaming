import * as grpc from "@grpc/grpc-js";
import * as speechToTextProto from "../../../contracts/proto/speech-to-text";
import * as errorProto from "../../../contracts/proto/common/error";
import logger from "@shared/logger";

export interface SpeechToTextStreamHandlers {
    onTranscription(transcription: speechToTextProto.Transcription): void;

    onError(error: errorProto.ErrorObject): void;

    onClosed(): void;
}

/**
 * Bidi-клиент SpeechToText — отдельный grpc-js клиент
 * (GrpcClientManager потоки не поддерживает).
 *
 * Один клиент = одна голосовая сессия. Без ретрая: реконнект потока — это
 * потеря сессии, повторную авторизацию (auth-сообщение) выполняет клиент,
 * открывая новый поток.
 *
 * Основа — engine-канал (grpc-stream/channels/engine.stream.ts):
 * connect/write/disconnect, обработчики data/error/end; heartbeat и
 * экспоненциальный реконнект не переносятся — поток живёт в рамках
 * голосовой сессии.
 */
export class SpeechToTextClient {
    private client: speechToTextProto.SpeechToTextClient | null = null;
    private stream: grpc.ClientDuplexStream<speechToTextProto.TranscribeRequest, speechToTextProto.TranscribeResponse> | null = null;

    constructor(
        private readonly serviceSpeechToTextUrl: string,
    ) {
    }

    get isOpen(): boolean {
        return this.stream !== null;
    }

    open(handlers: SpeechToTextStreamHandlers): void {
        if (this.stream) {
            logger.log("Voice stream was cancelled, opening a new one...");
            this.close();
        }

        logger.log(`Connection speech-to-text stream (${this.serviceSpeechToTextUrl})...`);

        this.client = new speechToTextProto.SpeechToTextClient(
            this.serviceSpeechToTextUrl,
            grpc.credentials.createInsecure(),
        );

        const stream = this.client.transcribe();

        this.stream = stream;

        let closed = false;
        const closeOnce = () => {
            if (closed) {
                return;
            }
            closed = true;

            this.stream = null;
            this.client?.close();
            this.client = null;

            handlers.onClosed();
        };

        stream.on("data", (response: speechToTextProto.TranscribeResponse) => {
            if (response.transcription) {
                handlers.onTranscription(response.transcription);
                return;
            }

            if (response.error) {
                logger.warn({error: response.error}, "speech-to-text responded with error");
                handlers.onError(response.error);
            }
        });

        stream.on("error", (err: grpc.ServiceError) => {
            if (err.code !== grpc.status.CANCELLED) {
                logger.error({err}, "speech-to-text stream error");
            }
            closeOnce();
        });

        stream.on("end", () => {
            logger.log("speech-to-text stream ended");
            closeOnce();
        });
    }

    /**
     * Пишет сообщение в поток; false — поток уже закрыт.
     */
    write(request: speechToTextProto.TranscribeRequest): boolean {
        if (!this.stream) {
            return false;
        }

        this.stream.write(request);
        return true;
    }

    close(): void {
        if (!this.stream) {
            this.client?.close();
            this.client = null;
            return;
        }

        const stream = this.stream;
        const client = this.client;

        this.stream = null;
        this.client = null;

        // Отключаем слушателей, чтобы cancel не породил onClosed на
        // штатном закрытии сессии.
        stream.removeAllListeners("data");
        stream.removeAllListeners("end");
        stream.on("error", () => {
            // noop: cancel завершает поток ошибкой CANCELLED
        });
        stream.cancel();
        client?.close();
    }
}

export default SpeechToTextClient;
