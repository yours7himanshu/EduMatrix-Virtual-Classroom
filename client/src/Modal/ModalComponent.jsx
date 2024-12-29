import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

function ModalComponent() {
  const [modalOpen, setModalOpen] = useState(true); // Set to true to open on load

  const closeModal = () => setModalOpen(false);

  const githubButton = (
    <Link to="https://github.com/yours7himanshu/EduMatrix-Virtual-Classroom" target="_blank" >
    <button className='h-13 bg-black rounded-md text-white p-3  ' >
        Star on Github ⭐
    </button>
    </Link>
  );

  return (
    <div className="App">
      {modalOpen && <Modal 
        isOpen={modalOpen}
        onClose={closeModal}
        content={{
       
          message: " Wanna help me in my journey 💎 ? Please star this repository to support my project ❤️"
        }}
        actionButton={githubButton}
      />}
      {/* Rest of your app content */}
    </div>
  );
}

export default ModalComponent;