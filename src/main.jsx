import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//this file is what does the rendering, the app in here says dispaly all that is in App
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/*BrowserRouter allows a user to move in between pages in a React application*/}
     <App />
    </BrowserRouter>
   
  </StrictMode>,
)
