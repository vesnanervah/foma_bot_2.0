import { GetReplyArgs } from "../baseCommandClient.js";
import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";

class UnknownCommandClient extends BaseSimpleCommandClient {
    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        throw new Error("Method not implemented.");
    }

    triggerRegExp?: RegExp | undefined;
    
    protected preludes: string[] = [
        'Меня твоя мама просила спросить: ты сколько раз в день зубы чистишь?',
        'Хм..я что-то туплю наверно...',
        'А ты умеешь делать бумажные самолетики?',
        'Эх... это трудно понять, особенно жирафу',
        'А сколько тебе лет?',
        'Страшно подумать, что звезды - это такие же солнышки, как у нас...',
        'Ты любишь рисовать?',
        'Классный цвет глаз у тебя! признавайся, у тебя корни не только русские, да?',
        'Если я стану вампиром, но не буду пить твою кровь. Ты обидишься?',
        'Говорят, у меня хороший нюх - приключения на свою задницу я нахожу мгновенно',
        'Возникает подозрение, что ты шпион с Альдебарана',
        'Я посоветуюсь со своей головой и скажу тебе ответ попозже...',
        'А ты в курсе, что мой хозяин потом читаеет всю ту ахинею, что ты тут пишешь, и угорает?',
        'А ты умеешь пить?',
        'А тебе нравится смотреть на звезды?',
        'Попробуй сказать это помедленнее, и погромче',
        'В детстве человека паука часто наказывали и ставили в правй верхний угол'
    ];

    getReply(args: GetReplyArgs) {
        args.ctx?.reply(super.getRandomPrelude());
    }
    
}


export { UnknownCommandClient };
