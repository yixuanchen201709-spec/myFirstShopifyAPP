import {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
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
          <span className="font-bold text-lg text-charcoal">
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

const collectionData: Record<string, {title: string; description: string; image: string; products: Product[]}> = {
  'press-on': {
    title: 'Press-On Sets',
    description: 'Our signature collection of handcrafted press-on nails, inspired by African artistry.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop',
    products: [
      {id: '1', title: 'Savanna Sunset', handle: 'savanna-sunset', featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '45', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/1', availableForSale: true}}]}, tags: ['Bestseller']},
      {id: '4', title: 'Nairobi Nights', handle: 'nairobi-nights', featuredImage: {url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '48', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/4', availableForSale: true}}]}, tags: ['Limited']},
      {id: '5', title: 'Mombasa Magic', handle: 'mombasa-magic', featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&hue=30'}, priceRange: {minVariantPrice: {amount: '42', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/5', availableForSale: true}}]}, tags: ['New']},
      {id: '6', title: 'Victoria Falls', handle: 'victoria-falls', featuredImage: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '55', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/6', availableForSale: true}}]}, tags: ['Bestseller']},
    ],
  },
  'nail-charms': {
    title: 'Nail Charms',
    description: 'Exquisite nail charms handcrafted by African artisans.',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop',
    products: [
      {id: '2', title: 'Cape Town Elegance', handle: 'cape-town-elegance', featuredImage: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '38', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/2', availableForSale: true}}]}, tags: ['New']},
      {id: '7', title: 'Sahara Gold', handle: 'sahara-gold', featuredImage: {url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop&sat=-30'}, priceRange: {minVariantPrice: {amount: '49', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/7', availableForSale: true}}]}, tags: []},
    ],
  },
  'gel': {
    title: 'Gel Extensions',
    description: 'Professional quality gel extensions for salon-quality nails at home.',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=600&h=800&fit=crop',
    products: [
      {id: '3', title: 'Lagos Luxe', handle: 'lagos-luxe', featuredImage: {url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '52', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/3', availableForSale: true}}]}, tags: []},
      {id: '8', title: 'Kilimanjaro Dream', handle: 'kilimanjaro-dream', featuredImage: {url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop&hue=60'}, priceRange: {minVariantPrice: {amount: '58', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/8', availableForSale: true}}]}, tags: ['Limited']},
    ],
  },
  'accessories': {
    title: 'Accessories',
    description: 'Essential tools and accessories for your nail care routine.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop',
    products: [],
  },
};

export default function CollectionDetail() {
  const {handle} = useParams<{handle: string}>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const collection = collectionData[handle || ''] || {
    title: handle || 'Collection',
    description: 'Explore our collection.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop',
    products: [],
  };

  useEffect(() => {
    async function fetchProducts() {
      if (!handle) return;
      try {
        const query = `query GetProductsByCollection { products(first: 20, query: "collection:${handle}") { edges { node { ${PRODUCT_FIELDS} } } } }`;
        const data = await shopifyFetch(query);
        if (data?.products?.edges?.length > 0) {
          setProducts(data.products.edges.map((edge: any) => edge.node));
        } else {
          setProducts(collectionData[handle]?.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts(collectionData[handle]?.products || []);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [handle]);

  const displayProducts = products.length > 0 ? products : collection.products;

  return (
    <div className="min-h-screen bg-blush">
      <header className="bg-white border-b border-blush-light py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/collections" className="text-warmgray hover:text-rose transition-colors flex items-center gap-2 no-underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Collections
            </Link>
            <Link to="/" className="font-heading text-2xl font-bold">
              <span className="gradient-text">EULYNE</span>
            </Link>
            <Link to="/cart" className="p-2 hover:text-rose transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative h-64 lg:h-80 overflow-hidden">
        <img src={collection.image} alt={collection.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-2">{collection.title}</h1>
          <p className="text-white/80">{collection.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-warmgray">Loading products...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-warmgray text-lg mb-4">No products in this collection yet.</p>
            <Link to="/products" className="text-rose font-semibold hover:text-rose-dark">Browse all products →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
