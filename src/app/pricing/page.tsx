import { type Metadata } from "next";
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
  CreditCard,
  Zap,
  Lightbulb,
  Layers,
  Save,
  Share2,
  Brain,
  MessageSquareText,
  Users,
  User,
} from "lucide-react";
import Link from "next/link";
import { SubscriptionPricingTable } from "@/components/pricing/SubscriptionPricingTable";

export const metadata = {
  title: "Pricing - 10×arch",
  description:
    "Flexible pricing for teams and individuals. Choose between subscription plans or pay-as-you-go tokens.",
};

// Add revalidation period - 24 hours (in seconds)
export const revalidate = 86400;

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="mb-4">
          <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white">
            Flexible Pricing for Every Team
          </span>
        </div>
        <h1 className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Choose Your Perfect Plan
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          Whether you&apos;re an individual designer or managing a team, we have pricing that scales with your needs. 
          Get predictable monthly tokens with subscriptions, or pay as you go with token purchases.
        </p>
        <div className="mx-auto flex max-w-2xl flex-col gap-4 md:flex-row">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="flex items-center justify-center text-blue-700 dark:text-blue-300">
              <User className="mr-2 h-5 w-5" />
              <span className="font-medium">Personal Accounts</span>
            </div>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              Perfect for individual designers and freelancers
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <div className="flex items-center justify-center text-purple-700 dark:text-purple-300">
              <Users className="mr-2 h-5 w-5" />
              <span className="font-medium">Organization Accounts</span>
            </div>
            <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
              Ideal for teams and companies building at scale
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="mx-auto mb-20 max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Monthly Subscription Plans</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get predictable monthly tokens with our subscription plans. Perfect for teams with consistent usage.
          </p>
        </div>
        <SubscriptionPricingTable />
      </div>

      {/* Token Purchases Section */}
      <div className="mx-auto mb-20 max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Pay-As-You-Go Tokens</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Prefer flexibility? Purchase tokens as needed with bonus rewards for larger purchases.
          </p>
        </div>
        
        <Card className="relative overflow-hidden border-2 border-gradient-to-r from-blue-500 to-purple-500">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Token Purchases</CardTitle>
            <CardDescription>
              Non-expiring tokens that you can use anytime. Perfect for occasional users or teams who want to supplement their subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pricing Tiers</h3>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <span>$5 - $9</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Base Rate</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>$10 - $19</span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">+5% Bonus</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>$20 - $49</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">+10% Bonus</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>$50 - $99</span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900 dark:text-purple-200">+15% Bonus</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>$100+</span>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">+20% Bonus</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Key Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span>200 tokens per dollar</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span>Tokens never expire</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span>Works for personal & organization accounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span>Automatic bonus calculation</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
              <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                <Zap className="mr-2 h-4 w-4 text-blue-500" />
                <span className="font-medium">Perfect for supplementing subscriptions or occasional usage</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/credits" className="w-full" prefetch={false}>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-md transition-all hover:from-blue-600 hover:to-purple-600 hover:shadow-lg">
                Purchase Tokens
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="mx-auto mb-16 max-w-6xl">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Compare Your Options
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Features
                </th>
                <th className="p-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                  Token Purchases
                </th>
                <th className="p-4 text-center font-semibold text-purple-600 dark:text-purple-400">
                  Team Start
                </th>
                <th className="p-4 text-center font-semibold text-purple-600 dark:text-purple-400">
                  Team Pro
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Monthly Token Allocation
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  As purchased
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  15,000 tokens
                </td>
                <td className="p-4 text-center font-semibold text-gray-600 dark:text-gray-400">
                  25,000 tokens
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Token Expiration
                </td>
                <td className="p-4 text-center font-semibold text-green-600">
                  Never
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  30 days from start
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  30 days from start
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Best For
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Occasional users
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Small teams
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Growing teams
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Cost per 1000 tokens
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  $5.00 (+ bonuses)
                </td>
                <td className="p-4 text-center font-semibold text-green-600">
                  $2.33
                </td>
                <td className="p-4 text-center font-semibold text-green-600">
                  $2.00
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  Account Types
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          What You Get With Every Plan
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
            <h3 className="mb-2 text-xl font-bold">Team Collaboration</h3>
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
            <h3 className="mb-2 text-xl font-bold">Advanced Components</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access to specialized templates and advanced component library
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 rounded-full bg-indigo-100 p-2 w-12 h-12 flex items-center justify-center dark:bg-indigo-900/30">
              <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Priority Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get faster response times and priority assistance when you need help
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
              question: "What&apos;s the difference between subscriptions and token purchases?",
              answer:
                "Subscriptions provide predictable monthly token allocations that expire after 30 days, perfect for consistent usage. Token purchases never expire and are ideal for occasional users or supplementing subscriptions."
            },
            {
              question: "Can I use both subscriptions and token purchases?",
              answer:
                "Absolutely! Many teams use subscriptions for their base usage and purchase additional tokens for peak periods or special projects."
            },
            {
              question: "How do organization accounts work?",
              answer:
                "Organization accounts allow teams to share tokens and manage billing centrally. Only organization administrators can purchase subscriptions or tokens for the organization."
            },
            {
              question: "What happens to my tokens when I cancel a subscription?",
              answer:
                "Your subscription tokens remain available until the end of your current billing period. Any purchased tokens (non-expiring) remain in your account indefinitely."
            },
            {
              question: "Can I upgrade or downgrade my subscription plan?",
              answer:
                "Yes! You can change your subscription plan anytime through the customer portal. Changes take effect at your next billing cycle."
            },
            {
              question: "What do tokens get used for?",
              answer:
                "Tokens are primarily used for AI feedback on your designs, accessing advanced features, and premium functionality. The more complex the AI processing, the more tokens it consumes."
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
              Ready to Start Building?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Choose the pricing that works for your team and start designing better systems today
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/credits" prefetch={false}>
                <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                  View All Options
                  <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/playgrounds" prefetch={false}>
                <Button className="w-full sm:w-auto bg-purple-500 text-white hover:bg-purple-600 border border-white/20">
                  Try the Playground
                  <Layers className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
