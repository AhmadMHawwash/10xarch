import challenges from "@/content/challenges";
import { ChallengesList } from "./ChallengesList";

// Add revalidation period - 1 day (in seconds)
export const revalidate = 86400;

// Add metadata for SEO
export const metadata = {
  title: "System Design Challenges - Master Architecture Skills",
  description: "Browse our interactive system design challenges that help you learn architecture and system design concepts through hands-on practice."
};

export default async function Challenges() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="animate-fade-in-fast mb-2 text-center text-4xl font-bold text-blue-600 dark:text-blue-400">
        System Design Challenges
      </h1>
      <p className="animate-fade-in-fast animation-delay-100 mb-12 text-center text-xl text-gray-600 dark:text-gray-300">
        Master system design concepts through interactive challenges
      </p>
      <ChallengesList challenges={challenges} />
    </div>
  );
}
