import { Model , Sequelize } from "../Database/sequelize.js"; 

export const Address  = Model.define('address', {
    id: {
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true
    },
    user_id:Sequelize.STRING, 
    address:{
        type:Sequelize.STRING
     },
     name:{
        type:Sequelize.STRING
     },
     flat_no:{
        type:Sequelize.STRING
     },
     pincode:{
        type:Sequelize.STRING
     },
     city:{
        type:Sequelize.STRING
     },
     state:{
        type:Sequelize.STRING
     }

    
},{
    underscored: true,
});

await Address.sync({alter:true});
