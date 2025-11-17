# TrendBite Admin Panel

A modern, responsive admin panel for the TrendBite e-commerce platform built with React, Vite, and Tailwind CSS.

## Features

- 🔐 **Authentication System** - Secure login with JWT tokens
- 📊 **Dashboard Overview** - Real-time statistics and analytics
- 👥 **User Management** - Complete user CRUD operations
- 📦 **Product Management** - Product catalog management
- 🛒 **Order Management** - Order tracking and management
- 📂 **Category Management** - Product categorization
- ⭐ **Review Management** - Review moderation system
- 💰 **Discount Management** - Promotional codes and discounts
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Clean and intuitive interface

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TrendBite_Admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: admin@trendbite.com
- **Password**: admin123

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   ├── Dashboard/      # Dashboard components
│   ├── Users/          # User management components
│   ├── Products/       # Product management components
│   └── Login.jsx       # Login component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── services/           # API services
│   └── api.js          # API configuration and endpoints
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## API Integration

The admin panel integrates with the TrendBite API endpoints documented in `API_ENDPOINTS_DOCUMENTATION.md`. All API calls are configured in `src/services/api.js` with proper error handling and authentication.

### Available Endpoints

- **Authentication**: Login, logout
- **Users**: CRUD operations, role management
- **Products**: Product management, image uploads
- **Orders**: Order tracking, status updates
- **Categories**: Category management
- **Reviews**: Review moderation
- **Discounts**: Promotional code management

## Features Overview

### Dashboard
- Real-time statistics
- Recent activity feed
- Quick action buttons
- Revenue overview charts

### User Management
- User listing with pagination
- Search and filtering
- Role management (Admin/Customer)
- User activation/deactivation
- User deletion

### Product Management
- Product grid view
- Search and category filtering
- Product status management
- Stock level monitoring
- Image management

## Styling

The project uses Tailwind CSS with a custom design system:
- **Primary Colors**: Blue theme
- **Secondary Colors**: Gray scale
- **Status Colors**: Success (green), Warning (yellow), Danger (red)
- **Components**: Custom button, input, and card components

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project follows React best practices:
- Functional components with hooks
- Context API for state management
- Custom hooks for reusable logic
- Proper error handling
- Responsive design principles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.