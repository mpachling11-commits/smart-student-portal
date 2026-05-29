const { closeDB, connectDB, dbName } = require("./db");
require("dotenv").config();

const students = [
  { name: "Aarav Sharma", branch: "Computer Science", year: 4, cgpa: 9.1, skills: ["React", "Node.js", "MongoDB"], projects: ["Placement analytics dashboard", "Resume parser"], certifications: ["AWS Cloud Foundations"], portfolioUrl: "https://example.com/aarav", status: "Placed at Infosys", createdAt: new Date() },
  { name: "Meera Nair", branch: "Information Technology", year: 3, cgpa: 8.8, skills: ["Python", "Machine Learning", "SQL"], projects: ["Student dropout predictor", "Interview chatbot"], certifications: ["Google Data Analytics"], portfolioUrl: "https://example.com/meera", status: "Open to opportunities", createdAt: new Date() },
  { name: "Kabir Verma", branch: "Electronics", year: 4, cgpa: 8.4, skills: ["IoT", "Embedded C", "Cloud"], projects: ["Smart attendance device", "Sensor data API"], certifications: ["Cisco IoT"], portfolioUrl: "https://example.com/kabir", status: "Interviewing", createdAt: new Date() },
  { name: "Nisha Patel", branch: "Computer Science", year: 4, cgpa: 9.4, skills: ["Java", "Spring Boot", "SQL"], projects: ["Campus grievance portal", "Library automation"], certifications: ["Oracle Java Foundations"], portfolioUrl: "https://example.com/nisha", status: "Open to opportunities", createdAt: new Date() },
  { name: "Rohan Das", branch: "Data Science", year: 3, cgpa: 8.6, skills: ["Python", "Power BI", "Statistics"], projects: ["Hiring funnel BI report", "Salary trend model"], certifications: ["Microsoft Power BI"], portfolioUrl: "https://example.com/rohan", status: "Shortlisted", createdAt: new Date() },
  { name: "Sara Khan", branch: "Information Technology", year: 4, cgpa: 8.9, skills: ["UI/UX", "React", "Figma"], projects: ["Alumni mentoring app", "Accessible design system"], certifications: ["Meta Front-End Developer"], portfolioUrl: "https://example.com/sara", status: "Open to opportunities", createdAt: new Date() }
];

const jobs = [
  { company: "Tata Consultancy Services", role: "Graduate Software Engineer", location: "Bengaluru", package: "7.5 LPA", eligibility: "CGPA 7.0+, CS/IT/ECE", requiredSkills: ["Java", "SQL", "Cloud"], deadline: "2026-06-20", type: "Full-time", postedAt: new Date() },
  { company: "Zoho", role: "Product Developer Intern", location: "Chennai", package: "35K/month", eligibility: "Strong DSA and web projects", requiredSkills: ["React", "Node.js", "MongoDB"], deadline: "2026-06-12", type: "Internship", postedAt: new Date() },
  { company: "Accenture", role: "Associate Data Analyst", location: "Hyderabad", package: "6.8 LPA", eligibility: "CGPA 7.5+, SQL and analytics", requiredSkills: ["Python", "SQL", "Power BI"], deadline: "2026-06-18", type: "Full-time", postedAt: new Date() },
  { company: "Freshworks", role: "UI Engineer", location: "Chennai", package: "10 LPA", eligibility: "Frontend portfolio and CGPA 7.5+", requiredSkills: ["React", "UI/UX", "Figma"], deadline: "2026-06-25", type: "Full-time", postedAt: new Date() }
];

async function seed() {
  const db = await connectDB();

  await db.collection("students").deleteMany({});
  await db.collection("jobs").deleteMany({});
  await db.collection("applications").deleteMany({});
  await db.collection("students").insertMany(students);
  await db.collection("jobs").insertMany(jobs);

  console.log(`Seeded ${students.length} students and ${jobs.length} jobs into ${dbName}.`);
  await closeDB();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
