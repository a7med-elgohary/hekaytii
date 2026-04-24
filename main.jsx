import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import NewHeroPage from './NewHeroPage.jsx'
import StoryCreatorPage from './StoryCreatorPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/new" element={<NewHeroPage />} />
        <Route path="/create" element={<StoryCreatorPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
