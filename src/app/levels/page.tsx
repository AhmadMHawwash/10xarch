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

export default async function Levels() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-center text-4xl font-bold text-blue-400 mb-2 animate-fade-in-fast">System Design Levels</h1>
      <p className="text-center text-xl text-gray-300 mb-12 animate-fade-in-fast animation-delay-100">Master system design concepts through interactive challenges</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge, index) => (
          <Link
            key={challenge.title}
            href={`/levels/${challenge.slug}`}
            className={`animate-fade-in-fast animation-delay-${(index + 1) * 50}`}
          >
            <Card className="h-full border border-gray-700 bg-gray-800 transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-md hover:shadow-blue-400/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-300 mb-2">{challenge.title}</CardTitle>
                <CardDescription className="text-gray-400 text-base">{challenge.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <Badge
                  variant="outline"
                  className="bg-blue-900 text-blue-200 border-blue-700 px-3 py-1 text-sm font-medium"
                >
                  {challenge.difficulty}
                </Badge>
                <ArrowRight className="text-blue-400 w-5 h-5 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
