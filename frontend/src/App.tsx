import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SellPage } from './pages/SellPage'
import { ListingsPage } from './pages/ListingsPage'
import { AdvertisePage } from './pages/AdvertisePage'
import { AdminPaymentsPage } from './pages/AdminPaymentsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { SellerDashboard } from './pages/SellerDashboard'
import { LoginPage } from './pages/LoginPage'
import { ListingDetailsPage } from './pages/ListingDetailsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<SellerDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App