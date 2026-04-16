import React from 'react';
import ReactDOM from 'react-dom/client';
import { ShopifyProvider, CartProvider } from '@shopify/hydrogen-react';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShopifyProvider
      storeDomain="https://sp0s1i-ca.myshopify.com"
      storefrontToken="45f3c7d3cd11271f89e2e380499f1c49"
      storefrontApiVersion="2024-10"
      countryIsoCode="US"
      languageIsoCode="EN"
    >
      <CartProvider>
        <App />
      </CartProvider>
    </ShopifyProvider>
  </React.StrictMode>
);
