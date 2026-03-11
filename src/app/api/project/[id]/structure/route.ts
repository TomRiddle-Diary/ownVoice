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
    const { structure } = await request.json();

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

    // structureフィールドを更新
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        structure: structure,
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

    return NextResponse.json({ structure: post.structure });
  } catch (error) {
    console.error("Get structure error:", error);
    return NextResponse.json(
      { error: "構造の取得に失敗しました" },
      { status: 500 }
    );
  }
}
