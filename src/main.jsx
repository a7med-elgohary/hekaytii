import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import NewHeroPage from './NewHeroPage.jsx'
import StoryCreatorPage from './StoryCreatorPage.jsx'
import StoryReaderPage from './StoryReaderPage.jsx'
import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/new" element={<NewHeroPage />} />
          <Route path="/create" element={<StoryCreatorPage />} />
          <Route path="/read" element={<StoryReaderPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
