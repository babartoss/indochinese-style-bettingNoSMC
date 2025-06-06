'use client';
import dynamic from 'next/dynamic';
import { APP_NAME } from '~/lib/constants';

const BettingApp = dynamic(() => import('~/components/BettingApp'), { ssr: false });

export default function App({ title = APP_NAME }: { title?: string }) {
  return <BettingApp title={title} />;
}