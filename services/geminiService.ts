
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType } from '../types';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from './storageService';

var ai;

function getAi() {
    if (!ai) {
        if (typeof process === 'undefined' || !process.env || !process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set. The app cannot function without it.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

var questionSchema = {
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

var flashcardSchema = {
    type: Type.OBJECT,
    properties: {
        term: { type: Type.STRING, description: "The key term, concept, or abbreviation." },
        definition: { type: Type.STRING, description: "A clear and concise definition or explanation of the term." },
        context: { type: Type.STRING, description: "Additional context, clinical significance, or a practical example to deepen understanding. Explains why this is important for a medical assistant to know." }
    },
    required: ["term", "definition", "context"]
};

var ekgSchema = {
    type: Type.OBJECT,
    properties: {
        interpretation: { type: Type.STRING, description: "The name of the rhythm, condition, or calculation method." },
        explanation: { type: Type.STRING, description: "Key features identifying this rhythm OR the steps/formula for the calculation method." },
        responseProcedure: { type: Type.STRING, description: "The NHA required response/intervention OR 'Calculation Technique' for method cards." },
        visualPrompt: { type: Type.STRING, description: "A detailed visual description for an image generator (e.g., 'EKG strip showing saw-tooth F-waves' or 'Diagram of EKG grid highlighting 1500 small boxes')." }
    },
    required: ["interpretation", "explanation", "visualPrompt", "responseProcedure"]
};

var bodyPositionSchema = {
    type: Type.OBJECT,
    properties: {
        positionName: { type: Type.STRING },
        description: { type: Type.STRING },
        purpose: { type: Type.STRING },
        visualPrompt: { type: Type.STRING, description: "A detailed visual description of the patient position for an image generator." }
    },
    required: ["positionName", "description", "purpose", "visualPrompt"]
};

// Helper function to run promises sequentially with a delay to avoid rate limits
function runSequentially(items, processFn) {
    var results = [];
    var chain = Promise.resolve();

    items.forEach(function(item) {
        chain = chain.then(function() {
            return processFn(item).then(function(result) {
                results.push(result);
                // Wait 2 seconds between image generation requests
                return new Promise(function(resolve) { setTimeout(resolve, 2000); });
            }).catch(function(err) {
                console.error("Error processing item:", err);
                results.push(item); 
                return new Promise(function(resolve) { setTimeout(resolve, 2000); });
            });
        });
    });

    return chain.then(function() { return results; });
}

export function generatePracticeExam(examType) {
    var prompt = "You are an expert curriculum developer for the National Healthcareer Association (NHA). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam for the " + examType + " certification. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. Do not truncate the list. Each question object must conform to the provided JSON schema. The questions must be unique and accurately reflect the style, difficulty, and content domains of the official NHA exam. For each question, provide the question text, an array of 4 options, the exact text of the correct answer, and a concise explanation for the correct answer. Ensure the questions cover all key areas of the " + examType + " exam.";

    if (examType === ExamType.PHLEBOTOMY) {
        prompt = "You are an expert curriculum developer for the National Healthcareer Association (NHA) specializing in Phlebotomy (CPT). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. The questions must be unique and modeled after the topics and question styles found in NHA reference materials.\n\nKey areas: Order of Draw, Tube Additives & Departments, Patient Identification, Special Collections, Complications, Site Selection, Procedural Steps.";
    }

    if (examType === ExamType.EKG) {
        prompt = "You are an expert curriculum developer for the National Healthcareer Association (NHA) specializing in EKG/ECG (CET). Your task is to generate a JSON array containing exactly 150 multiple-choice questions for a practice exam. It is critical and mandatory that the final output is a single JSON array with exactly 150 question objects. The questions must be unique.\n\nKey areas: Rhythm Strip Interpretation, Pacemaker Rhythms, Lead Placement (12/5/3 lead), Artifacts, Machine Operation, Patient Prep, Heart Rate Calculation, Cardiac Anatomy.";
    }

    try {
        var ai = getAi();
        return ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: questionSchema
                }
            }
        }).then(function(response) {
            var jsonText = response.text.trim();
            return JSON.parse(jsonText);
        }).catch(function(error) {
            console.error("Error generating practice exam:", error);
            throw new Error("Failed to generate practice exam. Please try again.");
        });
    } catch (error) {
        console.error("Error generating practice exam:", error);
        return Promise.reject(new Error("Failed to generate practice exam. Please try again."));
    }
};

