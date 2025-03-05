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
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing - Archround | System Design Learning Platform",
  description:
    "Learn system design with our flexible, affordable token-based pricing system.",
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section with Value Proposition */}
      <div className="mb-12 text-center">
        <div className="mb-2">
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-medium text-white">
            Learn System Design Effectively
          </span>
        </div>
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Invest In Your Engineering Career
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          Master system design with our affordable token-based system
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
              Perfect for beginners exploring system design
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                / forever
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>Few challenges access</span>
              </li>
              {/* <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Playground with limited features</span>
              </li> */}
              {/* <li className="flex items-start text-gray-400 dark:text-gray-500">
                <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-2 shrink-0 mt-0.5" />
                <span>Advanced AI feedback</span>
              </li> */}
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  3 prompts per hour to chat with our Context-aware AI to
                  discuss your system design
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>5 free submissions per day</span>
              </li>
              {/* <li className="flex items-start text-gray-400 dark:text-gray-500">
                <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-2 shrink-0 mt-0.5" />
                <span>System design templates</span>
              </li> */}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full">
                Start For Free
                <ArrowRight className="ml-2 h-4 w-4" />
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
              Fast-track your system design expertise
            </CardDescription>
            <div className="mt-4">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                Start with
              </span>
              <span className="text-3xl font-bold">$5</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                / 1000 tokens
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Full access</span>
                  <span> to all system design challenges</span>
                </div>
              </li>
              {/* <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">In-depth AI feedback</span>
                  <span> on your designs</span>
                </div>
              </li> */}
              {/* <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Full playground capabilities with templates</span>
              </li> */}
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Full access</span>
                  <span> to our Context-aware AI chat</span>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <span className="font-medium">Tokens never expire</span>
                  <span> - buy once, use anytime</span>
                </div>
              </li>
              {/* <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span>Priority access to new challenges</span>
              </li> */}
            </ul>
            <div className="mt-4 rounded-md border border-purple-100 bg-purple-50 p-3 dark:border-purple-800/30 dark:bg-purple-900/20">
              <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                <Zap className="mr-2 h-4 w-4 text-purple-500" />
                <span className="font-medium">Pay only for what you use</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Link href="/credits" className="w-full">
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
                  Available Challenges
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Limited access
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  All Challenges
                </td>
              </tr>
              {/* <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">AI Feedback Quality</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">Basic</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400 font-semibold">Advanced</td>
              </tr> */}
              {/* <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">System Design Templates</td>
                <td className="p-4 text-center">
                  <X className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr> */}
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Daily Submissions
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  5/day
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  Unlimited (token-based)
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Context-Aware AI Chat
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Limited to 3 prompts per hour
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Early Access to New Features
                </td>
                <td className="p-4 text-center">
                  <X className="mx-auto h-5 w-5 text-gray-400 dark:text-gray-500" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mx-auto mb-16 max-w-4xl rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="text-center md:w-1/3">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
              <CreditCard className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Flexible Pricing
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pay only for the tokens you use
            </p>
          </div>
          <div className="text-center md:w-1/3">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-white">
              <Brain className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI-Powered
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get detailed feedback on your designs
            </p>
          </div>
          <div className="text-center md:w-1/3">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-600 text-white">
              <Lightbulb className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learn Effectively
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Practice with real-world system design challenges
            </p>
          </div>
        </div>
      </div>

      {/* How Pricing Works */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">
          How Our Token System Works
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-4 flex items-center text-xl font-semibold">
              <Brain className="mr-2 h-5 w-5 text-blue-500" />
              Simple Pay-As-You-Go
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Our platform uses tokens to process your designs through our AI
              system. Token consumption depends on:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>Challenge complexity</strong> - more advanced
                  challenges use more tokens
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>Solution size</strong> - comprehensive solutions need
                  more processing
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>AI feedback detail</strong> - more in-depth feedback
                  uses more tokens
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-4 flex items-center text-xl font-semibold">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Designed With Engineers In Mind
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Our token system is built for software engineers who value
              flexibility and efficiency:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>No subscriptions</strong> - avoid recurring charges
                  you might forget
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>Tokens never expire</strong> - learn at your own pace
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <span>
                  <strong>Volume discounts</strong> - save more when you buy in
                  bulk
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Token Usage Explanation */}
      <div className="mx-auto mb-16 max-w-4xl">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Understanding Token Usage
        </h2>
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800/50">
          <div className="mb-6 flex items-start space-x-4">
            <MessageSquareText className="mt-1 h-8 w-8 shrink-0 text-blue-500" />
            <div>
              <h3 className="mb-2 text-xl font-semibold">What Are Tokens?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tokens are the basic units of text processed by our AI system.
                Each word typically consists of 1-3 tokens, depending on its
                length. When you submit a system design challenge for review, we
                process both your solution and the challenge complexity to
                provide personalized feedback.
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold">
                Factors Affecting Token Usage:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Solution Length:</strong> Longer, more detailed
                    solutions require more tokens to process
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Challenge Type:</strong> Different challenges have
                    varying complexity levels
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Feedback Detail:</strong> More comprehensive
                    feedback requires additional processing
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-semibold">Approximate Token Usage:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Small challenge:</strong> ~5-15 tokens (~$0.03)
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Medium challenge:</strong> ~15-30 tokens (~$0.08)
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span>
                    <strong>Complex challenge:</strong> ~30-50+ tokens
                    (~$0.15-0.25)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            The token system is designed to be fair and transparent. You&apos;ll
            always see how many tokens remain in your account, and you&apos;ll
            only be charged for the tokens you actually use when processing your
            challenges.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mb-16 max-w-3xl">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-800/50">
            <h3 className="mb-2 text-lg font-semibold">Do tokens expire?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No, tokens never expire. Once purchased, they remain in your
              account until used. Learn at your own pace without the pressure of
              time limits.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-800/50">
            <h3 className="mb-2 text-lg font-semibold">
              Can I try before buying tokens?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Absolutely! Our free tier includes 3 challenges and limited daily
              submissions, letting you experience the platform before
              purchasing.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-800/50">
            <h3 className="mb-2 text-lg font-semibold">
              Are there volume discounts?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! The more tokens you purchase, the better the value. Check our{" "}
              <Link
                href="/credits"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Tokens page
              </Link>{" "}
              for bulk pricing options.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-800/50">
            <h3 className="mb-2 text-lg font-semibold">
              How do I purchase tokens?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Simply navigate to the{" "}
              <Link
                href="/credits"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Tokens page
              </Link>
              , select the package you want, and complete the secure checkout
              process. Tokens are instantly added to your account for immediate
              use.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mb-8 mt-16 max-w-4xl rounded-2xl border border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 p-10 text-center shadow-sm dark:border-gray-800 dark:from-blue-900/30 dark:to-purple-900/30">
        <h2 className="mb-4 text-3xl font-bold">
          Ready to level up your system design skills?
        </h2>
        <p className="mx-auto mb-6 max-w-2xl text-gray-600 dark:text-gray-400">
          Improve your system design skills with Archround&apos;s interactive
          learning platform. Start for free or go Pro today!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/credits">
            <Button className="h-auto bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-lg shadow-md transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20">
              Get 1000 Tokens for $5
              <CreditCard className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/challenges">
            <Button variant="outline" className="h-auto px-8 py-6 text-lg">
              Explore Challenges First
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          🔒 Secure payment processing
        </p>
      </div>
    </div>
  );
}
