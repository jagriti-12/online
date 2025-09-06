# GlamourCosmetics - E-commerce Website

A full-stack e-commerce website for a wholesale cosmetics shop built with Next.js, TypeScript, and SQLite.

## Features

### User Features
- **User Authentication**: Secure signup and login with JWT tokens
- **Product Browsing**: Browse products with filtering by category, brand, and price
- **Search Functionality**: Search products by name, description, or brand
- **Shopping Cart**: Add, edit, and remove items from cart
- **Offers & Promotions**: View current deals and discounts
- **Store Locations**: Find store locations and check delivery availability
- **User Account**: Manage profile, view order history, and account settings

### Owner Features
- **Owner Dashboard**: Secure area for managing products and offers (to be implemented)
- **Product Management**: Add, edit, and delete products
- **Offer Management**: Create and manage promotional offers

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT (JSON Web Tokens)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd online-shop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

4. Initialize the database:
The database will be automatically created and seeded when you first run the application.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product endpoints
│   │   ├── cart/          # Shopping cart endpoints
│   │   └── offers/        # Offers endpoints
│   ├── browse/            # Product browsing page
│   ├── cart/              # Shopping cart page
│   ├── login/             # Login page
│   ├── signup/            # Registration page
│   ├── offers/            # Offers page
│   ├── location/          # Store locations page
│   ├── account/           # User account page
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Main navigation component
│   └── ProductCard.tsx    # Product display component
└── lib/                   # Utility libraries
    ├── database.ts        # Database connection and schema
    └── auth.ts            # Authentication utilities
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get products with filtering and pagination
- Query parameters: `category`, `brand`, `search`, `featured`, `limit`, `offset`

### Shopping Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity

### Offers
- `GET /api/offers` - Get active promotional offers

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Order history
- `order_items` - Order line items
- `offers` - Promotional offers

## Sample Data

The application comes with sample data including:
- 5 product categories (Lipsticks, Lip Liners, Foundation, Eyeshadow, Mascara)
- 5 sample products with different brands
- 2 promotional offers

## Features Implemented

✅ **User Authentication**: Secure signup and login with JWT tokens
✅ **Product Browsing**: Browse products with filtering by category, brand, and price
✅ **Shopping Cart**: Add, edit, and remove items from cart with real-time updates
✅ **Checkout Process**: Complete checkout flow with shipping and payment forms
✅ **Order Management**: Order placement, confirmation, and success pages
✅ **Offers & Promotions**: View current deals and discounts
✅ **Store Locations**: Find store locations and check delivery availability
✅ **User Account**: Manage profile, view order history, and account settings
✅ **Owner Dashboard**: Secure admin area for managing products and offers
✅ **Product Management**: Add, edit, and delete products (admin only)
✅ **Offer Management**: Create and manage promotional offers (admin only)
✅ **Responsive Design**: Mobile-friendly interface
✅ **Navigation**: Intuitive navigation with cart counter and user dropdown
✅ **Database Integration**: SQLite database with proper relationships

## Upcoming Features

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Payment gateway integration
- [ ] Order tracking system
- [ ] Inventory management alerts
- [ ] Sales analytics and reporting

## Design Guidelines

The application follows a vibrant color palette suitable for the cosmetics industry:
- Primary colors: Pink (#EC4899) and Purple (#8B5CF6)
- Clean, minimalistic design for easy navigation
- Grid layout for product displays
- Responsive design for mobile and desktop

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.