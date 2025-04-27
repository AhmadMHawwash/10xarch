'use client';

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
  Layers,
  BookOpenCheck,
  PenTool
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'learn' | 'design'>('learn');

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Main Tab Navigation */}
      <div className="mb-14 flex justify-center">
        <div className="relative flex w-full max-w-md overflow-hidden rounded-xl shadow-lg">
          {/* Background gradient for tabs container */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          {/* Tab buttons container */}
          <div className="relative flex w-full z-10">
            <button
              onClick={() => setActiveTab('learn')}
              className={`hover:cursor-pointer flex-1 flex items-center justify-center gap-1 md:gap-2 py-3 px-3 md:px-5 text-sm md:text-base transition-all duration-200 ${
                activeTab === 'learn'
                  ? 'bg-white/15 backdrop-blur-sm text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpenCheck className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${activeTab === 'learn' ? 'text-white' : 'text-white/80'}`} />
              <span>Learn System Design</span>
            </button>
            
            <button
              onClick={() => setActiveTab('design')}
              className={`hover:cursor-pointer flex-1 flex items-center justify-center gap-1 md:gap-2 py-3 px-3 md:px-5 text-sm md:text-base transition-all duration-200 ${
                activeTab === 'design'
                  ? 'bg-white/15 backdrop-blur-sm text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${activeTab === 'design' ? 'text-white' : 'text-white/80'}`} />
              <span>Design Your System</span>
            </button>
          </div>
        </div>
      </div>

      <header className="mb-14 flex flex-col items-center justify-between gap-10 md:flex-row md:gap-0">
        <div className="text-center md:text-left md:w-1/2 md:pr-8">
          <div className="md:relative flex flex-col flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="md:absolute top-0 right-28 items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800/30">
              BETA
            </span>
            <h1 className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-4xl font-bold text-transparent leading-tight pb-2 sm:text-5xl md:text-6xl lg:text-7xl">
              System Design Playground
            </h1>
          </div>
          {activeTab === 'learn' ? (
            <>
              <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">
                Master system design concepts through interactive challenges and expert guidance.
              </p>
              <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                Learn by doing with guided challenges that help you understand real-world system design problems.
                Get AI feedback on your solutions and build your engineering skills.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 mb-4 text-xl text-gray-600 dark:text-gray-400">
                Your space to design, visualize, and document your system architecture.
              </p>
              <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                Design systems, get AI feedback, and use it as interactive
                documentation. Bring your ideas to life through our intuitive
                drag-and-drop interface.
              </p>
            </>
          )}

          <div className="mb-8 flex flex-wrap justify-center gap-4 md:justify-start">
            {activeTab === 'learn' ? (
              <>
                <Link
                  href="/challenges/url-shortener"
                  className="group inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  prefetch={false}
                >
                  <span className="mr-2">Try URL Shortener Challenge</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/challenges"
                  className="group inline-flex items-center overflow-hidden rounded-full bg-white/5 px-8 py-3 text-gray-700 ring-1 ring-gray-900/5 backdrop-blur-sm transition-all hover:bg-white/10 dark:text-gray-200 dark:ring-white/10"
                  prefetch={false}
                >
                  <span className="mr-2">Browse Challenges</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/playground"
                  className="group inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  prefetch={false}
                >
                  <span className="mr-2">Start Designing</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="relative inline-block">
                  <button
                    disabled
                    className="group inline-flex cursor-not-allowed items-center overflow-hidden rounded-full bg-white/5 px-8 py-3 text-gray-500 ring-1 ring-gray-900/5 opacity-70 backdrop-blur-sm dark:text-gray-400 dark:ring-white/10"
                  >
                    <span className="mr-2">Start with a Template</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="absolute -right-10 -top-3 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 shadow-sm dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400 md:justify-start">
            {activeTab === 'learn' ? (
              <>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Guided Challenges
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  AI Feedback
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Track Progress
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/50 md:w-1/2">
          {activeTab === 'design' ? (
            <HeroSystemDesigner mode="playground" />
          ) : (
            <HeroSystemDesigner mode="challenge" />
          )}
        </div>
      </header>

      <section className="mb-16 grid gap-8 md:grid-cols-2">
        {activeTab === 'learn' ? (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-lg transition-all hover:shadow-xl dark:from-gray-800 dark:to-blue-900">
              {/* Decorative elements */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50 blur-3xl dark:bg-blue-800"></div>
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-100 opacity-50 blur-3xl dark:bg-purple-800"></div>

              <div className="relative">
                <h2 className="mb-4 flex items-center text-3xl font-bold text-gray-900 dark:text-white">
                  <BookOpen className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                  Guided Challenges
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Learn system design through structured challenges with real-world scenarios.
                </p>
                <Link
                  href="/challenges"
                  className="group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  prefetch={false}
                >
                  <span className="mr-2">Browse Challenges</span>
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
                  <IterationCcw className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
                  AI Feedback
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Get expert-level feedback on your solutions and learn how to improve your designs.
                </p>
                <Link
                  href="/challenges/url-shortener"
                  className="group relative inline-flex items-center overflow-hidden rounded-full bg-white/10 px-8 py-3 text-gray-700 ring-1 ring-gray-900/5 transition-all hover:bg-white/20 dark:text-gray-200 dark:ring-white/10"
                  prefetch={false}
                >
                  <span className="mr-2">Try a Challenge</span>
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
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
                  prefetch={false}
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
                  Templates
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Start with pre-built templates for common architectures and customize to your needs.
                </p>
                <div className="inline-block">
                  <button
                    disabled
                    className="group inline-flex cursor-not-allowed items-center overflow-hidden rounded-full bg-white/10 px-8 py-3 text-gray-500 ring-1 ring-gray-900/5 opacity-70 dark:text-gray-400 dark:ring-white/10"
                  >
                    <span className="mr-2">Browse Templates</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Steps to Value Section */}
      <section className="mb-20 bg-gradient-to-br from-gray-50 to-white py-12 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent sm:text-3xl">
            {activeTab === 'learn' ? 'Master System Design' : 'Design Your Systems with Ease'}
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {activeTab === 'learn' ? (
              [
                {
                  step: 1,
                  title: "Choose a Challenge",
                  description:
                    "Select from our library of real-world system design challenges",
                  icon: BookOpen,
                },
                {
                  step: 2,
                  title: "Design Your Solution",
                  description:
                    "Use our visual tools to create your system architecture solution",
                  icon: Layers,
                },
                {
                  step: 3,
                  title: "Document Your Approach",
                  description:
                    "Explain your design decisions and architecture considerations",
                  icon: Code,
                },
                {
                  step: 4,
                  title: "Get Expert Feedback",
                  description:
                    "Receive detailed feedback on your solution from our AI",
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
              ))
            ) : (
              [
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "What is the System Design Playground?",
                  answer:
                    "The System Design Playground is a free, interactive environment where you can create, visualize, and document your system architecture designs. It provides a drag-and-drop interface, component library, and AI feedback to help you build better systems.",
                },
                {
                  question: "Is the playground completely free to use?",
                  answer:
                    "The basic playground functionality is available with limitations. Free users can access the design interface with rate-limited AI feedback (3 prompts per hour). For unlimited AI feedback and advanced features, users need to purchase AI credits through our Pro plan.",
                },
                {
                  question: "How do the system design challenges work?",
                  answer:
                    "Our system design challenges present you with real-world scenarios that test your architecture skills. Each challenge provides requirements, constraints, and context. You use our visual tools to create a solution, and our AI provides feedback on your approach.",
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
          <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-xl md:p-12">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
                {activeTab === 'learn' ? 'Start Learning System Design Today' : 'Start Designing Your Systems Today'}
              </h2>
              <p className="mb-8 text-base opacity-90 sm:text-lg">
                {activeTab === 'learn' 
                  ? 'Join thousands of engineers improving their system design skills'
                  : 'Join thousands of engineers creating beautiful and functional system designs'}
              </p>
              <Link href={activeTab === 'learn' ? '/challenges' : '/playground'} prefetch={false}>
                <button className="rounded-full bg-white px-8 py-3 font-medium text-blue-600 shadow-md transition-all hover:bg-gray-100 hover:shadow-lg">
                  {activeTab === 'learn' ? 'Browse Challenges' : 'Launch Playground'}
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