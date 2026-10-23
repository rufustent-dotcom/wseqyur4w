import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface CitationItem {
  title: string;
  uri: string;
}

function extractCitations(response: any): CitationItem[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const citations: CitationItem[] = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (uri && typeof uri === 'string' && !seen.has(uri)) {
      seen.add(uri);
      citations.push({ title: String(title), uri });
    }
  }
  return citations;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = 'proposal',
      prompt = '',
      referenceVideo = '',
      availableKeys = [],
      beat = 'explainer',
      pipelineName = 'Animated Explainer',
      injectionScenario = 'nominal',
      language = 'zh',
    } = body;

    if (!prompt && mode !== 'trends') {
      return NextResponse.json(
        { error: 'Please provide a topic, prompt, or script to analyze.' },
        { status: 400 }
      );
    }

    const langInstruction =
      language === 'en'
        ? 'Write your response in clear, authoritative English.'
        : '请使用专业、清晰的中文撰写回复（保留必要的英文技术术语如 Remotion, HyperFrames, ffprobe, WhisperX）。';

    let systemInstruction = '';
    let userContents = '';

    if (mode === 'proposal') {
      const keysText =
        Array.isArray(availableKeys) && availableKeys.length > 0
          ? availableKeys.join(', ')
          : 'Zero Paid API Keys (Free stack only: Piper TTS, Archive.org, NASA, Wikimedia Commons, Pexels, Remotion, HyperFrames, FFmpeg)';

      systemInstruction = `You are the OpenMontage First-Class Web Research & Proposal Director Agent.
OpenMontage is the open-source, agentic video production system with 12 pipelines (Animated Explainer, Documentary Montage, Cinematic, Animation, Avatar Spokesperson, Clip Factory, Hybrid, Localization & Dub, Podcast Repurpose, Screen Demo, Talking Head), 2 programmatic runtimes (Remotion for React/data-viz/parallax, HyperFrames for HTML/CSS/GSAP/kinetic-type/SVG-rigs) plus FFmpeg for native archival montage, and a 7-dimension provider scoring engine.
Always ground your research in real, up-to-date facts using Google Search before proposing the video plan.
${langInstruction}`;

      userContents = `User Video Request / Topic: "${prompt}"
${referenceVideo ? `Reference Video Context / Link Provided: "${referenceVideo}"` : ''}
Available User API Keys / Hardware: ${keysText}

Please execute OpenMontage Stage 01 (Web Research) and Stage 02 (Proposal & Runtime Lock) using live Google Search data. Structure your Markdown response with these exact sections:

## 01. 实时网络研究简报 (Live Web Research Brief)
- Summarize 4–5 concrete, up-to-date facts, statistics, historical dates, or technical mechanisms verified via Google Search.
- Identify the strongest audience hook and common misconceptions to address.

${
  referenceVideo
    ? `## 参考视频拆解 (Reference Video Deconstruction)
- **保留要素 (What We Keep)**: Pacing cadence, hook structure, visual rhythm, and energy.
- **创新重构 (What We Change)**: Subject matter, original visual metaphors, narration angle, and scene progression.`
    : ''
}

## 02. 流水线与渲染引擎锁定 (Pipeline & Render Runtime Lock)
- **Selected Pipeline**: Name the exact OpenMontage pipeline and explain why.
- **Locked \`render_runtime\`**: Choose \`Remotion\`, \`HyperFrames\`, or \`FFmpeg\` and justify per OpenMontage governance rules.
- **7-Dimension Provider Selection**: Recommend the exact Video/Archive, Image, TTS, and Music tools based on the user's available keys (${keysText}) and provide an itemized **Estimated Production Cost (USD)**.

## 03. 三个差异化创意方案 (3 Differentiated Production Concepts)
Provide 3 distinct, actionable production concepts (Concept A, Concept B, Concept C) with target duration, visual grammar, camera/motion plan, and opening 10-second script hook.

## 04. 质量检验门与防 PPT 风险策略 (Quality Gates & Anti-PPT Risk Plan)
- Explain how this plan avoids the 6-dimension Slide-Deck (PPT) risk and what the post-render self-review (\`ffprobe\` + 4x frame sampling + audio LUFS check) will verify.`;
    } else if (mode === 'fact-check') {
      systemInstruction = `You are the OpenMontage Reviewer & Fact-Checking Agent.
Your responsibility is to verify video scripts, documentary claims, or creative briefs against live Google Search data before expensive video/audio asset generation begins, and generate a crisp Executive Summary.
${langInstruction}`;

      userContents = `Script / Claim / Brief to Fact-Check & Summarize:
"""
${prompt}
"""

Use Google Search to verify all factual claims, dates, numbers, scientific explanations, and attributions in the text above. Format your Markdown response with these exact sections:

## 核验结论 (Verification Verdict)
State clearly at the top one of:
- **VERIFIED (事实核验通过 — 适合进入资产生成阶段)**
- **NUANCED / PARTIALLY SUPPORTED (部分属实 — 建议按下方修正后再渲染旁白)**
- **UNVERIFIED / HIGH RISK (存在事实错误 — 已拦截进入合成阶段)**

## 执行摘要 (Executive Production Summary)
Provide a 3-bullet executive summary of the core message, target duration estimate (at 145 words/minute), and recommended visual treatment in OpenMontage.

## 逐项事实审计与修正建议 (Claim-by-Claim Grounded Audit)
For each key claim or statement in the input:
1. Quote or summarize the claim.
2. Provide the real-world facts verified via Google Search.
3. Offer a revised, broadcast-ready narration line if any correction or sharper phrasing is needed.`;
    } else if (mode === 'pipeline-run') {
      systemInstruction = `You are the OpenMontage Pipeline Execution & Real-Time Search Grounding Auditor.
Use Google Search to fetch up-to-the-minute facts, news, and figures for the user's pipeline prompt, and provide a concise Stage 01 Web Research & Fact-Check Audit log entry (3–4 sentences max) summarizing the verified real-world data and how it grounds this "${pipelineName}" pipeline run (Scenario: ${injectionScenario}).
${langInstruction}`;

      userContents = `Pipeline: ${pipelineName}
Prompt / Topic: "${prompt}"
Governance Scenario: ${injectionScenario}

Use Google Search to verify real-world current events, recent news, or scientific/historical facts related to "${prompt}". Write a concise 1-paragraph grounded research & fact-check audit summary suitable for the OpenMontage production attempt log.`;
    } else if (mode === 'news-agent') {
      systemInstruction = `You are the OpenMontage Real-Time Current Events, News Citation & Fact-Checking Agent.
You use Google Search to discuss current events, cite recent news articles, verify claims, and help creators turn breaking stories into accurate OpenMontage video productions.
${langInstruction}`;

      userContents = `User Query / Current Event Discussion:
"""
${prompt}
"""

Use Google Search to retrieve the latest news, verifiable facts, and primary sources. Structure your response with:
1. **实时新闻与事实综述 (Current Events & Grounded Facts)**: Accurate synthesis of what is happening right now with dates and figures.
2. **新闻信源与事实核验 (Fact-Check & Source Verification)**: Highlight verified facts vs. common rumors or misconceptions.
3. **OpenMontage 视频化切入点 (Video Production Angle)**: Recommend which OpenMontage pipeline (\`Animated Explainer\`, \`Documentary Montage\`, \`Cinematic\`, \`Clip Factory\`), runtime, and 60-second script hook would best cover this story.`;
    } else if (mode === 'trends') {
      const beatDescriptions: Record<string, string> = {
        explainer:
          'breakthrough science, technology, economics, or engineering topics ideal for a 60-second data-driven Animated Explainer video',
        documentary:
          'compelling cultural history, urban life, archival science, or human stories ideal for an archival Documentary Montage using real open-source footage',
        cinematic:
          'high-concept sci-fi, space exploration, climate futures, or dramatic storytelling themes trending in 2026 for a Cinematic Trailer',
        product:
          'emerging hardware, AI developer tools, robotics, or design innovations ideal for a kinetic Product Launch Teaser',
      };

      systemInstruction = `You are the OpenMontage Cultural & Production Trend Intelligence Agent.
Use Google Search to identify real, current trending topics and news stories that make exceptional video productions.
${langInstruction}`;

      userContents = `Search for current, high-interest stories and developments in this beat: ${
        beatDescriptions[beat] || beatDescriptions.explainer
      }.

Present **4 high-impact video production opportunities** grounded in live web search results. For each opportunity, include:
1. **Topic Headline & Why It's Trending Now** (with concrete recent facts/events)
2. **Recommended OpenMontage Pipeline & Runtime** (\`Remotion\`, \`HyperFrames\`, or \`FFmpeg\`)
3. **Copy-Ready OpenMontage Prompt** (a single natural-language prompt the user can run immediately)
4. **Estimated Cost & Provider Path** (both Zero-Key path and Cloud Provider path)`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const citations = extractCitations(response);

    return NextResponse.json({
      text,
      citations,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('OpenMontage Research API error:', error);
    const message =
      error?.message ||
      'Failed to execute Google Search grounded request. Please check your GEMINI_API_KEY in Settings > Secrets.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
