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
