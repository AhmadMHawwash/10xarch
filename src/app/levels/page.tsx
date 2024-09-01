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

export default async function Levels() {
  return (
    <div className="container mx-auto bg-gray-900 text-gray-100 min-h-screen py-8">
      <h1 className="text-center text-4xl font-bold text-blue-400">Levels</h1>
      <p className="text-center text-gray-300 mt-2">Choose a level to start your journey</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {challenges.map((challenge) => (
          <Link
            key={challenge.title}
            href={`/levels/${challenge.slug}`}
            className="col-span-1"
          >
            <Card className="w-full border border-gray-700 bg-gray-800 transition-all hover:bg-gray-750">
              <CardHeader>
                <CardTitle className="text-blue-300">{challenge.title}</CardTitle>
                <CardDescription className="text-gray-400">{challenge.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Badge
                  variant="outline"
                  className="bg-gray-700 text-gray-300 border-gray-600"
                >
                  {challenge.difficulty}
                </Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
