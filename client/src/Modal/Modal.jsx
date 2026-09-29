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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="relative mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-center p-4 pb-0">
          {/* <h3 className="text-xl font-semibold text-gray-400 dark:text-white">
            {content.title}
          </h3> */}
          <button 
            type="button" 
            onClick={closeModal}
            aria-label="Close dialog"
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-400"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto overscroll-contain p-5">
            
        <p className=" text-center text-sm  font-medium text-wrap dark:text-indigo-600" > {content.disclaimer} </p>
          <p className=" text-center  text-wrap dark:text-gray-500">
            {content.message}
            <span className='block' >
                {content.thank}
            </span>
          </p>
        </div>
        <div className=" flex justify-center p-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {actionButton}
        </div>
      </div>
    </div>
  );
};

export default Modal;