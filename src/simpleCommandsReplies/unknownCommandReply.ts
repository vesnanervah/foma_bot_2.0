function unknownCommandReply():string {
    return replies[Math.floor(replies.length * Math.random())];
}

const replies = [
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

]

export { unknownCommandReply };
