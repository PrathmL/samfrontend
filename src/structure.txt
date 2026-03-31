# E-Samruddha-Shala Project - Frontend Structure

## Complete Project Directory Tree

```
esspfrontend/
│
├── .git/                              # Git repository files
├── .gitignore                         # Git ignore configuration
├── analyze_translations.py            # Python script for translation analysis
├── package.json                       # NPM dependency and script configuration
├── package-lock.json                  # Locked NPM dependency versions
├── README.md                          # Project README
├── SWEETALERT_IMPLEMENTATION.md       # SweetAlert implementation documentation
│
├── public/                            # Static public assets
│   ├── favicon.ico                   # Favicon
│   ├── index.html                    # Main HTML file
│   ├── logo192.png                   # Logo 192x192
│   ├── logo512.png                   # Logo 512x512
│   ├── manifest.json                 # PWA manifest
│   └── robots.txt                    # SEO robots configuration
│
├── src/                              # Source code directory
│   ├── App.css                       # Main App styles
│   ├── App.js                        # Main App component
│   ├── App.test.js                   # App component tests
│   ├── i18n.js                       # Internationalization configuration
│   ├── index.css                     # Global styles
│   ├── index.js                      # React entry point
│   ├── logo.svg                      # Logo SVG file
│   ├── reportWebVitals.js            # Web Vitals reporting
│   ├── setupTests.js                 # Test setup configuration
│   │
│   ├── components/                   # React components directory
│   │   ├── auth/                     # Authentication components
│   │   │   └── LoginPage.js          # Login page component
│   │   │
│   │   ├── common/                   # Shared/Common components
│   │   │   ├── Footer.js             # Footer component
│   │   │   ├── MainLayout.js         # Main layout wrapper
│   │   │   └── Navbar.js             # Navigation bar component
│   │   │
│   │   ├── dashboard/                # Dashboard components (main feature area)
│   │   │   ├── AdminDashboardHome.js          # Admin dashboard home
│   │   │   ├── AdminFundRequests.js           # Admin fund request management
│   │   │   ├── AdminLayout.js                 # Admin dashboard layout
│   │   │   ├── AdminSidebar.js                # Admin sidebar navigation
│   │   │   ├── AdminWorkMonitoring.js         # Admin work monitoring
│   │   │   ├── AdminWorkRequests.js           # Admin work requests management
│   │   │   ├── Alerts.js                      # Alert management component
│   │   │   ├── AuditLogs.js                   # Audit logs component
│   │   │   ├── BlockerAnalytics.js            # Blocker analytics component
│   │   │   ├── BlockerManagement.js           # Blocker management
│   │   │   ├── ClerkDashboard.js              # Clerk dashboard home
│   │   │   ├── ClerkInventory.js              # Clerk inventory management
│   │   │   ├── ClerkLowStockAlerts.js         # Low stock alerts for clerk
│   │   │   ├── ClerkQuotations.js             # Quotations management
│   │   │   ├── ClerkSidebar.js                # Clerk sidebar navigation
│   │   │   ├── ClerkStockMovements.js         # Stock movements tracking
│   │   │   ├── Communication.js               # Communication module
│   │   │   ├── DashboardLayout.js             # Generic dashboard layout
│   │   │   ├── Dashboards.js                  # Dashboard routing/selection
│   │   │   ├── HeadmasterActiveWorks.js       # Headmaster active works view
│   │   │   ├── HeadmasterDashboard.js         # Headmaster dashboard home
│   │   │   ├── HeadmasterSidebar.js           # Headmaster sidebar navigation
│   │   │   ├── HeadmasterWorkRequests.js      # Work requests for headmaster
│   │   │   ├── Reports.js                     # Reports generation component
│   │   │   ├── SachivDashboard.js             # Sachiv (Secretary) dashboard
│   │   │   ├── SachivSidebar.js               # Sachiv sidebar navigation
│   │   │   ├── SachivWorkMonitoring.js        # Sachiv work monitoring
│   │   │   ├── SachivWorkVerification.js      # Work verification for Sachiv
│   │   │   ├── SchoolManagement.js            # School management component
│   │   │   ├── TalukaManagement.js            # Taluka (block) management
│   │   │   ├── UserManagement.js              # User management component
│   │   │   ├── WorkCreationForm.js            # Form for creating work requests
│   │   │   └── WorkVerification.js            # Work verification component
│   │   │
│   │   ├── home/                    # Home page components
│   │   │   └── HomePage.js           # Home page component
│   │   │
│   │   └── profile/                 # User profile components
│   │       └── ProfileEdit.js        # Profile editing component
│   │
│   ├── context/                     # React Context for state management
│   │   └── AuthContext.js            # Authentication context provider
│   │
│   └── utils/                       # Utility functions and helpers
│       └── sweetAlertUtils.js       # Sweet Alert helper functions
│
└── node_modules/                    # NPM dependencies (generated, not in git)

```

## Project Structure Overview

### Root Level Files
- **package.json** - Contains all npm dependencies and scripts
- **README.md** - Project documentation
- **analyze_translations.py** - Translation analysis utility
- **SWEETALERT_IMPLEMENTATION.md** - Documentation for alert implementation

### Public Directory (`/public`)
Static assets served directly:
- HTML template
- Favicon and logo images
- PWA manifest configuration
- Robots.txt for SEO

### Source Code (`/src`)

#### Core Files
- **index.js** - React application entry point
- **App.js** - Root component
- **i18n.js** - Internationalization setup
- **index.css & App.css** - Global and app-level styling

#### Components Structure (`/src/components`)

1. **Auth Components** - Authentication & login
   - LoginPage

2. **Common Components** - Shared across app
   - Navbar, Footer, MainLayout 

3. **Dashboard Components** (Main Feature)
   - **Admin Dashboards**: AdminDashboardHome, AdminLayout, AdminSidebar, AdminFundRequests, AdminWorkRequests, AdminWorkMonitoring
   - **Clerk Dashboards**: ClerkDashboard, ClerkSidebar, ClerkInventory, ClerkQuotations, ClerkStockMovements, ClerkLowStockAlerts
   - **Headmaster Dashboards**: HeadmasterDashboard, HeadmasterSidebar, HeadmasterActiveWorks, HeadmasterWorkRequests
   - **Sachiv (Secretary) Dashboards**: SachivDashboard, SachivSidebar, SachivWorkMonitoring, SachivWorkVerification
   - **Management Features**: SchoolManagement, TalukaManagement, UserManagement
   - **Shared Dashboard Features**: WorkCreationForm, WorkVerification, Reports, Communication, Alerts, AuditLogs, BlockerManagement, BlockerAnalytics, DashboardLayout, Dashboards

4. **Home Components** - Landing page
   - HomePage

5. **Profile Components** - User profile
   - ProfileEdit

#### Context (`/src/context`)
- **AuthContext.js** - User authentication state management

#### Utils (`/src/utils`)
- **sweetAlertUtils.js** - Helper functions for SweetAlert notifications

## Key Features by User Role

### Admin
- Dashboard management
- Fund request tracking
- Work monitoring
- Work request management

### Clerk
- Inventory management
- Stock movements
- Quotations
- Low stock alerts

### Headmaster
- Active works viewing
- Work request management
- Communication

### Sachiv (Secretary)
- Work monitoring
- Work verification

## Technology Stack
- **Frontend Framework**: React
- **State Management**: React Context API, Redux (if installed)
- **Internationalization**: i18n
- **Alerts**: SweetAlert
- **HTTP Client**: Axios (based on dependencies)
- **Testing**: Jest

## Build & Run
Refer to `package.json` for available scripts and dependencies.
