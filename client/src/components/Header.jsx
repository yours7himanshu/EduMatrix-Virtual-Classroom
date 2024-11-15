import React from "react";
import { assets } from "../assets/assets";
const Header = () => {
  return (
    <div className="flex justify-between">
      {/* {Left side} */}
      <div className="flex-col justify-center gap-5 align-center w-[60%] py-[10%] px-[7%]">
        <p className="text-5xl m-4 text-purple-800 font-extrabold font-serif">
          Create your own
        </p>
        <p className="text-5xl m-4 text-blue-950 font-extrabold font-serif">
          World's best online
        </p>
        <p className="text-5xl m-4 text-blue-400 font-extrabold font-serif">
          learning platform
        </p>
        <p className="text-slate-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis
          eveniet perferendis maiores, esse suscipit ad corporis assumenda, vero
          aliquam vitae aperiam quos nesciunt qui. Totam omnis et velit nemo
          nihil.
        </p>
        <button className="flex gap-5 px-[5%] py-[2%] items-center mt-[5%]  bg-purple-400 text-xl  text-white rounded-2xl shadow-md shadow-purple-500 font-medium">
          Explore more
          <img src={assets.arrow_icon} className="pt-1 w-7 h-5 " alt="" />
        </button>
      </div>
      {/* right side */}
      <div className="flex gap-5 py-[10%] pr-[5%] w-[40%]  ">
        <div className="relative top-[45%]  ">
          <img src={assets.img1} className="rounded-2xl" alt="" />
        </div>
        <div className="relative bottom-[20%] right-[7%]   ">
          <img src={assets.img2} className="rounded-2xl " alt="" />
        </div>
      </div>
    </div>
  );
};

export default Header;
