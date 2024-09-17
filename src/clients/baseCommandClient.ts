import { Update } from "@telegraf/types";
import { Context, NarrowedContext } from "telegraf";

abstract class BaseCommandClient {

    abstract getReply(args: GetReplyArgs):void;

    abstract isMatch(commandName: string, commandArgument?: string): boolean;

    getRandomValueFromArray( arr:Array<string> ): string {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

type GetReplyArgs<> = {
    commandName: string,
    members?: Array<string>,
    commandArgument?: string,
    ctx?: NarrowedContext<Context<Update>, Update.MessageUpdate<any>>,
};

export { BaseCommandClient, GetReplyArgs };