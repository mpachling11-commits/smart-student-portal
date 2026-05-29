const studentGrid = document.querySelector("#studentGrid");
const jobList = document.querySelector("#jobList");
const dbStatus = document.querySelector("#dbStatus");
const studentForm = document.querySelector("#studentForm");
const jobForm = document.querySelector("#jobForm");
const applicationForm = document.querySelector("#applicationForm");
const studentMessage = document.querySelector("#studentMessage");
const jobMessage = document.querySelector("#jobMessage");
const applicationMessage = document.querySelector("#applicationMessage");
const refreshJobs = document.querySelector("#refreshJobs");
const studentFilters = document.querySelector("#studentFilters");
const jobFilters = document.querySelector("#jobFilters");
const studentSelect = document.querySelector("#studentSelect");
const jobSelect = document.querySelector("#jobSelect");
const applicationList = document.querySelector("#applicationList");
const matchResults = document.querySelector("#matchResults");
const topSkills = document.querySelector("#topSkills");

const studentImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
];

let studentsCache = [];
let jobsCache = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildQuery(form) {
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (String(value).trim()) params.set(key, value);
  });
  return params.toString() ? `?${params.toString()}` : "";
}

async function request(path, options) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function renderOptions() {
  studentSelect.innerHTML = studentsCache.map((student) => `<option value="${student._id}">${escapeHtml(student.name)} - ${escapeHtml(student.branch)}</option>`).join("");
  jobSelect.innerHTML = jobsCache.map((job) => `<option value="${job._id}">${escapeHtml(job.company)} - ${escapeHtml(job.role)}</option>`).join("");
}

