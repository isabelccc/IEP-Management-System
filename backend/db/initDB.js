
import { pool } from '../config/database.js'
async function initDB() {

    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS schools(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        district_name VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
         
        `)
        console.log('DB initialized: school table ready');
        await pool.query(
            `CREATE TABLE IF NOT EXISTS students(
            id SERIAL PRIMARY KEY,
            school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
            student_number VARCHAR(20) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            date_of_birth DATE,
            grade_level integer, 
            guardian_contact varchar(255),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            `
        )
        console.log('DB initialized: students table ready');

        await pool.query(
            `CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            is_active boolean DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
            `
        )
        console.log('DB initialized: users table ready');

        await pool.query(
            `CREATE TABLE IF NOT EXISTS ieps(
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            case_manager_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            start_date DATE,
            end_date DATE,
            meeting_time TIMESTAMPTZ,
            status VARCHAR(20) NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'review', 'finalized')),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            CHECK (end_date >= start_date)
            );
            CREATE INDEX IF NOT EXISTS idx_ieps_student_id 
                ON ieps(student_id);
            CREATE INDEX IF NOT EXISTS idx_ieps_status
                ON ieps(status);
            `
        )
        console.log('DB initialized: ieps table ready');
        await pool.query(
            `CREATE TABLE IF NOT EXISTS iep_present_levels(
            id SERIAL PRIMARY KEY,
            iep_id INTEGER NOT NULL UNIQUE REFERENCES ieps(id) ON DELETE CASCADE,
            academic_summary TEXT,
            functional_summary TEXT,
            baseline_notes TEXT,
            updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        ); CREATE INDEX IF NOT EXISTS idx_present_levels_iep_id ON iep_present_levels(iep_id);
            `
        )
        console.log('DB initialized: iep_present_levels table ready');

        await pool.query(
            `CREATE TABLE IF NOT EXISTS iep_goals (
            id SERIAL PRIMARY KEY,
            iep_id INTEGER NOT NULL REFERENCES ieps(id) ON DELETE CASCADE,

            goal_area VARCHAR(80) NOT NULL,                
            baseline_statement TEXT,
            goal_statement TEXT NOT NULL,
            measurement_method VARCHAR(120),
            criteria VARCHAR(120),
            target_date DATE,
            status VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'met', 'discontinued')),

            created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_goals_iep_id ON iep_goals(iep_id);
            CREATE INDEX IF NOT EXISTS idx_goals_status ON iep_goals(status);`
        )
        console.log('DB initialized: iep_goals table ready');


        await pool.query(
            `CREATE TABLE IF NOT EXISTS goal_progress_updates(
                id SERIAL PRIMARY KEY,
                iep_goal_id INTEGER NOT NULL REFERENCES iep_goals(id) ON DELETE CASCADE,

                progress_date DATE NOT NULL,
                progress_value NUMERIC(10,2),       -- flexible; can store % or score
                progress_note TEXT,

                reported_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );

            CREATE INDEX IF NOT EXISTS idx_progress_goal_id ON goal_progress_updates(iep_goal_id);
            CREATE INDEX IF NOT EXISTS idx_progress_date ON goal_progress_updates(progress_date);
            `
        )
        console.log('DB initialized: goal_progress_updates table ready');
        await pool.query(
            `CREATE TABLE IF NOT EXISTS accommodations(
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                category VARCHAR(80),
                description TEXT,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );

            CREATE INDEX IF NOT EXISTS idx_accommodations_active ON accommodations(is_active);`
        )
        console.log('DB initialized: accommodations table ready');
        await pool.query(
            `CREATE TABLE IF NOT EXISTS iep_accommodations(
            id SERIAL PRIMARY KEY,
            iep_id INTEGER NOT NULL REFERENCES ieps(id) ON DELETE CASCADE,
            accommodation_id INTEGER NOT NULL REFERENCES accommodations(id) ON DELETE RESTRICT,
            notes TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),

            UNIQUE (iep_id, accommodation_id)
            );

            CREATE INDEX IF NOT EXISTS idx_iep_acc_iep_id ON iep_accommodations(iep_id);`
        )
        console.log('DB initialized: iep_accommodations table ready');
        await pool.query(
        `CREATE TABLE IF NOT EXISTS assessments(
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,

            assessment_name VARCHAR(150) NOT NULL,
            assessment_date DATE NOT NULL,

            score_value VARCHAR(50),      -- sometimes not numeric (e.g., "Level K")
            score_type VARCHAR(50),       -- e.g. percentile, raw, scaled
            notes TEXT,

            entered_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
            CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date);`
    )
        console.log('DB initialized: assessments table ready');
        await pool.query(
        `CREATE TABLE IF NOT EXISTS teacher_observations(
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,

            observation_date DATE NOT NULL,
            observation_text TEXT NOT NULL,

            domain VARCHAR(80),            -- e.g. academics/behavior/social
            entered_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

            created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );

        CREATE INDEX IF NOT EXISTS idx_observations_student_id ON teacher_observations(student_id);
        CREATE INDEX IF NOT EXISTS idx_observations_date ON teacher_observations(observation_date);created_at TIMESTAMP NOT NULL DEFAULT NOW()
        `
        )
        console.log('DB initialized: teacher_observations table ready');
        
    } catch (err) {
        console.error(err)
    }

}




export default initDB;