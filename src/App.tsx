/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { TopNavBar } from './components/navigation/TopNavBar';
import { BottomTabBar } from './components/navigation/BottomTabBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { CampaignScreen } from './components/screens/CampaignScreen';
import { MultiplayerScreen } from './components/screens/MultiplayerScreen';
import { PuzzlesScreen } from './components/screens/PuzzlesScreen';
import { ShopScreen } from './components/screens/ShopScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { GameScreen } from './components/screens/GameScreen';
import { testFirestoreConnection, auth } from './lib/firebase';

const AppContent: React.FC = () => {
  const { activeTab, activeGameSession, deviceViewMode, updateUserAvatar, user } = useGame();

  // Test connection on initial boot as required by Firestore integration skill
  useEffect(() => {
    testFirestoreConnection().catch(() => {});
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        updateUserAvatar(
          firebaseUser.photoURL || user.avatar,
          firebaseUser.displayName || user.name
        );
      }
    });
    return () => unsubscribe();
  }, []);

  // Render current active screen
  const renderScreen = () => {
    if (activeGameSession) {
      return <GameScreen />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'campaign':
        return <CampaignScreen />;
      case 'multiplayer':
        return <MultiplayerScreen />;
      case 'puzzles':
        return <PuzzlesScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isMobileFrame = deviceViewMode === 'mobile' && !activeGameSession;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-start overflow-x-hidden">
      {isMobileFrame ? (
        // Mobile Frame View on desktop preview
        <div className="py-6 px-2 w-full flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-[430px] min-h-[860px] bg-[#0d111a] rounded-[48px] border-[10px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative ring-1 ring-slate-700/60">
            {/* Dynamic Island / Bezel notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 ml-auto mr-3" />
            </div>

            {/* Top Bar */}
            <TopNavBar />

            {/* Screen Content */}
            <div className="flex-1 overflow-y-auto">
              {renderScreen()}
            </div>

            {/* Bottom Nav */}
            <BottomTabBar />
          </div>
        </div>
      ) : (
        // Expanded Responsive View
        <div className="w-full min-h-screen flex flex-col">
          <TopNavBar />
          <main className="flex-1">
            {renderScreen()}
          </main>
          <BottomTabBar />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
