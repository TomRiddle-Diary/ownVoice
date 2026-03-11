"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, FileText, Clock, Trash2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      loadProjects();
    }
  }, [status]);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/project");
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("このプロジェクトを削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("削除に失敗しました");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      blog: "ブログ記事",
      proposal: "企画書・提案書",
      "self-pr": "自己PR", 
      essay: "エッセイ",
      report: "レポート",
      other: "その他",
    };
    return labels[category] || category;
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
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
          <Button onClick={() => router.push('/project/new')} size="lg">
            <PlusCircle className="w-4 h-4 mr-2" />
            新規プロジェクト
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                まだプロジェクトがありません
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                「新規プロジェクト」ボタンから最初のプロジェクトを作成しましょう
              </p>
              <Button onClick={() => router.push('/project/new')}>
                <PlusCircle className="w-4 h-4 mr-2" />
                最初のプロジェクトを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="mr-2">
                          {getCategoryLabel(project.category)}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteProject(project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/project/${project.id}/write`)}
                    >
                      続きを書く
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/project/${project.id}/ideas`)}
                    >
                      アイデアを編集
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
