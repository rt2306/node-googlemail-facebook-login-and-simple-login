import { Model , Sequelize } from "../Database/sequelize.js"; 

export const UserMeta  = Model.define('user_meta', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    user_id:Sequelize.STRING, 
    is_email_authentication:{
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment:'0 = OFF, 1 = ON'
    },
    is_mobile_authentication:{
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment:'0 = OFF, 1 = ON'
    },
    is_google_authentication:{
        type: Sequelize.TINYINT,
        defaultValue: 0,
        comment:'0 = OFF, 1 = ON'
    }, 
    gauth_secret: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    r_key:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    expired_at: Sequelize.DATE
    
},{
    underscored: true,
});

await UserMeta.sync();
