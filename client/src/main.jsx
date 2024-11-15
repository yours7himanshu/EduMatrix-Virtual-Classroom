import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import AuthContextProvider from './context/AuthContext'; // Ensure correct import path

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>  {/* Wrap App inside AuthContextProvider */}
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
