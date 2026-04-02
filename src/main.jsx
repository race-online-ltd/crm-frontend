import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
// Import your named 'theme' export
import { theme } from "./features/settings/components/ThemeProvider.js";
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);