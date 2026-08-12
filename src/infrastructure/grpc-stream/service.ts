import {PrismaClient} from "@prisma/client";
import EngineStream from "./channels/engine.stream";
import StreamInterface from "./interfaces/stream.interface";

export class GrpcStreamService {

    set stream(stream: StreamInterface<TRequest>)
    {
        this._stream = stream;
    }

    get stream(): EngineStream {
        return this._stream;
    }

    async start(): Promise<void> {
        this._stream.connect();
    }

    async stop(): Promise<void> {
        this._stream.disconnect();
    }

    async check(): Promise<boolean> {
        return true;
    }
}

export default GrpcStreamService;
