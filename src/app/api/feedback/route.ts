import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, structure } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // ルールベースのフィードバック生成（無料）
    const feedback = generateRuleBasedFeedback(content, structure);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}

function generateRuleBasedFeedback(content: string, structure: any): string {
  const feedbackPoints: string[] = [];
  
  // 1. 文字数チェック
  const charCount = content.length;
  if (charCount < 100) {
    feedbackPoints.push("📝 文章が短すぎます。各セクション（主張・理由・例・結論）をもっと詳しく書いてみましょう。");
  } else if (charCount > 2000) {
    feedbackPoints.push("✂️ 文章が長すぎる可能性があります。要点を絞って簡潔に書き直すことを検討してください。");
  } else {
    feedbackPoints.push(`✅ 文字数: ${charCount}文字（適切な長さです）`);
  }

  // 2. PREP構造のチェック
  const hasPoint = structure.point && structure.point.length > 0;
  const hasReason = structure.reason && structure.reason.length > 0;
  const hasExample = structure.example && structure.example.length > 0;
  const hasPointAgain = structure.point_again && structure.point_again.length > 0;

  if (!hasPoint) {
    feedbackPoints.push("⚠️ 「主張」セクションが不足しています。最初に明確な主張を述べましょう。");
  }
  if (!hasReason) {
    feedbackPoints.push("⚠️ 「理由」セクションが不足しています。主張を裏付ける理由を追加しましょう。");
  }
  if (!hasExample) {
    feedbackPoints.push("⚠️ 「例」セクションが不足しています。具体例やデータで説得力を高めましょう。");
  }
  if (!hasPointAgain) {
    feedbackPoints.push("⚠️ 「結論」セクションが不足しています。最後にもう一度主張をまとめましょう。");
  }

  if (hasPoint && hasReason && hasExample && hasPointAgain) {
    feedbackPoints.push("✅ PREP構造がしっかり守られています！");
  }

  // 3. 基本的な文法チェック
  const sentences = content.split(/[。！？]/);
  const longSentences = sentences.filter(s => s.length > 100);
  if (longSentences.length > 0) {
    feedbackPoints.push("📖 一部の文が長すぎます。読みやすくするために、短い文に分割することを検討してください。");
  }

  // 4. 接続詞のチェック
  const hasConnectors = /なぜなら|そのため|したがって|例えば|具体的には|つまり|このように/.test(content);
  if (!hasConnectors) {
    feedbackPoints.push("🔗 接続詞（なぜなら、例えば、したがって等）を使うと、論理の流れがより明確になります。");
  } else {
    feedbackPoints.push("✅ 接続詞が適切に使われています。論理の流れが分かりやすいです。");
  }

  // 5. 具体性のチェック
  const hasNumbers = /\d+/.test(content);
  const hasQuotes = /「|」/.test(content);
  if (!hasNumbers && !hasQuotes) {
    feedbackPoints.push("💡 数字や引用を追加すると、説得力が増します。");
  }

  // 6. 反復のチェック
  const words = content.split(/[\s、。！？]/);
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.entries(wordFreq).filter(([_, count]) => count > 3);
  if (repeatedWords.length > 0) {
    const topRepeated = repeatedWords.sort((a, b) => b[1] - a[1]).slice(0, 3);
    feedbackPoints.push(`🔄 同じ言葉の繰り返しが多いです: ${topRepeated.map(([word, count]) => `「${word}」(${count}回)`).join(', ')}。類義語を使って表現を変えてみましょう。`);
  }

  // 7. 段落のチェック
  const paragraphs = content.split(/\n\n+/);
  if (paragraphs.length === 1 && charCount > 300) {
    feedbackPoints.push("📄 段落を分けると読みやすくなります。話題が変わるところで改行を入れましょう。");
  }

  // 8. 構造とアイデアの一貫性
  const ideaTexts = [
    ...(structure.point || []).map((b: any) => b.text),
    ...(structure.reason || []).map((b: any) => b.text),
    ...(structure.example || []).map((b: any) => b.text),
    ...(structure.point_again || []).map((b: any) => b.text),
  ];
  
  const ideasUsed = ideaTexts.filter((idea: string) => 
    content.includes(idea) || content.includes(idea.substring(0, 10))
  );
  
  const usageRate = ideaTexts.length > 0 ? (ideasUsed.length / ideaTexts.length * 100) : 100;
  if (usageRate < 50) {
    feedbackPoints.push(`💭 整理したアイデアの${Math.round(usageRate)}%しか使われていません。もっと活用しましょう。`);
  } else {
    feedbackPoints.push(`✅ 整理したアイデアが効果的に活用されています（${Math.round(usageRate)}%）。`);
  }

  // フィードバックのまとめ
  return `【文章フィードバック】\n\n${feedbackPoints.join('\n\n')}\n\n---\n💪 引き続き頑張りましょう！PREP法を意識して、論理的で説得力のある文章を目指してください。`;
}