export function generateStudyGuide(examType, incorrectQuestions) {
    // Format the incorrect questions into a readable string for the AI
    var questionsText = incorrectQuestions.map(function(q, index) {
        return (index + 1) + ". Question: " + q.question + "\n   Correct Answer: " + q.correctAnswer + "\n   Topic Context: " + q.explanation;
    }).join("\n\n");

    var prompt = "You are an expert NHA exam tutor. A student just took a " + examType + " practice exam and missed the following questions. \n\n" +
                 "Based on these incorrect answers, generate a personalized Study Guide.\n" +
                 "1. Group the missed concepts into 3-5 Key Focus Areas.\n" +
                 "2. For each area, explain the underlying concept they need to study.\n" +
                 "3. Provide specific tips or mnemonics to remember this material.\n" +
                 "4. Keep the tone encouraging but educational.\n" +
                 "5. Do NOT just list the questions again; analyze WHY they might have missed them and fix the knowledge gap.\n\n" +
                 "Missed Questions:\n" + questionsText;

    try {
        var ai = getAi();
        return ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        }).then(function(response) {
            return response.text;
        });
    } catch (error) {
        console.error("Error generating study guide:", error);
        return Promise.reject(new Error("Failed to generate study guide."));
    }
}

export function generateFlashcards(examType, forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_GENERAL + examType;
    
    // Check storage first
    var storagePromise = forceRefresh ? Promise.resolve(null) : getFromStorage(cacheKey);

    return storagePromise.then(function(cached) {
        if (cached) return cached;

        var prompt = "You are an expert educator specializing in NHA certifications. Create a comprehensive set of 130 essential flashcards for the " + examType + " exam. For each flashcard, provide a key 'term', a clear and concise 'definition', and detailed 'context'. The 'context' field is critical: it must explain the clinical significance, provide a practical example of its use in a healthcare setting, or offer a memory aid. \n\nIMPORTANT NHA REQUIREMENT: If the exam covers clinical skills (CCMA/Phlebotomy), you MUST include specific flashcards detailing needle gauge sizes (e.g., 21G, 22G, 23G, 25G) and needle length/depth considerations for various procedures (IM, SQ, ID, Venipuncture) and patient types (Pediatric vs Geriatric), strictly based on NHA reference material.";
        
        try {
            var ai = getAi();
            return ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: flashcardSchema
                    }
                }
            }).then(function(response) {
                var data = JSON.parse(response.text.trim());
                return saveToStorage(cacheKey, data).then(function() {
                    return data;
                });
            });
        } catch (error) {
            console.error("Error generating flashcards:", error);
            throw new Error("Failed to generate flashcards. Please try again.");
        }
    });
};

function generateCustomFlashcards(prompt, cacheKey, forceRefresh) {
    var storagePromise = (cacheKey && !forceRefresh) ? getFromStorage(cacheKey) : Promise.resolve(null);

    return storagePromise.then(function(cached) {
        if (cached) return cached;

        try {
            var ai = getAi();
            return ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: flashcardSchema
                    }
                }
            }).then(function(response) {
                var data = JSON.parse(response.text.trim());
                var savePromise = cacheKey ? saveToStorage(cacheKey, data) : Promise.resolve();
                return savePromise.then(function() {
                    return data;
                });
            });
        } catch (error) {
            console.error("Error generating custom flashcards:", error);
            throw new Error("Failed to generate flashcards.");
        }
    });
}

