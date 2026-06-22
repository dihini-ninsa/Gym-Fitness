🛡️ AegisFit — AI-Powered Gym & Fitness Management Platform

AegisFit is a full-stack gym and fitness management web application built with React and Node.js. It provides role-based access for gym members, coaches, gym owners, and admins — each with their own dedicated dashboard and features. Members can generate AI-powered personalized meal plans, track workout routines, join fitness challenges, and book coaching sessions. The platform features a modern glassmorphism UI with dynamic background visuals, secure JWT authentication, and a dual-database architecture that supports both MongoDB and a local JSON fallback — so it works out of the box even without a live database.

✨ Features


🔐 Secure JWT Authentication — register, login, and protected routes
👥 Role-Based Access Control — four distinct roles with separate dashboards
🥗 AI Meal Planner — generate personalized meal plans based on weight, height, activity, goal, and diet type; plans auto-save and persist per user
🏋️ Workout Routine Builder — drag-and-drop interface for building custom routines
📅 Session Booking — calendar-based booking system for coaching sessions
🏆 Fitness Challenges — join community challenges and earn XP
🥇 Leaderboard — competitive XP rankings across all members
💬 Live Chat — real-time messaging between members and coaches
🎖️ XP & Badge System — gamified progression to keep members motivated
🌙 Glassmorphism UI — modern dark theme with blur effects, glows, and depth
🗄️ Dual Database Mode — runs on MongoDB in production; falls back to local JSON files automatically if MongoDB is unavailable



🛠️ Tech Stack

Frontend

TechnologyVersionPurposeReact19UI frameworkVite8Build tool and dev serverReact DOM19DOM renderingCSS Variables—Theming and glassmorphism design system

Backend

TechnologyVersionPurposeNode.js—RuntimeExpress4REST API frameworkMongoose8MongoDB ODMbcryptjs2Password hashingjsonwebtoken9JWT authenticationdotenv16Environment variable managementcors2Cross-origin resource sharingnodemon3Dev auto-restart


🚀 Getting Started

Prerequisites


Node.js v18 or higher
npm v9 or higher
MongoDB (optional — app falls back to local JSON if not available)


1. Clone the repository

bashgit clone https://github.com/your-username/aegisfit.git
cd aegisfit

2. Install dependencies

bash# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

3. Set up environment variables

Create a .env file inside the backend/ folder:

envPORT=5000
MONGO_URI=mongodb://localhost:27017/aegisfit
JWT_SECRET=your_jwt_secret_key_here
ADMIN_SECRET=your_admin_secret_key
COACH_SECRET=your_coach_secret_key
GYM_SECRET=your_gym_owner_secret_key


If MONGO_URI is unreachable, AegisFit automatically switches to local JSON file storage inside backend/data/. No extra setup needed.



4. Run the app

bash# Terminal 1 — start the backend (from /backend)
npm run dev

# Terminal 2 — start the frontend (from /frontend)
npm run dev

Frontend runs at http://localhost:3000

Backend API runs at http://localhost:5000


🔑 Environment Variables

VariableRequiredDescriptionPORTNoBackend port (default: 5000)MONGO_URINoMongoDB connection stringJWT_SECRETYesSecret key for signing JWT tokensADMIN_SECRETNoSecret key required to register as AdminCOACH_SECRETNoSecret key required to register as CoachGYM_SECRETNoSecret key required to register as Gym Owner


📡 API Endpoints

Auth

MethodEndpointAccessDescriptionPOST/api/auth/registerPublicRegister a new userPOST/api/auth/loginPublicLogin and receive JWT

Meal Plans

MethodEndpointAccessDescriptionPOST/api/ai/meal-planPrivateGenerate a new AI meal planPOST/api/mealplansPrivateSave a generated meal planGET/api/mealplansPrivateGet all saved meal plans for userDELETE/api/mealplans/:idPrivateDelete a saved meal plan

Routines

MethodEndpointAccessDescriptionGET/api/routinesPrivateGet user's workout routinesPOST/api/routinesPrivateCreate a new routineDELETE/api/routines/:idPrivateDelete a routine

Bookings

MethodEndpointAccessDescriptionGET/api/bookingsPrivateGet user's bookingsPOST/api/bookingsPrivateBook a sessionDELETE/api/bookings/:idPrivateCancel a booking

Challenges

MethodEndpointAccessDescriptionGET/api/challengesPrivateGet all challengesPOST/api/challenges/:id/joinPrivateJoin a challenge

Messages

MethodEndpointAccessDescriptionGET/api/messagesPrivateGet messagesPOST/api/messagesPrivateSend a message


👥 Roles & Permissions

RoleRegistrationCapabilities🏋️ UserOpenMeal planner, routine builder, challenges, bookings, leaderboard, live chat🎓 CoachRequires coach secret keyAll User features + manage clients, set availability, accept bookings🏢 Gym OwnerRequires gym owner secret keyAll User features + publish classes, manage gym slots and entries🛡️ AdminRequires admin secret keyFull access — approve profiles, moderate content, run network audits


📁 Folder Structure

Gym-Fitness/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB + local JSON fallback setup
│   ├── data/                   # Auto-generated local JSON DB files
│   ├── middleware/
│   │   └── auth.js             # JWT protect middleware
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Challenge.js
│   │   ├── MealPlan.js
│   │   ├── Message.js
│   │   ├── Routine.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── challenges.js
│   │   ├── mealplans.js
│   │   ├── messages.js
│   │   └── routines.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/             # Background images and icons
    │   ├── components/
    │   │   ├── AIMealPlanner.jsx
    │   │   ├── CalendarBooking.jsx
    │   │   ├── DragDropBuilder.jsx
    │   │   ├── LiveChat.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Home.jsx
    │   │   ├── Leaderboard.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js


🗄️ Database Fallback Mode

AegisFit ships with a built-in local JSON file database fallback. If MongoDB is not available or the connection fails, the app automatically switches to storing all data in backend/data/*.json files — one per collection. This means you can run and demo the full app with zero database setup.

When MongoDB becomes available, simply restart the backend and it will connect automatically.


🔒 NIC Validation

AegisFit supports both Sri Lankan NIC formats:


Old format — 9 digits followed by V (e.g. 991234567V)
New format — 12 digits only (e.g. 199912345678)


Input is validated both live (as the user types) and on form submission.


📄 License

This project is licensed under the MIT License.


🙌 Acknowledgements

Built with ❤️ using React, Node.js, Express, and MongoDB.
