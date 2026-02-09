export const normalizeKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => normalizeKeys(v));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Convert snake_case to camelCase if needed, but for now just pass through
                // or handle specific DB transformations
                newObj[key] = normalizeKeys(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
};
