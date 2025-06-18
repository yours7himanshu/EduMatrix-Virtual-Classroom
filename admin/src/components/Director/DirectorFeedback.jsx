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
     <div className="w-full"> {/* Ensure the root div takes full width */}
        {data && data.length>0 ? <div>
            <div className="p-4 md:p-6 bg-gray-100 min-h-screen"> {/* Adjusted padding */}
            <div className="space-y-6"> {/* Removed ml-[23%], adjusted space-y */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center md:text-left">User Feedbacks</h2> {/* Removed ml-2, added responsive text align */}
                {data.map((value,index)=>(
                    // Changed w-[50%] to w-full max-w-2xl mx-auto for responsive and centered cards
                    <div key={index} className="bg-white shadow cursor-pointer rounded-lg p-5 w-full max-w-2xl mx-auto hover:shadow-lg transition-shadow">
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
        </div> : <div>Loading Please wait .....</div>}
     </div>
    )
}

export default AppLayout()(DirectorFeedback);