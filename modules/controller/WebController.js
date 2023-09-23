const express = require('express');
const session = require('express-session');
const UserService = require("../service/UserService");
const userService = new UserService();


const app = express()

module.exports = class WebController {

    async init() {
        // var app = express();

        app.set('view engine', 'ejs');


        app.use(session({
            secret: 'task for me',
            resave: false,
            saveUninitialized: true
        }));
        
        // middleware to test if authenticated
        function isAuthenticated(req, res, next) {
            if (req.session.user) next();
            else next('route');
        }

        app.get('/', isAuthenticated, async function (req, res) {
            let usersCount = await userService.countAll();
            res.render("index", {
                title: "Панель администратора",
                usersCount: usersCount
            });
        })

        app.get('/', function (req, res) {
            res.render("login", {
                title: "Авторизация"
            });
        })

        app.post('/', express.urlencoded({ extended: false }), async function (req, res) {
            console.log(req.body);
            let users;
            let usersCount = await userService.countAll();
            
            if (typeof req.body.action != 'undefined' && req.body.action === "created-users") {
                users = await userService.getAllByCreationPeriod(req.body.date_time);
            } else if (typeof req.body.action != 'undefined' && req.body.action === "active-users") {
                users = await userService.getActiveByPeriod(req.body.date_time);
            }
            res.render("index", {
                title: "Панель администратора",
                usersCount: usersCount,
                users: users
            })
        })

        app.post('/login', express.urlencoded({ extended: false }), function (req, res) {

            if (req.body.user === "admin" && req.body.pass === "2qazxSw34edCvfR5") {
                req.session.regenerate(function (err) {
                    if (err) next(err)
                    req.session.user = req.body.user

                })
            }

            req.session.save(function (err) {
                if (err) return next(err)
                res.redirect('/')
            })

        })

        app.listen(3000)
    }




}