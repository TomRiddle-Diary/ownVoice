"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { getFormatByTargetLength, type FormatSection, type WritingFormat } from "@/lib/format-utils";

interface Bullet {
  id: string;
  text: string;
}

// 動的な構造に対応
type DynamicStructure = { [sectionId: string]: Bullet[] };

export default function EditorPage() {
  const searchParams = useSearchParams();
  const targetLength = Number(searchParams.get("targetLength")) || 800; // デフォルト800字
  
  // 目標文字数に基づいてフォーマットを決定
  const [format, setFormat] = useState<WritingFormat>(getFormatByTargetLength(targetLength));
  const [sections, setSections] = useState<FormatSection[]>(format.sections);

  const [bullets, setBullets] = useState<Bullet[]>([
    { id: "1", text: "AI技術がソフトウェア開発を変革しています" },
    { id: "2", text: "開発者は創造的な問題解決に集中できます" },
    { id: "3", text: "GitHub Copilotがコード提案でサポートします" },
    { id: "4", text: "これにより生産性とイノベーションが向上します" },
    { id: "5", text: "チームはより良い製品をより速く構築できます" },
  ]);
  const [newBulletText, setNewBulletText] = useState("");
  
  const [dynamicStructure, setDynamicStructure] = useState<DynamicStructure>(() => {
    const structure: DynamicStructure = {};
    format.sections.forEach(section => {
      structure[section.id] = [];
    });
    return structure;
  });
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [modelText, setModelText] = useState("");
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // sectionsが変更されたときにdynamicStructureを再初期化
  useEffect(() => {
    const structure: DynamicStructure = {};
    sections.forEach(section => {
      // 既存のデータを保持しつつ、新しいセクションを追加
      structure[section.id] = dynamicStructure[section.id] || [];
    });
    setDynamicStructure(structure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

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
          : dynamicStructure[source.droppableId];
      const destList =
        destination.droppableId === "bullets"
          ? bullets
          : dynamicStructure[destination.droppableId];

      const [removed] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, removed);

      if (source.droppableId === "bullets") {
        setBullets([...sourceList]);
      } else {
        setDynamicStructure({
          ...dynamicStructure,
          [source.droppableId]: sourceList,
        });
      }

      if (destination.droppableId === "bullets") {
        setBullets([...destList]);
      } else {
        setDynamicStructure({
          ...dynamicStructure,
          [destination.droppableId]: destList,
        });
      }
    } else {
      // Reordering within the same list
      const list =
        source.droppableId === "bullets"
          ? bullets
          : dynamicStructure[source.droppableId];
      const [removed] = list.splice(source.index, 1);
      list.splice(destination.index, 0, removed);

      if (source.droppableId === "bullets") {
        setBullets([...list]);
      } else {
        setDynamicStructure({
          ...dynamicStructure,
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
          structure: dynamicStructure,
          format: format.name,
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
          structure: dynamicStructure,
          category: "Tech Blog",
          format: format.name,
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">技術ブログ記事</h1>
              <p className="text-xs text-gray-500">
                {format.name} • 目標{targetLength}字
              </p>
            </div>
            <Badge>下書き</Badge>
          </div>
          <Button variant="outline">保存</Button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="container mx-auto px-4 py-8">
          {/* フォーマット説明 */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📝</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{format.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {sections.map((section, index) => (
                      <Badge key={section.id} variant="outline" className="text-xs">
                        {index + 1}. {section.label} ({section.recommendedLength}字)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBullet();
                        }
                      }}
                    />
                    <Button onClick={addBullet} size="icon" type="button">
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
                  <CardTitle className="text-lg">📋 文章構造</CardTitle>
                  <p className="text-sm text-gray-600">
                    上のメモを各セクションにドラッグ＆ドロップします
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <label className="block text-sm font-medium mb-2">
                        {section.label}
                        <span className="text-xs text-gray-500 ml-2">
                          （推奨: {section.recommendedLength}字）
                        </span>
                      </label>
                      {section.description && (
                        <p className="text-xs text-gray-500 mb-2">{section.description}</p>
                      )}
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
                            {dynamicStructure[section.id]?.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">
                                メモをここにドロップ
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {dynamicStructure[section.id]?.map(
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
