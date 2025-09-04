import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SellPage } from './pages/SellPage'
import { ListingsPage } from './pages/ListingsPage'
import { AdvertisePage } from './pages/AdvertisePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App