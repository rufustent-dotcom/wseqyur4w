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

export interface SavedResearchBrief {
  id: string;
  mode: 'proposal' | 'fact-check' | 'news-agent';
  query: string;
  referenceVideo?: string;
  markdown: string;
  citations: GroundedCitation[];
  createdAt: string;
  pinned?: boolean;
}

interface ResearchStudioProps {
  lang: 'zh' | 'en';
  externalPrompt: string;
  externalReference: string;
  availableKeys: string[];
  onClearExternalPrompt: () => void;
}

const INITIAL_RECENT_SEARCHES: SavedResearchBrief[] = [
  {
    id: 'preload-neural-net',
    mode: 'proposal',
    query:
      '制作一个 60 秒的动画解说视频，讲解神经网络是如何学习的 (How Neural Networks Learn via Backpropagation)',
    referenceVideo:
      '3Blue1Brown visual intuition cadence + crisp kinetic data overlays',
    createdAt: '2026-10-22 18:00',
    pinned: true,
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
    markdown: `## 01. 实时网络研究简报 (Live Web Research Brief)
- **核心机制验证**：神经网络通过前向传播（Forward Pass）计算预测值，利用损失函数（Loss Function，如交叉熵或均方误差）量化误差，并通过反向传播算法（Backpropagation）应用链式法则计算梯度，最后由优化器（如 AdamW）更新权重参数。
- **受众核心痛点**：初学者常将“梯度下降”误解为尝试所有可能组合；最有效的视觉钩子是展示**“从随机噪点在 4 次迭代内收敛为清晰手写数字识别”**的实时权重矩阵变化。

## 02. 流水线与渲染引擎锁定 (Pipeline & Render Runtime Lock)
- **选定流水线 (Selected Pipeline)**：\`动画解说 (Animated Explainer)\` —— 最适合包含数学推演、实时权重可视化与词级字幕的教学内容。
- **锁定渲染运行时 (\`render_runtime\`)**：\`Remotion\`（React 编程式视频引擎，支持弹簧物理动画、实时损失曲线图表与 TikTok 风格逐词高亮字幕）。
- **7 维度评分提供商选择与成本预估**：
  - **视觉/图表**：Remotion 原生数据卡片 + ManimCE / FLUX 关键帧（预估成本：**$0.00 – $0.15**）
  - **旁白配音**：Piper 离线神经 TTS（$0.00）或 Google Chirp3-HD（$0.12）
  - **总预估成本**：**$0.00（零密钥模式）** 或 **$0.27（云端增强模式）**

## 03. 三个差异化创意方案 (3 Differentiated Production Concepts)
1. **方案 A：调音师隐喻 (The 10,000-Knob Mixing Console)** — 将神经网络比作拥有一万个旋钮的调音台，每次猜错后，反向传播就像一双沿着误差信号往回微调每个旋钮的手。
2. **方案 B：高山盲降 (Foggy Mountain Descent)** — 聚焦损失地形（Loss Landscape），用等高线与动量小球直观解释学习率（Learning Rate）过大或过小的后果。
3. **方案 C：拆解单个人工神经元 (Inside a Single Perceptron)** — 从单个生物突触对比切入，60 秒内完成从输入像素、加权求和、ReLU 激活到梯度修正的闭环。

## 04. 质量检验门与防 PPT 风险策略 (Quality Gates & Anti-PPT Risk Plan)
- **6 维度 PPT 风险得分**：\`0.14 / 1.00 (LOW RISK)\` —— 静态图片占比低于 20%，全片由连续参数弹簧动画与动态损失图表驱动。
- **渲染后自我审查**：自动执行 \`ffprobe\` 容器校验、4 点抽帧检查文字遮挡、以及 \`-14 LUFS\` 响度与字幕同步核验。`,
  },
  {
    id: 'preload-4am-city-doc',
    mode: 'proposal',
    query:
      '制作一部 75 秒的纪录片蒙太奇，展现雨中的城市生活。只使用真实素材，无旁白，需要一种挽歌般的基调和配乐。',
    referenceVideo: 'Koyaanisqatsi / Nocturnal urban tone poem · Native footage only',
    createdAt: '2026-10-22 17:42',
    pinned: false,
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
    markdown: `## 01. 实时网络研究简报 (Live Web Research Brief)
- **真实档案语料库覆盖**：通过 CLIP 语义检索可从 \`Archive.org\`、\`Wikimedia Commons\` 与 \`Pexels\` 提取超过 140 段无版权高清夜间雨景、霓虹倒影、地铁末班车与清晨市政洒水车实拍镜头。
- **视听节奏设计**：无旁白音画诗（Tone Poem）依赖环境声（雨滴敲击金属、远处电车轨道共鸣）与大提琴慢板配乐的呼吸感，最佳平均镜头时长（ASL）为 \`3.8 秒\`。

## 02. 流水线与渲染引擎锁定 (Pipeline & Render Runtime Lock)
- **选定流水线 (Selected Pipeline)**：\`纪录片蒙太奇 (Documentary Montage)\` —— 强制启用 \`promise: native_motion_footage_only\`，严禁使用静态图片加推拉镜头伪装视频。
- **锁定渲染运行时 (\`render_runtime\`)**：\`FFmpeg\`（原生多轨视频拼接、胶片级交叉叠化 \`film_dissolve\` 与 16mm 档案色彩 LUT 调色）。
- **预估成本**：**$0.00 (100% 免费开源档案与本地合成)**。

## 03. 三个差异化创意方案 (3 Differentiated Production Concepts)
1. **方案 A：霓虹与沥青 (Neon & Wet Asphalt)** — 从午夜 00:00 的积水倒影切入，过渡到凌晨 04:00 的空旷立交桥与早班烘焙坊蒸汽。
2. **方案 B：信号灯的独白 (Traffic Lights for No One)** — 聚焦雨夜中无人十字路口规律变换的红绿灯与雨刷器节拍，构成机械与自然的视觉对位。
3. **方案 C：归途列车 (Last Train Home)** — 以车窗外的雨水流淌轨迹为主视觉线索，串联城市边缘的灯火。`,
  },
  {
    id: 'preload-crispr-factcheck',
    mode: 'fact-check',
    query:
      '在 60 秒解说脚本中：CRISPR-Cas9 技术最早于 1995 年在人类细胞中完成首次基因编辑临床试验，它通过 RNA 引导酶直接合成全新的 DNA 链...',
    createdAt: '2026-10-22 17:15',
    pinned: false,
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
    markdown: `## 核验结论 (Verification Verdict)
- **UNVERIFIED / HIGH RISK (存在事实错误 — 已拦截进入合成阶段)**

## 执行摘要 (Executive Production Summary)
- **核心修正**：原脚本混淆了细菌免疫机制发现时间与人类临床试验年份，且对 Cas9 作用机理描述有误。
- **时长预估**：修正后旁白约 140 词，按 145 WPM 语速适配 \`60 秒\` 动画解说。
- **视觉建议**：使用 \`Remotion\` 分步展示向导 RNA (gRNA) 匹配目标序列与 Cas9 核酸内切酶双链切割过程。

## 逐项事实审计与修正建议 (Claim-by-Claim Grounded Audit)
1. **原论断**：“最早于 1995 年在人类细胞中完成首次基因编辑临床试验”
   - **核实事实**：2012 年 Jennifer Doudna 与 Emmanuelle Charpentier 发表里程碑论文证明 CRISPR-Cas9 可编程切割 DNA；2013 年张锋等人首次将其应用于人类与小鼠真核细胞；首个人体临床试验于 **2016 年** 开展。
   - **修正旁白**：“2012 年，科学家成功将细菌的天然免疫系统转化为可编程的基因剪刀 CRISPR-Cas9，并在随后数年内开启了人类医学临床试验的新纪元。”
2. **原论断**：“通过 RNA 引导酶直接合成全新的 DNA 链，无需导向序列即可实现 100% 零脱靶”
   - **核实事实**：Cas9 负责**精准切割**双链 DNA（而非从头合成 DNA），且必须依赖 **向导 RNA (gRNA)** 定位目标序列；脱靶效应虽已大幅降低但仍非绝对 0%。`,
  },
];

