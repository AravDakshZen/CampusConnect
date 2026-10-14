import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PWAInstallProvider } from './context/PWAInstallContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PWAInstallProvider>
      <App />
    </PWAInstallProvider>
  </StrictMode>,
)
