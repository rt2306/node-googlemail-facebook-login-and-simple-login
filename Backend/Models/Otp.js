import { Model, Sequelize } from "../Database/sequelize.js";

export const Otp = Model.define('Otp', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    user_id: Sequelize.STRING,
    otp: {
        type: Sequelize.STRING,
        get() {
            const rawValue = this.getDataValue('otp');
            if (rawValue) {
                return JSON.parse(rawValue);
            }
            return {};
        },
        set(value) {

            let v = value ? JSON.stringify(value) : {};
            this.setDataValue('otp', v);
        }
    },
    type: Sequelize.STRING,
    value: {
        type: Sequelize.STRING,
        allowNull: true
    },
   
    expired_at: Sequelize.DATE
}, {
    underscored: true,
});

await Otp.sync();