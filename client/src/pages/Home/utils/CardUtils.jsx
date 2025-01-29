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


import {
  School,
  Videocam,
  Dashboard,
  
} from "@mui/icons-material"; // MUI Icons

const CardUtils = [
  {
    title: "Recorded Sessions",
    discription: "Access Recorded sessions anytime. Work aytime and anywhere",
    icon: <Videocam className="text-violet-500 text-4xl mb-4" />,
  },
  {
    title: "Interactive Classes",
    discription:
      "Engage in real time with teachers and peer using live video call and chats",
    icon: <School className="text-violet-500 text-4xl mb-4" />,
  },
  {
    title: "Smart Dashboard",
    discription:
      "Track your progress , assignment and grades in one place",
    icon: <Dashboard className="text-violet-500 text-4xl mb-4" />,
  },
];

export default CardUtils;
