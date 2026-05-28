# Student Portfolio & Placement Portal

A responsive student portfolio and campus placement portal built with Express, MongoDB, HTML, CSS, and JavaScript.

## Features

- MongoDB-backed student profiles, jobs, applications, and dashboard stats
- Student profile creation with branch, year, CGPA, skills, portfolio URL, and status
- Placement drive posting for company roles, package, location, and eligibility
- Responsive CSS design with image-backed hero, portfolio, and form sections
- Seed script with sample student and placement data

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   copy .env.example .env
   ```

3. Start MongoDB locally or use a MongoDB Atlas connection string in `.env`.

4. Add sample data:

   ```bash
   npm run seed
   ```

5. Start the portal:

   ```bash
   npm start
   ```

6. Open `http://localhost:3000`.

## MongoDB Collections

- `students`
- `jobs`
- `applications`

The server creates basic indexes when it starts.
