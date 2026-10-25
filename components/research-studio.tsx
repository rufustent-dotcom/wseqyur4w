'use client';

import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  FileCheck2,
  Film,
  ArrowRight,
  RotateCcw,
  Trash2,
  AlertTriangle,
  History,
  Play,
  PanelRightOpen,
  PanelRightClose,
  X,
  Download,
  Clock,
  Newspaper,
} from 'lucide-react';
import {
  CURATED_PROMPTS,
  CuratedPrompt,
  GroundedCitation,
} from '@/lib/openmontage-data';
import {
  db,
  sanitizeId,
  handleFirestoreError,
  OperationType,
  saveResearchBriefToCloud,
  updateResearchBriefPinInCloud,
  deleteResearchBriefFromCloud,
} from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export interface SavedResearchBrief {
  id: string;
  mode: 'proposal' | 'fact-check' | 'news-agent';
  query: string;
  referenceVideo?: string;
  markdown: string;
  citations: GroundedCitation[];
  createdAt: string;
  pinned?: boolean;
  groundingMode?: 'live-web' | 'static-training';
}

interface ResearchStudioProps {
  lang: 'zh' | 'en';
  userId?: string | null;
  externalPrompt: string;
  externalReference: string;
  availableKeys: string[];
  useGoogleSearch: boolean;
  onToggleGoogleSearch: () => void;
  onClearExternalPrompt: () => void;
}

const INITIAL_RECENT_SEARCHES: SavedResearchBrief[] = [
  {
    id: 'preload-neural-net',
    mode: 'proposal',
    query:
      'Make a 60-second animated explainer on how neural networks learn via backpropagation',
    referenceVideo:
      '3Blue1Brown visual intuition cadence + crisp kinetic data overlays',
    createdAt: '2026-10-22 18:00',
    pinned: true,
    groundingMode: 'live-web',
    citations: [
      {
        title: 'Deep Learning & Backpropagation Visual Foundations — Stanford CS231n',
        uri: 'https://cs231n.github.io/optimization-2/',
      },
      {
        title: 'Remotion Programmatic Video Documentation',
        uri: 'https://www.remotion.dev/docs/',
      },
      {
        title: 'Archive.org Open Educational Media Collection',
        uri: 'https://archive.org/details/movies',
      },
    ],
    markdown: `## 01. Live Web Research Brief
- **Core Mechanism Verified**: Neural networks compute predictions via a forward pass, quantify prediction error using a loss function (such as cross-entropy or mean squared error), apply the chain rule backward through the network via backpropagation to compute gradients, and update weight matrices using an optimizer like AdamW.
- **Audience Hook & Misconception**: Viewers often mistake gradient descent for brute-force guessing; the strongest visual hook is showing **random static noise converging into crisp handwritten digit recognition within 4 iterations** as weights update in real time.

## 02. Pipeline & Render Runtime Lock
- **Selected Pipeline**: \`Animated Explainer\` — Optimal for mathematical intuition, live weight matrix visualization, and synchronized word-level captions.
- **Locked \`render_runtime\`**: \`Remotion\` (React programmatic video engine supporting spring physics, dynamic loss-curve charts, and TikTok-style word-level caption highlighting).
- **7-Dimension Provider Selection & Cost Estimate**:
  - **Visuals & Charts**: Remotion native data cards + ManimCE / FLUX keyframes (Estimated cost: **$0.00 – $0.15**)
  - **Narration Voiceover**: Piper offline neural TTS ($0.00) or Google Chirp3-HD ($0.12)
  - **Total Estimated Cost**: **$0.00 (Zero-Key Mode)** or **$0.27 (Cloud-Enhanced Mode)**

## 03. 3 Differentiated Production Concepts
1. **Concept A: The 10,000-Knob Mixing Console** — Frame a neural network as a studio mixing board with 10,000 dials; after every wrong prediction, backpropagation traces the error signal backward to nudge each dial in the right direction.
2. **Concept B: Foggy Mountain Descent** — Focus on the 3D loss landscape using topographic contour lines and a momentum ball to show why learning rate size matters.
3. **Concept C: Inside a Single Perceptron** — Start with a single artificial neuron, completing the full loop from input pixels, weighted sum, and ReLU activation to gradient correction in 60 seconds.

## 04. Quality Gates & Anti-PPT Risk Plan
- **6-Dimension PPT Risk Score**: \`0.14 / 1.00 (LOW RISK)\` — Static image ratio stays below 20%, driven by continuous spring animations and reactive loss curves.
- **Post-Render Self-Review**: Automatically executes \`ffprobe\` container validation, 4-point frame extraction to inspect text overlap, and \`-14 LUFS\` loudness and caption sync checks.`,
  },
  {
    id: 'preload-4am-city-doc',
    mode: 'proposal',
    query:
      'Make a 75-second documentary montage about urban life in the rain. Use real footage only, no narration, with an elegiac tone and score.',
    referenceVideo: 'Koyaanisqatsi / Nocturnal urban tone poem · Native footage only',
    createdAt: '2026-10-22 17:42',
    pinned: false,
    groundingMode: 'live-web',
    citations: [
      {
        title: 'Prelinger Archives & Open Urban Footage — Internet Archive',
        uri: 'https://archive.org/details/prelinger',
      },
      {
        title: 'Wikimedia Commons — Free Documentary Video Repository',
        uri: 'https://commons.wikimedia.org/wiki/Category:Videos',
      },
    ],
    markdown: `## 01. Live Web Research Brief
- **Archival Corpus Coverage**: Semantic CLIP retrieval across \`Archive.org\`, \`Wikimedia Commons\`, and \`Pexels\` surfaces over 140 royalty-free HD clips of nocturnal rain, neon reflections on wet asphalt, late-night subway platforms, and early-morning street sweepers.
- **Audiovisual Pacing**: A narration-free tone poem relies on ambient sound design (rain on metal awnings, distant tram rails) paired with a slow cello adagio at an average shot length (ASL) of \`3.8 seconds\`.

## 02. Pipeline & Render Runtime Lock
- **Selected Pipeline**: \`Documentary Montage\` — Enforces \`promise: native_motion_footage_only\`, strictly prohibiting static images with Ken Burns pans from masquerading as video.
- **Locked \`render_runtime\`**: \`FFmpeg\` (native multi-track video stitching, \`film_dissolve\` crossfades, and 16mm archival LUT color grading).
- **Estimated Cost**: **$0.00 (100% Free Open Archives & Local Composition)**.

## 03. 3 Differentiated Production Concepts
1. **Concept A: Neon & Wet Asphalt** — Open on midnight puddle reflections and transition to 4:00 AM empty overpasses and early bakery steam.
2. **Concept B: Traffic Lights for No One** — Focus on rhythmic traffic signals changing at empty rain-soaked intersections counterpointed against windshield wipers.
3. **Concept C: Last Train Home** — Follow rain streaks across commuter train windows linking the glowing geometry of the city outskirts.`,
  },
  {
    id: 'preload-crispr-factcheck',
    mode: 'fact-check',
    query:
      'In a 60-second explainer script: CRISPR-Cas9 completed its first human clinical gene-editing trial in 1995, and it works by using an RNA-guided enzyme to synthesize brand-new DNA strands from scratch...',
    createdAt: '2026-10-22 17:15',
    pinned: false,
    groundingMode: 'live-web',
    citations: [
      {
        title: 'Nobel Prize in Chemistry 2020 — Genetic Scissors (Charpentier & Doudna)',
        uri: 'https://www.nobelprize.org/prizes/chemistry/2020/popular-information/',
      },
      {
        title: 'CRISPR Gene Editing Timeline & Clinical Trials — Broad Institute',
        uri: 'https://www.broadinstitute.org/what-broad/areas-focus/project-spotlight/questions-and-answers-about-crispr',
      },
    ],
    markdown: `## Verification Verdict
- **UNVERIFIED / HIGH RISK (Factual Errors Detected — Blocked Prior to Composition)**

## Executive Production Summary
- **Core Correction**: The draft script conflates early bacterial repeat observations with human clinical trial dates and misstates the molecular mechanism of Cas9.
- **Duration Estimate**: The revised narration is ~140 words, fitting a \`60-second\` Animated Explainer at 145 WPM.
- **Visual Recommendation**: Use \`Remotion\` to step through guide RNA (gRNA) target matching and Cas9 double-stranded DNA cleavage.

## Claim-by-Claim Grounded Audit
1. **Original Claim**: "Completed its first human clinical gene-editing trial in 1995"
   - **Verified Fact**: Jennifer Doudna and Emmanuelle Charpentier published their landmark paper demonstrating programmable CRISPR-Cas9 DNA cleavage in **2012**; eukaryotic human cell editing followed in **2013**, and the first human clinical trials began in **2016**.
   - **Revised Narration**: "In 2012, scientists transformed a bacterial immune defense into the programmable genetic scissors known as CRISPR-Cas9, launching human clinical trials within just four years."
2. **Original Claim**: "Uses an RNA-guided enzyme to synthesize brand-new DNA strands from scratch with 100% zero off-target edits without a guide sequence"
   - **Verified Fact**: Cas9 **cleaves (cuts)** existing double-stranded DNA rather than synthesizing new DNA from scratch, and it strictly requires a **guide RNA (gRNA)** to locate the target sequence.`,
  },
];

