'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Sparkles,
  Terminal,
  Copy,
  Check,
  X,
  ArrowUpRight,
  ExternalLink,
  Film,
  Volume2,
  VolumeX,
  Globe,
  BookOpen,
  LogIn,
  LogOut,
  Cloud,
  Share2,
  Link2,
} from 'lucide-react';
import {
  SHOWCASE_VIDEOS,
  ShowcaseVideo,
} from '@/lib/openmontage-data';
import { MontyClapperEmblem } from '@/components/monty-clapper-graphic';
import { ResearchStudio } from '@/components/research-studio';
import { TrendingPulse } from '@/components/trending-pulse';
import { PipelineGovernanceExplorer } from '@/components/pipeline-governance-explorer';
import {
  auth,
  db,
  sanitizeId,
  testFirestoreConnection,
  signInWithGoogle,
  signOutUser,
  saveUserPreferencesToCloud,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function OpenMontagePage() {
  const [lang] = useState<'zh' | 'en'>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasCloudSettingsDoc, setHasCloudSettingsDoc] = useState<boolean>(false);
  const [showcaseFilter, setShowcaseFilter] = useState<
    'all' | 'native-video' | 'zero-video-api' | 'single-key-ad'
  >('all');
  const [selectedFilmModal, setSelectedFilmModal] =
    useState<ShowcaseVideo | null>(null);
  const [showQuickstartModal, setShowQuickstartModal] = useState(false);
  const [heroMuted, setHeroMuted] = useState(true);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeShareFilmId, setActiveShareFilmId] = useState<string | null>(null);
  const [copiedShareBadge, setCopiedShareBadge] = useState<{
    filmId: string;
    label: string;
  } | null>(null);

  // Shared Studio & Provider Key State
  const [studioExternalPrompt, setStudioExternalPrompt] = useState('');
  const [studioExternalReference, setStudioExternalReference] = useState('');
  const [availableKeys, setAvailableKeys] = useState<string[]>([
    'FAL_KEY',
    'GOOGLE_API_KEY',
  ]);

  // Global Google Search Grounding Settings State (true = Live Web Data, false = Strictly Static Training Data)
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(true);
  const [showGroundingSettingsPopover, setShowGroundingSettingsPopover] =
    useState<boolean>(false);

  // Load persisted Google Search grounding preference and initialize Firebase connection & Auth listener
  useEffect(() => {
    testFirestoreConnection();
    try {
      const saved = localStorage.getItem('openmontage_google_search_grounding');
      if (saved === 'false') {
        setUseGoogleSearch(false);
      } else if (saved === 'true') {
        setUseGoogleSearch(true);
      }
    } catch {
      // Ignore storage error
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const safeUid = sanitizeId(user.uid);
        const path = `users/${safeUid}/settings/global`;
        try {
          const snap = await getDoc(doc(db, 'users', safeUid, 'settings', 'global'));
          if (snap.exists()) {
            setHasCloudSettingsDoc(true);
            const data = snap.data();
            if (typeof data.useGoogleSearch === 'boolean') {
              setUseGoogleSearch(data.useGoogleSearch);
            }
          } else {
            setHasCloudSettingsDoc(false);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, path);
        }
      } else {
        setHasCloudSettingsDoc(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleGoogleSearch = useCallback(() => {
    setUseGoogleSearch((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('openmontage_google_search_grounding', String(next));
      } catch {
        // Ignore storage error
      }
      if (currentUser) {
        saveUserPreferencesToCloud({
          userId: currentUser.uid,
          useGoogleSearch: next,
          lang: 'en',
          isExisting: hasCloudSettingsDoc,
        })
          .then(() => setHasCloudSettingsDoc(true))
          .catch(() => {});
      }
      return next;
    });
  }, [currentUser, hasCloudSettingsDoc]);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFilmModal(null);
        setShowQuickstartModal(false);
        setShowGroundingSettingsPopover(false);
        setActiveShareFilmId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hydrate showcase film or pipeline configuration when visiting a shared deep link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedFilmId = params.get('film');
      const sharedPrompt = params.get('prompt');
      const sharedPipeline = params.get('pipeline');
      const sharedRuntime = params.get('runtime');
      const sharedKeys = params.get('keys');

      if (sharedKeys !== null) {
        const parsedKeys = sharedKeys
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        setAvailableKeys(parsedKeys);
      }

      if (sharedFilmId) {
        const matchedFilm = SHOWCASE_VIDEOS.find((v) => v.id === sharedFilmId);
        if (matchedFilm) {
          setStudioExternalPrompt(sharedPrompt || matchedFilm.promptUsed);
          setStudioExternalReference(
            `Shared Pipeline Config: ${matchedFilm.titleEn} (${
              sharedPipeline || matchedFilm.pipeline
            } · ${sharedRuntime || matchedFilm.runtime} · Cost ${matchedFilm.cost})`
          );
          if (params.get('view') === 'sheet') {
            setSelectedFilmModal(matchedFilm);
          }
          return;
        }
      }

      if (sharedPrompt) {
        setStudioExternalPrompt(sharedPrompt);
        if (sharedPipeline || sharedRuntime) {
          setStudioExternalReference(
            `Shared Pipeline Config: ${sharedPipeline || 'Animated Explainer'} (${
              sharedRuntime || 'Remotion'
            })`
          );
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const buildPipelineDeepLink = useCallback(
    (film: ShowcaseVideo) => {
      const baseUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : 'https://openmontage.dev/';
      const params = new URLSearchParams();
      params.set('film', film.id);
      params.set('pipeline', film.pipeline);
      params.set('runtime', film.runtime);
      params.set('cost', film.cost);
      if (availableKeys.length > 0) {
        params.set('keys', availableKeys.join(','));
      }
      params.set('prompt', film.promptUsed);
      return `${baseUrl}?${params.toString()}#research-studio`;
    },
    [availableKeys]
  );

  const handleCopyShareItem = useCallback(
    (film: ShowcaseVideo, mode: 'deep-link' | 'video-url') => {
      const targetText =
        mode === 'video-url' ? film.videoUrl : buildPipelineDeepLink(film);
      navigator.clipboard.writeText(targetText);
      setCopiedShareBadge({
        filmId: film.id,
        label: mode === 'video-url' ? 'Video URL Copied' : 'Pipeline Link Copied',
      });
      setActiveShareFilmId(null);
      setTimeout(() => {
        setCopiedShareBadge((prev) =>
          prev?.filmId === film.id ? null : prev
        );
      }, 2200);
    },
    [buildPipelineDeepLink]
  );

  const handleLoadIntoStudio = useCallback((prompt: string, referenceNote?: string) => {
    setStudioExternalPrompt(prompt);
    setStudioExternalReference(referenceNote || '');
  }, []);

  const handleClearExternalPrompt = useCallback(() => {
    setStudioExternalPrompt('');
    setStudioExternalReference('');
  }, []);

  const handleToggleKey = useCallback((envKey: string) => {
    setAvailableKeys((prev) =>
      prev.includes(envKey) ? prev.filter((k) => k !== envKey) : [...prev, envKey]
    );
  }, []);

  const handleResetZeroKeys = useCallback(() => {
    setAvailableKeys([]);
  }, []);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 1800);
  };

  const filteredVideos =
    showcaseFilter === 'all'
      ? SHOWCASE_VIDEOS
      : SHOWCASE_VIDEOS.filter((v) => v.category === showcaseFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-xs border-b border-[#E5E0D5]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#"
            className="text-xl font-editorial font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0"
          >
            OpenMontage
          </a>

          {/* Zone 2: 5 Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#57534E]">
            <a
              href="#showcase"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'zh' ? '作品展映' : 'Showcase'}
            </a>
            <a
              href="#research-studio"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'zh' ? '实时研究台' : 'Research Studio'}
            </a>
            <a
              href="#live-trends"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'zh' ? '热门选题' : 'Live Trends'}
            </a>
            <a
              href="#pipelines"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'zh' ? '流水线架构' : 'Pipelines'}
            </a>
            <a
              href="#providers"
              className="hover:text-[#1C1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'zh' ? '提供商评分' : 'Providers'}
            </a>
          </nav>

          {/* Zone 3: Global Google Search Grounding Settings Toggle + Primary Action */}
          <div className="flex items-center gap-3 shrink-0 relative">
            {/* Global Real-Time Google Search Grounding Toggle Switch */}
            <div className="flex items-center rounded-lg border border-[#D6CEBE] bg-[#F3EFE6] p-1">
              <button
                type="button"
                role="switch"
                aria-checked={useGoogleSearch}
                onClick={handleToggleGoogleSearch}
                title={
                  useGoogleSearch
                    ? lang === 'zh'
                      ? '当前已开启实时 Google Search 联网检索（点击切换为仅静态训练数据）'
                      : 'Real-Time Google Search Grounding is ON (Click to switch to strictly static training data)'
                    : lang === 'zh'
                    ? '当前仅使用静态训练数据（点击开启实时 Google Search 联网检索）'
                    : 'Strictly Static Training Data mode is active (Click to enable live Google Search grounding)'
                }
                className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer hover:bg-[#E5E0D5]/70"
              >
                <Globe
                  className={`w-3.5 h-3.5 shrink-0 ${
                    useGoogleSearch ? 'text-[#15803D]' : 'text-[#B45309]'
                  }`}
                />
                <span className="text-[#1C1917] font-medium whitespace-nowrap">
                  {lang === 'zh' ? 'Google Search:' : 'Google Search:'}
                </span>
                <span
                  className={`font-semibold whitespace-nowrap ${
                    useGoogleSearch ? 'text-[#15803D]' : 'text-[#B45309]'
                  }`}
                >
                  {useGoogleSearch
                    ? lang === 'zh'
                      ? '实时联网 (ON)'
                      : 'LIVE WEB (ON)'
                    : lang === 'zh'
                    ? '静态数据 (OFF)'
                    : 'STATIC DATA (OFF)'}
                </span>
                {/* Visual Switch Track */}
                <span
                  className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                    useGoogleSearch ? 'bg-[#15803D]' : 'bg-[#A8A29E]'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-[#FBF9F5] transition-transform ${
                      useGoogleSearch ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowGroundingSettingsPopover((s) => !s)}
                aria-label="Data source transparency details"
                title={
                  lang === 'zh'
                    ? '查看全局数据源透明度说明'
                    : 'Inspect Global Data Source Transparency Settings'
                }
                className="px-1.5 py-1 text-[11px] font-mono text-[#57534E] hover:text-[#1C1917] border-l border-[#D6CEBE] cursor-pointer"
              >
                {lang === 'zh' ? '设置' : 'Info'}
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setShowQuickstartModal(true)}
              className="px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-[#292524] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'zh' ? '快速开始与 CLI' : 'Quickstart & CLI'}
            </button>

            {/* Global Settings Transparency Popover */}
            {showGroundingSettingsPopover && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-[#D6CEBE] bg-[#FBF9F5] shadow-xl p-4 z-50 text-xs">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E5E0D5]">
                  <div>
                    <div className="font-mono uppercase tracking-wider text-[#9A3412] font-semibold">
                      {lang === 'zh'
                        ? '全局数据源设置 (DATA PROVENANCE)'
                        : 'GLOBAL DATA SOURCE SETTINGS'}
                    </div>
                    <p className="text-[#57534E] mt-0.5">
                      {lang === 'zh'
                        ? '控制所有研究工作台操作的实时联网状态'
                        : 'Controls real-time web grounding across all studio operations'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGroundingSettingsPopover(false)}
                    className="p-1 rounded hover:bg-[#F3EFE6] text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (!useGoogleSearch) handleToggleGoogleSearch();
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      useGoogleSearch
                        ? 'bg-[#F3EFE6] border-[#15803D]'
                        : 'bg-white border-[#E5E0D5] hover:bg-[#F3EFE6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-semibold text-[#15803D]">
                      <span>
                        {lang === 'zh'
                          ? '● 实时 Google Search 联网模式 (ON)'
                          : '● Live Google Search Grounding (ON)'}
                      </span>
                      {useGoogleSearch && <span>ACTIVE</span>}
                    </div>
                    <p className="mt-1 text-[#44403C] leading-relaxed">
                      {lang === 'zh'
                        ? '启用 tools: [{ googleSearch: {} }]。提案规划、脚本事实核查、时事引证智能体与流水线模拟均实时检索最新网页并提取可验证的引用链接。'
                        : 'Attaches tools: [{ googleSearch: {} }] to gemini-3.8-flash. All studio operations fetch current web data and return verified source URLs.'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (useGoogleSearch) handleToggleGoogleSearch();
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      !useGoogleSearch
                        ? 'bg-[#FFFBEB] border-[#D97706]'
                        : 'bg-white border-[#E5E0D5] hover:bg-[#F3EFE6]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-semibold text-[#B45309]">
                      <span>
                        {lang === 'zh'
                          ? '○ 仅静态模型训练数据模式 (OFF)'
                          : '○ Strictly Static Training Data (OFF)'}
                      </span>
                      {!useGoogleSearch && <span>ACTIVE</span>}
                    </div>
                    <p className="mt-1 text-[#44403C] leading-relaxed">
                      {lang === 'zh'
                        ? '完全禁用外部联网搜索。AI 严格仅使用预训练静态权重回答，不产生外部网页请求，并在简报中透明标注静态数据局限。'
                        : 'Disables live Google Search completely. The AI relies strictly on static pre-trained weights and transparently flags time-sensitive claims.'}
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* WORKSPACE UTILITY & MASCOT BAR (BELOW HEADER) */}
      <div className="border-b border-[#E5E0D5] bg-[#F3EFE6]/60">
        <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#57534E] font-mono">
            <span>Monty the Clapper — Official Mascot</span>
            <span>·</span>
            <span className="text-[#9A3412] font-semibold">
              #1 on GitHub Trending (Repository of the Day)
            </span>
            <span>·</span>
            <span
              className={
                useGoogleSearch
                  ? 'text-[#15803D] font-semibold'
                  : 'text-[#B45309] font-semibold'
              }
            >
              {useGoogleSearch
                ? 'DATA: LIVE GOOGLE SEARCH'
                : 'DATA: STATIC TRAINING WEIGHTS ONLY'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.youtube.com/@OpenMontage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#57534E] hover:text-[#9A3412] font-mono inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              YouTube @OpenMontage
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#D6CEBE]">·</span>
            <a
              href="https://github.com/calesthio/OpenMontage/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#57534E] hover:text-[#1C1917] font-mono inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              GitHub Discussions
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#D6CEBE]">·</span>
            {/* Cloud Persistence Sign-In / Sign-Out Control */}
            {currentUser ? (
              <div className="inline-flex items-center gap-2 font-mono">
                <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                  <Cloud className="w-3.5 h-3.5" />
                  Cloud Sync ({currentUser.displayName || currentUser.email || 'Signed In'})
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser().catch(() => {})}
                  className="px-2 py-0.5 rounded border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#E5E0D5] text-[#1C1917] inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle().catch(() => {})}
                className="px-2.5 py-1 rounded border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#E5E0D5] text-[#1C1917] font-mono inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-[#9A3412]" />
                Sign In to Sync History
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* HERO SECTION — SPLIT SCREEN WITH MATCHING HEIGHT + FULL-WIDTH KPI STRIP BELOW */}
        <section className="py-12 md:py-16 border-b border-[#E5E0D5]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
              {/* Left Column: Typographic Hierarchy & Proposition (6 cols) */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <MontyClapperEmblem className="w-12 h-12 shrink-0" />
                    <div className="text-xs font-mono text-[#78716C]">
                      <span className="block text-[#9A3412] font-semibold uppercase tracking-widest">
                        FIRST OPEN-SOURCE AGENTIC VIDEO PRODUCTION SYSTEM
                      </span>
                      <span>Claude Code · Cursor · Copilot · Windsurf · Codex · OpenClaw</span>
                    </div>
                  </div>

                  <h1
                    className="font-editorial font-semibold tracking-tight text-[#1C1917] leading-[1.12]"
                    style={{
                      fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)',
                      textWrap: 'balance',
                    }}
                  >
                    {lang === 'zh'
                      ? '将您的 AI 编程助手变成一个完整的视频制作工作室'
                      : 'Turn Your AI Coding Assistant into a Complete Video Production Studio'}
                  </h1>

                  <p className="mt-5 text-base text-[#44403C] leading-relaxed max-w-[64ch]">
                    {lang === 'zh'
                      ? '用通俗的语言描述您的需求——您的智能体会自动处理实时网络研究、脚本编写、资产生成、剪辑以及最终合成。不仅支持 AI 图像/视频生成，更能从 Archive.org、NASA、Wikimedia 与 Pexels 检索真实的动态画面（“video video”），剪辑到时间线中并渲染出经过多点自我审查的成品。'
                      : 'Describe what you want in plain language—your agent autonomously handles live web research, scripting, asset generation, editing, and final composition. Produce both AI-generated animations and true native archival footage ("video video") with rigorous quality gates.'}
                  </p>

                  {/* Editorial Callout on Native Video vs Stills */}
                  <div className="mt-6 p-4 rounded-xl bg-[#F3EFE6] border border-[#E5E0D5]">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#9A3412] font-semibold mb-1">
                      {lang === 'zh'
                        ? '核心区别 · 真正的原生视频 (NATIVE VIDEO) 与零密钥自由'
                        : 'CRITICAL DISTINCTION · TRUE NATIVE FOOTAGE & ZERO-KEY FREEDOM'}
                    </div>
                    <p className="text-xs text-[#44403C] leading-relaxed">
                      {lang === 'zh'
                        ? '绝非“让几张静态图片动起来就称为视频”的把戏：OpenMontage 既能用 Veo 3 / Kling v3 生成电影级镜头，也能在零付费 API 密钥下通过 CLIP 索引开源档案库剪辑真正的纪录片蒙太奇，或用 Remotion / HyperFrames 驱动视差粒子与 SVG 角色动画。'
                        : 'Not the usual "pan across 4 static images and call it a video" trick: OpenMontage retrieves real dynamic footage from open archives via CLIP, or orchestrates Veo 3, Kling v3, FLUX, Remotion, and HyperFrames with full audit logs.'}
                    </p>
                  </div>
                </div>

                {/* Hero Action Row */}
                <div className="mt-8 pt-6 border-t border-[#E5E0D5] flex flex-wrap items-center gap-4">
                  <a
                    href="#research-studio"
                    className="px-5 py-3 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    {lang === 'zh'
                      ? '启动实时网络研究与提案工作台'
                      : 'Launch Live Research & Proposal Studio'}
                  </a>
                  <a
                    href="#showcase"
                    className="px-5 py-3 rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#1C1917] text-sm font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 text-[#9A3412]" />
                    {lang === 'zh' ? '观看 6 部真实成片与成本拆解' : 'Watch 6 Real Films & Cost Sheets'}
                  </a>
                </div>
              </div>

              {/* Right Column: Flagship Screening Monitor at Matching Height (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="flex-1 rounded-2xl bg-[#141210] border border-[#292524] p-4 md:p-5 flex flex-col justify-between text-[#FBF9F5]">
                  {/* Top Monitor Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs font-mono text-[#D6CEBE]">
                    <span>FEATURED REEL · OM-FILM-01</span>
                    <span>SIGNAL FROM TOMORROW · VEO + REMOTION</span>
                  </div>

                  {/* Video Player Container */}
                  <div className="relative my-3 rounded-xl overflow-hidden bg-black aspect-video border border-white/10">
                    <video
                      src={SHOWCASE_VIDEOS[0].videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted={heroMuted}
                      loop
                      playsInline
                    />
                    <button
                      type="button"
                      onClick={() => setHeroMuted((m) => !m)}
                      className="absolute top-3 right-3 px-2.5 py-1.5 rounded-md bg-black/75 hover:bg-black text-white text-xs font-mono inline-flex items-center gap-1.5 border border-white/15 cursor-pointer"
                    >
                      {heroMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-[#F97316]" />
                          {lang === 'zh' ? '点击开启声音' : 'Unmute Audio'}
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
                          {lang === 'zh' ? '声音已开启' : 'Audio Live'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Monitor Bottom Telemetry & Reference Action */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#D6CEBE]">
                      <span className="font-semibold text-white">
                        {lang === 'zh'
                          ? '《来自明天的信号 (SIGNAL FROM TOMORROW)》'
                          : 'SIGNAL FROM TOMORROW'}
                      </span>
                      <span className="mx-2 text-white/40">·</span>
                      <span className="font-mono text-[11px]">
                        Concept → Screenplay → Scene Plan → Veo Clips → Score → Remotion Render
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleLoadIntoStudio(
                          SHOWCASE_VIDEOS[0].promptUsed,
                          'SIGNAL FROM TOMORROW — Three-act sci-fi trailer pacing with Veo motion clips and Remotion composition'
                        );
                        const el = document.getElementById('research-studio');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-md bg-[#9A3412] hover:bg-[#B45309] text-white text-xs font-mono transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {lang === 'zh' ? '以此片为参考立项' : 'Use as Reference'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL-WIDTH 4-COLUMN QUANTITATIVE PROOF STRIP BELOW HERO SPLIT */}
            <div className="mt-10 pt-8 border-t border-[#E5E0D5] grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl md:text-3xl font-editorial font-semibold text-[#1C1917] tabular-nums">
                  12 Pipelines
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  {lang === 'zh'
                    ? '涵盖动画解说、真实素材纪录片、电影预告、口播、播客重制与 50+ 语言配音'
                    : 'Covering Explainers, Real-Footage Documentaries, Cinematic Trailers, Clips & Dubbing'}
                </p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-editorial font-semibold text-[#1C1917] tabular-nums">
                  52 Tools · 400+ Skills
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  {lang === 'zh'
                    ? '三层知识架构（tools/ + skills/ + .agents/skills/）结合 7 维度提供商自动评分'
                    : '3-tier knowledge architecture paired with a 7-dimension provider scoring engine'}
                </p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-editorial font-semibold text-[#9A3412] tabular-nums">
                  $0.00 – $1.33
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  {lang === 'zh'
                    ? '零密钥全免费出片，或以 $0.15（FLUX+Remotion）至 $1.33（Kling v3）完成商业级成片'
                    : 'Zero-key free production, or $0.15 (FLUX+Remotion) to $1.33 (Kling v3) per finished film'}
                </p>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-editorial font-semibold text-[#1C1917] tabular-nums">
                  15–25 Web Searches
                </div>
                <p className="text-xs text-[#57534E] mt-1">
                  {lang === 'zh'
                    ? '写剧本前强制执行一等公民网络研究，渲染后执行 ffprobe + 4 点抽帧自我审查'
                    : 'First-class web research before scripting + mandatory ffprobe & 4x frame post-render review'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 01: OFFICIAL SCREENING ROOM & CASE STUDY MONOGRAPH (6 REAL VIDEOS) */}
        <section id="showcase" className="py-16 md:py-20 border-b border-[#E5E0D5]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#9A3412] mb-2">
                  {lang === 'zh'
                    ? '01 · 官方成片放映室与制作成本档案 (SCREENING ROOM & MONOGRAPHS)'
                    : '01 · OFFICIAL SCREENING ROOM & PRODUCTION MONOGRAPHS'}
                </p>
                <h2
                  className="text-3xl md:text-4xl font-editorial font-semibold tracking-tight text-[#1C1917]"
                  style={{ textWrap: 'balance' }}
                >
                  {lang === 'zh'
                    ? '6 部由 OpenMontage 完整编排的真实成片（附完整提示词与成本账单）'
                    : '6 Real Productions Orchestrated by OpenMontage with Full Cost & Toolchain Transparency'}
                </h2>
              </div>

              {/* Segmented Filter Controls */}
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg border border-[#E5E0D5] shrink-0">
                {[
                  { id: 'all', zh: '全部成片 (6)', en: 'All Films (6)' },
                  { id: 'native-video', zh: 'Veo / Kling 原生视频 (2)', en: 'Veo / Kling Motion (2)' },
                  { id: 'zero-video-api', zh: '零视频 API · $0.15 动漫 (3)', en: 'Zero Video API · $0.15 (3)' },
                  { id: 'single-key-ad', zh: '单密钥广告 · $0.69 (1)', en: 'Single-Key Ad · $0.69 (1)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setShowcaseFilter(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      showcaseFilter === tab.id
                        ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs font-semibold'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {lang === 'zh' ? tab.zh : tab.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Bento Grid of 6 Real Showcase Videos */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((film) => (
                <article
                  key={film.id}
                  className={`rounded-2xl border border-[#E5E0D5] bg-[#FBF9F5] overflow-hidden flex flex-col justify-between transition-colors hover:border-[#D6CEBE] ${
                    film.featured && showcaseFilter === 'all'
                      ? 'md:col-span-1 lg:col-span-1'
                      : ''
                  }`}
                >
                  <div>
                    {/* Video Screening Frame */}
                    <div className="relative aspect-video bg-[#141210] border-b border-[#E5E0D5]">
                      <video
                        src={film.videoUrl}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Zero-Pill Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#78716C]">
                        <span>{film.catalogId}</span>
                        <span>·</span>
                        <span>{film.pipeline}</span>
                        <span>·</span>
                        <span className="text-[#9A3412] font-semibold tabular-nums">
                          COST: {film.cost}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl font-editorial font-semibold text-[#1C1917]">
                        {lang === 'zh' ? film.titleZh : film.titleEn}
                      </h3>

                      <p className="mt-2 text-xs text-[#44403C] leading-relaxed line-clamp-3">
                        {lang === 'zh' ? film.summaryZh : film.summaryEn}
                      </p>

                      {/* Unboxed Toolchain List */}
                      <div className="mt-4 pt-3 border-t border-[#E5E0D5] text-[11px] font-mono text-[#57534E] flex flex-wrap items-center gap-1.5">
                        {film.providers.map((prov, idx) => (
                          <React.Fragment key={prov}>
                            {idx > 0 && <span className="text-[#A8A29E]">/</span>}
                            <span>{prov}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-3.5 bg-[#F3EFE6]/60 border-t border-[#E5E0D5] flex items-center justify-between gap-2 relative">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedFilmModal(film)}
                        className="text-xs font-medium text-[#1C1917] hover:text-[#9A3412] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#9A3412]" />
                        {lang === 'zh' ? '查看分项成本与工程单' : 'Production Sheet'}
                      </button>

                      {/* Share Dropdown Trigger (Copies Pipeline Deep Link or Direct Video URL) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveShareFilmId((prev) =>
                              prev === film.id ? null : film.id
                            )
                          }
                          title="Share video URL or copy deep link to pipeline configuration"
                          className="px-2 py-1 rounded-md border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#E5E0D5]/70 text-xs font-mono text-[#1C1917] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                        >
                          {copiedShareBadge?.filmId === film.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#15803D]" />
                              <span className="text-[#15803D] font-semibold">
                                {copiedShareBadge.label}
                              </span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 text-[#9A3412]" />
                              <span>Share</span>
                            </>
                          )}
                        </button>

                        {activeShareFilmId === film.id && (
                          <div
                            className="absolute left-0 bottom-full mb-2 w-64 rounded-xl border border-[#D6CEBE] bg-[#FBF9F5] shadow-xl p-2 z-30 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-2.5 py-1.5 border-b border-[#E5E0D5] flex items-center justify-between">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-[#78716C] font-semibold">
                                SHARE · {film.catalogId}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveShareFilmId(null)}
                                className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                                aria-label="Close share menu"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="mt-1 space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyShareItem(film, 'deep-link')
                                }
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F3EFE6] transition-colors flex items-start gap-2 cursor-pointer"
                              >
                                <Link2 className="w-3.5 h-3.5 text-[#9A3412] shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-medium text-[#1C1917]">
                                    Copy Pipeline Config Link
                                  </div>
                                  <div className="text-[11px] font-mono text-[#78716C]">
                                    Deep link with {film.pipeline} &amp; {film.runtime}
                                  </div>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyShareItem(film, 'video-url')
                                }
                                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F3EFE6] transition-colors flex items-start gap-2 cursor-pointer"
                              >
                                <Film className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-medium text-[#1C1917]">
                                    Copy Direct Video URL
                                  </div>
                                  <div className="text-[11px] font-mono text-[#78716C]">
                                    Direct MP4 stream link
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleLoadIntoStudio(
                          film.promptUsed,
                          `Reference Film: ${film.titleEn} (${film.pipeline}, ${film.runtime}, Cost ${film.cost})`
                        );
                        const el = document.getElementById('research-studio');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-mono text-[#9A3412] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {lang === 'zh' ? '以此片为参考' : 'Use as Reference'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 02: GOOGLE SEARCH GROUNDED RESEARCH, PROPOSAL & FACT-CHECK STUDIO */}
        <ResearchStudio
          lang={lang}
          userId={currentUser?.uid || null}
          externalPrompt={studioExternalPrompt}
          externalReference={studioExternalReference}
          availableKeys={availableKeys}
          useGoogleSearch={useGoogleSearch}
          onToggleGoogleSearch={handleToggleGoogleSearch}
          onClearExternalPrompt={handleClearExternalPrompt}
        />

        {/* SECTION 03: LIVE TRENDING VIDEO TOPICS PULSE (GOOGLE SEARCH GROUNDED) */}
        <TrendingPulse
          lang={lang}
          useGoogleSearch={useGoogleSearch}
          onLoadTopicIntoStudio={handleLoadIntoStudio}
        />

        {/* SECTION 04 & 05: 12 PIPELINES, 7 STAGES & 7-DIM PROVIDER SCORING SIMULATOR */}
        <PipelineGovernanceExplorer
          lang={lang}
          userId={currentUser?.uid || null}
          availableKeys={availableKeys}
          useGoogleSearch={useGoogleSearch}
          onToggleKey={handleToggleKey}
          onResetZeroKeys={handleResetZeroKeys}
          onSelectPipelinePrompt={(prompt, referenceNote) =>
            handleLoadIntoStudio(prompt, referenceNote)
          }
        />
      </main>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="bg-[#F3EFE6] border-t border-[#E5E0D5] py-12">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <MontyClapperEmblem className="w-10 h-10 shrink-0" />
            <div>
              <div className="text-base font-editorial font-semibold text-[#1C1917]">
                OpenMontage
              </div>
              <p className="text-xs text-[#57534E]">
                {lang === 'zh'
                  ? '首个开源的、代理化的视频制作系统 · GNU AGPLv3 许可证'
                  : 'The First Open-Source, Agentic Video Production System · GNU AGPLv3'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#57534E]">
            <a
              href="https://github.com/calesthio/OpenMontage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1917] inline-flex items-center gap-1"
            >
              GitHub Repository
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/calesthio/OpenMontage/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1917] inline-flex items-center gap-1"
            >
              Discussions (Show & Tell)
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.youtube.com/@OpenMontage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#9A3412] inline-flex items-center gap-1"
            >
              YouTube @OpenMontage
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://x.com/calesthioailabs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1C1917] inline-flex items-center gap-1"
            >
              X @calesthioailabs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* FULLSCREEN THEATER & ACCESSION SHEET MODAL FOR SHOWCASE FILMS */}
      {selectedFilmModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          onClick={() => setSelectedFilmModal(null)}
        >
          <div
            className="bg-[#FBF9F5] border border-[#E5E0D5] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1C1917] text-[#FBF9F5] flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#D6CEBE]">
                <span>{selectedFilmModal.catalogId}</span>
                <span className="mx-2">·</span>
                <span>{selectedFilmModal.pipeline}</span>
                <span className="mx-2">·</span>
                <span className="text-[#F97316] font-semibold">
                  TOTAL COST: {selectedFilmModal.cost}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFilmModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black aspect-video w-full">
              <video
                src={selectedFilmModal.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Accession & Cost Breakdown Sheet */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7">
                <h3 className="text-2xl font-editorial font-semibold text-[#1C1917]">
                  {lang === 'zh'
                    ? selectedFilmModal.titleZh
                    : selectedFilmModal.titleEn}
                </h3>
                <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                  {lang === 'zh'
                    ? selectedFilmModal.summaryZh
                    : selectedFilmModal.summaryEn}
                </p>

                <div className="mt-4 p-3.5 rounded-lg bg-[#F3EFE6] border border-[#E5E0D5]">
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-[#78716C] mb-1">
                    ORIGINAL PROMPT
                  </span>
                  <p className="text-xs font-mono text-[#1C1917]">
                    “{selectedFilmModal.promptUsed}”
                  </p>
                </div>
              </div>

              <div className="md:col-span-5 bg-[#F3EFE6]/70 border border-[#E5E0D5] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold pb-2 border-b border-[#E5E0D5]">
                    {lang === 'zh'
                      ? '可审计成本账单 (COST AUDIT LOG)'
                      : 'AUDITABLE COST BREAKDOWN'}
                  </span>
                  <dl className="mt-3 space-y-2 text-xs">
                    {selectedFilmModal.costBreakdown.map((row) => (
                      <div
                        key={row.item}
                        className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#E5E0D5]/60"
                      >
                        <div>
                          <dt className="font-medium text-[#1C1917]">{row.item}</dt>
                          <dd className="text-[11px] font-mono text-[#78716C]">
                            {row.provider}
                          </dd>
                        </div>
                        <span className="font-mono font-semibold text-[#9A3412] tabular-nums">
                          {row.cost}
                        </span>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyShareItem(selectedFilmModal, 'deep-link')
                      }
                      className="py-2 px-2.5 rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#E5E0D5] text-[#1C1917] text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedShareBadge?.filmId === selectedFilmModal.id &&
                      copiedShareBadge.label === 'Pipeline Link Copied' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" />
                          <span className="text-[#15803D] font-semibold">
                            Link Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5 text-[#9A3412]" />
                          <span>Copy Config Link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyShareItem(selectedFilmModal, 'video-url')
                      }
                      className="py-2 px-2.5 rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-[#E5E0D5] text-[#1C1917] text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedShareBadge?.filmId === selectedFilmModal.id &&
                      copiedShareBadge.label === 'Video URL Copied' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" />
                          <span className="text-[#15803D] font-semibold">
                            URL Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                          <span>Copy Video URL</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const film = selectedFilmModal;
                      setSelectedFilmModal(null);
                      handleLoadIntoStudio(
                        film.promptUsed,
                        `Reference Film: ${film.titleEn} (${film.pipeline}, ${film.runtime})`
                      );
                      const el = document.getElementById('research-studio');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === 'zh'
                      ? '载入实时网络研究台复现此工作流'
                      : 'Reproduce Workflow in Live Studio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICKSTART CLI & OPENCLAW AGENT CONTRACT MODAL */}
      {showQuickstartModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          onClick={() => setShowQuickstartModal(false)}
        >
          <div
            className="bg-[#FBF9F5] border border-[#E5E0D5] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#1C1917] text-[#FBF9F5] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Terminal className="w-4 h-4 text-[#F97316]" />
                <span>QUICKSTART · INSTALLATION & OPENCLAW AGENT CONTRACT</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickstartModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-editorial font-semibold text-[#1C1917]">
                  {lang === 'zh'
                    ? '1. 克隆与一键初始化 (Python 3.10+ · FFmpeg · Node.js 18+)'
                    : '1. Clone & One-Command Setup (Python 3.10+ · FFmpeg · Node.js 18+)'}
                </h3>
                <div className="mt-2 relative">
                  <pre className="p-4 rounded-lg bg-[#1C1917] text-[#E7E5E4] text-xs font-mono overflow-x-auto">
                    <code>{`git clone https://github.com/calesthio/OpenMontage.git
cd OpenMontage
make setup`}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'setup',
                        'git clone https://github.com/calesthio/OpenMontage.git\ncd OpenMontage\nmake setup'
                      )
                    }
                    className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCommand === 'setup' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-editorial font-semibold text-[#1C1917]">
                  {lang === 'zh'
                    ? '2. OpenClaw / AI 编程智能体自检契约 (Turing Test Path)'
                    : '2. OpenClaw / Coding Agent Capability Discovery'}
                </h3>
                <p className="text-xs text-[#57534E] mt-1">
                  {lang === 'zh'
                    ? '首先阅读 AGENT_GUIDE.md 与 PROJECT_CONTEXT.md，然后通过注册表检查当前实际能力范围与提供商菜单：'
                    : 'Read AGENT_GUIDE.md and PROJECT_CONTEXT.md first, then inspect the active tool registry:'}
                </p>
                <div className="mt-2 relative">
                  <pre className="p-4 rounded-lg bg-[#1C1917] text-[#D6CEBE] text-xs font-mono overflow-x-auto">
                    <code>{`python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.support_envelope(), indent=2))"
python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu(), indent=2))"`}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'agent',
                        `python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.support_envelope(), indent=2))"\npython -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu(), indent=2))"`
                      )
                    }
                    className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCommand === 'agent' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F3EFE6] border border-[#E5E0D5] text-xs text-[#44403C] flex items-center justify-between gap-4">
                <span>
                  {lang === 'zh'
                    ? '支持平台：Claude Code (CLAUDE.md) · Cursor (CURSOR.md) · GitHub Copilot · Codex · Windsurf'
                    : 'Supported IDEs: Claude Code (CLAUDE.md) · Cursor (CURSOR.md) · Copilot · Codex · Windsurf'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickstartModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1C1917] text-white font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {lang === 'zh' ? '完成' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
