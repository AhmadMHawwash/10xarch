import { Footer } from "@/components/Footer";
import HeroSystemDesigner from "@/components/HeroSystemDesigner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Code,
  CreditCard,
  IterationCcw,
  Layers
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-14 flex flex-col items-center justify-between md:flex-row">
        <div className="text-left md:w-1/2 md:pr-8">
          <h1 className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
            System Design Playground
          </h1>
          <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
            Your space to design, visualize, and document your system
            architecture.
          </p>
          <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
            Design systems, get AI feedback, and use it as interactive
            documentation. Bring your ideas to life through our intuitive
            drag-and-drop interface.
          </p>

          <div className="mb-8 flex flex-wrap gap-4">
            <Link
              href="/playground"
              className="group inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Start Designing</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/challenges/url-shortener"
              className="group inline-flex items-center overflow-hidden rounded-full bg-white/5 px-8 py-3 text-gray-700 ring-1 ring-gray-900/5 backdrop-blur-sm transition-all hover:bg-white/10 dark:text-gray-200 dark:ring-white/10"
            >
              <span className="mr-2">Try a challenge</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="group inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-3 text-white ring-1 ring-purple-500/10 transition-all hover:from-purple-600 hover:to-purple-700 hover:shadow-md hover:shadow-purple-500/20 dark:ring-purple-400/20"
            >
              <span className="mr-2">See Pricing</span>
              <CreditCard className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Playground
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              AI-Powered Feedback
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Save & Share Designs
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-8 h-[500px] w-full overflow-hidden rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 md:mt-0 md:w-1/2">
          <HeroSystemDesigner />
        </div>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-2">
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
              Design systems freely, get AI feedback, and document your
              architecture in one place.
            </p>
            <Link
              href="/playground"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Start Designing</span>
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
              <Code className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
              Challenges
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Test your skills with guided system design challenges for practice
              and learning.
            </p>
            <Link
              href="/challenges"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-white/10 px-8 py-3 text-gray-700 ring-1 ring-gray-900/5 transition-all hover:bg-white/20 dark:text-gray-200 dark:ring-white/10"
            >
              <span className="mr-2">View Challenges</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps to Value Section */}
      <section className="mb-20 bg-gradient-to-br from-gray-50 to-white py-12 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-3xl font-bold text-transparent">
            Design Your Systems with Ease
          </h2>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: "Create a New Design",
                description:
                  "Start with a blank canvas and add your first system components",
                icon: Layers,
              },
              {
                step: 2,
                title: "Drag & Connect Components",
                description:
                  "Build your architecture by adding and connecting components visually",
                icon: Code,
              },
              {
                step: 3,
                title: "Add Context & Documentation",
                description:
                  "Document your design decisions and add context to each component",
                icon: BookOpen,
              },
              {
                step: 4,
                title: "Get AI Feedback",
                description:
                  "Receive insights and suggestions on your system design from our AI",
                icon: IterationCcw,
                isGolden: true,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div
                  className={`h-full rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 ${
                    item.isGolden
                      ? "border-2 border-amber-400/50 dark:border-amber-500/50"
                      : ""
                  }`}
                >
                  <div
                    className={`absolute -top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                      item.isGolden
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600"
                        : "bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="mb-4 mt-2">
                    <item.icon
                      className={`h-8 w-8 ${
                        item.isGolden
                          ? "text-amber-500 dark:text-amber-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="absolute -right-8 top-1/2 hidden h-0.5 w-8 bg-gradient-to-r from-blue-600 to-purple-600 md:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-3xl font-bold text-transparent">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "What is the 10×arch?",
                  answer:
                    "The 10×arch is a free, interactive environment where you can create, visualize, and document your system architecture designs. It provides a drag-and-drop interface, component library, and AI feedback to help you build better systems.",
                },
                {
                  question: "Is the playground completely free to use?",
                  answer:
                    "The basic playground functionality is available with limitations. Free users can access the design interface with rate-limited AI feedback (3 prompts per hour). For unlimited AI feedback and advanced features, users need to purchase AI credits through our Pro plan.",
                },
                {
                  question: "Can I save and share my designs?",
                  answer:
                    "This feature is coming soon! Soon you'll be able to save your designs to your account and share them with others. This will make the playground great for documentation, collaboration, or showing off your system design skills.",
                },
                {
                  question: "How does the AI feedback work?",
                  answer:
                    "Our AI analyzes your system design and provides feedback on architectural decisions, potential bottlenecks, scalability concerns, and suggestions for improvement. Free users get limited AI feedback, while Pro users have unlimited access.",
                },
                {
                  question: "What system components are available?",
                  answer:
                    "We provide a comprehensive library of system components including databases, servers, load balancers, caches, message queues, and more. You can also create custom components to represent specific technologies in your stack.",
                },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-20 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl md:p-12">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Start Designing Your Systems Today
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Join thousands of engineers creating beautiful and functional
                system designs
              </p>
              <Link href="/playground">
                <button className="rounded-full bg-white px-8 py-3 font-medium text-blue-600 shadow-md transition-all hover:bg-gray-100 hover:shadow-lg">
                  Launch Playground
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