function renderStudents(students) {
  studentsCache = students;
  renderOptions();
  if (!students.length) {
    studentGrid.innerHTML = '<div class="empty-state">No students found. Add the first profile below.</div>';
    return;
  }

  studentGrid.innerHTML = students.map((student, index) => {
    const skills = (student.skills || []).slice(0, 5).map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`).join("");
    const projects = (student.projects || []).slice(0, 2).map((project) => `<li>${escapeHtml(project)}</li>`).join("");
    const portfolio = student.portfolioUrl ? `<a class="text-link" href="${escapeHtml(student.portfolioUrl)}" target="_blank" rel="noreferrer">Portfolio</a>` : "<span>No portfolio link</span>";
    return `<article class="student-card">
      <img src="${studentImages[index % studentImages.length]}" alt="${escapeHtml(student.name)}" />
      <div class="student-body">
        <div class="student-title"><h3>${escapeHtml(student.name)}</h3><strong>${escapeHtml(student.cgpa)} CGPA</strong></div>
        <p class="meta">${escapeHtml(student.branch)} - Year ${escapeHtml(student.year)}</p>
        <p>${escapeHtml(student.status || "Open to opportunities")}</p>
        <div class="skills">${skills}</div>
        <ul class="mini-list">${projects}</ul>
        <div class="card-actions">${portfolio}</div>
      </div>
    </article>`;
  }).join("");
}

function renderJobs(jobs) {
  jobsCache = jobs;
  renderOptions();
  if (!jobs.length) {
    jobList.innerHTML = '<div class="empty-state">No placement drives posted yet.</div>';
    matchResults.innerHTML = '<div class="empty-state">Post a drive to see smart matches.</div>';
    return;
  }

  jobList.innerHTML = jobs.map((job) => {
    const skills = (job.requiredSkills || []).map((skill) => `<span class="skill">${escapeHtml(skill)}</span>`).join("");
    return `<article class="job-item">
      <div>
        <h3>${escapeHtml(job.role)}</h3>
        <p>${escapeHtml(job.company)} - ${escapeHtml(job.location)} - ${escapeHtml(job.type || "Full-time")}</p>
        <p>${escapeHtml(job.eligibility || "Eligibility details will be shared by the placement cell.")}</p>
        <div class="skills">${skills}</div>
      </div>
      <div class="job-side">
        <strong class="package">${escapeHtml(job.package)}</strong>
        <span>${job.deadline ? `Apply by ${escapeHtml(job.deadline)}` : "Deadline TBA"}</span>
        <button class="button compact" type="button" data-match="${job._id}">Find Matches</button>
      </div>
    </article>`;
  }).join("");
}

function renderApplications(applications) {
  if (!applications.length) {
    applicationList.innerHTML = '<div class="empty-state">No applications submitted yet.</div>';
    return;
  }

  applicationList.innerHTML = applications.map((application) => `<article class="application-item">
    <strong>${escapeHtml(application.studentName)}</strong>
    <span>${escapeHtml(application.role)} at ${escapeHtml(application.company)}</span>
    <small>${escapeHtml(application.status)}</small>
  </article>`).join("");
}

function renderMatches(data) {
  matchResults.innerHTML = `<h3>${escapeHtml(data.job.role)} at ${escapeHtml(data.job.company)}</h3>` + data.matches.map((student) => {
    const matched = student.matchedSkills.length ? student.matchedSkills.join(", ") : "General profile fit";
    return `<article class="match-item">
      <div><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.branch)} - CGPA ${escapeHtml(student.cgpa)}</span></div>
      <div><b>${student.matchScore}%</b><small>${escapeHtml(matched)}</small></div>
    </article>`;
  }).join("");
}

async function loadDashboard() {
  const dashboard = await request("/api/dashboard");
  document.querySelector("#statStudents").textContent = dashboard.totalStudents;
  document.querySelector("#statJobs").textContent = dashboard.totalJobs;
  document.querySelector("#statApplications").textContent = dashboard.totalApplications;
  document.querySelector("#statPlacementRate").textContent = `${dashboard.placementRate}%`;
  document.querySelector("#heroRate").textContent = `${dashboard.placementRate}%`;
  topSkills.innerHTML = dashboard.topSkills.length
    ? dashboard.topSkills.map((skill) => `<span>${escapeHtml(skill.name)} <b>${skill.count}</b></span>`).join("")
    : '<span>Add students to see skill trends</span>';
}

async function loadStudents(query = "") { renderStudents(await request(`/api/students${query}`)); }
async function loadJobs(query = "") { renderJobs(await request(`/api/jobs${query}`)); }
async function loadApplications() { renderApplications(await request("/api/applications")); }

async function checkHealth() {
  try {
    const health = await request("/api/health");
    dbStatus.textContent = health.database === "connected" ? "MongoDB connected" : "Database offline";
  } catch (_error) {
    dbStatus.textContent = "Database offline";
  }
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(studentForm).entries());
  try {
    await request("/api/students", { method: "POST", body: JSON.stringify(payload) });
    studentMessage.textContent = "Student profile saved.";
    studentForm.reset();
    await Promise.all([loadStudents(), loadDashboard()]);
  } catch (error) {
    studentMessage.textContent = error.message;
  }
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(jobForm).entries());
  try {
    await request("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
    jobMessage.textContent = "Placement role published.";
    jobForm.reset();
    await Promise.all([loadJobs(), loadDashboard()]);
  } catch (error) {
    jobMessage.textContent = error.message;
  }
});

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(applicationForm).entries());
  try {
    await request("/api/applications", { method: "POST", body: JSON.stringify(payload) });
    applicationMessage.textContent = "Application submitted.";
    applicationForm.reset();
    await Promise.all([loadApplications(), loadDashboard()]);
  } catch (error) {
    applicationMessage.textContent = error.message;
  }
});

studentFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  loadStudents(buildQuery(studentFilters));
});

jobFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  loadJobs(buildQuery(jobFilters));
});

refreshJobs.addEventListener("click", () => loadJobs());

jobList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-match]");
  if (!button) return;
  renderMatches(await request(`/api/matches/${button.dataset.match}`));
});

Promise.all([checkHealth(), loadDashboard(), loadStudents(), loadJobs(), loadApplications()])
  .then(() => jobsCache[0] && request(`/api/matches/${jobsCache[0]._id}`).then(renderMatches))
  .catch((error) => {
    dbStatus.textContent = "Start MongoDB and run npm start";
    studentGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    jobList.innerHTML = '<div class="empty-state">Jobs will appear after the API connects.</div>';
    applicationList.innerHTML = '<div class="empty-state">Applications will appear after the API connects.</div>';
  });
