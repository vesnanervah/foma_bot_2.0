import { BaseCommandClient } from "./baseCommandClient.js";
import { Context } from "telegraf";

abstract class IntervalCommandClient<T extends Context> extends BaseCommandClient {
    chatContext: T | undefined;

    abstract startIntervalSubscribtions(): void;

    protected async startIntervalCommand(cb:  () => Promise<void> ): Promise<void> {
        setTimeout(async () => {    
            await cb();
            await this.startIntervalCommand(cb);
        }, this.getRandomInterval());
    }

    protected getRandomInterval(): number {
        return Math.floor(this.getRandomValueFromArray<number>([100000, 1000000, 10000000, 100000000]) * Math.random())
    }
}

export { IntervalCommandClient };