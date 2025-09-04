import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SellPage } from './pages/SellPage'
import { ListingsPage } from './pages/ListingsPage'
import { AdvertisePage } from './pages/AdvertisePage'
import { AdminPaymentsPage } from './pages/AdminPaymentsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App