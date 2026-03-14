"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GripVertical, MoveVertical, Plus, X, Trash2, Edit2, Check } from "lucide-react";
import { getFormatByCategory, type FormatSection } from "@/lib/format-utils";

interface Bullet {
  id: string;
  text: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  targetLength: number;
}

type CategorizedBullets = { [sectionId: string]: Bullet[] };

export default function ProjectReorderPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [categorizedBullets, setCategorizedBullets] = useState<CategorizedBullets>({});
  const [sections, setSections] = useState<FormatSection[]>([]);
  const [customSections, setCustomSections] = useState<FormatSection[]>([]);
  const [removedSectionIds, setRemovedSectionIds] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [isAddIdeaDialogOpen, setIsAddIdeaDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [newIdeaText, setNewIdeaText] = useState("");
  const [selectedSectionForIdea, setSelectedSectionForIdea] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status, projectId]);

  const loadData = async () => {
    try {
      // プロジェクト情報を取得
      const projectRes = await fetch(`/api/project/${projectId}`);
      if (!projectRes.ok) {
        throw new Error("プロジェクト情報取得失敗");
      }
      const projectData = await projectRes.json();
      setProject(projectData);
      
      // カテゴリに基づいてフォーマットを設定
      const format = getFormatByCategory(
        projectData.category || "other", 
        projectData.targetLength || 800
      );
      setSections(format.sections);

      // 構造化されたアイデアを取得
      const structureRes = await fetch(`/api/project/${projectId}/structure`);
      if (structureRes.ok) {
        const structData = await structureRes.json();
        const existingStructure = structData.structure || {};
        const existingCustomSections = structData.customSections || [];
        const existingRemovedSectionIds = structData.removedSectionIds || [];
        const existingSectionOrder = structData.sectionOrder || [];
        
        setCustomSections(existingCustomSections);
        setRemovedSectionIds(existingRemovedSectionIds);
        setCategorizedBullets(existingStructure);

        // セクションの順序を設定
        const allSectionIds = [
          ...format.sections.filter(s => !existingRemovedSectionIds.includes(s.id)).map(s => s.id),
          ...existingCustomSections.map((s: FormatSection) => s.id)
        ];
        
        // 保存された順序があればそれを使う、なければデフォルト順序
        if (existingSectionOrder.length > 0) {
          setSectionOrder(existingSectionOrder);
        } else {
          setSectionOrder(allSectionIds);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const allSections = [
    ...sections.filter(s => !removedSectionIds.includes(s.id)),
    ...customSections
  ];

  // セクション順序に基づいてソート
  const orderedSections = sectionOrder
    .map(id => allSections.find(s => s.id === id))
    .filter((s): s is FormatSection => s !== undefined);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    // セクション全体の並び替え
    if (type === "section") {
      const newOrder = Array.from(sectionOrder);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);
      setSectionOrder(newOrder);
      return;
    }

    // セクション内のアイデアの並び替え
    if (type === "bullet") {
      const sectionId = source.droppableId;
      const bullets = categorizedBullets[sectionId] || [];
      const newBullets = Array.from(bullets);
      const [removed] = newBullets.splice(source.index, 1);
      newBullets.splice(destination.index, 0, removed);
      
      setCategorizedBullets({
        ...categorizedBullets,
        [sectionId]: newBullets,
      });
    }
  };
  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      alert("セクション名を入力してください");
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newSection: FormatSection = {
      id: customId,
      label: newSectionName.trim(),
      description: newSectionDescription.trim() || "カスタムセクション",
      color: "bg-gray-100 border-gray-300",
      placeholder: `${newSectionName}に関する内容...`,
      recommendedLength: 200,
      keywords: [],
    };

    setCustomSections([...customSections, newSection]);
    setSectionOrder([...sectionOrder, customId]);
    setCategorizedBullets({
      ...categorizedBullets,
      [customId]: [],
    });

    setNewSectionName("");
    setNewSectionDescription("");
    setIsAddSectionDialogOpen(false);
  };

  const handleRemoveSection = (sectionId: string) => {
    const bulletsInSection = categorizedBullets[sectionId] || [];
    const sectionLabel = orderedSections.find(s => s.id === sectionId)?.label || "セクション";
    
    if (bulletsInSection.length > 0) {
      if (!confirm(`「${sectionLabel}」には${bulletsInSection.length}件のアイデアがあります。削除しますか？アイデアも削除されます。`)) {
        return;
      }
    } else {
      if (!confirm(`「${sectionLabel}」を削除しますか？`)) {
        return;
      }
    }

    const isDefaultSection = sections.some(s => s.id === sectionId);
    if (isDefaultSection) {
      setRemovedSectionIds([...removedSectionIds, sectionId]);
    } else {
      setCustomSections(customSections.filter(s => s.id !== sectionId));
    }

    setSectionOrder(sectionOrder.filter(id => id !== sectionId));
    const newCategorized = { ...categorizedBullets };
    delete newCategorized[sectionId];
    setCategorizedBullets(newCategorized);
  };

  const handleAddIdea = () => {
    if (!newIdeaText.trim()) {
      alert("アイデアを入力してください");
      return;
    }

    if (!selectedSectionForIdea) {
      alert("セクションを選択してください");
      return;
    }

    const newBullet: Bullet = {
      id: `bullet_${Date.now()}`,
      text: newIdeaText.trim(),
    };

    const currentBullets = categorizedBullets[selectedSectionForIdea] || [];
    setCategorizedBullets({
      ...categorizedBullets,
      [selectedSectionForIdea]: [...currentBullets, newBullet],
    });

    setNewIdeaText("");
    setSelectedSectionForIdea("");
    setIsAddIdeaDialogOpen(false);
  };

  const handleRemoveIdea = (sectionId: string, bulletId: string) => {
    if (!confirm("このアイデアを削除しますか？")) {
      return;
    }

    const updatedBullets = (categorizedBullets[sectionId] || []).filter(b => b.id !== bulletId);
    setCategorizedBullets({
      ...categorizedBullets,
      [sectionId]: updatedBullets,
    });
  };

  const startEditing = (bullet: Bullet) => {
    setEditingId(bullet.id);
    setEditingText(bullet.text);
  };

  const saveEdit = (sectionId: string) => {
    if (editingText.trim() && editingId) {
      const updatedBullets = (categorizedBullets[sectionId] || []).map(b => 
        b.id === editingId ? { ...b, text: editingText.trim() } : b
      );
      setCategorizedBullets({
        ...categorizedBullets,
        [sectionId]: updatedBullets,
      });
      setEditingId(null);
      setEditingText("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  const handleNext = async () => {
    setIsSaving(true);
    try {
      // 並び替え結果を保存
      const response = await fetch(`/api/project/${projectId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          structure: categorizedBullets,
          customSections: customSections,
          removedSectionIds: removedSectionIds,
          sectionOrder: sectionOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("並び替え結果の保存に失敗しました");
      }

      // 文章作成ページへ遷移
      router.push(`/project/${projectId}/write`);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("並び替え結果の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                ← ダッシュボード
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {project?.title || "プロジェクト"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">ステップ 4/5: 構成の並び替え</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    セクション追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新しいセクションを追加</DialogTitle>
                    <DialogDescription>
                      カスタムセクションを作成できます。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="section-name">セクション名 *</Label>
                      <Input
                        id="section-name"
                        placeholder="例: 補足説明、参考文献"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddSection();
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section-desc">説明（任意）</Label>
                      <Input
                        id="section-desc"
                        placeholder="このセクションの用途"
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={handleAddSection}>追加</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddIdeaDialogOpen} onOpenChange={setIsAddIdeaDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    アイデア追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新しいアイデアを追加</DialogTitle>
                    <DialogDescription>
                      セクションを選択してアイデアを追加できます。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="section-select">セクション *</Label>
                      <select
                        id="section-select"
                        className="w-full p-2 border rounded-md"
                        value={selectedSectionForIdea}
                        onChange={(e) => setSelectedSectionForIdea(e.target.value)}
                      >
                        <option value="">セクションを選択</option>
                        {orderedSections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idea-text">アイデア *</Label>
                      <Textarea
                        id="idea-text"
                        placeholder="アイデアを入力してください"
                        value={newIdeaText}
                        onChange={(e) => setNewIdeaText(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddIdeaDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={handleAddIdea}>追加</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MoveVertical className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">構成の順序を調整</h3>
                <p className="text-sm text-gray-600">
                  セクション（箱）全体をドラッグして並び替えができます。また、各セクション内のアイデアの順序も変更できます。
                  文章の流れに最適な構成を見つけましょう。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DragDropContext onDragEnd={onDragEnd}>
          {/* セクション全体の並び替え */}
          <Droppable droppableId="all-sections" type="section">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {orderedSections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "shadow-2xl ring-2 ring-purple-500" : ""}`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-move p-2 hover:bg-gray-100 rounded"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                  <CardTitle className="text-lg">{section.label}</CardTitle>
                                  {customSections.some(s => s.id === section.id) && (
                                    <Badge variant="secondary" className="text-xs">カスタム</Badge>
                                  )}
                                </div>
                                {section.description && (
                                  <CardDescription className="text-xs mt-1">
                                    {section.description}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {categorizedBullets[section.id]?.length || 0} 件
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSection(section.id);
                                }}
                                title="セクションを削除"
                              >
                                <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* セクション内のアイデアの並び替え */}
                          <Droppable droppableId={section.id} type="bullet">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-[80px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                                  section.color
                                } ${snapshot.isDraggingOver ? "border-solid shadow-inner" : ""}`}
                              >
                                {categorizedBullets[section.id]?.length === 0 ? (
                                  <p className="text-sm text-gray-500 text-center py-4">
                                    アイデアがありません
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {categorizedBullets[section.id]?.map((bullet, bulletIndex) => (
                                      <Draggable key={bullet.id} draggableId={bullet.id} index={bulletIndex}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`group flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                              snapshot.isDragging ? "ring-2 ring-blue-500" : ""
                                            }`}
                                          >
                                            <div
                                              {...provided.dragHandleProps}
                                              className="cursor-move"
                                            >
                                              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </div>
                                            {editingId === bullet.id ? (
                                              <>
                                                <Input
                                                  className="flex-1 h-8"
                                                  value={editingText}
                                                  onChange={(e) => setEditingText(e.target.value)}
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit(section.id);
                                                    if (e.key === "Escape") cancelEdit();
                                                  }}
                                                  autoFocus
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => saveEdit(section.id)}
                                                  title="保存"
                                                >
                                                  <Check className="h-3 w-3 text-green-600" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={cancelEdit}
                                                  title="キャンセル"
                                                >
                                                  <X className="h-3 w-3 text-gray-500" />
                                                </Button>
                                              </>
                                            ) : (
                                              <>
                                                <span className="flex-1 text-sm">{bullet.text}</span>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(bullet);
                                                  }}
                                                  title="編集"
                                                >
                                                  <Edit2 className="h-3 w-3 text-gray-500" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveIdea(section.id, bullet.id);
                                                  }}
                                                  title="アイデアを削除"
                                                >
                                                  <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-500" />
                                                </Button>
                                              </>
                                            )}
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-8 flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push(`/project/${projectId}/organize`)}>
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
