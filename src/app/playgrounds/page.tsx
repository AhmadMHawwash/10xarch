import { type Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PlaygroundsClient from './client';
import { api } from '@/trpc/server';

export const metadata: Metadata = {
  title: '10×arch Playgrounds - Your System Designs',
  description: 'View, create and manage your system design playgrounds.'
};

export default async function PlaygroundsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/signin');
  }

  try {
    // Get playgrounds
    const { playgrounds } = await api.playgrounds.getAll();
    return <PlaygroundsClient initialPlaygrounds={playgrounds} />;
  } catch (error) {
    console.error("Error fetching playgrounds:", error);
    // Return client with empty data
    return <PlaygroundsClient initialPlaygrounds={[]} />;
  }
} 