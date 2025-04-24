import { generateStaticParams, generateMetadata, revalidate } from "./StaticChallengeData";

export default async function ChallengePage({ params }: { params: { slug: string } }) {
  const { getChallengeData } = await import("./StaticChallengeData");
  const challengeData = getChallengeData({ params });
  
  if (!challengeData) {
    return { notFound: true };
  }
  
  const { default: ChallengeClient } = await import("./client");
  
  return <ChallengeClient initialData={challengeData} />;
}

export { generateStaticParams, generateMetadata, revalidate };