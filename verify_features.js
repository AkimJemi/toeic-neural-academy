
import axios from 'axios';

const BASE_URL = 'http://localhost:3015/api';

const log = (msg, success) => {
    console.log(`${success ? '✅' : '❌'} ${msg}`);
};

const verify = async () => {
    try {
        console.log('--- STARTING VERIFICATION PROTOCOL ---');

        // 1. Verify User Creation
        const userId = `User_${Date.now()}`;
        const nickname = `Agent_${Math.floor(Math.random() * 100)}`;
        try {
            const userRes = await axios.post(`${BASE_URL}/users`, { userId, nickname, role: 'user' });
            const createdUser = userRes.data;
            if (createdUser.userId === userId || createdUser.userid === userId) {
                log(`User Created: ${userId}`, true);
            } else {
                console.log('Received:', createdUser);
                throw new Error('User creation check failed');
            }
        } catch (e) {
            log(`User Creation Failed: ${e.message}`, false);
            return;
        }

        // 2. Verify Ranking (Initially empty for this user)
        try {
            const rankRes = await axios.get(`${BASE_URL}/rankings`);
            log(`Rankings Fetched: Found ${rankRes.data.length} entries`, true);
        } catch (e) {
            log(`Rankings Fetch Failed: ${e.message}`, false);
        }

        // 3. Submit Fake Quiz Result to impact Ranking
        try {
            const attempt = {
                userId,
                score: 100,
                totalQuestions: 10,
                category: 'Part 1',
                wrongQuestionIds: [],
                userAnswers: {}
            };
            // Note: server doesn't expose /api/attempts directly but has a listener or we use submit-question for sync?
            // Actually, server/index.js doesn't have a direct POST /api/attempts endpoint exposed in the code I viewed earlier.
            // Wait, I need to check if there is an endpoint to save attempts. 
            // In DB.ts, it calls api.post('/submit-question', ...). Let's check server again.
            // Server has app.post('/api/submit-question', ...).
            // It inserts into 'submitted_questions' table, NOT 'attempts'.
            // The Ranking system reads from 'attempts' table. 
            // PROBLEM: There is no API exposed to save 'attempts' to the server in the current server/index.js!
            // I need to add that.
        } catch (e) {
            log(`Quiz Submission Simulation Failed: ${e.message}`, false);
        }

        const checkServer = async () => {
            // Re-read server/index.js to confirm if /api/attempts exists.
            // If not, I must add it.
        };

        // 4. Verify Public Chat
        try {
             const chatRes = await axios.post(`${BASE_URL}/public-chat`, { userId, message: 'System Diagnostic Test' });
             if (chatRes.data.message === 'System Diagnostic Test') {
                 log(`Chat Message Posted`, true);
             } else {
                 throw new Error('Chat response mismatch');
             }

             const chatList = await axios.get(`${BASE_URL}/public-chat`);
             const found = chatList.data.find(m => m.message === 'System Diagnostic Test');
             if (found) {
                 log(`Chat Message Retrieved`, true);
             } else {
                 throw new Error('Posted message not found in list');
             }
        } catch (e) {
             log(`Chat Verification Failed: ${e.message}`, false);
        }

    } catch (err) {
        console.error('PROTOCOL FAILURE:', err);
    }
};

verify();
