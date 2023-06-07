import { Model , Sequelize } from "../Database/sequelize.js";

export const Token = Model.define('oauth_access_tokens', {
    id: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    user_id: Sequelize.BIGINT(20).UNSIGNED ,
    client_id: Sequelize.BIGINT(20).UNSIGNED ,
    name: Sequelize.STRING,
    scopes:Sequelize.TEXT,
    revoked: {
        type:Sequelize.BOOLEAN,
        defaultValue:"0"
    },
    expires_at: Sequelize.DATE
},{
    underscored: true,
});

await Token.sync();