import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initInstallPrompt } from './lib/installPrompt.ts'

initInstallPrompt()

if (import.meta.env.DEV) {
  import('./dev/seed.ts').then((m) => m.exposeDevHelpers())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
