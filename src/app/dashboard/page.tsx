"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            own voice
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.name || session.user?.email}
            </span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">マイプロジェクト</h1>
            <p className="text-gray-600 mt-1">
              文章プロジェクトを作成・管理します
            </p>
          </div>
          <Button onClick={() => setShowNewPost(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            新規プロジェクト
          </Button>
        </div>

        {showNewPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>新規プロジェクト作成</CardTitle>
              <CardDescription>
                PREP法を使った新しい文章プロジェクトを開始します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    プロジェクトタイトル
                  </label>
                  <Input placeholder="例：技術ブログ記事" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    カテゴリ
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">技術ブログ</SelectItem>
                      <SelectItem value="proposal">提案書</SelectItem>
                      <SelectItem value="self-pr">自己PR</SelectItem>
                      <SelectItem value="essay">エッセイ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button">作成して開始</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>サンプルプロジェクト</CardTitle>
              <CardDescription>技術ブログ • 2日前に作成</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                PREP法の実践を示すサンプルプロジェクトです...
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/editor/sample">プロジェクトを開く</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
