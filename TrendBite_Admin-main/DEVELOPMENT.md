# Development Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open `http://localhost:5173` in your browser
   - Use demo credentials: `admin@trendbite.com` / `admin123`

## API Configuration

The application is configured to connect to a backend API at `http://localhost:3000/api`. 

### Mock Data Fallback

When the backend API is not available, the application automatically falls back to mock data for:
- Dashboard statistics
- User management
- Product management

This allows you to develop and test the frontend without needing a running backend.

### Switching Between Real API and Mock Data

1. **Real API**: Set `baseURL: 'http://localhost:3000/api'` in `src/services/api.js`
2. **Mock Data**: The app automatically uses mock data when API calls fail

## Project Structure

```
src/
├── components/
│   ├── Layout/              # Main layout components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Header.jsx       # Top header
│   │   └── Layout.jsx       # Main layout wrapper
│   ├── Dashboard/           # Dashboard components
│   │   └── DashboardOverview.jsx
│   ├── Users/               # User management
│   │   └── UserManagement.jsx
│   ├── Products/            # Product management
│   │   └── ProductManagement.jsx
│   ├── Login.jsx            # Login component
│   └── ErrorBoundary.jsx    # Error handling
├── contexts/
│   └── AuthContext.jsx      # Authentication state
├── services/
│   ├── api.js               # API configuration
│   └── mockApi.js           # Mock data for development
├── App.jsx                  # Main app component
└── main.jsx                 # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Implemented

### ✅ Completed
- Authentication system with JWT
- Responsive layout with sidebar navigation
- Dashboard with statistics and activity feed
- User management (CRUD operations)
- Product management (grid view, filtering)
- Error handling and loading states
- Mock data fallback for development

### 🚧 Placeholder Pages
- Orders Management
- Categories Management
- Reviews Management
- Discounts Management
- Analytics
- Settings

## Styling

The project uses Tailwind CSS with a custom design system:
- **Primary**: Blue theme (`primary-*`)
- **Secondary**: Gray scale (`secondary-*`)
- **Status Colors**: Success (green), Warning (yellow), Danger (red)
- **Components**: Custom button, input, and card classes

## API Endpoints

The application integrates with the TrendBite API endpoints documented in `API_ENDPOINTS_DOCUMENTATION.md`. All endpoints are configured in `src/services/api.js`.

### Key Endpoints Used
- `POST /users/login` - Admin authentication
- `GET /orders/stats/overview` - Dashboard statistics
- `GET /users` - User listing with pagination
- `GET /products` - Product listing with filtering
- And many more...

## Development Tips

1. **Hot Reload**: The development server supports hot reload for instant updates
2. **Error Boundaries**: Errors are caught and displayed gracefully
3. **Loading States**: All components show loading indicators
4. **Responsive Design**: Test on different screen sizes
5. **Mock Data**: Use mock data when backend is unavailable

## Troubleshooting

### Common Issues

1. **API Connection Errors**: The app will automatically fall back to mock data
2. **Authentication Issues**: Check if the token is stored in localStorage
3. **Styling Issues**: Ensure Tailwind CSS is properly configured
4. **Build Errors**: Run `npm install` to ensure all dependencies are installed

### Browser Console

Check the browser console for:
- API request/response logs
- Error messages
- Mock data fallback notifications

## Next Steps

1. Implement remaining modules (Orders, Categories, Reviews, Discounts)
2. Add more detailed analytics and charts
3. Implement real-time updates with WebSocket
4. Add more comprehensive error handling
5. Add unit tests and integration tests
