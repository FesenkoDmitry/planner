const { DataTypes } = require('sequelize');

module.exports = class User {
    constructor() {
        this.chatId = {
            type: DataTypes.BIGINT,
            allowNull: false
        }
        this.timezone = {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
        }
    }
}