import { pool } from '../config/database.js'

const resolveSchoolId = async ({
    school_id,
    school_name,
    school_district_name,
    school_address,
    school_phone
}) => {
    if (school_id) return school_id;
    if (!school_name || !school_name.trim()) return null;

    const normalizedName = school_name.trim();
    const existing = await pool.query(
        `
        SELECT id
        FROM schools
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
        [normalizedName]
    );

    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    }

    const created = await pool.query(
        `
        INSERT INTO schools (name, district_name, address, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
            normalizedName,
            (school_district_name || 'Unknown District').trim(),
            (school_address || '').trim() || null,
            (school_phone || '').trim() || null
        ]
    );

    return created.rows[0].id;
};

export const getStudents = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                st.*,
                sc.name AS school_name,
                sc.district_name AS school_district_name,
                sc.address AS school_address,
                sc.phone AS school_phone
            FROM students st
            JOIN schools sc ON sc.id = st.school_id
            ORDER BY st.id
            `
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No student data is available' });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export const getStudentById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(
            `
            SELECT
                st.*,
                sc.name AS school_name,
                sc.district_name AS school_district_name,
                sc.address AS school_address,
                sc.phone AS school_phone
            FROM students st
            JOIN schools sc ON sc.id = st.school_id
            WHERE st.id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Student with id ${id} not found` });
        }

        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export const addStudent = async (req, res) => {
    try {
        const {
            school_id,
            school_name,
            school_district_name,
            school_address,
            school_phone,
            student_number,
            first_name,
            last_name,
            date_of_birth,
            grade_level,
            guardian_contact
        } = req.body;

        if ((!school_name) || !student_number || !first_name || !last_name) {
            return res.status(400).json({
                error: "school_name , student_number, first_name, and last_name are required"
            });
        }
        const resolvedSchoolId = await resolveSchoolId({
            school_id,
            school_name,
            school_district_name,
            school_address,
            school_phone
        });
        if (!resolvedSchoolId) {
            return res.status(400).json({ error: "Unable to resolve school_id from school_name" });
        }

        const inserted = await pool.query(
            `INSERT INTO students (
                school_id,
                student_number,
                first_name,
                last_name,
                date_of_birth,
                grade_level,
                guardian_contact
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                resolvedSchoolId,
                student_number,
                first_name,
                last_name,
                date_of_birth || null,
                grade_level || null,
                guardian_contact || null
            ]
        );

        const result = await pool.query(
            `
            SELECT
                st.*,
                sc.name AS school_name,
                sc.district_name AS school_district_name,
                sc.address AS school_address,
                sc.phone AS school_phone
            FROM students st
            JOIN schools sc ON sc.id = st.school_id
            WHERE st.id = $1
            `,
            [inserted.rows[0].id]
        );

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export const editStudentById = async(req, res)=>{
    try{
        const id = req.params.id;
        const {
            school_id,
            school_name,
            school_district_name,
            school_address,
            school_phone,
            student_number,
            first_name,
            last_name,
            date_of_birth,
            grade_level,
            guardian_contact
        } = req.body;
        if(!school_id && !school_name && !student_number && !first_name
            && !last_name && !date_of_birth && !grade_level && !guardian_contact
        ){
            return res.status(400).json('Please at least provide one field to update information')
        }
        const resolvedSchoolId = await resolveSchoolId({
            school_id,
            school_name,
            school_district_name,
            school_address,
            school_phone
        });

        const result = await pool.query(
            `UPDATE students
            SET
            school_id = COALESCE($1,school_id),
            student_number = COALESCE($2,student_number),
            first_name = COALESCE($3,first_name),
            last_name = COALESCE($4,last_name),
            date_of_birth = COALESCE($5,date_of_birth),
            grade_level =COALESCE($6,grade_level),
            guardian_contact = COALESCE($7,guardian_contact),
            updated_at = NOW()
            WHERE id = $8
            RETURNING *
            `,[
                resolvedSchoolId ?? null,
                student_number ?? null,
                first_name ?? null,
                last_name ?? null,
                date_of_birth ?? null,
                grade_level ?? null,
                guardian_contact ?? null,
                id
            ]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Student with id ${id} not found` });
        }

        return res.status(200).json(result.rows[0]);

    }catch(err){
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    

    }
}

export const deleteStudentById = async(req, res)=>{
    try{
        const id = req.params.id;
        const result = await pool.query(
            `
            DELETE FROM students
            WHERE id = $1
            RETURNING *
            `,[id]
        )
        if(result.rowCount === 0){
            return res.status(404).json('No student found')

        }
        return res.status(200).json({message: `student with id ${id} is deleted`, data:result.rows[0]})


    }catch(err){
        console.error(err);
        return res.status(500).json({ error: "Server error" });

    }
}