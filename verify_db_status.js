import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://g_kentei_prep_app_db_user:0vZFHekJvsuMexPcBCKx5Ix4Noy7WZJO@dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com/g_kentei_prep_app_db';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const TABLES = [
    'toeic_users',
    'toeic_attempts',
    'toeic_sessions',
    'toeic_messages',
    'toeic_notifications',
    'toeic_submitted_questions',
    'toeic_todos',
    'toeic_questions',
    'toeic_public_chat',
    'toeic_categories'
];

async function verify() {
    console.log("=== TOEIC DB Status Check ===");
    for (const table of TABLES) {
        try {
            const res = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table.padEnd(25)}: ${res.rows[0].count} rows`);
        } catch (e) {
            console.log(`${table.padEnd(25)}: ERROR (Table might not exist)`);
        }
    }
    
    // Also check current questions as a sample
    try {
        const qRes = await pool.query(`SELECT category, COUNT(*) FROM toeic_questions GROUP BY category`);
        if (qRes.rows.length > 0) {
            console.log("\nQuestions by Category:");
            qRes.rows.forEach(row => {
                console.log(` - ${row.category}: ${row.count}`);
            });
        }
    } catch (e) {}

    pool.end();
}

verify();
