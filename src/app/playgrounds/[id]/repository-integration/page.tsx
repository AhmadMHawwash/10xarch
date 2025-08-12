import { type Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { api } from '@/trpc/server';
import RepositoryIntegrationClient from './client';

export const metadata: Metadata = {
  title: 'Repository Integration - 10×arch',
  description: 'Integrate GitHub repository to generate system architecture'
};

interface RepositoryIntegrationPageProps {
  params: {
    id: string;
  };
}

export default async function RepositoryIntegrationPage({ params }: RepositoryIntegrationPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get the playground to ensure user has access and include associated repository data
    const { playground } = await api.playgrounds.getById(params.id);
    
    if (!playground) {
      redirect('/playgrounds');
    }

    return <RepositoryIntegrationClient playgroundId={params.id} playground={playground} />;
  } catch (error) {
    console.error("Error fetching playground:", error);
    redirect('/playgrounds');
  }
} 