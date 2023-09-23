const BotController = require("../controller/BotController");
const cron = require("node-cron");
const TaskService = require("../../modules/service/TaskService");
const NodeCache = require("node-cache");

module.exports = class Cron{

    #botController = new BotController();
    #taskService = new TaskService();

    #nodeCache = new NodeCache();

    init(){
        this.#checkUncompleted();
        // this.#checkCompletedToDelete();
    }

    #checkUncompleted() {
        cron.schedule('* * * * *', async() => {
            const tasks = await this.#taskService.processExpiredTasksByDateTime();
            tasks.toNotify.forEach(async (task) => {
                await this.#processTask(task);
            })

            console.log(tasks.toDelete);
            tasks.toDelete.forEach(async (taskId) => {
                
                const msg = this.#nodeCache.take(taskId);
                await this.#botController.deleteMessage(msg.chat.id, msg.message_id);
            })
            
            }
    
          );
    }
    
    #checkCompletedToDelete() {
        cron.schedule('* 1 * * *', async() => {
            this.#taskService.deleteCompletedTasks();
          });
    }

    async #processTask(task){
        const msg = await this.#botController.sendTaskNotification(task);
        this.#nodeCache.set(task.id, msg, 600);
    }

}