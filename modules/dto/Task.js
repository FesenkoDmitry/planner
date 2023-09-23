const { DataTypes } = require('sequelize');

module.exports = class Task {
    constructor() {
        this.ownerChatId = {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'chatId'
            }
        },
            this.name = {
                type: DataTypes.STRING,
                allowNull: false
            },
            this.dateTime = {
                type: DataTypes.DATE,
                allowNull: false
            },
            this.isCompleted = {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaulValue: 0
            },
            this.period = {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaulValue: 0
            },
            this.next = {
                type: DataTypes.DATE,
                allowNull: false
            }

    }
}