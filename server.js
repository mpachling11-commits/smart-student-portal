const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;

const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

const dbName =
  process.env.DB_NAME || "student_placement_portal";

let db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Convert Mongo ObjectId to string
function serialize(doc) {
  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

// Get collection safely
async function getCollection(name) {
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  return db.collection(name);
}

// Health API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: db ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Students API
app.get("/api/students", async (_req, res) => {
  try {
    const students = await (
      await getCollection("students")
    )
      .find({})
      .sort({ cgpa: -1, name: 1 })
      .limit(24)
      .toArray();

    res.json(students.map(serialize));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

// Add Student
app.post("/api/students", async (req, res) => {
  try {
    const student = {
      name: req.body.name?.trim(),
      branch: req.body.branch?.trim(),
      year: Number(req.body.year),
      cgpa: Number(req.body.cgpa),
      skills: Array.isArray(req.body.skills)
        ? req.body.skills
        : String(req.body.skills || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
      portfolioUrl: req.body.portfolioUrl?.trim(),
      status:
        req.body.status ||
        "Open to opportunities",
      createdAt: new Date(),
    };

    if (
      !student.name ||
      !student.branch ||
      !student.year ||
      !student.cgpa
    ) {
      return res.status(400).json({
        error:
          "Name, branch, year, and CGPA are required.",
      });
    }

    const result = await (
      await getCollection("students")
    ).insertOne(student);

    res.status(201).json({
      ...student,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Jobs API
app.get("/api/jobs", async (_req, res) => {
  try {
    const jobs = await (
      await getCollection("jobs")
    )
      .find({})
      .sort({ postedAt: -1 })
      .limit(20)
      .toArray();

    res.json(jobs.map(serialize));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Add Job
app.post("/api/jobs", async (req, res) => {
  try {
    const job = {
      company: req.body.company?.trim(),
      role: req.body.role?.trim(),
      location: req.body.location?.trim(),
      package: req.body.package?.trim(),
      eligibility: req.body.eligibility?.trim(),
      type: req.body.type || "Full-time",
      postedAt: new Date(),
    };

    if (
      !job.company ||
      !job.role ||
      !job.location ||
      !job.package
    ) {
      return res.status(400).json({
        error:
          "Company, role, location, and package are required.",
      });
    }

    const result = await (
      await getCollection("jobs")
    ).insertOne(job);

    res.status(201).json({
      ...job,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Applications API
app.post("/api/applications", async (req, res) => {
  try {
    const application = {
      studentId: new ObjectId(req.body.studentId),
      jobId: new ObjectId(req.body.jobId),
      coverNote:
        req.body.coverNote?.trim() || "",
      status: "Submitted",
      appliedAt: new Date(),
    };

    const result = await (
      await getCollection("applications")
    ).insertOne(application);

    res.status(201).json({
      ...application,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error:
        "Valid studentId and jobId are required.",
    });
  }
});

// Dashboard API
app.get("/api/dashboard", async (_req, res) => {
  try {
    const students =
      await getCollection("students");

    const jobs =
      await getCollection("jobs");

    const applications =
      await getCollection("applications");

    const placedCount =
      await students.countDocuments({
        status: /placed/i,
      });

    const totalStudents =
      await students.countDocuments();

    const totalJobs =
      await jobs.countDocuments();

    const totalApplications =
      await applications.countDocuments();

    res.json({
      totalStudents,
      totalJobs,
      totalApplications,
      placedCount,
      placementRate: totalStudents
        ? Math.round(
            (placedCount / totalStudents) *
              100
          )
        : 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Frontend Route
app.get("*", (_req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// Start Server
async function start() {
  try {
    console.log("Connecting to MongoDB...");

    const client = new MongoClient(mongoUri);

    await client.connect();

    console.log("MongoDB Connected");

    db = client.db(dbName);

    await db
      .collection("students")
      .createIndex({ name: 1 });

    await db
      .collection("jobs")
      .createIndex({ postedAt: -1 });

    await db
      .collection("applications")
      .createIndex({
        studentId: 1,
        jobId: 1,
      });

    app.listen(port, () => {
      console.log(
        `Server running on port ${port}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to start server:"
    );

    console.error(error);

    process.exit(1);
  }
}

start();
