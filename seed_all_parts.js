import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://g_kentei_prep_app_db_user:0vZFHekJvsuMexPcBCKx5Ix4Noy7WZJO@dpg-d63nv6cr85hc73bckig0-a.oregon-postgres.render.com/g_kentei_prep_app_db';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const TABLES = {
    questions: 'toeic_questions'
};

const questions = [
    // Part 1: Photographs
    {
        category: 'Part 1',
        question: 'Look at the picture marked Number 3 in your test book.',
        options: ['Some people are boarding a bus.', 'A man is cleaning the windshield.', 'Passengers are waiting at the terminal.', 'The bus is parked on a bridge.'],
        correctAnswer: 2,
        explanation: 'The image shows people standing in line at a station/terminal. (C) is the most accurate description.',
        translations: { ja: { question: '写真を見て、正しい説明を選びなさい。', explanation: '解説: 人々がターミナルで待っています。(C)が正解です。' } }
    },
    // Part 2: Q&A
    {
        category: 'Part 2',
        question: 'Question: Would you like to join us for lunch, or are you too busy?',
        options: ['I have a meeting at noon.', 'Italian food sounds great.', 'Yes, I was very busy yesterday.'],
        correctAnswer: 0,
        explanation: 'The question is an "A or B" choice. (A) provides a reason for not joining (being busy/having a meeting).',
        translations: { ja: { question: 'ランチに行きませんか、それとも忙しいですか？', explanation: '解説: 正午に会議がある（＝行けない）と答えている(A)が正解です。' } }
    },
    // Part 3: Conversations
    {
        category: 'Part 3',
        question: 'M: Hello, I\'m calling to check if my glasses are ready for pickup. My name is Robert Chen.\nW: Let me check... Yes, they were finished this morning. You can come by anytime before 7 PM.\n\nQuestion: What is the man doing?',
        options: ['Buying a new pair of shoes.', 'Inquiring about his glasses.', 'Scheduling a medical appointment.', 'Asking for directions to a store.'],
        correctAnswer: 1,
        explanation: 'The man explicitly says he is "calling to check if my glasses are ready".',
        translations: { ja: { question: '男性は何をしていますか？', explanation: '解説: 男性は「眼鏡ができているか確認するために電話している」と言っています。' } }
    },
    // Part 4: Talks
    {
        category: 'Part 4',
        question: 'Announcement: Attention all passengers. The 5:30 train to London has been delayed by 20 minutes due to track maintenance. We apologize for the inconvenience.\n\nQuestion: What is the purpose of the announcement?',
        options: ['To announce a platform change.', 'To inform about a train delay.', 'To sell tickets for a special event.', 'To recruit new railway employees.'],
        correctAnswer: 1,
        explanation: 'The announcement states that the train "has been delayed by 20 minutes".',
        translations: { ja: { question: 'アナウンスの目的は何ですか？', explanation: '解説: 電車が20分遅れていることを伝えています。' } }
    },
    // Part 5: Incomplete Sentences
    {
        category: 'Part 5',
        question: 'The marketing team is ___ working on the new campaign for the summer launch.',
        options: ['current', 'currently', 'currency', 'currence'],
        correctAnswer: 1,
        explanation: 'We need an adverb to modify the verb "working". "Currently" is the adverb form.',
        translations: { ja: { question: 'マーケティングチームは___夏の発売に向けた新キャンペーンに取り組んでいます。', explanation: '解説: 動詞workingを修飾する副詞currentlyが必要です。' } }
    },
    // Part 6: Text Completion
    {
        category: 'Part 6',
        question: 'Memo: Thank you for your interest in our internship program. We have reviewed your application. ___ we cannot offer you a position at this time, we will keep your resume on file.',
        options: ['Because', 'Although', 'Despite', 'If'],
        correctAnswer: 1,
        explanation: '"Although" is used to show contrast between "cannot offer a position" and "keeping resume on file".',
        translations: { ja: { question: '空欄に入る適切な語を選びなさい。', explanation: '解説: 指示内容は逆接の関係にあるため、「〜だけれども」のAlthoughが適切です。' } }
    },
    // Part 7: Reading Comprehension
    {
        category: 'Part 7',
        question: 'Email: "Dear Ms. Smith, your subscription to Business Weekly will expire on March 30. If you renew before March 15, you will receive a 10% discount." \n\nQuestion: How can Ms. Smith get a discount?',
        options: ['By subscribing to a different magazine.', 'By paying after March 30.', 'By renewing her subscription early.', 'By inviting a friend to subscribe.'],
        correctAnswer: 2,
        explanation: 'The email says "renew before March 15" (early renewal) to get the discount.',
        translations: { ja: { question: 'スミスさんはどうすれば割引を受けられますか？', explanation: '解説: 3月15日より前に更新（早期更新）すれば割引になると書かれています。' } }
    },
    // Vocabulary
    {
        category: 'Vocabulary',
        question: 'Which word is a synonym for "meticulous"?',
        options: ['Careful', 'Fast', 'Strong', 'Loud'],
        correctAnswer: 0,
        explanation: 'Meticulous means showing great attention to detail; very careful and precise.',
        translations: { ja: { question: '「meticulous」の類義語はどれですか？', explanation: '解説: meticulousは「細心の、非常に注意深い」という意味で、Carefulが近いです。' } }
    },
    // Grammar
    {
        category: 'Grammar',
        question: 'If it ___ tomorrow, we will cancel the outdoor picnic.',
        options: ['rain', 'rains', 'will rain', 'rained'],
        correctAnswer: 1,
        explanation: 'In conditional sentences referring to the future, the "if" clause uses the simple present tense.',
        translations: { ja: { question: 'もし明日雨が___、ピクニックは中止です。', explanation: '解説: 条件を表す副詞節の中では、未来のことでも現在形 rains を使います。' } }
    }
];

async function seed() {
    console.log("Starting Seeding Process...");
    const client = await pool.connect();
    try {
        for (const q of questions) {
            await client.query(`
                INSERT INTO ${TABLES.questions} (category, question, options, correctAnswer, explanation, translations, source)
                VALUES ($1, $2, $3, $4, $5, $6, 'manual_seed_all_parts')
            `, [q.category, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation, JSON.stringify(q.translations)]);
            console.log(`Inserted question for ${q.category}`);
        }
        console.log("Seeding Completed Successfully!");
    } catch (e) {
        console.error("Seeding Failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
