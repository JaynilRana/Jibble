# Jibble - Daily Journaling App

A beautiful, feature-rich daily journaling application built with React and Vite. Jibble helps you track your daily thoughts, experiences, and personal growth through an intuitive and modern interface.

## ✨ Features

### 📝 Daily Logging
- **Comprehensive Log Form**: Capture quotes, tasks, ratings, learning insights, mood, and energy levels
- **Rich Text Sections**: Organized sections for different aspects of your day
- **Task Management**: Create and track daily tasks with completion status
- **Rating System**: Rate your discipline, sociability, and productivity
- **Learning Journal**: Document what you learned each day

### 📊 Analytics & Insights
- **Real-time Dashboard**: View your statistics, streaks, and recent activity
- **Weekly Reports**: Detailed performance analysis with charts and insights
- **Progress Tracking**: Monitor your habits, mood, and productivity trends
- **Streak Counter**: Track your daily logging consistency

### 🎨 User Experience
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Mobile Responsive**: Works perfectly on all devices
- **Smooth Navigation**: Intuitive navigation with smooth scrolling

### 🔒 Data Management
- **Local Storage**: All data stored locally in your browser
- **Export/Import**: Backup and restore your data with JSON files
- **Data Persistence**: Your logs survive browser restarts
- **Privacy First**: Your data never leaves your device

### 🌐 Offline-First
- **No Backend Required**: Works completely offline
- **Automatic Fallback**: Gracefully handles network issues
- **Local Authentication**: User sessions managed locally
- **Data Synchronization**: Ready for future backend integration

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jibble
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📱 Usage Guide

### Getting Started

1. **Landing Page**: Explore the features and sections using the navigation
2. **Sign Up/Login**: Create an account or log in (works offline)
3. **Dashboard**: View your statistics and quick actions
4. **Write Your First Log**: Click "Write Today's Log" to start journaling

### Daily Logging

1. **Navigate to Daily Log**: Use the navigation or dashboard quick action
2. **Fill Out Sections**:
   - **Quote**: Add an inspiring quote for the day
   - **Tasks**: Create and mark tasks as complete
   - **Ratings**: Rate your discipline, sociability, and productivity (1-10)
   - **Learning**: Document what you learned today
   - **Mood & Energy**: Rate your overall mood and energy levels
3. **Save**: Click save to store your log

### Weekly Reports

1. **Access Reports**: Navigate to "Weekly Reports" in the navigation
2. **View Statistics**: See your weekly performance metrics
3. **Analyze Trends**: Review your progress over time
4. **Navigate Weeks**: Use the navigation arrows to view different weeks

### Data Management

1. **Export Data**: Go to Export page to download your data as JSON
2. **Import Data**: Upload previously exported data to restore or merge
3. **Clear Data**: Option to clear all data (use with caution)

## 🏗️ Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Context API**: State management for theme and authentication

### Data Layer
- **Local Data Service**: Handles all data operations locally
- **API Service**: Provides unified interface for local and remote data
- **localStorage**: Persistent data storage
- **Offline-First**: Works without internet connection

### Key Components
- **AuthContext**: Manages user authentication and sessions
- **ThemeContext**: Handles dark/light theme switching
- **LocalDataService**: Core data management and analytics
- **API Service**: Unified data access layer

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── DailyLogForm.jsx # Daily logging form
│   ├── WeeklyReportPage.jsx # Weekly reports
│   ├── Export.jsx       # Data export/import
│   ├── Navigation.jsx   # Navigation component
│   └── ...             # Other components
├── contexts/            # React contexts
│   ├── AuthContext.jsx  # Authentication context
│   └── ThemeContext.jsx # Theme context
├── services/            # Data services
│   └── localDataService.js # Local data management
├── api.js              # API service layer
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Customization
- **Themes**: Modify colors in `src/index.css`
- **Features**: Add new sections to `DailyLogForm.jsx`
- **Analytics**: Extend `localDataService.js` for new metrics

## 🚀 Deployment

### Static Hosting (Recommended)
Deploy to any static hosting service:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3
   - Any static hosting service

### Docker Deployment
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔮 Future Enhancements

### Planned Features
- **Backend Integration**: Optional backend for data synchronization
- **Cloud Storage**: Secure cloud backup of your data
- **Social Features**: Share insights with friends (optional)
- **Advanced Analytics**: More detailed charts and insights
- **Mobile App**: Native mobile applications
- **AI Insights**: AI-powered journaling insights and suggestions

### Backend Integration
The app is designed to work with or without a backend:

1. **Current**: Works completely offline with local storage
2. **Future**: Optional backend for:
   - Data synchronization across devices
   - Cloud backup
   - Social features
   - Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: My data disappeared after clearing browser data**
A: The app stores data in localStorage. Clearing browser data will remove your logs. Use the export feature to backup your data regularly.

**Q: Can I use this offline?**
A: Yes! The app works completely offline. All data is stored locally in your browser.

**Q: How do I backup my data?**
A: Go to the Export page and click "Export Data" to download a JSON file with all your data.

**Q: Can I import data from another device?**
A: Yes! Use the Import feature on the Export page to upload a previously exported JSON file.

### Getting Help
- Check the [Issues](../../issues) page for known problems
- Create a new issue for bugs or feature requests
- Review the documentation above for usage questions

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Inspired by the need for better personal journaling tools
- Designed for privacy and user control
- Made with ❤️ for the personal development community

---

**Start your journaling journey today with Jibble!** 📝✨
