# AegisFit — Elite Fitness Network

**AI-Powered Fitness & Gym Management Platform**

A premium full-stack web application that revolutionizes fitness tracking, gym management, and community engagement with modern tools and gamification.

## ✨ Features

### For Users (Members)
- **Drag & Drop Workout Builder** — Create, customize, and save personalized workout routines
- **AI Meal Planner** — Generate 7-day nutrition plans with macro calculations and grocery lists
- **Progress Tracking** — Daily goals, XP system, and achievement badges
- **Community Challenges** — Join global fitness challenges and compete on leaderboards

### For Gym Owners & Coaches
- **Real-time Occupancy Dashboard**
- **Slot Booking System** with calendar integration
- **Digital QR Check-in Tickets**
- **Client Progress Monitoring & Feedback**

### For Admins
- **Secure Admin Panel** with verification key
- **User Management & Moderation**
- **Platform-wide Challenge Creation**
- **System Analytics**

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Design**: Premium Navy Blue & Gold Glassmorphic Theme
- **Authentication**: JWT + bcrypt
- **Other**: Drag & Drop functionality, Dynamic Role-based Access

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aegisfit.git
   cd aegisfit

Install dependenciesBash# Root (for concurrent frontend & backend)
npm install

# Or separately
cd frontend && npm install
cd ../backend && npm install
Environment Variables
Create .env files in both frontend and backend directories (see .env.example)
Run the applicationBashnpm run dev
Frontend: http://localhost:3000
Backend: http://localhost:5000


📋 Admin Access
To create an Admin account:

Go to Register
Select Admin role
Enter Admin Secret Key: aegis-admin-key (change in production)

🗂️ Project Structure
textaegisfit/
├── frontend/          # React + Vite App
├── backend/           # Express + Node.js Server
├── implementation_plan.md
├── walkthrough.md
└── README.md
🎯 Key Highlights

Multi-role architecture (User, Gym, Coach, Admin)
Beautiful premium UI/UX with glassmorphism
Secure authentication & role-based access
Fully responsive design
Gamification elements (XP, Badges, Leaderboards)
