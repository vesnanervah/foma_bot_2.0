import { GetReplyArgs } from "../baseCommandClient.js";
import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";

const preludes = [
    'Я думаю что это',
    'По моему мнению это',
    'Однозначно, это',
    'Я считаю, это',
    'Конечно же это',
    'Все знают, что это',
    'Единственный верный вариант - это',
    'Без базара, это',
    'Ну я выбираю', 
    'Тут стопудово: это',
    'Олег Евгеньевич официально выбирает вариант:'
];

class WhoCommandClient extends BaseSimpleCommandClient {
    preludes = preludes;
    triggerRegExp = /[а-я]?\s?кто|кому|кого/i;

    getReply(args: GetReplyArgs) {
        if(!args.commandArgument || args.commandArgument.length == 0) {
            args.ctx?.reply('Ты!');
            return;
        }
        if ((args.members?.length ?? 0) < 3) {
            args.ctx?.reply('Я знаю еще слишком мало юзеров...Давайте знакомиться!');
            return;
        }
        const member = args.members![Math.floor(Math.random() * args.members!.length)];
        args.ctx?.reply(`${this.getRandomPrelude()} ${member}`);
    }
}


export { WhoCommandClient };