const mongoose = require('mongoose');
const feesSchema = new mongoose.Schema({
  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Student',
    index: true,
  },
  email:{
    type:String,
    required:true,
    index: true,
  },
  rollno:{
    type:String,
    required:true
  },
  amount:{
    type:Number,
    required:true
  },
  status:{
    type:String,
    enum:['paid','unpaid'],
    default:'unpaid'
  },year:{
    type:Number,
    required:true
  },
  stripeSessionId:{
    type:String,
    default:null,
    index: true,
  }
})
const FeesModel = mongoose.model('Fees', feesSchema);
module.exports = FeesModel;