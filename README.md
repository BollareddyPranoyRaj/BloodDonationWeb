# Blood Donation Web

A full-stack blood donation management platform built for Aditya University. The project supports donor registration, event management, manual donor entry for staff and guest/management donors, donation confirmation, gallery management, and a live dashboard for tracking impact.

## Features

- Public donor registration flow
- Event listing and event-based registration selection
- Admin login and admin workspace
- Blood camp creation with image upload
- Gallery image upload and display
- Donation desk flow to confirm completed donations
- Manual donor entry for staff and guest/management donors
- Live dashboard with donor demographics and event-wise donation analytics

## Tech Stack

- Frontend: React, React Router, React Bootstrap, Axios, Recharts, Socket.IO Client
- Backend: Node.js, Express, Mongoose, Socket.IO, Multer
- Database: MongoDB

## Project Structure

```text
BloodDonationWeb/
├── bd_backend/   # Express + MongoDB backend
└── bd_frontend/  # React frontend
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/BollareddyPranoyRaj/BloodDonationWeb.git
cd BloodDonationWeb
```

### 2. Install dependencies

Backend:

```bash
cd bd_backend
npm install
```

Frontend:

```bash
cd ../bd_frontend
npm install
```

### 3. Configure backend environment

Create a `.env` file inside `bd_backend/`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/blood_donation_db
```

If you use a different MongoDB connection string, replace it here.

### 4. Run the backend

```bash
cd bd_backend
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

### 5. Run the frontend

Open a new terminal:

```bash
cd bd_frontend
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Available Scripts

Frontend:

```bash
npm start
npm run build
```

Backend:

```bash
npm start
npm run dev
```

## Main Workflows

### Donor Registration

- Users can select a blood donation event
- Users register using roll number, phone number, and event date
- Registration is stored in MongoDB

### Admin Operations

- Create blood donation events
- Upload gallery images
- Confirm completed student donations from the donation desk
- Add staff donors manually
- Add guest/management donors manually

### Live Dashboard

- Shows actual donors, units collected, camps organized, and registrations
- Displays donor demographics by category
- Displays confirmed donations by event

## Notes

- The project requires MongoDB to be running locally unless you configure a remote `MONGODB_URI`
- Uploaded event and gallery images are stored by the backend
- Build output for the frontend is generated inside `bd_frontend/build`

## Future Improvements

- README screenshots or demo GIF
- Deployment instructions
- Admin-side donor list/export
- More validation and error handling

## Author

Bollareddy Pranoy Raj
