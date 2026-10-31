# MERNCAMP Server — Social Network REST API

The **backend** of MERNCAMP, a **social network built by devs for devs**, built with **Node.js, Express 5, MongoDB (Mongoose), and Socket.IO**. It provides a JWT-secured REST API for the [merncamp-client](https://github.com/alijamshidy/merncamp-client) frontend: authentication, posts with images, likes and comments, follow/unfollow, user search, and an admin role — plus real-time post broadcasting.

---

## ✨ Features

### 🔐 **Authentication**
- User registration with email and password (**bcrypt**, salt rounds: 12) — a unique `username` is auto-generated (nanoid) and can be changed later via profile update
- Login with **JWT** (HS256) token issuance
- Token verification middleware via **express-jwt**
- Password recovery using a personal **secret question** answer
- Profile update (name, about, image)
- Role-based access: `Subscriber` (default) and `Admin`

### 📝 **Posts**
- Create, update, and delete posts (rich HTML content from Quill)
- Image upload up to **5 MB**, stored on **Cloudinary**
- Like / Unlike posts
- Add / Remove comments
- Paginated news feed
- Post counts and public post listing
- Single post details endpoint

### 👥 **Social Graph**
- Follow / Unfollow users (with automatic follower bookkeeping)
- Find people suggestions (users you are not following)
- View following list
- Get user profile by username
- User search by query

### 🛡 **Authorization & Security**
- `requireSignIn` — JWT verification middleware
- `canEditDeletePost` — only the author can edit/delete their posts
- `checkAdmin` — admin-only endpoints (e.g. delete any post)
- **CORS** restricted to the configured client URL
- Password hashing — plain passwords are never stored

### ⚡ **Real-time**
- **Socket.IO** server relaying `new-post` events to all connected clients **except the sender** (the client emits `new-post` after creating a post)

### 🧩 **Auto-loaded Routes**
- Any file dropped in `routes/` is automatically mounted under `/api` — zero registration boilerplate

---

## 🛠 Tech Stack

**Runtime & Framework:**
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express 5](https://expressjs.com/) - Web framework
- [Socket.IO 4](https://socket.io/) - Real-time bidirectional communication

**Database & ODM:**
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose 8](https://mongoosejs.com/) - MongoDB object modeling

**Authentication:**
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT issuance
- [express-jwt](https://github.com/auth0/express-jwt) - JWT verification middleware
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing

**Media & Uploads:**
- [Cloudinary 2](https://cloudinary.com/) - Image storage and CDN
- [express-formidable](https://github.com/utatti/express-formidable) - Multipart form / file uploads

**Utilities:**
- [cors](https://github.com/expressjs/cors) - Cross-origin resource sharing
- [dotenv](https://github.com/motdotla/dotenv) - Environment variables
- [morgan](https://github.com/expressjs/morgan) - HTTP request logging
- [nanoid](https://github.com/ai/nanoid) - Unique ID generation
- [nodemon](https://nodemon.io/) - Auto-restart during development

---

## 💻 Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Git
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alijamshidy/merncamp-server.git
   cd merncamp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration (see [Environment Variables](#-environment-variables))

4. **Run the server:**
   ```bash
   npm start
   ```

The API will start at the port defined in `PORT` (e.g. `http://localhost:8000`), with all routes mounted under `/api`.

---

## ⚙ Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server port
PORT=8000

# MongoDB connection string (local or Atlas)
DB_URL=mongodb://localhost:27017/merncamp

# JWT signing secret
JWT_SECRET=your_jwt_secret_here

# Cloudinary credentials (image uploads)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

# Frontend URL (CORS + Socket.IO origin)
CLIENT_URL=http://localhost:3000
```

> ℹ️ The **secret question** answer used for password recovery is a per-user field stored in MongoDB (set at registration), **not** an environment variable.

---

## 📁 Folder Structure

```
merncamp-server/
├── controllers/             # Route handlers (business logic)
│   ├── auth.js              # Register, login, password, profile, follow
│   └── post.js              # Post CRUD, likes, comments, feed
├── helpers/                 # Helper utilities
│   └── auth.js              # hashPassword, comparePassword (bcrypt)
├── middlewares/             # Express middlewares
│   └── auth.js              # requireSignIn (JWT), canEditDeletePost, checkAdmin
├── models/                  # Mongoose schemas
│   ├── userModel.js         # User: name, email, username, role, followers, following
│   └── postModel.js         # Post: content, image, likes, comments
├── routes/                  # Auto-loaded under /api
│   ├── auth.js              # /api/register, /api/login, /api/user-follow, ...
│   └── post.js              # /api/create-post, /api/news-feed/:page, ...
├── utils/                   # Utilities
│   └── db.js                # MongoDB connection
├── server.js                # Express app + Socket.IO bootstrap
└── package.json
```

---

## 🚀 Demo

### Run the server locally:
```bash
npm start
```

### Example endpoints:
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Create a new account | ❌ |
| POST | `/api/login` | Login and receive JWT | ❌ |
| GET | `/api/current-user` | Get current user | ✅ |
| POST | `/api/forgot-password` | Reset password with secret | ❌ |
| PUT | `/api/profile-update` | Update profile | ✅ |
| GET | `/api/find-people` | Suggested users | ✅ |
| PUT | `/api/user-follow` | Follow a user | ✅ |
| PUT | `/api/user-unfollow` | Unfollow a user | ✅ |
| GET | `/api/search-user/:query` | Search users | ❌ |
| GET | `/api/user/:username` | Public profile | ❌ |
| GET | `/api/user-following` | List of users you follow | ✅ |
| GET | `/api/current-admin` | Check admin role | ✅ Admin |
| POST | `/api/create-post` | Create a post | ✅ |
| POST | `/api/upload-image` | Upload post image (≤5 MB) | ✅ |
| GET | `/api/get-posts` | Latest 10 posts | ✅ |
| GET | `/api/news-feed/:page` | Paginated news feed (3 per page) | ✅ |
| GET | `/api/user-post/:_id` | Posts by a user | ✅ |
| PUT | `/api/update-post/:_id` | Update a post (author only) | ✅ |
| DELETE | `/api/delete-post/:_id` | Delete a post (author only) | ✅ |
| PUT | `/api/like-post` | Like a post | ✅ |
| PUT | `/api/unlike-post` | Unlike a post | ✅ |
| PUT | `/api/add-comment` | Comment on a post | ✅ |
| PUT | `/api/remove-comment` | Remove a comment | ✅ |
| GET | `/api/post/:_id` | Post details | ❌ |
| GET | `/api/posts` | Public post listing | ❌ |
| GET | `/api/total-post-count` | Total posts count | ❌ |
| DELETE | `/api/admin/delete-post/:_id` | Delete any post (admin) | ✅ Admin |

### Test the API:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123","secret":"my answer"}'
```

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start server with nodemon (auto-restart) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is **private** and all rights are reserved.

---

## 🆘 Support

For support, please open an issue or contact the maintainer.

---

## 🏷 Topics

`nodejs`, `express`, `mongodb`, `mongoose`, `rest-api`, `mern`, `mern-stack`, `jwt`, `socket-io`, `cloudinary`, `backend`, `social-network`
