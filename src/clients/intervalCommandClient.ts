import { BaseCommandClient } from "./baseCommandClient.js";
import { Context } from "telegraf";

abstract class IntervalCommandClient extends BaseCommandClient {
    chatContext: Context | undefined;

    abstract startIntervalSubscribtions(): void;

    protected async startIntervalCommand(cb:  () => Promise<void> ): Promise<void> {
        setTimeout(async () => {    
            await cb();
            await this.startIntervalCommand(cb);
        }, this.getRandomInterval());
    }

    protected getRandomInterval(): number {
        return Math.floor(this.getRandomValueFromArray<number>([1000, 10000, 100000, 1000000]) * Math.random())
    }
}

export { IntervalCommandClient };