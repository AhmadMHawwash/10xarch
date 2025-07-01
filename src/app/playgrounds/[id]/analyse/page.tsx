import { type Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/trpc/server';
import AnalysisClient from './client';

export const metadata: Metadata = {
  title: 'GitHub Analysis - 10×arch',
  description: 'Analyze GitHub repository to generate system architecture'
};

interface AnalysisPageProps {
  params: {
    id: string;
  };
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the playground to ensure user has access
    const { playground } = await api.playgrounds.getById(params.id);
    
    if (!playground) {
      redirect('/playgrounds');
    }

    return <AnalysisClient playgroundId={params.id} playground={playground} />;
  } catch (error) {
    console.error("Error fetching playground:", error);
    redirect('/playgrounds');
  }
} 