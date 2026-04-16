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
  description
  descriptionHtml
  featuredImage {
    url
    altText
  }
  images(first: 10) {
    edges {
      node {
        url
        altText
      }
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 20) {
    edges {
      node {
        id
        title
        price {
          amount
          currencyCode
        }
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
  }
  tags
`;

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  featuredImage?: {url: string; altText?: string};
  images?: {edges: Array<{node: {url: string; altText?: string}}>};
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  variants: {edges: Array<{node: {id: string; title: string; price: {amount: string; currencyCode: string}; availableForSale: boolean; selectedOptions: Array<{name: string; value: string}>}}>};
  tags?: string[];
  options?: Array<{name: string; values: string[]}>;
}

function formatPrice(amount: string, currencyCode: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
}

export default function ProductDetail() {
  const {handle} = useParams<{handle: string}>();
  const {linesAdd} = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!handle) return;
      try {
        const query = `query GetProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;
        const data = await shopifyFetch(query, {handle});
        if (data?.product) {
          setProduct(data.product);
          setSelectedVariant(data.product.variants.edges[0]?.node);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [handle]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await linesAdd([{merchandiseId: selectedVariant.id, quantity}]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blush flex items-center justify-center">
        <p className="text-warmgray">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-blush flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold mb-4 text-charcoal">Product not found</h2>
          <Link to="/products" className="text-rose font-semibold">Back to Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.edges?.map((e: any) => e.node) || [];
  const mainImage = product.featuredImage?.url || images[0]?.url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=800&fit=crop';
  const currentPrice = selectedVariant?.price?.amount || product.priceRange.minVariantPrice.amount;
  const currentCurrency = selectedVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode;

  const fallbackProduct = {
    id: '1',
    title: 'Savanna Sunset',
    handle: 'savanna-sunset',
    description: 'Handcrafted luxury press-on nails with African-inspired patterns.',
    descriptionHtml: '<p>Handcrafted luxury press-on nails with African-inspired patterns. 24 pieces, reusable up to 3 times.</p>',
    featuredImage: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=800&fit=crop', altText: 'Savanna Sunset'},
    images: {edges: [
      {node: {url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=800&fit=crop', altText: 'Main'}},
      {node: {url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&h=800&fit=crop', altText: 'Detail'}},
    ]},
    priceRange: {minVariantPrice: {amount: '45', currencyCode: 'USD'}},
    variants: {edges: [{node: {id: 'gid://shopify/ProductVariant/1', title: 'Default', price: {amount: '45', currencyCode: 'USD'}, availableForSale: true, selectedOptions: [{name: 'Size', value: 'Medium'}]}}]},
    tags: ['Bestseller'],
    options: [{name: 'Size', values: ['Short', 'Medium', 'Long']}],
  };

  const displayProduct = product.handle ? product : fallbackProduct;
  const displayImages = images.length > 0 ? images : (fallbackProduct.images?.edges?.map((e: any) => e.node) || []);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-blush-light py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/products" className="text-warmgray hover:text-rose transition-colors flex items-center gap-2 no-underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-blush">
              <img src={mainImage} alt={displayProduct.title} className="w-full h-[400px] lg:h-[600px] object-cover" />
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {displayImages.slice(0, 4).map((img: any, i: number) => (
                  <button key={i} className="rounded-xl overflow-hidden border-2 border-transparent hover:border-rose transition-colors">
                    <img src={img.url} alt={img.altText || `Image ${i + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:pl-8">
            <nav className="text-sm text-warmgray mb-4">
              <Link to="/" className="hover:text-rose no-underline">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/products" className="hover:text-rose no-underline">Products</Link>
              <span className="mx-2">/</span>
              <span>{displayProduct.title}</span>
            </nav>

            <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-4 text-charcoal">{displayProduct.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-charcoal">{formatPrice(currentPrice, currentCurrency)}</span>
              {displayProduct.tags?.includes('Bestseller') && (
                <span className="bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">Bestseller</span>
              )}
            </div>

            <div className="text-warmgray leading-relaxed mb-8" dangerouslySetInnerHTML={{__html: displayProduct.descriptionHtml || displayProduct.description}} />

            {displayProduct.options?.[0]?.values?.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-charcoal">{displayProduct.options[0].name}</label>
                <div className="flex flex-wrap gap-3">
                  {displayProduct.options[0].values.map((value: string) => (
                    <button
                      key={value}
                      onClick={() => {
                        const variant = displayProduct.variants.edges.find((e: any) => e.node.selectedOptions?.[0]?.value === value);
                        if (variant) setSelectedVariant(variant.node);
                      }}
                      className={`px-4 py-2 rounded-full border-2 transition-colors ${
                        selectedVariant?.selectedOptions?.[0]?.value === value
                          ? 'border-rose bg-rose/10 text-rose'
                          : 'border-gray-200 hover:border-rose text-charcoal'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3 text-charcoal">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blush-light transition-colors text-charcoal"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blush-light transition-colors text-charcoal"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
              className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
                selectedVariant?.availableForSale
                  ? added ? 'bg-green-500 text-white' : 'bg-rose text-white hover:bg-rose-dark'
                  : 'bg-gray-200 text-warmgray cursor-not-allowed'
              }`}
            >
              {added ? 'Added to Cart!' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
            </button>

            <div className="mt-8 pt-8 border-t border-blush-light">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-charcoal">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4h1l.6 3h11.8l.6-3h1l-1 5H4l-1-5z"/>
                  </svg>
                  <span className="text-sm text-charcoal">Free Shipping $75+</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-charcoal">Reusable 3x</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm text-charcoal">Cruelty Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
