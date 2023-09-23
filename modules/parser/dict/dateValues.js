const DateUtil = require("../../utils/DateUtil");
const dateUtil = new DateUtil();

module.exports.get = () => {
        return {
                "сегодня": dateUtil.getToday(),
                "завтра": dateUtil.getTomorrow(),
                "послезавтра": dateUtil.getDayAfterTomorrow(),
                "понедельник": dateUtil.getNextMonday(),
                "вторник": dateUtil.getNextTuesday(),
                "среду": dateUtil.getNextWednesday(),
                "четверг": dateUtil.getNextThursday(),
                "пятницу": dateUtil.getNextFriday(),
                "субботу": dateUtil.getNextSaturday(),
                "воскресенье": dateUtil.getNextSunday(),
                "пн": dateUtil.getNextMonday(),
                "вт": dateUtil.getNextTuesday(),
                "ср": dateUtil.getNextWednesday(),
                "чт": dateUtil.getNextThursday(),
                "пт": dateUtil.getNextFriday(),
                "сб": dateUtil.getNextSaturday(),
                "вс": dateUtil.getNextSunday(),
                "каждый день": {
                        "date": dateUtil.getToday(),
                        "period": 1
                },
                "ежедневно": {
                        "date": dateUtil.getToday(),
                        "period": 1
                },
                "каждый понедельник": {
                        "date": dateUtil.getNextMonday(),
                        "period": 7
                },
                "каждый вторник": {
                        "date": dateUtil.getNextTuesday(),
                        "period": 7
                },
                "каждую среду": {
                        "date": dateUtil.getNextWednesday(),
                        "period": 7
                },
                "каждый четверг": {
                        "date": dateUtil.getNextThursday(),
                        "period": 7
                },
                "каждую пятницу": {
                        "date": dateUtil.getNextFriday(),
                        "period": 7
                },
                "каждую субботу": {
                        "date": dateUtil.getNextSaturday(),
                        "period": 7
                },
                "каждое воскресенье": {
                        "date": dateUtil.getNextSunday(),
                        "period": 7
                },
                "каждый пн": {
                        "date": dateUtil.getNextMonday(),
                        "period": 7
                },
                "каждый вт": {
                        "date": dateUtil.getNextTuesday(),
                        "period": 7
                },
                "каждую ср": {
                        "date": dateUtil.getNextWednesday(),
                        "period": 7
                },
                "каждый чт": {
                        "date": dateUtil.getNextThursday(),
                        "period": 7
                },
                "каждую пт": {
                        "date": dateUtil.getNextFriday(),
                        "period": 7
                },
                "каждую сб": {
                        "date": dateUtil.getNextSaturday(),
                        "period": 7
                },
                "каждое вс": {
                        "date": dateUtil.getNextSunday(),
                        "period": 7
                },
        }
};