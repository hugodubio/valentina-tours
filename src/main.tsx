import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { config } from './config'


document.documentElement.style.setProperty('--color-primary', config.primaryColor)
document.documentElement.style.setProperty('--color-primary-hover', config.primaryHover)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out splash screen after app is ready
setTimeout(() => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 600);
  }
}, 1400);
