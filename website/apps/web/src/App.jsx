
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import DemosPage from './pages/DemosPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import MagPage from './pages/MagPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import { Toaster } from './components/ui/toaster.jsx';

function App() {
  return (
    <MotionConfig transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}>
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/demos" element={<DemosPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mag" element={<MagPage />} />
            <Route path="/mag/:slug" element={<ArticlePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </Router>
    </MotionConfig>
  );
}

export default App;
