import {Link} from 'react-router-dom';

export default function CollectionsPage() {
  const collections = [
    {handle: 'press-on', title: 'Press-On Sets', subtitle: '24 pieces', image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=800&fit=crop'},
    {handle: 'nail-charms', title: 'Nail Charms', subtitle: 'Handmade', image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=800&fit=crop'},
    {handle: 'gel', title: 'Gel Extensions', subtitle: 'Professional', image: 'https://images.unsplash.com/photo-1610992015732-2449b0dd2b8f?w=600&h=800&fit=crop'},
    {handle: 'accessories', title: 'Accessories', subtitle: 'Tools & more', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=800&fit=crop'},
  ];

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
        <h1 className="font-heading text-3xl lg:text-5xl font-bold mb-4 text-charcoal text-center">Our Collections</h1>
        <p className="text-warmgray text-center mb-12">Explore our curated collections of luxury press-on nails</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.handle}
              to={`/collections/${collection.handle}`}
              className="product-card group relative rounded-2xl overflow-hidden block no-underline"
            >
              <img
                src={collection.image}
                alt={collection.title}
                className="product-image w-full h-64 lg:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-heading text-xl font-semibold">{collection.title}</p>
                <p className="text-sm opacity-80">{collection.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
