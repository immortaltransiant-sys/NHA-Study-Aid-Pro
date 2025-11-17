
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, Flashcard, ExamType, EkgFlashcard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The multiple-choice question." },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers."
        },
        correctAnswer: { type: Type.STRING, description: "The correct answer from the options array." },
        explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct." }
    },
    required: ["question", "options", "correctAnswer", "explanation"]
};

const flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        term: { type: Type.STRING, description: "The key term, concept, or abbreviation." },
        definition: { type: Type.STRING, description: "The definition or explanation of the term." }
    },
    required: ["term", "definition"]
};

export const generatePracticeExam = async (examType: ExamType): Promise<Question[]> => {
    let prompt = `You are an expert curriculum developer for the National Healthcareer Association (NHA). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam for the ${examType} certification. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. Do not truncate the list. Each question object must conform to the provided JSON schema. The questions must be unique and accurately reflect the style, difficulty, and content domains of the official NHA exam. For each question, provide the question text, an array of 4 options, the exact text of the correct answer, and a concise explanation for the correct answer. Ensure the questions cover all key areas of the ${examType} exam.`;

    if (examType === ExamType.PHLEBOTOMY) {
        prompt = `You are an expert curriculum developer for the National Healthcareer Association (NHA) specializing in Phlebotomy (CPT). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. The questions must be unique and modeled after the topics and question styles found in this reference material: https://docs.google.com/forms/d/e/1FAIpQLScLLzh-lcIIzJBscfYUWH6_E69k1lYNzSYNQTqEcyLwxzFtgw/viewform.

Key areas to focus on include:
-   **Order of Draw:** For both venipuncture and capillary collections.
-   **Tube Additives & Departments:** The color, additive, and corresponding lab department for all standard tubes.
-   **Patient Identification & Safety:** Critical steps like the 2-identifier method.
-   **Special Collections:** Handling procedures for tests like cold agglutinins, blood cultures, or light-sensitive specimens.
-   **Complications:** Identifying and managing issues like hematomas, syncope, or nerve damage.
-   **Site Selection:** Proper vein selection and situations requiring alternative sites.
-   **Procedural Steps:** From greeting the patient to post-puncture care.

For each question, provide the question text, an array of 4 options, the exact text of the correct answer, and a concise explanation. The goal is to create a realistic and comprehensive practice exam for a student preparing for the NHA CPT test.`;
    }

    if (examType === ExamType.EKG) {
        prompt = `You are an expert curriculum developer for the National Healthcareer Association (NHA) specializing in EKG/ECG (CET). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. The questions must be unique and modeled after the topics and question styles found in this reference material: https://docs.google.com/forms/d/e/1FAIpQLSfmLhQHzaBeAMM9FEQSg9jjqW_3dDTOgeURtAcOK0LgxAnWQw/viewform.

Key areas to focus on include:
-   **Rhythm Strip Interpretation:** Identifying various sinus, atrial, junctional, and ventricular rhythms (e.g., Sinus Bradycardia, Atrial Fibrillation, PVCs, V-Tach).
-   **Pacemaker Rhythms:** Recognizing paced rhythms and potential malfunctions.
-   **Lead Placement:** Correct placement for 12-lead, 5-lead, and 3-lead EKGs, including posterior and right-sided placements.
-   **Artifacts:** Identifying and troubleshooting common artifacts like wandering baseline, somatic tremor, and AC interference.
-   **EKG Machine Operation:** Calibration, speed/gain settings, and maintenance.
-   **Patient Preparation:** Instructing patients and ensuring proper preparation for stress tests and Holter monitoring.
-   **Calculating Heart Rate:** Using methods like the 6-second rule, 1500 method, and sequencing.
-   **Basic Cardiac Anatomy & Physiology:** Relating EKG findings to the heart's electrical conduction system.

For each question, provide the question text, an array of 4 options, the exact text of the correct answer, and a concise explanation. The goal is to create a realistic and comprehensive practice exam for a student preparing for the NHA CET test.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: questionSchema
                }
            }
        });
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        return questions as Question[];
    } catch (error) {
        console.error("Error generating practice exam:", error);
        throw new Error("Failed to generate practice exam. Please try again.");
    }
};

export const generateFlashcards = async (examType: ExamType): Promise<Flashcard[]> => {
    const prompt = `You are an expert educator specializing in NHA certifications. Create a set of 75 essential flashcards for the ${examType} exam. For each flashcard, provide a key term, procedure, or concept on one side, and a clear, concise definition or explanation on the other. Focus on high-yield topics that are frequently tested.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: flashcardSchema
                }
            }
        });

        const jsonText = response.text.trim();
        const flashcards = JSON.parse(jsonText);
        return flashcards as Flashcard[];
    // FIX: Added missing curly braces for the catch block to ensure proper error handling.
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Failed to generate flashcards. Please try again.");
    }
};

