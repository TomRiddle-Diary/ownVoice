"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { value: "job-hunting", label: "就活" },
  { value: "academic", label: "論文・レポート" },
  { value: "blog", label: "ブログ記事" },
  { value: "other", label: "その他" },
];

const TARGET_LENGTHS = [
  { value: "400", label: "短い (400字)" },
  { value: "800", label: "標準 (800字)" },
  { value: "1200", label: "長め (1200字)" },
  { value: "1600", label: "とても長い (1600字)" },
  { value: "custom", label: "カスタム" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [targetLengthPreset, setTargetLengthPreset] = useState("800");
  const [customLength, setCustomLength] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ログインしていなければリダイレクト
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  const handleNext = async () => {
    setIsCreating(true);
    
    try {
      // プロジェクトを作成
      const targetLength = targetLengthPreset === "custom" 
        ? (customLength || "800") 
        : targetLengthPreset;

      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "無題のプロジェクト",
          category: category || "other",
          targetLength: Number(targetLength),
        }),
      });

      if (!response.ok) {
        throw new Error("プロジェクトの作成に失敗しました");
      }

      const data = await response.json();
      
      // アイデア入力ページへ遷移
      router.push(`/project/${data.id}/ideas`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("プロジェクトの作成に失敗しました");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">新規プロジェクト</h1>
              <p className="text-xs text-gray-500">ステップ 1/5: 基本情報</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>プロジェクトの基本情報</CardTitle>
            <CardDescription>
              後から変更できます。未入力でも次へ進めます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル（任意）</Label>
              <Input
                id="title"
                placeholder="例: 技術ブログ記事、企画書など"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                プロジェクトの名前を入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ（任意）</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                文章の種類を選択してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLength">目標文字数（任意）</Label>
              <Select value={targetLengthPreset} onValueChange={setTargetLengthPreset}>
                <SelectTrigger id="targetLength">
                  <SelectValue placeholder="文字数を選択" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LENGTHS.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetLengthPreset === "custom" && (
                <Input
                  type="number"
                  placeholder="文字数を入力"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  min="100"
                  max="5000"
                  className="mt-2"
                />
              )}
              <p className="text-xs text-gray-500">
                完成させたい文章の長さを指定してください
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} disabled={isCreating} size="lg">
                {isCreating ? "作成中..." : "次へ進む"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>💡 ヒント: すべて未入力でも次へ進めます</p>
        </div>
      </div>
    </div>
  );
}