export function ResearchStudio({
  lang,
  externalPrompt,
  externalReference,
  availableKeys,
  onClearExternalPrompt,
}: ResearchStudioProps) {
  const [activeTab, setActiveTab] = useState<'proposal' | 'fact-check' | 'news-agent'>(
    'proposal'
  );
  const [promptInput, setPromptInput] = useState(
    '制作一个 60 秒的动画解说视频，讲解神经网络是如何学习的'
  );
  const [referenceInput, setReferenceInput] = useState('');
  const [factCheckInput, setFactCheckInput] = useState(
    '在 60 秒解说脚本中：CRISPR-Cas9 技术最早于 1995 年在人类细胞中完成首次基因编辑临床试验，它通过 RNA 引导酶直接合成全新的 DNA 链，目前无需任何导向序列即可实现 100% 零脱靶编辑。'
  );
  const [newsAgentInput, setNewsAgentInput] = useState(
    '检索近期关于固态电池、商业航天或开源视频大模型的新闻进展，引用权威报道并给出一部 60 秒视频的事实脚本切入点。'
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
  }>({
    id: INITIAL_RECENT_SEARCHES[0].id,
    mode: INITIAL_RECENT_SEARCHES[0].mode,
    query: INITIAL_RECENT_SEARCHES[0].query,
    referenceVideo: INITIAL_RECENT_SEARCHES[0].referenceVideo,
    markdown: INITIAL_RECENT_SEARCHES[0].markdown,
    citations: INITIAL_RECENT_SEARCHES[0].citations,
    timestamp: INITIAL_RECENT_SEARCHES[0].createdAt,
  });

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('openmontage_recent_searches_v2');
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

  const persistRecentSearches = (items: SavedResearchBrief[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem('openmontage_recent_searches_v2', JSON.stringify(items));
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
  }) => {
    const { targetMode, queryText, refText = '' } = params;
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
      };

      setCurrentResult({
        id: newEntryId,
        mode: targetMode,
        query: newEntry.query,
        referenceVideo: newEntry.referenceVideo,
        markdown: newEntry.markdown,
        citations: newEntry.citations,
        timestamp: nowStr,
      });
      setActiveBriefId(newEntryId);

      // Automatically store in Recent Searches list
      const existingPinned = recentSearches.find(
        (item) => item.query === newEntry.query && item.pinned
      );
      const updatedList = [
        { ...newEntry, pinned: Boolean(existingPinned) },
        ...recentSearches.filter((item) => item.query !== newEntry.query),
      ].slice(0, 25);

      persistRecentSearches(updatedList);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (lang === 'zh'
            ? 'Google Search 实时检索请求失败，请检查网络连接或 API 密钥配置。'
            : 'Google Search grounding request failed. Please verify your connection or API key.')
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
    });
    setIsDrawerOpen(false);
  };

  // Re-invoke (re-run) a past search prompt against live Google Search
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

  const handleTogglePinBrief = (id: string) => {
    const updated = recentSearches.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    persistRecentSearches(updated);
  };

  const handleDeleteBrief = (id: string) => {
    const updated = recentSearches.filter((b) => b.id !== id);
    persistRecentSearches(updated);
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
              ? '没有匹配的检索记录。运行一次实时网络研究即可自动存档。'
              : 'No matching recent searches found. Run a query to auto-save it here.'}
          </div>
        ) : (
          filteredRecentSearches.map((item) => {
            const isSelected = item.id === activeBriefId;
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

                {/* Action Footer: View Cached Briefing OR Re-Invoke Live Search */}
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
                          ? '使用此提示词重新调用实时 Google Search'
                          : 'Re-run this prompt live against Google Search'
                      }
                      className="px-2 py-1 rounded text-[11px] font-medium bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-50 text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {lang === 'zh' ? '重新检索' : 'Re-invoke'}
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
                ? '02 · 一等公民实时网络研究、时事引证与事实核查工作台 (GOOGLE SEARCH GROUNDED)'
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
              ? 'OpenMontage 将网络研究作为第一阶段（Stage 01）。粘贴参考视频、探讨最新热点新闻、或核验旁白脚本——所有检索均自动保存在“最近检索侧边栏”中，支持随时查阅或一键重新触发。'
              : 'OpenMontage treats web research as a first-class stage. Explore breaking news, plan videos from references, or fact-check scripts—all saved in your Recent Searches sidebar.'}
          </p>
        </div>

        {/* Studio Mode Segmented Bar & Recent Searches Drawer / Sidebar Toggle */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
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
              <span>TOOL: googleSearch</span>
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
                    ? lang === 'zh'
                      ? '正在执行实时 Google Search 检索与提案规划...'
                      : 'Running Live Google Search & Proposal...'
                    : lang === 'zh'
                    ? '运行实时网络研究与生成制作提案'
                    : 'Run Grounded Research & Production Plan'}
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
                      ? '粘贴您的解说词初稿、科学数据或历史事件描述。系统将通过 Google Search 核实每一个事实点并生成执行摘要...'
                      : 'Paste your script draft, scientific statistics, or historical claims for live Google Search verification...'
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
                    ? lang === 'zh'
                      ? '正在通过 Google Search 核验脚本事实...'
                      : 'Verifying Claims via Google Search...'
                    : lang === 'zh'
                    ? '运行事实核查与生成执行摘要'
                    : 'Verify Script & Generate Executive Summary'}
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
                        labelZh: '样本 1：CRISPR 基因编辑年代与机制核验',
                        labelEn: 'Sample 1: CRISPR Gene Editing Timeline & Mechanism',
                        text: '在 60 秒解说脚本中：CRISPR-Cas9 技术最早于 1995 年在人类细胞中完成首次基因编辑临床试验，它通过 RNA 引导酶直接合成全新的 DNA 链，目前无需任何导向序列即可实现 100% 零脱靶编辑。',
                      },
                      {
                        labelZh: '样本 2：全球咖啡消费量排名与历史数据',
                        labelEn: 'Sample 2: Global Coffee Consumption Per Capita Claims',
                        text: 'Data explainer script: Brazil and Colombia have the highest per-capita coffee consumption in the world at over 18 kg per person annually, while Nordic countries like Finland consume less than 2 kg per capita.',
                      },
                      {
                        labelZh: '样本 3：互联网 ARPANET 首次传输历史纪录片旁白',
                        labelEn: 'Sample 3: ARPANET First Message Documentary Narration',
                        text: '1969 年 10 月 29 日深夜，加州大学洛杉矶分校（UCLA）向斯坦福研究院发送了人类互联网的第一条消息“HELLO WORLD”，系统一次性完整传输成功，标志着万维网（World Wide Web）的正式诞生。',
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
                    ? lang === 'zh'
                      ? '正在检索实时 Google Search 新闻信源...'
                      : 'Searching Live News & Citations...'
                    : lang === 'zh'
                    ? '检索实时新闻并生成引证简报'
                    : 'Query Current Events & Cite News'}
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
                        labelZh: '时事 1：近期固态电池与新能源快充技术突破',
                        labelEn: 'News 1: Recent Solid-State EV Battery & Charging Breakthroughs',
                        text: '检索近期关于固态电池量产时间表与能量密度的新闻报道，核实核心数据并提供一部 60 秒数据解说视频的脚本钩子。',
                      },
                      {
                        labelZh: '时事 2：NASA 木卫二 Europa Clipper 与深空探测最新进展',
                        labelEn: 'News 2: NASA Europa Clipper & Outer Planet Exploration Updates',
                        text: 'What are the latest mission updates and scientific objectives for NASA Europa Clipper? Cite recent sources and suggest a documentary montage angle.',
                      },
                      {
                        labelZh: '时事 3：开源视频生成模型（WAN 2.1 / Hunyuan / LTX）生态对比',
                        labelEn: 'News 3: Open-Source Video Generation Models Ecosystem',
                        text: '检索当前主流开源本地视频生成模型（WAN 2.1、混元视频、LTX-Video）的最新性能对比与显存要求，并给出技术解说要点。',
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
                <div className="text-xs font-mono text-[#78716C] flex items-center gap-2">
                  <span>
                    {currentResult.mode === 'proposal'
                      ? 'STAGE 01 & 02 · RESEARCH BRIEFING'
                      : currentResult.mode === 'fact-check'
                      ? 'REVIEWER SKILL · FACT-CHECK REPORT'
                      : 'LIVE NEWS AGENT · CURRENT EVENTS CITATION'}
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
                      ? '重新调用 Google Search 刷新此简报'
                      : 'Re-invoke Google Search for this prompt'
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#9A3412]" />
                  {lang === 'zh' ? '重新执行检索' : 'Re-invoke'}
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
                    {lang === 'zh' ? '检索执行提醒' : 'Grounding Request Notice'}
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
                  {lang === 'zh'
                    ? '正在调用 gemini-3.8-flash 与 Google Search 工具检索实时网络来源并生成结构化简报...'
                    : 'Querying gemini-3.8-flash with googleSearch tool for live citations and structured production brief...'}
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
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1E3A8A]">
                      {lang === 'zh'
                        ? `GOOGLE SEARCH 实时引证来源 (${currentResult.citations.length})`
                        : `VERIFIED GOOGLE SEARCH CITATIONS (${currentResult.citations.length})`}
                    </span>
                    <span className="text-[11px] font-mono text-[#78716C]">
                      groundingMetadata.groundingChunks
                    </span>
                  </div>

                  {currentResult.citations.length === 0 ? (
                    <p className="text-xs text-[#78716C]">
                      {lang === 'zh'
                        ? '该响应已由 Gemini 知识库与搜索工具综合生成。点击“重新执行检索”获取最新网页链接。'
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
