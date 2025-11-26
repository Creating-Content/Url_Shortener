# Short URL Service

<div align="center">
<img width="1200" height="475" alt="SmartRail Planner" src="./images/homepage.png" />
</div>

A modern, secure, and efficient URL shortening service built with Node.js, Express, and MongoDB. This application provides a complete solution for creating, managing, and tracking shortened URLs with user authentication and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Security Features](#security-features)
- [License](#license)

## ✨ Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **User Authentication**: Secure signup and login with JWT tokens
- **User Profiles**: View and manage your shortened URLs
- **Visit Analytics**: Track visit history and timestamps for each shortened URL
- **Session Management**: Cookie-based session handling
- **Responsive UI**: EJS templating for dynamic frontend
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **Security**: Environment variable protection for sensitive credentials

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js 5.x |
| **Database** | MongoDB |
| **ODM** | Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **Template Engine** | EJS |
| **Unique ID Generation** | Nanoid, ShortID |
| **Development** | Nodemon |
| **Security** | Cookie Parser, Dotenv |

## 📁 Project Structure

```
Short_Url/
├── controllers/              # Business logic for routes
│   ├── url.js              # URL shortening logic
│   └── user.js             # User management logic
├── models/                 # Database schemas
│   ├── url.js              # URL model schema
│   └── user.js             # User model schema
├── routes/                 # API route handlers
│   ├── url.js              # URL-related endpoints
│   ├── user.js             # User authentication endpoints
│   └── staticRouter.js      # Static page routes
├── middlewares/            # Express middleware
│   └── auth.js             # Authentication & authorization
├── service/                # Utility services
│   ├── auth.js             # Authentication helpers
│   └── auth1.js            # Additional auth utilities
├── views/                  # EJS templates
│   ├── home.ejs            # Home page
│   ├── login.ejs           # Login page
│   ├── signup.ejs          # Registration page
│   └── profile.ejs         # User profile page
├── connect.js              # MongoDB connection setup
├── indexEjs.js             # Main application entry point
├── index.js                # Alternative entry point
├── .env                    # Environment variables (git ignored)
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
└── README.md               # Documentation
```

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (Local or Atlas Cloud)
- **Git** (for version control)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Short_Url
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string

4. **Start the application**
   ```bash
   npm start
   ```

The server will start on `http://localhost:8001`

## 🔧 Environment Setup

Create a `.env` file in the project root with the following variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority
PORT=8001
```

⚠️ **Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

## 💻 Usage

### Starting the Server

```bash
npm start
```

The application will:
- Connect to MongoDB
- Start the Express server on PORT 8001
- Render EJS templates for the frontend
- Log connection status to the console

### Accessing the Application

- **Local (development)**: `http://localhost:8001/`
- **Login (local)**: `http://localhost:8001/login`
- **Sign Up (local)**: `http://localhost:8001/signup`
- **Profile (local)**: `http://localhost:8001/profile`

### Deployment / Production

- **Hosted On**: AWS EC2 instance
- **Reverse Proxy**: `nginx` used as a reverse proxy in front of the Node.js app
- **SSL Certificate**: Obtained and managed with `certbot` (Let's Encrypt) to enable HTTPS
- **Database**: Connected to a MongoDB cluster (MongoDB Atlas)
- **Domain Routing**: The project domain/subdomain's A record was pointed to the EC2 public IP
- **Live URL**: https://www.url-shortener.casacam.net/ (production site)

Notes on the production setup:

- Nginx proxies incoming HTTPS requests on ports 80/443 to the Node.js app running on the EC2 instance (e.g. `http://127.0.0.1:8001`).
- Certbot was used to request and install a Let's Encrypt certificate for the `www.url-shortener.casacam.net` subdomain and configured automatic renewal.
- The MongoDB connection string configured in production points to a secure MongoDB cluster; credentials are stored in the server's environment variables (not committed to the repo).
- DNS was configured so the `www.url-shortener.casacam.net` A record resolves to the EC2 instance's public IP.

If you want, I can add a short `deploy.md` with nginx config snippets and the `certbot` commands used.

## 🔌 API Endpoints

### URL Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/url/:shortId` | Redirect to original URL and log visit |
| POST | `/url` | Create a new shortened URL |
| GET | `/url` | Get all shortened URLs (auth required) |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/signup` | Register a new user |
| POST | `/user/login` | Authenticate and get session |
| POST | `/user/logout` | End user session |

### Static Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page |
| GET | `/signup` | Signup form |
| GET | `/login` | Login form |
| GET | `/profile` | User profile (auth required) |

## 📊 Database Models

### User Model

```javascript
{
  email: String (unique),
  name: String,
  password: String (hashed),
  createdAt: Date
}
```

### URL Model

```javascript
{
  shortId: String (unique),
  redirectURL: String,
  visitHistory: [
    {
      timestamp: Date
    }
  ],
  createdBy: ObjectId (reference to User),
  createdAt: Date
}
```

## 🔐 Security Features

- ✅ Environment variables for sensitive data (.env)
- ✅ Password hashing with bcrypt (recommended)
- ✅ JWT-based authentication
- ✅ Cookie-based session management
- ✅ Protected routes with authentication middleware
- ✅ Input validation and sanitization
- ✅ CORS headers for cross-origin requests
- ✅ .gitignore prevents credential leaks

## 📝 Notes

- Use `npm start` with nodemon for automatic restart during development
- Ensure MongoDB is running before starting the application
- Check `/test` endpoint to verify database connectivity
- All sensitive credentials are stored in `.env` file

## 🤝 Contributing

To contribute to this project:

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

---

**Built with ❤️ by Arkadip Ghosh**
