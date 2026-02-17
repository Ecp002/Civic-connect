# CivicConnect - Civic Issue Reporting & Management System

A modern, full-stack web application for reporting and managing civic issues with real-time tracking, geolocation, and accountability features.

![CivicConnect](logo.png)

## 🌟 Overview

CivicConnect is a comprehensive civic engagement platform that enables citizens to report community issues (potholes, broken lights, sanitation problems, etc.) and allows civic authorities to manage and resolve them efficiently. The system ensures transparency and accountability through photographic evidence, GPS tracking, and citizen feedback.

---

## ✨ Key Features

### 👤 Citizen Features

#### 1. **Interactive Issue Reporting**
- Dedicated report form with step-by-step guidance
- Interactive map with click-to-select location
- Automatic GPS location detection
- Manual location adjustment capability
- Drag & drop image upload (up to 10MB)
- Real-time location coordinates display
- Category selection (Roads, Lighting, Sanitation, Water, Parks, Traffic, Other)

#### 2. **Personal Dashboard**
- View all submitted reports
- Real-time status tracking (Reported → Processing → Resolved)
- Filter reports by status
- Detailed report view with timeline
- Before/After image comparison
- GPS coordinates and map view

#### 3. **Issue Tracking & Timeline**
- Complete issue lifecycle tracking
- Timestamps for each status change:
  - Reported at
  - Processing started at
  - Resolved at
- Visual timeline with icons

#### 4. **Satisfaction Feedback System**
- Post-resolution feedback (only after issue is resolved)
- Binary satisfaction rating (Satisfied/Not Satisfied)
- 5-star rating system
- Optional text feedback
- One-time submission (cannot be edited)

#### 5. **Responsive Design**
- Fully mobile-optimized interface
- Touch-friendly controls
- Adaptive layouts for all screen sizes
- Smooth animations and transitions

---

### 🔧 Admin Features

#### 1. **Comprehensive Dashboard**
- Real-time statistics:
  - Total reports
  - Pending reports
  - In-progress reports
  - Resolved reports
- Interactive map with color-coded markers:
  - 🔴 Red: Reported
  - 🟡 Orange: Processing
  - 🟢 Green: Resolved
- Click markers to view issue details
- Auto-zoom to fit all markers

#### 2. **Issue Management**
- View all reported issues in table format
- Filter by status (All, Reported, Processing, Resolved)
- Detailed issue modal with:
  - Full issue information
  - Reporter details (name, email)
  - GPS coordinates
  - Interactive location map
  - Before/After images
  - Complete timeline
  - Citizen feedback (if available)

#### 3. **Status Management**
- Three status buttons:
  - **Reported** (Red) - Initial state
  - **Processing** (Orange) - Work in progress
  - **Resolved** (Green) - Issue fixed
- Automatic timestamp recording
- After image upload requirement for resolution
- Visual confirmation of status changes

#### 4. **Photographic Evidence System**
- Before image (uploaded by citizen)
- After image (uploaded by admin)
- Side-by-side comparison view
- Responsive image display (desktop & mobile)
- Image validation and storage

#### 5. **Citizen Feedback View**
- View satisfaction status
- See ratings and comments
- Track citizen satisfaction metrics

---

## 🛠️ Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, animations, flexbox, grid
- **JavaScript (ES6+)** - Vanilla JS for interactivity
- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage (image hosting)
  - Real-time subscriptions
  - Row Level Security (RLS)

### Design
- Responsive design (mobile-first approach)
- Modern UI with gradients and shadows
- Smooth animations and transitions
- Accessible color contrast
- Touch-optimized controls

---

## 📊 Database Schema

### `issues` Table
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- location (text)
- area (text)
- category (text)
- latitude (numeric)
- longitude (numeric)
- before_image_url (text)
- after_image_url (text)
- status (text) - 'Reported', 'Processing', 'Resolved'
- created_at (timestamp) - Report submission time
- processing_at (timestamp) - When admin started processing
- resolved_at (timestamp) - When issue was resolved
- satisfaction_status (text) - 'Satisfied', 'Not Satisfied'
- satisfaction_rating (integer) - 1-5 stars
- feedback_text (text) - Optional citizen comment
- user_id (uuid, foreign key)
```

### `profiles` Table
```sql
- id (uuid, primary key)
- full_name (text)
- email (text)
- role (text) - 'citizen', 'admin'
- created_at (timestamp)
```

---

## 🚀 Setup Instructions

### Prerequisites
- Modern web browser
- Supabase account
- Node.js (optional, for local development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CivicConnect
```

2. **Configure Supabase**
   - Create a new Supabase project
   - Run the SQL setup script: `setup.sql`
   - Enable Storage bucket: `myfiles`
   - Configure authentication (Email/Password)

3. **Update Configuration**
   - Copy `js/config.example.js` to `js/config.js`
   - Add your Supabase credentials:
```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
const STORAGE_BUCKET = 'myfiles';
```

4. **Deploy**
   - Upload files to web server, or
   - Use local server: `python -m http.server 8000`

5. **Create Admin User**
   - Sign up through the application
   - Manually update `profiles` table to set `role = 'admin'`

