const mongoose = require('mongoose');

const announementSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    description:{
        type:String,
        requred:true
    }
});

const Announcement = mongoose.model("announcement",announementSchema);
module.exports=Announcement;