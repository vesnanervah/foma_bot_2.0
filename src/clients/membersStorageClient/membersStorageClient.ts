import { LocalStorage } from "node-localstorage";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";
import { Update } from "@telegraf/types";

class MembersStorageClient extends BaseCommandClient{
    triggerRegExp = /^очистить мемберов$/i;
    collectedMembersLocalStorageKey = 'members';
    collectedMembers: Array<string>;
    private localStorage: LocalStorage;

    constructor(localStorage: LocalStorage) {
        super();
        this.localStorage = localStorage;
        this.collectedMembers = this.getLocalCollectedMembers();
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    addMember(member:string) {
        if (member && !this.collectedMembers.includes(member)) {
            // Костыль сбор всех участников тк в api бота мы не можем получить список участников
            this.collectedMembers.push(member);
            this.localStorage.setItem(this.collectedMembersLocalStorageKey, JSON.stringify(this.collectedMembers));
        }
    }

    getReply(args: GetReplyArgs<Update>) {
        this.clearCollectedMembers();
        args.ctx?.reply('Мемберы почищены...');
    }

    private clearCollectedMembers() {
        this.localStorage.removeItem(this.collectedMembersLocalStorageKey);
        this.collectedMembers = [];
    }

    private getLocalCollectedMembers(): Array<string>{
        const savedMembers = this.localStorage.getItem(this.collectedMembersLocalStorageKey);
        if (savedMembers) {
            console.log('Got members from local');
            return JSON.parse(savedMembers);
        }
        return new Array<string>;
    }
}

export { MembersStorageClient };