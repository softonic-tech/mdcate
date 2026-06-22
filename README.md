# medprep.study

A full-stack web application for MDCAT exam preparation at [medprep.study](https://medprep.study) — authentication, user profiles, billing, and more.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT, Google OAuth, Facebook OAuth
- **Storage:** Cloudinary (for profile pictures)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance
- Cloudinary account
- Google/Facebook OAuth credentials (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/connect2abdulaziz/mdcate-project.git
   cd mdcate-project
   ```

2. **Switch to development branch**

   ```bash
   git checkout dev
   ```

3. **Install dependencies**

   ```bash
   # Install frontend dependencies
   cd frontend && npm install

   # Install backend dependencies
   cd ../backend && npm install
   ```

4. **Environment Setup**

   Create the following environment files:

   - `backend/.env` - Backend environment variables
   - `frontend/.env.local` - Frontend environment variables

   Contact the team lead for the required environment variables.

5. **Run the application**

   Open two terminal windows:

   ```bash
   # Terminal 1 - Frontend (from frontend directory)
   cd frontend
   npm run dev
   ```

   ```bash
   # Terminal 2 - Backend (from backend directory)
   cd backend
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Contributing

### Creating a New Feature

1. **Create a feature branch from `dev`**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes and commit**

   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```

3. **Push your feature branch**

   ```bash
   git push origin feat/your-feature-name
   ```

4. **Create a Pull Request**

   - Go to GitHub and create a PR from your feature branch to `dev`
   - Request a code review from team members

### Commit Message Guidelines

Follow the conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/description` - Documentation updates

## Project Structure

```
mdcate-project/
├── frontend/          # Next.js frontend application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── context/       # React context providers
│   ├── api/           # API client functions
│   └── styles/        # CSS modules
│
├── backend/           # Express.js backend API
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middlewares/   # Custom middlewares
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
│
└── README.md
```

## License

This project is private and for educational purposes only.
