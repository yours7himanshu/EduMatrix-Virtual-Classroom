const mongoose = require('mongoose');

const registrarSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    }
    
})


