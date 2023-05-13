# RTA Camera Management System - Frontend

A beautiful, modern React frontend for the RTA Camera Management System with real-time updates, advanced filtering, and responsive design.

## Features

✨ **Camera Details Page**
- Comprehensive camera information display
- Location and NVR details
- SD card status and capacity
- Real-time status updates
- Clean, professional card-based layout

🔍 **Advanced Camera Actions Table**
- Sortable columns (Date, Type, Camera, Values)
- Search functionality across all fields
- Action type filtering
- Date range filtering
- Pagination with customizable page size
- Real-time updates every 60 seconds

🎨 **Modern UI/UX**
- Responsive design for all screen sizes
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Clean, professional typography
- Intuitive icons from Lucide React

⚡ **Real-time Updates**
- Camera details refresh every 30 seconds
- Actions table refreshes every 60 seconds
- Manual refresh buttons available
- Loading states and error handling

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- RTA Camera Management API running on http://localhost:8000

### Installation
```bash
cd frontend
npm install
npm start
```

Navigate to http://localhost:3000/camera/1 to view camera details.

## Usage

### Viewing Camera Details
Navigate to `/camera/{id}` to view comprehensive camera information including status, location, NVR details, and SD card information.

### Camera Actions Table
- **Search:** Filter across all fields
- **Sort:** Click column headers to sort
- **Filter:** By action type and date range
- **Pagination:** Customizable page sizes

## Tech Stack
- React 18 with modern hooks
- Axios for API communication
- Lucide React for icons
- Responsive CSS Grid/Flexbox
- Real-time updates with intervals

## API Integration
Connects to FastAPI backend with automatic error handling and real-time updates.

## Browser Support
Chrome 88+, Firefox 85+, Safari 14+, Edge 88+