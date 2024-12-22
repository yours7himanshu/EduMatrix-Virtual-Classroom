import React from "react";
// import image from "../../assets/image.png";
const Logo = () => {
  return (
    <div className="flex gap-1 w-[90%] shadow-xl relative right-5 pb-4 items-center justify-center m-3 pl-4 pr-4 h-16   mb-10 border border-blue-500 padding-1 rounded-3xl " >
      <img src="/logo/EduMatrix2.png" className="w-[5vw] h-[10vh] p-1 pt-4 mb-0 object-cover border-none rounded-full " alt="" />
      <p className="font-extrabold mt-3 text-3xl  " >EduMatrix</p>
    </div>
  );
};

export default Logo;
