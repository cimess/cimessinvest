import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/app/lib/prisma/prisma";
import { checkRateLimit } from "@/app/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting (max 5 generations per minute per IP)
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: "ai-copy",
      limit: 5,
      windowMs: 60 * 1000,
      customMessage: "AI generation rate limit reached. Please wait a moment before generating again.",
    });
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, brandName, industry, inputPrompt, tone = "LUXURY" } = body;

    if (!inputPrompt) {
      return NextResponse.json(
        { error: "Input prompt or product details are required" },
        { status: 400 }
      );
    }

    // 1. Resolve Company & Check AI Credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { company: true },
        },
      },
    });

    const targetCompanyId =
      session.user.activeCompanyId ||
      session.user.companyId ||
      user?.memberships?.[0]?.company?.id ||
      null;

    if (!targetCompanyId) {
      return NextResponse.json(
        { error: "No active merchant store found for this account" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: { id: true, name: true, aiCreditsRemaining: true, brandBio: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    if (company.aiCreditsRemaining <= 0) {
      return NextResponse.json(
        {
          error: "AI copywriting credits exhausted. Please upgrade your plan or purchase an AI booster pack.",
          creditsRemaining: 0,
        },
        { status: 403 }
      );
    }

    // 2. Build Targeted AI Copywriting Prompt
    const activeBrand = brandName || company.name;
    let systemInstruction = `You are an elite, high-converting social commerce copywriter for Instagram, TikTok, and WhatsApp storefronts. Brand: "${activeBrand}". Industry: "${industry || "Retail"}". Tone: "${tone}".`;
    let userTaskPrompt = "";

    switch (type) {
      case "BIO":
        userTaskPrompt = `Write a short, engaging, high-converting Instagram/Link-in-bio storefront bio (under 160 characters). Details: "${inputPrompt}". Return ONLY the final bio text without quotes or preamble.`;
        break;
      case "PRODUCT_DESCRIPTION":
        userTaskPrompt = `Write a compelling 2-to-3 sentence commercial product description for "${inputPrompt}". Highlight luxury craftsmanship, fit/quality, and encourage inquiry. Return ONLY the description text.`;
        break;
      case "WHATSAPP_GREETING":
        userTaskPrompt = `Write a friendly, professional 1-sentence WhatsApp automated greeting message for customers inquiring about "${inputPrompt}". Return ONLY the greeting.`;
        break;
      case "SLOGAN":
        userTaskPrompt = `Write 3 catchy, memorable brand taglines/slogans for "${activeBrand}" based on: "${inputPrompt}". Format as a clean bulleted list.`;
        break;
      default:
        userTaskPrompt = `Write polished, high-converting social commerce copy based on: "${inputPrompt}". Return ONLY the final copy.`;
    }

    const combinedPrompt = `${systemInstruction}\n\nTask: ${userTaskPrompt}`;

    let generatedText = "";

    // 3. Call Gemini API if Key is Configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: combinedPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, using heuristic copy generator:", geminiError);
      }
    }

    // Heuristic fallback if Gemini API is offline or key not provided
    if (!generatedText) {
      if (type === "BIO") {
        generatedText = `Handcrafted ${industry || "luxury"} essentials by ${activeBrand}. Bespoke quality, nationwide delivery, and dedicated customer service.`;
      } else if (type === "PRODUCT_DESCRIPTION") {
        generatedText = `Expertly crafted ${inputPrompt} designed for supreme comfort and standout elegance. Made with premium materials for lasting durability.`;
      } else {
        generatedText = `Welcome to ${activeBrand}! Thank you for reaching out regarding ${inputPrompt}. How can we assist you today?`;
      }
    }

    // 4. Atomically Deduct 1 AI Credit
    const updatedCompany = await prisma.company.update({
      where: { id: targetCompanyId },
      data: {
        aiCreditsRemaining: { decrement: 1 },
      },
      select: { aiCreditsRemaining: true },
    });

    return NextResponse.json({
      success: true,
      copy: generatedText,
      creditsRemaining: updatedCompany.aiCreditsRemaining,
    });
  } catch (error) {
    console.error("AI Store Copywriter Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI copy" },
      { status: 500 }
    );
  }
}
