import {Link} from 'react-router-dom';
import {useCart} from '@shopify/hydrogen-react';

function formatPrice(amount: string, currencyCode: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount));
}

export default function CartPage() {
  const {lines, cost, linesRemove, linesUpdate} = useCart();

  if (!lines || lines.length === 0) {
    return (
      <div className="min-h-screen bg-blush py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blush-dark/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
          </div>
          <h2 className="font-heading text-3xl font-bold mb-4 text-charcoal">Your cart is empty</h2>
          <p className="text-warmgray mb-8">Start shopping to add items to your cart.</p>
          <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-rose text-white px-8 py-4 rounded-full font-semibold no-underline">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush">
      <header className="bg-white border-b border-blush-light py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold">
              <span className="gradient-text">EULYNE</span>
            </Link>
            <Link to="/products" className="text-warmgray hover:text-rose transition-colors no-underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-8 text-charcoal">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {lines.map((line: any) => (
              <div key={line.id} className="bg-white rounded-2xl p-4 flex gap-4">
                <img
                  src={line.merchandise?.image?.url || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=200&fit=crop'}
                  alt={line.merchandise?.title || 'Product'}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal">{line.merchandise?.product?.title}</h3>
                  <p className="text-sm text-warmgray">{line.merchandise?.title}</p>
                  <p className="font-bold mt-2 text-charcoal">
                    {formatPrice(line.cost?.totalAmount?.amount || '0', line.cost?.totalAmount?.currencyCode || 'USD')}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => linesRemove(line.id)}
                    className="text-warmgray hover:text-rose transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => linesUpdate(line.id, {quantity: Math.max(0, line.quantity - 1)})}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blush-light transition-colors text-charcoal"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-charcoal">{line.quantity}</span>
                    <button
                      onClick={() => linesUpdate(line.id, {quantity: line.quantity + 1})}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blush-light transition-colors text-charcoal"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold mb-4 text-charcoal">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-warmgray">Subtotal</span>
                  <span className="text-charcoal">{formatPrice(cost?.subtotalAmount?.amount || '0', cost?.subtotalAmount?.currencyCode || 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-blush-light pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg text-charcoal">
                  <span>Total</span>
                  <span>{formatPrice(cost?.totalAmount?.amount || '0', cost?.totalAmount?.currencyCode || 'USD')}</span>
                </div>
              </div>

              <a
                href={lines[0]?.merchandise?.product?.onlineStoreUrl || '#'}
                className="block w-full bg-rose text-white text-center py-4 rounded-full font-semibold hover:bg-rose-dark transition-colors no-underline"
              >
                Checkout
              </a>

              <p className="text-xs text-center text-warmgray mt-4">
                Free shipping on orders $75+
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
