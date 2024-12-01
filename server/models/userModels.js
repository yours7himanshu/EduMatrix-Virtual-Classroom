const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
      type:String,
      enum:['admin','teacher','registrar','director'],
      default:'admin'
    }
})

const User = mongoose.model("User",userSchema);
module.exports=User;