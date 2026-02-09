import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NeuralBackground } from './components/NeuralBackground';
import { Analytics } from './components/Analytics';
import { Layout } from './components/Layout';
import { StudyMode } from './components/StudyMode';
import { FlashcardView } from './components/FlashcardView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Quiz } from './components/Quiz';
import './i18n';

import { NeuralParticles } from './components/NeuralParticles';
import { Login } from './components/Login';

export const App: React.FC = () => {
    // Login component is now imported

  return (
    <BrowserRouter>
      {/* Background is persistent across routes */}
      <NeuralBackground />
      <NeuralParticles />
      <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<StudyMode />} />
            <Route path="/flashcards" element={<FlashcardView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/quiz/:categoryId" element={<Quiz />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
