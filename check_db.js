import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://g_kentei_prep_app_db_user:0vZFHekJvsuMexPcBCKx5Ix4Noy7WZJO@dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com/g_kentei_prep_app_db';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const checkDB = async () => {
    try {
        console.log("Checking toeic_categories...");
        const res = await pool.query('SELECT * FROM toeic_categories');
        console.log("toeic_categories rows:", res.rows);

        console.log("Checking categories (legacy/G-Kentei)...");
        const resLegacy = await pool.query('SELECT * FROM categories LIMIT 5');
        console.log("categories rows:", resLegacy.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

checkDB();
