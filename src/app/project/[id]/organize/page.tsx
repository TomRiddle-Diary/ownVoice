"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GripVertical, Sparkles, RefreshCw } from "lucide-react";
import { getFormatByTargetLength, type FormatSection } from "@/lib/format-utils";

interface Bullet {
  id: string;
  text: string;
}

type CategorizedBullets = { [sectionId: string]: Bullet[] };

export default function ProjectOrganizePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [categorizedBullets, setCategorizedBullets] = useState<CategorizedBullets>({});
  const [sections, setSections] = useState<FormatSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCategorized, setHasCategorized] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status, projectId]);

  const loadData = async () => {
    try {
      // プロジェクト情報とbulletsを取得
      const response = await fetch(`/api/project/${projectId}/bullets`);
      if (response.ok) {
        const data = await response.json();
        setBullets(data.bullets || []);
        
        // フォーマットを設定（デフォルト800字）
        const targetLength = 800;
        const format = getFormatByTargetLength(targetLength);
        setSections(format.sections);
        
        // 空のカテゴリを初期化
        const emptyCategories: CategorizedBullets = {};
        format.sections.forEach(section => {
          emptyCategories[section.id] = [];
        });
        emptyCategories['uncategorized'] = data.bullets || [];
        setCategorizedBullets(emptyCategories);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCategorize = async () => {
    if (bullets.length === 0) {
      alert("カテゴライズするアイデアがありません");
      return;
    }

    setIsCategorizing(true);
    try {
      const response = await fetch(`/api/project/${projectId}/categorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullets,
          sections: sections.map(s => ({ id: s.id, label: s.label, description: s.description })),
        }),
      });

      if (!response.ok) {
        throw new Error("カテゴライズに失敗しました");
      }

      const data = await response.json();
      setCategorizedBullets(data.categorizedBullets);
      setHasCategorized(true);
      
      // メッセージがある場合は表示
      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error categorizing:", error);
      alert("カテゴライズに失敗しました。もう一度試してください。");
    } finally {
      setIsCategorizing(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceList = categorizedBullets[source.droppableId] || [];
    const destList = categorizedBullets[destination.droppableId] || [];

    if (source.droppableId === destination.droppableId) {
      // 同じリスト内での並べ替え
      const newList = Array.from(sourceList);
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      
      setCategorizedBullets({
        ...categorizedBullets,
        [source.droppableId]: newList,
      });
    } else {
      // 異なるリスト間での移動
      const newSourceList = Array.from(sourceList);
      const newDestList = Array.from(destList);
      const [removed] = newSourceList.splice(source.index, 1);
      newDestList.splice(destination.index, 0, removed);
      
      setCategorizedBullets({
        ...categorizedBullets,
        [source.droppableId]: newSourceList,
        [destination.droppableId]: newDestList,
      });
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // カテゴライズ結果を保存
      const response = await fetch(`/api/project/${projectId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structure: categorizedBullets }),
      });

      if (!response.ok) {
        throw new Error("構造の保存に失敗しました");
      }

      // 文章作成ページへ遷移
      router.push(`/project/${projectId}/write`);
    } catch (error) {
      console.error("Error saving structure:", error);
      alert("構造の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/project/${projectId}/ideas`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">アイデアの整理</h1>
                <p className="text-xs text-gray-500">ステップ 3/4: カテゴライズ＆並べ替え</p>
              </div>
            </div>
            <Button
              onClick={handleAutoCategorize}
              disabled={isCategorizing || bullets.length === 0}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isCategorizing ? "分析中..." : hasCategorized ? "再分析" : "AI自動分類"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!hasCategorized && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AIでアイデアを自動分類</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    右上の「AI自動分類」ボタンをクリックすると、アイデアを文章構造に合わせて自動的に分類します。
                    分類後、ドラッグ＆ドロップで自由に整理できます。
                  </p>
                  <Button onClick={handleAutoCategorize} disabled={isCategorizing || bullets.length === 0}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isCategorizing ? "分析中..." : "今すぐ分類する"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 未分類のアイデア */}
            {categorizedBullets['uncategorized']?.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">📝 未分類のアイデア</CardTitle>
                  <CardDescription>
                    以下のアイデアを各セクションにドラッグしてください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="uncategorized">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[100px] p-4 border-2 border-dashed rounded-lg ${
                          snapshot.isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                        }`}
                      >
                        <div className="space-y-2">
                          {categorizedBullets['uncategorized'].map((bullet, index) => (
                            <Draggable key={bullet.id} draggableId={bullet.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                  <span className="flex-1 text-sm">{bullet.text}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            )}

            {/* セクションごとのドロップエリア */}
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">{section.label}</CardTitle>
                    <Badge variant="outline">
                      {categorizedBullets[section.id]?.length || 0} 件
                    </Badge>
                  </div>
                  {section.description && (
                    <CardDescription className="text-xs">
                      {section.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={section.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[150px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                          section.color
                        } ${
                          snapshot.isDraggingOver ? "border-solid shadow-inner" : ""
                        }`}
                      >
                        {categorizedBullets[section.id]?.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-8">
                            アイデアをここにドロップ
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {categorizedBullets[section.id]?.map((bullet, index) => (
                              <Draggable key={bullet.id} draggableId={bullet.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <span className="flex-1 text-sm">{bullet.text}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            ))}
          </div>
        </DragDropContext>

        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push(`/project/${projectId}/ideas`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <Button onClick={handleNext} disabled={isSaving} size="lg">
            {isSaving ? "保存中..." : "保存して次へ"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
