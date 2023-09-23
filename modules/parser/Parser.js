const Task = require("../dto/Task");
const dateValues = require("./dict/dateValues");
const DateUtil = require("../utils/DateUtil");

module.exports = class Parser {
    #dateUtil = new DateUtil();

    constructor() {
    }

    async exec(query, chatId, type = "task") {

        if (type === "timezone") {
            if (this.#isValidTimezone(query)) {
                return this.#processTimeZone(query);
            } else {
                return false;
            }
        } else {
            if (this.#isNeedProcessing(query, chatId)) {
                const originalQuery = this.#trimGroupMsg(query);
                const splitQuery = originalQuery.toLowerCase().trim().split(' ');
                console.log("--Попытка обработать запрос: " + query);
                const task = this.#processTaskQuery(originalQuery, splitQuery);
                return task;
            } else {
                return false;
            }
        }

    }

    #isValidTimezone(query) {
        return /^(|-)(|\d)\d*$/.test(query);
    }

    #processTimeZone(query) {
        let parsedZone = parseInt(query);
        if (parsedZone >= -12 && parsedZone <= 13) {
            return parsedZone;
        } else {
            return false;
        }
    }

    #isGroupChat(chatId) {
        if (chatId < 0) {
            return true
        } else {
            return false
        }
    }

    #isNeedCheckGroupMsg(query) {
        if (/^\+.*$/.test(query)) {
            return true
        } else {
            return false
        }
    }

    #isNeedProcessing(query, chatId) {
        if (this.#isGroupChat(chatId) && this.#isNeedCheckGroupMsg(query) || !this.#isGroupChat(chatId)) {
            return true
        } else {
            return false
        }
    }

    #trimGroupMsg(query) {
        let newQuery = query.replace(/\+/, "");
        console.log(newQuery);
        return newQuery;
    }

    #processTaskQuery(originalQuery, splitQuery) {
        let date;
        let time;
        let dateTime;

        const task = new Task();

        const parsedDate = this.#parseDate(splitQuery);

        if (typeof parsedDate.date !== "undefined") {
            date = parsedDate.date;
            task.period = parsedDate.period;
        } else {
            date = parsedDate;
            task.period = 0;
        }

        time = this.#parseTime(splitQuery);

        dateTime = date + ' ' + time;

        task.name = "\ud83d\udce2" + originalQuery;
        task.dateTime = dateTime;
        task.next = dateTime;


        console.log("--Запрос обработан успешно!");
        return task;

    }


    #parseDate(splitQuery) {
        let dates = dateValues.get();
        let cases = Object.keys(dates);
        let date = "";
        let isDateSet = false;

        if (splitQuery[0] === 'в' || splitQuery[0] === 'во') {
            date = splitQuery[1];
        } else if (/^кажд..$/.test(splitQuery[0])) {
            date = splitQuery[0] + " " + splitQuery[1];

        } else {
            date = splitQuery[0];
        }


        cases.forEach(c => {
            if (date === c) {
                date = dates[c];
                isDateSet = true;
            }
        });

        if (isDateSet) {
            return date;
        }

        if (/^\d\d\.\d\d\.\d\d\d\d$/.test(date)) {
            return date.split(".").reverse().join("-");
        }

        if (/^\d\d\d\d-\d\d-\d\d$/.test(date)) {
            return date;
        }

        return dates['сегодня'];
    }



    #parseTime(splitQuery) {
        if (splitQuery[splitQuery.length - 1].length === 1) {
            if (this.#is2DigitTimeFormat(splitQuery[splitQuery.length - 1])) {
                return '0' + splitQuery[splitQuery.length - 1] + ':00';
            } else {
                throw 'Некорректный формат времени';
            }
        }
        else if (this.#is4DigitTimeFormat(splitQuery[splitQuery.length - 1])) {
            return splitQuery[splitQuery.length - 1] + ':00';
        } else {
            throw 'Некорректный формат времени';
        }
    }

    #is2DigitTimeFormat(value) {
        return /^[0-9]$/.test(value);
    }

    #is4DigitTimeFormat(value) {
        return /^(^|[0-2])\d(:[0-5]\d|$)$/.test(value);
    }

}