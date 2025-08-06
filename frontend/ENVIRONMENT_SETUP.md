# Environment Setup Guide

## Frontend Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Feature Flags
NEXT_PUBLIC_ENABLE_OAUTH=true
NEXT_PUBLIC_ENABLE_MONITORING=true
NEXT_PUBLIC_ENABLE_EXPORT=true

# Environment
NODE_ENV=development
```

## Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Environment
ENVIRONMENT=development
DEBUG=true

# Database Configuration
DATABASE_URL=sqlite:///./ams.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Security Notes

1. **Never commit `.env` files to version control**
2. **Generate a secure SECRET_KEY for production**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```
3. **Use strong passwords for database connections**
4. **Configure proper CORS origins for production**

## Development Setup

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. Set up the database:
   ```bash
   cd backend
   python seed.py
   ```

3. Start the servers:
   ```bash
   # Backend
   cd backend
   python start_server.py
   
   # Frontend
   cd frontend
   npm run dev
   ``` 