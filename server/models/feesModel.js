const mongoose = require('mongoose');
const feesSchema = new mongoose.Schema({
  studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Student'
  },
  email:{
    type:String,
    required:true
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
  }
})
const FeesModel = mongoose.model('Fees', feesSchema);
module.exports = FeesModel;