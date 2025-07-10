import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext.jsx';

import { ScreenTimeProvider } from './context/ScreenTimeContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <ScreenTimeProvider>
          <App />
        </ScreenTimeProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>,
)
