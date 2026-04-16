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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = `query GetProducts { products(first: 24) { edges { node { ${PRODUCT_FIELDS} } } } }`;
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

  const fallbackProducts: Product[] = [
    {id: '1', title: 'Savanna Sunset', handle: 'savanna-sunset', featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '45', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/1', availableForSale: true}}]}, tags: ['Bestseller']},
    {id: '2', title: 'Cape Town Elegance', handle: 'cape-town-elegance', featuredImage: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '38', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/2', availableForSale: true}}]}, tags: ['New']},
    {id: '3', title: 'Lagos Luxe', handle: 'lagos-luxe', featuredImage: {url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '52', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/3', availableForSale: true}}]}, tags: []},
    {id: '4', title: 'Nairobi Nights', handle: 'nairobi-nights', featuredImage: {url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop'}, priceRange: {minVariantPrice: {amount: '48', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/4', availableForSale: true}}]}, tags: ['Limited']},
    {id: '5', title: 'Mombasa Magic', handle: 'mombasa-magic', featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&hue=30'}, priceRange: {minVariantPrice: {amount: '42', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/5', availableForSale: true}}]}, tags: ['New']},
    {id: '6', title: 'Victoria Falls', handle: 'victoria-falls', featuredImage: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=400&fit=crop&sat=-20'}, priceRange: {minVariantPrice: {amount: '55', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/6', availableForSale: true}}]}, tags: ['Bestseller']},
    {id: '7', title: 'Sahara Gold', handle: 'sahara-gold', featuredImage: {url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=400&fit=crop&sat=-30'}, priceRange: {minVariantPrice: {amount: '49', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/7', availableForSale: true}}]}, tags: []},
    {id: '8', title: 'Kilimanjaro Dream', handle: 'kilimanjaro-dream', featuredImage: {url: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=400&h=400&fit=crop&hue=60'}, priceRange: {minVariantPrice: {amount: '58', currencyCode: 'USD'}}, variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/8', availableForSale: true}}]}, tags: ['Limited']},
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <div className="min-h-screen bg-blush">
      <header className="bg-white border-b border-blush-light py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-4 text-charcoal">All Products</h1>
        <p className="text-warmgray mb-8">Discover our complete collection of luxury press-on nails</p>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-warmgray">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-warmgray text-lg mb-4">No products available yet.</p>
            <p className="text-sm text-warmgray">Add products in your Shopify Admin to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
