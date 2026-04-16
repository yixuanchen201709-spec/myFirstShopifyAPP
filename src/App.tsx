import { useState, useEffect } from 'react';
import { useCart } from '@shopify/hydrogen-react';

async function shopifyFetch(query: string, variables: Record<string, any> = {}) {
  const response = await fetch('https://sp0s1i-ca.myshopify.com/api/2024-10/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '45f3c7d3cd11271f89e2e380499f1c49',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  return json.data;
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  featuredImage {
    url
    altText
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 10) {
    edges {
      node {
        id
        title
        price {
          amount
          currencyCode
        }
        availableForSale
      }
    }
  }
  tags
`;

function formatPriceLocal(amount: string | number, currencyCode: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
}

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: Array<{ node: { id: string; availableForSale: boolean } }> };
  tags?: string[];
}

function ProductCard({ product }: { product: Product }) {
  const { linesAdd } = useCart();
  const [added, setAdded] = useState(false);

  const firstVariant = product.variants.edges[0]?.node;
  const isAvailable = firstVariant?.availableForSale ?? true;
  const imageUrl = product.featuredImage?.url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop';
  const price = product.priceRange?.minVariantPrice?.amount || '0';
  const currencyCode = product.priceRange?.minVariantPrice?.currencyCode || 'USD';
  const badge = product.tags?.find(t => ['Bestseller', 'New', 'Limited', 'Sale'].includes(t));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || !isAvailable) return;
    await linesAdd([{ merchandiseId: firstVariant.id, quantity: 1 }]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <a href={`/products/${product.handle}`} className="product-card bg-white rounded-2xl overflow-hidden shadow-sm block no-underline">
      <div className="relative">
        <img src={imageUrl} alt={product.title} className="w-full h-56 lg:h-72 object-cover" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
        {badge && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${
            badge === 'Bestseller' ? 'bg-gold text-white' :
            badge === 'New' ? 'bg-rose text-white' :
            badge === 'Limited' ? 'bg-lavender text-white' : 'bg-charcoal text-white'
          }`}>{badge}</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-warmgray uppercase tracking-wide mb-1">{product.tags?.[0] || 'Press-On Set'}</p>
        <h4 className="font-heading text-lg font-semibold mb-1 text-charcoal">{product.title}</h4>
        <p className="text-sm text-warmgray mb-3">24 pieces • Reusable</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">{formatPriceLocal(price, currencyCode)}</span>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isAvailable
                ? added
                  ? 'bg-green-500 text-white'
                  : 'bg-rose text-white hover:bg-rose-dark'
                : 'bg-gray-200 text-warmgray cursor-not-allowed'
            }`}
          >
            {added ? 'Added!' : isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </a>
  );
}

function Header() {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blush-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button className="lg:hidden p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            <div className="nav-item relative">
              <a href="/collections/all" className="font-medium text-sm hover:text-rose transition-colors">SHOP</a>
              <div className="nav-dropdown">
                <a href="/collections/all" className="block px-4 py-2 text-sm hover:bg-blush-light">All Nails</a>
                <a href="/collections/press-on" className="block px-4 py-2 text-sm hover:bg-blush-light">Press-On Sets</a>
                <a href="/collections/nail-charms" className="block px-4 py-2 text-sm hover:bg-blush-light">Nail Charms</a>
                <a href="/collections/gel" className="block px-4 py-2 text-sm hover:bg-blush-light">Gel Extensions</a>
              </div>
            </div>
            <a href="/collections" className="font-medium text-sm hover:text-rose transition-colors">COLLECTIONS</a>
            <a href="/pages/about" className="font-medium text-sm hover:text-rose transition-colors">ABOUT</a>
            <a href="/pages/journal" className="font-medium text-sm hover:text-rose transition-colors">JOURNAL</a>
          </nav>

          <a href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl font-bold tracking-wide">
              <span className="gradient-text">EULYNE</span>
            </h1>
          </a>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-rose transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <a href="/account" className="p-2 hover:text-rose transition-colors" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </a>
            <a href="/cart" className="p-2 hover:text-rose transition-colors relative" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
              {totalQuantity && totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-white text-xs rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-white py-2 overflow-hidden">
      <div className="marquee">
        <div className="marquee-content">
          <span className="inline-flex items-center gap-8 text-sm font-medium">
            <span>✨ FREE SHIPPING ON ORDERS $75+</span>
            <span className="text-gold">•</span>
            <span>🌍 ROOTED IN AFRICA — CRAFTED WITH LOVE</span>
            <span className="text-gold">•</span>
            <span>💅 LUXURY PRESS-ON NAILS — 20% OFF FIRST ORDER WITH CODE: EULYNE20</span>
            <span className="text-gold">•</span>
            <span>✨ FREE SHIPPING ON ORDERS $75+</span>
            <span className="text-gold">•</span>
            <span>🌍 ROOTED IN AFRICA — CRAFTED WITH LOVE</span>
            <span className="text-gold">•</span>
            <span>💅 LUXURY PRESS-ON NAILS — 20% OFF FIRST ORDER WITH CODE: EULYNE20</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-block text-gold-dark text-sm font-semibold tracking-widest uppercase mb-4">New Collection</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-charcoal">
              Luxury Nails,<br />
              <span className="text-rose">Rooted in Heritage</span>
            </h2>
            <p className="text-warmgray text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Handcrafted press-on nails inspired by the vibrant colors and patterns of African artistry. Experience elegance that tells a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#products" className="btn-primary inline-flex items-center justify-center gap-2 bg-rose text-white px-8 py-4 rounded-full font-semibold no-underline">
                Shop Collection
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a href="/pages/about" className="inline-flex items-center justify-center gap-2 bg-white text-charcoal px-8 py-4 rounded-full font-semibold border-2 border-blush-dark hover:border-rose hover:text-rose transition-colors no-underline">
                Our Story
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-sm font-medium text-charcoal">4.9/5 Rating</span>
              </div>
              <div className="text-sm text-warmgray">|</div>
              <div className="text-sm font-medium text-charcoal">50K+ Happy Customers</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gold-light/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blush-dark/40 rounded-full blur-2xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-float">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop" alt="Luxury press-on nails" className="w-full h-[400px] lg:h-[500px] object-cover" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <p className="text-sm font-semibold text-charcoal">Handcrafted with love</p>
                <p className="text-xs text-warmgray">Inspired by African heritage</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-blush-light">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=200&fit=crop&sat=-100&hue=30" alt="Nail charm" className="w-20 h-20 rounded-xl object-cover mb-2" />
              <p className="text-xs font-semibold text-charcoal">New Arrivals</p>
              <p className="text-xs text-warmgray">Shop Now →</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  const categories = [
    { src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop', title: 'Press-On Sets', subtitle: '24 pieces', href: '/collections/press-on' },
    { src: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=500&fit=crop', title: 'Nail Charms', subtitle: 'Handmade', href: '/collections/nail-charms' },
    { src: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=500&fit=crop', title: 'Gel Extensions', subtitle: 'Professional', href: '/collections/gel' },
    { src: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=500&fit=crop', title: 'Accessories', subtitle: 'Tools & more', href: '/collections/accessories' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-charcoal">Shop by Category</h3>
          <p className="text-warmgray max-w-xl mx-auto">Find your perfect style from our curated collections</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <a key={i} href={cat.href} className="product-card group relative rounded-2xl overflow-hidden block no-underline">
              <img src={cat.src} alt={cat.title} className="product-image w-full h-64 lg:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-heading text-xl font-semibold">{cat.title}</p>
                <p className="text-sm opacity-80">{cat.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products }: { products: Product[] }) {
  const displayProducts = products.length > 0 ? products.slice(0, 4) : [];

  const fallbackProducts: Product[] = [
    { id: '1', title: 'Savanna Sunset', handle: 'savanna-sunset', featuredImage: { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop' }, priceRange: { minVariantPrice: { amount: '45', currencyCode: 'USD' } }, variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/1', availableForSale: true } }] }, tags: ['Bestseller'] },
    { id: '2', title: 'Cape Town Elegance', handle: 'cape-town-elegance', featuredImage: { url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop' }, priceRange: { minVariantPrice: { amount: '38', currencyCode: 'USD' } }, variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/2', availableForSale: true } }] }, tags: ['New'] },
    { id: '3', title: 'Lagos Luxe', handle: 'lagos-luxe', featuredImage: { url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop' }, priceRange: { minVariantPrice: { amount: '52', currencyCode: 'USD' } }, variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/3', availableForSale: true } }] }, tags: [] },
    { id: '4', title: 'Nairobi Nights', handle: 'nairobi-nights', featuredImage: { url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop' }, priceRange: { minVariantPrice: { amount: '48', currencyCode: 'USD' } }, variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/4', availableForSale: true } }] }, tags: ['Limited'] },
  ];

  const productsToShow = displayProducts.length > 0 ? displayProducts : fallbackProducts;

  return (
    <section id="products" className="py-16 lg:py-24 bg-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h3 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal">Bestsellers</h3>
            <p className="text-warmgray mt-2">Our most loved styles</p>
          </div>
          <a href="/collections/all" className="text-rose font-semibold hover:text-rose-dark transition-colors flex items-center gap-2 no-underline">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {productsToShow.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-gold-light/30 rounded-3xl"></div>
            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=700&fit=crop" alt="Brand story" className="relative rounded-3xl w-full h-[400px] lg:h-[500px] object-cover" />
            <div className="absolute -bottom-6 -right-6 bg-charcoal text-white rounded-2xl px-6 py-4 shadow-xl">
              <p className="font-heading text-2xl font-bold">10K+</p>
              <p className="text-sm opacity-80">Happy Customers</p>
            </div>
          </div>
          <div className="lg:pl-8">
            <span className="text-gold-dark text-sm font-semibold tracking-widest uppercase">Our Story</span>
            <h3 className="font-heading text-3xl lg:text-4xl font-bold mt-4 mb-6 text-charcoal">
              Rooted in Africa,<br />
              <span className="text-rose">Crafted with Love</span>
            </h3>
            <p className="text-warmgray leading-relaxed mb-6">
              Eulyne was born from a desire to merge the rich artistic traditions of Africa with modern luxury beauty. Each set of press-on nails is handcrafted by skilled artisans, featuring authentic African patterns and vibrant colors that tell stories of our heritage.
            </p>
            <p className="text-warmgray leading-relaxed mb-8">
              We believe every woman deserves to feel confident and beautiful. Our nails are more than accessories — they're a celebration of culture, artistry, and self-expression.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-rose">100%</p>
                <p className="text-sm text-warmgray">Handcrafted</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-rose">14+</p>
                <p className="text-sm text-warmgray">African Countries</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-3xl font-bold text-rose">Cruelty</p>
                <p className="text-sm text-warmgray">Free</p>
              </div>
            </div>
            <a href="/pages/about" className="inline-flex items-center gap-2 text-rose font-semibold hover:text-rose-dark transition-colors no-underline">
              Learn More About Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { name: 'Amara K.', location: 'Los Angeles, CA', text: 'These nails are absolutely stunning! The quality is incredible and they last for weeks.', initial: 'A' },
    { name: 'Jasmine T.', location: 'Atlanta, GA', text: 'Finally found luxury nails that align with my values! The African-inspired designs are gorgeous.', initial: 'J' },
    { name: 'Michelle R.', location: 'New York, NY', text: "As a nail tech, I'm picky about quality. Eulyne's press-ons are the best I've used.", initial: 'M' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-blush-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-charcoal">What Our Customers Say</h3>
          <p className="text-warmgray">Join thousands of happy customers worldwide</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(j => (
                  <svg key={j} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-warmgray mb-6 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blush-dark flex items-center justify-center text-white font-bold">{t.initial}</div>
                <div>
                  <p className="font-semibold text-charcoal">{t.name}</p>
                  <p className="text-sm text-warmgray">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="py-16 lg:py-24 bg-charcoal text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="font-heading text-3xl lg:text-4xl font-bold mb-4">Join the Eulyne Family</h3>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">
          Subscribe for exclusive access to new collections, special offers, and beauty tips. Get 15% off your first order!
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold" />
          <button type="submit" className="px-8 py-4 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-colors">
            Subscribe
          </button>
        </form>
        <p className="text-xs text-white/50 mt-4">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-cream py-16 border-t border-blush-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-heading text-2xl font-bold mb-4"><span className="gradient-text">EULYNE</span></h4>
            <p className="text-sm text-warmgray mb-6">Luxury press-on nails rooted in African heritage. Handcrafted with love.</p>
            <div className="flex gap-4">
              <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-blush-light flex items-center justify-center hover:bg-blush-dark transition-colors no-underline" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://tiktok.com" className="w-10 h-10 rounded-full bg-blush-light flex items-center justify-center hover:bg-blush-dark transition-colors no-underline" aria-label="TikTok">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">Shop</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><a href="/collections/all" className="hover:text-rose transition-colors no-underline">All Products</a></li>
              <li><a href="/collections/press-on" className="hover:text-rose transition-colors no-underline">Press-On Nails</a></li>
              <li><a href="/collections/nail-charms" className="hover:text-rose transition-colors no-underline">Nail Charms</a></li>
              <li><a href="/collections/gel" className="hover:text-rose transition-colors no-underline">Gel Extensions</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">Help</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><a href="/pages/faq" className="hover:text-rose transition-colors no-underline">FAQ</a></li>
              <li><a href="/pages/shipping" className="hover:text-rose transition-colors no-underline">Shipping</a></li>
              <li><a href="/pages/returns" className="hover:text-rose transition-colors no-underline">Returns</a></li>
              <li><a href="/pages/contact" className="hover:text-rose transition-colors no-underline">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">About</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><a href="/pages/about" className="hover:text-rose transition-colors no-underline">Our Story</a></li>
              <li><a href="/pages/journal" className="hover:text-rose transition-colors no-underline">Journal</a></li>
              <li><a href="/pages/sustainability" className="hover:text-rose transition-colors no-underline">Sustainability</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blush-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warmgray">© 2024 Eulyne. All rights reserved. Made with ❤️ in Africa.</p>
          <div className="flex items-center gap-4 text-sm text-warmgray">
            <a href="/pages/privacy" className="hover:text-rose transition-colors no-underline">Privacy Policy</a>
            <a href="/pages/terms" className="hover:text-rose transition-colors no-underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = `query GetProducts { products(first: 10) { edges { node { ${PRODUCT_FIELDS} } } } }`;
        const data = await shopifyFetch(query);
        if (data?.products?.edges) {
          setProducts(data.products.edges.map((edge: any) => edge.node));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts products={products} />
        <BrandStory />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
