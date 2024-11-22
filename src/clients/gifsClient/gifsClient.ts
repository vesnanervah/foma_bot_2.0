import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";

class GifsClient extends BaseCommandClient {
    private triggerRegExp = /^гиф(ка)?$/i;
    private isMonday = /^понедельник$/i;
    private isTuesday = /^вторник$/i;
    private isWednesday = /^среда$/i;
    private isThursday = /^четверг$/i;
    private isFriday = /^пятнинца$/i;
    private isSaturday = /^суббота$/i;
    private isSunday = /^воскресение$/i;
    private weekdaysGifBindings = {

    }; 

    getReply(args: GetReplyArgs): void {
        console.log(args);
    }


    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }
}

export { GifsClient };
