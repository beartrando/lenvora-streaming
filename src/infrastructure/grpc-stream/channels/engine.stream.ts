import * as engineProto from '../generated/engine';
import config from "../../configs/configs";
import * as grpc from '@grpc/grpc-js';
import logger from "@shared/logger";
import * as battleService from "../../services/battle.service";


class EngineStream {
    private stream: grpc.ClientDuplexStream<any, any> | null = null;
    private client: engineProto.EngineClient | null = null;
    private reconnectDelay = 1000; // стартовый backoff
    private maxDelay = 30000;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatPeriod = 5000;
    private reconnectScheduled = false;

    getEngineStream = () => {
        if (!this.stream) {
            throw new Error('Engine stream is not initialized');
        }

        return this.stream;
    }

    connect = () => {
        if (this.stream) {
            logger.log('Garbage stream was canceled...')
            this.stream.cancel?.();
            this.stopHeartbeat();
        }

        logger.log('Connection stream engine...')

        this.client = new engineProto.EngineClient(
            config.serviceEngineUrl,
            grpc.credentials.createInsecure()
        );

        this.stream = this.client.battleChannel();

        this.stream.on('data', (message: engineProto.BattleResponse) => {

            this.reconnectDelay = 1000

            if (message.ping) {
                return;
            }
            logger.log(message);

            if (message.battle) {
                battleService.update(message.battle);
            }

        });

        this.stream.on('error', (err) => {
            console.error('Stream error:', err);

            this.stopHeartbeat();
        });

        this.stream.on('end', () => {
            console.warn('Stream ended');
            this.scheduleReconnect();
        });

        this.stream.on('close', () => {
            console.warn('Stream closed');
            this.scheduleReconnect();
        });


        this.startHeartbeat();

        return this.stream;
    }

    write(data: engineProto.BattleRequest) {
        // logger.info(data);
        if (!this.stream) {
            throw new Error('Engine stream not initialized');
        }

        this.stream.write(data);
    }

    scheduleReconnect = () => {

        if (this.reconnectScheduled) {
            return;
        }

        this.reconnectScheduled = true;

        // logger.log('scheduleReconnect', this.reconnectDelay);
        this.stopHeartbeat();
        setTimeout(() => {

            this.reconnectScheduled = false;
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);

            this.connect();
        }, this.reconnectDelay);
    }

    startHeartbeat = () => {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.stream) {
                // logger.log('ping engine stream');
                this.stream.write({
                    ping: {timestamp: new Date()}
                });
            }
        }, this.heartbeatPeriod); // каждые 5 секунд
    }

    stopHeartbeat = () => {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

const engineStream = new EngineStream();

export default engineStream;

