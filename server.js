const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "student_placement_portal";

let db;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function serialize(doc) {
  return { ...doc, _id: doc._id.toString() };
}

function toSkillList(value) {
  return Array.isArray(value)
    ? value.map((skill) => String(skill).trim()).filter(Boolean)
    : String(value || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
}

function buildTextRegex(value) {
  return value ? new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
}

async function getCollection(name) {
  if (!db) {
    throw new Error("Database connection is not ready");
  }
  return db.collection(name);
}

app.get("/api/health", async (_req, res) => {
  res.json({
    status: "ok",
    database: db ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/students", async (req, res) => {
  try {
    const query = {};
    const search = buildTextRegex(req.query.search);
    const branch = buildTextRegex(req.query.branch);
    const status = buildTextRegex(req.query.status);
    const skill = buildTextRegex(req.query.skill);
    const minCgpa = Number(req.query.minCgpa);

    if (search) query.$or = [{ name: search }, { branch: search }, { skills: search }, { status: search }];
    if (branch) query.branch = branch;
    if (status) query.status = status;
    if (skill) query.skills = skill;
    if (!Number.isNaN(minCgpa) && minCgpa > 0) query.cgpa = { $gte: minCgpa };

    const students = await (await getCollection("students"))
      .find(query)
      .sort({ cgpa: -1, name: 1 })
      .limit(24)
      .toArray();
    res.json(students.map(serialize));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = {
      name: req.body.name?.trim(),
      branch: req.body.branch?.trim(),
      year: Number(req.body.year),
      cgpa: Number(req.body.cgpa),
      skills: toSkillList(req.body.skills),
      projects: toSkillList(req.body.projects),
      certifications: toSkillList(req.body.certifications),
      portfolioUrl: req.body.portfolioUrl?.trim(),
      status: req.body.status || "Open to opportunities",
      createdAt: new Date()
    };

    if (!student.name || !student.branch || !student.year || !student.cgpa) {
      return res.status(400).json({ error: "Name, branch, year, and CGPA are required." });
    }

    const result = await (await getCollection("students")).insertOne(student);
    res.status(201).json({ ...student, _id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const query = {};
    const search = buildTextRegex(req.query.search);
    const type = buildTextRegex(req.query.type);

    if (search) query.$or = [{ company: search }, { role: search }, { location: search }, { eligibility: search }, { requiredSkills: search }];
    if (type) query.type = type;

    const jobs = await (await getCollection("jobs"))
      .find(query)
      .sort({ postedAt: -1 })
      .limit(20)
      .toArray();
    res.json(jobs.map(serialize));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", async (req, res) => {
  try {
    const job = {
      company: req.body.company?.trim(),
      role: req.body.role?.trim(),
      location: req.body.location?.trim(),
      package: req.body.package?.trim(),
      eligibility: req.body.eligibility?.trim(),
      type: req.body.type || "Full-time",
      requiredSkills: toSkillList(req.body.requiredSkills),
      deadline: req.body.deadline?.trim() || "",
      postedAt: new Date()
    };

    if (!job.company || !job.role || !job.location || !job.package) {
      return res.status(400).json({ error: "Company, role, location, and package are required." });
    }

    const result = await (await getCollection("jobs")).insertOne(job);
    res.status(201).json({ ...job, _id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/applications", async (req, res) => {
  try {
    const application = {
      studentId: new ObjectId(req.body.studentId),
      jobId: new ObjectId(req.body.jobId),
      coverNote: req.body.coverNote?.trim() || "",
      status: "Submitted",
      appliedAt: new Date()
    };

    const students = await getCollection("students");
    const jobs = await getCollection("jobs");
    const applications = await getCollection("applications");
    const [student, job] = await Promise.all([
      students.findOne({ _id: application.studentId }),
      jobs.findOne({ _id: application.jobId })
    ]);

    if (!student || !job) {
      return res.status(404).json({ error: "Student or job was not found." });
    }

    const existing = await applications.findOne({ studentId: application.studentId, jobId: application.jobId });
    if (existing) {
      return res.status(409).json({ error: "This student has already applied for this role." });
    }

    const result = await applications.insertOne(application);
    res.status(201).json({ ...application, _id: result.insertedId.toString() });
  } catch (_error) {
    res.status(400).json({ error: "Valid studentId and jobId are required." });
  }
});

app.get("/api/applications", async (_req, res) => {
  try {
    const applications = await (await getCollection("applications"))
      .aggregate([
        { $sort: { appliedAt: -1 } },
        { $limit: 20 },
        { $lookup: { from: "students", localField: "studentId", foreignField: "_id", as: "student" } },
        { $lookup: { from: "jobs", localField: "jobId", foreignField: "_id", as: "job" } },
        { $unwind: "$student" },
        { $unwind: "$job" },
        {
          $project: {
            coverNote: 1,
            status: 1,
            appliedAt: 1,
            studentName: "$student.name",
            studentBranch: "$student.branch",
            company: "$job.company",
            role: "$job.role"
          }
        }
      ])
      .toArray();

    res.json(applications.map(serialize));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/matches/:jobId", async (req, res) => {
  try {
    const jobId = new ObjectId(req.params.jobId);
    const jobs = await getCollection("jobs");
    const students = await getCollection("students");
    const job = await jobs.findOne({ _id: jobId });

    if (!job) {
      return res.status(404).json({ error: "Job was not found." });
    }

    const requiredSkills = (job.requiredSkills || []).map((skill) => skill.toLowerCase());
    const candidates = await students.find({}).sort({ cgpa: -1 }).toArray();
    const matches = candidates
      .map((student) => {
        const studentSkills = (student.skills || []).map((skill) => skill.toLowerCase());
        const matchedSkills = requiredSkills.filter((skill) => studentSkills.includes(skill));
        const skillScore = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0.5;
        const cgpaScore = Math.min(Number(student.cgpa || 0) / 10, 1);
        const matchScore = Math.round((skillScore * 70 + cgpaScore * 30));
        return { ...serialize(student), matchedSkills, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore || b.cgpa - a.cgpa)
      .slice(0, 6);

    res.json({ job: serialize(job), matches });
  } catch (_error) {
    res.status(400).json({ error: "Valid jobId is required." });
  }
});

app.get("/api/dashboard", async (_req, res) => {
  try {
    const students = await getCollection("students");
    const jobs = await getCollection("jobs");
    const applications = await getCollection("applications");
    const placedCount = await students.countDocuments({ status: /placed/i });
    const totalStudents = await students.countDocuments();
    const totalJobs = await jobs.countDocuments();
    const totalApplications = await applications.countDocuments();
    const topSkills = await students
      .aggregate([
        { $unwind: "$skills" },
        { $group: { _id: "$skills", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 6 }
      ])
      .toArray();

    res.json({
      totalStudents,
      totalJobs,
      totalApplications,
      placedCount,
      placementRate: totalStudents ? Math.round((placedCount / totalStudents) * 100) : 0,
      topSkills: topSkills.map((skill) => ({ name: skill._id, count: skill.count }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function start() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);

  await db.collection("students").createIndex({ name: 1 });
  await db.collection("students").createIndex({ branch: 1, cgpa: -1 });
  await db.collection("students").createIndex({ skills: 1 });
  await db.collection("jobs").createIndex({ postedAt: -1 });
  await db.collection("jobs").createIndex({ requiredSkills: 1 });
  await db.collection("applications").createIndex({ studentId: 1, jobId: 1 });

  app.listen(port, () => {
    console.log(`Student Portfolio & Placement Portal running at http://localhost:${port}`);
    console.log(`MongoDB database: ${dbName}`);
  });
}

start().catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});