# Smart Student Portfolio Placement Portal

A ready-to-use student portfolio and campus placement portal built with Express, MongoDB, HTML, CSS, and JavaScript.

## Features

- MongoDB-backed student profiles, placement jobs, applications, and dashboard stats
- Student portfolio builder with CGPA, branch, skills, projects, certifications, status, and portfolio URL
- Placement drive posting with eligibility, package, job type, deadline, and required skills
- Smart candidate matching by job skills and CGPA
- Search and filtering for students and jobs
- Application submission and recent application tracker
- Responsive website with image-backed sections

## Run the Website

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the environment file:

   ```bash
   copy .env.example .env
   ```

3. Start MongoDB locally, or add your MongoDB Atlas connection string in `.env`.

4. Add sample data:

   ```bash
   npm run seed
   ```

5. Start the portal:

   ```bash
   npm start
   ```

6. Open:

   ```text
   http://localhost:3000
   ```

## Database Access Steps

### Option 1: Local MongoDB Compass

1. Install and open MongoDB Compass.
2. Start your local MongoDB service.
3. Connect with:

   ```text
   mongodb://127.0.0.1:27017
   ```

4. Open the database:

   ```text
   student_placement_portal
   ```

5. Browse these collections:

   ```text
   students
   jobs
   applications
   ```

### Option 2: MongoDB Shell

```bash
mongosh
use student_placement_portal
show collections
db.students.find()
db.jobs.find()
db.applications.find()
```

### Option 3: MongoDB Atlas

1. Create a free Atlas cluster.
2. Create a database user and allow your IP address in Network Access.
3. Copy your Atlas connection string.
4. Paste it into `.env`:

   ```text
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster-name.mongodb.net
   DB_NAME=student_placement_portal
   PORT=3000
   ```

5. Run:

   ```bash
   npm run seed
   npm start
   ```

## API Endpoints

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/students`
- `POST /api/students`
- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/matches/:jobId`
- `GET /api/applications`
- `POST /api/applications`

The server creates useful indexes for student search, job matching, and unique student-job applications when it starts.
