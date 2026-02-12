
export enum Gender {
  MALE = '男性',
  FEMALE = '女性'
}

export enum Rank {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

export interface Talent {
  name: string;
  rank: Rank;
  description: string;
  effect: (attrs: Attributes) => Partial<Attributes>; // Simplified effect description for now
}

export interface Attributes {
  strength: number;    // 力量
  agility: number;     // 敏捷
  constitution: number; // 体质
  intelligence: number; // 智力
  perception: number;   // 感知
  spirit: number;       // 精神
}

export interface Character {
  name: string;
  age: number;
  gender: Gender;
  hp: number;
  maxHp: number;
  san: number;
  maxSan: number;
  attributes: Attributes;
  inventory: string[];
  points: number;
  talent?: Talent;
}

export interface Dungeon {
  name: string;
  difficulty: string;
  type: string;
  playerCount: number;
  specialMechanism: string;
  backstory: string;
}

export interface GameTurn {
  turnNumber: number; // Current turn count (1-10)
  day: number;
  time: string; // e.g. "Night", "Morning"
  scenarioText: string;
  visualPrompt: string; // New: English prompt for image generation
  atmosphere: 'calm' | 'tense' | 'horror' | 'battle' | 'sad'; // New: For BGM
  choices: {
    id: string;
    text: string;
    type: 'aggressive' | 'stealth' | 'intellect' | 'luck';
  }[];
  lastResult?: {
    text: string;
    hpChange: number;
    sanChange: number;
  };
}

export interface SimulationLog {
  day: number;
  event: string;
  hpChange: number;
  sanChange: number;
  result: 'ALIVE' | 'DEAD' | 'INSANE' | 'CLEARED';
}

export enum AppState {
  CREATION,
  TALENT_DRAW,
  DASHBOARD,
  LOADING_DUNGEON,
  DUNGEON_INFO,
  INTERACTIVE_GAME,
  GAME_OVER
}
