const Cron = require("./modules/cron/Cron");
const BotController = require("./modules/controller/BotController");
const WebController = require("./modules/controller/WebController");

const cron = new Cron();
const botController = new BotController();
const webController = new WebController();

botController.init();
webController.init();
cron.init();