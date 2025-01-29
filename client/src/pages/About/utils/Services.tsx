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
  
  Video,
  ClipboardCheck,
  HelpCircle,
  
} from 'lucide-react';


interface serviceType{
  title:string;
  description:string;
  features:string[];
  icon:ReactNode;
}

const Services : serviceType[] = [
    {
      title: "Live Interactive Classes",
      description: "Engage in real-time with expert instructors through our interactive virtual classrooms. Experience dynamic learning with live discussions and instant doubt resolution.",
      icon: <Video className="w-12 h-12 text-gray-300" />,
      features: ["Real-time interaction", "Interactive whiteboard", "Live Q&A sessions", "Recorded sessions available"]
    },
    {
      title: "Comprehensive Assignments",
      description: "Strengthen your understanding through carefully crafted assignments that test your knowledge and promote practical application of concepts.",
      icon: <ClipboardCheck className="w-12 h-12 text-gray-300" />,
      features: ["Auto-graded exercises", "Detailed solutions", "Regular feedback", "Progressive difficulty levels"]
    },
    {
      title: "24/7 Doubt Resolution",
      description: "Never let doubts hold you back. Get instant answers from our expert mentors through our dedicated doubt resolution platform.",
      icon: <HelpCircle className="w-12 h-12 text-gray-300" />,
      features: ["Quick response time", "One-on-one sessions", "Topic-wise experts", "Video explanations"]
    },
    // {
    //   title: "Performance Analytics",
    //   description: "Track your learning journey with our advanced analytics dashboard. Monitor progress, identify areas for improvement, and celebrate your achievements.",
    //   icon: <LineChart className="w-12 h-12 text-gray-300" />,
    //   features: ["Detailed progress reports", "Personalized insights", "Improvement suggestions", "Achievement tracking"]
    // },
    // {
    //   title: "Discussion Forums",
    //   description: "Join our vibrant community of learners. Share knowledge, discuss concepts, and learn from peers through moderated discussion forums.",
    //   icon: <MessageCircle className="w-12 h-12 text-gray-300" />,
    //   features: ["Topic-wise discussions", "Expert moderation", "Peer learning", "Resource sharing"]
    // },
    // {
    //   title: "Scheduled Learning",
    //   description: "Stay on track with personalized learning schedules. Our smart calendar helps you maintain consistent progress towards your goals.",
    //   icon: <Calendar className="w-12 h-12 text-gray-300" />,
    //   features: ["Customized timetables", "Reminder system", "Flexible scheduling", "Progress tracking"]
    // }
  ];

  export default Services;