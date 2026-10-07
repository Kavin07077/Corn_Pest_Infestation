import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DatasetManagement from './pages/DatasetManagement';
import Preprocessing from './pages/Preprocessing';
import PatternAnalysis from './pages/PatternAnalysis';
import DataMiningModels from './pages/DataMiningModels';
import PredictionPage from './pages/PredictionPage';
import PredictionHistory from './pages/PredictionHistory';
import AboutProject from './pages/AboutProject';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dataset" element={<DatasetManagement />} />
          <Route path="/preprocessing" element={<Preprocessing />} />
          <Route path="/analysis" element={<PatternAnalysis />} />
          <Route path="/models" element={<DataMiningModels />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/history" element={<PredictionHistory />} />
          <Route path="/about" element={<AboutProject />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
