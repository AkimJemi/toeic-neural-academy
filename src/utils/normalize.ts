/* eslint-disable @typescript-eslint/no-explicit-any */
export const normalizeKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => normalizeKeys(v));
    } else if (obj !== null && typeof obj === 'object') {

        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                let newKey = key;
                // Map Postgres lowercase keys to CamelCase
                if (key === 'correctanswer') newKey = 'correctAnswer';
                else if (key === 'createdat') newKey = 'createdAt';
                else if (key === 'userid') newKey = 'userId';
                else if (key === 'totalquestions') newKey = 'totalQuestions';
                else if (key === 'lastupdated') newKey = 'lastUpdated';
                else if (key === 'imageurl') newKey = 'imageUrl';
                else if (key === 'audiourl') newKey = 'audioUrl';
                else if (key === 'passage') newKey = 'passage';

                newObj[newKey] = normalizeKeys(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
};
