// カテゴリ別の文章フォーマット定義

export interface FormatSection {
  id: string;
  label: string;
  description: string;
  color: string;
  placeholder: string;
  recommendedLength: number; // 推奨文字数
  keywords: string[]; // 自動分類用キーワード
}

export interface WritingFormat {
  name: string;
  description: string;
  sections: FormatSection[];
  totalCharacters: number;
}

/**
 * カテゴリに応じた文章フォーマットを取得
 */
export function getFormatByCategory(category: string, targetLength: number): WritingFormat {
  const lengthPerSection = Math.floor(targetLength / 5);
  
  switch (category) {
    case "job-hunting":
      return {
        name: "就活用フォーマット",
        description: "就職活動に最適な自己PR・志望動機構成",
        sections: [
          {
            id: "conclusion",
            label: "結論（強み・志望理由）",
            description: "あなたの強みや志望理由を明確に",
            color: "bg-blue-100 border-blue-300",
            placeholder: "私の強みは...、貴社を志望する理由は...",
            recommendedLength: lengthPerSection,
            keywords: ["強み", "志望", "選んだ", "働きたい", "貢献", "魅力", "入社", "目指す"],
          },
          {
            id: "background",
            label: "背景・課題",
            description: "どんな状況や課題があったか",
            color: "bg-yellow-100 border-yellow-300",
            placeholder: "当時の状況や直面した課題...",
            recommendedLength: lengthPerSection,
            keywords: ["背景", "課題", "問題", "状況", "困難", "直面", "必要", "求められ"],
          },
          {
            id: "action",
            label: "行動・工夫",
            description: "どのように取り組んだか",
            color: "bg-green-100 border-green-300",
            placeholder: "具体的に行った行動や工夫...",
            recommendedLength: lengthPerSection,
            keywords: ["取り組", "工夫", "実践", "努力", "行動", "実施", "継続", "徹底", "挑戦"],
          },
          {
            id: "result",
            label: "結果・学び",
            description: "どんな成果や学びがあったか",
            color: "bg-purple-100 border-purple-300",
            placeholder: "得られた結果や学び...",
            recommendedLength: lengthPerSection,
            keywords: ["結果", "成果", "達成", "学び", "習得", "向上", "改善", "獲得"],
          },
          {
            id: "vision",
            label: "ビジョン（入社後の貢献）",
            description: "入社後にどう活躍したいか",
            color: "bg-indigo-100 border-indigo-300",
            placeholder: "入社後の目標や貢献したいこと...",
            recommendedLength: lengthPerSection,
            keywords: ["入社後", "貢献", "活躍", "実現", "目標", "将来", "キャリア", "活かし"],
          },
        ],
        totalCharacters: targetLength,
      };
      
    case "academic":
      return {
        name: "論文・レポート用フォーマット",
        description: "学術的な論文やレポートに最適な構成",
        sections: [
          {
            id: "background",
            label: "背景・問題提起",
            description: "研究の背景と問題意識",
            color: "bg-yellow-100 border-yellow-300",
            placeholder: "研究の背景や解決すべき問題...",
            recommendedLength: lengthPerSection,
            keywords: ["背景", "問題", "課題", "現状", "従来", "これまで", "指摘", "不足"],
          },
          {
            id: "hypothesis",
            label: "仮説・焦点",
            description: "本研究の仮説や焦点",
            color: "bg-blue-100 border-blue-300",
            placeholder: "本研究で検証する仮説や焦点...",
            recommendedLength: lengthPerSection,
            keywords: ["仮説", "焦点", "着目", "検証", "明らかに", "探る", "考察", "目的"],
          },
          {
            id: "analysis",
            label: "分析・具体例",
            description: "データ分析や具体的な事例",
            color: "bg-green-100 border-green-300",
            placeholder: "分析結果や具体的な事例...",
            recommendedLength: lengthPerSection,
            keywords: ["分析", "調査", "事例", "データ", "結果", "観察", "実験", "比較", "検討"],
          },
          {
            id: "conclusion",
            label: "結論",
            description: "研究から得られた結論",
            color: "bg-purple-100 border-purple-300",
            placeholder: "研究の結論...",
            recommendedLength: lengthPerSection,
            keywords: ["結論", "示唆", "明らか", "判明", "証明", "導出", "見出", "至った"],
          },
          {
            id: "future",
            label: "展望・今後の課題",
            description: "今後の展望や残された課題",
            color: "bg-indigo-100 border-indigo-300",
            placeholder: "今後の展望や残された課題...",
            recommendedLength: lengthPerSection,
            keywords: ["今後", "将来", "展望", "課題", "残され", "さらに", "必要", "期待"],
          },
        ],
        totalCharacters: targetLength,
      };
      
    case "blog":
      return {
        name: "ブログ記事用フォーマット",
        description: "読者を惹きつけるブログ記事構成",
        sections: [
          {
            id: "introduction",
            label: "導入・共感",
            description: "読者の共感を得る導入",
            color: "bg-pink-100 border-pink-300",
            placeholder: "読者が共感できる問いかけや状況...",
            recommendedLength: lengthPerSection,
            keywords: ["悩み", "困っ", "知りたい", "気になる", "よくある", "こんな経験", "ありませんか"],
          },
          {
            id: "value",
            label: "結論（本記事の価値）",
            description: "この記事で得られる価値",
            color: "bg-blue-100 border-blue-300",
            placeholder: "この記事で分かることや解決できること...",
            recommendedLength: lengthPerSection,
            keywords: ["解説", "紹介", "方法", "コツ", "ポイント", "秘訣", "できます", "わかります"],
          },
          {
            id: "mechanism",
            label: "理由・メカニズム",
            description: "なぜそうなるのか、仕組みの説明",
            color: "bg-yellow-100 border-yellow-300",
            placeholder: "その理由や仕組み...",
            recommendedLength: lengthPerSection,
            keywords: ["理由", "なぜなら", "仕組み", "原理", "メカニズム", "から", "ため", "鍵"],
          },
          {
            id: "practice",
            label: "具体例・実践",
            description: "具体的な実践方法や手順",
            color: "bg-green-100 border-green-300",
            placeholder: "具体的な手順や実例...",
            recommendedLength: lengthPerSection,
            keywords: ["実際", "例えば", "具体的", "手順", "ステップ", "やり方", "使って", "試し"],
          },
          {
            id: "summary",
            label: "まとめ・行動喚起",
            description: "まとめと次のアクション",
            color: "bg-purple-100 border-purple-300",
            placeholder: "まとめと読者への行動提案...",
            recommendedLength: lengthPerSection,
            keywords: ["まとめ", "ぜひ", "始めて", "試して", "やってみ", "おすすめ", "できる", "しましょう"],
          },
        ],
        totalCharacters: targetLength,
      };
      
    case "other":
    default:
      return {
        name: "汎用フォーマット",
        description: "様々な用途に対応できる汎用的な構成",
        sections: [
          {
            id: "purpose",
            label: "目的・前提",
            description: "文書の目的や前提条件",
            color: "bg-gray-100 border-gray-300",
            placeholder: "この文書の目的や前提...",
            recommendedLength: lengthPerSection,
            keywords: ["目的", "前提", "背景", "経緯", "概要", "について"],
          },
          {
            id: "requirement",
            label: "結論（要件）",
            description: "結論や主要な要件",
            color: "bg-blue-100 border-blue-300",
            placeholder: "結論や要件...",
            recommendedLength: lengthPerSection,
            keywords: ["結論", "要件", "必要", "求める", "提案", "方針", "べき"],
          },
          {
            id: "reason",
            label: "理由・経緯",
            description: "そう判断した理由や経緯",
            color: "bg-yellow-100 border-yellow-300",
            placeholder: "理由や経緯...",
            recommendedLength: lengthPerSection,
            keywords: ["理由", "経緯", "なぜなら", "から", "ため", "背景", "考慮"],
          },
          {
            id: "details",
            label: "詳細・データ",
            description: "詳細な情報やデータ",
            color: "bg-green-100 border-green-300",
            placeholder: "詳細情報やデータ...",
            recommendedLength: lengthPerSection,
            keywords: ["詳細", "データ", "情報", "具体的", "内容", "事項", "項目"],
          },
          {
            id: "concerns",
            label: "懸念点・ネクストアクション",
            description: "懸念事項と次のステップ",
            color: "bg-red-100 border-red-300",
            placeholder: "懸念点や今後のアクション...",
            recommendedLength: lengthPerSection,
            keywords: ["懸念", "課題", "リスク", "今後", "次の", "アクション", "対応", "検討"],
          },
        ],
        totalCharacters: targetLength,
      };
  }
}

