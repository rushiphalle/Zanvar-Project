import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./utils/AuthContext.jsx";
import {SpinnerProvider} from './utils/SpinnerContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> 
      <SpinnerProvider>  
        <App />
      </SpinnerProvider>
    </AuthProvider>
  </StrictMode>,
)