export function generateMedicalShorthandFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_SHORTHAND;
    var prompt = "Create 40 flashcards covering essential medical abbreviations and terminology prefixes/suffixes common in NHA exams (e.g., bid, tid, qd, po, NPO, PRN, Hyper-, Hypo-, -itis, -ectomy). Provide the term, definition, and context.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateGriefFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_GRIEF;
    var prompt = "Create 15 flashcards for Psychology & Grief. \n1. MUST include a card specifically listing the 5 Stages of Grief in strictly chronological order (Denial -> Anger -> Bargaining -> Depression -> Acceptance).\n2. MUST include cards for Erikson's Stages of Psychosocial Development (e.g., Trust vs. Mistrust, Autonomy vs. Shame, Integrity vs. Despair) relevant to patient care.\n3. Include therapeutic communication techniques and coping mechanisms.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateVitalsLabsFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_VITALS;
    var prompt = "Create 30 flashcards covering Normal and Abnormal Vital Signs for different age groups (Infant, Child, Adult) and Common Lab Values (Sodium, Potassium, Glucose, HgbA1c, Cholesterol, Hematocrit/Hemoglobin) based on NHA standards.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generatePreventiveCareFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_PREVENTIVE;
    var prompt = "Create 25 flashcards covering Preventive Care: Recommended Screening Tests by age (Mammogram, Colonoscopy, Pap smear) and Immunization Schedules (Pediatric and Adult) per CDC/NHA guidelines.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generatePathologyFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_PATHOLOGY;
    var prompt = "Create 30 flashcards classifying common diseases by pathogen type (Bacterial, Viral, Fungal, Parasitic/Protozoan). Example: Influenza (Viral), Strep Throat (Bacterial), Malaria (Parasitic). Include transmission methods.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateTubeDrawFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_TUBE_DRAW;
    var prompt = "Create 25 flashcards for the Phlebotomy Order of Draw and Tube Additives. \n1. MUST have a card explicitly listing the full Venipuncture Order of Draw (Cultures -> Citrate -> Serum -> Heparin -> EDTA -> Fluoride).\n2. MUST have a card explicitly listing the Capillary Order of Draw (Blood Gas -> EDTA -> Other Additives -> Serum).\n3. Use 'EDTA' generally, do not distinguish K2/K3.\n4. Include common tests for each tube.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateSpecializedCollectionsFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_SPECIALIZED;
    var prompt = "Create 25 flashcards for Specialized Lab Collections based on NHA standards. Include: 1. Blood Cultures (Aerobic vs Anaerobic order, skin prep). 2. Newborn Screenings (PKU). 3. Forensic Testing (Chain of Custody). 4. Special Handling: Bilirubin (Protect from light), Ammonia/Lactic Acid (Ice slurry), Cold Agglutinins (Keep warm).";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateEkgLeadsFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_EKG_LEADS;
    var prompt = "Create 30 flashcards for EKG Leads and Cardiac Anatomy. \n1. Lead Placement: Exact location for V1-V6 and limb leads.\n2. LEAD GROUPINGS & HEART WALLS: You MUST include cards mapping leads to walls (e.g., 'Leads II, III, aVF' -> 'Inferior Wall'; 'Leads I, aVL, V5, V6' -> 'Lateral Wall'; 'Leads V1, V2' -> 'Septal'; 'Leads V3, V4' -> 'Anterior').\n3. Anatomy: Electrical Conduction System (SA Node -> AV Node -> Bundle of His -> Bundle Branches -> Purkinje Fibers) and their intrinsic rates.\n4. Blood flow through heart chambers and valves.";
    return generateCustomFlashcards(prompt, cacheKey, forceRefresh);
}

