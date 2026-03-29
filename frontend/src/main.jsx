import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b27',
            color: '#e2e8f0',
            border: '1px solid #252d3d',
            borderRadius: '8px',
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00d4aa', secondary: '#0f1117' } },
          error: { iconTheme: { primary: '#ff4d6d', secondary: '#0f1117' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
