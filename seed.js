const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "student_placement_portal";

const students = [
  { name: "Aarav Sharma", branch: "Computer Science", year: 4, cgpa: 9.1, skills: ["React", "Node.js", "MongoDB"], portfolioUrl: "https://example.com/aarav", status: "Placed at Infosys", createdAt: new Date() },
  { name: "Meera Nair", branch: "Information Technology", year: 3, cgpa: 8.8, skills: ["Python", "Machine Learning", "SQL"], portfolioUrl: "https://example.com/meera", status: "Open to opportunities", createdAt: new Date() },
  { name: "Kabir Verma", branch: "Electronics", year: 4, cgpa: 8.4, skills: ["IoT", "Embedded C", "Cloud"], portfolioUrl: "https://example.com/kabir", status: "Interviewing", createdAt: new Date() }
];

const jobs = [
  { company: "Tata Consultancy Services", role: "Graduate Software Engineer", location: "Bengaluru", package: "7.5 LPA", eligibility: "CGPA 7.0+, CS/IT/ECE", type: "Full-time", postedAt: new Date() },
  { company: "Zoho", role: "Product Developer Intern", location: "Chennai", package: "35K/month", eligibility: "Strong DSA and web projects", type: "Internship", postedAt: new Date() },
  { company: "Accenture", role: "Associate Data Analyst", location: "Hyderabad", package: "6.8 LPA", eligibility: "CGPA 7.5+, SQL and analytics", type: "Full-time", postedAt: new Date() }
];

async function seed() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);

  await db.collection("students").deleteMany({});
  await db.collection("jobs").deleteMany({});
  await db.collection("applications").deleteMany({});
  await db.collection("students").insertMany(students);
  await db.collection("jobs").insertMany(jobs);

  console.log(`Seeded ${students.length} students and ${jobs.length} jobs into ${dbName}.`);
  await client.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
