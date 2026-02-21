import { pool } from '../config/database.js'

const resolveCaseManagerUserId = async (providedUserId) => {
    if (providedUserId) return providedUserId;

    const activeUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE is_active = true
        ORDER BY id
        LIMIT 1
        `
    );
    if (activeUser.rows.length > 0) return activeUser.rows[0].id;

    const anyUser = await pool.query(
        `
        SELECT id
        FROM users
        ORDER BY id
        LIMIT 1
        `
    );
    return anyUser.rows[0]?.id || null;
};

const resolveStudentId = async ({ student_id, student_name }) => {
    if (student_id) return student_id;
    if (!student_name || !student_name.trim()) return null;

    const normalized = student_name.trim().replace(/\s+/g, ' ');
    const existing = await pool.query(
        `
        SELECT id
        FROM students
        WHERE LOWER(CONCAT(first_name, ' ', last_name)) = LOWER($1)
        LIMIT 1
        `,
        [normalized]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const schoolResult = await pool.query(
        `
        SELECT id
        FROM schools
        ORDER BY id
        LIMIT 1
        `
    );
    if (schoolResult.rows.length === 0) return null;

    const parts = normalized.split(' ');
    const first_name = parts.shift() || 'New';
    const last_name = parts.join(' ') || 'Student';
    const student_number = `AUTO-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;

    const created = await pool.query(
        `
        INSERT INTO students (
            school_id,
            student_number,
            first_name,
            last_name,
            date_of_birth,
            grade_level,
            guardian_contact
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [schoolResult.rows[0].id, student_number, first_name, last_name, null, null, null]
    );

    return created.rows[0].id;
};


export const getAllIeps = async (req, res) => {
    try {
        const student_id = req.query.studentId;
        if (!student_id) {


            const result = await pool.query(
                `
            SELECT
                i.*,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name
            FROM ieps i
            JOIN students s ON s.id = i.student_id
            ORDER BY i.id
            `
            )
            return res.status(200).json(result.rows)

        }
        const result = await pool.query(
            `
            SELECT
                i.*,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name
            FROM ieps i
            JOIN students s ON s.id = i.student_id
            WHERE student_id = $1
            ORDER BY i.id
            `, [student_id]
        )


        return res.status(200).json(result.rows)

    } catch (err) {
        console.error(err)
        return res.status(500).json('Server error')


    }
}


export const getByiepId = async (req, res) => {
    try {

        const id = req.params.id;
        const result = await pool.query(
            `
            SELECT * from ieps
            WHERE id = $1

            `, [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json('No iep record found')
        }
        return res.status(200).json(result.rows[0])


    } catch (err) {
        console.error(err)
        if (err?.code === '23503') {
            return res.status(400).json({ error: err.detail || 'Invalid student_id or case_manager_user_id' });
        }
        return res.status(500).json('Server error')
    }
}

export const addIepRecord = async (req, res) => {
    try {
        const { student_id,
            student_name,
            case_manager_user_id,
            start_date,
            end_date,
            meeting_time,
            meeting_link,
            status } = req.body

        const resolvedStudentId = await resolveStudentId({ student_id, student_name });
        const resolvedCaseManagerId = await resolveCaseManagerUserId(case_manager_user_id);

        if (!resolvedStudentId) {
            return res.status(400).json({ error: 'student_name is required (or a valid student_id)' });
        }
        if (!resolvedCaseManagerId) {
            return res.status(400).json({ error: 'No case manager user available' });
        }


        const result = await pool.query(
            `
            INSERT INTO ieps(
            student_id,
            case_manager_user_id,
            start_date,
            end_date,
            meeting_time,
            meeting_link,
            status
            )
            VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING *
            `, [
            resolvedStudentId,
            resolvedCaseManagerId,
            start_date || null,
            end_date || null,
            meeting_time || null,
            meeting_link || null,
            status || null

        ]
        )
        const withStudent = await pool.query(
            `
            SELECT
                i.*,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name
            FROM ieps i
            JOIN students s ON s.id = i.student_id
            WHERE i.id = $1
            `,
            [result.rows[0].id]
        );
        return res.status(201).json(withStudent.rows[0] || result.rows[0]);

    } catch (err) {
        console.error(err)
        return res.status(500).json('Server error')
    }
}

export const updateIepById = async (req, res) => {
    try {
        const id = req.params.id
        const {
            student_id,
            case_manager_user_id,
            start_date,
            end_date,
            meeting_time
        } = req.body

        const result = await pool.query(
            `
            UPDATE ieps
            SET 
            student_id = COALESCE ($1, student_id),
            case_manager_user_id =  COALESCE ($2, case_manager_user_id),
            start_date = COALESCE ($3, start_date),
            end_date = COALESCE ($4, end_date),
            meeting_time = COALESCE ($5, meeting_time)
            WHERE id = $7
            RETURNING *
            `, [
            student_id,
            case_manager_user_id,
            start_date,
            end_date,
            meeting_time,
            id
        ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json('No record found')
        }

        return res.status(200).json(`iep record with id ${id} is updated`)


    } catch (err) {
        console.error(err)
        return res.status(500).json('Server error')
    }
}

export const addIepStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const next = req.body.status
        const allowedTransitions = {
            draft: ["review"],
            review: ["finalized"],
            finalized: []
        }
        const curResult = await pool.query(
            `
            SELECT status 
            FROM ieps
            WHERE id = $1
            `, [id]
        )
        if (curResult.rows.length === 0) {
            return res.status(404).json('No record found')
        }

        const curStatus = curResult.rows[0].status
        if (!allowedTransitions[curStatus].includes(next)) {
            return res.status(500).json('Invalid status transition')

        }
        const result = await pool.query(
            `
            UPDATE ieps
            SET status = $1
            WHERE id = $2
            RETURNING *
            `, [next, id]
        )

        return res.status(201).json(result.rows[0])


    }
    catch (err) {
        console.error(err)
        return res.status(500).json('server error')
    }
}