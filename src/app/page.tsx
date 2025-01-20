import {
  ArrowRight,
  BookOpen,
  Code,
  CreditCard,
  IterationCcw,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-14 text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
          Archround
        </h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Learn, practice, and master system design concepts step by step.
        </p>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg transition-all hover:shadow-xl dark:from-gray-800 dark:to-blue-900">
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl dark:bg-blue-800"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-100 opacity-50 blur-3xl dark:bg-purple-800"></div>

          <div className="relative">
            <h2 className="mb-4 flex items-center text-3xl font-bold text-gray-900 dark:text-white">
              <Code className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
              Challenges
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Progress through structured system design challenges, from
              beginner to advanced levels.
            </p>
            <Link
              href="/challenges"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Start Challenges</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg transition-all hover:shadow-xl dark:from-gray-800 dark:to-blue-900">
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl dark:bg-blue-800"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-100 opacity-50 blur-3xl dark:bg-purple-800"></div>

          <div className="relative">
            <h2 className="mb-4 flex items-center text-3xl font-bold text-gray-900 dark:text-white">
              <Layers className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
              Playground
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Design systems freely, get AI feedback, and use it as interactive
              documentation.
            </p>
            <Link
              href="/playground"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Open Playground</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
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
            icon: CreditCard,
            title: "Pay As You Go",
            description:
              "No monthly fees or subscriptions. Only pay for what you use.",
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

      <section className="mb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
            No subscriptions, no commitments. Pay only for what you use.
          </p>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg dark:from-gray-800 dark:to-blue-900">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl dark:bg-blue-800"></div>
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-100 opacity-50 blur-3xl dark:bg-purple-800"></div>

            <div className="relative">
              <h3 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Pay As You Go
              </h3>

              <div className="mb-8 grid gap-6 text-left md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        No Monthly Fees
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Zero subscriptions or recurring charges
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-purple-100 p-1 dark:bg-purple-900">
                      <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Flexible Pricing
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start with just $5 worth of credits
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-indigo-100 p-1 dark:bg-indigo-900">
                      <IterationCcw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Credits Never Expire
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use your credits anytime you want
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                      <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Pay Per Use
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Only pay for the tokens you consume
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link
                  href="/credits"
                  className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                >
                  <span className="mr-2">Get Started</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-16 border-t border-gray-200 py-8 text-center dark:border-gray-700">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          {new Date().getFullYear()} Archround. All rights reserved.
        </p>
        {/* <div className="flex items-center justify-center space-x-4">
          <Link
            href="/about"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Privacy
          </Link>
        </div> */}
      </footer>
    </div>
  );
}
