import React from 'react'

const VideoSection = () => {
  return (
    <section  id="project-video"
    className="py-10 px-6 mt-[10%] rounded-md mb-6 shadow-md bg-gradient-to-tr from-indigo-950 via-violet-950  to-blue-900  " >
        <div className="container flex gap-3 h-screen mx-auto w-full justify-center ">
            <div className="left-portion gap-8 flex flex-col justify-center items-center w-[60%] ">
                <h1 className='text-gray-200 text-5xl mx-3' > Supported Live Lecture And Live Chatting Features for Students and Teachers </h1>
                <p className='text-gray-200 text-xl mx-3' >Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quo rerum molestiae aut molestias laudantium? Neque placeat iste reiciendis doloribus molestias!</p>
            </div>
            <div className="right-portion h-screen w-1/2 flex items-center justify-center ">
                <video className='rounded-lg w-[85%] ' src="/videos/project.mp4 " autoPlay muted ></video>
            </div>
        </div>
    </section>
  )
}

export default VideoSection
