"use client";

import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';
import { writeContract } from 'wagmi/actions';
import { sdk } from '@farcaster/frame-sdk';
import { parseUnits } from 'viem';
import Link from 'next/link';

const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
const recipientAddress = '0xb37bF0176558B9e76507b79d38D4696DD1805bee'; // Recipient address

const transferAbi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const BettingApp: React.FC<{ title?: string }> = ({ title }) => {
  const [betType, setBetType] = useState<'single' | 'multiple'>('single');
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [betAmount, setBetAmount] = useState<number>(0.2);
  const [donationOnlyAmount, setDonationOnlyAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const config = useConfig();

  // Function to check betting time
  const isBettingOpen = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const currentTime = utcHour + utcMinutes / 60;
    return currentTime >= 20 || currentTime < 14;
  };

  // Handle number selection
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value
      .split(',')
      .map(num => num.trim())
      .filter(num => num.length === 2 && !isNaN(Number(num)) && Number(num) >= 0 && Number(num) <= 99);
    setSelectedNumbers(numbers);
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (betType === 'single') {
      return betAmount * 5 + 0.1;
    } else {
      return selectedNumbers.length * betAmount * 5 + 0.1;
    }
  };

  // Handle place bet
  const handlePlaceBet = async () => {
    if (!isBettingOpen()) {
      setError('Betting is only open from 20:00 UTC to 14:00 UTC the next day.');
      return;
    }
    if (!isConnected) {
      setError('Please connect your wallet.');
      return;
    }
    if (betType === 'single' && selectedNumbers.length !== 1) {
      setError('Please select exactly one two-digit number (00-99) for single ticket bet.');
      return;
    }
    if (betType === 'multiple' && selectedNumbers.length < 1) {
      setError('Please select at least one two-digit number (00-99) for multiple tickets bet.');
      return;
    }
    if (betAmount < 0.2 || betAmount > 100) {
      setError('Bet amount must be between 0.20 USDC and 100 USDC.');
      return;
    }
    try {
      const totalCost = calculateTotalCost();
      const totalCostInWei = parseUnits(totalCost.toString(), 6);
      await writeContract(config, {
        address: usdcAddress,
        abi: transferAbi,
        functionName: 'transfer',
        args: [recipientAddress, totalCostInWei],
      });
      const context = await sdk.context;
      const fid = context.user.fid;
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          title: 'Bet Placed',
          body: `Bet placed: ${selectedNumbers.join(', ')} with ${betAmount} USDC each, total cost ${totalCost} USDC (fee: 0.10 USDC)`,
        }),
      });
      if (response.ok) {
        alert('Bet placed successfully!');
      } else {
        const data = await response.json();
        setError(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setError('Transaction failed. Please check your USDC balance or try again.');
    }
  };

  // Handle donate only
  const handleDonateOnly = async () => {
    if (!isConnected) {
      setError('Please connect your wallet.');
      return;
    }
    if (donationOnlyAmount <= 0) {
      setError('Donation amount must be greater than 0 USDC.');
      return;
    }
    try {
      const donationInWei = parseUnits(donationOnlyAmount.toString(), 6);
      await writeContract(config, {
        address: usdcAddress,
        abi: transferAbi,
        functionName: 'transfer',
        args: [recipientAddress, donationInWei],
      });
      const context = await sdk.context;
      const fid = context.user.fid;
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fid,
          title: 'Donation Made',
          body: `Donation of ${donationOnlyAmount} USDC made.`,
        }),
      });
      if (response.ok) {
        alert('Donation made successfully!');
      } else {
        const data = await response.json();
        setError(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Donation failed:', error);
      setError('Donation failed. Please check your USDC balance or try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">{title || 'Indochinese Style Betting'}</h1>
      {!isConnected ? (
        <button
          onClick={() => connect({ connector: connectors[0], chainId: 8453 })}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-sm">Connected: {address}</p>
          <button
            onClick={() => disconnect()}
            className="text-blue-500 hover:underline"
          >
            Disconnect
          </button>
        </div>
      )}
      {connectError && <p className="text-red-500 mb-4">{connectError.message}</p>}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Place a Bet</h2>
        <label className="block text-sm font-medium mb-1">Bet Type</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setBetType('single')}
            className={`px-4 py-2 rounded ${betType === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
          >
            Single Ticket
          </button>
          <button
            onClick={() => setBetType('multiple')}
            className={`px-4 py-2 rounded ${betType === 'multiple' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
          >
            Multiple Tickets
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Numbers (comma-separated, 00-99)</label>
        <input
          type="text"
          placeholder={betType === 'single' ? 'E.g., 12' : 'E.g., 12,22,33'}
          onChange={handleNumberChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {betType === 'single' && (
          <div className="text-sm mt-2">
            <p>Total cost: {(betAmount * 5 + 0.1).toFixed(2)} USDC (Bet amount × 5 + 0.10 USDC fee)</p>
            <p className="text-gray-600">Example: Bet 0.30 USDC on one number, total = 0.30 × 5 + 0.10 = 1.60 USDC.</p>
          </div>
        )}
        {betType === 'multiple' && (
          <div className="text-sm mt-2">
            <p>Total cost: {(selectedNumbers.length * betAmount * 5 + 0.1).toFixed(2)} USDC (Number of tickets × Bet amount × 5 + 0.10 USDC fee)</p>
            <p className="text-gray-600">Example: Bet 0.40 USDC on three numbers, total = 3 × 0.40 × 5 + 0.10 = 6.10 USDC.</p>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Bet Amount per Position (USDC)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(parseFloat(e.target.value))}
          min="0.2"
          max="100"
          step="0.01"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handlePlaceBet}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
        disabled={!isBettingOpen()}
      >
        Place Bet
      </button>
      <div className="mb-4 mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Donate Only</h2>
        <label className="block text-sm font-medium mb-1">Donation Amount (USDC)</label>
        <input
          type="number"
          value={donationOnlyAmount}
          onChange={(e) => setDonationOnlyAmount(parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleDonateOnly}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mt-2"
        >
          Donate Only
        </button>
      </div>
      <div className="mt-4 text-center">
        <Link href="/how-to-play" className="text-blue-500 hover:underline">How to Play</Link>
      </div>
    </div>
  );
};

export default BettingApp;