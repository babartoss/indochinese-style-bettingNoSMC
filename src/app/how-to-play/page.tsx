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
          <li>Betting opens at 12:00 UTC every day.</li>
          <li>Betting closes at 07:00 UTC the next day.</li>
          <li>The lottery draw takes place at 11:45 UTC the every day.</li>
          <li>Rewards are distributed at 01:30 UTC the day after the draw.</li>
        </ul>
      </div>

      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">How to Place a Bet</h2>
        <ol className="list-decimal pl-5 mb-4">
          <li>Connect your wallet using Farcaster authentication.</li>
          <li>Choose your bet type: Single Ticket (bet on one two-digit number, 00-99, checked against specific prizes) or Full Set Bet (bet on one two-digit number, 00-99, checked against the last two digits of all 27 prizes).</li>
          <li>Enter the bet amount per position (minimum 0.20 USDC, maximum 100 USDC).</li>
          <li>Review the total cost and place your bet before the closing time.</li>
        </ol>
      </div>

      <div className="border border-yellow-300 rounded p-4 mb-6 bg-yellow-50">
        <h2 className="text-xl font-semibold mb-2">Optional: Send Bet via Telegram</h2>
        <p className="mb-2">
          For extra security or in case the app fails to record your bet, you can send your bet details directly to our assistant at <a href="https://farcaster.xyz/babartos" className="text-blue-500 hover:underline">@babartos</a> using the following format:
        </p>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2">
{`Type = (Single Ticket or Full Set Bet);
Number = (your chosen two-digit number, e.g. 00–99);
Amount = (total USDC you want to bet);
Wallet = (your wallet address - optional but recommended).`}
        </pre>
        <p className="text-sm text-gray-600">
          Providing your wallet address is optional but helps verify your bet and resolve issues if any occur.
        </p>
      </div>

      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Fees</h2>
        <p className="mb-4">A fixed fee of 0.10 USDC is applied per transaction, regardless of the bet type.</p>
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
          <li>Full Set Bet: Total cost = Bet amount per position × 27 + 0.10 USDC fee.</li>
          <li>Example: Bet 0.20 USDC on one number for all 27 positions, total = 0.20 × 27 + 0.10 = 5.50 USDC.</li>
        </ul>
      </div>

      <div className="border border-gray-300 rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Checking Results</h2>
        <p className="mb-4">Results are based on the Vietnam Northern Lottery (special prize and seven prizes). View official results at <a href="https://www.minhngoc.net.vn/ket-qua-xo-so/mien-bac.html" className="text-blue-500 hover:underline">ClickHere</a>.</p>
      </div>

      <div className="text-center mt-6">
        <Link href="/" className="bg-gray-200 text-gray-800 px-4 py-2 rounded border border-gray-300 hover:bg-gray-300 transition-colors">Back to Betting</Link>
      </div>
    </div>
  );
}