export const generateMedicalShorthandFlashcards = async (): Promise<Flashcard[]> => {
    const prompt = `You are an expert educator specializing in NHA certifications. Create a set of 50 essential medical shorthand/abbreviation flashcards relevant to CCMA, Phlebotomy, and EKG exams. For each flashcard, provide the abbreviation as the term, and its full meaning as the definition. Focus on high-yield abbreviations frequently seen in clinical settings.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: flashcardSchema }
            }
        });
        return JSON.parse(response.text.trim()) as Flashcard[];
    } catch (error) {
        console.error("Error generating shorthand flashcards:", error);
        throw new Error("Failed to generate shorthand flashcards.");
    }
};

export const generateTubeDrawFlashcards = async (): Promise<Flashcard[]> => {
    const prompt = `You are an expert phlebotomy instructor for the NHA. Create a comprehensive set of approximately 50 flashcards covering blood collection for a Phlebotomy Technician (CPT) exam. The set should include three types of flashcards:

1.  **Tube Identification (approx. 10 cards):** For each standard tube, make the "term" the tube top color (e.g., "Lavender Top") and the "definition" a detailed description including its additive, the lab department (e.g., Hematology), and 2-3 common lab tests (e.g., CBC, HgbA1c). Cover all major tubes: Lavender, Light Blue, Green, Gray, Red, Gold/SST, Royal Blue, Pink.

2.  **Test to Tube Matching (approx. 38 cards):** For common lab tests, make the "term" the name of the test (e.g., "Prothrombin Time (PT)") and the "definition" the correct tube top color (e.g., "Light Blue Top"). Cover a wide range of common tests to provide extensive practice.

3.  **Order of Draw (2 cards):**
    *   Create one card with the "term" as "Order of Draw - Venipuncture" and the "definition" as the complete, correct sequence of tubes.
    *   Create another card with the "term" as "Order of Draw - Capillary Puncture" and the "definition" as the complete, correct sequence for capillary collection.

Ensure the information is accurate and reflects NHA standards.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: flashcardSchema }
            }
        });
        return JSON.parse(response.text.trim()) as Flashcard[];
    } catch (error) {
        console.error("Error generating tube draw flashcards:", error);
        throw new Error("Failed to generate tube draw flashcards.");
    }
};


interface EkgRhythm {
    rhythmName: string;
    descriptionForImageGeneration: string;
    explanation: string;
}

export const generateEkgFlashcards = async (): Promise<EkgFlashcard[]> => {
    const rhythmPrompt = `You are an expert NHA EKG (CET) curriculum developer. Generate a list of 20 essential EKG rhythms for a student to identify. For each rhythm, provide its name, a concise, detailed description suitable for prompting an AI image generator to create a textbook-quality EKG strip, and a clear explanation of *why* it's that rhythm. The image description should detail P waves, QRS complex, T waves, heart rate, and rhythm regularity. The explanation should highlight the key diagnostic features visible in the EKG strip (e.g., 'Notice the absence of P waves and the irregularly irregular rhythm, which are hallmarks of Atrial Fibrillation.').`;

    try {
        // Step 1: Get list of rhythms to generate
        const rhythmResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: rhythmPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rhythmName: { type: Type.STRING },
                            descriptionForImageGeneration: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ["rhythmName", "descriptionForImageGeneration", "explanation"]
                    }
                }
            }
        });
        const rhythms: EkgRhythm[] = JSON.parse(rhythmResponse.text.trim());

        // Step 2: Generate an image for each rhythm
        const ekgFlashcards: EkgFlashcard[] = [];
        for (const rhythm of rhythms) {
            const imagePrompt = `Create a clean, single-lead electrocardiogram (EKG) strip on a white background with a standard grid. The strip must be a textbook example of ${rhythm.rhythmName}. Key features to include are: ${rhythm.descriptionForImageGeneration}. The image should be simple and clear for educational purposes.`;
            
            try {
                 const imageResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: imagePrompt }] },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    }
                });

                let base64Image: string | undefined;
                for (const part of imageResponse.candidates[0].content.parts) {
                    if (part.inlineData) {
                        base64Image = part.inlineData.data;
                        break; 
                    }
                }

                if (base64Image) {
                    ekgFlashcards.push({
                        image: `data:image/png;base64,${base64Image}`,
                        interpretation: rhythm.rhythmName,
                        explanation: rhythm.explanation
                    });
                } else {
                    console.warn(`Image generation succeeded but no image data found for ${rhythm.rhythmName}`);
                }
            } catch (imageError) {
                console.error(`Failed to generate image for ${rhythm.rhythmName}`, imageError);
            }
        }
        
        if (ekgFlashcards.length === 0 && rhythms.length > 0) {
            throw new Error("Failed to generate any EKG images.");
        }

        return ekgFlashcards;

    } catch (error) {
        console.error("Error generating EKG flashcards:", error);
        throw new Error("Failed to generate EKG flashcards.");
    }
};