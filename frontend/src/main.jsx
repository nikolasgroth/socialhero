import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LocationExplanationProvider } from './contexts/LocationExplanationContext';
import { MissionProvider } from './contexts/MissionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationExplanationProvider>
          <WebSocketProvider>
            <MissionProvider>
              <App />
            </MissionProvider>
          </WebSocketProvider>
        </LocationExplanationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
