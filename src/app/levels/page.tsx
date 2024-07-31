import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import challenges from "@/content/challenges";
import Link from "next/link";

export default async function Levels() {
  return (
    <div className="container mx-auto">
      <h1 className="text-center text-4xl font-bold">Levels</h1>
      <p className="text-center">Choose a level to start your journey</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {challenges.map((challenge) => (
          <Link
            key={challenge.title}
            href={`/levels/${challenge.slug}`}
            className="col-span-1"
          >
            <Card className="w-[350px] border border-gray-300">
              <CardHeader>
                <CardTitle>{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Muted className="p-1 px-2 bg-slate-100 rounded-md">{challenge.diffcutly}</Muted>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
