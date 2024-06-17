import { Update } from "@telegraf/types";
import { Context, NarrowedContext } from "telegraf";

abstract class BaseCommandClient {
    abstract triggerRegExp?: RegExp;

    abstract getReply(args: GetReplyArgs):void;
}

type GetReplyArgs<> = {
    commandName: string,
    members?: Array<string>,
    commandArgument?: string,
    ctx?: NarrowedContext<Context<Update>, Update.MessageUpdate<any>>,
};

export { BaseCommandClient, GetReplyArgs };