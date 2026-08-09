import {createConsumer, createProducer, KafkaConfig, KafkaProducer} from "@shared/kafka-manager";
import logger from "@shared/logger";
import sleep from "../../utils/sleep";
import BattleStartedConsumer from "./consumers/battle-started";

export class MessageService {

    private producer?: KafkaProducer;

    constructor(
        private readonly config: KafkaConfig,
        private readonly consumersConfig: Record<string, string>,
        // private readonly battleUpdatedConsumer: BattleStartedConsumer,
    ) {
    }

    async start(): Promise<void> {
        await this.retryInit(() => this.createConsumers());
    }

    async stop(): Promise<void> {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }

    async getProducer(): Promise<KafkaProducer> {
        if (!this.producer) {
            this.producer = await createProducer(this.config);
        }

        return this.producer;
    }

    async check(): Promise<boolean> {
        try {
            const producer = await this.getProducer();

            // await producer.send('healthcheck', [{value: 'ping'}]);
            await producer.send('healthcheck', 'ping');

            return true;
        } catch (err) {
            logger.error("Kafka health check failed", err);
            return false;
        }
    }

    private async createConsumers(): Promise<void> {
        createConsumer(this.config, {
            topic: this.consumersConfig.battleUpdated,
            handler: this.battleUpdatedConsumer.execute
        })
    }

    private async retryInit(
        fn: () => Promise<void>,
    ): Promise<void> {
        while (true) {
            try {
                await fn();

                logger.info("✅ Kafka initialized");
                return;
            } catch (err) {
                logger.warn(
                    {err},
                    "⏳ Waiting for Kafka topics...",
                );

                await sleep(3000);
            }
        }
    }
}

export default MessageService;
