import Student from "../models/studentModels.js";

 
import FeesModel from "../models/feesModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const payfees = async(req,res)=>{
  const frontend_url = "http://localhost:5174";
  try {
   
    const {studentId,amount,rollno,email,year} = req.body
    const feesObject = new FeesModel({
      studentId,
      amount,
      rollno,
      email,
      year
    })
    await feesObject.save();
    const line_items = [{
      price_data:{
        currency:"inr",
        product_data:{
          name:`Tuition fees`,
          description:"Fees Payment",

        },
        unit_amount:amount*100
      },
      quantity:1
    }]
    line_items.push({
      price_data:{
        currency:"inr",
        product_data:{
          name:"Additional fees",
          description:"Additional fees",
        },
        unit_amount:2000*100

      },
      quantity:1
    })
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode:"payment",
      success_url:`${frontend_url}/verify?success=true&paymentId=${feesObject._id}`,
      cancel_url:`${frontend_url}/verify?success=false&paymentId=${feesObject._id}`,
    })
    res.json({
      success:true,
      url:session.url
    })
  }catch(error){
    //console.log(error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
export const verifyPayment = async (req,res)=>{
  try {
    
    const {paymentId,success} = req.body;
 
  if(success == "true"){
    await FeesModel.findByIdAndUpdate(paymentId,{payment:"paid"})
    res.json({success:true,
      message:"paid"
    })
  }else{
    await FeesModel.findByIdAndDelete(paymentId);
    res.json({
      success:false,
      message:"not paid"
    })
  }
  } catch (error) {
    res.json({
      success:false,
      message:error
    })
  }
}