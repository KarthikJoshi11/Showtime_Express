# Showtime Express - Movie Ticket Booking System

## Overview
Showtime Express is a full-stack web application for booking movie tickets. It features a modern UI, tier-based pricing, and secure payment integration with Stripe. The system allows users to browse movies, select seats, and make bookings while providing theatre owners with tools to manage their shows and theatres.

## Features

### User Features
- User authentication and authorization
- Browse movies by date
- View available shows and theatres
- Select seats from different tiers (Economy, Middle, Premium)
- Real-time seat availability
- Secure payment processing via Stripe
- View booking history
- Responsive design for mobile devices

### Theatre Owner Features
- Theatre management (add, edit, delete theatres)
- Show management (add, edit, delete shows)
- Configure seat tiers and pricing
- View booking statistics
- Theatre status management (active/inactive)

## Technical Stack

### Frontend
- React.js
- Redux for state management
- Ant Design for UI components
- Moment.js for date handling
- Stripe.js for payment processing

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Stripe API for payments

## Project Structure

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   │   ├── Profile/       # User profile pages
│   │   ├── BookShow/      # Booking interface
│   │   └── TheatresForMovie/ # Theatre listing
│   ├── apicalls/          # API integration
│   ├── redux/             # Redux store and slices
│   └── stylesheets/       # CSS styles
server/
├── models/                # MongoDB schemas
├── routes/                # API routes
├── middlewares/           # Custom middlewares
└── config/               # Configuration files
```

## Key Components

### Booking System
- Tier-based pricing system with three tiers:
  - Economy
  - Middle
  - Premium
- Real-time seat selection
- Visual seat layout with tier indicators
- Price calculation based on selected seats
- Secure payment processing

### Theatre Management
- Theatre CRUD operations
- Show scheduling
- Seat configuration
- Tier pricing management
- Booking tracking

## API Endpoints

### Authentication
- POST /api/users/register
- POST /api/users/login
- GET /api/users/get-current-user

### Movies
- GET /api/movies/get-all-movies
- POST /api/movies/add-movie
- PUT /api/movies/update-movie
- DELETE /api/movies/delete-movie

### Theatres
- GET /api/theatres/get-all-theatres
- POST /api/theatres/add-theatre
- PUT /api/theatres/update-theatre
- DELETE /api/theatres/delete-theatre

### Shows
- GET /api/theatres/get-all-shows
- POST /api/theatres/add-show
- DELETE /api/theatres/delete-show

### Bookings
- POST /api/bookings/make-payment
- POST /api/bookings/book-show
- GET /api/bookings/get-bookings
- POST /api/bookings/verify-payment

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean
}
```

### Movie Schema
```javascript
{
  title: String,
  description: String,
  language: String,
  genre: String,
  duration: Number,
  releaseDate: Date,
  poster: String
}
```

### Theatre Schema
```javascript
{
  name: String,
  address: String,
  phone: String,
  email: String,
  isActive: Boolean
}
```

### Show Schema
```javascript
{
  theatre: ObjectId,
  movie: ObjectId,
  date: Date,
  time: String,
  totalSeats: Number,
  bookedSeats: [Number],
  tierPrices: {
    economy: Number,
    middle: Number,
    premium: Number
  },
  seatConfiguration: {
    economy: { start: Number, end: Number },
    middle: { start: Number, end: Number },
    premium: { start: Number, end: Number }
  }
}
```

### Booking Schema
```javascript
{
  show: ObjectId,
  user: ObjectId,
  seats: [Number],
  transactionId: String
}
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   stripe_key=your_stripe_secret_key
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Security Features
- JWT-based authentication
- Password hashing
- Protected routes
- Secure payment processing
- Input validation
- Error handling

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details. 