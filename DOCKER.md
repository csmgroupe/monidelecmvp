# Docker Production Setup

This guide will help you deploy Mon ID Elec in production using Docker and Docker Compose.

## 🏗️ Architecture

The production setup includes:

- **Frontend**: React + Vite app served by Nginx
- **Backend**: NestJS API server
- **Database**: Supabase (external)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Supabase project set up
- Domain name (for production deployment)

## 🚀 Quick Start

1. **Copy environment configuration:**
   ```bash
   cp env.prod.example .env.prod
   ```

2. **Configure your environment variables in `.env.prod`:**
   ```bash
   # Get these from your Supabase dashboard
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Generate a secure JWT secret (min 32 characters)
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # SSL Configuration (already configured for app.mon-idelec.fr)
   DOMAIN_NAME=app.mon-idelec.fr
   SSL_EMAIL=your-email@example.com
   ```

3. **Initialize SSL certificates (IMPORTANT - Do this first!):**
   ```bash
   chmod +x init-letsencrypt.sh
   ./init-letsencrypt.sh
   ```

4. **Make scripts executable and deploy:**
   ```bash
   chmod +x deploy.sh renew-certs.sh
   ./deploy.sh
   ```

## 🔧 Manual Deployment

If you prefer manual control:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🌐 Service URLs

After deployment, your services will be available at:

- **Frontend**: https://app.mon-idelec.fr (automatic HTTPS)
- **Backend API**: http://localhost:3000 (internal only)
- **HTTP**: Automatically redirects to HTTPS

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View health check logs
docker-compose -f docker-compose.prod.yml logs backend
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## 🔒 Security Considerations

### Environment Variables

- **Never commit `.env.prod`** to version control
- Use strong, unique passwords and secrets
- Rotate JWT secrets regularly
- Use environment-specific Supabase projects

### Network Security

- The frontend proxies API requests to avoid CORS issues
- Consider using HTTPS in production (add SSL certificates)

### Container Security

- Backend runs as non-root user
- Minimal Alpine Linux base images
- Regular security updates via base image updates

## 🌍 Production Deployment

### Domain Setup

1. **Update Nginx configuration** (`frontend/nginx.conf`):
   ```nginx
   server_name your-domain.com;
   ```

2. **SSL/HTTPS Setup** (recommended):
   ```bash
   # Add SSL certificates to frontend/ssl/
   # Update nginx.conf to include SSL configuration
   ```

3. **Environment Variables**:
   ```bash
   # Update .env.prod with production URLs
   VITE_API_URL=https://your-domain.com/api
   ```

### Scaling

To scale services:

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balance with nginx upstream (requires nginx config update)
```

## 🛠️ Troubleshooting

### Common Issues

1. **Backend won't start**:
   ```bash
   # Check database connection
   docker-compose -f docker-compose.prod.yml logs backend
   
   # Verify Supabase credentials in .env.prod
   ```

2. **Frontend shows connection errors**:
   ```bash
   # Check if backend is healthy
   curl http://localhost:3000/health
   
   # Check nginx proxy configuration
   docker-compose -f docker-compose.prod.yml exec frontend cat /etc/nginx/conf.d/default.conf
   ```

3. **Database connection issues**:
   ```bash
   # Test Supabase connection
   docker-compose -f docker-compose.prod.yml exec backend sh
   # Inside container: npm run migration:check
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a
```

## 📈 Performance Optimization

### Frontend

- Static assets are cached for 1 year
- Gzip compression enabled
- Nginx serves static files efficiently

### Backend

- Multi-stage Docker build reduces image size
- Node.js production optimizations
- Health checks ensure service reliability

### Database

- Supabase handles scaling automatically
- Connection pooling via Supabase
- Consider read replicas for heavy read workloads

## 🔄 Updates

To update the application:

1. Pull latest code
2. Run deployment script: `./deploy.sh`
3. Monitor logs for any issues

## 📞 Support

For issues with this Docker setup:

1. Check the logs first
2. Verify environment configuration
3. Ensure Supabase is accessible
4. Check Docker and Docker Compose versions 
