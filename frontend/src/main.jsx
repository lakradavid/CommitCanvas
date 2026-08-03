import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-mono text-sm',
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid #30363d',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
