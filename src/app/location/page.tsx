'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { MapPin, Clock, Phone, Mail, Truck, Store, Navigation as NavigationIcon } from 'lucide-react';

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  hours: {
    [key: string]: string;
  };
  services: string[];
}

export default function LocationPage() {
  const [selectedLocation, setSelectedLocation] = useState<number>(1);
  const [deliveryZip, setDeliveryZip] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  const storeLocations: StoreLocation[] = [
    {
      id: 1,
      name: 'GlamourCosmetics Downtown',
      address: '123 Beauty Street',
      city: 'Cosmetic City',
      state: 'CA',
      zipCode: '90210',
      phone: '(555) 123-4567',
      email: 'downtown@glamourcosmetics.com',
      hours: {
        'Monday': '9:00 AM - 8:00 PM',
        'Tuesday': '9:00 AM - 8:00 PM',
        'Wednesday': '9:00 AM - 8:00 PM',
        'Thursday': '9:00 AM - 8:00 PM',
        'Friday': '9:00 AM - 9:00 PM',
        'Saturday': '10:00 AM - 9:00 PM',
        'Sunday': '11:00 AM - 6:00 PM'
      },
      services: ['In-store pickup', 'Beauty consultations', 'Product testing', 'Returns & exchanges']
    },
    {
      id: 2,
      name: 'GlamourCosmetics Mall Location',
      address: '456 Shopping Center Blvd',
      city: 'Fashion District',
      state: 'CA',
      zipCode: '90211',
      phone: '(555) 234-5678',
      email: 'mall@glamourcosmetics.com',
      hours: {
        'Monday': '10:00 AM - 9:00 PM',
        'Tuesday': '10:00 AM - 9:00 PM',
        'Wednesday': '10:00 AM - 9:00 PM',
        'Thursday': '10:00 AM - 9:00 PM',
        'Friday': '10:00 AM - 10:00 PM',
        'Saturday': '10:00 AM - 10:00 PM',
        'Sunday': '12:00 PM - 7:00 PM'
      },
      services: ['In-store pickup', 'Beauty consultations', 'Product testing', 'Gift wrapping']
    },
    {
      id: 3,
      name: 'GlamourCosmetics Warehouse',
      address: '789 Industrial Way',
      city: 'Commerce City',
      state: 'CA',
      zipCode: '90212',
      phone: '(555) 345-6789',
      email: 'warehouse@glamourcosmetics.com',
      hours: {
        'Monday': '8:00 AM - 5:00 PM',
        'Tuesday': '8:00 AM - 5:00 PM',
        'Wednesday': '8:00 AM - 5:00 PM',
        'Thursday': '8:00 AM - 5:00 PM',
        'Friday': '8:00 AM - 5:00 PM',
        'Saturday': 'Closed',
        'Sunday': 'Closed'
      },
      services: ['Bulk orders', 'Wholesale pickup', 'Business consultations']
    }
  ];

  const checkDelivery = () => {
    if (!deliveryZip) {
      setDeliveryResult('Please enter a zip code');
      return;
    }

    // Simple zip code validation (5 digits)
    if (!/^\d{5}$/.test(deliveryZip)) {
      setDeliveryResult('Please enter a valid 5-digit zip code');
      return;
    }

    // Mock delivery check - in real app, this would call an API
    const zipCode = parseInt(deliveryZip);
    if (zipCode >= 90000 && zipCode <= 95000) {
      setDeliveryResult('✅ We deliver to your area! Standard delivery: 2-3 business days, Express: 1-2 business days');
    } else {
      setDeliveryResult('❌ Sorry, we don\'t currently deliver to your area. Please visit one of our store locations.');
    }
  };

  const selectedStore = storeLocations.find(store => store.id === selectedLocation);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Us & Delivery Info
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Visit our stores or check if we deliver to your area
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Store Locations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Store Locations</h2>
            
            {/* Store Selection */}
            <div className="space-y-4 mb-8">
              {storeLocations.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedLocation(store.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedLocation === store.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Store className={`h-5 w-5 mt-1 ${
                      selectedLocation === store.id ? 'text-pink-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600">
                        {store.address}, {store.city}, {store.state} {store.zipCode}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Store Details */}
            {selectedStore && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedStore.name}</h3>
                
                {/* Address */}
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">{selectedStore.address}</p>
                    <p className="text-gray-600">
                      {selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a href={`tel:${selectedStore.phone}`} className="text-pink-600 hover:text-pink-700">
                    {selectedStore.phone}
                  </a>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${selectedStore.email}`} className="text-pink-600 hover:text-pink-700">
                    {selectedStore.email}
                  </a>
                </div>

                {/* Hours */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <h4 className="font-semibold text-gray-900">Store Hours</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedStore.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}:</span>
                        <span className="text-gray-900">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Available Services</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedStore.services.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directions Button */}
                <button className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center">
                  <NavigationIcon className="h-4 w-4 mr-2" />
                  Get Directions
                </button>
              </div>
            )}
          </div>

          {/* Delivery Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Delivery Information</h2>
            
            {/* Delivery Checker */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Delivery Availability</h3>
              <p className="text-gray-600 mb-4">
                Enter your zip code to see if we deliver to your area and view delivery options.
              </p>
              
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={deliveryZip}
                  onChange={(e) => setDeliveryZip(e.target.value)}
                  placeholder="Enter zip code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength={5}
                />
                <button
                  onClick={checkDelivery}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Check
                </button>
              </div>

              {deliveryResult && (
                <div className={`p-4 rounded-lg ${
                  deliveryResult.includes('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {deliveryResult}
                </div>
              )}
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Standard Delivery</h4>
                    <p className="text-sm text-gray-600">2-3 business days • Free on orders over $50</p>
                    <p className="text-sm text-gray-500">$5.99 for orders under $50</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Express Delivery</h4>
                    <p className="text-sm text-gray-600">1-2 business days • $12.99</p>
                    <p className="text-sm text-gray-500">Order by 2 PM for next-day processing</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Store className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">In-Store Pickup</h4>
                    <p className="text-sm text-gray-600">Ready in 2-4 hours • Free</p>
                    <p className="text-sm text-gray-500">Available at all store locations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Areas Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Coverage Areas</h3>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  We currently deliver to zip codes 90000-95000 in California
                </p>
                <p className="text-sm text-gray-500">
                  Expanding to more areas soon! Check back for updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our customer service team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:(555)123-4567"
              className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Call Us: (555) 123-4567
            </a>
            <a
              href="mailto:support@glamourcosmetics.com"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}