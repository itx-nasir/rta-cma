# RTA Camera Management - Frontend

A beautiful, responsive React frontend for the RTA Camera Management System that displays camera details, location information, NVR connections, SD card status, and a comprehensive table of camera actions with real-time updates.

## Features

### 🎯 **Camera Details Page**
- **Camera Information Card**: Display all camera details including serial number, RTA tag, brand, model, IP address, MAC address, firmware version, and protocol
- **Status Card**: Real-time camera status with visual indicators for online/offline status and asset status  
- **Location Card**: Location name, type, and detailed information
- **NVR Device Card**: NVR name, IP address, and channel assignment
- **SD Card Card**: SD card installation status and capacity information
- **Additional Details**: Comments and detailed descriptions

### 📊 **Camera Actions Table**
- **Sortable Columns**: Click column headers to sort by date, action type, camera, etc.
- **Advanced Search**: Search across action types, old/new values, and notes
- **Filtering**: Filter by action type and date ranges
- **Pagination**: Configurable items per page with navigation controls
- **Real-time Updates**: Automatic refresh every 60 seconds
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### ⚡ **Real-time Features**
- **Auto-refresh**: Camera status updates every 30 seconds
- **Live Actions**: Action table refreshes every 60 seconds
- **Status Indicators**: Visual indicators for camera connection status
- **Loading States**: Smooth loading animations and error handling

### 🎨 **Modern UI/UX**
- **Clean Design**: Modern card-based layout with subtle shadows and hover effects
- **Responsive**: Mobile-first design that works on all screen sizes
- **Accessibility**: Proper semantic HTML and keyboard navigation
- **Professional Look**: Gradient backgrounds, consistent spacing, and beautiful typography

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Your FastAPI backend running on `http://localhost:8000`

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### View Camera Details

Navigate to specific camera pages:
- `http://localhost:3000/camera/1` - View Camera #1
- `http://localhost:3000/camera/2` - View Camera #2
- `http://localhost:3000/camera/{id}` - View any camera by ID

## API Configuration

The frontend is configured to communicate with your FastAPI backend at `http://localhost:8000`. If your backend runs on a different port or URL, update the `REACT_APP_API_URL` environment variable:

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

## Component Structure

```
src/
├── components/
│   ├── CameraDetails.js       # Main camera details page
│   └── CameraActionsTable.js  # Sortable actions table
├── services/
│   └── api.js                 # API service layer
├── styles/
│   ├── index.css              # Global styles
│   ├── App.css                # App layout styles  
│   ├── CameraDetails.css      # Camera details styles
│   └── CameraActionsTable.css # Table styles
├── App.js                     # Main app component
└── index.js                   # App entry point
```

## Key Features Implemented

### ✅ Camera Information Display
- Complete camera details in organized cards
- Status indicators with color-coded badges
- Location and NVR relationship display
- SD card status with capacity information

### ✅ Camera Actions Table  
- **Sortable columns**: Date, action type, camera (when viewing all cameras)
- **Search functionality**: Real-time search across all action fields
- **Advanced filtering**: By action type and date ranges
- **Pagination**: Configurable page sizes (10, 25, 50 items)
- **Responsive design**: Mobile-optimized table layout

### ✅ Real-time Updates
- Camera details refresh every 30 seconds
- Actions table refreshes every 60 seconds  
- Manual refresh buttons for immediate updates
- Loading states and error handling

### ✅ Beautiful UI/UX
- Modern card-based design
- Gradient backgrounds and subtle animations
- Hover effects and smooth transitions  
- Mobile-responsive layout
- Professional typography and spacing

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Optimizations

- **Efficient API calls**: Only fetch data when needed
- **Pagination**: Prevent large data loads
- **Debounced search**: Reduce API calls during typing
- **Optimized re-renders**: React best practices implemented
- **Lazy loading**: Components load efficiently

## Development Commands

```bash
# Start development server
npm start

# Build for production  
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build && npx serve -s build
```

## Customization

### Styling
All styles are in the `src/styles/` directory. The design uses:
- CSS Grid and Flexbox for layouts
- CSS custom properties for consistent theming
- Mobile-first responsive design principles

### API Integration  
Modify `src/services/api.js` to:
- Change API endpoints
- Add authentication headers
- Customize request/response handling

### Components
Extend functionality by:
- Adding new card components to `CameraDetails.js`
- Customizing table columns in `CameraActionsTable.js`
- Creating new service functions in `api.js`

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your FastAPI backend has CORS middleware configured
2. **API connection**: Verify the backend is running on the correct port
3. **Data not loading**: Check browser console for API errors
4. **Mobile layout issues**: Clear browser cache and test in incognito mode

### Getting Help

- Check the browser console for error messages
- Verify the FastAPI backend is running and accessible
- Ensure all npm dependencies are installed correctly
- Test API endpoints directly in your browser or Postman

---

## 🚀 Ready to Use!

Your beautiful, feature-rich camera management frontend is ready! The interface provides everything needed to monitor cameras, view their details, and track all actions with a professional, user-friendly design that works perfectly on all devices.