# Jibble Setup Guide - Daily Logs & Weekly Reports (PostgreSQL)

## 🚀 New Features Added

### ✅ Daily Log Storage
- **Database Storage**: Logs now stored in PostgreSQL database
- **New Fields**: Added mood score and energy level tracking
- **API Endpoints**: Full CRUD operations for daily logs
- **Fallback**: Still maintains localStorage for offline functionality

### ✅ Weekly Report Generation
- **Automatic Generation**: Weekly reports created on-demand
- **Performance Metrics**: Discipline, sociability, productivity averages
- **Task Analytics**: Completion rates and task tracking
- **Insights**: Top quotes and learning summaries
- **Visual Charts**: Progress bars and metrics display

## 🛠️ Setup Instructions

### Prerequisites
- **PostgreSQL** installed and running
- **Python 3.8+** with pip
- **Node.js 16+** with npm

### 1. PostgreSQL Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Install PostgreSQL (Windows)
# Download from https://www.postgresql.org/download/windows/

# Create database user (optional)
sudo -u postgres createuser --interactive
# Enter username: jibble_user
# Enter password: your_password

# Create database
sudo -u postgres createdb jibble
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp env.example .env

# Edit .env with your PostgreSQL credentials
nano .env

# Install Python dependencies
pip install -r requirements.txt

# Run PostgreSQL migration
python migrate_postgres.py

# Start the backend server
python -m main
```

**Backend will be available at**: `http://localhost:8000`
**API Documentation**: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at**: `http://localhost:5173`

## 🔧 Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=jibble
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here

# Alternative: Use DATABASE_URL for full connection string
# DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Configuration
JWT_SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Debug Settings
SQL_DEBUG=false
```

## 📊 Database Schema

### DailyLog Table
```sql
- id (Primary Key)
- user_id (Foreign Key to User with CASCADE DELETE)
- date (YYYY-MM-DD format)
- quote (Text)
- tasks (JSON array)
- ratings (JSON object)
- learning (Text)
- mood_score (Float 1-10)
- energy_level (Float 1-10)
- created_at, updated_at (Timestamps with timezone)
```

### WeeklyReport Table
```sql
- id (Primary Key)
- user_id (Foreign Key to User with CASCADE DELETE)
- week_start_date, week_end_date
- total_logs, tasks_completed, total_tasks
- average_mood, average_energy
- average_discipline, average_sociability, average_productivity
- completion_rate, top_quotes, learning_insights
```

### Performance Indexes
```sql
- idx_daily_logs_user_date (user_id, date)
- idx_weekly_reports_user_week (user_id, week_start_date)
- idx_users_email (email)
- idx_otp_tokens_email_purpose (email, purpose)
```

## 🔄 API Endpoints

### Daily Logs
- `POST /api/logs` - Create/Update log
- `GET /api/logs` - Get all user logs
- `GET /api/logs/{date}` - Get log by date
- `PUT /api/logs/{date}` - Update log
- `DELETE /api/logs/{date}` - Delete log

### Weekly Reports
- `GET /api/reports/weekly/{week_start_date}` - Generate weekly report
- `GET /api/reports/weekly` - Get all weekly reports

## 📱 Frontend Components

### New Components Added
1. **WeeklyReportPage** - Complete weekly report view
2. **Enhanced DailyLogForm** - Added mood and energy tracking
3. **Updated API Layer** - New functions for reports

### Features
- **Week Navigation**: Navigate between weeks
- **Performance Charts**: Visual progress bars
- **Metrics Dashboard**: Overview cards with key stats
- **Responsive Design**: Works on all device sizes

## 🔐 Authentication

- **JWT Tokens**: Secure API access
- **User Isolation**: Each user sees only their data
- **Session Management**: Automatic token refresh

## 💾 Data Storage Strategy

### Primary Storage: PostgreSQL Database
- **Benefits**: ACID compliance, complex queries, data relationships, scalability
- **Performance**: Optimized indexes and query planning
- **Backup**: Built-in backup tools (pg_dump, pg_restore)
- **Replication**: Master-slave replication support

### Secondary Storage: Browser localStorage
- **Purpose**: Offline functionality, data persistence
- **Fallback**: If API fails, data still saved locally

### PostgreSQL Advantages
- **JSON Support**: Native JSON/JSONB for flexible data storage
- **Advanced Queries**: Window functions, CTEs, full-text search
- **Concurrency**: Better handling of multiple users
- **Extensions**: Rich ecosystem of additional features

## 📈 Weekly Report Features

### Metrics Calculated
- **Task Completion Rate**: Percentage of completed tasks
- **Performance Averages**: Discipline, sociability, productivity
- **Mood & Energy Trends**: Weekly averages and patterns
- **Learning Insights**: Aggregated learning entries
- **Top Quotes**: Most inspiring quotes of the week

### Report Generation
- **On-Demand**: Generated when requested
- **Cached**: Stored in database for quick access
- **Flexible**: Navigate between any week
- **Export Ready**: Easy to export to PDF/CSV

## 🚨 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Check connection
   psql -h localhost -U postgres -d jibble
   
   # Test from Python
   python -c "from database import test_connection; test_connection()"
   ```

2. **Database Permission Error**
   ```bash
   # Grant permissions to user
   sudo -u postgres psql
   GRANT ALL PRIVILEGES ON DATABASE jibble TO your_username;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
   ```

3. **API Endpoints Not Working**
   ```bash
   # Check backend server
   curl http://localhost:8000/health
   
   # Check API docs
   open http://localhost:8000/docs
   ```

4. **Frontend Not Loading Data**
   ```bash
   # Check browser console for errors
   # Verify API base URL in src/api.js
   # Check authentication token
   # Verify CORS settings
   ```

### Performance Tips

1. **Database Indexes**: Already configured for optimal performance
2. **Connection Pooling**: Configured with SQLAlchemy
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
4. **Regular Maintenance**: Run VACUUM and ANALYZE periodically

## 🔮 Future Roadmap

### Phase 2 Features
- **Monthly Reports**: Extended analytics and trends
- **Goal Tracking**: Set and monitor personal goals
- **Habit Streaks**: Track consistent behaviors
- **Data Export**: PDF/CSV report downloads
- **Email Reports**: Weekly summary emails

### Phase 3 Features
- **Team Analytics**: Compare with team members
- **AI Insights**: Machine learning recommendations
- **Mobile App**: Native iOS/Android apps
- **Integration**: Connect with other productivity tools

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at `/docs`
3. Check browser console for frontend errors
4. Verify PostgreSQL connectivity
5. Check database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

---

**Happy Logging with PostgreSQL! 📝🐘✨**
