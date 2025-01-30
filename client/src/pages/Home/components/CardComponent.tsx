import React, { ReactNode } from 'react'


interface CardComponentProps{
  title:string;
  discription:string;
  icon:ReactNode;
}

const CardComponent : React.FC<CardComponentProps> = ({title,discription,icon}) => {
  return (
    <div  data-aos="fade-up"
    data-aos-duration="1000"
    className="bg-slate-900 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:scale-105" >
      <div> {icon} </div>
      <h1 className='text-gray-200' >  {title} </h1>
      <p className='text-gray-300 text-sm mt-2' > {discription} </p>

    </div>
  )
}

export default CardComponent;
