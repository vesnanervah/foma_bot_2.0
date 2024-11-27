import { Update } from "@telegraf/types";
import { ARC4RNG, Random } from "random";
import { Context, NarrowedContext } from "telegraf";

abstract class BaseCommandClient {
    static random = new Random(new ARC4RNG);

    abstract getReply(args: GetReplyArgs<Update>):void;

    abstract isMatch(commandName: string, commandArgument?: string): boolean;

    getRandomValueFromArray<T>( arr:Array<T> ): T {
        return arr[Math.floor(BaseCommandClient.random.next() * arr.length)];
    }
}

type GetReplyArgs<ContextUpdateType extends Update> = {
    commandName: string,
    members?: Array<string>,
    commandArgument?: string,
    ctx?: NarrowedContext<Context<Update>, ContextUpdateType>,
};

export { BaseCommandClient, GetReplyArgs };