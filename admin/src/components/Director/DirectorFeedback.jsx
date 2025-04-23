import { useEffect, useState } from "react";
import axios from 'axios'
import { User, Mail, MessageCircle } from 'lucide-react';
import AppLayout from "../../layout/AppLayout";

const DirectorFeedback = ()=>{
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [data,setData]=useState([]);

    useEffect(()=>{
        const getFeedback = async()=>{
            try{
                const response = await axios.get(`${backendUrl}/api/getfeedback`);
                if(response.data.success){
                    console.log(response.data.feedbackreport)
                    setData(response.data.feedbackreport);
                }
            }catch(error){
                console.log("Some error occured",error);
            }
        }
        getFeedback();
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="space-y-4  ml-[23%] ">
            <h2 className="text-2xl font-semibold mb-6 ml-2 text-gray-800">User Feedbacks</h2>
                {data.map((value,index)=>(
                    <div key={index} className="bg-white shadow cursor-pointer rounded-lg p-5 w-[50%] hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-2">
                            <User className="w-5 h-5 text-blue-500 mr-2" />
                            <span className="text-lg font-medium text-gray-900">{value.fullName}</span>
                        </div>
                        <div className="flex items-center mb-3">
                            <Mail className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{value.email}</span>
                        </div>
                        <div className="flex items-start">
                            <MessageCircle className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                            <p className="text-gray-700">{value.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AppLayout()(DirectorFeedback);