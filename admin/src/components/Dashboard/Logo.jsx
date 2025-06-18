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
    <div className="flex items-center gap-2"> {/* Removed styling classes and w-full */}
      <img src="/logo/EduMatrix2.png" className="h-14 w-auto object-contain" alt="EduMatrix Logo" /> {/* Increased height to h-14 */}
      <p className="font-bold text-2xl text-gray-800">EduMatrix</p> {/* Increased text size to text-2xl */}
    </div>
  );
};

export default Logo;
