import { GoogleGenAI, Type } from "@google/genai";
import { Character, Dungeon, GameTurn, SimulationLog } from "../types";

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is missing!");
        throw new Error("API Key is missing");
    }
    return new GoogleGenAI({ apiKey });
};

const TOTAL_TURNS = 10;

// --- Dungeon Generation (Existing but tweaked) ---
export const generateDungeon = async (character: Character): Promise<Dungeon> => {
  const ai = getAI();
  const prompt = `
    Create a "Main God Space" (Infinite Flow genre) survival horror dungeon.
    Player: ${character.name}, Talent: ${character.talent?.name} (${character.talent?.description}).
    Difficulty: Rank D or C (Newbie).
    
    Language: Simplified Chinese (zh-CN).
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                type: { type: Type.STRING },
                playerCount: { type: Type.INTEGER },
                specialMechanism: { type: Type.STRING },
                backstory: { type: Type.STRING }
            },
            required: ["name", "difficulty", "type", "playerCount", "specialMechanism", "backstory"]
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as Dungeon;
  } catch (error) {
    console.error("Error", error);
    return {
      name: "午夜公寓 (离线模式)",
      difficulty: "D级",
      type: "灵异",
      playerCount: 7,
      specialMechanism: "理智值过低会看到幻觉",
      backstory: "你醒来在一个封闭的公寓里。"
    };
  }
};

// --- Interactive Turn Generation ---

export const startDungeonGame = async (character: Character, dungeon: Dungeon): Promise<GameTurn> => {
    const ai = getAI();
    const prompt = `
        Start a text adventure game (Infinite Flow style).
        Language: Simplified Chinese (zh-CN).
        Total Length: Strict ${TOTAL_TURNS} Turns.
        
        Dungeon: ${dungeon.name}. Backstory: ${dungeon.backstory}.
        Player: ${character.name}, Talent: ${character.talent?.name}.
        Stats: STR ${character.attributes.strength}, INT ${character.attributes.intelligence}.
        
        Generate Turn 1 of ${TOTAL_TURNS}.
        Phase: Introduction / Mystery Setup.
        Description should be immersive, tense, and horror-themed.
        KEEP SCENARIO TEXT CONCISE (under 120 words) for mobile display.
        
        CRITICAL: Provide a 'visualPrompt' in ENGLISH describing the scene visually.
        CRITICAL: Provide an 'atmosphere' tag.
        
        Return JSON.
    `;
    return fetchTurn(ai, prompt);
};

export const processPlayerTurn = async (
    character: Character, 
    dungeon: Dungeon, 
    history: string, 
    choice: string,
    currentTurnNumber: number
): Promise<GameTurn> => {
    const ai = getAI();
    const nextTurnNum = currentTurnNumber + 1;
    
    let pacingInstruction = "";
    if (nextTurnNum <= 3) {
        pacingInstruction = "Phase: Exploration & Rising Mystery. Introduce small threats.";
    } else if (nextTurnNum <= 7) {
        pacingInstruction = "Phase: High Tension & Crisis. The situation gets dangerous. Major conflicts.";
    } else if (nextTurnNum <= 9) {
        pacingInstruction = "Phase: CLIMAX. The Boss or Final Escape is happening NOW. Very high stakes.";
    } else {
        pacingInstruction = "Phase: RESOLUTION / ENDING. If player survives this choice, they win.";
    }

    const prompt = `
        Continue the survival game.
        Language: Simplified Chinese (zh-CN).
        
        Current Turn: ${nextTurnNum} of ${TOTAL_TURNS}.
        ${pacingInstruction}
        
        Dungeon: ${dungeon.name}.
        Player: ${character.name} (HP: ${character.hp}, SAN: ${character.san}).
        Previous Story Context: ${history}
        
        PLAYER CHOSE: "${choice}"
        
        1. Calculate the outcome.
        2. Advance the story based on the Pacing Phase above.
        3. KEEP SCENARIO TEXT CONCISE (under 120 words) for mobile display.
        4. Provide 'visualPrompt' in ENGLISH for the NEW scene.
        5. Provide 'atmosphere'.
        
        Return JSON.
    `;
    return fetchTurn(ai, prompt);
};

async function fetchTurn(ai: GoogleGenAI, prompt: string): Promise<GameTurn> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        turnNumber: { type: Type.INTEGER },
                        day: { type: Type.INTEGER },
                        time: { type: Type.STRING },
                        lastResult: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                hpChange: { type: Type.INTEGER },
                                sanChange: { type: Type.INTEGER }
                            },
                            nullable: true
                        },
                        scenarioText: { type: Type.STRING },
                        visualPrompt: { type: Type.STRING, description: "Detailed visual description in English for image generation" },
                        atmosphere: { type: Type.STRING, enum: ['calm', 'tense', 'horror', 'battle', 'sad'] },
                        choices: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ["aggressive", "stealth", "intellect", "luck"] }
                                }
                            }
                        }
                    },
                    required: ["turnNumber", "day", "time", "scenarioText", "choices", "visualPrompt", "atmosphere"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as GameTurn;
    } catch (e) {
        console.error("Turn generation failed", e);
        return {
            turnNumber: 1,
            day: 1,
            time: "系统错误",
            scenarioText: "系统连接中断... 但你能感觉到周围是一片黑暗的虚空。",
            visualPrompt: "dark void, glitch art, matrix style code rain, cyberpunk",
            atmosphere: "calm",
            choices: [{ id: "retry", text: "尝试重连", type: "luck" }]
        };
    }
}

// --- Simulation Mode ---

export const simulateSurvival = async (character: Character, dungeon: Dungeon): Promise<SimulationLog[]> => {
    const ai = getAI();
    const prompt = `
        Simulate a quick 5-day survival run for a player in a dungeon.
        Language: Simplified Chinese (zh-CN).
        
        Dungeon: ${dungeon.name} (${dungeon.difficulty}).
        Player: ${character.name}, Talent: ${character.talent?.name}.
        
        Generate a JSON array of logs.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.INTEGER },
                            event: { type: Type.STRING },
                            hpChange: { type: Type.INTEGER },
                            sanChange: { type: Type.INTEGER },
                            result: { type: Type.STRING, enum: ["ALIVE", "DEAD", "INSANE", "CLEARED"] }
                        },
                        required: ["day", "event", "hpChange", "sanChange", "result"]
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No text response");
        return JSON.parse(text) as SimulationLog[];
    } catch (error) {
        console.error("Simulation failed", error);
        return [
            { day: 1, event: "Simulation failed due to system error.", hpChange: 0, sanChange: 0, result: "ALIVE" }
        ];
    }
};