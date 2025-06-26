import { APP_URL } from '~/lib/constants';
import MainApp from '~/components/MainApp';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const embedJson = JSON.stringify({
    version: "next",
    imageUrl: `${APP_URL}/image.png`,
    button: {
      title: "Try your luck",
      action: {
        type: "launch_frame",
        name: "Indochinese Style Betting",
        url: APP_URL,
        splashImageUrl: `${APP_URL}/splash.png`,
        splashBackgroundColor: "#ffffff"
      }
    }
  });

  return {
    other: {
      'fc:frame': embedJson,
      'og:image': `${APP_URL}/image.png`
    }
  };
}

export default function Page() {
  return <MainApp />;
}