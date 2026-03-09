import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { content, structure } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const structureText = Object.entries(structure)
      .map(([key, bullets]: [string, any]) => {
        if (bullets.length === 0) return "";
        return `${key.toUpperCase()}: ${bullets.map((b: any) => b.text).join("; ")}`;
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a writing coach helping users improve their logical writing skills using the PREP method (Point, Reason, Example, Point).

The user has structured their ideas using the PREP framework:
${structureText}

Their draft:
${content}

Please provide constructive feedback on:
1. Grammar and typos
2. Logical consistency (Does the Example support the Reason? Does it align with the PREP structure?)
3. Completeness based on the PREP framework (Are all sections adequately developed?)
4. Clarity and coherence

Keep your feedback concise, specific, and actionable. Format it in a friendly tone.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful writing coach focused on improving logical writing through the PREP method.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const feedback = completion.choices[0]?.message?.content || "No feedback generated.";

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
