"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GripVertical, Plus, X, Trash2, Edit2, Check } from "lucide-react";
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

export default function ProjectOrganizePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [categorizedBullets, setCategorizedBullets] = useState<CategorizedBullets>({});
  const [sections, setSections] = useState<FormatSection[]>([]);
  const [customSections, setCustomSections] = useState<FormatSection[]>([]);
  const [removedSectionIds, setRemovedSectionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isAddIdeaDialogOpen, setIsAddIdeaDialogOpen] = useState(false);
  const [selectedSectionForIdea, setSelectedSectionForIdea] = useState<string>("");
  const [newIdeaText, setNewIdeaText] = useState("");

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
        const errorData = await projectRes.json();
        console.error("Project fetch error:", errorData);
        throw new Error(`プロジェクト情報取得失敗: ${errorData.error || projectRes.status}`);
      }
      const projectData = await projectRes.json();
      setProject(projectData);
      
      // bulletsを取得
      const bulletsRes = await fetch(`/api/project/${projectId}/bullets`);
      if (bulletsRes.ok) {
        const data = await bulletsRes.json();
        setBullets(data.bullets || []);
        
        // カテゴリに基づいてフォーマットを設定
        const format = getFormatByCategory(
          projectData.category || "other", 
          projectData.targetLength || 800
        );
        setSections(format.sections);
        
        // 既存の構造を取得
        const structureRes = await fetch(`/api/project/${projectId}/structure`);
        let existingStructure: CategorizedBullets = {};
        let existingCustomSections: FormatSection[] = [];
        let existingRemovedSectionIds: string[] = [];
        
        if (structureRes.ok) {
          const structData = await structureRes.json();
          existingStructure = structData.structure || {};
          existingCustomSections = structData.customSections || [];
          existingRemovedSectionIds = structData.removedSectionIds || [];
          setCustomSections(existingCustomSections);
          setRemovedSectionIds(existingRemovedSectionIds);
        }
        
        // カテゴリを初期化
        const emptyCategories: CategorizedBullets = {};
        format.sections.forEach(section => {
          emptyCategories[section.id] = existingStructure[section.id] || [];
        });
        
        // カスタムセクションも初期化
        existingCustomSections.forEach(section => {
          emptyCategories[section.id] = existingStructure[section.id] || [];
        });
        
        // 未分類エリア
        const assignedBullets = new Set(
          Object.values(emptyCategories).flat().map(b => b.id)
        );
        const uncategorized = data.bullets.filter((b: Bullet) => !assignedBullets.has(b.id));
        emptyCategories['uncategorized'] = uncategorized;
        
        setCategorizedBullets(emptyCategories);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
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
    setCategorizedBullets({
      ...categorizedBullets,
      [customId]: [],
    });

    // ダイアログを閉じて入力をリセット
    setNewSectionName("");
    setNewSectionDescription("");
    setIsAddDialogOpen(false);
  };

  const handleRemoveSection = (sectionId: string) => {
    // そのセクションにアイデアがある場合は警告
    const bulletsInSection = categorizedBullets[sectionId] || [];
    if (bulletsInSection.length > 0) {
      if (!confirm(`「${getSectionLabel(sectionId)}」には${bulletsInSection.length}件のアイデアがあります。削除すると未分類に戻ります。よろしいですか？`)) {
        return;
      }
    } else {
      if (!confirm(`「${getSectionLabel(sectionId)}」を削除しますか？`)) {
        return;
      }
    }

    // デフォルトセクションの場合は削除済みリストに追加
    const isDefaultSection = sections.some(s => s.id === sectionId);
    if (isDefaultSection) {
      setRemovedSectionIds([...removedSectionIds, sectionId]);
    } else {
      // カスタムセクションの場合は配列から削除
      setCustomSections(customSections.filter(s => s.id !== sectionId));
    }
    
    // categorizedBulletsから削除（アイデアは未分類に戻す）
    const newCategorized = { ...categorizedBullets };
    if (bulletsInSection.length > 0) {
      newCategorized['uncategorized'] = [
        ...(newCategorized['uncategorized'] || []), 
        ...bulletsInSection
      ];
    }
    delete newCategorized[sectionId];
    setCategorizedBullets(newCategorized);
  };

  const getSectionLabel = (sectionId: string): string => {
    const section = [...sections, ...customSections].find(s => s.id === sectionId);
    return section?.label || sectionId;
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

  const openAddIdeaDialog = (sectionId: string) => {
    setSelectedSectionForIdea(sectionId);
    setNewIdeaText("");
    setIsAddIdeaDialogOpen(true);
  };

  const handleAddIdea = () => {
    if (!newIdeaText.trim()) {
      alert("アイデアを入力してください");
      return;
    }

    const newBullet: Bullet = {
      id: `temp-${Date.now()}`,
      text: newIdeaText.trim(),
    };

    const updatedBullets = [...(categorizedBullets[selectedSectionForIdea] || []), newBullet];
    setCategorizedBullets({
      ...categorizedBullets,
      [selectedSectionForIdea]: updatedBullets,
    });

    setNewIdeaText("");
    setIsAddIdeaDialogOpen(false);
  };

  const allSections = [
    ...sections.filter(s => !removedSectionIds.includes(s.id)),
    ...customSections
  ];

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // カテゴライズ結果、カスタムセクション、削除されたセクションを保存
      const response = await fetch(`/api/project/${projectId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          structure: categorizedBullets,
          customSections: customSections,
          removedSectionIds: removedSectionIds,
        }),
      });

      if (!response.ok) {
        throw new Error("構造の保存に失敗しました");
      }

      // 並び替えページへ遷移
      router.push(`/project/${projectId}/reorder`);
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
                <p className="text-xs text-gray-500">ステップ 3/5: アイデア分類</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                    カスタムセクションを作成して、アイデアを自由に分類できます。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-name">セクション名 *</Label>
                    <Input
                      id="section-name"
                      placeholder="例: 補足説明、参考文献、etc"
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
                    <Label htmlFor="section-description">説明（任意）</Label>
                    <Input
                      id="section-description"
                      placeholder="このセクションの用途を説明"
                      value={newSectionDescription}
                      onChange={(e) => setNewSectionDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleAddSection}>
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <GripVertical className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">手動でアイデアを整理</h3>
                <p className="text-sm text-gray-600">
                  左側の未分類のアイデアを、右側の各セクションにドラッグ＆ドロップして整理してください。
                  各セクションは文章の構成に対応しています。自由に並べ替えて最適な構成を見つけましょう。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左側：未分類のアイデア */}
            <div className="w-full lg:w-1/2">
              <div className="lg:sticky lg:top-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">📝 未分類のアイデア</CardTitle>
                        <CardDescription>
                          以下のアイデアを右側のセクションにドラッグしてください
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddIdeaDialog('uncategorized')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        追加
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="uncategorized">
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] max-h-[400px] lg:max-h-[calc(100vh-300px)] overflow-y-auto p-4 border-2 border-dashed rounded-lg ${
                            snapshot.isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                          }`}
                        >
                          {categorizedBullets['uncategorized']?.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                              すべてのアイデアが分類されました！
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {categorizedBullets['uncategorized']?.map((bullet, index) => (
                                <Draggable 
                                  key={bullet.id} 
                                  draggableId={bullet.id} 
                                  index={index}
                                  isDragDisabled={editingId === bullet.id}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="group flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      {editingId === bullet.id ? (
                                        <div className="w-4 h-4 flex-shrink-0" />
                                      ) : (
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-move"
                                        >
                                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        </div>
                                      )}
                                      {editingId === bullet.id ? (
                                        <>
                                          <Input
                                            className="flex-1 h-8"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") saveEdit('uncategorized');
                                              if (e.key === "Escape") cancelEdit();
                                            }}
                                            autoFocus
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => saveEdit('uncategorized')}
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
                                              handleRemoveIdea('uncategorized', bullet.id);
                                            }}
                                            title="削除"
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
              </div>
            </div>

            {/* 右側：分類セクション */}
            <div className="w-full lg:w-1/2">
              <div className="space-y-6">

            {/* セクションごとのドロップエリア */}
            {allSections.map((section) => {
              const isCustomSection = customSections.some(s => s.id === section.id);
              return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-md">{section.label}</CardTitle>
                        {isCustomSection && (
                          <Badge variant="secondary" className="text-xs">カスタム</Badge>
                        )}
                      </div>
                      {section.description && (
                        <CardDescription className="text-xs mt-1">
                          {section.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {categorizedBullets[section.id]?.length || 0} 件
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddIdeaDialog(section.id)}
                        title="アイデアを追加"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
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
                              <Draggable 
                                key={bullet.id} 
                                draggableId={bullet.id} 
                                index={index}
                                isDragDisabled={editingId === bullet.id}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="group flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    {editingId === bullet.id ? (
                                      <div className="w-4 h-4" />
                                    ) : (
                                      <div
                                        {...provided.dragHandleProps}
                                        className="cursor-move"
                                      >
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                      </div>
                                    )}
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
                                          title="削除"
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
              );
            })}
              </div>
            </div>
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

      {/* アイデア追加ダイアログ */}
      <Dialog open={isAddIdeaDialogOpen} onOpenChange={setIsAddIdeaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいアイデアを追加</DialogTitle>
            <DialogDescription>
              {getSectionLabel(selectedSectionForIdea)}にアイデアを追加します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="idea-text">アイデア *</Label>
              <Input
                id="idea-text"
                placeholder="アイデアを入力してください"
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddIdea();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddIdeaDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddIdea}>
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
