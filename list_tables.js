import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://g_kentei_prep_app_db_user:0vZFHekJvsuMexPcBCKx5Ix4Noy7WZJO@dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com/g_kentei_prep_app_db';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'toeic_%'
        `);
        console.log("Tables with 'toeic_' prefix:");
        res.rows.forEach(row => console.log(` - ${row.table_name}`));
        
        const allRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("\nAll tables in public schema:");
        allRes.rows.forEach(row => console.log(` - ${row.table_name}`));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

listTables();
