import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '@shopify/hydrogen-react';

async function shopifyFetch(query: string, variables: Record<string, any> = {}) {
  const response = await fetch('https://sp0s1i-ca.myshopify.com/api/2024-10/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '45f3c7d3cd11271f89e2e380499f1c49',
    },
    body: JSON.stringify({query, variables}),
  });
  const json = await response.json();
  return json.data;
}

const PRODUCT_FIELDS = `
  id
  title
  handle
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
        availableForSale
      }
    }
  }
  tags
`;

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string};
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  variants: {edges: Array<{node: {id: string; availableForSale: boolean}}>};
  tags?: string[];
}

function formatPrice(amount: string, currencyCode: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
}

function ProductCard({product}: {product: Product}) {
  const {linesAdd} = useCart();
  const [added, setAdded] = useState(false);

  const firstVariant = product.variants.edges[0]?.node;
  const isAvailable = firstVariant?.availableForSale ?? true;
  const imageUrl = product.featuredImage?.url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop';
  const badge = product.tags?.find(t => ['Bestseller', 'New', 'Limited', 'Sale'].includes(t));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant || !isAvailable) return;
    await linesAdd([{merchandiseId: firstVariant.id, quantity: 1}]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/products/${product.handle}`} className="product-card bg-white rounded-2xl overflow-hidden shadow-sm block no-underline">
      <div className="relative">
        <img src={imageUrl} alt={product.title} className="w-full h-56 lg:h-72 object-cover" />
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
          <span className="font-bold text-lg">
            {formatPrice(product.priceRange?.minVariantPrice?.amount || '0', product.priceRange?.minVariantPrice?.currencyCode)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isAvailable
                ? added ? 'bg-green-500 text-white' : 'bg-rose text-white hover:bg-rose-dark'
                : 'bg-gray-200 text-warmgray cursor-not-allowed'
            }`}
          >
            {added ? 'Added!' : isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Homepage() {
  const {totalQuantity} = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = `query GetProducts { products(first: 8) { edges { node { ${PRODUCT_FIELDS} } } } }`;
        const data = await shopifyFetch(query);
        if (data?.products?.edges) {
          setProducts(data.products.edges.map((edge: any) => edge.node));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    }
    fetchProducts();
  }, []);

  const fallbackProducts: Product[] = [
    {id: '1', title: 'Savanna Sunset', handle: 'savanna-sunset', featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '45', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/1', availableForSale: true}}]}, tags: ['Bestseller']},
    {id: '2', title: 'Cape Town Elegance', handle: 'cape-town-elegance', featuredImage: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '38', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/2', availableForSale: true}}]}, tags: ['New']},
    {id: '3', title: 'Lagos Luxe', handle: 'lagos-luxe', featuredImage: {url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '52', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/3', availableForSale: true}}]}, tags: []},
    {id: '4', title: 'Nairobi Nights', handle: 'nairobi-nights', featuredImage: {url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '48', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/4', availableForSale: true}}]}, tags: ['Limited']},
  ];

  const displayProducts = products.length > 0 ? products.slice(0, 4) : fallbackProducts;

  return (
    <>
      <AnnouncementBar />
      <Header totalQuantity={totalQuantity} />
      <main>
        <HeroSection />
        <CategoryGrid />
        <section id="products" className="py-16 lg:py-24 bg-blush">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
              <div>
                <h3 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal">Bestsellers</h3>
                <p className="text-warmgray mt-2">Our most loved styles</p>
              </div>
              <Link to="/products" className="text-rose font-semibold hover:text-rose-dark transition-colors flex items-center gap-2 no-underline">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
        <BrandStory />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

function Header({totalQuantity}: {totalQuantity?: number}) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blush-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/products" className="font-medium text-sm hover:text-rose transition-colors no-underline">SHOP</Link>
            <Link to="/collections" className="font-medium text-sm hover:text-rose transition-colors no-underline">COLLECTIONS</Link>
            <Link to="/pages/about" className="font-medium text-sm hover:text-rose transition-colors no-underline">ABOUT</Link>
          </nav>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto">
            <h1 className="font-heading text-2xl lg:text-3xl font-bold tracking-wide">
              <span className="gradient-text">EULYNE</span>
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-rose transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <Link to="/account" className="p-2 hover:text-rose transition-colors" aria-label="Account">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </Link>
            <Link to="/cart" className="p-2 hover:text-rose transition-colors relative" aria-label="Cart">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
              {totalQuantity && totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-white text-xs rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </Link>
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
              Handcrafted press-on nails inspired by the vibrant colors and patterns of African artistry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products" className="btn-primary inline-flex items-center justify-center gap-2 bg-rose text-white px-8 py-4 rounded-full font-semibold no-underline">
                Shop Collection
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link to="/pages/about" className="inline-flex items-center justify-center gap-2 bg-white text-charcoal px-8 py-4 rounded-full font-semibold border-2 border-blush-dark hover:border-rose hover:text-rose transition-colors no-underline">
                Our Story
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gold-light/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blush-dark/40 rounded-full blur-2xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-float">
              <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop" alt="Luxury press-on nails" className="w-full h-[400px] lg:h-[500px] object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  const categories = [
    {src: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop', title: 'Press-On Sets', subtitle: '24 pieces', href: '/collections/press-on'},
    {src: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=500&fit=crop', title: 'Nail Charms', subtitle: 'Handmade', href: '/collections/nail-charms'},
    {src: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=500&fit=crop', title: 'Gel Extensions', subtitle: 'Professional', href: '/collections/gel'},
    {src: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=500&fit=crop', title: 'Accessories', subtitle: 'Tools & more', href: '/collections/accessories'},
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-charcoal">Shop by Category</h3>
          <p className="text-warmgray max-w-xl mx-auto">Find your perfect style</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.href} className="product-card group relative rounded-2xl overflow-hidden block no-underline">
              <img src={cat.src} alt={cat.title} className="product-image w-full h-64 lg:h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-heading text-xl font-semibold">{cat.title}</p>
                <p className="text-sm opacity-80">{cat.subtitle}</p>
              </div>
            </Link>
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
              Eulyne was born from a desire to merge the rich artistic traditions of Africa with modern luxury beauty.
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
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {name: 'Amara K.', location: 'Los Angeles, CA', text: 'These nails are absolutely stunning!', initial: 'A'},
    {name: 'Jasmine T.', location: 'Atlanta, GA', text: 'Finally found luxury nails that align with my values!', initial: 'J'},
    {name: 'Michelle R.', location: 'New York, NY', text: "Eulyne's press-ons are the best I've used.", initial: 'M'},
  ];

  return (
    <section className="py-16 lg:py-24 bg-blush-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-charcoal">What Our Customers Say</h3>
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
          Subscribe for exclusive access to new collections and get 15% off your first order!
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold" />
          <button type="submit" className="px-8 py-4 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-colors">
            Subscribe
          </button>
        </form>
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
            <p className="text-sm text-warmgray mb-6">Luxury press-on nails rooted in African heritage.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">Shop</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><Link to="/products" className="hover:text-rose transition-colors no-underline">All Products</Link></li>
              <li><Link to="/collections" className="hover:text-rose transition-colors no-underline">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">Help</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><a href="/pages/faq" className="hover:text-rose transition-colors no-underline">FAQ</a></li>
              <li><a href="/pages/shipping" className="hover:text-rose transition-colors no-underline">Shipping</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-charcoal">About</h5>
            <ul className="space-y-3 text-sm text-warmgray">
              <li><a href="/pages/about" className="hover:text-rose transition-colors no-underline">Our Story</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blush-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warmgray">© 2024 Eulyne. Made with ❤️ in Africa.</p>
        </div>
      </div>
    </footer>
  );
}
