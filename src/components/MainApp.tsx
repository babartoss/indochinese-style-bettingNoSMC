'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { APP_NAME } from '~/lib/constants';
import { sdk } from '@farcaster/frame-sdk';

const BettingApp = dynamic(() => import('~/components/BettingApp'), { ssr: false });

const HowToPlay: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">How to Play</h1>
      <p className="mb-4">Welcome to Indochinese Style Betting! Place bets on two-digit numbers based on the Vietnam Northern Lottery results.</p>
      <h2 className="text-xl font-semibold mb-2">Betting Schedule</h2>
      <ul className="list-disc pl-5 mb-4">
        <li>Betting opens at 12:00 UTC every day.</li>
        <li>Betting closes at 07:00 UTC the next day.</li>
        <li>The lottery draw takes place at 11:45 UTC the every day.</li>
        <li>Rewards are distributed at 01:30 UTC the day after the draw.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">How to Place a Bet</h2>
      <ol className="list-decimal pl-5 mb-4">
        <li>Connect your wallet using Farcaster authentication.</li>
        <li>Choose your bet type: Single Ticket (one two-digit number, 00-99, checked against specific prizes) or Full Set Bet (one two-digit number, checked against all 27 prizes).</li>
        <li>Enter the bet amount per position (minimum 0.20 USDC, maximum 100 USDC).</li>
        <li>Review the total cost and place your bet before the closing time.</li>
      </ol>
      <h2 className="text-xl font-semibold mb-2">Fees</h2>
      <p className="mb-4">A fixed fee of 0.10 USDC is applied per transaction, regardless of the bet type.</p>
      <h2 className="text-xl font-semibold mb-2">Odds and Rewards</h2>
      <p className="mb-4">The odds are 1:60. For each winning number, you win 60 times your bet amount per position (e.g., 0.20 USDC bet wins 12 USDC per match).</p>
      <h2 className="text-xl font-semibold mb-2">Cost Calculation</h2>
      <ul className="list-disc pl-5 mb-4">
        <li>Single Ticket: Total cost = Bet amount per position × 5 + 0.10 USDC fee.</li>
        <li>Example: Bet 0.30 USDC on one number, total = 0.30 × 5 + 0.10 = 1.60 USDC.</li>
        <li>Full Set Bet: Total cost = Bet amount per position × 27 + 0.10 USDC fee.</li>
        <li>Example: Bet 0.20 USDC on one number for all 27 positions, total = 0.20 × 27 + 0.10 = 5.50 USDC.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">Checking Results</h2>
      <p className="mb-4">Results are based on the Vietnam Northern Lottery (special prize and seven prizes). View official results at <a href="https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac.html" className="text-blue-500 hover:underline">Click Here</a>.</p>
      <div className="text-center">
        <button
          onClick={() => {
            console.log('[HowToPlay] Try your luck button clicked');
            try {
              onStart();
              console.log('[HowToPlay] onStart called successfully');
            } catch (error) {
              console.error('[HowToPlay] Error in onStart:', error);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try your luck
        </button>
      </div>
    </div>
  );
};

export default function MainApp({ title = APP_NAME }: { title?: string }) {
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  console.log('[MainApp] showHowToPlay:', showHowToPlay);

  useEffect(() => {
    const initialize = async () => {
      try {
        await sdk.actions.ready();
        console.log('Splash screen hidden');
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    };
    initialize();
  }, []);

  return showHowToPlay ? (
    <HowToPlay onStart={() => {
      console.log('[MainApp] onStart triggered');
      setShowHowToPlay(false);
    }} />
  ) : (
    <BettingApp title={title} />
  );
}