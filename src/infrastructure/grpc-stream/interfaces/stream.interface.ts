export interface StreamInterface<TRequest> {
    connect(): void;

    disconnect(): void;

    write(data: TRequest): void;
}

export default StreamInterface;
