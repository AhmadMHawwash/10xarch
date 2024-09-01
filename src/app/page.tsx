import Link from 'next/link';
import { ArrowRight, Code, Users, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">System Design Playground</h1>
        <p className="text-xl text-gray-400 mb-8">Learn, practice, and master system design concepts interactively</p>
        <Link href="/projects" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center">
          Get Started <ArrowRight className="ml-2" />
        </Link>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Code, title: "Interactive Projects", description: "Build and experiment with real-world system designs" },
          { icon: Users, title: "Community Driven", description: "Share your designs and learn from others" },
          { icon: BookOpen, title: "Learn by Doing", description: "Practical approach to understanding complex systems" },
        ].map((feature, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg text-center">
            <feature.icon className="mx-auto mb-4 w-12 h-12 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="bg-gray-800 p-8 rounded-lg mb-16">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-300">
          <li>Choose a project or start from scratch</li>
          <li>Design your system using our interactive tools</li>
          <li>Get real-time feedback and suggestions</li>
          <li>Share your design with the community</li>
          <li>Learn from expert reviews and peer feedback</li>
        </ol>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to dive in?</h2>
        <Link href="/projects" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center">
          Explore Projects <ArrowRight className="ml-2" />
        </Link>
      </section>
    </div>
  );
}
