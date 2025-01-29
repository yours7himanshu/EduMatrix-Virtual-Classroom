
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
import React,{ReactNode} from 'react';

import { 
    Award, 
    Users, 
    Globe, 
    
  } from 'lucide-react';
  
interface ValueType {
  title:string;
  description:string;
  icon:ReactNode;
}

const Values : ValueType[] = [
    {
      title: "Excellence in Education",
      description: "We strive to maintain the highest standards in digital education and learning methodologies.",
      icon: <Award className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Student-Centered Approach",
      description: "Our focus is always on creating the best possible learning experience for our students.",
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Global Reach",
      description: "We connect students and educators across borders, fostering a global learning community.",
      icon: <Globe className="w-6 h-6 text-blue-600" />
    }
  ];

  export default Values;