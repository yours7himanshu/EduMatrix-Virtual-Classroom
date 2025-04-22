const mongoose = require("mongoose");

const registrarFeesSchema = new mongoose.Schema({
   RollNumber:{
    type:Number,
    required:true
   },
   Name:{
    type:String,
    required:true
   },
   Fees:{
    type:Number,
    required:true
   },
   Fees_status:{
    type:String,
    required:true
   },
   Branch:{
    type:String,
    required:true
   }
})
const registrarFeesModel = mongoose.model("registrarFees", registrarFeesSchema);

module.exports=registrarFeesModel;