import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

const isPlaywright =
  typeof window !== 'undefined' &&
  (window.__PLAYWRIGHT__ ||
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.includes('Playwright')))

if (isPlaywright) {
  document.documentElement.setAttribute('data-test', '1')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