/**
 * 目標文字数に応じて最適な文章フォーマットを決定（後方互換性のため残す）
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
          keywords: [],
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
          keywords: [],
        },
        {
          id: "reason",
          label: "理由",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.6),
          keywords: [],
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
          keywords: [],
        },
        {
          id: "reason",
          label: "理由",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を詳しく説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.35),
          keywords: [],
        },
        {
          id: "example",
          label: "具体例",
          description: "理由を裏付ける事例やデータ",
          color: "bg-yellow-100 border-yellow-300",
          placeholder: "具体的な例を挙げましょう...",
          recommendedLength: Math.floor(targetLength * 0.4),
          keywords: [],
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
          keywords: [],
        },
        {
          id: "reason",
          label: "Reason（理由）",
          description: "なぜその結論に至るのか",
          color: "bg-green-100 border-green-300",
          placeholder: "理由を詳しく説明しましょう...",
          recommendedLength: Math.floor(targetLength * 0.3),
          keywords: [],
        },
        {
          id: "example",
          label: "Example（具体例）",
          description: "理由を裏付ける具体的な事例",
          color: "bg-yellow-100 border-yellow-300",
          placeholder: "具体的な例やデータを示しましょう...",
          recommendedLength: Math.floor(targetLength * 0.3),
          keywords: [],
        },
        {
          id: "point2",
          label: "Point（結論・終わり）",
          description: "最後に結論を強調する",
          color: "bg-purple-100 border-purple-300",
          placeholder: "結論を再度強調しましょう...",
          recommendedLength: Math.floor(targetLength * 0.2),
          keywords: [],
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
