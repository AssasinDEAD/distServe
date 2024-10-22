import React, { useEffect, useState, useRef } from 'react';
import keycloak from './keycloak';  // Импорт Keycloak
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard'; // Это может быть твоя защищенная страница

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} /> {/* Перенаправляем на страницу входа */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
