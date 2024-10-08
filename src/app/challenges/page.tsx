import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import challenges from "@/content/challenges";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Challenges() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="animate-fade-in-fast mb-2 text-center text-4xl font-bold text-blue-600 dark:text-blue-400">
        System Design Challenges
      </h1>
      <p className="animate-fade-in-fast animation-delay-100 mb-12 text-center text-xl text-gray-600 dark:text-gray-300">
        Master system design concepts through interactive challenges
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge, index) => (
          <Link
            key={challenge.title}
            href={`/challenges/${challenge.slug}`}
            className={`animate-fade-in-fast animation-delay-${(index + 1) * 50}`}
          >
            <Card className="group flex h-full flex-col justify-between border border-gray-200 bg-white transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
              <CardHeader>
                <CardTitle className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {challenge.title}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  {challenge.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200"
                >
                  {challenge.difficulty}
                </Badge>
                <ArrowRight className="h-5 w-5 text-blue-600 transition-transform duration-200 ease-in-out group-hover:translate-x-2 dark:text-blue-400" />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
