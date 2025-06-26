// src/app/.well-known/farcaster.json/route.ts
import { NextResponse } from 'next/server';
import { getHostname } from '../../../lib/utils'; // nếu utils.ts nằm tại src/lib/utils.ts

export async function GET(req: Request) {
  const hostname = getHostname();

  return NextResponse.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjEwNDI0OTQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyNTE2YTg4MjUwNGZjMEM0NDNENUUxM2NiNzk4OEIzNGJiQWQyNTU5In0",
      payload:
        "eyJkb21haW4iOiJpbmRvY2hpbmVzZS1zdHlsZS1iZXR0aW5nLW5vLXNtYy52ZXJjZWwuYXBwIn0",
      signature:
        "MHg3MTVIZjBhYjgxODk0MGY2NzEzNzNhZjE2YzQ1ZTYxNTQxZThlN2FjNmVjZjUwNTA5NWFkNWIxNTkzYzg2NTQzNTI4MmJjY2YyODJlNmViZjY3YmRkMjZiNmM0M2Q5ZWY4NTg1NjMxM2M4NGIxM2Q2YzM0YThlYjZiZDA1ZDdkZjFi"
    },
    version: "1",
    name: "indochinese-style-betting",
    homeUrl: `https://${hostname}`,
    iconUrl: `https://${hostname}/image.png`,
    splashImageUrl: `https://${hostname}/splash.png`,
    webhookUrl: `https://${hostname}/api/send-notification`,
    description: "Simple Farcaster betting app with lottery logic",
    primaryCategory: "games",
    tags: ["lottery", "betting", "crypto", "web3"]
  });
}
