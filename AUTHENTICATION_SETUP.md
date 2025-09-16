# Jibble Token-Based Authentication System Setup Guide

## Overview
This guide will help you set up the complete token-based authentication system for Jibble, including:
- User registration with OTP verification
- User login with OTP verification  
- Password reset functionality
- Welcome emails after registration
- Enhanced UI/UX for authentication flows
- **Token-based authentication (no JWT)**

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `env_example.txt` to `.env` and configure:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/jibble_db

# Token Configuration
TOKEN_EXPIRE_HOURS=24
SESSION_TOKEN_EXPIRE_HOURS=168

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@jibble.com
SMTP_USE_TLS=true

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
ENVIRONMENT=development
```

### 3. Email Setup
For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

For development/testing:
- Use Mailhog or Mailtrap for local email testing
- Set `SMTP_HOST=localhost` and `SMTP_PORT=1025`

### 4. Database Setup
```bash
# Create database
createdb jibble_db

# Run migrations (if using Alembic)
alembic upgrade head

# Or create tables directly
python main.py
```

### 5. Start Backend
```bash
cd backend
python main.py
```

The backend will run on `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Frontend
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Authentication Flow

### Registration Flow
1. User enters name, email, and password
2. System sends OTP to user's email
3. User enters OTP code
4. Account is created and welcome email is sent
5. User is automatically logged in

### Login Flow
1. User enters email and password
2. System verifies credentials and sends OTP
3. User enters OTP code
4. User is logged in and receives session token

### Password Reset Flow
1. User requests password reset
2. System sends reset email with OTP
3. User clicks reset link and enters OTP
4. User sets new password

## API Endpoints

### Authentication
- `POST /auth/request-registration-otp` - Request OTP for registration
- `POST /auth/verify-registration-otp` - Verify OTP and complete registration
- `POST /auth/request-login-otp` - Request OTP for login
- `POST /auth/verify-login-otp` - Verify OTP and complete login
- `POST /auth/logout` - Logout and invalidate session token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP
- `GET /auth/me` - Get user profile

### Data
- `POST /api/logs` - Create/update daily log
- `GET /api/logs` - Get all logs
- `GET /api/logs/{date}` - Get log by date
- `PUT /api/logs/{date}` - Update log by date
- `DELETE /api/logs/{date}` - Delete log by date
- `GET /api/reports/weekly` - Get weekly reports

## Features

### Security Features
- **Password hashing with bcrypt** - Secure password storage
- **Token-based authentication** - No JWT, database-stored tokens
- **OTP-based verification (2FA)** - Enhanced security
- **Token expiration** - Automatic session management
- **Secure password requirements** - Minimum 6 characters
- **Token invalidation** - Proper logout handling

### User Experience Features
- Beautiful, responsive UI
- Dark/light theme support
- Loading states and error handling
- OTP countdown timer
- Resend OTP functionality
- Remember me option
- Password strength validation

### Email Features
- Professional HTML email templates
- OTP delivery
- Welcome emails
- Password reset emails
- Responsive email design

### Token System Features
- **Session tokens** - Long-lived (7 days) for user sessions
- **Auth tokens** - Short-lived (24 hours) for specific operations
- **OTP integration** - Tokens can include OTP codes
- **Automatic cleanup** - Expired tokens are automatically removed
- **Token invalidation** - Proper logout and security

## Database Schema

### UserToken Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token_type` - Type of token ('session', 'password_reset', 'email_verification')
- `token_value` - Unique token string
- `otp_code` - Optional OTP code for verification
- `is_used` - Whether token has been used
- `expires_at` - Token expiration timestamp
- `created_at` - Token creation timestamp

### User Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - **Bcrypt-hashed password**
- `is_active` - Account status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
npm test
```

### Manual Testing
1. Test registration flow
2. Test login flow
3. Test password reset
4. Test OTP expiration
5. Test email delivery
6. Test token expiration
7. Test logout functionality

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check firewall/network settings

2. **Database connection issues**
   - Verify DATABASE_URL
   - Check PostgreSQL service status
   - Verify database permissions

3. **Frontend not connecting to backend**
   - Check API_BASE_URL in src/api.js
   - Verify backend is running
   - Check CORS configuration

4. **OTP not working**
   - Check email delivery
   - Verify OTP expiration time
   - Check database for OTP records

5. **Token authentication issues**
   - Check token expiration
   - Verify token is not marked as used
   - Check database for token records

### Debug Mode
Set `ENVIRONMENT=development` in backend `.env` for detailed error messages.

## Production Deployment

### Security Considerations
1. Use strong, unique database passwords
2. Use HTTPS
3. Set secure cookie flags
4. Implement rate limiting
5. Use production email service
6. Enable CORS restrictions
7. Regular token cleanup
8. Monitor token usage patterns

### Environment Variables
- Set `ENVIRONMENT=production`
- Configure production database
- Set up production email service
- Adjust token expiration times as needed

### Token Management
- Regular cleanup of expired tokens
- Monitor token usage patterns
- Implement token rotation if needed
- Log suspicious token activities

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs
3. Verify configuration
4. Test with minimal setup
5. Check database token records

## License

This authentication system is part of the Jibble project.
