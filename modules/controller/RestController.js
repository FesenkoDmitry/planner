const service = require('../service/mainService')
const express = require('express')
const app = express()
const jsonParser = express.json()
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
const config = require(appDir + '/config/index.js')
const https = require('https')
const http = require('http')


module.exports.init = () => {
    app.use(express.static(appDir + '/public/'))
    app.get('/', (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", config.serverIp)
        res.sendFile(`${appDir}/public/index.html`);
    });
    app.post('/task/list', jsonParser, async function(req, resp) {
        const chatId = req.body.chatId
        const tasks = await service.getTasks(chatId)
        resp.setHeader("Access-Control-Allow-Origin", config.serverIp)
        resp.setHeader("Content-Type", "application/json")
        resp.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST")
        resp.send(tasks)
    })

    app.post('/task/add', jsonParser, async function(req, resp) {
        const task = req.body.task
        console.log(task)
        const tasks = await service.addTask(task)
        resp.send("Добавлена задача")
    })

    app.post('/task/delete', jsonParser, async function(req, resp) {
        const task = req.body.task
        const tasks = await service.deleteTask(task)
        resp.send("Удалена задача")
    })

    app.post('/user/tz', jsonParser, async function(req, resp) {
        const result = await service.setTz(req.body.user)
        resp.send(result)
    })

    // http.createServer(app).listen(80)
    // https.createServer(app).listen(3000)
    app.listen(3000)
}