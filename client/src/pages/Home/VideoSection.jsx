import React from "react";

const VideoSection = () => {
  return (
    <section
      id="project-video"
      className="py-10 px-6 mt-[10%] rounded-md mb-6 shadow-md bg-gradient-to-tr from-indigo-950 via-violet-950  to-blue-900  "
    >
      <div className="container flex gap-3  max-md:h-auto h-screen mx-auto w-full justify-center max-md:flex-col-reverse max-md:w-full max-md:items-center  ">
        <div className="left-portion gap-8  flex flex-col justify-center max-md:items-start items-center max-md:w-[100%] w-[60%] ">
          <h1 className="text-gray-200 text-5xl max-md:mt-8 mx-3 max-md:text-2xl max-md:w-full ">
            {" "}
            Supported Live Lecture And Live Chatting Features for Students and
            Teachers{" "}
          </h1>
          <p className="text-gray-200 text-xl mx-3">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo rerum
            molestiae aut molestias laudantium? Neque placeat iste reiciendis
            doloribus molestias!
          </p>
        </div>
        <div className="right-portion h-screen w-1/2  max-md:w-full flex items-center max-md:items-start max-md:h-1/2 justify-center ">
          <video
            className="rounded-lg w-[85%] "
            src="/videos/project.mp4 "
            autoPlay
            muted
          ></video>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
