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

    whoCommandReply(commandArgument: string | undefined, members: Array<string>): string {
        if(!commandArgument || commandArgument.length == 0) {
            return 'Ты!';
        }
        if (members.length < 3) {
            return 'Я знаю еще слишком мало юзеров...Давайте знакомиться!';
        }
        const member = members[Math.floor(Math.random() * members.length)];
        return `${this.getRandomPrelude()} ${member}`;
    }
}


export { WhoCommandClient };