// 文字数に応じたフォーマットを決定するユーティリティ

export interface FormatSection {
  id: string;
  label: string;
  description: string;
  color: string;
  placeholder: string;
  recommendedLength: number; // 推奨文字数
}

export interface WritingFormat {
  name: string;
  description: string;
  sections: FormatSection[];
  totalCharacters: number;
}

/**
 * 目標文字数に応じて最適な文章フォーマットを決定
 */
export function getFormatByTargetLength(targetLength: number): WritingFormat {
  if (targetLength <= 200) {
    // 超短文: 結論のみ
    return {
      name: "シンプル構成",
      description: "短い文章に最適な1段階構成",
      sections: [
        {
          id: "conclusion",
          label: "結論",
          description: "伝えたいメッセージを簡潔に",
          color: "bg-blue-100 border-blue-300",
          placeholder: "結論を簡潔に書きましょう...",
          recommendedLength: targetLength,
        },
      ],
      totalCharacters: targetLength,
    };
  } else if (targetLength <= 400) {
    // 短文: 結論 + 理由
    return {
      name: "2段階構成",
      description: "結論と理由で構成するシンプルな形式",
      sections: [
        {
          id: "conclusion",
          label: "結論",
          description: "伝えたいメッセージ",
          color: "bg-blue-100 border-blue-300",
          placeholder: "結論を明確に述べましょう...",
          recommendedLength: Math.floor(targetLength * 0.4),
        },
        {
          id: "reason",
          label: "理由",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.6),
        },
      ],
      totalCharacters: targetLength,
    };
  } else if (targetLength <= 800) {
    // 中文: 結論 + 理由 + 具体例
    return {
      name: "3段階構成",
      description: "結論・理由・具体例で説得力を高める形式",
      sections: [
        {
          id: "conclusion",
          label: "結論",
          description: "伝えたいメッセージ",
          color: "bg-blue-100 border-blue-300",
          placeholder: "結論を明確に述べましょう...",
          recommendedLength: Math.floor(targetLength * 0.25),
        },
        {
          id: "reason",
          label: "理由",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を詳しく説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.35),
        },
        {
          id: "example",
          label: "具体例",
          description: "理由を裏付ける事例やデータ",
          color: "bg-yellow-100 border-yellow-300",
          placeholder: "具体的な例を挙げましょう...",
          recommendedLength: Math.floor(targetLength * 0.4),
        },
      ],
      totalCharacters: targetLength,
    };
  } else {
    // 長文: PREP法（結論 + 理由 + 具体例 + 結論）
    return {
      name: "PREP法（4段階構成）",
      description: "論理的で説得力のある文章に最適な形式",
      sections: [
        {
          id: "point1",
          label: "Point（結論・開始）",
          description: "最初に結論を述べる",
          color: "bg-blue-100 border-blue-300",
          placeholder: "まず結論を明確に述べましょう...",
          recommendedLength: Math.floor(targetLength * 0.2),
        },
        {
          id: "reason",
          label: "Reason（理由）",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を詳しく説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.3),
        },
        {
          id: "example",
          label: "Example（具体例）",
          description: "理由を裏付ける具体的な事例",
          color: "bg-yellow-100 border-yellow-300",
          placeholder: "具体的な例やデータを示しましょう...",
          recommendedLength: Math.floor(targetLength * 0.3),
        },
        {
          id: "point2",
          label: "Point（結論・終わり）",
          description: "最後に結論を強調する",
          color: "bg-purple-100 border-purple-300",
          placeholder: "結論を再度強調しましょう...",
          recommendedLength: Math.floor(targetLength * 0.2),
        },
      ],
      totalCharacters: targetLength,
    };
  }
}

/**
 * フォーマット名の一覧を取得（プレビュー用）
 */
export function getFormatPreview(targetLength: number): string {
  const format = getFormatByTargetLength(targetLength);
  return `${format.name}（${format.sections.map(s => s.label).join(" → ")}）`;
}

/**
 * 各セクションの推奨文字数を計算
 */
export function calculateSectionLengths(
  targetLength: number,
  sections: FormatSection[]
): { [sectionId: string]: number } {
  const result: { [sectionId: string]: number } = {};
  sections.forEach((section) => {
    result[section.id] = section.recommendedLength;
  });
  return result;
}
