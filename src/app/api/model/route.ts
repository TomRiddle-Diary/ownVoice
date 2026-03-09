import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { structure, category } = await request.json();

    if (!structure) {
      return NextResponse.json(
        { error: "Structure is required" },
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

    const prompt = `You are a professional writer demonstrating the PREP method (Point, Reason, Example, Point).

Category: ${category || "General"}

Given these structured ideas:
${structureText}

Write an ideal, well-crafted paragraph that:
1. Follows the PREP structure perfectly
2. Shows clear logical flow
3. Uses professional language
4. Demonstrates how to connect ideas smoothly
5. Serves as a learning example (not just a template to copy)

Keep it concise but complete (150-250 words).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert writer creating educational examples for the PREP writing method.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const modelText = completion.choices[0]?.message?.content || "No model text generated.";

    return NextResponse.json({ modelText });
  } catch (error) {
    console.error("Error generating model text:", error);
    return NextResponse.json(
      { error: "Failed to generate model text" },
      { status: 500 }
    );
  }
}
