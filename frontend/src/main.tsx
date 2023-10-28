import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

const useProdAuth0 = import.meta.env.PROD;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <React.StrictMode>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_STAGING_DOMAIN}
        clientId={
          useProdAuth0
            ? import.meta.env.VITE_AUTH0_PRODUCTION_CLIENT_ID
            : import.meta.env.VITE_AUTH0_STAGING_CLIENT_ID
        }
        authorizationParams={{
          redirect_uri: `${window.location.origin}/study/`,
        }}
      >
        <App />
      </Auth0Provider>
    </React.StrictMode>
  </BrowserRouter>
);
