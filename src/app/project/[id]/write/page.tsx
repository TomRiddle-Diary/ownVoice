"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Save, Eye, GripVertical, Trash2, Edit2, Check, X, Plus, Copy } from "lucide-react";
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
  content?: string;
}

type CategorizedBullets = { [sectionId: string]: Bullet[] };

export default function ProjectWritePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  
  const [project, setProject] = useState<Project | null>(null);
  const [structure, setStructure] = useState<CategorizedBullets>({});
  const [sections, setSections] = useState<FormatSection[]>([]);
  const [customSections, setCustomSections] = useState<FormatSection[]>([]);
  const [removedSectionIds, setRemovedSectionIds] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isAddIdeaDialogOpen, setIsAddIdeaDialogOpen] = useState(false);
  const [selectedSectionForIdea, setSelectedSectionForIdea] = useState<string>("");
  const [newIdeaText, setNewIdeaText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const allSections = [
    ...sections.filter(s => !removedSectionIds.includes(s.id)),
    ...customSections
  ];

  // セクション順序に基づいてソート
  const orderedSections = sectionOrder.length > 0
    ? sectionOrder
        .map(id => allSections.find(s => s.id === id))
        .filter((s): s is FormatSection => s !== undefined)
    : allSections;

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
    }
  }, [status, projectId]);

  const loadData = async () => {
    try {
      // プロジェクト情報を取得
      const projectResponse = await fetch(`/api/project/${projectId}`);
      if (!projectResponse.ok) {
        const errorData = await projectResponse.json();
        console.error("Project fetch error:", errorData);
        throw new Error(`プロジェクト情報取得失敗: ${errorData.error || projectResponse.status}`);
      }
      
      const projectData = await projectResponse.json();
      setProject(projectData);
      setContent(projectData.content || "");
      
      // カテゴリに基づいてフォーマットを設定
      const format = getFormatByCategory(
        projectData.category || "other", 
        projectData.targetLength || 800
      );
      setSections(format.sections);

      // 構造化されたアイデアを取得
      const structureResponse = await fetch(`/api/project/${projectId}/structure`);
      if (structureResponse.ok) {
        const structureData = await structureResponse.json();
        setStructure(structureData.structure || {});
        setCustomSections(structureData.customSections || []);
        setRemovedSectionIds(structureData.removedSectionIds || []);
        setSectionOrder(structureData.sectionOrder || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("保存に失敗しました");
      }

      alert("保存しました！");
    } catch (error) {
      console.error("Error saving:", error);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying:", error);
      alert("コピーに失敗しました");
    }
  };

  const handleRemoveIdea = async (sectionId: string, bulletId: string) => {
    if (!confirm("このアイデアを削除しますか？")) {
      return;
    }

    const updatedBullets = (structure[sectionId] || []).filter(b => b.id !== bulletId);
    const newStructure = {
      ...structure,
      [sectionId]: updatedBullets,
    };
    setStructure(newStructure);

    // サーバーに保存
    try {
      await fetch(`/api/project/${projectId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          structure: newStructure,
          customSections: customSections,
          removedSectionIds: removedSectionIds,
          sectionOrder: sectionOrder,
        }),
      });
    } catch (error) {
      console.error("Error saving structure:", error);
    }
  };

  const startEditing = (bullet: Bullet) => {
    setEditingId(bullet.id);
    setEditingText(bullet.text);
  };

  const saveEdit = async (sectionId: string) => {
    if (editingText.trim() && editingId) {
      const updatedBullets = (structure[sectionId] || []).map(b => 
        b.id === editingId ? { ...b, text: editingText.trim() } : b
      );
      const newStructure = {
        ...structure,
        [sectionId]: updatedBullets,
      };
      setStructure(newStructure);
      setEditingId(null);
      setEditingText("");

      // サーバーに保存
      try {
        await fetch(`/api/project/${projectId}/structure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            structure: newStructure,
            customSections: customSections,
            removedSectionIds: removedSectionIds,
            sectionOrder: sectionOrder,
          }),
        });
      } catch (error) {
        console.error("Error saving structure:", error);
      }
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

  const handleAddIdea = async () => {
    if (!newIdeaText.trim()) {
      alert("アイデアを入力してください");
      return;
    }

    const newBullet: Bullet = {
      id: `temp-${Date.now()}`,
      text: newIdeaText.trim(),
    };

    const updatedBullets = [...(structure[selectedSectionForIdea] || []), newBullet];
    const newStructure = {
      ...structure,
      [selectedSectionForIdea]: updatedBullets,
    };
    setStructure(newStructure);

    // サーバーに保存
    try {
      await fetch(`/api/project/${projectId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          structure: newStructure,
          customSections: customSections,
          removedSectionIds: removedSectionIds,
          sectionOrder: sectionOrder,
        }),
      });
    } catch (error) {
      console.error("Error saving structure:", error);
    }

    setNewIdeaText("");
    setIsAddIdeaDialogOpen(false);
  };

  const getSectionLabel = (sectionId: string): string => {
    const section = orderedSections.find(s => s.id === sectionId);
    return section?.label || sectionId;
  };

  // ドラッグ&ドロップ機能
  const handleDragStart = (e: React.DragEvent, text: string) => {
    e.dataTransfer.setData("text/plain", text);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // カーソル位置にテキストを挿入
    const newContent = 
      content.substring(0, start) + 
      text + 
      content.substring(end);
    
    setContent(newContent);
    
    // カーソル位置を更新
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/project/${projectId}/organize`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project?.title || "無題"}</h1>
                <p className="text-xs text-gray-500">ステップ 5/5: 文章作成</p>
              </div>
              <Badge>下書き</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "保存中..." : "保存"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Eye className="w-4 h-4 mr-2" />
                  ダッシュボード
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左パネル: 構造と参考情報 */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">✨</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">ドラッグ&ドロップで簡単作成</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      各アイデアをドラッグして右の編集エリアにドロップすると、カーソル位置に自動挿入されます
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <GripVertical className="w-3 h-3" />
                      <span>アイコンをドラッグしてください</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {orderedSections.map((section) => {
              const bullets = structure[section.id] || [];
              if (bullets.length === 0) return null;

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-md">{section.label}</CardTitle>
                        {section.description && (
                          <CardDescription className="text-xs">
                            {section.description}
                          </CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddIdeaDialog(section.id)}
                        title="アイデアを追加"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {bullets.map((bullet) => (
                        <li 
                          key={bullet.id} 
                          className={`flex items-center gap-2 text-sm p-3 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all group ${
                            editingId !== bullet.id ? "cursor-move" : ""
                          }`}
                          draggable={editingId !== bullet.id}
                          onDragStart={(e) => editingId !== bullet.id && handleDragStart(e, bullet.text)}
                          title={editingId !== bullet.id ? "ドラッグして右のエディタにドロップできます" : ""}
                        >
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
                              <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                              <span className="text-blue-500">•</span>
                              <span className="flex-1">{bullet.text}</span>
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
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 右パネル: エディター＆フィードバック */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✍️ 下書き</CardTitle>
                <CardDescription>
                  左のアイデアをドラッグ&ドロップ、または自由に文章を作成してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="ここに下書きを書き始めます...&#10;&#10;💡 左のアイデアをドラッグしてここにドロップできます"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="h-[calc(100vh-350px)] mb-4 font-sans resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "保存中..." : "保存"}
                  </Button>
                  <Button onClick={handleCopy} disabled={!content} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    {isCopied ? "コピー済み" : "コピー"}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {content.length} 文字
                </div>
              </CardContent>
            </Card>
          </div>
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
