import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { APP_URL, APP_NAME, APP_DESCRIPTION } from "~/lib/constants";
import { getFrameEmbedMetadata } from "~/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ fid: string }> }): Promise<Metadata> {
  const { fid } = await params;
  const imageUrl = `${APP_URL}/api/opengraph-image?fid=${fid}`;

  return {
    title: `${APP_NAME} - Share`,
    openGraph: {
      title: `${APP_NAME} - Share`,
      description: APP_DESCRIPTION,
      images: [imageUrl],
    },
    other: getFrameEmbedMetadata(imageUrl),
  };
}

export default function SharePage() {
  redirect("/");
}