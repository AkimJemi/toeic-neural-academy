import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Postgres Connection Pool
const connectionString = process.env.DATABASE_URL || 'postgresql://g_kentei_prep_app_db_user:0vZFHekJvsuMexPcBCKx5Ix4Noy7WZJO@dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com/g_kentei_prep_app_db';
console.log(`[Neural Link] Connecting to Postgres Sector (Oregon Cluster)...`);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// Table Prefixes to ensure no conflict with G-Kentei App
const TABLES = {
    users: 'toeic_users',
    attempts: 'toeic_attempts',
    sessions: 'toeic_sessions',
    messages: 'toeic_messages',
    notifications: 'toeic_notifications',
    submitted_questions: 'toeic_submitted_questions',
    todos: 'toeic_todos',
    questions: 'toeic_questions',
    public_chat: 'toeic_public_chat',
    categories: 'toeic_categories'
};

// Initialize Database Schema
const initDB = async () => {
  const client = await pool.connect();
  try {
    console.log('[Neural DB] Applying Schema Manifest with "toeic_" prefix...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLES.users} (
        userId TEXT PRIMARY KEY,
        nickname TEXT,
        role TEXT,
        status TEXT DEFAULT 'active',
        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.attempts} (
        id SERIAL PRIMARY KEY,
        userId TEXT REFERENCES ${TABLES.users}(userId),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score INTEGER,
        totalQuestions INTEGER,
        category TEXT,
        wrongQuestionIds TEXT,
        userAnswers TEXT
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.sessions} (
        userId TEXT REFERENCES ${TABLES.users}(userId),
        category TEXT,
        currentQuestionIndex INTEGER,
        answers TEXT,
        lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(userId, category)
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.messages} (
        id SERIAL PRIMARY KEY,
        userId TEXT REFERENCES ${TABLES.users}(userId),
        name TEXT,
        email TEXT,
        topic TEXT,
        message TEXT,
        reply TEXT,
        repliedAt TIMESTAMP,
        status TEXT DEFAULT 'unread',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.notifications} (
        id SERIAL PRIMARY KEY,
        userId TEXT REFERENCES ${TABLES.users}(userId),
        title TEXT,
        content TEXT,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.submitted_questions} (
        id SERIAL PRIMARY KEY,
        category TEXT,
        question TEXT,
        options TEXT,
        correctAnswer INTEGER,
        explanation TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.todos} (
        id SERIAL PRIMARY KEY,
        task TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        category TEXT DEFAULT 'general',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.questions} (
        id SERIAL PRIMARY KEY,
        category TEXT,
        question TEXT,
        options TEXT,
        correctAnswer INTEGER,
        explanation TEXT,
        translations TEXT,
        source TEXT DEFAULT 'system',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS ${TABLES.public_chat} (
          id SERIAL PRIMARY KEY,
          userId TEXT REFERENCES ${TABLES.users}(userId),
          message TEXT,
          replyTo INTEGER, 
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${TABLES.categories} (
        id TEXT PRIMARY KEY,
        title TEXT,
        icon TEXT,
        color TEXT,
        bg TEXT,
        description TEXT,
        displayOrder INTEGER DEFAULT 0
      );
    `);

    // Seed Categories
    const catCheck = await client.query(`SELECT count(*) as count FROM ${TABLES.categories} WHERE id = 'Part 1'`);
    if (parseInt(catCheck.rows[0].count) === 0) {
        console.log('[Neural DB] Seeding TOEIC Sectors...');
        const initialCategories = [
            { id: 'Part 1', title: 'Part 1: Photographs', icon: 'Image', color: 'text-cyan-400', bg: 'bg-cyan-400/10', description: 'Four short statements regarding a photograph.' },
            { id: 'Part 2', title: 'Part 2: Q&A', icon: 'MessageCircle', color: 'text-indigo-400', bg: 'bg-indigo-400/10', description: 'Question-Response. Three responses to one question.' },
            { id: 'Part 3', title: 'Part 3: Conversations', icon: 'Users', color: 'text-emerald-400', bg: 'bg-emerald-400/10', description: 'Short conversations between two or more people.' },
            { id: 'Part 4', title: 'Part 4: Talks', icon: 'Mic', color: 'text-amber-400', bg: 'bg-amber-400/10', description: 'Short talks given by a single speaker.' },
            { id: 'Part 5', title: 'Part 5: Sentences', icon: 'PenTool', color: 'text-rose-400', bg: 'bg-rose-400/10', description: 'Incomplete sentences. Grammar and vocabulary.' },
            { id: 'Part 6', title: 'Part 6: Text Completion', icon: 'FileText', color: 'text-sky-400', bg: 'bg-sky-400/10', description: 'Text completion. Fill in the blanks in texts.' },
            { id: 'Part 7', title: 'Part 7: Reading', icon: 'BookOpen', color: 'text-purple-400', bg: 'bg-purple-400/10', description: 'Reading comprehension. Single and multiple passages.' },
            { id: 'Vocabulary', title: 'TOEIC Vocabulary', icon: 'Library', color: 'text-slate-400', bg: 'bg-slate-400/10', description: 'Essential vocabulary for high scores.' },
            { id: 'Grammar', title: 'Grammar Focus', icon: 'Zap', color: 'text-teal-400', bg: 'bg-teal-400/10', description: 'Intensive grammar rules and practice.' }
        ];

        for (const [idx, cat] of initialCategories.entries()) {
            await client.query(`
                INSERT INTO ${TABLES.categories} (id, title, icon, color, bg, description, displayOrder)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
            `, [cat.id, cat.title, cat.icon, cat.color, cat.bg, cat.description, idx]);
        }
    }

    // Seed Admin User
    const adminCheck = await client.query(`SELECT count(*) as count FROM ${TABLES.users} WHERE role = 'admin'`);
    if (parseInt(adminCheck.rows[0].count) === 0) {
        console.log('[Neural DB] Seeding Admin Agent...');
        await client.query(`
            INSERT INTO ${TABLES.users} (userId, nickname, role) VALUES ($1, $2, $3)
            ON CONFLICT (userId) DO NOTHING
        `, ['admin', 'NeuralCommander', 'admin']);
    }

    // Seed Sample Questions (If empty)
    const qCheck = await client.query(`SELECT count(*) as count FROM ${TABLES.questions}`);
    if (parseInt(qCheck.rows[0].count) === 0) {
        console.log('[Neural DB] Seeding Training Modules...');
        const sampleQuestions = [
            // Part 1
            {
                category: 'Part 1',
                question: 'Look at the picture marked Number 1 in your test book.',
                options: JSON.stringify(['He is holding a pen.', 'He is writing on a paper.', 'He is looking at a monitor.', 'He is standing up.']),
                correctAnswer: 2,
                explanation: 'Analysis: The subject is focused on the screen. (C) accurately describes the action. (A) and (B) are incorrect as no pen/paper is visible.',
                translations: JSON.stringify({ ja: { question: '写真を見て、正しい説明を選びなさい。', explanation: '解説: 男性はモニターを見ています。(C)が正解です。' } })
            },
            {
                category: 'Part 1',
                question: 'Look at the picture. What is the woman doing?',
                options: JSON.stringify(['She is drinking coffee.', 'She is typing on a keyboard.', 'She is talking on the phone.', 'She is opening a window.']),
                correctAnswer: 1,
                explanation: 'Analysis: The woman is seated at a desk with her hands on the keyboard. (B) is the correct description.',
                translations: JSON.stringify({ ja: { question: '女性は何をしていますか？', explanation: '解説: 女性はキーボードで入力をしています。' } })
            },
            // Part 2
            {
                category: 'Part 2',
                question: 'Question: When is the quarterly report due?',
                options: JSON.stringify(['To the marketing department.', 'By next Friday.', 'It was quite long.']),
                correctAnswer: 1,
                explanation: 'Analysis: The question asks for a time ("When"). (B) "By next Friday" answers this directly. (A) answers "Where/Who", (C) answers "How was it".',
                translations: JSON.stringify({ ja: { question: '四半期報告書の期限はいつですか？', explanation: '解説:「いつ」を問う質問には時間を答えます。(B)が正解です。' } })
            },
            {
                category: 'Part 2',
                question: 'Question: Who is in charge of the new project?',
                options: JSON.stringify(['Yes, I am.', 'Mr. Tanaka from Sales.', 'It starts tomorrow.']),
                correctAnswer: 1,
                explanation: 'Analysis: The question asks for a person ("Who"). (B) identifies "Mr. Tanaka". (A) is for Yes/No questions, (C) answers "When".',
                translations: JSON.stringify({ ja: { question: '誰が新プロジェクトの担当ですか？', explanation: '解説:「誰」を問う質問には人物を答えます。(B)の田中氏が正解です。' } })
            },
            // Part 5
            {
                category: 'Part 5',
                question: 'The CEO ___ the new branch office yesterday.',
                options: JSON.stringify(['visit', 'visits', 'visited', 'visiting']),
                correctAnswer: 2,
                explanation: 'Grammar: The time indicator "yesterday" requires the past tense. "Visited" is the simple past form.',
                translations: JSON.stringify({ ja: { question: 'CEOは昨日、新しい支店を___。', explanation: '解説: Yesterday（昨日）があるので過去形 visited を選びます。' } })
            },
            {
                category: 'Part 5',
                question: 'Please review the attached document ___ you submit your application.',
                options: JSON.stringify(['before', 'during', 'owing to', 'because']),
                correctAnswer: 0,
                explanation: 'Grammar: We need a conjunction indicating time order. "Before" fits the context logically. "During" requires a noun phrase usually.',
                translations: JSON.stringify({ ja: { question: '申請書を提出する___、添付書類を確認してください。', explanation: '解説: 文脈的に「提出する前に」が適切です。beforeを選びます。' } })
            },
             {
                category: 'Vocabulary',
                question: 'Choose the word that best completes the sentence: The new policy will be ___ next month.',
                options: JSON.stringify(['implemented', 'implement', 'implementation', 'implements']),
                correctAnswer: 0,
                explanation: 'Grammar: Passive voice "will be + past participle". "Implemented" is the correct form.',
                translations: JSON.stringify({ ja: { question: '空欄に最も適切な語を選びなさい。', explanation: '解説: 受動態 will be + 過去分詞 の形が必要です。' } })
            },
            // Part 7
            {
                category: 'Part 7',
                question: 'Passage: "To all staff: The elevator maintenance scheduled for Tuesday has been postponed to Thursday due to unavailable parts." \n\nQuestion: Why is the maintenance delayed?',
                options: JSON.stringify(['Staff are busy.', 'It is a holiday.', 'Parts are not available.', 'The elevator is working fine.']),
                correctAnswer: 2,
                explanation: 'Reading: The text explicitly states "due to unavailable parts". (C) is the correct paraphrase.',
                translations: JSON.stringify({ ja: { question: 'なぜメンテナンスは延期されましたか？', explanation: '解説: 文章中に「部品が入手できないため（due to unavailable parts）」とあります。(C)が正解です。' } })
            }
        ];

        for (const q of sampleQuestions) {
            await client.query(`
                INSERT INTO ${TABLES.questions} (category, question, options, correctAnswer, explanation, translations, source)
                VALUES ($1, $2, $3, $4, $5, $6, 'system_seed')
            `, [q.category, q.question, q.options, q.correctAnswer, q.explanation, q.translations]);
        }
    }

    console.log('[Neural DB] Schema Manifest Integrated.');
  } catch (err) {
    console.error('[Neural DB] Schema Integration Failed:', err);
  } finally {
    client.release();
  }
};

initDB();

// Helper for Paginated / Filtered queries
const getPaginatedData = async (tableName, req, searchColumns = []) => {
  const { page = 1, limit = 20, search = '', sortBy = 'id', order = 'DESC', ...filters } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereConditions = [];
  let params = [];
  let paramIndex = 1;

  if (search && searchColumns.length > 0) {
      const searchParts = searchColumns.map(col => `LOWER(${col}) LIKE LOWER($${paramIndex++})`);
      whereConditions.push('(' + searchParts.join(' OR ') + ')');
      searchColumns.forEach(() => params.push(`%${search}%`));
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value && ['role', 'status', 'category', 'type', 'priority', 'topic', 'userId'].includes(key)) {
        whereConditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
    }
  });

  if (tableName === TABLES.submitted_questions && !filters.status) {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push('pending');
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  const countRes = await pool.query(`SELECT count(*) as total FROM ${tableName} ${whereClause}`, params);
  const total = parseInt(countRes.rows[0].total);
  
  const validSortColumns = ['id', 'category', 'createdAt', 'joinedAt', 'date', 'name', 'username', 'topic', 'status', 'role', 'type', 'title', 'question'];
  const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const dataRes = await pool.query(`
      SELECT * FROM ${tableName} 
      ${whereClause} 
      ORDER BY ${safeSortBy} ${safeOrder} 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `, [...params, parseInt(limit), offset]);

  return { 
    data: dataRes.rows, 
    pagination: { 
        total, 
        page: parseInt(page), 
        limit: parseInt(limit), 
        pages: Math.ceil(total / parseInt(limit)) 
    } 
  };
};

// --- API Endpoints ---

// Categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM ${TABLES.categories} ORDER BY displayOrder ASC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/categories', async (req, res) => {
    const { id, title, icon, color, bg, description, displayOrder } = req.body;
    try {
        await pool.query(`
            INSERT INTO ${TABLES.categories} (id, title, icon, color, bg, description, displayOrder)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [id, title, icon, color, bg, description, displayOrder || 0]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/categories/:id', async (req, res) => {
    const { title, icon, color, bg, description, displayOrder } = req.body;
    try {
        await pool.query(`
            UPDATE ${TABLES.categories} 
            SET title = $1, icon = $2, color = $3, bg = $4, description = $5, displayOrder = $6
            WHERE id = $7
        `, [title, icon, color, bg, description, displayOrder, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/categories/:id', async (req, res) => {
    try {
        await pool.query(`DELETE FROM ${TABLES.categories} WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const unreadMessagesResult = await pool.query(`SELECT count(*) as count FROM ${TABLES.messages} WHERE status = $1`, ['unread']);
        const pendingSubmissionsResult = await pool.query(`SELECT count(*) as count FROM ${TABLES.submitted_questions} WHERE status = $1`, ['pending']);
        const totalUsersResult = await pool.query(`SELECT count(*) as count FROM ${TABLES.users}`);
        const totalQuestionsResult = await pool.query(`SELECT count(*) as count FROM ${TABLES.questions}`);
        
        res.json({ 
            unreadMessages: parseInt(unreadMessagesResult.rows[0].count),
            pendingSubmissions: parseInt(pendingSubmissionsResult.rows[0].count),
            totalUsers: parseInt(totalUsersResult.rows[0].count),
            totalQuestions: parseInt(totalQuestionsResult.rows[0].count)
        });
    } catch (e) {
        console.error('[Admin Stats Error]:', e);
        res.status(500).json({ error: e.message });
    }
});

// Questions
app.get('/api/questions', async (req, res) => {
  try {
    const { page, limit, search, category, userId } = req.query;

    // Feature Gating Logic
    if (userId) {
        const isAdminRes = await pool.query(`SELECT role FROM ${TABLES.users} WHERE userId = $1`, [userId]);
        const isAdmin = isAdminRes.rows[0]?.role === 'admin';
        
        if (!isAdmin) {
            // Check Subscription
            const subRes = await pool.query('SELECT status FROM subscriptions WHERE userId = $1 AND (projectScope = $2 OR projectScope = $3) AND status = $4', [userId, 'toeic', 'all', 'active']);
            const hasActiveSub = subRes.rows.length > 0;
            
            if (!hasActiveSub) {
                // Count attempts today
                const attemptsRes = await pool.query(`
                    SELECT count(*) as count 
                    FROM ${TABLES.attempts} 
                    WHERE userId = $1 AND date >= CURRENT_DATE
                `, [userId]);
                const dailyAttempts = parseInt(attemptsRes.rows[0].count);
                
                if (dailyAttempts >= 3) {
                    return res.status(403).json({ 
                        error: 'Daily limit reached', 
                        limitReached: true,
                        message: '1日の無料学習制限（3回）に達しました。プレミアムプランで無制限に学習しましょう！' 
                    });
                }
            }
        }
    }

    const usePagination = page !== undefined || limit !== undefined || search !== undefined || category !== undefined;
    
    if (!usePagination) {
        const result = await pool.query(`SELECT * FROM ${TABLES.questions}`);
        const questions = result.rows.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            translations: q.translations ? (typeof q.translations === 'string' ? JSON.parse(q.translations) : q.translations) : undefined
        }));
        return res.json(questions);
    }

    const { data, pagination } = await getPaginatedData(TABLES.questions, req, ['question', 'category', 'explanation']);
    const formatted = data.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        translations: q.translations ? (typeof q.translations === 'string' ? JSON.parse(q.translations) : q.translations) : undefined
    }));
    res.json({ data: formatted, pagination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/questions', async (req, res) => {
   const { category, question, options, correctAnswer, explanation, translations, source } = req.body;
   try {
     const result = await pool.query(`
       INSERT INTO ${TABLES.questions} (category, question, options, correctAnswer, explanation, translations, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id
     `, [category, question, JSON.stringify(options), correctAnswer, explanation, JSON.stringify(translations || {}), source || 'admin']);
     res.json({ success: true, id: result.rows[0].id });
   } catch (err) {
     res.status(500).json({ error: err.message });
   }
});

app.put('/api/admin/questions/:id', async (req, res) => {
    const { category, question, options, correctAnswer, explanation, translations } = req.body;
    try {
        await pool.query(`
            UPDATE ${TABLES.questions} 
            SET category = $1, question = $2, options = $3, correctAnswer = $4, explanation = $5, translations = $6
            WHERE id = $7
        `, [category, question, JSON.stringify(options), correctAnswer, explanation, JSON.stringify(translations || {}), req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/questions/:id', async (req, res) => {
    try {
        await pool.query(`DELETE FROM ${TABLES.questions} WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, topic, message, userId } = req.body;
  try {
    await pool.query(`
      INSERT INTO ${TABLES.messages} (name, email, topic, message, userId) 
      VALUES ($1, $2, $3, $4, $5)
    `, [name, email, topic, message, userId || null]);
    console.log(`[Neural Link] New message received: ${topic} from User ${userId || 'Guest'}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[Neural Link] Contact Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submit-question', async (req, res) => {
  const { category, question, options, correctAnswer, explanation } = req.body;
  try {
    await pool.query(`
      INSERT INTO ${TABLES.submitted_questions} (category, question, options, correctAnswer, explanation) 
      VALUES ($1, $2, $3, $4, $5)
    `, [category, question, JSON.stringify(options), correctAnswer, explanation]);
    console.log(`[Neural Link] New question submitted in ${category}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Messages
app.get('/api/admin/messages', async (req, res) => {
  try {
    const { page, limit, search, sortBy = 'id', order = 'DESC', status, topic } = req.query;
    const usePagination = page !== undefined || limit !== undefined || search !== undefined;
    
    if (!usePagination) {
        const result = await pool.query(`
            SELECT m.*, u.nickname 
            FROM ${TABLES.messages} m 
            LEFT JOIN ${TABLES.users} u ON m.userId = u.userId 
            ORDER BY m.createdAt DESC
        `);
        return res.json(result.rows);
    }
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
        whereConditions.push(`(m.name LIKE $${paramIndex} OR m.email LIKE $${paramIndex} OR m.topic LIKE $${paramIndex} OR m.message LIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }
    if (status) {
        whereConditions.push(`m.status = $${paramIndex++}`);
        params.push(status);
    }
    if (topic) {
        whereConditions.push(`m.topic = $${paramIndex++}`);
        params.push(topic);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    const countRes = await pool.query(`SELECT count(*) as total FROM ${TABLES.messages} m ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total);

    const validSortColumns = ['id', 'createdAt', 'name', 'topic', 'status'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'id';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const offset = (parseInt(page || 1) - 1) * parseInt(limit || 10);
    const dataRes = await pool.query(`
        SELECT m.*, u.nickname 
        FROM ${TABLES.messages} m 
        LEFT JOIN ${TABLES.users} u ON m.userId = u.userId 
        ${whereClause} 
        ORDER BY m.${safeSortBy} ${safeOrder} 
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, parseInt(limit || 10), offset]);

    res.json({ 
        data: dataRes.rows, 
        pagination: { 
            total, 
            page: parseInt(page || 1), 
            limit: parseInt(limit || 10), 
            pages: Math.ceil(total / parseInt(limit || 10)) 
        } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/messages/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  try {
    const msgRes = await pool.query(`SELECT * FROM ${TABLES.messages} WHERE id = $1`, [id]);
    const msg = msgRes.rows[0];
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    await pool.query(`UPDATE ${TABLES.messages} SET reply = $1, repliedAt = CURRENT_TIMESTAMP, status = $2 WHERE id = $3`, [reply, 'replied', id]);

    if (msg.userId) {
        await pool.query(`
            INSERT INTO ${TABLES.notifications} (userId, title, content, type) 
            VALUES ($1, $2, $3, $4)
        `, [msg.userId, 'Inquiry Reply', `Reply to "${msg.topic}": ${reply}`, 'info']);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Submissions
app.get('/api/admin/submissions', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const usePagination = page !== undefined || limit !== undefined || search !== undefined;
    
    if (!usePagination) {
        const result = await pool.query(`SELECT * FROM ${TABLES.submitted_questions} WHERE status = $1 ORDER BY createdAt DESC`, ['pending']);
        return res.json(result.rows);
    }
    const result = await getPaginatedData(TABLES.submitted_questions, req, ['category', 'question']);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/submissions/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const subRes = await pool.query(`SELECT * FROM ${TABLES.submitted_questions} WHERE id = $1`, [id]);
    const submission = subRes.rows[0];
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    await pool.query(`
      INSERT INTO ${TABLES.questions} (category, question, options, correctAnswer, explanation, source)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [submission.category, submission.question, submission.options, submission.correctAnswer, submission.explanation, 'user_contribution']);

    await pool.query(`UPDATE ${TABLES.submitted_questions} SET status = $1 WHERE id = $2`, ['approved', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/submissions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE ${TABLES.submitted_questions} SET status = $1 WHERE id = $2`, ['rejected', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const usePagination = page !== undefined || limit !== undefined || search !== undefined;
        
        if (!usePagination) {
            const result = await pool.query(`SELECT * FROM ${TABLES.users}`);
            return res.json(result.rows);
        }
        const result = await getPaginatedData(TABLES.users, req, ['userId', 'nickname', 'role']);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/users/:key', async (req, res) => {
  const { key } = req.params;
  const result = await pool.query(`SELECT * FROM ${TABLES.users} WHERE LOWER(userId) = LOWER($1)`, [key]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(result.rows[0]);
});

app.post('/api/users', async (req, res) => {
  const { userId, nickname, role } = req.body;
  if (!userId || !nickname) return res.status(400).json({ error: 'UserID and Nickname are required' });
  
  try {
    const check = await pool.query(`SELECT * FROM ${TABLES.users} WHERE userId = $1`, [userId]);
    if (check.rows.length > 0) {
        // Return existing user
        return res.json(check.rows[0]);
    }

    await pool.query(`INSERT INTO ${TABLES.users} (userId, nickname, role) VALUES ($1, $2, $3)`, [userId, nickname, role]);
    const user = await pool.query(`SELECT * FROM ${TABLES.users} WHERE userId = $1`, [userId]);
    res.json(user.rows[0]);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Public Chat
app.get('/api/public-chat', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const result = await pool.query(`
            SELECT 
                c.*, 
                u.nickname, 
                u.role 
            FROM ${TABLES.public_chat} c
            LEFT JOIN ${TABLES.users} u ON c.userId = u.userId
            ORDER BY c.createdAt DESC
            LIMIT $1
        `, [limit]);
        res.json(result.rows.reverse());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/public-chat', async (req, res) => {
    const { userId, message, replyTo } = req.body;
    if (!userId || !message) return res.status(400).json({ error: 'Missing fields' });
    
    try {
        const insertRes = await pool.query(`INSERT INTO ${TABLES.public_chat} (userId, message, replyTo) VALUES ($1, $2, $3) RETURNING id`, [userId, message, replyTo || null]);
        const newMsg = await pool.query(`
            SELECT 
                c.*, 
                u.nickname, 
                u.role 
            FROM ${TABLES.public_chat} c
            LEFT JOIN ${TABLES.users} u ON c.userId = u.userId
            WHERE c.id = $1
        `, [insertRes.rows[0].id]);
        res.json(newMsg.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/public-chat/:id', async (req, res) => {
    const { userId } = req.body;
    const { id } = req.params;

    try {
        const userRes = await pool.query(`SELECT role FROM ${TABLES.users} WHERE userId = $1`, [userId]);
        const user = userRes.rows[0];
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const deleteRes = await pool.query(`DELETE FROM ${TABLES.public_chat} WHERE id = $1`, [id]);
        if (deleteRes.rowCount > 0) {
            console.log(`[Neural Chat] Message ${id} deleted by Admin ${userId}`);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query(`UPDATE ${TABLES.users} SET status = $1 WHERE userId = $2`, [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  const { userId, page, limit, search, admin } = req.query;
  try {
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (admin === 'true') {
        // No restriction
    } else {
        whereConditions.push(`(userId = $${paramIndex++} OR userId IS NULL)`);
        params.push(userId);
    }

    if (search) {
        whereConditions.push(`(title LIKE $${paramIndex} OR content LIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    const { sortBy = 'id', order = 'DESC' } = req.query;
    const safeSortBy = ['id', 'createdAt', 'title'].includes(sortBy) ? sortBy : 'id';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const usePagination = page !== undefined || limit !== undefined;
    
    if (!usePagination) {
        const query = `SELECT * FROM ${TABLES.notifications} ${whereClause} ORDER BY ${safeSortBy} ${safeOrder}`;
        const result = await pool.query(query, params);
        return res.json(result.rows);
    }
    
    const offset = (parseInt(page || 1) - 1) * parseInt(limit || 10);
    const countRes = await pool.query(`SELECT count(*) as total FROM ${TABLES.notifications} ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total);

    const dataRes = await pool.query(`SELECT * FROM ${TABLES.notifications} ${whereClause} ORDER BY ${safeSortBy} ${safeOrder} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, [...params, parseInt(limit || 10), offset]);

    res.json({ data: dataRes.rows, pagination: { total, page: parseInt(page || 1), limit: parseInt(limit || 10), pages: Math.ceil(total / parseInt(limit || 10)) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/todos', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM ${TABLES.todos} ORDER BY status DESC, createdAt DESC`);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/todos', async (req, res) => {
    const { task, priority, category } = req.body;
    try {
        const result = await pool.query(`INSERT INTO ${TABLES.todos} (task, priority, category) VALUES ($1, $2, $3) RETURNING *`, [task, priority || 'medium', category || 'general']);
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/admin/todos/:id', async (req, res) => {
    const { status, task, priority } = req.body;
    try {
        if (status) {
            await pool.query(`UPDATE ${TABLES.todos} SET status = $1 WHERE id = $2`, [status, req.params.id]);
        } else if (task) {
            await pool.query(`UPDATE ${TABLES.todos} SET task = $1, priority = $2 WHERE id = $3`, [task, priority, req.params.id]);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/admin/todos/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM ${TABLES.todos} WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ranking System
app.get('/api/rankings', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.userId, 
                MAX(u.nickname) as nickname,
                MAX(u.role) as role,
                SUM(a.score) as totalScore,
                COUNT(a.id) as missionCount
            FROM ${TABLES.attempts} a
            LEFT JOIN ${TABLES.users} u ON a.userId = u.userId
            GROUP BY a.userId
            ORDER BY totalScore DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/attempts', async (req, res) => {
    const { userId, date, score, totalQuestions, category, wrongQuestionIds, userAnswers } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO ${TABLES.attempts} (userId, date, score, totalQuestions, category, wrongQuestionIds, userAnswers)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [userId, date || new Date(), score, totalQuestions, category, JSON.stringify(wrongQuestionIds || []), JSON.stringify(userAnswers || {})]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3020;
const server = app.listen(PORT, () => {
    console.log(`[Neural Link] Server active on port ${PORT}`);
});

server.on('error', (e) => {
    console.error('[Neural Link] Server Error:', e);
});

// Prevent exit
setInterval(() => {}, 10000);
