import { 
  Award, 
  Users, 
  Globe, 
  BookOpen, 
  Building, 
  GraduationCap,
  Video,
  ClipboardCheck,
  HelpCircle,
  LineChart,
  MessageCircle,
  Calendar
} from 'lucide-react';

const Services = [
    {
      title: "Live Interactive Classes",
      description: "Engage in real-time with expert instructors through our interactive virtual classrooms. Experience dynamic learning with live discussions and instant doubt resolution.",
      icon: <Video className="w-12 h-12 text-blue-600" />,
      features: ["Real-time interaction", "Interactive whiteboard", "Live Q&A sessions", "Recorded sessions available"]
    },
    {
      title: "Comprehensive Assignments",
      description: "Strengthen your understanding through carefully crafted assignments that test your knowledge and promote practical application of concepts.",
      icon: <ClipboardCheck className="w-12 h-12 text-blue-600" />,
      features: ["Auto-graded exercises", "Detailed solutions", "Regular feedback", "Progressive difficulty levels"]
    },
    {
      title: "24/7 Doubt Resolution",
      description: "Never let doubts hold you back. Get instant answers from our expert mentors through our dedicated doubt resolution platform.",
      icon: <HelpCircle className="w-12 h-12 text-blue-600" />,
      features: ["Quick response time", "One-on-one sessions", "Topic-wise experts", "Video explanations"]
    },
    {
      title: "Performance Analytics",
      description: "Track your learning journey with our advanced analytics dashboard. Monitor progress, identify areas for improvement, and celebrate your achievements.",
      icon: <LineChart className="w-12 h-12 text-blue-600" />,
      features: ["Detailed progress reports", "Personalized insights", "Improvement suggestions", "Achievement tracking"]
    },
    {
      title: "Discussion Forums",
      description: "Join our vibrant community of learners. Share knowledge, discuss concepts, and learn from peers through moderated discussion forums.",
      icon: <MessageCircle className="w-12 h-12 text-blue-600" />,
      features: ["Topic-wise discussions", "Expert moderation", "Peer learning", "Resource sharing"]
    },
    {
      title: "Scheduled Learning",
      description: "Stay on track with personalized learning schedules. Our smart calendar helps you maintain consistent progress towards your goals.",
      icon: <Calendar className="w-12 h-12 text-blue-600" />,
      features: ["Customized timetables", "Reminder system", "Flexible scheduling", "Progress tracking"]
    }
  ];

  export default Services;