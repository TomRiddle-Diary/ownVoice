import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";

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

    const { bullets, sections } = await request.json();

    if (!bullets || bullets.length === 0) {
      return NextResponse.json(
        { error: "アイデアがありません" },
        { status: 400 }
      );
    }

    // OpenAI APIキーをチェック
    const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                         process.env.OPENAI_API_KEY !== "sk-your-api-key-here" &&
                         process.env.OPENAI_API_KEY.startsWith("sk-");

    if (!hasOpenAIKey) {
      // APIキーがない場合は、キーワードベースの簡易分類を行う
      const categorizedBullets: any = {};
      sections.forEach((section: any) => {
        categorizedBullets[section.id] = [];
      });
      categorizedBullets['uncategorized'] = [];

      // キーワードマッピング
      const keywordMapping: { [key: string]: string[] } = {
        point: ['主張', '結論', 'ポイント', '重要', '要点', '最も', 'べき', 'したい', '目指す', '実現'],
        reason: ['理由', 'なぜなら', 'から', 'ため', '背景', '課題', '問題', '必要'],
        example: ['例えば', '実際', '具体的', '経験', 'とき', '場合', 'ケース', 'した', '取り組み'],
        point_again: ['だから', 'よって', 'そのため', 'したがって', '以上', 'できる', '期待', '貢献']
      };

      // 各bulletをキーワードでスコアリング
      bullets.forEach((bullet: any) => {
        const text = bullet.text.toLowerCase();
        let bestSection = 'uncategorized';
        let bestScore = 0;

        sections.forEach((section: any) => {
          const keywords = keywordMapping[section.id] || [];
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

        if (categorizedBullets[bestSection]) {
          categorizedBullets[bestSection].push(bullet);
        } else {
          categorizedBullets['uncategorized'].push(bullet);
        }
      });

      return NextResponse.json({ 
        categorizedBullets,
        message: "キーワードベースで自動分類しました。必要に応じて調整してください。"
      });
    }

    // OpenAI APIを使ってカテゴライズ
    const prompt = `以下のアイデアを、指定された文章構造のセクションに分類してください。

【アイデア】
${bullets.map((b: any, i: number) => `${i + 1}. ${b.text}`).join('\n')}

【文章構造】
${sections.map((s: any, i: number) => `${s.id}: ${s.label} - ${s.description || ''}`).join('\n')}

各アイデアをどのセクションに配置すべきか、JSON形式で返してください。
形式: { "categorized": { "section_id": [bullet_ids...], ... } }

例:
{
  "categorized": {
    "point": ["1", "2"],
    "reason": ["3"],
    "example": ["4"],
    "point_again": ["5"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは文章構成の専門家です。アイデアを適切なセクションに分類してください。",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    const categorized = result.categorized || {};

    // bullet IDから実際のbulletオブジェクトにマッピング
    const categorizedBullets: any = {};
    
    // 各セクションを初期化
    sections.forEach((section: any) => {
      categorizedBullets[section.id] = [];
    });
    categorizedBullets['uncategorized'] = [];

    // 分類されたbulletsを配置
    const assignedBulletIds = new Set<string>();
    
    Object.keys(categorized).forEach(sectionId => {
      const bulletIndices = categorized[sectionId];
      if (Array.isArray(bulletIndices)) {
        bulletIndices.forEach(indexStr => {
          const index = parseInt(indexStr) - 1;
          if (index >= 0 && index < bullets.length) {
            categorizedBullets[sectionId]?.push(bullets[index]);
            assignedBulletIds.add(bullets[index].id);
          }
        });
      }
    });

    // 分類されなかったbulletsを未分類に追加
    bullets.forEach((bullet: any) => {
      if (!assignedBulletIds.has(bullet.id)) {
        categorizedBullets['uncategorized'].push(bullet);
      }
    });

    return NextResponse.json({ categorizedBullets });
  } catch (error) {
    console.error("Categorize error:", error);
    return NextResponse.json(
      { error: "カテゴライズに失敗しました" },
      { status: 500 }
    );
  }
}
