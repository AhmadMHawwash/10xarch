import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  ArrowRight,
  CreditCard,
  Shield,
  MessageSquareText,
  Brain,
  X,
  Zap,
  Lightbulb,
  Layers,
  Save,
  Share2,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing - 10×arch",
  description:
    "Access our 10×arch with flexible, affordable token-based pricing.",
};

// Add revalidation period - 24 hours (in seconds)
export const revalidate = 86400;

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section with Value Proposition */}
      <div className="mb-12 text-center">
        <div className="mb-2">
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-medium text-white">
            Design Better Systems
          </span>
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Unleash Your Design Potential
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          Get unlimited access to our 10×arch with flexible pricing
        </p>
      </div>

      {/* Plans */}
      <div className="mx-auto mb-16 grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Free Tier */}
        <Card className="relative flex min-h-[450px] flex-col overflow-hidden border-2">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              Free Tier
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                No Credit Card
              </span>
            </CardTitle>
            <CardDescription>
              Start designing systems with basic features
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                / limited access
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Basic access to the design playground</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  Rate-limited AI feedback (3 prompts per hour)
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Access to basic component library</span>
              </li>
              <li className="flex items-start text-gray-400 dark:text-gray-500">
                <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-2 shrink-0 mt-0.5" />
                <span>Advanced component library</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/playgrounds" className="w-full" prefetch={false}>
              <Button variant="outline" className="w-full">
                Start Designing
                <Layers className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Token-Based */}
        <Card className="relative z-10 flex min-h-[450px] scale-105 flex-col overflow-hidden border-2 border-purple-400 shadow-lg dark:border-purple-600">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="absolute -right-5 -top-5">
            <div className="origin-bottom-right rotate-45 transform bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-1 text-xs font-bold text-white shadow-lg">
              RECOMMENDED
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro Access</CardTitle>
            <CardDescription>
              Pay-as-you-go for advanced design capabilities
            </CardDescription>
            <div className="mt-4">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                Start with
              </span>
              <span className="text-3xl font-bold">$5</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                / 1000 AI credits
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Full playground access</span>
                  <span> with all available features</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Unlimited AI feedback</span>
                  <span> using your purchased credits</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Unlimited system design saves
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Export options</span>
                  <span> including PNG, PDF, and more</span>
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Advanced component library</span>
                  <span> with specialized templates</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Design sharing</span>
                  <span> with team collaboration features</span>
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </div>
              </li>
            </ul>
            <div className="mt-4 rounded-md border border-purple-100 bg-purple-50 p-3 dark:border-purple-800/30 dark:bg-purple-900/20">
              <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                <Zap className="mr-2 h-4 w-4 text-purple-500" />
                <span className="font-medium">Pay only for what you use</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/credits" className="w-full" prefetch={false}>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-md transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg">
                Get Pro Access
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mb-16 max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Compare Plans In Detail
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Features
                </th>
                <th className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Free
                </th>
                <th className="p-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Basic Playground Access
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  AI Design Feedback
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Limited (3/hour)
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  Unlimited (token-based)
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Design Saves
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  5 designs
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  Unlimited
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Export Options
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Advanced Component Library
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Team Collaboration
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                    Coming Soon
                  </span>
                </td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Access to Challenges
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Basic challenges
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  All challenges
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  AI Chat Quality
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Standard
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  Enhanced
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Playground Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-blue-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-blue-900/30">
              <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Visual Designer</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag-and-drop interface for creating system architectures with ease
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-purple-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-purple-900/30">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">AI Feedback</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get intelligent suggestions and improvements for your system designs
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-green-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-green-900/30">
              <Save className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Save & Export</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Store your designs and export them in various formats
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                Coming Soon
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-amber-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-amber-900/30">
              <Share2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Share & Collaborate</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Invite teammates to view or edit your system designs
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                Coming Soon
              </span>
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-red-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-red-900/30">
              <MessageSquareText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Component Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add notes, context, and documentation to each component
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-indigo-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-indigo-900/30">
              <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Design Templates</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start with pre-built templates for common system architectures
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto mb-16 max-w-4xl py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              question: "What is the 10×arch?",
              answer:
                "The 10×arch is an interactive environment where you can create, visualize, and document your system architecture designs. It provides a drag-and-drop interface and AI feedback to help you build better systems.",
            },
            {
              question: "Can I use the playground for free?",
              answer:
                "You can access basic playground functionality with limitations. Free users get 3 AI prompts per hour but advanced features and unlimited AI feedback require purchasing credits through our Pro plan."
            },
            {
              question: "What do AI credits get used for?",
              answer:
                "AI credits are consumed when you request feedback on your designs, use AI-powered features, or access premium functionality. Each interaction costs a certain number of credits based on complexity and processing required."
            },
            {
              question: "What do tokens get used for in the Pro plan?",
              answer:
                "Tokens are primarily used for AI feedback on your designs, exporting in premium formats, and accessing advanced features. The token system allows you to pay only for what you actually use.",
            },
            {
              question: "Can I share my designs with others?",
              answer:
                "This feature is coming soon! Free users will be able to view their own designs, while Pro users will be able to share designs with teammates and collaborate on them in real-time.",
            },
            {
              question: "Do tokens expire?",
              answer:
                "No, your tokens never expire. You can purchase them once and use them whenever you need them.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-16">
        <div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 text-white shadow-xl">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Start Designing Your Systems Today
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of engineers creating beautiful and functional system designs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/playgrounds" prefetch={false}>
                <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                  Try For Free
                  <Layers className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/credits" prefetch={false}>
                <Button className="w-full sm:w-auto bg-purple-500 text-white hover:bg-purple-600 border border-white/20">
                  Get Pro Access
                  <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
