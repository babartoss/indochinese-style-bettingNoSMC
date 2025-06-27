"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';
import { writeContract } from 'wagmi/actions';
import { sdk } from '@farcaster/frame-sdk';
import { parseUnits } from 'viem';
import Link from 'next/link';
import { MANAGER_FID } from '../lib/constants';
import { truncateAddress } from '../lib/truncateAddress';

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
  const [betType, setBetType] = useState<'single' | 'fullSet'>('single');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('0.2');
  const [donationOnlyAmount, setDonationOnlyAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const config = useConfig();

  useEffect(() => {
    console.log('[BettingApp] Component mounted');
  }, []);

  // Function to check betting time (UTC)
  const isBettingOpen = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const currentTime = utcHour + utcMinutes / 60;
    return currentTime >= 12 || currentTime < 7; // 12:00 UTC to 07:00 UTC next day
  };

  // Function to handle number selection
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Allow digits only
      setSelectedNumber(value);
    }
  };

  // Function to handle bet amount change
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Allow numbers and decimal point
      setBetAmount(value);
    }
  };

  // Function to handle donation amount change
  const handleDonationAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) { // Allow numbers and decimal point
      setDonationOnlyAmount(value);
    }
  };

  // Function to calculate total bet cost
  const calculateTotalCost = (betAmountNum: number) => {
    if (betType === 'single') {
      return betAmountNum * 5 + 0.1;
    } else {
      return betAmountNum * 27 + 0.1;
    }
  };

  // Function to handle placing a bet
  const handlePlaceBet = async () => {
    console.log('[BettingApp] handlePlaceBet called');
    setError('');
    if (!isConnected) {
      setError('Please connect your wallet.');
      return;
    }
    if (!isBettingOpen()) {
      setError('Betting is closed. Please try again during betting hours: 12:00 UTC to 07:00 UTC the next day.');
      return;
    }
    if (!/^\d{2}$/.test(selectedNumber)) {
      setError('Please enter exactly two digits (00-99).');
      return;
    }
    const betAmountNum = parseFloat(betAmount);
    if (isNaN(betAmountNum) || betAmountNum < 0.2 || betAmountNum > 100) {
      setError('Bet amount must be between 0.20 USDC and 100 USDC.');
      return;
    }
    try {
      const totalCost = calculateTotalCost(betAmountNum);
      const totalCostInWei = parseUnits(totalCost.toString(), 6);
      console.log('[BettingApp] Initiating contract write:', { usdcAddress, totalCostInWei });
      await writeContract(config, {
        address: usdcAddress,
        abi: transferAbi,
        functionName: 'transfer',
        args: [recipientAddress, totalCostInWei],
      });
      console.log('[BettingApp] Contract write successful');
      try {
        const context = await sdk.context;
        const fid = context.user.fid;
        const truncatedAddress = truncateAddress(address || '');
        const playerBody = `${betType === 'single' ? 'Single Ticket' : 'Full Set'} Bet: Number ${selectedNumber} with ${betAmountNum} USDC per position, total cost ${totalCost} USDC (fee: 0.10 USDC), Wallet: ${truncatedAddress}`;
        const managerBody = `User FID ${fid}, Wallet ${truncatedAddress}, placed a ${betType} bet: Number ${selectedNumber}, Amount per position ${betAmountNum} USDC, Total ${totalCost} USDC`;

        // Gửi thông báo cho người chơi
        const playerResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid,
            title: betType === 'single' ? 'Single Ticket Bet Placed' : 'Full Set Bet Placed',
            body: playerBody,
          }),
        });

        // Gửi thông báo cho người quản lý
        const managerResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: MANAGER_FID,
            title: 'New Bet Placed',
            body: managerBody,
          }),
        });

        if (playerResponse.ok) {
          alert('Bet placed successfully!');
          setSelectedNumber('');
          setBetAmount('0.2');
        } else {
          const data = await playerResponse.json();
          setError(`Failed to send notification: ${data.error}`);
        }

        if (!managerResponse.ok) {
          console.error('Failed to send notification to manager:', await managerResponse.json());
        }
      } catch (sdkError) {
        console.error('[BettingApp] Error accessing Farcaster SDK context:', sdkError);
        setError('Farcaster SDK is not ready. Please try again later.');
      }
    } catch (error) {
      console.error('[BettingApp] Transaction failed:', error);
      setError('Transaction failed. Please check your USDC balance or try again.');
    }
  };

  // Function to handle donation
  const handleDonateOnly = async () => {
    console.log('[BettingApp] handleDonateOnly called');
    setError('');
    if (!isConnected) {
      setError('Please connect your wallet.');
      return;
    }
    const donationAmountNum = parseFloat(donationOnlyAmount);
    if (isNaN(donationAmountNum) || donationAmountNum <= 0) {
      setError('Donation amount must be greater than 0 USDC.');
      return;
    }
    try {
      const donationInWei = parseUnits(donationOnlyAmount, 6);
      console.log('[BettingApp] Initiating donation contract write:', { usdcAddress, donationInWei });
      await writeContract(config, {
        address: usdcAddress,
        abi: transferAbi,
        functionName: 'transfer',
        args: [recipientAddress, donationInWei],
      });
      console.log('[BettingApp] Donation contract write successful');
      try {
        const context = await sdk.context;
        const fid = context.user.fid;
        const truncatedAddress = truncateAddress(address || '');
        const playerBody = `Donation of ${donationOnlyAmount} USDC, Wallet: ${truncatedAddress}`;
        const managerBody = `User FID ${fid}, Wallet ${truncatedAddress}, donated ${donationOnlyAmount} USDC`;

        // Gửi thông báo cho người chơi
        const playerResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid,
            title: 'Donation Made',
            body: playerBody,
          }),
        });

        // Gửi thông báo cho người quản lý
        const managerResponse = await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: MANAGER_FID,
            title: 'New Donation Made',
            body: managerBody,
          }),
        });

        if (playerResponse.ok) {
          alert('Donation made successfully!');
          setDonationOnlyAmount('');
        } else {
          const data = await playerResponse.json();
          setError(`Failed to send notification: ${data.error}`);
        }

        if (!managerResponse.ok) {
          console.error('Failed to send donation notification to manager:', await managerResponse.json());
        }
      } catch (sdkError) {
        console.error('[BettingApp] Error accessing Farcaster SDK context:', sdkError);
        setError('Farcaster SDK is not ready. Please try again later.');
      }
    } catch (error) {
      console.error('[BettingApp] Donation failed:', error);
      setError('Donation failed. Please check your USDC balance or try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">{title || 'Indochinese Style Betting'}</h1>
      {!isConnected ? (
        <button
          onClick={() => {
            console.log('[BettingApp] Connect Wallet button clicked');
            connect({ connector: connectors[0], chainId: 8453 });
          }}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-sm">Connected: {address}</p>
          <button
            onClick={() => {
              console.log('[BettingApp] Disconnect button clicked');
              disconnect();
            }}
            className="text-blue-500 hover:underline"
          >
            Disconnect
          </button>
        </div>
      )}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Place a Bet</h2>
        <label className="block text-sm font-medium mb-1">Bet Type</label>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              console.log('[BettingApp] Bet type set to single');
              setBetType('single');
            }}
            className={`px-4 py-2 rounded ${betType === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
          >
            Single Ticket
          </button>
          <button
            onClick={() => {
              console.log('[BettingApp] Bet type set to full set');
              setBetType('fullSet');
            }}
            className={`px-4 py-2 rounded ${betType === 'fullSet' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} transition-colors`}
          >
            Full Set Bet
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Number (00-99)</label>
        <input
          type="text"
          placeholder="E.g., 12"
          value={selectedNumber}
          onChange={handleNumberChange}
          maxLength={2}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter exactly two digits (00-99)</p>
        {betType === 'single' && (
          <div className="text-sm mt-2">
            <p>Total cost: {(parseFloat(betAmount || '0') * 5 + 0.1).toFixed(2)} USDC (Bet amount × 5 + 0.10 USDC fee)</p>
            <p className="text-gray-600">Example: Bet 0.30 USDC on one number, total = 0.30 × 5 + 0.10 = 1.60 USDC.</p>
          </div>
        )}
        {betType === 'fullSet' && (
          <div className="text-sm mt-2">
            <p>Total cost: {(parseFloat(betAmount || '0') * 27 + 0.1).toFixed(2)} USDC (Bet amount × 27 + 0.10 USDC fee)</p>
            <p className="text-gray-600">Example: Bet 0.20 USDC on one number for all 27 positions, total = 0.20 × 27 + 0.10 = 5.50 USDC.</p>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Bet Amount per Position (USDC)</label>
        <input
          type="text"
          inputMode="decimal"
          value={betAmount}
          onChange={handleBetAmountChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter 0.20–100 USDC</p>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className={isBettingOpen() ? 'text-green-500 mb-2' : 'text-red-500 mb-2'}>
        {isBettingOpen() ? 'Betting is open' : 'Betting is closed'}
      </p>
      <button
        onClick={handlePlaceBet}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
      >
        Place Bet
      </button>
      <div className="mb-4 mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Donate Only</h2>
        <label className="block text-sm font-medium mb-1">Donation Amount (USDC)</label>
        <input
          type="text"
          inputMode="decimal"
          value={donationOnlyAmount}
          onChange={handleDonationAmountChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <p className="text-sm text-gray-500 mt-1">Enter amount greater than 0 USDC</p>
        <button
          onClick={handleDonateOnly}
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors mt-2"
        >
          Donate Only
        </button>
      </div>
      <div className="text-center mt-4">
        <Link href="/how-to-play" className="text-blue-500 hover:underline">How to Play</Link>
      </div>
    </div>
  );
};

export default BettingApp;