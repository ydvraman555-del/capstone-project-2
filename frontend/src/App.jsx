import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import Predictor from './components/Predictor';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/predict" element={<Predictor />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="bg-[#0f172a] min-h-screen">
      <Router>
        <AnimatedRoutes />
      </Router>
    </div>
  );
}

export default App;
