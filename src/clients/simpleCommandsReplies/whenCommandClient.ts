import { GetReplyArgs } from "../baseCommandClient.js";
import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";


const preludes = ['Я считаю, это произойдет', 'Даже ежику понятно, что это произойдет', 'Ну я выбираю - это произойдет', 'Единственный верный вариант - это произойдет', 'Без базара - это произойдет'];
class WhenCommandClient extends BaseSimpleCommandClient {
    triggerRegExp = /когда|в какой момент/i;
    preludes = preludes;

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    private randomDate(start: Date, end: Date) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    getReply(args: GetReplyArgs) {
        const date = this.randomDate(new Date(Date.now()), new Date(Date.parse('01.01.2032')));
        args.ctx?.reply(`${this.getRandomPrelude()} ${date.toLocaleDateString('ru-RU')}`);
    }
}





export { WhenCommandClient };