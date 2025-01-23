"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Challenge } from "@/content/challenges/types";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ChallengesListProps {
  challenges: Challenge[];
}

export function ChallengesList({ challenges }: ChallengesListProps) {
  const [accessFilter, setAccessFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesAccess =
      accessFilter === "all" ? true :
        accessFilter === "free" ? challenge.isFree :
          !challenge.isFree;

    const matchesDifficulty =
      difficultyFilter === "all" ? true :
        challenge.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    return matchesAccess && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-8">
        <nav className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setAccessFilter("all")}
            className={`border-b-2 pb-2 transition-colors ${
              accessFilter === "all"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setAccessFilter("free")}
            className={`border-b-2 pb-2 transition-colors ${
              accessFilter === "free"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setAccessFilter("paid")}
            className={`border-b-2 pb-2 transition-colors ${
              accessFilter === "paid"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
          </button>
        </nav>

        <div className="h-6 w-px bg-border" aria-hidden="true" />

        <nav className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setDifficultyFilter("all")}
            className={`border-b-2 pb-2 transition-colors ${
              difficultyFilter === "all"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDifficultyFilter("easy")}
            className={`border-b-2 pb-2 transition-colors ${
              difficultyFilter === "easy"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setDifficultyFilter("medium")}
            className={`border-b-2 pb-2 transition-colors ${
              difficultyFilter === "medium"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setDifficultyFilter("hard")}
            className={`border-b-2 pb-2 transition-colors ${
              difficultyFilter === "hard"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Hard
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge, index) => (
            <Link
              key={challenge.title}
              href={`/challenges/${challenge.slug}`}
              className={`animate-fade-in-fast animation-delay-${(index + 1) * 50}`}
            >
              <Card className="group flex h-full flex-col justify-between border border-gray-200 bg-white transition-all duration-200 ease-in-out hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {challenge.title}
                    </CardTitle>
                    {!challenge.isFree && (
                      <div>
                        <Sparkles className="h-5 w-5 text-amber-500 mb-5" />
                      </div>
                    )}
                  </div>
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
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12 text-center">
            {accessFilter !== "free" && <Sparkles className="h-12 w-12 text-amber-500/50" />}
            <p className="text-lg text-muted-foreground">
              {accessFilter === "paid" 
                ? "No paid challenges are available at the moment" 
                : accessFilter === "free" 
                  ? "No free challenges match the selected difficulty" 
                  : "No challenges match the selected filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
