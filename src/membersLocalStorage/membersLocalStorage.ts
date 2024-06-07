import { LocalStorage } from "node-localstorage";

class MembersLocalStorage {
    collectedMembersLocalStorageKey = 'members';
    localStorage = new LocalStorage('../scratch');
    collectedMembers: Array<string>;

    constructor() {
        this.collectedMembers = this.getLocalCollectedMembers();
    }

    addMember(member:string) {
        if (member && !this.collectedMembers.includes(member)) {
            // Костыль сбор всех участников тк в api бота мы не можем получить список участников
            this.collectedMembers.push(member);
            this.localStorage.setItem(this.collectedMembersLocalStorageKey, JSON.stringify(this.collectedMembers));
            console.log(this.collectedMembers);
        }
    }


    clearCollectedMembers() {
        this.localStorage.removeItem(this.collectedMembersLocalStorageKey);
        this.collectedMembers = [];
    }

    private getLocalCollectedMembers(): Array<string>{
        var savedMembers = this.localStorage.getItem(this.collectedMembersLocalStorageKey);
        if (savedMembers) {
            console.log('Got members from local');
            return JSON.parse(savedMembers);
        }
        return new Array<string>;
    }
}

export { MembersLocalStorage  };