---

## 📱 Pages & Routes

### Public Pages
- **`index.html`** - Landing page with features showcase
- **`login.html`** - User authentication
- **`signup.html`** - New user registration

### Citizen Pages
- **`report.html`** - Submit new issue report
- **`dashboard.html`** - View personal reports
- **`report-detail.html`** - Detailed issue view with feedback

### Admin Pages
- **`admin.html`** - Admin dashboard with map and management tools

---

## 📁 File Structure

```
CivicConnect/
├── index.html                          # Landing page
├── login.html                          # Login page
├── signup.html                         # Signup page
├── report.html                         # Report submission form
├── dashboard.html                      # Citizen dashboard
├── report-detail.html                  # Issue detail view
├── admin.html                          # Admin dashboard
├── logo.png                            # Application logo
├── css/
│   └── styles.css                      # Main stylesheet
├── js/
│   ├── config.js                       # Supabase configuration
│   ├── config.example.js               # Config template
│   ├── auth.js                         # Authentication utilities
│   ├── app.js                          # Main app logic
│   ├── login.js                        # Login functionality
│   ├── signup.js                       # Signup functionality
│   ├── dashboard.js                    # Dashboard logic
│   ├── report.js                       # Report form logic
│   └── admin.js                        # Admin dashboard logic
├── setup.sql                           # Database setup script
├── upgrade.sql                         # Database migration script
├── SQL_SETUP.md                        # Setup documentation
├── upgrade.md                          # Upgrade documentation
├── FEATURES_SUMMARY.md                 # Features overview
├── CivicConnect_System_Design.md       # System design doc
├── CivicConnect_UI_Design_System.md.md # UI design doc
├── UPGRADE_COMPLETE.md                 # Upgrade notes
└── README.md                           # This file
```

---

## 🎨 Design Features

### Color Palette
- **Primary Blue**: #1E3A8A (Dark Blue)
- **Secondary Blue**: #3B82F6 (Bright Blue)
- **Success Green**: #10B981
- **Warning Orange**: #F59E0B
- **Danger Red**: #EF4444
- **Neutral Gray**: #6B7280

### Typography
- **Font Family**: Inter, Segoe UI, System UI
- **Headings**: Bold (700), varying sizes
- **Body**: Regular (400-500), 16px base

### Responsive Breakpoints
- **Desktop**: > 1200px
- **Tablet**: 768px - 1200px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

### UI Components
- Gradient backgrounds
- Card-based layouts
- Hover animations
- Loading states
- Toast notifications
- Modal dialogs
- Interactive maps
- Status badges
- Timeline components

---

## 🔐 Security Features

- Row Level Security (RLS) policies
- Authenticated user access only
- Admin role verification
- Secure image storage
- Input validation
- XSS protection
- CSRF protection via Supabase

---

## 🎯 User Workflows

### Citizen Workflow
1. Sign up / Login
2. Navigate to Report page
3. Fill in issue details
4. Click on map to set location (or use auto-detect)
5. Upload before image
6. Submit report
7. View report in dashboard
8. Track status updates
9. Provide feedback after resolution

### Admin Workflow
1. Login with admin credentials
2. View dashboard with statistics and map
3. Click on issue to view details
4. Update status to "Processing"
5. Upload after image
6. Mark as "Resolved"
7. View citizen feedback

---

## 📈 Future Enhancements

- [ ] Email notifications for status updates
- [ ] SMS alerts
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/CSV
- [ ] Mobile app (iOS/Android)
- [ ] Push notifications
- [ ] Issue priority levels
- [ ] Department assignment
- [ ] Bulk operations
- [ ] Advanced search and filters
- [ ] Heat map visualization
- [ ] Recurring issue detection
- [ ] Community voting on issues
- [ ] Integration with city systems

---

## 🐛 Known Issues & Limitations

- Map requires internet connection
- Large images may take time to upload
- Browser geolocation permission required for auto-location
- After image required before marking as resolved
- Feedback can only be submitted once

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration
- [ ] User login/logout
- [ ] Report submission
- [ ] Image upload
- [ ] Map interaction
- [ ] Status updates
- [ ] Feedback submission
- [ ] Admin dashboard
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

---

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

---

## 🙏 Acknowledgments

- **Leaflet.js** - Interactive maps library
- **OpenStreetMap** - Map data and tiles
- **Supabase** - Backend infrastructure and database
- **Community** - For feedback and support

---

## 📝 Changelog

### Version 2.0 (Current)
- ✅ Added dedicated report page with interactive map
- ✅ Implemented auto-location detection
- ✅ Added satisfaction feedback system
- ✅ Enhanced admin dashboard with map view
- ✅ Improved mobile responsiveness
- ✅ Added timeline visualization
- ✅ Implemented before/after image comparison
- ✅ Added status management with timestamps
- ✅ Enhanced UI with gradients and animations
- ✅ Fixed mobile menu and navigation

### Version 1.0
- ✅ Basic issue reporting
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Status tracking

---

**Built with ❤️ for better communities**

*Making cities more responsive, one report at a time.*
