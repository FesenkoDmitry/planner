const moment = require("moment");

module.exports = class DateUtil{

    #MON = 1;
    #TUE = 2;
    #WED = 3;
    #TH = 4;
    #FRI = 5;
    #SAT = 6;
    #SUN = 7;
    #SERVER_UTC = 3;



    constructor () {
    }

    getToday(){
        return moment().format("YYYY-MM-DD");
    }

    getTomorrow(){
        return moment().add(1, "day").format("YYYY-MM-DD");
    }

    getDayAfterTomorrow(){
        return moment().add(2, 'days').format("YYYY-MM-DD");
    }

    #checkDay(day){
        if (moment().day() >= day){
            return day + 7;
        } else {
            return day;
        }
    }

    getNextMonday(){
        return moment().day(this.#checkDay(this.#MON)).format("YYYY-MM-DD");
    }

    getNextTuesday(){
        return moment().day(this.#checkDay(this.#TUE)).format("YYYY-MM-DD");
    }

    getNextWednesday(){
        return moment().day(this.#checkDay(this.#WED)).format("YYYY-MM-DD");
    }

    getNextThursday(){
        return moment().day(this.#checkDay(this.#TH)).format("YYYY-MM-DD");
    }

    getNextFriday(){
        return moment().day(this.#checkDay(this.#FRI)).format("YYYY-MM-DD");
    }

    getNextSaturday(){
        return moment().day(this.#checkDay(this.#SAT)).format("YYYY-MM-DD");
    }

    getNextSunday(){
        return moment().day(this.#checkDay(this.#SUN)).format("YYYY-MM-DD");
    }

    getDelayedDateTime(min){
        return moment().add(min, 'minutes').format("YYYY-MM-DD HH:mm");
    }

    getNextTime(dateTime, period){
        return moment(dateTime).add(period, 'day').format("YYYY-MM-DD HH:mm");
    }

    validate(dt){
        const dateTime = moment(dt);
    
        if (dateTime.isBefore(moment())){
            return dateTime.add(1, 'day').format("YYYY-MM-DD HH:mm");
        } else {
            return dateTime.format("YYYY-MM-DD HH:mm");
        }
    }

    isNextBeforeNow(dt){
        const dateTime = moment(dt);
        if (dateTime.isBefore(moment())){
            return true;
        } else {
            return false;
        }
    }

    isSameOrBefore(dt1, dt2){
        return moment(dt1).isSameOrBefore(moment(dt2));
    }

    isSameOrAfter(dt1, dt2){
        return moment(dt1).isSameOrAfter(moment(dt2));
    }

    isSameOrBeforeNow(dt){
        return moment(dt).isSameOrBefore(moment());
    }

    setTimezone(dt, timezone){
        if (timezone> 3) {
            return moment(dt).subtract((timezone - this.#SERVER_UTC), "hours").format("YYYY-MM-DD HH:mm");
        } else if (timezone < 3) {
            return moment(dt).add((this.#SERVER_UTC - timezone), "hours").format("YYYY-MM-DD HH:mm");
        } else {
            return dt;
        }
    }

}