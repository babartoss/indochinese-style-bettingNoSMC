import { APP_URL } from '~/lib/constants';
import MainApp from '~/components/MainApp';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `${APP_URL}/image.png`;
  return {
    title: 'Indochinese Style Betting',
    description: 'A decentralized betting platform with Indochinese style',
    openGraph: {
      images: [imageUrl],
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': imageUrl,
      'fc:frame:button:1': 'Try your luck',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': APP_URL,
      'og:image': imageUrl,
    },
  };
}

export default function Page() {
  return <MainApp />;
}