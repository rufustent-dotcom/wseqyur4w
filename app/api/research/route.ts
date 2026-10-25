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
      useGoogleSearch = true,
    } = body;

    if (!prompt && mode !== 'trends') {
      return NextResponse.json(
        { error: 'Please provide a topic, prompt, or script to analyze.' },
        { status: 400 }
      );
    }

    const isGrounded = Boolean(useGoogleSearch);

    const langInstruction =
      'Write your entire response in clear, authoritative English.';

    const groundingDirective = isGrounded
      ? 'Always ground your research in real, up-to-date facts using live Google Search before proposing or verifying content.'
      : 'IMPORTANT: Real-time Google Search grounding is DISABLED by the user. You are operating strictly on static pre-trained model knowledge without access to current web data. Explicitly note in your response where facts rely on static training data rather than live web verification.';

    let systemInstruction = '';
    let userContents = '';

    if (mode === 'proposal') {
      const keysText =
        Array.isArray(availableKeys) && availableKeys.length > 0
          ? availableKeys.join(', ')
          : 'Zero Paid API Keys (Free stack only: Piper TTS, Archive.org, NASA, Wikimedia Commons, Pexels, Remotion, HyperFrames, FFmpeg)';

      systemInstruction = `You are the OpenMontage First-Class Research & Proposal Director Agent.
OpenMontage is the open-source, agentic video production system with 12 pipelines (Animated Explainer, Documentary Montage, Cinematic, Animation, Avatar Spokesperson, Clip Factory, Hybrid, Localization & Dub, Podcast Repurpose, Screen Demo, Talking Head), 2 programmatic runtimes (Remotion for React/data-viz/parallax, HyperFrames for HTML/CSS/GSAP/kinetic-type/SVG-rigs) plus FFmpeg for native archival montage, and a 7-dimension provider scoring engine.
${groundingDirective}
${langInstruction}`;

      userContents = `User Video Request / Topic: "${prompt}"
${referenceVideo ? `Reference Video Context / Link Provided: "${referenceVideo}"` : ''}
Available User API Keys / Hardware: ${keysText}
Data Source Mode: ${isGrounded ? 'LIVE GOOGLE SEARCH GROUNDING ENABLED' : 'STATIC TRAINING DATA ONLY (Live Web Search Disabled)'}

Please execute OpenMontage Stage 01 (Research) and Stage 02 (Proposal & Runtime Lock). Structure your Markdown response with these exact sections:

## 01. ${isGrounded ? 'Live Web Research Brief' : 'Static Training Data Brief (Offline Mode)'}
- ${
        isGrounded
          ? 'Summarize 4–5 concrete, up-to-date facts, statistics, historical dates, or technical mechanisms verified via live Google Search.'
          : 'Summarize 4–5 core concepts, mechanisms, or historical facts from static training knowledge, and transparently flag any time-sensitive statistics that would require live Google Search verification before final render.'
      }
- Identify the strongest audience hook and common misconceptions to address.

${
  referenceVideo
    ? `## Reference Video Deconstruction
- **What We Keep**: Pacing cadence, hook structure, visual rhythm, and energy.
- **What We Change**: Subject matter, original visual metaphors, narration angle, and scene progression.`
    : ''
}

## 02. Pipeline & Render Runtime Lock
- **Selected Pipeline**: Name the exact OpenMontage pipeline and explain why.
- **Locked \`render_runtime\`**: Choose \`Remotion\`, \`HyperFrames\`, or \`FFmpeg\` and justify per OpenMontage governance rules.
- **7-Dimension Provider Selection**: Recommend the exact Video/Archive, Image, TTS, and Music tools based on the user's available keys (${keysText}) and provide an itemized **Estimated Production Cost (USD)**.

## 03. 3 Differentiated Production Concepts
Provide 3 distinct, actionable production concepts (Concept A, Concept B, Concept C) with target duration, visual grammar, camera/motion plan, and opening 10-second script hook.

## 04. Quality Gates & Anti-PPT Risk Plan
- Explain how this plan avoids the 6-dimension Slide-Deck (PPT) risk and what the post-render self-review (\`ffprobe\` + 4x frame sampling + audio LUFS check) will verify.`;
    } else if (mode === 'fact-check') {
      systemInstruction = `You are the OpenMontage Reviewer & Fact-Checking Agent.
Your responsibility is to verify video scripts, documentary claims, or creative briefs before expensive video/audio asset generation begins, and generate a crisp Executive Summary.
${groundingDirective}
${langInstruction}`;

      userContents = `Script / Claim / Brief to Fact-Check & Summarize:
"""
${prompt}
"""
Data Source Mode: ${isGrounded ? 'LIVE GOOGLE SEARCH GROUNDING ENABLED' : 'STATIC TRAINING DATA ONLY (Live Web Search Disabled)'}

${
  isGrounded
    ? 'Use live Google Search to verify all factual claims, dates, numbers, scientific explanations, and attributions in the text above.'
    : 'Evaluate the claims strictly using your static training knowledge. Explicitly note that real-time Google Search is disabled and highlight any recent or time-sensitive claims that cannot be verified without live web access.'
} Format your Markdown response with these exact sections:

## Verification Verdict
State clearly at the top one of:
- **VERIFIED (Fact-Check Passed — Cleared for Asset Generation)**
- **NUANCED / PARTIALLY SUPPORTED (Partially Accurate — Revise Narration Before Rendering)**
- **UNVERIFIED / HIGH RISK (Factual Errors Detected — Blocked Prior to Composition)**
*(Also state clearly whether this audit used Live Google Search or Static Training Data Only.)*

## Executive Production Summary
Provide a 3-bullet executive summary of the core message, target duration estimate (at 145 words/minute), and recommended visual treatment in OpenMontage.

## Claim-by-Claim Audit & Revisions
For each key claim or statement in the input:
1. Quote or summarize the claim.
2. Provide the verified facts (${isGrounded ? 'via live Google Search' : 'from static training data'}).
3. Offer a revised, broadcast-ready narration line if any correction or sharper phrasing is needed.`;
    } else if (mode === 'pipeline-run') {
      systemInstruction = `You are the OpenMontage Pipeline Execution & Research Grounding Auditor.
${groundingDirective}
Provide a concise Stage 01 Research & Fact-Check Audit log entry (3–4 sentences max) summarizing the data provenance and how it grounds this "${pipelineName}" pipeline run (Scenario: ${injectionScenario}).
${langInstruction}`;

      userContents = `Pipeline: ${pipelineName}
Prompt / Topic: "${prompt}"
Governance Scenario: ${injectionScenario}
Data Source Mode: ${isGrounded ? 'LIVE GOOGLE SEARCH GROUNDING ENABLED' : 'STATIC TRAINING DATA ONLY (Live Web Search Disabled)'}

${
  isGrounded
    ? `Use live Google Search to verify real-world current events, recent news, or scientific/historical facts related to "${prompt}".`
    : `Real-time Google Search is disabled. Summarize baseline domain knowledge for "${prompt}" using static training data only, and explicitly note in the log that live web grounding was bypassed.`
} Write a concise 1-paragraph audit summary suitable for the OpenMontage production attempt log.`;
    } else if (mode === 'news-agent') {
      systemInstruction = `You are the OpenMontage Current Events, News Citation & Fact-Checking Agent.
${groundingDirective}
${langInstruction}`;

      userContents = `User Query / Topic Discussion:
"""
${prompt}
"""
Data Source Mode: ${isGrounded ? 'LIVE GOOGLE SEARCH GROUNDING ENABLED' : 'STATIC TRAINING DATA ONLY (Live Web Search Disabled)'}

${
  isGrounded
    ? 'Use live Google Search to retrieve the latest news, verifiable facts, and primary sources.'
    : 'Real-time Google Search is currently DISABLED by the user. Respond using strictly static training data, clearly state your knowledge cutoff/static mode limitations for breaking news, and explain what live search queries should be enabled to verify current developments.'
} Structure your response with:
1. **${isGrounded ? 'Current Events & Grounded Facts' : 'Static Knowledge Synthesis (Offline Mode)'}**: Accurate synthesis of the topic and known context.
2. **${isGrounded ? 'Fact-Check & Source Verification' : 'Static Data Boundaries & Verification Checklist'}**: Highlight verified facts vs. claims requiring live web citations.
3. **OpenMontage Video Production Angle**: Recommend which OpenMontage pipeline (\`Animated Explainer\`, \`Documentary Montage\`, \`Cinematic\`, \`Clip Factory\`), runtime, and 60-second script hook would best cover this story.`;
    } else if (mode === 'trends') {
      const beatDescriptions: Record<string, string> = {
        explainer:
          'breakthrough science, technology, economics, or engineering topics ideal for a 60-second data-driven Animated Explainer video',
        documentary:
          'compelling cultural history, urban life, archival science, or human stories ideal for an archival Documentary Montage using real open-source footage',
        cinematic:
          'high-concept sci-fi, space exploration, climate futures, or dramatic storytelling themes for a Cinematic Trailer',
        product:
          'emerging hardware, AI developer tools, robotics, or design innovations ideal for a kinetic Product Launch Teaser',
      };

      systemInstruction = `You are the OpenMontage Cultural & Production Trend Intelligence Agent.
${groundingDirective}
${langInstruction}`;

      userContents = `Identify 4 high-impact video production opportunities in this beat: ${
        beatDescriptions[beat] || beatDescriptions.explainer
      }.
Data Source Mode: ${isGrounded ? 'LIVE GOOGLE SEARCH GROUNDING ENABLED' : 'STATIC TRAINING DATA ONLY (Live Web Search Disabled)'}

Present **4 high-impact video production opportunities** (${isGrounded ? 'grounded in live web search results' : 'drawn from evergreen and foundational knowledge in static training data'}). For each opportunity, include:
1. **Topic Headline & Context** (${isGrounded ? 'with concrete recent facts/events from Google Search' : 'noting static training knowledge basis'})
2. **Recommended OpenMontage Pipeline & Runtime** (\`Remotion\`, \`HyperFrames\`, or \`FFmpeg\`)
3. **Copy-Ready OpenMontage Prompt** (a single natural-language prompt the user can run immediately)
4. **Estimated Cost & Provider Path** (both Zero-Key path and Cloud Provider path)`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContents,
      config: {
        systemInstruction,
        ...(isGrounded ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });

    const text = response.text || '';
    const citations = isGrounded ? extractCitations(response) : [];

    return NextResponse.json({
      text,
      citations,
      groundingEnabled: isGrounded,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('OpenMontage Research API error:', error);
    const message =
      error?.message ||
      'Failed to execute research request. Please check your GEMINI_API_KEY in Settings > Secrets.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
