import Link from "next/link";
import { ArrowRight, Code, Users, BookOpen, IterationCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-6xl">
          System Design Playground
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Learn, practice, and master system design concepts interactively
        </p>
        <Link
          href="/levels"
          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
        >
          Get Started <ArrowRight className="ml-2" />
        </Link>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-3">
        {[
          {
            icon: Code,
            title: "Interactive Challenges",
            description: "Build and experiment with real-world system designs",
          },
          // { icon: Users, title: "Community Driven", description: "Share your designs and learn from others" },
          {
            icon: BookOpen,
            title: "Learn by Doing",
            description: "Practical approach to understanding complex systems",
          },
          {
            icon: IterationCcw,
            title: "Iterate to Learn",
            description: "Improve your design step by step",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="rounded-lg bg-gray-100 p-6 text-center dark:bg-gray-800"
          >
            <feature.icon className="mx-auto mb-4 h-12 w-12 text-blue-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {feature.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-16 rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          How It Works
        </h2>
        <ol className="list-inside list-decimal space-y-4 text-gray-700 dark:text-gray-300">
          <li>Choose a project or start from scratch</li>
          <li>Design your system using our interactive tools</li>
          <li>Get real-time feedback and suggestions</li>
          <li>Share your design with the community</li>
          <li>Learn from expert reviews and peer feedback</li>
        </ol>
      </section>

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Ready to dive in?
        </h2>
        <Link
          href="/levels"
          className="inline-flex items-center rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
        >
          Explore Levels <ArrowRight className="ml-2" />
        </Link>
      </section>
    </div>
  );
}
