import { Update } from "@telegraf/types";
import { ARC4RNG, Random } from "random";
import { Context, NarrowedContext } from "telegraf";

abstract class BaseCommandClient {
    static random = new Random(new ARC4RNG);

    abstract getReply(args: GetReplyArgs):void;

    abstract isMatch(commandName: string, commandArgument?: string): boolean;

    getRandomValueFromArray<T>( arr:Array<T> ): T {
        return arr[Math.floor(BaseCommandClient.random.next() * arr.length)];
    }
}

type GetReplyArgs<> = {
    commandName: string,
    members?: Array<string>,
    commandArgument?: string,
    ctx?: NarrowedContext<Context<Update>, Update.MessageUpdate<any>>,
};

export { BaseCommandClient, GetReplyArgs };