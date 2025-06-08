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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle,
  CreditCard,
  Zap,
  Layers,
  Save,
  Share2,
  Brain,
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

      {/* Pricing Options Tabs */}
      <div className="mx-auto mb-20 max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Choose Your Pricing Model</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select between predictable monthly subscriptions or flexible pay-as-you-go tokens
          </p>
        </div>
        
        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl h-auto gap-2">
            <TabsTrigger
              value="subscriptions" 
              className="flex items-center justify-center gap-3 py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-white/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:border-0"
            >
              <Users className="h-5 w-5" />
              <span>Monthly Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tokens" 
              className="flex items-center justify-center gap-3 py-4 px-6 text-base font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-white/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 data-[state=active]:border-0"
            >
              <CreditCard className="h-5 w-5" />
              <span>Pay-As-You-Go Tokens</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscriptions" className="space-y-8 transition-opacity duration-500">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Monthly Subscription Plans</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get predictable monthly tokens with our subscription plans. Perfect for teams with consistent usage.
              </p>
            </div>
            <SubscriptionPricingTable />
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-8 transition-opacity duration-500">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Pay-As-You-Go Tokens</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Prefer flexibility? Purchase tokens as needed with bonus rewards for larger purchases.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">Token Purchases</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Non-expiring tokens that you can use anytime. Perfect for occasional users or teams who want to supplement their subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Available Packages</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Starter Pack - $5</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">1,000 tokens</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Creator Bundle - $10</span>
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900/50 dark:text-green-200">2,100 tokens</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Power User - $25</span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">5,500 tokens</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Professional - $50</span>
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">11,500 tokens</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Key Features</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">Bonus tokens included on larger packages</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">Tokens never expire</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">Works for personal & organization accounts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-green-500 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">One-time purchase, no recurring charges</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-md border border-blue-100 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
                    <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                      <Zap className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
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
          </TabsContent>
        </Tabs>
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
                  $4.35 - $5.00
                </td>
                <td className="p-4 text-center font-semibold text-green-600">
                  $2.33
                </td>
                <td className="p-4 text-center font-semibold text-green-600">
                  $2.00
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
              question: "What's the difference between subscriptions and token purchases?",
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
