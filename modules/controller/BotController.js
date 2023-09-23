const { Telegraf } = require('telegraf');
const config = require("../../config/index");
const TaskService = require("../service/TaskService");
const UserService = require("../service/UserService");
const NodeCache = require("node-cache");
const User = require('../dto/User');
const bot = new Telegraf(config.bot.token);

module.exports = class BotController {


    #taskService = new TaskService();
    #userService = new UserService();
    #nodeCache = new NodeCache();


    async init() {

        bot.start(async (ctx) => {
            console.log(ctx.telegram);
            await this.#userService.userInit(ctx.message.chat.id);
            ctx.reply(`Добро пожаловать!
            Task4me bot - это ваш планировщик задач. Который будет напоминать вам о всех важных задачах.
            Более подробно о работе бота описано в /help`);
        });
        bot.help(async (ctx) => {
            ctx.reply(` Task4me - Бот планировщик задач. 
         Напишите вашу задачу по следующей формуле:

         \u2757\ufe0f День недели | Текст | Время \u2757\ufe0f
            
            Например:
             Завтра необходимо купить хлеб в 12:30 

            \ud83d\udce2 Тем самым бот пришлет вам уведомление завтра 
            в 12:30 по вашему времени.
            
            Так же вы можете поставить себе задачу в таком формате:

             ПН напомнить о звонке в 14:15. 

            \ud83d\udce2 Бот пришлет уведомления вам в следующий 
            понедельник. 

            Вы можкик поставить задачу и на определенную дату.
             Если вы напишете:

              01.01.2023 С Новым годом!!! Уху Ура! 0:01 

            \ud83d\udce2 Наш бот пришлет вам поздравление в 1 минуту 
            нового года.


           На текущий момент уведомления поступают только по одному часовому поясу (МСК +3), в ближайшее время добавим возможность выбора всех часовых поясов. `);
        });

        bot.command('timezone', async (ctx) => {
            ctx.reply("Введите таймзону, например, 6 или -8");
            this.#nodeCache.set(ctx.message.chat.id, "Timezone", 600);

        });

        bot.on('text', async (ctx) => {
            if (this.#nodeCache.get(ctx.message.chat.id)) {
                this.#nodeCache.del(ctx.message.chat.id);
                let response = await this.#taskService.parseTimezone(ctx.message.text);
                if (typeof response === 'number') {
                    const user = new User();
                    user.chatId = ctx.message.chat.id;
                    user.timezone = response;
                    this.#userService.setTz(user);
                    ctx.reply("Установлена таймзона: " + response);
                } else {
                    ctx.reply("Некорректный формат");
                }
            } else {
                let user = await this.#userService.getOne(ctx.message.chat.id);
                if (!user) {
                    user = await this.#userService.userInit(ctx.message.chat.id);
                }
                let response = await this.#taskService.parseAddTask(ctx.message, user.timezone);
                if (response) {
                    ctx.reply(response);
                }
            }

        });

        bot.on('callback_query', async (query) => {
            const cb = JSON.parse(query.update.callback_query.data);
            console.log(cb);

            const delay30min = this.#makeDelayCallback(cb, 30);
            const delay1h = this.#makeDelayCallback(cb, 60);
            const delay3h = this.#makeDelayCallback(cb, 180);
            const delay1d = this.#makeDelayCallback(cb, 1440);

            if (cb["action"] === "delay") {
                query.editMessageReplyMarkup({
                    inline_keyboard: [
                        [
                            { text: "30 м", callback_data: delay30min },
                            { text: "1 ч", callback_data: delay1h },
                            { text: "3 ч", callback_data: delay3h },
                            { text: "1 д", callback_data: delay1d }
                        ]
                    ]
                });
            }
            else {
                const response = await this.#taskService.processNotificationCallback(cb);
                if (response) {
                    await query.editMessageReplyMarkup(query.update, {});
                    await query.editMessageText(query.update.callback_query.message.text + "\n" + response);
                }
            }

        });

        bot.action('quit', ctx => bot.stop());

        bot.launch();

        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    }

    async sendTaskNotification(task) {
        const completeBtn = { text: "Завершить", callback_data: `{"action": "complete", "tId": ${task.id}, "сId": ${task.ownerChatId}}` };
        const delayBtn = { text: "Отложить", callback_data: `{"action": "delay", "tId": ${task.id}, "cId": ${task.ownerChatId}}` };
        const cancelBtn = { text: "Отменить", callback_data: `{"action": "cancel", "tId": ${task.id}, "cId": ${task.ownerChatId}}` };

        let kbBtns = [completeBtn, delayBtn];

        if (task.period > 0) {
            kbBtns.push(cancelBtn);
        }

        try {
            const msg = await bot.telegram.sendMessage(task.ownerChatId, task.name, {
                reply_markup: {
                    inline_keyboard: [kbBtns]
                }
            });
            return msg;
        } catch (e) {
            console.log(e, task);
        }
    }

    async sendAnyMessage(chatId, message) {
        try {
            await bot.telegram.sendMessage(chatId, message);
        } catch (e) {
            console.log(e, chatId, message);
        }
    }


    async deleteMessage(chatId, messageId) {
        try {
            await bot.telegram.deleteMessage(chatId, messageId);
        } catch (e) {
            console.log(e, chatId, messageId);
        }
    }

    #makeDelayCallback(cb, delayTime) {
        return JSON.stringify({
            "action": "delayDetail",
            "tId": cb.tId,
            "cId": cb.cId,
            "t": delayTime
        });
    }
}