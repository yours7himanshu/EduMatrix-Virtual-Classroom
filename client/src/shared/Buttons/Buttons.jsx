import React from "react";
import clsx from 'clsx'

const Buttons = ( {title,className} ) => {
  return (
    <button className={clsx(className )} >
      {title}
    </button>
  );
};

export default Buttons;
