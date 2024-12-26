const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  directorName: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  centerCode:{
    type:Number,
    required:true
  },
  
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    enum:['Registrar','Director','Teacher'],
    default:'Director'
  }
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
