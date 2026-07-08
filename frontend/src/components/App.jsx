import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/components/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './ScrollToTop';
import SmoothScroll from './common/SmoothScroll';
import { CartProvider } from './cart/CartProvider';
import Home from './lib/Home';
import ProductDetail from './lib/ProductDetail';
import InfoPage from './lib/InfoPage';
import Shop from './lib/Shop';
import About from './lib/About';
import Contact from './lib/Contact';
import Lookbook from './lib/Lookbook';
import Checkout from './lib/Checkout';
import CheckoutSuccess from './lib/CheckoutSuccess';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminProductList from './admin/ProductList';
import AdminProductForm from './admin/ProductForm';
import AdminOrders from './admin/Orders';
import AdminSettings from './admin/Settings';
import AdminLogin from './admin/AdminLogin';
import AdminInventory from './admin/Inventory';
import AdminMessages from './admin/Messages';
import AdminSubscribers from './admin/Subscribers';
import AdminEditorial from './admin/Editorial';
import AdminCollections from './admin/Collections';
import { useAuth, AuthProvider } from '../lib/AuthContext';
import { Navigate } from 'react-router-dom';
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const AuthenticatedApp = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/:slug" element={<InfoPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
          <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProductList /></ProtectedAdminRoute>} />
          <Route path="/admin/products/new" element={<ProtectedAdminRoute><AdminProductForm /></ProtectedAdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedAdminRoute><AdminProductForm /></ProtectedAdminRoute>} />
          <Route path="/admin/inventory" element={<ProtectedAdminRoute><AdminInventory /></ProtectedAdminRoute>} />
          <Route path="/admin/collections" element={<ProtectedAdminRoute><AdminCollections /></ProtectedAdminRoute>} />
          <Route path="/admin/editorial" element={<ProtectedAdminRoute><AdminEditorial /></ProtectedAdminRoute>} />
          <Route path="/admin/community" element={<ProtectedAdminRoute><AdminSubscribers /></ProtectedAdminRoute>} />
          <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
          <Route path="/admin/messages" element={<ProtectedAdminRoute><AdminMessages /></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SmoothScroll>
              <ScrollToTop />
              <AuthenticatedApp />
            </SmoothScroll>
          </Router>
          <Toaster />
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App