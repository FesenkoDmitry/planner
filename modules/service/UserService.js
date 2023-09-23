const UserRepository = require("../repository/UserRepository");

module.exports = class UserService {

    #userRepository = new UserRepository();

    async userInit(chatId) {
        try {
            console.log("--Попытка инициализировать пользователя " + chatId);
            let user = await this.#userRepository.findOrCreateUser(chatId);
            if (typeof user.timezone != "undefined") {
                return user;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    async getOne(chatId) {
        try {
            console.log("--Поиск пользователя " + chatId);
            let user = await this.#userRepository.findUser(chatId);
            if (typeof user.timezone != "undefined") {
                return user;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    async getAllByCreationPeriod(dateTime) {
        try {
            console.log("--Поиск пользователей по дате создания " + dateTime);
            const parsedDateTime = this.#parseDateTime(dateTime);
            const users = await this.#userRepository.findByCreationTime(parsedDateTime.from, parsedDateTime.to);
            console.log(users);
            return users;
        } catch (e) {
            console.log(e.message);
        }
    }

    async getActiveByPeriod(dateTime) {
        try {
            console.log("--Поиск пользователей по дате создания задачи " + dateTime);
            const parsedDateTime = this.#parseDateTime(dateTime);
            const users = await this.#userRepository.findByTaskCreationTime(parsedDateTime.from, parsedDateTime.to);
            console.log(users);
            return users;
        } catch (e) {
            console.log(e.message);
        }
    }

    async setTz(user) {
        try {
            console.log("--Попытка установить таймзону для" + user.chatId);
            const isSuccess = await this.#userRepository.setTz(user);
            if (isSuccess) {
                return "Успешно: изменение таймзоны!";
            } else {
                return "Неуспешно: изменение таймзоны!";
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    async countAll(){
        try {
            console.log("--Попытка посчитать пользователей");
            return await this.#userRepository.countAll();
        } catch (e) {
            console.log(e.message);
        }
    }

    #parseDateTime(dateTime){
        if (/^\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}$/.test(dateTime)){
            let parsedDateTime = dateTime.split("-");
            let dateTimeFrom = parsedDateTime[0] + "-" + parsedDateTime[1] + "-" + parsedDateTime[2] + " 00:00";
            let dateTimeTo = parsedDateTime[3] + "-" + parsedDateTime[4] + "-" + parsedDateTime[5] + " 00:00";
            return {
                from: dateTimeFrom,
                to: dateTimeTo
            }
        } else {
            return false;
        }
    }
}
