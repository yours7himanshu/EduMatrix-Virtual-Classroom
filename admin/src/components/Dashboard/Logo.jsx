/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import React from "react";
const Logo = () => {
  return (
    <div className="flex gap-1 w-[90%] shadow-xl relative right-5 pb-4 items-center justify-center m-3 pl-4 pr-4 h-16   mb-10 border border-blue-500 padding-1 rounded-3xl " >
      <img src="/logo/EduMatrix2.png" className="w-[5vw] h-[10vh] p-1 pt-4 mb-0 object-cover border-none rounded-full " alt="" />
      <p className="font-extrabold mt-3 text-3xl  " >EduMatrix</p>
    </div>
  );
};

export default Logo;
