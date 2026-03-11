import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { title, category, targetLength } = await request.json();

    const post = await prisma.post.create({
      data: {
        title: title || "無題のプロジェクト",
        category: category || "other",
        userId: session.user.id,
        content: "",
      },
    });

    return NextResponse.json({
      id: post.id,
      title: post.title,
      category: post.category,
      targetLength: targetLength || 800,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "プロジェクトの作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        bullets: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "プロジェクトの取得に失敗しました" },
      { status: 500 }
    );
  }
}
