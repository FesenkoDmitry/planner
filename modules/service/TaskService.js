const TaskRepository = require("../repository/TaskRepository");
const DateUtil = require("../utils/DateUtil");
const Parser = require('../parser/Parser');
const NodeCache = require("node-cache");



const DEFAULT_DELAY = 5;
const STD_CACHE_TTL = 600;



module.exports = class TaskService {

    #taskRepository = new TaskRepository();
    #dateUtil = new DateUtil();
    #parser = new Parser();
    #nodeCache = new NodeCache();


    async getTasks(chatId) {
        try {
            console.log("--Попытка получить список задач для пользователя " + chatId);
            const tasks = await this.#taskRepository.get(chatId);
            return tasks;
        } catch (e) {
            console.log(e.message);
        }

    }

    async processExpiredTasksByDateTime() {

        const now = new Date().toUTCString();

        try {
            console.log("--Попытка получить невыполненные задачи до " + now);

            let tasks = await this.#taskRepository.getByDateTime(now);
            let msgsToDelete = [];
            let tasksToNotify = []
            tasks = tasks.filter(task => {
                if (this.#isNeedProcessing(task)) return true;
            });

            console.log(`--Найдено задач для выполнения: ${tasks.length}`);

            tasks.forEach(async (task) => {
                if (!this.#isMsgCached(task.id)) {
                    tasksToNotify.push(task);
                    this.#nodeCache.set(task.id, task.id, STD_CACHE_TTL);
                    await this.#setNext(task);
                } else {
                    const cachedTaskId = this.#nodeCache.get(task.id);
                    this.#nodeCache.ttl(task.id, STD_CACHE_TTL);
                    msgsToDelete.push(cachedTaskId);
                    tasksToNotify.push(task);
                }
            });
            await this.#setDefaultDelay(tasks);
            return {
                "toDelete": msgsToDelete,
                "toNotify": tasksToNotify
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    #isMsgCached(taskId) {
        if (this.#nodeCache.get(taskId) === undefined) {
            return false;
        } else {
            return true;
        }
    }

    #isNeedProcessing(task) {
        return this.#isNeedProcessingSingleTask(task) || this.#isNeedProcessingRegularTask(task);
    }

    #isNeedProcessingSingleTask(task) {
        return task.period === 0 && this.#dateUtil.isSameOrBeforeNow(task.dateTime);
    }

    #isNeedProcessingRegularTask(task) {
        return task.period > 0 && this.#dateUtil.isSameOrBefore(task.dateTime, task.next);
    }


    async #setNext(task) {
        try {
            if (task.period > 0 && this.#dateUtil.isNextBeforeNow(task.next)) {
                task.next = this.#dateUtil.getNextTime(task.dateTime, task.period);
                await this.#taskRepository.setNext(task);
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    async #setDefaultDelay(taskList) {
        const dateTime = this.#dateUtil.getDelayedDateTime(DEFAULT_DELAY);
        if (taskList.length > 0) {
            try {
                let taskIds = [];
                taskList.forEach(task => {
                    taskIds.push(task.id);
                })
                await this.#taskRepository.setDelayed(taskIds, dateTime);
            } catch (e) {
                console.log(e.message);
            }
        }


    }

    async processNotificationCallback(cb) {

        try {

            let task = await this.#taskRepository.getByTaskId(cb.tId);
            console.log(task);

            if (cb.action === "complete") {
                console.log("--Попытка завершить задачу: ");
                console.log(task.id);
                if (task.period > 0) {
                    await this.#taskRepository.setDelayed([task.id], task.next)
                } else {
                    await this.#taskRepository.setCompleted([task.id]);
                }
                console.log("--Задача завершена");
                return "Завершено";
            }

            else

                if (cb.action === "cancel") {
                    console.log("--Попытка завершить задачу: ");
                    console.log(task.id);
                    await this.#taskRepository.setCompleted([task.id]);
                    console.log("--Регулярная задача завершена");
                    return "Завершено";
                }

                else

                    if (cb.action === "delayDetail") {
                        const dateTime = this.#dateUtil.getDelayedDateTime(cb.t);
                        console.log("--Попытка отложить задачу: ");
                        console.log(cb.tId);
                        await this.#taskRepository.setDelayed([cb.tId], dateTime);
                        console.log("--Выполнение задачи отложено");
                        return `Отложено до ${dateTime}`;
                    }
        } catch (e) {
            console.log(e.message);
        }

    }

    async addTask(task) {
        try {

            console.log("--Попытка добавить задачу ");
            console.log(task);

            await this.#taskRepository.add(task);
        } catch (e) {
            console.log(e.message)
        }
    }

    async parseAddTask(message, timezone) {
        let response = '';
        try {
            let result = false;
            console.log("--Попытка добавить задачу (парсинг) ");

            const task = await this.#parser.exec(message.text, message.chat.id);
            if (task != false) {
                task.ownerChatId = message.chat.id;
                task.isCompleted = 0;
            } else {
                return false;
            }

            const originalDateTime = new String(this.#dateUtil.validate(task.dateTime));

            task.dateTime = this.#dateUtil.validate(task.dateTime);
            task.dateTime = this.#dateUtil.setTimezone(task.dateTime, timezone);
            task.next = task.dateTime;

            result = await this.#taskRepository.add(task);

            if (result !== false) {
                if (task.period > 0) {
                    response = `Регулярная задача успешно добавлена на ${originalDateTime}, период: ${task.period} дней`;
                } else {
                    response = `Задача успешно добавлена на ${originalDateTime}`;
                }
            } else {
                response = 'Упс... Кажется, такой запрос еще не поддерживается. Актуальный формат запроса по команде /help';
            }
        } catch (e) {
            console.log(e);
            response = 'Упс... Кажется, такой запрос еще не поддерживается. Актуальный формат запроса по команде /help';
        }
        return response;
    }

    async parseTimezone(query) {
        const timezone = await this.#parser.exec(query, "", "timezone");
        return timezone;
    }

    async deleteTask(task) {
        try {
            console.log("--Попытка удалить задачу ");
            console.log(task);

            await this.#taskRepository.deleteTask(task);
        } catch (e) {
            console.log(e.message);
        }
    }

    async deleteCompletedTasks() {
        try {
            console.log("--Попытка удалить выполненные задачи");

            await this.#taskRepository.deleteCompletedTasks();
        } catch (e) {
            console.log(e.message);
        }
    }


}
