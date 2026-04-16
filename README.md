# Eulyne - Hydrogen + Shopify Storefront

A luxury press-on nail e-commerce storefront built with Shopify Hydrogen framework, connected to Shopify Storefront API.

## Features

- **Shopify Storefront API Integration** - Real products, cart, and checkout
- **Hydrogen Framework** - Shopify's official React framework built on Vite
- **Tailwind CSS** - Utility-first styling with custom brand colors
- **Full E-commerce** - Product listings, cart, checkout flow
- **Responsive Design** - Mobile-first approach with beautiful animations

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` with your Shopify credentials:

```env
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_token
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_VERSION=2024-10
```

### 3. Run Development Server

```bash
npm run dev
```

## Project Structure

```
app/
├── components/        # Reusable UI components
│   └── ProductCard.tsx
├── lib/               # Shopify API utilities
│   ├── storefront-api.ts
│   └── queries.ts
├── routes/            # Hydrogen routes (file-based routing)
│   ├── _index.tsx     # Homepage
│   ├── cart.tsx       # Cart page
│   ├── products._index.tsx    # All products
│   ├── products.$handle.tsx   # Product detail
│   ├── collections._index.tsx # All collections
│   └── collections.$handle.tsx # Collection page
├── styles/
│   └── app.css        # Tailwind styles
├── entry-client.tsx   # Client entry
├── entry-server.tsx   # Server entry
└── root.tsx           # Root layout
```

## Shopify Storefront API Setup

### Required Permissions

In your Shopify Admin, enable these Storefront API scopes:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`
- `unauthenticated_write_customers`
- `unauthenticated_read_customers`

### Getting Your Storefront Token

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Configure Storefront API scopes
4. Install the app and copy the Storefront access token

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **Framework**: Shopify Hydrogen 2024.10
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Vite 5
- **API**: Shopify Storefront GraphQL API

## Notes

- This project uses Hydrogen's file-based routing
- Cart state is managed via Hydrogen's `CartProvider`
- Product data is fetched server-side via Hydrogen loaders
- The design preserves Eulyne's brand aesthetic (pink/gold luxury theme)
