import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './programme.css'
import './graduate.css'
import GraduateApp from './GraduateApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraduateApp />
  </StrictMode>,
)
