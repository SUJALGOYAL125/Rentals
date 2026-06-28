# Rentals 🏠

A full-stack Airbnb-style property rental and booking platform built with Node.js, Express, and MongoDB. Hosts can list properties; guests can browse, book, and save favourites — with built-in protection against double-booking.

**Live Demo:** https://rentals-9vg2.onrender.com
*(Free-tier hosting — the first load after inactivity may take 30–60 seconds to wake up.)*

## Features

- **Authentication & Roles** — Session-based login/signup with role-based access for two user types: guests and hosts.
- **Property Management** — Hosts can add, edit, and delete property listings with photo uploads.
- **Booking System** — Guests can book properties for specific date ranges.
- **Double-Booking Prevention** — Server-side date-overlap validation ensures a property can never be booked for conflicting dates.
- **Favourites** — Guests can save properties to a personal favourites list.
- **Host Dashboard** — Hosts can view all bookings made across their properties, including guest details and booking status.
- **Cloud Image Storage** — Property photos are uploaded directly to Cloudinary, so images persist across deployments.
- **City Search** — Guests can filter available properties by city.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Templating:** EJS
- **Styling:** Tailwind CSS
- **Authentication:** express-session with MongoDB session store
- **File Uploads:** Multer + Cloudinary
- **Validation:** express-validator
- **Deployment:** Render

## Key Technical Detail: Double-Booking Prevention

Before saving a new booking, the app queries existing confirmed bookings for that property and checks for date-range overlap using the standard interval-intersection condition:

existing.checkInDate < new.checkOutDate  AND  existing.checkOutDate > new.checkInDate

If any existing booking satisfies this condition, the new booking is rejected and the guest is redirected back to the booking form with an error message, rather than allowing the conflicting reservation to save.

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas account (or local MongoDB instance)
- A Cloudinary account (free tier)

### Installation

1. Clone the repository
   git clone https://github.com/SUJALGOYAL125/Rentals.gitcd Rentals

2. Install dependencies
   npm install

3. Create a `.env` file in the project root with:
   DB_PATH=your_mongodb_connection_string
   SESSION_SECRET=your_random_session_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

4. Build the Tailwind CSS
   npm run tailwind

5. Start the server (in a separate terminal)
   node app.js

6. Visit `http://localhost:3002`

## Project Structure
  6. Visit `http://localhost:3002`

## Project Structure

├── controllers/      # Route handler logic

├── models/           # Mongoose schemas (User, Home, Booking)

├── routes/           # Express route definitions

├── views/            # EJS templates

├── public/           # Static assets, compiled CSS

├── utils/            # Helper utilities

└── app.js            # App entry point

## Known Limitations / Future Improvements

- No automated tests yet
- No payment integration (bookings are simulated as "confirmed" without real payment)
- No email notifications for booking confirmations
- Reviews/ratings are static fields rather than guest-submitted reviews
- Free-tier hosting means the app sleeps after inactivity, causing a cold-start delay on first request

## Author

Sujal Goyal
