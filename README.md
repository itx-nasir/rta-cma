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

**Initial Login:**
Use the administrator credentials you created with the setup script.
Access the system at: http://localhost:3000

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
- [x] Production deployment configuration
- [x] GPU server deployment support
- [ ] LDAP/Active Directory integration
- [ ] CI/CD pipeline setup
- [ ] Container orchestration
- [ ] External system integrations

## 🛠️ Technology Stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Alembic  
**Frontend:** React 18, React Router, Axios  
**DevOps:** Docker, Docker Compose, Nginx
**Database:** PostgreSQL 15, Redis (caching)
**Security:** JWT Authentication, Role-based Access Control

---

# 🏭 Production Deployment Guide

## 📋 Prerequisites for RTA GPU Server Deployment

### Hardware Requirements (Minimum)
- **CPU**: 2-4 cores available (out of total server cores)  
- **RAM**: 4-8 GB available (out of total server RAM)
- **Storage**: 100 GB available disk space
- **Network**: Connected to RTA private network
- **OS**: Linux (Ubuntu 20.04+ recommended) or Windows Server

### Software Requirements
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** (for code deployment)
- **Network access** to RTA camera infrastructure

---

## 🚀 Step-by-Step Production Deployment

### Step 1: Server Preparation

#### 1.1 Connect to GPU Server
```bash
# SSH into the RTA GPU server (or use direct access)
ssh rta-admin@<gpu-server-ip>

# Or if using Windows, use RDP or direct console access
```

#### 1.2 Install Docker (if not already installed)
```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# For CentOS/RHEL  
sudo yum install docker docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

#### 1.3 Verify Available Resources
```bash
# Check available CPU cores
nproc --all

# Check available RAM
free -h

# Check available disk space
df -h

# Check current Docker containers (ML models)
docker ps
```

### Step 2: Code Deployment

#### 2.1 Clone Repository
```bash
# Create application directory
sudo mkdir -p /opt/rta-camera-management
sudo chown $USER:$USER /opt/rta-camera-management
cd /opt/rta-camera-management

# Clone the repository
git clone https://github.com/itx-nasir/rta-cma.git .

# Create required directories
mkdir -p logs backups nginx/ssl
```

#### 2.2 Configure Environment
```bash
# Copy production environment file
cp .env.prod .env

# Edit configuration for your specific network
nano .env
```

**Important Settings to Update in `.env`:**
```bash
# Update these with actual RTA network details:
CAMERA_NETWORK_BASE=<RTA_CAMERA_NETWORK>  # e.g., 10.1.0.0/16
CORS_ORIGINS=["http://<SERVER_IP>","http://rta-cameras.local"]
ALLOWED_HOSTS=["<SERVER_IP>","rta-cameras.local"]

# Update database passwords
DATABASE_PASSWORD=<SECURE_PASSWORD>
REDIS_PASSWORD=<SECURE_REDIS_PASSWORD>

# Update camera credentials  
CAMERA_USERNAME=<RTA_CAMERA_USERNAME>
CAMERA_PASSWORD=<RTA_CAMERA_PASSWORD>
```

### Step 3: Build and Deploy

#### 3.1 Build Application
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# This may take 5-10 minutes depending on internet speed
```

#### 3.2 Start Services
```bash
# Start all services in background
docker-compose -f docker-compose.prod.yml up -d

# Monitor startup logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 3.3 Initialize Database
```bash
# Wait for database to be ready, then run migrations
sleep 30

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create initial admin user
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py
```

### Step 4: Configure Network Access

#### 4.1 Configure Firewall
```bash
# Allow access from RTA network only
sudo ufw allow from 10.0.0.0/8 to any port 80
sudo ufw allow from 192.168.0.0/16 to any port 80
sudo ufw allow from 172.16.0.0/12 to any port 80

# Block external access
sudo ufw deny 80
sudo ufw deny 443
sudo ufw enable
```

#### 4.2 Update Network Configuration
```bash
# Find server IP address
ip addr show

# Note the IP address for RTA team
# Example: 192.168.1.100
```

### Step 5: Testing and Verification

#### 5.1 Health Checks
```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl http://localhost/health

