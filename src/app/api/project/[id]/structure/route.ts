import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { structure, customSections, removedSectionIds, sectionOrder } = await request.json();

    // プロジェクトが存在し、ユーザーが所有していることを確認
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    // structureフィールドを更新（customSections、removedSectionIds、sectionOrderも含める）
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        structure: {
          categorizedBullets: structure,
          customSections: customSections || [],
          removedSectionIds: removedSectionIds || [],
          sectionOrder: sectionOrder || [],
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save structure error:", error);
    return NextResponse.json(
      { error: "構造の保存に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    // 後方互換性のため、既存の形式と新しい形式の両方に対応
    const structureData = post.structure as any;
    
    // 新しい形式の場合
    if (structureData && typeof structureData === 'object' && 'categorizedBullets' in structureData) {
      return NextResponse.json({ 
        structure: structureData.categorizedBullets,
        customSections: structureData.customSections || [],
        removedSectionIds: structureData.removedSectionIds || [],
        sectionOrder: structureData.sectionOrder || [],
      });
    }
    
    // 既存の形式の場合（後方互換性）
    return NextResponse.json({ 
      structure: structureData || {},
      customSections: [],
      removedSectionIds: [],
      sectionOrder: [],
    });
  } catch (error) {
    console.error("Get structure error:", error);
    return NextResponse.json(
      { error: "構造の取得に失敗しました" },
      { status: 500 }
    );
  }
}