export function generateEkgFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_EKG_RHYTHMS;
    
    var storagePromise = forceRefresh ? Promise.resolve(null) : getFromStorage(cacheKey);

    return storagePromise.then(function(cached) {
        if (cached) return cached;

        var prompt = "Create a set of 15 EKG flashcards covering essential rhythms and calculation methods for the CET exam. \n1. Rhythms: Normal Sinus Rhythm, Sinus Bradycardia, Sinus Tachycardia, A-Fib, A-Flutter, SVT, V-Tach, V-Fib, Asystole, Heart Blocks (1st, 2nd Type 1 & 2, 3rd).\n2. HEART RATE CALCULATION METHODS: You MUST include specific flashcards for the '1500 Method', '300 (Sequence) Method', and '6-Second Method'.\nFor each card provide:\n1. 'interpretation': The name (or method).\n2. 'explanation': Key criteria (or the formula/technique).\n3. 'responseProcedure': The NHA REQUIRED intervention (e.g., 'Start CPR', 'Monitor') OR 'Calculation Technique' for method cards.\n4. 'visualPrompt': A description to generate the EKG image or a diagram of the calculation method.";

        try {
            var ai = getAi();
            return ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: ekgSchema
                    }
                }
            }).then(function(response) {
                var items = JSON.parse(response.text.trim());
                return runSequentially(items, function(item) {
                    return ai.models.generateContent({
                        model: "gemini-2.5-flash-image",
                        contents: { parts: [{ text: "Generate a clear, high-contrast medical illustration or EKG strip showing: " + item.visualPrompt }] }
                    }).then(function(imgResponse) {
                         var base64 = null;
                         if(imgResponse.candidates && imgResponse.candidates[0].content.parts) {
                             for(var i=0; i<imgResponse.candidates[0].content.parts.length; i++) {
                                 var part = imgResponse.candidates[0].content.parts[i];
                                 if(part.inlineData) {
                                     base64 = part.inlineData.data;
                                     break;
                                 }
                             }
                         }
                         if (base64) {
                             item.image = "data:image/png;base64," + base64;
                         }
                         return item;
                    });
                }).then(function(results) {
                    return saveToStorage(cacheKey, results).then(function() {
                        return results;
                    });
                });
            });
        } catch (error) {
            console.error("Error generating EKG flashcards:", error);
            throw new Error("Failed to generate EKG flashcards.");
        }
    });
}

export function generateBodyPositionFlashcards(forceRefresh) {
    var cacheKey = STORAGE_KEYS.FLASHCARDS_BODY_POSITIONS;
    var storagePromise = forceRefresh ? Promise.resolve(null) : getFromStorage(cacheKey);

    return storagePromise.then(function(cached) {
        if (cached) return cached;

        var prompt = "Create a set of 10 flashcards for Patient Body Positions. \nPositions: Supine, Prone, Dorsal Recumbent, Lithotomy, Sims (Lateral), Fowler's, Semi-Fowler's, Knee-Chest, Trendelenburg. \nIMPORTANT RULES:\n1. 'Fowler's' is 90 degrees (upright).\n2. 'Semi-Fowler's' is 45 degrees (reclining).\n3. DO NOT include High Fowler's.\n4. Provide 'visualPrompt' for a medical illustration.";

        try {
            var ai = getAi();
            return ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: bodyPositionSchema
                    }
                }
            }).then(function(response) {
                var items = JSON.parse(response.text.trim());
                 return runSequentially(items, function(item) {
                    return ai.models.generateContent({
                        model: "gemini-2.5-flash-image",
                        contents: { parts: [{ text: "Generate a simple, clear, line-art style medical illustration of a patient in the " + item.positionName + " position. " + item.visualPrompt }] }
                    }).then(function(imgResponse) {
                         var base64 = null;
                         if(imgResponse.candidates && imgResponse.candidates[0].content.parts) {
                             for(var i=0; i<imgResponse.candidates[0].content.parts.length; i++) {
                                 var part = imgResponse.candidates[0].content.parts[i];
                                 if(part.inlineData) {
                                     base64 = part.inlineData.data;
                                     break;
                                 }
                             }
                         }
                         if (base64) {
                             item.image = "data:image/png;base64," + base64;
                         }
                         return item;
                    });
                }).then(function(results) {
                    return saveToStorage(cacheKey, results).then(function() {
                        return results;
                    });
                });
            });
        } catch (error) {
            console.error("Error generating Body Position flashcards:", error);
            throw new Error("Failed to generate Body Position flashcards.");
        }
    });
}
