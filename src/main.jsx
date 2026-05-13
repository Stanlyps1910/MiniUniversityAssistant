import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: '13px',
          fontWeight: 500,
        },
      }}
    />
    <App />
  </React.StrictMode>
)
