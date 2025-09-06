'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ProductCard from '@/components/ProductCard';
import { Star, Truck, Shield, Headphones } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  imageUrl: string;
  stock: number;
  categoryName: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      const productsResponse = await fetch('/api/products?featured=true&limit=8');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setFeaturedProducts(productsData.products);
      }

      // Fetch offers
      const offersResponse = await fetch('/api/offers');
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        setOffers(offersData.offers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        alert('Product added to cart successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your Perfect Look
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Premium wholesale cosmetics for beauty professionals and enthusiasts. 
              From vibrant lipsticks to flawless foundations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/browse"
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/offers"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-colors"
              >
                View Offers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">100% authentic products guaranteed</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Customer support available anytime</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Top Rated</h3>
              <p className="text-gray-600 text-sm">Rated 4.9/5 by our customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Offers */}
      {offers.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-orange-400 to-pink-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Special Offers
              </h2>
              <p className="text-white text-lg">
                Don't miss out on these amazing deals!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-pink-600">
                      {offer.discountPercentage}% OFF
                    </span>
                    <Link
                      href="/browse"
                      className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-lg">
              Discover our most popular cosmetics
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/browse"
              className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products, 
            exclusive offers, and beauty tips.
          </p>
          <div className="max-w-md mx-auto">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('newsletter') as HTMLInputElement;
                const email = input.value.trim();
                if (!email) return;
                try {
                  const res = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    alert('Subscribed! Check your email for confirmation.');
                    input.value = '';
                  } else {
                    alert(data.error || 'Subscription failed');
                  }
                } catch {
                  alert('Network error');
                }
              }}
              className="flex gap-3 items-stretch"
            >
              <input
                name="newsletter"
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full text-gray-900 placeholder-gray-400 bg-white shadow-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300"
              />
              <button
                type="submit"
                className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition-colors shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">GlamourCosmetics</h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for premium wholesale cosmetics. 
                Quality products for beauty professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/browse" className="hover:text-white">Browse Products</Link></li>
                <li><Link href="/offers" className="hover:text-white">Special Offers</Link></li>
                <li><Link href="/location" className="hover:text-white">Store Location</Link></li>
                <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/browse?category=Lipsticks" className="hover:text-white">Lipsticks</Link></li>
                <li><Link href="/browse?category=Foundation" className="hover:text-white">Foundation</Link></li>
                <li><Link href="/browse?category=Eyeshadow" className="hover:text-white">Eyeshadow</Link></li>
                <li><Link href="/browse?category=Mascara" className="hover:text-white">Mascara</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@glamourcosmetics.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Beauty St, Cosmetic City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 GlamourCosmetics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