export function ResearchStudio({
  lang,
  userId,
  externalPrompt,
  externalReference,
  availableKeys,
  useGoogleSearch,
  onToggleGoogleSearch,
  onClearExternalPrompt,
}: ResearchStudioProps) {
  const [activeTab, setActiveTab] = useState<'proposal' | 'fact-check' | 'news-agent'>(
    'proposal'
  );
  const [promptInput, setPromptInput] = useState(
    'Make a 60-second animated explainer on how neural networks learn via backpropagation'
  );
  const [referenceInput, setReferenceInput] = useState('');
  const [factCheckInput, setFactCheckInput] = useState(
    'In a 60-second explainer script: CRISPR-Cas9 completed its first human clinical gene-editing trial in 1995, and it works by using an RNA-guided enzyme to synthesize brand-new DNA strands from scratch with 100% zero off-target edits without any guide sequence.'
  );
  const [newsAgentInput, setNewsAgentInput] = useState(
    'Search for recent breakthroughs in solid-state EV batteries, commercial spaceflight, or open-source video generation models, cite authoritative sources, and propose a 60-second video script angle.'
  );
  const [promptGroupFilter, setPromptGroupFilter] = useState<string>('all');

  // Recent Searches Sidebar / Drawer state
  const [recentSearches, setRecentSearches] = useState<SavedResearchBrief[]>(
    INITIAL_RECENT_SEARCHES
  );
  const [activeBriefId, setActiveBriefId] = useState<string>(
    INITIAL_RECENT_SEARCHES[0].id
  );
  const [historyFilterMode, setHistoryFilterMode] = useState<
    'all' | 'proposal' | 'fact-check' | 'news-agent' | 'pinned'
  >('all');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<{
    id: string;
    mode: 'proposal' | 'fact-check' | 'news-agent';
    query: string;
    referenceVideo?: string;
    markdown: string;
    citations: GroundedCitation[];
    timestamp: string;
    groundingMode?: 'live-web' | 'static-training';
  }>({
    id: INITIAL_RECENT_SEARCHES[0].id,
    mode: INITIAL_RECENT_SEARCHES[0].mode,
    query: INITIAL_RECENT_SEARCHES[0].query,
    referenceVideo: INITIAL_RECENT_SEARCHES[0].referenceVideo,
    markdown: INITIAL_RECENT_SEARCHES[0].markdown,
    citations: INITIAL_RECENT_SEARCHES[0].citations,
    timestamp: INITIAL_RECENT_SEARCHES[0].createdAt,
    groundingMode: INITIAL_RECENT_SEARCHES[0].groundingMode || 'live-web',
  });

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('openmontage_recent_searches_en_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Real-time Firestore listener when user is authenticated
  useEffect(() => {
    if (!userId) return;
    const safeUid = sanitizeId(userId);
    const path = `users/${safeUid}/researchBriefs`;
    const q = query(
      collection(db, 'users', safeUid, 'researchBriefs'),
      where('userId', '==', safeUid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) return;
        const cloudBriefs: SavedResearchBrief[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            mode:
              d.mode === 'fact-check' || d.mode === 'news-agent'
                ? d.mode
                : 'proposal',
            query: String(d.query || ''),
            referenceVideo: d.referenceVideo ? String(d.referenceVideo) : undefined,
            markdown: String(d.markdown || ''),
            citations: [],
            createdAt: String(d.createdAtLabel || 'Cloud Synced'),
            pinned: Boolean(d.pinned),
            groundingMode:
              d.groundingMode === 'static-training' ? 'static-training' : 'live-web',
          };
        });

        setRecentSearches((prev) => {
          const byId = new Map<string, SavedResearchBrief>();
          for (const item of cloudBriefs) {
            const localMatch = prev.find((p) => p.id === item.id);
            byId.set(item.id, {
              ...item,
              citations:
                localMatch && localMatch.citations.length > 0
                  ? localMatch.citations
                  : item.citations,
            });
          }
          for (const localItem of prev) {
            if (!byId.has(localItem.id)) {
              byId.set(localItem.id, localItem);
            }
          }
          return Array.from(byId.values()).slice(0, 25);
        });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const persistRecentSearches = (items: SavedResearchBrief[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem('openmontage_recent_searches_en_v1', JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  // Sync external prompt when user clicks "Use in Studio" from Showcase, Trends, or Pipeline History
  useEffect(() => {
    if (externalPrompt) {
      setActiveTab('proposal');
      setPromptInput(externalPrompt);
      if (externalReference) {
        setReferenceInput(externalReference);
      }
      onClearExternalPrompt();
    }
  }, [externalPrompt, externalReference, onClearExternalPrompt]);

  // Core runner that can be called from form input OR re-invoked directly from Recent Searches
  const executeGroundedSearch = async (params: {
    targetMode: 'proposal' | 'fact-check' | 'news-agent';
    queryText: string;
    refText?: string;
    overrideGrounding?: boolean;
  }) => {
    const { targetMode, queryText, refText = '', overrideGrounding } = params;
    const effectiveGrounding =
      typeof overrideGrounding === 'boolean' ? overrideGrounding : useGoogleSearch;

    if (!queryText.trim()) {
      setErrorMsg(
        lang === 'zh'
          ? '请输入视频主题、时事问题或需要核验的脚本内容。'
          : 'Please enter a video topic, current event query, or script to verify.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: targetMode,
          prompt: queryText.trim(),
          referenceVideo: targetMode === 'proposal' ? refText.trim() : '',
          availableKeys,
          language: lang,
          useGoogleSearch: effectiveGrounding,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Request failed');
      }

      const nowStr = new Date().toLocaleString([], {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const resolvedGroundingMode: 'live-web' | 'static-training' =
        data.groundingEnabled === false || !effectiveGrounding
          ? 'static-training'
          : 'live-web';

      const newEntryId = `search-${Date.now()}`;
      const newEntry: SavedResearchBrief = {
        id: newEntryId,
        mode: targetMode,
        query: queryText.trim(),
        referenceVideo:
          targetMode === 'proposal' && refText.trim() ? refText.trim() : undefined,
        markdown: data.text,
        citations: data.citations || [],
        createdAt: nowStr,
        pinned: false,
        groundingMode: resolvedGroundingMode,
      };

      setCurrentResult({
        id: newEntryId,
        mode: targetMode,
        query: newEntry.query,
        referenceVideo: newEntry.referenceVideo,
        markdown: newEntry.markdown,
        citations: newEntry.citations,
        timestamp: nowStr,
        groundingMode: resolvedGroundingMode,
      });
      setActiveBriefId(newEntryId);

      // Automatically store in Recent Searches list
      const existingPinned = recentSearches.find(
        (item) => item.query === newEntry.query && item.pinned
      );
      const isPinned = Boolean(existingPinned);
      const updatedList = [
        { ...newEntry, pinned: isPinned },
        ...recentSearches.filter((item) => item.query !== newEntry.query),
      ].slice(0, 25);

      persistRecentSearches(updatedList);

      // Sync to Firestore if signed in
      if (userId) {
        try {
          await saveResearchBriefToCloud({
            userId,
            briefId: newEntryId,
            mode: targetMode,
            query: newEntry.query,
            referenceVideo: newEntry.referenceVideo,
            markdown: newEntry.markdown,
            citationsCount: newEntry.citations.length,
            pinned: isPinned,
            groundingMode: resolvedGroundingMode,
            createdAtLabel: nowStr,
          });
        } catch {
          // Handled by handleFirestoreError
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (lang === 'zh'
            ? '研究请求执行失败，请检查网络连接或 API 密钥配置。'
            : 'Research request failed. Please verify your connection or API key.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load a past search briefing from Recent Searches without re-fetching
  const handleLoadPastBrief = (item: SavedResearchBrief) => {
    setActiveBriefId(item.id);
    setActiveTab(item.mode);
    if (item.mode === 'proposal') {
      setPromptInput(item.query);
      setReferenceInput(item.referenceVideo || '');
    } else if (item.mode === 'fact-check') {
      setFactCheckInput(item.query);
    } else {
      setNewsAgentInput(item.query);
    }
    setCurrentResult({
      id: item.id,
      mode: item.mode,
      query: item.query,
      referenceVideo: item.referenceVideo,
      markdown: item.markdown,
      citations: item.citations,
      timestamp: item.createdAt,
      groundingMode: item.groundingMode || 'live-web',
    });
    setIsDrawerOpen(false);
  };

  // Re-invoke (re-run) a past search prompt using current grounding setting
  const handleReinvokePastSearch = (item: SavedResearchBrief) => {
    setActiveTab(item.mode);
    if (item.mode === 'proposal') {
      setPromptInput(item.query);
      setReferenceInput(item.referenceVideo || '');
    } else if (item.mode === 'fact-check') {
      setFactCheckInput(item.query);
    } else {
      setNewsAgentInput(item.query);
    }
    setIsDrawerOpen(false);
    executeGroundedSearch({
      targetMode: item.mode,
      queryText: item.query,
      refText: item.referenceVideo || '',
    });
  };

  const handleTogglePinBrief = async (id: string) => {
    const target = recentSearches.find((item) => item.id === id);
    const nextPinned = target ? !target.pinned : true;
    const updated = recentSearches.map((item) =>
      item.id === id ? { ...item, pinned: nextPinned } : item
    );
    persistRecentSearches(updated);
    if (userId && !id.startsWith('preload-')) {
      try {
        await updateResearchBriefPinInCloud({
          userId,
          briefId: id,
          pinned: nextPinned,
        });
      } catch {
        // Handled by handleFirestoreError
      }
    }
  };

  const handleDeleteBrief = async (id: string) => {
    const updated = recentSearches.filter((b) => b.id !== id);
    persistRecentSearches(updated);
    if (userId && !id.startsWith('preload-')) {
      try {
        await deleteResearchBriefFromCloud({
          userId,
          briefId: id,
        });
      } catch {
        // Handled by handleFirestoreError
      }
    }
  };

  const handleClearUnpinnedHistory = () => {
    const pinnedOnly = recentSearches.filter((b) => b.pinned);
    persistRecentSearches(
      pinnedOnly.length > 0 ? pinnedOnly : [INITIAL_RECENT_SEARCHES[0]]
    );
  };

  const handleSelectCuratedPrompt = (item: CuratedPrompt) => {
    setActiveTab('proposal');
    setPromptInput(lang === 'zh' ? item.promptZh : item.promptEn);
    if (item.referenceNote) {
      setReferenceInput(item.referenceNote);
    } else {
      setReferenceInput('');
    }
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 1800);
  };

  const handleCopyCurrentMarkdown = () => {
    navigator.clipboard.writeText(currentResult.markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 1800);
  };

  const handleDownloadBriefJson = () => {
    const payload = JSON.stringify(currentResult, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openmontage_brief_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPrompts =
    promptGroupFilter === 'all'
      ? CURATED_PROMPTS
      : CURATED_PROMPTS.filter((p) => p.group === promptGroupFilter);

  const filteredRecentSearches = recentSearches.filter((item) => {
    if (historyFilterMode === 'proposal' && item.mode !== 'proposal') return false;
    if (historyFilterMode === 'fact-check' && item.mode !== 'fact-check') return false;
    if (historyFilterMode === 'news-agent' && item.mode !== 'news-agent') return false;
    if (historyFilterMode === 'pinned' && !item.pinned) return false;
    if (
      historySearchTerm.trim() &&
      !item.query.toLowerCase().includes(historySearchTerm.toLowerCase()) &&
      !item.markdown.toLowerCase().includes(historySearchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const renderRecentSearchesList = () => (
    <div className="flex flex-col h-full">
      {/* Filter & Search inside Recent Searches */}
      <div className="space-y-2.5 pb-3 border-b border-[#E5E0D5]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
            placeholder={
              lang === 'zh' ? '筛选历史提示词或简报...' : 'Filter recent prompts & briefs...'
            }
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D6CEBE] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9A3412]"
          />
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="inline-flex flex-wrap items-center gap-1 bg-[#F3EFE6] p-0.5 rounded-md border border-[#E5E0D5]">
            {[
              { id: 'all', zh: '全部', en: 'All' },
              { id: 'proposal', zh: '提案', en: 'Proposals' },
              { id: 'fact-check', zh: '核查', en: 'Checks' },
              { id: 'news-agent', zh: '时事', en: 'News' },
              { id: 'pinned', zh: '星标', en: 'Pinned' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHistoryFilterMode(tab.id as any)}
                className={`px-2 py-1 text-[11px] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  historyFilterMode === tab.id
                    ? 'bg-[#1C1917] text-[#FBF9F5] font-medium'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {lang === 'zh' ? tab.zh : tab.en}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClearUnpinnedHistory}
            title={lang === 'zh' ? '清理未星标记录' : 'Clear unpinned history'}
            className="text-[11px] font-mono text-[#78716C] hover:text-[#991B1B] px-1.5 py-0.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            {lang === 'zh' ? '清理' : 'Prune'}
          </button>
        </div>
      </div>

      {/* Scrollable Recent Searches Items */}
      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[540px] pr-1">
        {filteredRecentSearches.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#78716C]">
            {lang === 'zh'
              ? '没有匹配的检索记录。运行一次研究即可自动存档。'
              : 'No matching recent searches found. Run a query to auto-save it here.'}
          </div>
        ) : (
          filteredRecentSearches.map((item) => {
            const isSelected = item.id === activeBriefId;
            const isItemStatic = item.groundingMode === 'static-training';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-[#F3EFE6] border-[#9A3412] shadow-2xs'
                    : 'bg-white border-[#E5E0D5] hover:bg-[#F3EFE6]/50'
                }`}
              >
                {/* Metadata Header Row (Zero-Pill Unboxed Text) */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#78716C]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={
                        item.mode === 'proposal'
                          ? 'text-[#9A3412] font-semibold'
                          : item.mode === 'fact-check'
                          ? 'text-[#1E3A8A] font-semibold'
                          : 'text-[#15803D] font-semibold'
                      }
                    >
                      {item.mode === 'proposal'
                        ? 'PROPOSAL'
                        : item.mode === 'fact-check'
                        ? 'FACT-CHECK'
                        : 'NEWS-AGENT'}
                    </span>
                    <span>·</span>
                    <span
                      className={
                        isItemStatic
                          ? 'text-[#B45309] font-semibold'
                          : 'text-[#15803D]'
                      }
                    >
                      {isItemStatic ? 'STATIC' : 'LIVE WEB'}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{item.citations.length} srcs</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePinBrief(item.id)}
                      title={lang === 'zh' ? '星标置顶' : 'Pin brief'}
                      className={`p-1 rounded hover:bg-[#E5E0D5]/60 cursor-pointer ${
                        item.pinned ? 'text-[#9A3412]' : 'text-[#A8A29E]'
                      }`}
                    >
                      <Bookmark
                        className="w-3 h-3"
                        fill={item.pinned ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBrief(item.id)}
                      title={lang === 'zh' ? '删除此记录' : 'Delete entry'}
                      className="p-1 rounded text-[#A8A29E] hover:text-[#B91C1C] hover:bg-[#E5E0D5]/60 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Clickable Prompt Title to View Cached Briefing */}
                <button
                  type="button"
                  onClick={() => handleLoadPastBrief(item)}
                  className="mt-1.5 text-left w-full text-xs font-medium text-[#1C1917] hover:text-[#9A3412] line-clamp-2 leading-snug cursor-pointer"
                >
                  {item.query}
                </button>

                {item.referenceVideo && (
                  <p className="mt-1 text-[11px] font-mono text-[#78716C] truncate">
                    Ref: {item.referenceVideo}
                  </p>
                )}

                {/* Action Footer: View Cached Briefing OR Re-Invoke Search */}
                <div className="mt-2.5 pt-2 border-t border-[#E5E0D5] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#78716C] inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-2.5 h-2.5" />
                    {item.createdAt}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadPastBrief(item)}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-[#F3EFE6] hover:bg-[#E5E0D5] text-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {lang === 'zh' ? '查看简报' : 'View Brief'}
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleReinvokePastSearch(item)}
                      title={
                        lang === 'zh'
                          ? '使用当前全局数据源模式重新执行此提示词'
                          : 'Re-run this prompt using the active data source mode'
                      }
                      className="px-2 py-1 rounded text-[11px] font-medium bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-50 text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {lang === 'zh' ? '重新执行' : 'Re-invoke'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <section
      id="research-studio"
      className="py-16 md:py-20 border-b border-[#E5E0D5] bg-[#F3EFE6]/60 relative"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#9A3412] mb-2">
              {lang === 'zh'
                ? '02 · 一等公民实时网络研究、时事引证与事实核查工作台 (RESEARCH & FACT-CHECK STUDIO)'
                : '02 · FIRST-CLASS WEB RESEARCH, CURRENT EVENTS & FACT-CHECKING STUDIO'}
            </p>
            <h2
              className="text-3xl md:text-4xl font-editorial font-semibold tracking-tight text-[#1C1917]"
              style={{ textWrap: 'balance' }}
            >
              {lang === 'zh'
                ? '连接实时 Google Search：讨论最新时事、引证新闻信源或核查脚本事实'
                : 'Connect to Live Google Search: Discuss Current Events, Cite News & Fact-Check Scripts'}
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
            {lang === 'zh'
              ? 'OpenMontage 将网络研究作为第一阶段（Stage 01）。您可通过右上角全局开关随时切换“实时 Google Search 联网数据”与“纯静态模型训练权重”，系统将透明标注每一次输出的真实数据来源。'
              : 'OpenMontage treats research as Stage 01. Use the top-right global toggle to switch between live Google Search web grounding and strictly static training data at any time.'}
          </p>
        </div>

        {/* Transparent Data Provenance & Grounding Mode Notice Bar */}
        <div
          className={`mt-6 px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-colors ${
            useGoogleSearch
              ? 'bg-[#FBF9F5] border-[#D6CEBE]'
              : 'bg-[#FFFBEB] border-[#FDE68A]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                useGoogleSearch ? 'bg-[#15803D]' : 'bg-[#D97706]'
              }`}
            />
            <span className="font-mono font-semibold text-[#1C1917]">
              {useGoogleSearch
                ? lang === 'zh'
                  ? '当前全局数据源：实时 Google Search 联网检索 (LIVE WEB DATA ENABLED)'
                  : 'ACTIVE DATA SOURCE: LIVE GOOGLE SEARCH GROUNDING (CURRENT WEB DATA)'
                : lang === 'zh'
                ? '当前全局数据源：仅静态训练数据 (STRICTLY STATIC TRAINING DATA)'
                : 'ACTIVE DATA SOURCE: STRICTLY STATIC TRAINING DATA (WEB SEARCH DISABLED)'}
            </span>
            <span className="text-[#A8A29E]">·</span>
            <span className="text-[#57534E]">
              {useGoogleSearch
                ? lang === 'zh'
                  ? '所有提案、事实核查与时事问答均调用 googleSearch 工具拉取最新网页并附带可验证引证链接。'
                  : 'All studio operations query live web sources via the googleSearch tool and attach verified URLs.'
                : lang === 'zh'
                ? '已关闭实时联网搜索。AI 仅依赖预训练静态权重回答，不进行外部网页检索，且会明确提示时效性边界。'
                : 'Real-time Google Search is disabled. The AI relies strictly on pre-trained model weights without live web requests.'}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleGoogleSearch}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
              useGoogleSearch
                ? 'bg-[#F3EFE6] hover:bg-[#E5E0D5] text-[#1C1917] border-[#D6CEBE]'
                : 'bg-[#9A3412] hover:bg-[#7C2D12] text-white border-[#9A3412]'
            }`}
          >
            {useGoogleSearch
              ? lang === 'zh'
                ? '切换至静态训练数据模式'
                : 'Switch to Static Training Data'
              : lang === 'zh'
              ? '开启实时 Google Search 联网'
              : 'Enable Live Google Search'}
          </button>
        </div>

        {/* Studio Mode Segmented Bar & Recent Searches Drawer / Sidebar Toggle */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#E5E0D5]/70 rounded-lg border border-[#D6CEBE]">
            <button
              type="button"
              onClick={() => setActiveTab('proposal')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'proposal'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#9A3412]" />
              {lang === 'zh'
                ? '实时主题研究与参考视频提案'
                : 'Topic Research & Reference Planner'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fact-check')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'fact-check'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
              {lang === 'zh'
                ? '交互式脚本事实核查与摘要'
                : 'Script Fact-Checker & Summarizer'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('news-agent')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === 'news-agent'
                  ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-[#15803D]" />
              {lang === 'zh'
                ? '实时时事新闻引证智能体'
                : 'Current Events & News Agent'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs font-mono text-[#78716C]">
              <span>MODEL: gemini-3.8-flash</span>
              <span className="mx-2">·</span>
              <span
                className={
                  useGoogleSearch
                    ? 'text-[#15803D] font-semibold'
                    : 'text-[#B45309] font-semibold'
                }
              >
                {useGoogleSearch ? 'TOOL: googleSearch (ON)' : 'TOOL: Static Weights Only (OFF)'}
              </span>
            </div>

            {/* Mobile / Tablet Slide-Over Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="xl:hidden px-3.5 py-2 rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#F3EFE6] text-xs font-medium text-[#1C1917] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#9A3412]" />
              {lang === 'zh'
                ? `最近检索抽屉 (${recentSearches.length})`
                : `Recent Searches (${recentSearches.length})`}
            </button>

            {/* Desktop Collapsible Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setShowDesktopSidebar((s) => !s)}
              className="hidden xl:inline-flex px-3.5 py-2 rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#F3EFE6] text-xs font-medium text-[#1C1917] items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {showDesktopSidebar ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5 text-[#9A3412]" />
                  {lang === 'zh'
                    ? `收起最近检索栏 (${recentSearches.length})`
                    : `Hide Recent Searches (${recentSearches.length})`}
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-[#9A3412]" />
                  {lang === 'zh'
                    ? `展开最近检索栏 (${recentSearches.length})`
                    : `Show Recent Searches (${recentSearches.length})`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Studio Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: Prompt & Script Input + Prompt Gallery */}
          <div
            className={`${
              showDesktopSidebar ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-5'
            } bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-6`}
          >
            {activeTab === 'proposal' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="om-topic-input"
                    className="text-xs font-mono uppercase tracking-wider text-[#57534E]"
                  >
                    {lang === 'zh'
                      ? '步骤 1 · 输入您的视频需求或主题提示词'
                      : 'STEP 1 · VIDEO TOPIC OR NATURAL LANGUAGE PROMPT'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPromptInput('');
                      setReferenceInput('');
                    }}
                    className="text-xs text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {lang === 'zh' ? '清空' : 'Clear'}
                  </button>
                </div>
                <textarea
                  id="om-topic-input"
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={
                    lang === 'zh'
                      ? '例如：制作一部 75 秒的纪录片蒙太奇，展现雨中的城市生活。只使用真实素材...'
                      : 'e.g., Make a 60-second animated explainer about how neural networks learn...'
                  }
                  className="w-full rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9A3412]"
                />

                <div className="mt-4">
                  <label
                    htmlFor="om-ref-input"
                    className="block text-xs font-mono uppercase tracking-wider text-[#57534E] mb-1.5"
                  >
                    {lang === 'zh'
                      ? '步骤 2 (可选) · 粘贴参考视频链接或您喜欢的风格节奏'
                      : 'STEP 2 (OPTIONAL) · PASTE REFERENCE VIDEO URL OR PACING NOTES'}
                  </label>
                  <input
                    id="om-ref-input"
                    type="text"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    placeholder={
                      lang === 'zh'
                        ? 'YouTube / Short / Reel / TikTok 链接或描述：“保留快节奏钩子，改为量子计算主题”'
                        : 'Paste YouTube Short/Reel URL or describe the hook & pacing you want to keep...'
                    }
                    className="w-full rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    executeGroundedSearch({
                      targetMode: 'proposal',
                      queryText: promptInput,
                      refText: referenceInput,
                    })
                  }
                  className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading
                    ? useGoogleSearch
                      ? lang === 'zh'
                        ? '正在执行实时 Google Search 检索与提案规划...'
                        : 'Running Live Google Search & Proposal...'
                      : lang === 'zh'
                      ? '正在基于静态训练数据生成制作提案...'
                      : 'Generating Proposal from Static Training Data...'
                    : useGoogleSearch
                    ? lang === 'zh'
                      ? '运行实时网络研究与生成制作提案 (Google Search)'
                      : 'Run Grounded Research & Production Plan (Live Web)'
                    : lang === 'zh'
                    ? '基于静态训练数据生成制作提案 (Offline Mode)'
                    : 'Generate Production Plan (Static Training Data)'}
                </button>

                {/* Tested Prompt Gallery Picker */}
                <div className="mt-7 pt-6 border-t border-[#E5E0D5]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#57534E]">
                      {lang === 'zh'
                        ? '官方提示词画廊 (点击直接载入)'
                        : 'PROMPT GALLERY (CLICK TO LOAD)'}
                    </span>
                    <span className="text-xs font-mono text-[#78716C] tabular-nums">
                      {filteredPrompts.length} prompts
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {[
                      { id: 'all', zh: '全部', en: 'All' },
                      { id: 'reference', zh: '参考视频', en: 'Reference' },
                      { id: 'zero-key', zh: '零密钥', en: 'Zero-Key' },
                      { id: 'documentary', zh: '真实素材纪录片', en: 'Real Footage' },
                      { id: 'provider-backed', zh: '$0.15–$1.50', en: '$0.15–$1.50' },
                      { id: 'full-setup', zh: '电影级', en: 'Cinematic' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPromptGroupFilter(tab.id)}
                        className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          promptGroupFilter === tab.id
                            ? 'bg-[#1C1917] text-[#FBF9F5] font-medium'
                            : 'bg-[#F3EFE6] text-[#57534E] hover:text-[#1C1917]'
                        }`}
                      >
                        {lang === 'zh' ? tab.zh : tab.en}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {filteredPrompts.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/40 hover:bg-[#F3EFE6] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectCuratedPrompt(item)}
                            className="text-left text-xs text-[#1C1917] font-medium hover:text-[#9A3412] leading-snug cursor-pointer"
                          >
                            “{lang === 'zh' ? item.promptZh : item.promptEn}”
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyPrompt(
                                item.id,
                                lang === 'zh' ? item.promptZh : item.promptEn
                              )
                            }
                            title="Copy prompt"
                            className="text-[#78716C] hover:text-[#1C1917] p-1 shrink-0 cursor-pointer"
                          >
                            {copiedPromptId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-[#15803D]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="mt-1.5 text-[11px] font-mono text-[#78716C] flex flex-wrap items-center gap-1.5">
                          <span>{item.pipeline}</span>
                          <span>·</span>
                          <span>{item.runtime}</span>
                          <span>·</span>
                          <span className="text-[#9A3412]">{item.estimatedCost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fact-check' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="om-factcheck-input"
                    className="text-xs font-mono uppercase tracking-wider text-[#57534E]"
                  >
                    {lang === 'zh'
                      ? '粘贴旁白脚本、纪录片论断或视频文案以进行事实核验'
                      : 'PASTE NARRATION SCRIPT OR DOCUMENTARY CLAIMS TO FACT-CHECK'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFactCheckInput('')}
                    className="text-xs text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {lang === 'zh' ? '清空' : 'Clear'}
                  </button>
                </div>

                <textarea
                  id="om-factcheck-input"
                  rows={6}
                  value={factCheckInput}
                  onChange={(e) => setFactCheckInput(e.target.value)}
                  placeholder={
                    lang === 'zh'
                      ? '粘贴您的解说词初稿、科学数据或历史事件描述。系统将核实每一个事实点并生成执行摘要...'
                      : 'Paste your script draft, scientific statistics, or historical claims for verification...'
                  }
                  className="w-full rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#1E3A8A]"
                />

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    executeGroundedSearch({
                      targetMode: 'fact-check',
                      queryText: factCheckInput,
                    })
                  }
                  className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#1E3A8A] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  {isLoading
                    ? useGoogleSearch
                      ? lang === 'zh'
                        ? '正在通过 Google Search 核验脚本事实...'
                        : 'Verifying Claims via Google Search...'
                      : lang === 'zh'
                      ? '正在基于静态训练数据核验脚本...'
                      : 'Auditing Script via Static Training Data...'
                    : useGoogleSearch
                    ? lang === 'zh'
                      ? '运行实时事实核查与生成执行摘要 (Google Search)'
                      : 'Verify Script & Summarize (Live Google Search)'
                    : lang === 'zh'
                    ? '基于静态训练数据核查脚本 (Offline Mode)'
                    : 'Audit Script (Static Training Data Only)'}
                </button>

                <div className="mt-6 pt-5 border-t border-[#E5E0D5]">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#57534E] mb-3">
                    {lang === 'zh'
                      ? '快速测试样本 (包含常见幻觉或待核实数据)'
                      : 'SAMPLE SCRIPTS FOR FACT-CHECK TESTING'}
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        labelZh: 'Sample 1: CRISPR Gene Editing Timeline & Mechanism',
                        labelEn: 'Sample 1: CRISPR Gene Editing Timeline & Mechanism',
                        text: 'In a 60-second explainer script: CRISPR-Cas9 completed its first human clinical gene-editing trial in 1995, and it works by using an RNA-guided enzyme to synthesize brand-new DNA strands from scratch with 100% zero off-target edits without any guide sequence.',
                      },
                      {
                        labelZh: 'Sample 2: Global Coffee Consumption Per Capita Claims',
                        labelEn: 'Sample 2: Global Coffee Consumption Per Capita Claims',
                        text: 'Data explainer script: Brazil and Colombia have the highest per-capita coffee consumption in the world at over 18 kg per person annually, while Nordic countries like Finland consume less than 2 kg per capita.',
                      },
                      {
                        labelZh: 'Sample 3: ARPANET First Message Documentary Narration',
                        labelEn: 'Sample 3: ARPANET First Message Documentary Narration',
                        text: 'Late at night on October 29, 1969, UCLA transmitted the very first message over ARPANET to Stanford Research Institute: the full phrase "HELLO WORLD" succeeded on the first try, marking the official birth of the World Wide Web.',
                      },
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFactCheckInput(sample.text)}
                        className="w-full text-left p-2.5 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/50 hover:bg-[#F3EFE6] text-xs text-[#1C1917] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="truncate font-medium">
                          {lang === 'zh' ? sample.labelZh : sample.labelEn}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'news-agent' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="om-news-input"
                    className="text-xs font-mono uppercase tracking-wider text-[#57534E]"
                  >
                    {lang === 'zh'
                      ? '询问最新时事动态、引证新闻报道或构思新闻视频'
                      : 'ASK ABOUT CURRENT EVENTS, CITE RECENT NEWS OR FACT-CHECK'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewsAgentInput('')}
                    className="text-xs text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {lang === 'zh' ? '清空' : 'Clear'}
                  </button>
                </div>

                <textarea
                  id="om-news-input"
                  rows={5}
                  value={newsAgentInput}
                  onChange={(e) => setNewsAgentInput(e.target.value)}
                  placeholder={
                    lang === 'zh'
                      ? '输入任何当前热点事件、科技突破或行业动态，智能体将连接实时 Google Search 引证最新新闻并推荐视频化方案...'
                      : 'Ask about breaking news, scientific milestones, or current events to get cited Google Search answers and video script angles...'
                  }
                  className="w-full rounded-lg border border-[#D6CEBE] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#15803D]"
                />

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    executeGroundedSearch({
                      targetMode: 'news-agent',
                      queryText: newsAgentInput,
                    })
                  }
                  className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Newspaper className="w-4 h-4" />
                  {isLoading
                    ? useGoogleSearch
                      ? lang === 'zh'
                        ? '正在检索实时 Google Search 新闻信源...'
                        : 'Searching Live News & Citations...'
                      : lang === 'zh'
                      ? '正在基于静态训练数据分析议题...'
                      : 'Analyzing Topic via Static Training Data...'
                    : useGoogleSearch
                    ? lang === 'zh'
                      ? '检索实时新闻并生成引证简报 (Google Search)'
                      : 'Query Current Events & Cite News (Live Web)'
                    : lang === 'zh'
                    ? '基于静态训练数据分析议题 (Offline Mode)'
                    : 'Analyze Topic (Static Training Data Only)'}
                </button>

                <div className="mt-6 pt-5 border-t border-[#E5E0D5]">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#57534E] mb-3">
                    {lang === 'zh'
                      ? '热门时事与新闻核查示例 (点击直接提问)'
                      : 'SAMPLE CURRENT EVENT QUERIES'}
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        labelZh: 'News 1: Recent Solid-State EV Battery & Charging Breakthroughs',
                        labelEn: 'News 1: Recent Solid-State EV Battery & Charging Breakthroughs',
                        text: 'Search for recent news reports on solid-state EV battery mass production timelines and energy density benchmarks, verify the key figures, and propose a 60-second data explainer script hook.',
                      },
                      {
                        labelZh: 'News 2: NASA Europa Clipper & Outer Planet Exploration Updates',
                        labelEn: 'News 2: NASA Europa Clipper & Outer Planet Exploration Updates',
                        text: 'What are the latest mission updates and scientific objectives for NASA Europa Clipper? Cite recent sources and suggest a documentary montage angle.',
                      },
                      {
                        labelZh: 'News 3: Open-Source Video Generation Models Ecosystem',
                        labelEn: 'News 3: Open-Source Video Generation Models Ecosystem',
                        text: 'Compare the latest open-source local video generation models (WAN 2.1, HunyuanVideo, LTX-Video), including VRAM requirements and motion quality, and outline key points for a technical explainer.',
                      },
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewsAgentInput(sample.text)}
                        className="w-full text-left p-2.5 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/50 hover:bg-[#F3EFE6] text-xs text-[#1C1917] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="truncate font-medium">
                          {lang === 'zh' ? sample.labelZh : sample.labelEn}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Grounded Research Briefing & Citations Output */}
          <div
            className={`${
              showDesktopSidebar ? 'lg:col-span-7 xl:col-span-5' : 'lg:col-span-7'
            } bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-6 md:p-7`}
          >
            {/* Output Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E0D5]">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono text-[#78716C] flex flex-wrap items-center gap-2">
                  <span>
                    {currentResult.mode === 'proposal'
                      ? 'STAGE 01 & 02 · RESEARCH BRIEFING'
                      : currentResult.mode === 'fact-check'
                      ? 'REVIEWER SKILL · FACT-CHECK REPORT'
                      : 'NEWS AGENT · CURRENT EVENTS BRIEF'}
                  </span>
                  <span>·</span>
                  <span
                    className={
                      currentResult.groundingMode === 'static-training'
                        ? 'text-[#B45309] font-semibold'
                        : 'text-[#15803D] font-semibold'
                    }
                  >
                    {currentResult.groundingMode === 'static-training'
                      ? lang === 'zh'
                        ? '数据源: 仅静态训练数据 (STATIC WEIGHTS)'
                        : 'SOURCE: STATIC TRAINING DATA ONLY'
                      : lang === 'zh'
                      ? '数据源: 实时 GOOGLE SEARCH 联网数据'
                      : 'SOURCE: LIVE GOOGLE SEARCH WEB DATA'}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{currentResult.timestamp}</span>
                </div>
                <h3 className="text-lg font-editorial font-semibold text-[#1C1917] mt-1 line-clamp-1">
                  {currentResult.query}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    executeGroundedSearch({
                      targetMode: currentResult.mode,
                      queryText: currentResult.query,
                      refText: currentResult.referenceVideo || '',
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] bg-[#F3EFE6] hover:bg-[#E5E0D5] text-xs font-medium text-[#1C1917] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  title={
                    lang === 'zh'
                      ? '使用当前全局数据源设置重新生成此简报'
                      : 'Re-run this prompt using the active data source setting'
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#9A3412]" />
                  {lang === 'zh' ? '重新执行' : 'Re-invoke'}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentMarkdown}
                  className="px-2.5 py-1.5 rounded-lg border border-[#D6CEBE] bg-[#F3EFE6] hover:bg-[#E5E0D5] text-xs font-medium text-[#1C1917] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedMarkdown ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                      {lang === 'zh' ? '已复制' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                      {lang === 'zh' ? '复制简报' : 'Copy'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBriefJson}
                  title="Export JSON Checkpoint"
                  className="p-1.5 rounded-lg border border-[#D6CEBE] bg-[#F3EFE6] hover:bg-[#E5E0D5] text-[#1C1917] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#78716C]" />
                </button>
              </div>
            </div>

            {/* Error State */}
            {errorMsg && (
              <div className="mt-4 p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {lang === 'zh' ? '检索执行提醒' : 'Research Request Notice'}
                  </p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="py-12 space-y-4 animate-pulse">
                <div className="h-4 bg-[#E5E0D5] rounded w-2/5" />
                <div className="h-3 bg-[#E5E0D5]/70 rounded w-full" />
                <div className="h-3 bg-[#E5E0D5]/70 rounded w-11/12" />
                <div className="h-3 bg-[#E5E0D5]/70 rounded w-4/5" />
                <div className="pt-4 h-4 bg-[#E5E0D5] rounded w-1/3" />
                <div className="h-24 bg-[#F3EFE6] border border-[#E5E0D5] rounded-lg w-full" />
                <p className="text-xs font-mono text-[#78716C] pt-2">
                  {useGoogleSearch
                    ? lang === 'zh'
                      ? '正在调用 gemini-3.8-flash 与 Google Search 工具检索实时网络来源并生成结构化简报...'
                      : 'Querying gemini-3.8-flash with googleSearch tool for live citations and structured production brief...'
                    : lang === 'zh'
                    ? '已禁用实时 Google Search：正在仅基于 gemini-3.8-flash 静态训练数据权重生成简报...'
                    : 'Google Search disabled: Generating brief strictly from gemini-3.8-flash static training weights...'}
                </p>
              </div>
            ) : (
              <>
                {currentResult.referenceVideo && (
                  <div className="mt-4 px-3.5 py-2.5 rounded-lg bg-[#F3EFE6] border border-[#E5E0D5] text-xs text-[#57534E] flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-[#9A3412] shrink-0" />
                    <span className="font-mono text-[#1C1917] shrink-0">CONTEXT:</span>
                    <span className="truncate">{currentResult.referenceVideo}</span>
                  </div>
                )}

                {/* Markdown Content */}
                <div className="mt-4 markdown-editorial text-sm max-w-[72ch]">
                  <Markdown>{currentResult.markdown}</Markdown>
                </div>

                {/* Grounded Web Citations Footer */}
                <div className="mt-8 pt-5 border-t border-[#E5E0D5]">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono uppercase tracking-wider ${
                        currentResult.groundingMode === 'static-training'
                          ? 'text-[#B45309]'
                          : 'text-[#1E3A8A]'
                      }`}
                    >
                      {currentResult.groundingMode === 'static-training'
                        ? lang === 'zh'
                          ? '数据溯源：仅静态模型训练数据 (无实时网页引证)'
                          : 'DATA PROVENANCE: STRICTLY STATIC TRAINING DATA (0 LIVE WEB CITATIONS)'
                        : lang === 'zh'
                        ? `GOOGLE SEARCH 实时引证来源 (${currentResult.citations.length})`
                        : `VERIFIED GOOGLE SEARCH CITATIONS (${currentResult.citations.length})`}
                    </span>
                    <span className="text-[11px] font-mono text-[#78716C]">
                      {currentResult.groundingMode === 'static-training'
                        ? 'tools: [] (googleSearch disabled)'
                        : 'groundingMetadata.groundingChunks'}
                    </span>
                  </div>

                  {currentResult.groundingMode === 'static-training' ? (
                    <div className="p-3.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[#92400E] leading-relaxed">
                        {lang === 'zh'
                          ? '此简报生成时已关闭实时 Google Search 联网功能，内容完全基于 AI 模型的静态预训练权重，未检索实时互联网网页。'
                          : 'This briefing was generated with real-time Google Search disabled. The AI relied strictly on static pre-trained model weights without live web verification.'}
                      </p>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          if (!useGoogleSearch) {
                            onToggleGoogleSearch();
                          }
                          executeGroundedSearch({
                            targetMode: currentResult.mode,
                            queryText: currentResult.query,
                            refText: currentResult.referenceVideo || '',
                            overrideGrounding: true,
                          });
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {lang === 'zh'
                          ? '开启 Google Search 并重新核验'
                          : 'Enable Google Search & Re-verify'}
                      </button>
                    </div>
                  ) : currentResult.citations.length === 0 ? (
                    <p className="text-xs text-[#78716C]">
                      {lang === 'zh'
                        ? '该响应已由 Gemini 知识库与搜索工具综合生成。点击“重新执行”获取最新网页链接。'
                        : 'Synthesized with search grounding. Click "Re-invoke" to fetch fresh web links.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentResult.citations.map((cite, index) => (
                        <a
                          key={index}
                          href={cite.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/50 hover:bg-[#F3EFE6] hover:border-[#1E3A8A]/40 transition-colors flex items-start justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <span className="text-[11px] font-mono text-[#1E3A8A] mr-1.5 tabular-nums">
                              [{String(index + 1).padStart(2, '0')}]
                            </span>
                            <span className="text-xs font-medium text-[#1C1917] group-hover:text-[#1E3A8A] line-clamp-1">
                              {cite.title}
                            </span>
                            <p className="text-[11px] font-mono text-[#78716C] truncate mt-0.5">
                              {cite.uri}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#1E3A8A] shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Column 3: Persistent Recent Searches Sidebar (Desktop XL) */}
          {showDesktopSidebar && (
            <aside className="hidden xl:block xl:col-span-3 bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E0D5]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#9A3412]" />
                  <h3 className="text-sm font-editorial font-semibold text-[#1C1917]">
                    {lang === 'zh' ? '最近检索与简报库' : 'Recent Searches'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#78716C] tabular-nums">
                  {recentSearches.length} saved
                </span>
              </div>
              {renderRecentSearchesList()}
            </aside>
          )}
        </div>
      </div>

      {/* Slide-Over Recent Searches Drawer (Mobile / Tablet / When Triggered) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FBF9F5] h-full border-l border-[#E5E0D5] p-6 flex flex-col justify-between overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E0D5]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#9A3412]" />
                  <h3 className="text-lg font-editorial font-semibold text-[#1C1917]">
                    {lang === 'zh'
                      ? '最近检索与研究简报抽屉'
                      : 'Recent Searches & Briefings'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#E5E0D5] text-[#1C1917] cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderRecentSearchesList()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
