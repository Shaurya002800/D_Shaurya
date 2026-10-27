import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { MotionConfig } from 'framer-motion'
import './index.css'
import { portfolioStructuredData } from './data/metadata.js'

const structuredData = document.createElement('script')
structuredData.type = 'application/ld+json'
structuredData.textContent = JSON.stringify(portfolioStructuredData())
document.head.appendChild(structuredData)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user"><App /></MotionConfig>
  </StrictMode>,
)