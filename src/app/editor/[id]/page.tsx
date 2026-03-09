"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, GripVertical, Plus, Trash2, Sparkles } from "lucide-react";

interface Bullet {
  id: string;
  text: string;
}

interface PrepStructure {
  point1: Bullet[];
  reason: Bullet[];
  example: Bullet[];
  point2: Bullet[];
}

const PREP_SECTIONS = [
  { id: "point1", label: "Point (結論・開始)", color: "bg-blue-100 border-blue-300" },
  { id: "reason", label: "Reason (理由)", color: "bg-green-100 border-green-300" },
  { id: "example", label: "Example (具体例)", color: "bg-yellow-100 border-yellow-300" },
  { id: "point2", label: "Point (結論・終わり)", color: "bg-purple-100 border-purple-300" },
];

export default function EditorPage() {
  const [bullets, setBullets] = useState<Bullet[]>([
    { id: "1", text: "AI技術がソフトウェア開発を変革しています" },
    { id: "2", text: "開発者は創造的な問題解決に集中できます" },
    { id: "3", text: "GitHub Copilotがコード提案でサポートします" },
    { id: "4", text: "これにより生産性とイノベーションが向上します" },
    { id: "5", text: "チームはより良い製品をより速く構築できます" },
  ]);
  const [newBulletText, setNewBulletText] = useState("");
  const [prepStructure, setPrepStructure] = useState<PrepStructure>({
    point1: [],
    reason: [],
    example: [],
    point2: [],
  });
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [modelText, setModelText] = useState("");
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const addBullet = () => {
    if (newBulletText.trim()) {
      const newBullet = {
        id: Date.now().toString(),
        text: newBulletText,
      };
      setBullets([...bullets, newBullet]);
      setNewBulletText("");
    }
  };

  const removeBullet = (id: string) => {
    setBullets(bullets.filter((b) => b.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // Moving between lists
    if (source.droppableId !== destination.droppableId) {
      const sourceList =
        source.droppableId === "bullets"
          ? bullets
          : prepStructure[source.droppableId as keyof PrepStructure];
      const destList =
        destination.droppableId === "bullets"
          ? bullets
          : prepStructure[destination.droppableId as keyof PrepStructure];

      const [removed] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, removed);

      if (source.droppableId === "bullets") {
        setBullets([...sourceList]);
      } else {
        setPrepStructure({
          ...prepStructure,
          [source.droppableId]: sourceList,
        });
      }

      if (destination.droppableId === "bullets") {
        setBullets([...destList]);
      } else {
        setPrepStructure({
          ...prepStructure,
          [destination.droppableId]: destList,
        });
      }
    } else {
      // Reordering within the same list
      const list =
        source.droppableId === "bullets"
          ? bullets
          : prepStructure[source.droppableId as keyof PrepStructure];
      const [removed] = list.splice(source.index, 1);
      list.splice(destination.index, 0, removed);

      if (source.droppableId === "bullets") {
        setBullets([...list]);
      } else {
        setPrepStructure({
          ...prepStructure,
          [source.droppableId]: list,
        });
      }
    }
  };

  const getFeedback = async () => {
    setIsLoadingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          structure: prepStructure,
        }),
      });
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error getting feedback:", error);
      setFeedback("フィードバックの取得に失敗しました。もう一度試してください。");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const getModelText = async () => {
    setIsLoadingModel(true);
    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structure: prepStructure,
          category: "Tech Blog",
        }),
      });
      const data = await response.json();
      setModelText(data.modelText);
      setShowComparison(true);
    } catch (error) {
      console.error("Error getting model text:", error);
      setModelText("理想的なテキストの生成に失敗しました。もう一度試してください。");
    } finally {
      setIsLoadingModel(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">技術ブログ記事</h1>
            <Badge>下書き</Badge>
          </div>
          <Button variant="outline">保存</Button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel: Bullets & Structure */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 アイデア（メモ）</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="新しいメモを追加..."
                      value={newBulletText}
                      onChange={(e) => setNewBulletText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addBullet()}
                    />
                    <Button onClick={addBullet} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Droppable droppableId="bullets">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 min-h-[100px]"
                      >
                        {bullets.map((bullet, index) => (
                          <Draggable key={bullet.id} draggableId={bullet.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="flex-1 text-sm">{bullet.text}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBullet(bullet.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 PREP構造</CardTitle>
                  <p className="text-sm text-gray-600">
                    上のメモをPREPフレームワークにドラッグ＆ドロップします
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PREP_SECTIONS.map((section) => (
                    <div key={section.id}>
                      <label className="block text-sm font-medium mb-2">
                        {section.label}
                      </label>
                      <Droppable droppableId={section.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`min-h-[80px] p-3 border-2 border-dashed rounded-lg ${
                              section.color
                            } ${
                              snapshot.isDraggingOver ? "border-solid shadow-inner" : ""
                            }`}
                          >
                            {prepStructure[section.id as keyof PrepStructure].length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">
                                メモをここにドロップ
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {prepStructure[section.id as keyof PrepStructure].map(
                                  (bullet, index) => (
                                    <Draggable
                                      key={bullet.id}
                                      draggableId={bullet.id}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm"
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                          <span className="flex-1 text-sm">{bullet.text}</span>
                                        </div>
                                      )}
                                    </Draggable>
                                  )
                                )}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Writing & Feedback */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✍️ 下書き</CardTitle>
                  <p className="text-sm text-gray-600">
                    PREP構造を基に文章を書きます
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="ここに下書きを書き始めます..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] mb-4"
                  />
                  <div className="flex gap-2">
                    <Button onClick={getFeedback} disabled={!content || isLoadingFeedback}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isLoadingFeedback ? "分析中..." : "AIフィードバックを取得"}
                    </Button>
                    <Button
                      onClick={getModelText}
                      disabled={isLoadingModel}
                      variant="outline"
                    >
                      {isLoadingModel ? "生成中..." : "理想版と比較"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {(isLoadingFeedback || feedback) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🤖 AIフィードバック</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingFeedback ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm whitespace-pre-wrap">{feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Comparison View */}
          {showComparison && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">📚 比較学習</CardTitle>
                  <p className="text-sm text-gray-600">
                    あなたの下書き（左）と理想版（右）を比較して、違いから学びます
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoadingModel ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">あなたの下書き</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <p className="text-sm whitespace-pre-wrap">{content || "まだ内容がありません..."}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-blue-700">理想的なバージョン</h3>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm whitespace-pre-wrap">{modelText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
