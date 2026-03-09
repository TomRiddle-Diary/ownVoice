import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">own voice</h1>
          <Button asChild variant="outline">
            <Link href="/dashboard">始める</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            論理的ライティングをマスターしよう
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            own voiceはPREP法を使って、AIに頼らずあなた自身の文章力を向上させます。
            考えを整理し、フィードバックを受け、見本から学びましょう。
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">今すぐ始める</Link>
          </Button>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">📝 PREP法</h3>
            <p className="text-gray-600">
              Point（結論）、Reason（理由）、Example（具体例）、Point（結論）の
              フレームワークで明快で論理的な文章を構成します。
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">🤖 AIフィードバック</h3>
            <p className="text-gray-600">
              文法、論理性、完全性について即座にフィードバックを受け、
              文章の質を向上させます。
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">📚 見本から学ぶ</h3>
            <p className="text-gray-600">
              あなたの下書きと理想的なバージョンを比較して、
              効果的な文章とは何かを理解します。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
