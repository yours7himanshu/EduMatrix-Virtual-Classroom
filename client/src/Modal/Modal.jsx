import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';

const Modal = ({ isOpen, onClose, content, actionButton }) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const closeModal = () => {
    setShowModal(false);
    onClose(); 
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-md:w-[95%] max-md:h-[30%] max-w-md mx-auto bg-white h-[40%] rounded-lg shadow-lg">
        <div className="flex items-center justify-center p-5  ">
          {/* <h3 className="text-xl font-semibold text-gray-400 dark:text-white">
            {content.title}
          </h3> */}
          <button 
            type="button" 
            onClick={closeModal} 
            className="text-white bg-red-500 hover:bg-red-400  rounded-md text-sm p-1.5 ml-auto inline-flex items-center "
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 space-y-3">
        
          <p className="text-base text-center leading-normal  dark:text-gray-500">
            {content.message}
          </p>
        </div>
        <div className="flex  justify-center p-6 ">
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default Modal;