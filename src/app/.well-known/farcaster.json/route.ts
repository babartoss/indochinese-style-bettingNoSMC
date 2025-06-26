import { NextResponse } from 'next/server';
import { getFarcasterMetadata } from '../../../lib/utils';

export async function GET() {
  try {
    const config = await getFarcasterMetadata();
    console.log('Generated Farcaster metadata:', JSON.stringify(config, null, 2));
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error generating Farcaster metadata:', error);
    return NextResponse.json({ error: 'Failed to generate Farcaster metadata' }, { status: 500 });
  }
}