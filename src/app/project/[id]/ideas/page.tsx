"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2, Lightbulb } from "lucide-react";

interface Bullet {
  id: string;
  text: string;
}

export default function ProjectIdeasPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [newBulletText, setNewBulletText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadBullets();
    }
  }, [status, projectId]);

  const loadBullets = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/bullets`);
      if (response.ok) {
        const data = await response.json();
        setBullets(data.bullets || []);
      }
    } catch (error) {
      console.error("Error loading bullets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBullet = () => {
    if (newBulletText.trim()) {
      const newBullet: Bullet = {
        id: `temp-${Date.now()}`,
        text: newBulletText.trim(),
      };
      setBullets([...bullets, newBullet]);
      setNewBulletText("");
    }
  };

  const removeBullet = (id: string) => {
    setBullets(bullets.filter((b) => b.id !== id));
  };

  const handleNext = async () => {
    setIsSaving(true);
    
    try {
      // アイデアを保存
      const response = await fetch(`/api/project/${projectId}/bullets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      if (!response.ok) {
        throw new Error("アイデアの保存に失敗しました");
      }

      // カテゴライズページへ遷移
      router.push(`/project/${projectId}/organize`);
    } catch (error) {
      console.error("Error saving bullets:", error);
      alert("アイデアの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push(`/project/${projectId}/organize`);
  };

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

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
              <h1 className="text-xl font-bold text-gray-900">アイデア・エピソード</h1>
              <p className="text-xs text-gray-500">ステップ 2/4: 情報収集</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <CardTitle>アイデアを箇条書きで追加</CardTitle>
            </div>
            <CardDescription>
              思いついたこと、書きたいことを自由に追加してください。順番は後で整理できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 入力フォーム */}
            <div className="flex gap-2">
              <Input
                placeholder="アイデアやエピソードを入力..."
                value={newBulletText}
                onChange={(e) => setNewBulletText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addBullet();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={addBullet} size="icon" type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* アイデアリスト */}
            <div className="space-y-2">
              {bullets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>まだアイデアがありません</p>
                  <p className="text-sm">上の入力欄から追加してみましょう</p>
                </div>
              ) : (
                bullets.map((bullet, index) => (
                  <div
                    key={bullet.id}
                    className="flex items-start gap-3 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm">{bullet.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBullet(bullet.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleSkip}>
                スキップ
              </Button>
              <Button onClick={handleNext} disabled={isSaving} size="lg">
                {isSaving ? "保存中..." : bullets.length > 0 ? "保存して次へ" : "次へ進む"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          <p>💡 ヒント: アイデアは後からでも追加・編集できます</p>
          <p className="text-xs">現在 {bullets.length} 件のアイデア</p>
        </div>
      </div>
    </div>
  );
}
