const { Sequelize, DataTypes, Model } = require('sequelize');
const TaskDto = require('../dto/Task')
const { Op } = require('sequelize');
const config = require("../../config/index");


module.exports = class TaskRepository {
    #taskDto = new TaskDto();

    async get(chatId){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models
    
            const tasks = await Task.findAll({
                where: { ownerChatId: chatId }
            });
            await sequelize.close()
            return tasks;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }

    async getByTaskId(taskId){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models
    
            const task = await Task.findOne({
                where: { id: taskId }
            });
            await sequelize.close()
            return task;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e)
        }
    }
    
    async getByDateTime(dt){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate();
            console.log('Соединение с БД было успешно установлено');
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models;
    
            const tasks = await Task.findAll({
                where: { 
                    [Op.or]: [
                        { dateTime: {
                            [Op.lte]: dt
                        }},
                        { next: {
                            [Op.lte]: dt
                        }}
                    ],
                    
                    isCompleted: 0
                 }
            });
            await sequelize.close();
            return tasks;
        } catch (e) {
            console.log('Невозможно выполнить подключение к БД: ', e);
        }
    }
    
    async setCompleted(taskId){
        const sequelize = this.#initConn();
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate();
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models;
            await Task.update({isCompleted: true}, {
                where: {
                    id: {
                        [Op.or]: taskId
                    }
                }
            });
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
        }
    }

    async setNext(task){
        const sequelize = this.#initConn();
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate();
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models;
            await Task.update({next: task.next}, {
                where: {
                    id: {
                        [Op.or]: [task.id]
                    }
                }
            });
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
        }
    }
    
    async setDelayed(taskId, newDateTime){
        const sequelize = this.#initConn();
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate();
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models;
            await Task.update({dateTime: newDateTime}, {
                where: {
                    id: {
                        [Op.or]: taskId
                    }
                }
            });
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
        }
    }
    
    async add(task){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            await Task.sync();
            const models = await sequelize.models
            console.log(task)
            await Task.create(task);
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
            return false;
        }
    }
    
    async delete(task){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            const models = await sequelize.models
            console.log(task)
            await Task.destroy({
                where: { id: task.id }
            })
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
        }
    }
    
    async deleteCompleted(){
        const sequelize = this.#initConn()
        try {
            await sequelize.sync({ alter: true });
            await sequelize.authenticate()
            console.log('Соединение с БД было успешно установлено')
            const Task = sequelize.define('Task', this.#taskDto, {});
            const models = await sequelize.models
            await Task.destroy({
                where: { "isCompleted": 1 }
            })
        } catch (e) {
            console.log('Невозможно выполнить запрос: ', e)
        }
    }
    
    #initConn() {
        const sequelize = new Sequelize(config.db.dbname, config.db.user, config.db.pwd, {
            logging: console.log,
            host: config.db.host,
            dialect: config.db.dialect,
            define: {
                charset   : 'utf8mb4',
                collation : 'utf8mb4_unicode_ci'
        }
        });
        return sequelize
    }


}

// module.exports.get = async(chatId) => {
//     const sequelize = initConn()
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate()
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         await Task.sync();
//         const models = await sequelize.models

//         const tasks = await Task.findAll({
//             where: { ownerChatId: chatId }
//         });
//         await sequelize.close()
//         return tasks;
//     } catch (e) {
//         console.log('Невозможно выполнить подключение к БД: ', e)
//     }
// }

// module.exports.getByDateTime = async(dt) => {
//     const sequelize = initConn()
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate();
//         console.log('Соединение с БД было успешно установлено');
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         await Task.sync();
//         const models = await sequelize.models;

//         const tasks = await Task.findAll({
//             where: { 
//                 dateTime: {
//                     [Op.lte]: dt
//                 },
//                 isDone: 0
//              }
//         });
//         await sequelize.close();
//         return tasks;
//     } catch (e) {
//         console.log('Невозможно выполнить подключение к БД: ', e);
//     }
// }

// module.exports.setCompleted = async(taskId) => {
//     const sequelize = initConn();
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate();
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         await Task.sync();
//         const models = await sequelize.models;
//         await Task.update({isDone: true}, {
//             where: {
//                 id: {
//                     [Op.or]: taskId
//                 }
//             }
//         });
//     } catch (e) {
//         console.log('Невозможно выполнить запрос: ', e)
//     }
// }

// module.exports.setDelayed = async(taskId, newDateTime) => {
//     const sequelize = initConn();
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate();
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         await Task.sync();
//         const models = await sequelize.models;
//         const delayedTime = 
//         await Task.update({dateTime: newDateTime}, {
//             where: {
//                 id: {
//                     [Op.or]: taskId
//                 }
//             }
//         });
//     } catch (e) {
//         console.log('Невозможно выполнить запрос: ', e)
//     }
// }

// module.exports.add = async(task) => {
//     const sequelize = initConn()
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate()
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         await Task.sync();
//         const models = await sequelize.models
//         console.log(task)
//         await Task.create(task);
//     } catch (e) {
//         console.log('Невозможно выполнить запрос: ', e)
//         return false;
//     }
// }

// module.exports.delete = async(task) => {
//     const sequelize = initConn()
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate()
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         const models = await sequelize.models
//         console.log(task)
//         await Task.destroy({
//             where: { id: task.id }
//         })
//     } catch (e) {
//         console.log('Невозможно выполнить запрос: ', e)
//     }
// }

// module.exports.deleteCompleted = async() => {
//     const sequelize = initConn()
//     try {
//         await sequelize.sync({ alter: true });
//         await sequelize.authenticate()
//         console.log('Соединение с БД было успешно установлено')
//         const Task = sequelize.define('Task', this.#taskDto, {});
//         const models = await sequelize.models
//         await Task.destroy({
//             where: { "isDone": 1 }
//         })
//     } catch (e) {
//         console.log('Невозможно выполнить запрос: ', e)
//     }
// }

// function initConn() {
//     const sequelize = new Sequelize(config.db.dbname, config.db.user, config.db.pwd, {
//         logging: console.log,
//         host: config.db.host,
//         dialect: config.db.dialect,
//         define: {
//             charset   : 'utf8mb4',
//             collation : 'utf8mb4_unicode_ci'
//     }
//     });
//     return sequelize
// }