const { Sequelize, Op } = require('sequelize');
const UserDto = require('../dto/User');
const TaskDto = require('../dto/Task');
const userDto = new UserDto();
const taskDto = new TaskDto();
const config = require("../../config/index");

module.exports = class UserRepository {

    async findOrCreateUser(chatId) {
        const sequelize = this.#initConn()
        const User = sequelize.define('User', userDto, {});
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const [user, created] = await User.findOrCreate({
                where: { chatId: chatId },
                defaults: {
                    chatId: chatId
                }
            });
            console.log("Created " + created);
            await sequelize.close()
            return user;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    async findUser(chatId) {
        const sequelize = this.#initConn()
        const User = sequelize.define('User', userDto, {});
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const user = await User.findOne({
                where: { chatId: chatId }
            });
            await sequelize.close()
            return user;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    async findByCreationTime(dateTimeFrom, dateTimeTo) {
        const sequelize = this.#initConn()
        const User = sequelize.define('User', userDto, {});
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const users = await User.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [dateTimeFrom, dateTimeTo]
                    }
                }
            });
            await sequelize.close()
            return users;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    async findByTaskCreationTime(dateTimeFrom, dateTimeTo) {
        const sequelize = this.#initConn()
        const User = sequelize.define('User', userDto, {
            tableName: 'Users'});
        const Task = sequelize.define('Task', taskDto, {});
        User.hasMany(Task, {
            foreignKey: "ownerChatId",
            sourceKey: "chatId"
        });
        
        Task.belongsTo(User);
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const users = await User.findAll({
                include: {
                    model: Task,
                    where: {
                        createdAt: {
                            [Op.between]: [dateTimeFrom, dateTimeTo]
                        }
                    }
                }
            });
            await sequelize.close();
            return users;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    async countAll() {
        const sequelize = this.#initConn()
        const User = sequelize.define('User', userDto, {});
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const users = await User.findAll();
            await sequelize.close();
            return users.length;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    
    async setTz(userNew) {
        const sequelize = this.#initConn();
        const User = sequelize.define('User', userDto, {});
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const models = await sequelize.models

            const user = await User.findOne({
                where: { chatId: userNew.chatId }
            });
            user.timezone = userNew.timezone
            await user.save()
            await sequelize.close()
            return user;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    #initConn() {
        const sequelize = new Sequelize(config.db.dbname, config.db.user, config.db.pwd, {
            logging: console.log,
            host: config.db.host,
            dialect: config.db.dialect
        });
        return sequelize
    }
}

