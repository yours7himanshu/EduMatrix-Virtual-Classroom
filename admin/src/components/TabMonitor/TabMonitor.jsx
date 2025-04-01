import { useEffect, useState } from "react";
import {toast} from "react-toastify";

const TabMonitor = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    const handleVisibilityChange = () => {
      
      if (document.hidden) {
        setError("Warning: Tab switching detected!");
        toast.warn("Warning: Tab switching detected!",{
            position:"top-center"
        })
      } 
      else{
        setTimeout(()=>{
            setError("");
        },10000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
   
    };
  }, []);

  return (
    <div className="p-2">
     
      {error && <p className="text-yellow-500 font-semibold">{error}</p>}
    </div>
  );
};

export default TabMonitor;