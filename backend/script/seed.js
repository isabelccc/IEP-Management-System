import fs from "fs/promises";
import { pool } from "../config/database.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedSchools(client) {
  const filePath = path.resolve(__dirname, "schoolData.json");
  console.log("Reading schools seed file:", filePath);

  const raw = await fs.readFile(filePath, "utf8");
  const schools = JSON.parse(raw);

  if (!Array.isArray(schools) || schools.length === 0) {
    console.log("No schools found in seed file");
    return;
  }

  // Clear schools first (CASCADE will delete users that depend on schools)
  await client.query("TRUNCATE TABLE schools RESTART IDENTITY CASCADE");

  const insertSql = `
    INSERT INTO schools (name, district_name, address, phone, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id, name
  `;

  const nameToId = new Map();
  let inserted = 0;

  for (const s of schools) {
    const name = (s.name || "").trim();
    const district = (s.district_name || "").trim();
    const address = (s.address || "").trim() || null;
    const phone = (s.phone || "").trim() || null;

    if (!district) {
      console.log("Skipping invalid school (missing district_name):", s);
      continue;
    }

    const result = await client.query(insertSql, [name, district, address, phone]);
    nameToId.set(result.rows[0].name, result.rows[0].id);
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} schools`);
  return nameToId;
}

async function seedUsers(client, nameToId) {
  const filePath = path.resolve(__dirname, "userData.json");
  console.log("Reading users seed file:", filePath);

  const raw = await fs.readFile(filePath, "utf8");
  const users = JSON.parse(raw);

  if (!Array.isArray(users) || users.length === 0) {
    console.log("No users found in seed file");
    return;
  }

  // optional: clear users (not needed if you truncated schools CASCADE)
  await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

  const insertSql = `
    INSERT INTO users (school_id, first_name, last_name, email, password_hash, role, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
  `;

  let inserted = 0;

  for (const u of users) {
    // Option A: userData.json already has school_id
    let schoolId = u.school_id;

    // Option B: userData.json has school_name instead, map to id
    if (!schoolId && u.school_name) {
      schoolId = nameToId?.get(u.school_name) ?? null;
    }

    const firstName = (u.first_name || "").trim();
    const lastName = (u.last_name || "").trim();
    const email = (u.email || "").trim();
    const passwordHash = (u.password_hash || "").trim();
    const role = (u.role || "admin").trim();

    if (!schoolId || !firstName || !lastName || !email || !passwordHash) {
      console.log("Skipping invalid user:", u);
      continue;
    }

    await client.query(insertSql, [schoolId, firstName, lastName, email, passwordHash, role]);
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} users`);
}

async function seedStudents(client, nameToId) {
  const filePath = path.resolve(__dirname, "studentData.json");
  console.log("Reading students seed file:", filePath);

  const raw = await fs.readFile(filePath, "utf8");
  const students = JSON.parse(raw);

  if (!Array.isArray(students) || students.length === 0) {
    console.log("No students found in seed file");
    return;
  }

  await client.query("TRUNCATE TABLE students RESTART IDENTITY CASCADE");

  const insertSql = `
    INSERT INTO students (
      school_id,
      student_number,
      first_name,
      last_name,
      date_of_birth,
      grade_level,
      guardian_contact,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  `;

  let inserted = 0;

  for (const s of students) {
    let schoolId = s.school_id;
    if (!schoolId && s.school_name) {
      schoolId = nameToId?.get(s.school_name) ?? null;
    }

    const studentNumber = (s.student_number || "").trim();
    const firstName = (s.first_name || "").trim();
    const lastName = (s.last_name || "").trim();
    const dateOfBirth = s.date_of_birth || null;
    const gradeLevel = Number.isInteger(s.grade_level) ? s.grade_level : null;
    const guardianContact = (s.guardian_contact || "").trim() || null;

    if (!schoolId || !studentNumber || !firstName || !lastName) {
      console.log("Skipping invalid student:", s);
      continue;
    }

    await client.query(insertSql, [
      schoolId,
      studentNumber,
      firstName,
      lastName,
      dateOfBirth,
      gradeLevel,
      guardianContact
    ]);
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} students`);
}

async function seedIEPs(client) {
  const filePath = path.resolve(__dirname, "iepData.json");
  console.log("Reading IEPs seed file:", filePath);

  const raw = await fs.readFile(filePath, "utf8");
  const ieps = JSON.parse(raw);

  if (!Array.isArray(ieps) || ieps.length === 0) {
    console.log("No IEPs found in seed file");
    return;
  }

  const studentsResult = await client.query(
    "SELECT id, student_number FROM students"
  );
  const usersResult = await client.query(
    "SELECT id, email FROM users"
  );

  const studentNumberToId = new Map(
    studentsResult.rows.map((s) => [s.student_number, s.id])
  );
  const emailToUserId = new Map(
    usersResult.rows.map((u) => [u.email, u.id])
  );

  await client.query("TRUNCATE TABLE ieps RESTART IDENTITY CASCADE");

  const insertSql = `
    INSERT INTO ieps (
      student_id,
      case_manager_user_id,
      start_date,
      end_date,
      meeting_time,
      meeting_link,
      status,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
  `;

  let inserted = 0;

  for (const i of ieps) {
    let studentId = i.student_id;
    if (!studentId && i.student_number) {
      studentId = studentNumberToId.get(i.student_number) ?? null;
    }

    let caseManagerUserId = i.case_manager_user_id;
    if (!caseManagerUserId && i.case_manager_email) {
      caseManagerUserId = emailToUserId.get(i.case_manager_email) ?? null;
    }

    const startDate = i.start_date || null;
    const endDate = i.end_date || null;
    const meetingTime = i.meeting_time || null;
    const meetingLink = i.meeting_link || null;
    const status = (i.status || "draft").trim();

    if (!studentId || !caseManagerUserId) {
      console.log("Skipping invalid IEP (missing student/case manager):", i);
      continue;
    }

    await client.query(insertSql, [
      studentId,
      caseManagerUserId,
      startDate,
      endDate,
      meetingTime,
      meetingLink,
      status
    ]);
    inserted++;
  }

  console.log(`✅ Seeded ${inserted} IEPs`);
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const nameToId = await seedSchools(client);
    await seedUsers(client, nameToId);
    await seedStudents(client, nameToId);
    await seedIEPs(client);

    await client.query("COMMIT");
    console.log("🎉 Done seeding");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();