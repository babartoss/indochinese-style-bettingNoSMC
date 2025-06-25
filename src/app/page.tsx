import { getFrameEmbedMetadata } from '~/lib/utils';
import { APP_URL } from '~/lib/constants';
import MainApp from '~/components/MainApp';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const imageUrl = `${APP_URL}/image.png`;
  const frameMetadata = getFrameEmbedMetadata(imageUrl);
  return {
    other: {
      ...frameMetadata,
      'og:image': imageUrl,
    },
  };
}

export default function Page() {
  return <MainApp />;
}