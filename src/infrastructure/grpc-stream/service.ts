import StreamInterface from "./interfaces/stream.interface";

export class GrpcStreamService<TRequest> {
    private _stream: StreamInterface<TRequest> | null = null;

    get stream(): StreamInterface<TRequest> {
        if (!this._stream) {
            throw new Error("gRPC stream is not initialized");
        }

        return this._stream;
    }

    set stream(stream: StreamInterface<TRequest>) {
        if (this._stream) {
            throw new Error("gRPC stream is initialized already");
        }

        this._stream = stream;
    }

    async start(): Promise<void> {
        this.stream.connect();
    }

    async stop(): Promise<void> {
        this.stream.disconnect();
    }

    async check(): Promise<boolean> {
        return this._stream !== null;
    }
}

export default GrpcStreamService;
