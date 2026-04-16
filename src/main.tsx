import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {ShopifyProvider, CartProvider} from '@shopify/hydrogen-react';
import App from './App';
import Homepage from './pages/Homepage';
import ProductsPage from './pages/ProductsPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetail from './pages/CollectionDetail';
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:handle" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:handle" element={<CollectionDetail />} />
            <Route path="*" element={<Homepage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ShopifyProvider>
  </React.StrictMode>
);
