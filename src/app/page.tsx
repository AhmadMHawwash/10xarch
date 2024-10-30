import { ArrowRight, BookOpen, Code, IterationCcw, Layers } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-6xl">
          ArchPlayground
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Learn, practice, and master system design concepts interactively
        </p>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-2">
        <div className="rounded-lg bg-blue-100 p-8 dark:bg-blue-900 hover:bg-blue-200 transition-all">
          <h2 className="mb-4 text-3xl font-bold text-blue-800 dark:text-blue-200">
            <Code className="mr-2 inline-block" /> Challenges
          </h2>
          <p className="mb-6 text-lg text-blue-700 dark:text-blue-300">
            Progress through structured system design challenges, from beginner
            to advanced levels.
          </p>
          <Link
            href="/challenges"
            className="group inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Start Challenges <ArrowRight className="ml-2 group-hover:ml-4 transition-all" />
          </Link>
        </div>

        <div className="rounded-lg bg-blue-100 p-8 dark:bg-blue-900 hover:bg-blue-200 transition-all">
          <h2 className="mb-4 text-3xl font-bold text-blue-800 dark:text-blue-200">
            <Layers className="mr-2 inline-block" /> Playground
          </h2>
          <p className="mb-6 text-lg text-blue-700 dark:text-blue-300">
            Design systems freely, get AI feedback, and use it as interactive
            documentation.
          </p>
          <Link
            href="/playground"
            className="group inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Open Playground <ArrowRight className="ml-2 group-hover:ml-4 transition-all" />
          </Link>
        </div>
      </section>

      <section className="mb-16 grid gap-8 md:grid-cols-3">
        {[
          {
            icon: BookOpen,
            title: "Learn by Doing",
            description: "Practical approach to understanding complex systems",
          },
          {
            icon: IterationCcw,
            title: "Iterate to Learn",
            description: "Improve your design step by step with AI feedback",
          },
          {
            icon: Code,
            title: "Real-world Designs",
            description:
              "Build and experiment with industry-standard architectures",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="rounded-lg bg-gray-100 p-6 text-center dark:bg-gray-800"
          >
            <feature.icon className="mx-auto mb-4 h-12 w-12 text-gray-700 dark:text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Ready to dive in?
        </h2>
        <Link
          href="/challenges"
          className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
        >
          Get Started <ArrowRight className="ml-2" />
        </Link>
      </section>
    </div>
  );
}
