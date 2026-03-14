import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFormatByCategory } from "@/lib/format-utils";

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

    const { bullets, category, targetLength } = await request.json();

    if (!bullets || bullets.length === 0) {
      return NextResponse.json(
        { error: "アイデアがありません" },
        { status: 400 }
      );
    }

    // カテゴリに基づいてフォーマットを取得
    const format = getFormatByCategory(category || "other", targetLength || 800);
    const sections = format.sections;

    // キーワードベースの自動分類
    const categorizedBullets: any = {};
    sections.forEach((section) => {
      categorizedBullets[section.id] = [];
    });

    // 各bulletをキーワードでスコアリング
    bullets.forEach((bullet: any) => {
      const text = bullet.text.toLowerCase();
      let bestSection = sections[0].id; // デフォルトは最初のセクション
      let bestScore = 0;

      sections.forEach((section) => {
        const keywords = section.keywords || [];
        let score = 0;
        
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            score += 1;
          }
        });

        if (score > bestScore) {
          bestScore = score;
          bestSection = section.id;
        }
      });

      // スコアが0の場合は、位置に基づいて配置
      if (bestScore === 0 && sections.length > 0) {
        const bulletIndex = bullets.indexOf(bullet);
        const sectionIndex = Math.floor((bulletIndex / bullets.length) * sections.length);
        bestSection = sections[Math.min(sectionIndex, sections.length - 1)].id;
      }

      categorizedBullets[bestSection].push(bullet);
    });

    return NextResponse.json({ 
      categorizedBullets,
      message: "キーワードベースで自動分類しました。ドラッグ&ドロップで調整できます。"
    });
  } catch (error) {
    console.error("Error categorizing bullets:", error);
    return NextResponse.json(
      { error: "分類に失敗しました" },
      { status: 500 }
    );
  }
}
