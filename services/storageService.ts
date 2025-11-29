
var STORAGE_KEYS = {
    FLASHCARDS_GENERAL: 'flashcards_general_', // + examType
    FLASHCARDS_SHORTHAND: 'flashcards_shorthand',
    FLASHCARDS_GRIEF: 'flashcards_grief',
    FLASHCARDS_VITALS: 'flashcards_vitals',
    FLASHCARDS_PREVENTIVE: 'flashcards_preventive',
    FLASHCARDS_PATHOLOGY: 'flashcards_pathology',
    FLASHCARDS_TUBE_DRAW: 'flashcards_tube_draw',
    FLASHCARDS_SPECIALIZED: 'flashcards_specialized',
    FLASHCARDS_EKG_LEADS: 'flashcards_ekg_leads',
    FLASHCARDS_EKG_RHYTHMS: 'flashcards_ekg_rhythms',
    FLASHCARDS_BODY_POSITIONS: 'flashcards_body_positions',
    EXAM_HISTORY: 'exam_history'
};

export { STORAGE_KEYS };

export function saveToStorage(key: string, data: any): Promise<void> {
    return new Promise<void>(function(resolve, reject) {
        try {
            // FUTURE FIRESTORE IMPLEMENTATION:
            // await db.collection('flashcards').doc(key).set({ data: data });
            localStorage.setItem(key, JSON.stringify(data));
            resolve();
        } catch (e) {
            console.error("Failed to save to local storage (likely quota exceeded):", e);
            // Resolve anyway so the app flow continues
            resolve();
        }
    });
}

export function getFromStorage(key: string): Promise<any> {
    return new Promise(function(resolve, reject) {
        try {
            // FUTURE FIRESTORE IMPLEMENTATION:
            // const doc = await db.collection('flashcards').doc(key).get();
            // resolve(doc.exists ? doc.data().data : null);
            var data = localStorage.getItem(key);
            resolve(data ? JSON.parse(data) : null);
        } catch (e) {
            console.error("Failed to load from local storage:", e);
            resolve(null);
        }
    });
}

export function clearFromStorage(key: string): Promise<void> {
    return new Promise<void>(function(resolve, reject) {
        try {
            // FUTURE FIRESTORE IMPLEMENTATION:
            // await db.collection('flashcards').doc(key).delete();
            localStorage.removeItem(key);
            resolve();
        } catch (e) {
            console.error("Failed to clear local storage:", e);
            resolve();
        }
    });
}

export function saveExamResult(result: any): Promise<void> {
    return getFromStorage(STORAGE_KEYS.EXAM_HISTORY).then(function(history) {
        var newHistory = history ? history : [];
        // Check if exists to update (based on ID)
        var existingIndex = -1;
        for(var i=0; i<newHistory.length; i++) {
            if(newHistory[i].id === result.id) {
                existingIndex = i;
                break;
            }
        }
        
        if (existingIndex >= 0) {
            newHistory[existingIndex] = result;
        } else {
            newHistory.push(result);
        }
        
        return saveToStorage(STORAGE_KEYS.EXAM_HISTORY, newHistory);
    });
}

export function getExamHistory(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.EXAM_HISTORY).then(function(data) {
        return data || [];
    });
}
