// src/popup/index.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import Popup from '../components/Popup'
import './index.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Popup />)
}
