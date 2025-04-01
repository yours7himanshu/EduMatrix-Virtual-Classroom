/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    },
    heading: {
      fontSize: '8rem',
      fontWeight: 'bold',
      margin: '0',
      color: '#dc3545',
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
    },
    subHeading: {
      fontSize: '2rem',
      margin: '10px 0 20px',
      color: '#495057'
    },
    message: {
      fontSize: '1.1rem',
      maxWidth: '500px',
      lineHeight: '1.6',
      marginBottom: '30px',
      color: '#6c757d'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background-color 0.3s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404</h1>
      <h2 style={styles.subHeading}>Page Not Found</h2>
      <p style={styles.message}>
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable. Please check the URL or navigate back to the dashboard.
      </p>
      <Link to="/" style={styles.button}>
        Return to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
