# MongoDB Express API

A simple REST API built with Express.js and MongoDB for the HackTheNorth25 project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hackthenorth25
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users
- `POST /api/users` - Create new user
- `PUT /api/users/:email` - Update user by email

## Example Requests

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "points": 100}'
```

### Update User Points
```bash
curl -X PUT http://localhost:5000/api/users/john@example.com \
  -H "Content-Type: application/json" \
  -d '{"points": 150}'
```

## Models

### User Schema
- `email` (String, required, unique)
- `points` (Number, default: 0, minimum: 0)
- `createdAt` (Date, auto-generated)

## Server Info
- Server runs on port 5000 by default
- CORS enabled for cross-origin requests
- JSON parsing enabled
- Error handling middleware included
