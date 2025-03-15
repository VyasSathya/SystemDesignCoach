# System Design Coach

An interactive platform for learning and practicing system design with AI-powered coaching, interviewing, and grading capabilities.

## Current Development State

This project is in active development. Currently, the Requirements Page and basic infrastructure are implemented.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (v4.4 or higher)

## Environment Setup

1. Create `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_uri
ANTHROPIC_API_KEY=your_anthropic_api_key
```

2. Create `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

## Running the Application

From the root directory, run:
```bash
npm run dev
```

This will start both the server (port 3000) and client (port 3001) in development mode using concurrently.

Alternatively, you can run them separately:

Server:
```bash
cd server
npm run dev
```

Client:
```bash
cd client
npm run dev
```

## Current Features

- Requirements definition page with:
  - Functional requirements management
  - Non-functional requirements categorization
  - Constraints and assumptions tracking
  - Auto-save functionality
  - Progress validation

## Known Issues

- AI integration is in progress
- Some persona configurations need to be completed
- Database seeding for initial problems pending

## Next Steps

See `todolist-phase1.md` for upcoming features and development priorities.

## Project Structure

```
├── client/               # Next.js frontend
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   └── data/           # Static data and configurations
├── server/              # Node.js backend
│   ├── routes/         # API routes
│   ├── models/         # Database models
│   └── services/       # Business logic
└── data/               # Shared data structures
```

## Contributing

This project is currently in development. Please check `todolist-phase1.md` for priority tasks.
