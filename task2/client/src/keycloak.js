// keycloak.js
import Keycloak from 'keycloak-js';

// Создание экземпляра Keycloak только один раз
const keycloak = new Keycloak({
   url: 'http://localhost:8080',  // Укажи реальный URL Keycloak
   realm: 'My_realm',                  // Укажи реальный Realm в Keycloak
   clientId: 'My_client'               // Укажи реальный Client ID в Keycloak
});

export default keycloak;
