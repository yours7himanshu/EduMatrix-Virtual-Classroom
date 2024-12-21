import React from "react";
// import image from "../../assets/image.png";
const Logo = () => {
  return (
    <div className="flex gap-1 items-center mr-11  mb-10 " >
      <img src="/logo/EduMatrix2.png" className="w-[5vw] h-[10vh] p-1 pt-4 mb-0 object-cover border-none rounded-full " alt="" />
      <p className="font-extrabold mt-3 text-3xl  " >EduMatrix</p>
    </div>
  );
};

export default Logo;
