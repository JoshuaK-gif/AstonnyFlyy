import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import App from './App.jsx'
import './index.css'

import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  </HelmetProvider>
)
