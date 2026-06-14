import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter as Router} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './pages/Auth/Service/AuthContext.jsx';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
});

createRoot(document.getElementById('root')).render(
<AuthProvider>
   <Router>
   <StrictMode>
    <App />
  </StrictMode>
 </Router>
</AuthProvider>
)