# Check database connectivity
docker-compose -f docker-compose.prod.yml exec backend python -c "from app.db.session import engine; print('DB Connected:', engine.connect())"
```

#### 5.2 Access Application
```bash
# Application will be available at:
# http://<SERVER_IP>        - Main application
# http://<SERVER_IP>/health - Health check
# http://<SERVER_IP>/api/docs - API documentation
```

### Step 6: Production Monitoring

#### 6.1 Monitor Resource Usage
```bash
# Monitor Docker container resources
docker stats

# Monitor system resources
htop

# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

#### 6.2 Set up Log Rotation
```bash
# Configure logrotate for application logs
sudo nano /etc/logrotate.d/rta-camera-app
```

Add this content:
```
/opt/rta-camera-management/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 0644 root root
    postrotate
        docker-compose -f /opt/rta-camera-management/docker-compose.prod.yml restart nginx
    endscript
}
```

---

## 🔧 Configuration Management

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_PASSWORD` | PostgreSQL password | `SecurePass123!` |
| `SECRET_KEY` | JWT secret key | `your-256-bit-secret` |
| `CAMERA_NETWORK_BASE` | RTA camera network | `10.1.0.0/16` |
| `CORS_ORIGINS` | Allowed frontend origins | `["http://192.168.1.100"]` |
| `REDIS_PASSWORD` | Redis cache password | `RedisPass123!` |

### Network Configuration

```bash
# Update /etc/hosts for local DNS
sudo echo "192.168.1.100 rta-cameras.local" >> /etc/hosts

# Configure static IP (if needed)
sudo nano /etc/netplan/00-installer-config.yaml
```

---

## 📊 Maintenance & Operations

### Daily Operations

```bash
# Check system status
docker-compose -f docker-compose.prod.yml ps

# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Monitor resource usage
docker stats --no-stream
```

### Database Backup

```bash
# Create daily backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U rta_admin -d rta_camera_management > backups/backup_$(date +%Y%m%d).sql

# Automated backup script
cat > /opt/rta-camera-management/backup.sh << 'EOF'
#!/bin/bash
cd /opt/rta-camera-management
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U rta_admin -d rta_camera_management > backups/backup_$(date +%Y%m%d_%H%M%S).sql
find backups/ -name "*.sql" -mtime +30 -delete
EOF

chmod +x /opt/rta-camera-management/backup.sh

# Add to crontab for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/rta-camera-management/backup.sh") | crontab -
```

### Updates and Maintenance

```bash
# Update application code
cd /opt/rta-camera-management
git pull origin main

# Rebuild and restart (during maintenance window)
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Database migrations (if any)
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check logs for errors
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory usage
free -h
```

#### 2. Database Connection Issues
```bash
# Restart database
docker-compose -f docker-compose.prod.yml restart db

# Check database logs
docker-compose -f docker-compose.prod.yml logs db
```

#### 3. Network Access Issues
```bash
# Check firewall rules
sudo ufw status

# Check if ports are listening
netstat -tlnp | grep :80
```

### Emergency Procedures

#### Restore from Backup
```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop

# Restore database
docker-compose -f docker-compose.prod.yml exec db psql -U rta_admin -d rta_camera_management < backups/backup_YYYYMMDD.sql

# Restart services  
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support & Contacts

### RTA IT Team Handover Checklist

- [ ] Server IP address: `_______________`
- [ ] Application URL: `http://_______________`
- [ ] Database admin credentials provided
- [ ] Backup location confirmed: `/opt/rta-camera-management/backups/`
- [ ] Log locations documented: `/opt/rta-camera-management/logs/`
- [ ] Firewall rules configured for RTA network only
- [ ] Initial admin user created and credentials provided
- [ ] Resource monitoring setup completed
- [ ] Emergency procedures documented

### Application Access
- **Main Application**: `http://<server-ip>/`
- **API Documentation**: `http://<server-ip>/api/docs`
- **Health Check**: `http://<server-ip>/health`

### Support Commands
```bash
# View all running services
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View live logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

**For technical support, contact the development team with specific error logs and system status information.**