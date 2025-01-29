
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
    
    Users, 
    BookOpen, 
    Building, 
    GraduationCap,
    
  } from 'lucide-react';

  interface statsType{
    number:string;
    label:string;
    icon:ReactNode;
  }

const Stats : statsType[] =  [
    { number: "10K+", label: "Students Enrolled", icon: <Users className="w-6 h-6 text-purple-200" /> },
    { number: "500+", label: "Expert Teachers", icon: <GraduationCap className="w-6 h-6 text-purple-200" /> },
    { number: "100+", label: "Courses", icon: <BookOpen className="w-6 h-6 text-purple-200" /> },
    { number: "50+", label: "Partner Institutions", icon: <Building className="w-6 h-6 text-purple-200" /> }
  ];


  export default Stats;