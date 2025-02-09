import { Footer } from "@/components/Footer";
import HeroSystemDesigner from "@/components/HeroSystemDesigner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Code,
  CreditCard,
  IterationCcw,
  Layers,
  MessageSquareHeartIcon
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-14 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 text-left md:pr-8">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Master System Design
          </h1>
          <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
            Learn, practice, and master system design concepts step by step.
          </p>
          <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
            Join thousands of engineers who&apos;ve improved their system design skills through our interactive platform. From basic architectures to complex distributed systems.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              href="/challenges"
              className="group inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Start Learning</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/challenges/url-shortener"
              className="group inline-flex items-center overflow-hidden rounded-full bg-white/5 px-8 py-3 text-gray-700 ring-1 ring-gray-900/5 transition-all hover:bg-white/10 dark:text-gray-200 dark:ring-white/10 backdrop-blur-sm"
            >
              <span className="mr-2">Try for free</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Interactive Learning
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              AI-Powered Feedback
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Real-world Cases
            </div>
          </div>
        </div>

        <div className="md:w-1/2 relative mt-8 md:mt-0 h-[500px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
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
              <span className="ml-3 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                Coming Soon
              </span>
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Design systems freely, get AI feedback, and use it as interactive
              documentation. Still under active development - core features coming soon.
            </p>
            <Link
              href="/playground"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600/70 to-purple-600/70 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              <span className="mr-2">Preview Playground</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps to Value Section */}
      <section className="mb-20 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Journey to System Design Mastery
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Choose a Challenge",
                description: "Select from our collection of real-world system design challenges that match your learning goals",
                icon: Layers
              },
              {
                step: 2,
                title: "Learn & Solve Iteratively",
                description: "Read through the current stage, understand the requirements, and design your solution",
                icon: Code
              },
              {
                step: 3,
                title: "Get AI Feedback",
                description: "Receive detailed feedback on your design decisions and suggestions for improvement",
                icon: IterationCcw
              },
              {
                step: 4,
                title: "Level Up Your Skills",
                description: "Master system design concepts through hands-on practice and expert guidance",
                icon: BookOpen,
                isGolden: true
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg h-full ${
                  item.isGolden ? 'border-2 border-amber-400/50 dark:border-amber-500/50' : ''
                }`}>
                  <div className={`absolute -top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    item.isGolden 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  }`}>
                    {item.step}
                  </div>
                  <div className="mb-4 mt-2">
                    <item.icon className={`h-8 w-8 ${
                      item.isGolden 
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Everything You Need to Excel
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Interactive Learning",
                description: "Draw diagrams, write code, and design systems in an iterative approach",
                icon: Code
              },
              {
                title: "Real-world Scenarios",
                description: "Practice with challenges inspired by actual system design interviews",
                icon: Layers
              },
              {
                title: "AI-Powered Feedback",
                description: "Get instant feedback on your design decisions and improvements",
                icon: IterationCcw
              },
              {
                title: "Comprehensive Topics",
                description: "Cover everything from basic architectures to distributed systems",
                icon: BookOpen
              },
              {
                title: "Progress Tracking",
                description: "Monitor your learning journey with detailed progress analytics",
                icon: CheckCircle
              },
              {
                title: "Resource Library",
                description: "Access a curated collection of system design patterns and best practices",
                icon: BookOpen
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Use Cases Section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Who Is This For?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Software Engineers",
                description: "Level up your system design skills for technical interviews and real-world projects",
                scenarios: [
                  "Preparing for tech interviews",
                  "Understanding large-scale systems",
                  "Learning best practices"
                ]
              },
              {
                title: "Tech Leads",
                description: "Master architectural decisions and trade-offs for leading team projects",
                scenarios: [
                  "Making architectural decisions",
                  "Evaluating tech solutions",
                  "Leading system design"
                ]
              },
              {
                title: "Engineering Students",
                description: "Build a strong foundation in distributed systems and modern architecture",
                scenarios: [
                  "Learning system fundamentals",
                  "Practical experience",
                  "Portfolio building"
                ]
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {useCase.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.scenarios.map((scenario, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {scenario}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "What makes this platform different?",
                  answer: "We take a unique approach to learning system design. Instead of overwhelming you with information, we guide you through one problem per challenge at a time, with clear stages and AI feedback at every step. You'll learn by doing, with all the resources you need right when you need them."
                },
                {
                  question: "Do I need prior experience?",
                  answer: "While basic programming knowledge is helpful, our platform caters to various skill levels. We provide fundamentals for beginners and advanced scenarios for experienced engineers."
                },
                {
                  question: "How does the AI feedback work?",
                  answer: "Our AI analyzes your design decisions, comparing them against best practices and common patterns. It provides specific suggestions for improvements and explains the reasoning behind them."
                },
                {
                  question: "Can I use this for interview prep?",
                  answer: "Absolutely! Our challenges are inspired by real system design interviews, and the interactive format helps you practice explaining your design decisions - a crucial interview skill."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`} className="bg-white dark:bg-gray-800 px-6 rounded-lg mb-4 shadow-lg">
                  <AccordionTrigger className="text-xl font-semibold text-gray-900 dark:text-white hover:no-underline">
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
                  href="/challenges/url-shortener"
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

      {/* Contact Section */}
      <section className="mb-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Share Your Feedback
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center">
              <Link
                href="https://archround.userjot.com"
                className="group inline-flex items-center gap-2 overflow-hidden rounded-full bg-blue-500 px-8 py-3 text-white shadow-md ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <MessageSquareHeartIcon className="h-5 w-5 transition-transform group-hover:scale-105" />
                <span>Give Feedback</span>
              </Link>
            </div>
            
            <p className="text-center mt-8 text-gray-600 dark:text-gray-400">
              Your feedback helps us improve and create a better learning experience for everyone.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
