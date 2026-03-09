import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WriteCraft</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Master the Art of Logical Writing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            WriteCraft helps you improve your writing skills using the PREP method—
            without relying on AI to write for you. Structure your thoughts, get feedback,
            and learn from examples.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">Start Writing</Link>
          </Button>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">📝 PREP Method</h3>
            <p className="text-gray-600">
              Structure your ideas using Point, Reason, Example, Point framework
              for clear, logical writing.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">🤖 AI Feedback</h3>
            <p className="text-gray-600">
              Get instant feedback on grammar, logic, and completeness to
              improve your writing quality.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">📚 Learn by Example</h3>
            <p className="text-gray-600">
              Compare your drafts with ideal versions to understand what makes
              writing effective.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
