import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Foundation first: component stylesheets are imported further down the
// module graph, so they land after this and win ties on specificity.
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
