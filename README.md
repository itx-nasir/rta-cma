# RTA Camera Management System

A web application for managing security cameras across RTA locations with role-based access control and comprehensive monitoring capabilities.

## 🚀 Local Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/itx-nasir/rta-cma.git
   cd rta-cma
   ```

2. **Run setup script**
   ```cmd
   setup-dev.bat
   ```

3. **Start database**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   venv\Scripts\activate
   alembic upgrade head
   python scripts/create_demo_users.py
   ```

5. **Run the application**
   ```bash
   # Backend (Terminal 1)
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Demo Login:**
- Admin: `admin` / `admin123`
- Operator: `operator` / `oper123`
- Viewer: `viewer` / `view123`

## ✅ Features & Functionality

### Authentication & Security
- [x] JWT-based authentication
- [x] Role-based access control (Admin, Operator, Viewer)
- [x] User registration and management
- [x] Protected routes and secure API endpoints

### Camera Management
- [x] Camera CRUD operations (Create, Read, Update, Delete)
- [x] Advanced search and filtering
- [x] Pagination and sorting
- [x] Camera status tracking (Active/Inactive, Online/Offline)
- [x] Bulk camera operations
- [x] Camera details view with comprehensive information

### User Interface
- [x] Responsive dashboard design
- [x] Grid and table view modes
- [x] Real-time statistics display
- [x] Auto-refresh functionality
- [x] Status indicators and badges
- [x] Mobile-friendly interface

### Data Management
- [x] PostgreSQL database integration
- [x] Database migrations with Alembic
- [x] Foreign key relationships (Locations, NVR devices)
- [x] Data validation and error handling

### API & Documentation
- [x] RESTful API with FastAPI
- [x] Auto-generated API documentation (Swagger/OpenAPI)
- [x] CORS support for frontend integration
- [x] Comprehensive endpoint coverage

### Audit & Tracking
- [x] Camera action history (Backend)
- [ ] Audit trail user interface
- [x] User activity logging
- [x] Change tracking and timestamps

### Location & NVR Management
- [x] Location database models
- [x] NVR device database models
- [x] Location CRUD interface
- [x] NVR device CRUD interface

### Advanced Features
- [ ] Real-time camera monitoring
- [ ] Camera health checks and alerts
- [ ] Reporting and analytics dashboard
- [ ] Data export functionality (PDF, Excel)
- [ ] Camera grouping and tagging
- [ ] Maintenance scheduling
- [ ] Integration with camera streams
- [ ] Mobile application
- [ ] Backup and restore functionality
- [ ] Multi-language support

### Performance & Optimization
- [ ] Redis caching implementation
- [ ] WebSocket real-time updates
- [ ] Database query optimization
- [ ] Frontend bundle optimization
- [ ] Offline support

### Integration & Deployment
- [ ] LDAP/Active Directory integration
- [ ] Production deployment configuration
- [ ] CI/CD pipeline setup
- [ ] Container orchestration
- [ ] External system integrations

## 🛠️ Technology Stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic  
**Frontend:** React 18, React Router, Axios  
**DevOps:** Docker, Docker Compose