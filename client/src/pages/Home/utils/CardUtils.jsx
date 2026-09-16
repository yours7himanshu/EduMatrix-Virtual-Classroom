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
import { Video, GraduationCap, LayoutDashboard } from "lucide-react";

const CardUtils = [
  {
    title: "Recorded Sessions",
    discription: "Access recorded lectures anytime. Learn and revise at your own pace from anywhere.",
    icon: <Video className="h-6 w-6" />,
  },
  {
    title: "Interactive Classes",
    discription: "Engage in real time with teachers and peers using live video, audio, and interactive chat.",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    title: "Smart Dashboard",
    discription: "Track your attendance, assignments, and exam performance in one calm unified view.",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
];

export default CardUtils;
