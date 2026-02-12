import React, { useState } from 'react';
import { CreationScreen } from './components/CreationScreen';
import { TalentDrawScreen } from './components/TalentDrawScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { DungeonInfoScreen } from './components/DungeonInfoScreen';
import { InteractiveDungeonScreen } from './components/InteractiveDungeonScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Character, Gender, AppState, Dungeon, Talent } from './types';
import { generateDungeon } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CREATION);
  const [character, setCharacter] = useState<Character | null>(null);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [endGameData, setEndGameData] = useState<{ result: 'DEAD' | 'INSANE' | 'CLEARED', logs: string[] } | null>(null);

  const handleCharacterCreate = (name: string, age: number, gender: Gender) => {
    // Basic attribute generation logic based on age and gender
    let strength = 5;
    let agility = 5;
    let constitution = 5;
    let intelligence = 5;
    let perception = 5;
    let spirit = 5;

    // Gender modifiers
    if (gender === Gender.MALE) {
      strength += 2;
      constitution += 1;
      spirit -= 1;
    } else {
      agility += 2;
      spirit += 1;
      strength -= 1;
    }

    // Age modifiers
    if (age < 25) {
      agility += 2;
      constitution += 1;
      intelligence -= 1;
      spirit -= 1;
    } else if (age > 45) {
      strength -= 1;
      agility -= 2;
      intelligence += 2;
      perception += 1;
      spirit += 2;
    }

    const newChar: Character = {
      name,
      age,
      gender,
      maxHp: constitution * 10 + 50,
      hp: constitution * 10 + 50,
      maxSan: spirit * 10 + 50,
      san: spirit * 10 + 50,
      attributes: {
        strength, agility, constitution, intelligence, perception, spirit
      },
      inventory: ['新手指南', '新手匕首', '基础恢复药剂'],
      points: 100
    };

    setCharacter(newChar);
    setAppState(AppState.TALENT_DRAW); // Go to talent draw instead of dashboard
  };

  const handleTalentSelected = (talent: Talent) => {
      if (!character) {
          console.error("Critical Error: Character state is null when selecting talent.");
          alert("系统错误：角色数据丢失，请重新创建。");
          setAppState(AppState.CREATION);
          return;
      }
      
      console.log("Talent selected:", talent);

      // Apply talent effects to attributes
      let updatedAttributes = { ...character.attributes };
      
      // Safety check for effect function
      if (typeof talent.effect === 'function') {
          updatedAttributes = { ...updatedAttributes, ...talent.effect(character.attributes) };
      }
      
      // Recalculate max stats based on new attributes
      const maxHp = updatedAttributes.constitution * 10 + 50;
      const maxSan = updatedAttributes.spirit * 10 + 50;

      // Special Logic for specific talents
      let finalPoints = character.points;
      if (talent.name === '钞能力') {
          finalPoints = 200;
      }

      const updatedChar: Character = {
          ...character,
          attributes: updatedAttributes,
          maxHp,
          hp: maxHp,
          maxSan,
          san: maxSan,
          points: finalPoints,
          talent
      };
      
      setCharacter(updatedChar);
      setAppState(AppState.DASHBOARD);
  };

  const startDungeonGeneration = async () => {
    setAppState(AppState.LOADING_DUNGEON);
    if (!character) return;

    // Simulate a minimum wait time for the "glitch" visual effect to be appreciated
    const minWait = new Promise(resolve => setTimeout(resolve, 2500));
    const genRequest = generateDungeon(character);

    const [_, generatedDungeon] = await Promise.all([minWait, genRequest]);
    
    setDungeon(generatedDungeon);
    setAppState(AppState.DUNGEON_INFO);
  };

  const startSimulation = () => {
      setAppState(AppState.INTERACTIVE_GAME);
  };

  const handleGameOver = (result: 'DEAD' | 'INSANE' | 'CLEARED', logs: string[]) => {
      setEndGameData({ result, logs });
      setAppState(AppState.GAME_OVER);
  };

  const resetGame = () => {
      setAppState(AppState.CREATION);
      setCharacter(null);
      setDungeon(null);
      setEndGameData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {appState === AppState.CREATION && (
        <CreationScreen onComplete={handleCharacterCreate} />
      )}

      {appState === AppState.TALENT_DRAW && (
          <TalentDrawScreen onConfirm={handleTalentSelected} />
      )}

      {appState === AppState.DASHBOARD && character && (
        <DashboardScreen character={character} onNext={startDungeonGeneration} />
      )}

      {appState === AppState.LOADING_DUNGEON && (
        <LoadingScreen />
      )}

      {appState === AppState.DUNGEON_INFO && dungeon && (
        <DungeonInfoScreen dungeon={dungeon} onStartSimulation={startSimulation} />
      )}

      {appState === AppState.INTERACTIVE_GAME && character && dungeon && (
          <InteractiveDungeonScreen character={character} dungeon={dungeon} onGameOver={handleGameOver} />
      )}

      {appState === AppState.GAME_OVER && endGameData && (
          <GameOverScreen result={endGameData.result} logs={endGameData.logs} onRestart={resetGame} />
      )}
    </div>
  );
};

export default App;