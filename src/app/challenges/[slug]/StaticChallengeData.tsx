import challenges from "@/content/challenges";
import { type Challenge } from "@/content/challenges/types";

// Define the types for props
export interface StaticChallengeDataProps {
  params: {
    slug: string;
  };
}

// Define the type for the return data
export type ChallengeData = {
  challenge: Challenge;
  slug: string;
}

// Generate static params for all challenges
export async function generateStaticParams() {
  return challenges.map((challenge) => ({
    slug: challenge.slug,
  }));
}

// Set revalidation period to 12 hours
export const revalidate = 43200;

// Add metadata for dynamic pages
export function generateMetadata({ params }: StaticChallengeDataProps) {
  const challenge = challenges.find((c) => c.slug === params.slug);
  
  if (!challenge) {
    return {
      title: "Challenge Not Found",
      description: "The requested challenge could not be found."
    };
  }
  
  return {
    title: `${challenge.title} - System Design Challenge`,
    description: challenge.description,
    openGraph: {
      title: `${challenge.title} - System Design Challenge`,
      description: challenge.description,
      type: "article",
    },
  };
}

// This function can be imported in the client component
export function getChallengeData({ params }: StaticChallengeDataProps): ChallengeData | null {
  const challenge = challenges.find((c) => c.slug === params.slug);
  
  if (!challenge) {
    return null;
  }
  
  return {
    challenge,
    slug: params.slug
  };
} 