import {Model ,Sequelize} from "../Database/sequelize.js"
import { UserMeta } from "./UserMeta..js"


export const User = Model.define('users',{
   id:{
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
   },
   user_unique_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
   },
   name:{
      type:Sequelize.STRING
   },
   email:{
      type:Sequelize.STRING
   },
   email_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
   },
   mobile:{
      type:Sequelize.STRING
   },
   alternate_mobile:{
      type:Sequelize.STRING
   },
   mobile_verified_at: {
      type: Sequelize.DATE,
      allowNull: true
   },
   password:{
      type:Sequelize.STRING
   },
   role:{
      type:Sequelize.STRING
   },   
  
 
},{
     underscored:true,
     createdAt:'created_at',
     updatedAt:'updated_at'   
})

await User.sync()

User.hasOne(UserMeta,{
   as:"meta",
   foreignKey: 'user_id'

})

UserMeta.belongsTo(User)