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
     <div className="w-full">
        {data && data.length > 0 ? (
          <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Feedbacks</h2>
              {data.map((value, index) => (
                <div key={index} className="bg-white shadow-sm border border-gray-200/80 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 grid place-items-center mr-3">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900 block">{value.fullName}</span>
                      <span className="text-xs text-gray-500 block">{value.email}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-2.5 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 font-medium">Loading feedback...</div>
        )}
     </div>
    );
}

export default AppLayout()(DirectorFeedback);