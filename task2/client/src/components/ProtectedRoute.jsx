import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import keycloak from '../keycloak';

const ProtectedRoute = ({ component: Component }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        if (!didInit.current) {
          didInit.current = true;
          const auth = await keycloak.init({ onLoad: 'login-required' });
          setAuthenticated(auth);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
      }
    };

    initKeycloak();
  }, []);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!authenticated) {
    return <Navigate to="/signin" />;
  }

  // Если авторизован, рендерим переданный компонент
  return <Component />;
};

export default ProtectedRoute;
