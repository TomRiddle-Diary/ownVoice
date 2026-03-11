import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      include: {
        bullets: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "プロジェクトが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      category: post.category,
      content: post.content,
      structure: post.structure,
      bullets: post.bullets,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "プロジェクトの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, content, structure } = await request.json();

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

    // 更新
    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(structure !== undefined && { structure }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "プロジェクトの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 削除（Cascadeでbulletsも削除される）
    await prisma.post.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "プロジェクトの削除に失敗しました" },
      { status: 500 }
    );
  }
}
