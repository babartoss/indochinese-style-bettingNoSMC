import React from 'react';
import Link from 'next/link';

export default function HowToPlay() {
  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">How to Play</h1>
      <p className="mb-4">Welcome to Indochinese Style Betting! Place bets on two-digit numbers based on the Vietnam Northern Lottery results.</p>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Betting Schedule</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>Betting opens at 20:00 UTC every day.</li>
          <li>Betting closes at 14:00 UTC the next day.</li>
          <li>Rewards are distributed at 09:00 AM UTC the next day after lottery results are announced at 18:35 Vietnam time (11:35 UTC).</li>
        </ul>
      </div>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">How to Place a Bet</h2>
        <ol className="list-decimal pl-5 mb-4">
          <li>Connect your wallet using Farcaster authentication.</li>
          <li>Choose your bet type: Single Ticket (one two-digit number, 00-99) or Multiple Tickets (multiple two-digit numbers).</li>
          <li>Enter the bet amount per position (minimum 0.20 USDC, maximum 100 USDC).</li>
          <li>Review the total cost and place your bet before 14:00 UTC.</li>
        </ol>
      </div>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Fees</h2>
        <p className="mb-4">A fixed fee of 0.10 USDC is applied per transaction, regardless of the number of tickets.</p>
      </div>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Odds and Rewards</h2>
        <p className="mb-4">The odds are 1:60. For each winning number, you win 60 times your bet amount per position (e.g., 0.20 USDC bet wins 12 USDC per match).</p>
      </div>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Cost Calculation</h2>
        <ul className="list-disc pl-5 mb-4">
          <li>Single Ticket: Total cost = Bet amount per position × 5 + 0.10 USDC fee.</li>
          <li>Example: Bet 0.30 USDC on one number, total = 0.30 × 5 + 0.10 = 1.60 USDC.</li>
          <li>Multiple Tickets: Total cost = Number of tickets × Bet amount per position × 5 + 0.10 USDC fee.</li>
          <li>Example: Bet 0.40 USDC on three numbers, total = 3 × 0.40 × 5 + 0.10 = 6.10 USDC.</li>
        </ul>
      </div>
      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Checking Results</h2>
        <p className="mb-4">Results are based on the Vietnam Northern Lottery (special prize and seven prizes). View official results at <a href="[invalid url, do not cite]" className="text-blue-500 hover:underline">xoso.com.vn</a>.</p>
      </div>
      <div className="text-center mt-6">
        <Link href="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded border border-gray-300 hover:bg-gray-300 transition-colors">Back to Betting</Link>
      </div>
    </div>
  );
}