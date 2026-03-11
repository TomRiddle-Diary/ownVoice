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

    return NextResponse.json({ bullets: post.bullets });
  } catch (error) {
    console.error("Get bullets error:", error);
    return NextResponse.json(
      { error: "アイデアの取得に失敗しました" },
      { status: 500 }
    );
  }
}

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
    const { bullets } = await request.json();

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

    // 既存のbulletsを削除
    await prisma.bullet.deleteMany({
      where: {
        postId: id,
      },
    });

    // 新しいbulletsを作成
    const createdBullets = await Promise.all(
      bullets.map((bullet: any, index: number) =>
        prisma.bullet.create({
          data: {
            text: bullet.text,
            order: index,
            postId: id,
          },
        })
      )
    );

    return NextResponse.json({ bullets: createdBullets });
  } catch (error) {
    console.error("Save bullets error:", error);
    return NextResponse.json(
      { error: "アイデアの保存に失敗しました" },
      { status: 500 }
    );
  }
}
