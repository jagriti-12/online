'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Calendar, Tag, Clock, ArrowRight } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  discountAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOfferExpiring = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Special Offers & Promotions
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Don't miss out on these amazing deals! Save big on your favorite cosmetics.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {offers.length > 0 ? (
          <>
            {/* Active Offers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Current Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Offer Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <Tag className="h-6 w-6" />
                        {offer.endDate && isOfferExpiring(offer.endDate) && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Ending Soon
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                      <div className="text-3xl font-bold">
                        {offer.discountPercentage > 0 && `${offer.discountPercentage}% OFF`}
                        {offer.discountAmount && `$${offer.discountAmount} OFF`}
                      </div>
                    </div>

                    {/* Offer Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {offer.description}
                      </p>

                      {/* Offer Dates */}
                      {(offer.startDate || offer.endDate) && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {offer.startDate && `From ${formatDate(offer.startDate)}`}
                            {offer.startDate && offer.endDate && ' - '}
                            {offer.endDate && `Until ${formatDate(offer.endDate)}`}
                          </span>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Link
                        href="/browse"
                        className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center group"
                      >
                        Shop Now
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Never Miss a Deal!</h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter and be the first to know about exclusive offers, 
                flash sales, and new product launches.
              </p>
              <div className="max-w-md mx-auto flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Offers Available */
          <div className="text-center py-16">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Offers</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We don't have any active promotions right now, but check back soon for amazing deals!
            </p>
            <div className="space-y-4">
              <Link
                href="/browse"
                className="inline-block bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition-colors"
              >
                Browse Products
              </Link>
              <div className="text-sm text-gray-500">
                <p>Want to be notified about future offers?</p>
                <button className="text-pink-600 hover:text-pink-700 font-medium">
                  Subscribe to our newsletter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Our Offers Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Browse Offers</h4>
              <p className="text-gray-600 text-sm">
                Check this page regularly for the latest deals and promotions on your favorite products.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Shop Qualifying Items</h4>
              <p className="text-gray-600 text-sm">
                Add eligible products to your cart. Discounts are automatically applied at checkout.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Save Money</h4>
              <p className="text-gray-600 text-sm">
                Enjoy your savings! Keep an eye out for limited-time flash sales and exclusive deals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}