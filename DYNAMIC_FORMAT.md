# 動的フォーマット機能 - 実装ドキュメント

## 📋 概要

文章の目標文字数に応じて、最適な構成フォーマットを動的に提案・適用する機能を実装しました。

## ✨ 実装した機能

### 1. 文字数入力UI
**場所**: ダッシュボード（新規プロジェクト作成フォーム）

- 目標文字数の入力フィールド（50〜5000字）
- リアルタイムフォーマットプレビュー
- 入力値のバリデーション

### 2. 文字数に応じたフォーマット決定ロジック
**場所**: `/src/lib/format-utils.ts`

文字数の範囲に応じて、4つの異なるフォーマットを自動選択：

#### 📌 超短文（〜200字）: シンプル構成
- **構成**: 結論のみ
- **用途**: SNS投稿、短いコメントなど
- **セクション**: 1つ

#### 📌 短文（201〜400字）: 2段階構成
- **構成**: 結論 → 理由
- **用途**: 簡潔な説明、短いレポートなど
- **セクション**: 2つ
- **配分**: 結論40% / 理由60%

#### 📌 中文（401〜800字）: 3段階構成
- **構成**: 結論 → 理由 → 具体例
- **用途**: ブログ記事、提案書の要約など
- **セクション**: 3つ
- **配分**: 結論25% / 理由35% / 具体例40%

#### 📌 長文（801字〜）: PREP法（4段階構成）
- **構成**: Point（結論・開始） → Reason（理由） → Example（具体例） → Point（結論・終わり）
- **用途**: 論理的な記事、詳細なレポートなど
- **セクション**: 4つ
- **配分**: Point20% / Reason30% / Example30% / Point20%

### 3. 動的な入力フォーム生成
**場所**: エディターページ（`/editor/[id]`）

- 選択されたフォーマットに基づいて、セクションを動的に生成
- 各セクションに推奨文字数を表示
- ドラッグ&ドロップで柔軟にコンテンツを配置

## 🛠️ 技術的な実装詳細

### 新規ファイル

#### `/src/lib/format-utils.ts`
```typescript
// フォーマット決定のコア関数
export function getFormatByTargetLength(targetLength: number): WritingFormat

// 型定義
export interface FormatSection {
  id: string;
  label: string;
  description: string;
  color: string;
  placeholder: string;
  recommendedLength: number;
}

export interface WritingFormat {
  name: string;
  description: string;
  sections: FormatSection[];
  totalCharacters: number;
}
```

### 変更したファイル

#### `/src/app/dashboard/page.tsx`
**追加した機能**:
- 目標文字数の状態管理（`targetLength`）
- フォーマットプレビュー表示
- プロジェクト作成時に目標文字数を渡す

**主な変更**:
```typescript
// Post型に targetLength を追加
interface Post {
  id: string;
  title: string;
  category: string;
  targetLength: number; // 新規追加
  createdAt: Date;
}

// 目標文字数の入力フィールド
<Input 
  type="number"
  value={targetLength}
  onChange={(e) => setTargetLength(Number(e.target.value))}
  min={50}
  max={5000}
/>

// リアルタイムプレビュー
{targetLength >= 50 && targetLength <= 5000 && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p>{getFormatPreview(targetLength)}</p>
  </div>
)}
```

#### `/src/app/editor/[id]/page.tsx`
**追加した機能**:
- URLパラメータから目標文字数を取得
- フォーマットに基づいて動的にセクションを生成
- 各セクションに推奨文字数を表示
- フォーマット情報カードの表示

**主な変更**:
```typescript
// 固定のPREP構造から動的構造へ移行
type DynamicStructure = { [sectionId: string]: Bullet[] };

// URLパラメータから目標文字数を取得
const searchParams = useSearchParams();
const targetLength = Number(searchParams.get("targetLength")) || 800;

// フォーマットを決定
const [format, setFormat] = useState<WritingFormat>(
  getFormatByTargetLength(targetLength)
);

// 動的にセクションを初期化
const initializeDynamicStructure = (): DynamicStructure => {
  const structure: DynamicStructure = {};
  sections.forEach(section => {
    structure[section.id] = [];
  });
  return structure;
};

// セクションを動的にレンダリング
{sections.map((section) => (
  <div key={section.id}>
    <label>{section.label} (推奨: {section.recommendedLength}字)</label>
    <Droppable droppableId={section.id}>
      {/* ドラッグ&ドロップエリア */}
    </Droppable>
  </div>
))}
```

## 🎯 使い方

### ユーザーの視点

1. **プロジェクト作成時**:
   - タイトルとカテゴリを入力
   - 目標文字数を入力（例: 400字）
   - 推奨フォーマットがリアルタイムで表示される
   - 「作成して開始」をクリック

2. **エディター画面**:
   - 選択されたフォーマット（例: 2段階構成）が表示される
   - 各セクション（結論、理由）の推奨文字数が表示される
   - アイデアメモをドラッグ&ドロップで各セクションに配置
   - 各セクションに沿って文章を執筆

### 開発者の視点

新しいフォーマットを追加する場合:

```typescript
// format-utils.ts に新しい条件を追加
export function getFormatByTargetLength(targetLength: number): WritingFormat {
  if (targetLength <= 150) {
    return {
      name: "超シンプル構成",
      description: "一言で伝える",
      sections: [
        {
          id: "summary",
          label: "要約",
          description: "核心だけを伝える",
          color: "bg-red-100 border-red-300",
          placeholder: "一文で要約...",
          recommendedLength: targetLength,
        },
      ],
      totalCharacters: targetLength,
    };
  }
  // ... 既存の条件
}
```

## 📊 データフロー

```
1. ダッシュボード
   ↓ ユーザーが目標文字数を入力
   ↓ getFormatByTargetLength() でフォーマットを決定
   ↓ プレビュー表示

2. プロジェクト作成
   ↓ 目標文字数をURLパラメータとしてエディターに渡す
   ↓ /editor/[id]?targetLength=400

3. エディターページ
   ↓ URLから targetLength を取得
   ↓ getFormatByTargetLength(targetLength) でフォーマットを決定
   ↓ フォーマットに基づいてセクションを動的生成
   ↓ ユーザーが各セクションに沿って執筆
```

## 🎨 UIの特徴

### フォーマット情報カード
エディター上部に表示される情報パネル：
- フォーマット名（例: "2段階構成"）
- フォーマットの説明
- 各セクションの推奨文字数をバッジで表示

### セクションごとの推奨文字数表示
各セクションのラベルに推奨文字数を表示：
```
結論（推奨: 160字）
理由（推奨: 240字）
```

## 🔄 後方互換性

- 既存のサンプルプロジェクト（targetLengthなし）は、デフォルト800字として扱われ、PREP法が適用される
- 古いプロジェクトも正常に動作する

## 🚀 今後の拡張可能性

1. **カスタムフォーマット**: ユーザーが独自のフォーマットを作成
2. **文字数カウンター**: リアルタイムで各セクションの文字数を表示
3. **フォーマット変更**: プロジェクト作成後もフォーマットを変更可能に
4. **テンプレート**: よく使うフォーマットをテンプレートとして保存
5. **AI提案**: 内容に応じて最適な文字数を提案

## 📝 注意事項

- 目標文字数の範囲は50〜5000字に制限
- フォーマットは文字数で自動決定されるため、ユーザーが手動で選択することはできない（今後の拡張で可能に）
- セクションの推奨文字数は目安であり、厳密に守る必要はない
