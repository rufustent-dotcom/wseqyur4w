'use client';

import React, { useState, useEffect } from 'react';
import {
  PIPELINES,
  WORKFLOW_STAGES,
  PROVIDERS_CATALOG,
  PLATFORM_PROFILES,
  INITIAL_PRODUCTION_ATTEMPTS,
  ProviderEntry,
  ProductionAttempt,
  GroundedCitation,
} from '@/lib/openmontage-data';
import {
  ShieldCheck,
  Sliders,
  Copy,
  Check,
  ArrowUpRight,
  History,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  ExternalLink,
  Search,
  DollarSign,
  FileCode2,
} from 'lucide-react';

interface PipelineGovernanceExplorerProps {
  lang: 'zh' | 'en';
  availableKeys: string[];
  onToggleKey: (envKey: string) => void;
  onResetZeroKeys: () => void;
  onSelectPipelinePrompt: (pipelineName: string, referenceNote?: string) => void;
}

const ENV_KEY_OPTIONS = [
  { key: 'FAL_KEY', label: 'FAL_KEY (FLUX, Veo 3, Kling v3, MiniMax)' },
  { key: 'OPENAI_API_KEY', label: 'OPENAI_API_KEY (GPT Image 2, OpenAI TTS)' },
  { key: 'ELEVENLABS_API_KEY', label: 'ELEVENLABS_API_KEY (Top TTS, Music, SFX)' },
  { key: 'GOOGLE_API_KEY', label: 'GOOGLE_API_KEY (Imagen 4, 700+ Chirp3 Voices)' },
  { key: 'RUNWAY_API_KEY', label: 'RUNWAY_API_KEY (Runway Gen-4 Direct)' },
  { key: 'SUNO_API_KEY', label: 'SUNO_API_KEY (Full 8-min Songs & Scores)' },
  { key: 'VIDEO_GEN_LOCAL_ENABLED', label: 'LOCAL GPU (WAN 2.1 / Hunyuan / LTX)' },
];

function computeWeightedScore(p: ProviderEntry): number {
  const s = p.scores;
  const total =
    s.taskFit * 0.3 +
    s.quality * 0.2 +
    s.control * 0.15 +
    s.reliability * 0.15 +
    s.costEfficiency * 0.1 +
    s.latency * 0.05 +
    s.continuity * 0.05;
  return Math.round(total * 10) / 10;
}

export function PipelineGovernanceExplorer({
  lang,
  availableKeys,
  onToggleKey,
  onResetZeroKeys,
  onSelectPipelinePrompt,
}: PipelineGovernanceExplorerProps) {
  // View Switcher inside Pipeline Explorer: Blueprints vs. Production Attempts History
  const [explorerTab, setExplorerTab] = useState<'blueprints' | 'attempts'>('attempts');

  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    PIPELINES[0].id
  );
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [providerCategory, setProviderCategory] = useState<
    'all' | 'video' | 'image' | 'tts' | 'music' | 'runtime'
  >('all');
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Production Attempts History State
  const [attempts, setAttempts] = useState<ProductionAttempt[]>(
    INITIAL_PRODUCTION_ATTEMPTS
  );
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>(
    INITIAL_PRODUCTION_ATTEMPTS[0].id
  );
  const [attemptStatusFilter, setAttemptStatusFilter] = useState<
    'all' | 'completed' | 'fallback' | 'failed'
  >('all');

  // Simulator / Failure-Injection Controls
  const [simPipelineId, setSimPipelineId] = useState<string>('animated-explainer');
  const [simPrompt, setSimPrompt] = useState<string>(
    'Make a 60-second explainer on 2026 fusion energy net-gain breakthroughs and tokamak magnet milestones.'
  );
  const [injectionMode, setInjectionMode] = useState<
    | 'nominal'
    | 'provider-fallback'
    | 'ppt-risk-block'
    | 'fact-check-block'
    | 'ffprobe-audio-block'
  >('nominal');
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('openmontage_pipeline_attempts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAttempts(parsed);
        }
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const persistAttempts = (list: ProductionAttempt[]) => {
    setAttempts(list);
    try {
      localStorage.setItem('openmontage_pipeline_attempts_v1', JSON.stringify(list));
    } catch {
      // Ignore storage error
    }
  };

  const activePipeline =
    PIPELINES.find((p) => p.id === selectedPipelineId) || PIPELINES[0];
  const activeStage = WORKFLOW_STAGES[selectedStageIdx] || WORKFLOW_STAGES[0];

  const filteredAttempts = attempts.filter((a) =>
    attemptStatusFilter === 'all' ? true : a.status === attemptStatusFilter
  );

  const activeAttempt =
    attempts.find((a) => a.id === selectedAttemptId) ||
    filteredAttempts[0] ||
    attempts[0];

  // Simulate a new pipeline run with custom failure injection + live Google Search grounding
  const handleSimulatePipelineAttempt = async () => {
    const targetPipe =
      PIPELINES.find((p) => p.id === simPipelineId) || PIPELINES[0];
    const queryText =
      simPrompt.trim() ||
      (lang === 'zh' ? targetPipe.bestForZh : targetPipe.bestForEn);

    setIsSimulatingRun(true);

    let groundedSummary =
      lang === 'zh'
        ? `已通过 Google Search 实时检索验证“${queryText}”相关的最新事实数据与新闻信源。`
        : `Verified real-time facts and news sources via Google Search for "${queryText}".`;
    let citations: GroundedCitation[] = [];

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pipeline-run',
          prompt: queryText,
          pipelineName: targetPipe.nameEn,
          injectionScenario: injectionMode,
          language: lang,
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        groundedSummary = data.text.trim();
        citations = data.citations || [];
      }
    } catch {
      // Fallback summary if offline
    }

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const nowDate = new Date().toLocaleString([], {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const runNum = 842 + attempts.length;
    const runCode = `OM-RUN-${runNum}`;

    let status: 'completed' | 'fallback' | 'failed' = 'completed';
    let statusLabelZh = '已完成通过 (COMPLETED)';
    let statusLabelEn = 'COMPLETED · ALL GATES PASSED';
    let failedStage: string | undefined;
    let failureReasonZh: string | undefined;
    let failureReasonEn: string | undefined;
    let budget: ProductionAttempt['budget'] = {
      estimated: '$0.42',
      locked: '$0.42',
      settled: '$0.38',
      mode: 'cap ($10.00)',
    };

    if (injectionMode === 'provider-fallback') {
      status = 'fallback';
      statusLabelZh = '自动降级恢复 (FALLBACK RECOVERED)';
      statusLabelEn = 'FALLBACK RECOVERED · COMPLETED';
      failedStage = 'Stage 05 (Primary Video API Timeout)';
      failureReasonZh =
        '模拟注入：主选视频提供商在 Stage 05 响应超时，7 维度评分引擎自动切换至次优提供商完成渲染，预算结算降低 $0.55。';
      failureReasonEn =
        'Simulated Injection: Primary video provider timed out in Stage 05; 7-dimension scorer automatically failed over to runner-up provider and completed render.';
      budget = {
        estimated: '$1.80',
        locked: '$1.80',
        settled: '$1.25',
        mode: 'cap ($10.00)',
      };
    } else if (injectionMode === 'ppt-risk-block') {
      status = 'failed';
      statusLabelZh = '质量门拦截 · PPT 风险超标 (GATE BLOCKED)';
      statusLabelEn = 'GATE BLOCKED · PPT SLIDE-DECK RISK';
      failedStage = 'Stage 04 (6-Dim PPT Slide-Deck Risk Gate)';
      failureReasonZh =
        '模拟注入：6 维度 PPT 风险评分器检测到静态图像占比达 85%（得分 0.81 > 0.40 阈值），在调用云端资产 API 前强制拦截，实际扣费 $0.00。';
      failureReasonEn =
        'Simulated Injection: 6-dimension PPT Risk Scorer flagged 85% static slide composition (score 0.81 > 0.40 limit). Blocked prior to cloud API spend ($0.00 settled).';
      budget = {
        estimated: '$0.75',
        locked: '$0.75',
        settled: '$0.00',
        mode: 'cap ($10.00)',
      };
    } else if (injectionMode === 'fact-check-block') {
      status = 'failed';
      statusLabelZh = '事实核查门拦截 (FACT-CHECK BLOCKED)';
      statusLabelEn = 'GATE BLOCKED · UNVERIFIED SCRIPT CLAIM';
      failedStage = 'Stage 01 / Stage 03 (Google Search Fact-Check Gate)';
      failureReasonZh =
        '模拟注入：Stage 01 实时 Google Search 事实核查器检测到旁白脚本中存在未经证实的统计数据，已暂停资产生成并输出修正建议。';
      failureReasonEn =
        'Simulated Injection: Stage 01 Google Search Fact-Checker intercepted an unverified statistical claim in the script draft prior to TTS & visual generation ($0.00 settled).';
      budget = {
        estimated: '$0.50',
        locked: '$0.50',
        settled: '$0.00',
        mode: 'cap ($10.00)',
      };
    } else if (injectionMode === 'ffprobe-audio-block') {
      status = 'failed';
      statusLabelZh = '渲染后自检拦截 · 黑帧/削峰 (POST-RENDER BLOCKED)';
      statusLabelEn = 'GATE BLOCKED · POST-RENDER FFPROBE CHECK';
      failedStage = 'Stage 07 (Post-Render Self-Review Gate)';
      failureReasonZh =
        '模拟注入：Stage 07 渲染后自我审查（ffprobe + 4 点抽帧 + 音频电平）在第 3 采样帧检测到图层遮挡与 +1.9 dBFS 音频削峰，阻止向用户交付残次视频。';
      failureReasonEn =
        'Simulated Injection: Stage 07 Post-Render Self-Review (ffprobe + 4x frame sample) caught caption clipping and +1.9 dBFS audio peak; blocked delivery.',
      budget = {
        estimated: '$0.28',
        locked: '$0.28',
        settled: '$0.15',
        mode: 'warn ($2.00)',
      };
    }

    const newAttempt: ProductionAttempt = {
      id: `attempt-${Date.now()}`,
      runCode,
      pipelineId: targetPipe.id,
      pipelineNameZh: targetPipe.nameZh,
      pipelineNameEn: targetPipe.nameEn,
      prompt: queryText,
      runtime: targetPipe.defaultRuntime,
      status,
      statusLabelZh,
      statusLabelEn,
      failedStage,
      failureReasonZh,
      failureReasonEn,
      createdAt: nowDate,
      durationSec: status === 'failed' ? '14.2s' : '51.6s',
      budget,
      providerDecisions: [
        {
          modality: 'Visuals / Footage',
          selectedProvider:
            injectionMode === 'provider-fallback'
              ? 'Kling v3 (Auto-Fallback)'
              : availableKeys.includes('FAL_KEY')
              ? 'FLUX / Kling (via fal.ai)'
              : 'Archive.org + Wikimedia (CLIP Free)',
          selectedScore: 95.1,
          runnerUpProvider: 'Google Imagen 4 / Pexels',
          runnerUpScore: 91.4,
          confidence: '0.93',
          reasonZh:
            injectionMode === 'provider-fallback'
              ? '主提供商超时后自动切换至次优高分模型，保持分镜连续性'
              : '基于当前激活的密钥环境，7 维度综合得分最高',
          reasonEn:
            injectionMode === 'provider-fallback'
              ? 'Failover triggered on primary timeout; preserved visual continuity'
              : 'Highest 7-dimension weighted score for current active keys',
          cost: status === 'failed' ? '$0.00' : '$0.25',
        },
        {
          modality: 'TTS Narration',
          selectedProvider: availableKeys.includes('GOOGLE_API_KEY')
            ? 'Google TTS (Chirp3-HD)'
            : 'Piper Neural TTS (Local Free)',
          selectedScore: 94.8,
          runnerUpProvider: 'OpenAI TTS HD',
          runnerUpScore: 90.5,
          confidence: '0.95',
          reasonZh: '语速 145 WPM 匹配度与词级字幕对齐最优',
          reasonEn: 'Optimal 145 WPM cadence and WhisperX word boundary alignment',
          cost:
            status === 'failed'
              ? '$0.00'
              : availableKeys.includes('GOOGLE_API_KEY')
              ? '$0.13'
              : '$0.00',
        },
        {
          modality: 'Render Runtime',
          selectedProvider: targetPipe.defaultRuntime,
          selectedScore: 98.0,
          runnerUpProvider:
            targetPipe.defaultRuntime === 'Remotion' ? 'HyperFrames' : 'Remotion',
          runnerUpScore: 92.5,
          confidence: '0.98',
          reasonZh: `在 Stage 02 提案阶段锁定 render_runtime=${targetPipe.defaultRuntime}`,
          reasonEn: `Locked render_runtime=${targetPipe.defaultRuntime} at Stage 02 Proposal`,
          cost: '$0.00',
        },
      ],
      stageLogs: [
        {
          stageIndex: '01',
          stageNameZh: '实时网络研究 (Google Search)',
          stageNameEn: 'Stage 01 Web Research (Google Search)',
          outcome: injectionMode === 'fact-check-block' ? 'fail' : 'pass',
          timestamp: nowTime,
          detailZh:
            injectionMode === 'fact-check-block'
              ? 'BLOCKED: 实时 Google Search 核查发现未证实论断，拦截进入资产生成。'
              : `完成实时 Google Search 检索（提取 ${citations.length} 个网页来源）并生成结构化简报。`,
          detailEn:
            injectionMode === 'fact-check-block'
              ? 'BLOCKED: Live Google Search audit flagged unverified claim in script.'
              : `Completed live Google Search grounding (${citations.length} web citations verified).`,
        },
        {
          stageIndex: '04',
          stageNameZh: '分镜规划与 PPT 风险门',
          stageNameEn: 'Stage 04 Scene Plan & PPT Risk Gate',
          outcome: injectionMode === 'ppt-risk-block' ? 'fail' : 'pass',
          timestamp: nowTime,
          detailZh:
            injectionMode === 'ppt-risk-block'
              ? 'BLOCKED: 6 维度 PPT 风险得分 0.81（超过 0.40 上限），已拦截静态幻灯片式渲染。'
              : '6 维度 PPT 风险得分 0.18（通过），镜头运动与排版比例符合规范。',
          detailEn:
            injectionMode === 'ppt-risk-block'
              ? 'BLOCKED: 6-dim PPT Risk Score 0.81 (> 0.40 threshold).'
              : '6-dim PPT Risk Score 0.18 (Passed); dynamic motion verified.',
        },
        {
          stageIndex: '05',
          stageNameZh: '7 维度资产生成与容错',
          stageNameEn: 'Stage 05 Scored Asset Generation',
          outcome:
            injectionMode === 'ppt-risk-block' || injectionMode === 'fact-check-block'
              ? 'fail'
              : injectionMode === 'provider-fallback'
              ? 'warn'
              : 'pass',
          timestamp: nowTime,
          detailZh:
            injectionMode === 'provider-fallback'
              ? 'FALLBACK: 主提供商响应超时 -> 自动切换至次优提供商完成生成。'
              : status === 'failed' && injectionMode !== 'ffprobe-audio-block'
              ? '因前置质量门拦截，跳过云端资产生成（节省预算）。'
              : '所有视觉、语音与配乐资产均按 7 维度最高分提供商生成完毕。',
          detailEn:
            injectionMode === 'provider-fallback'
              ? 'FALLBACK: Primary provider timed out -> switched to runner-up.'
              : status === 'failed' && injectionMode !== 'ffprobe-audio-block'
              ? 'Skipped cloud asset spend due to upstream quality gate block.'
              : 'All visual, voice, and score assets generated via top-scored providers.',
        },
        {
          stageIndex: '07',
          stageNameZh: '合成与渲染后自我审查',
          stageNameEn: 'Stage 07 Post-Render Self-Review',
          outcome:
            status === 'failed'
              ? 'fail'
              : 'pass',
          timestamp: nowTime,
          detailZh:
            injectionMode === 'ffprobe-audio-block'
              ? 'BLOCKED: ffprobe + 4 点抽帧检测到字幕裁切与 +1.9 dBFS 音频削峰。'
              : status === 'failed'
              ? '未进入最终渲染输出。'
              : 'ffprobe 容器校验、4 点抽帧黑屏检查与 -14 LUFS 音频电平全部通过。',
          detailEn:
            injectionMode === 'ffprobe-audio-block'
              ? 'BLOCKED: Post-render ffprobe + 4x frame check caught audio clipping.'
              : status === 'failed'
              ? 'Halted prior to final delivery.'
              : 'ffprobe, 4x frame extraction, and -14 LUFS audio checks passed.',
        },
      ],
      groundedSummary,
      citations,
    };

    const updated = [newAttempt, ...attempts];
    persistAttempts(updated);
    setSelectedAttemptId(newAttempt.id);
    setAttemptStatusFilter('all');
    setIsSimulatingRun(false);
  };

  // Filter and sort providers by 7-dimension weighted score and whether their key is active
  const visibleProviders = PROVIDERS_CATALOG.filter((p) =>
    providerCategory === 'all' ? true : p.category === providerCategory
  )
    .map((p) => {
      const isAvailable = !p.envKey || availableKeys.includes(p.envKey);
      const baseScore = computeWeightedScore(p);
      return {
        ...p,
        isAvailable,
        weightedScore: baseScore,
      };
    })
    .sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      return b.weightedScore - a.weightedScore;
    });

  const generateEnvSnippet = () => {
    const lines = [
      '# .env — OpenMontage Provider Configuration',
      '# Every key is optional. Out-of-the-box zero-key mode uses Piper TTS + Archive.org/NASA/Wikimedia + Remotion/HyperFrames/FFmpeg.',
      '',
    ];
    for (const opt of ENV_KEY_OPTIONS) {
      const enabled = availableKeys.includes(opt.key);
      if (opt.key === 'VIDEO_GEN_LOCAL_ENABLED') {
        lines.push(
          `${enabled ? '' : '# '}VIDEO_GEN_LOCAL_ENABLED=${enabled ? 'true' : 'false'}`,
          `${enabled ? '' : '# '}VIDEO_GEN_LOCAL_MODEL=wan2.1-1.3b`
        );
      } else {
        lines.push(
          `${enabled ? '' : '# '}${opt.key}=${enabled ? 'your-active-key' : 'your-key'}`
        );
      }
    }
    return lines.join('\n');
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generateEnvSnippet());
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <>
      {/* SECTION 04: 12 PRODUCTION PIPELINES, ATTEMPTS HISTORY & 7-STAGE GOVERNANCE */}
      <section id="pipelines" className="py-16 md:py-20 border-b border-[#E5E0D5]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#9A3412] mb-2">
                {lang === 'zh'
                  ? '04 · 12 条制作流水线、执行历史审计与 7 阶段质量检验门'
                  : '04 · 12 PRODUCTION PIPELINES, ATTEMPT HISTORY & QUALITY GATES'}
              </p>
              <h2
                className="text-3xl md:text-4xl font-editorial font-semibold tracking-tight text-[#1C1917]"
                style={{ textWrap: 'balance' }}
              >
                {lang === 'zh'
                  ? '可审计的流水线治理：提供商决策跟踪、成本账单与失败恢复记录'
                  : 'Auditable Pipeline Governance: Execution History, Provider Logs & Cost Ledgers'}
              </h2>
            </div>

            {/* Segmented View Switcher: Production Attempts History vs. Pipeline Blueprints */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg border border-[#D6CEBE] shrink-0">
              <button
                type="button"
                onClick={() => setExplorerTab('attempts')}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  explorerTab === 'attempts'
                    ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#F97316]" />
                {lang === 'zh'
                  ? `生产执行历史与审计日志 (${attempts.length})`
                  : `Production Attempts History (${attempts.length})`}
              </button>
              <button
                type="button"
                onClick={() => setExplorerTab('blueprints')}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  explorerTab === 'blueprints'
                    ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-[#9A3412]" />
                {lang === 'zh'
                  ? `11+ 流水线清单蓝图 (YAML)`
                  : `Pipeline Blueprints (${PIPELINES.length})`}
              </button>
            </div>
          </div>

          {/* VIEW A: PRODUCTION ATTEMPTS HISTORY, PROVIDER AUDIT TRAIL & FAILURE-INJECTION SIMULATOR */}
          {explorerTab === 'attempts' ? (
            <div className="mt-8 space-y-8">
              {/* Interactive Failure-Injection & Live Google Search Pipeline Simulator Bar */}
              <div className="p-6 rounded-xl bg-[#F3EFE6]/80 border border-[#D6CEBE]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#9A3412] fill-current" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold">
                      {lang === 'zh'
                        ? '模拟新流水线运行 (支持故障注入 + 实时 GOOGLE SEARCH 研究审计)'
                        : 'SIMULATE NEW PIPELINE RUN (WITH FAILURE INJECTION & LIVE GOOGLE SEARCH)'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#78716C]">
                    gemini-3.8-flash · googleSearch · 7-Dim Provider Audit
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Pipeline Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-mono uppercase text-[#57534E] mb-1">
                      {lang === 'zh' ? '选择流水线 (PIPELINE)' : 'TARGET PIPELINE'}
                    </label>
                    <select
                      value={simPipelineId}
                      onChange={(e) => setSimPipelineId(e.target.value)}
                      className="w-full rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                    >
                      {PIPELINES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {lang === 'zh' ? p.nameZh : p.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic / Prompt Input */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-mono uppercase text-[#57534E] mb-1">
                      {lang === 'zh'
                        ? '实时检索主题与视频提示词 (TOPIC / PROMPT)'
                        : 'VIDEO TOPIC FOR LIVE GOOGLE SEARCH'}
                    </label>
                    <input
                      type="text"
                      value={simPrompt}
                      onChange={(e) => setSimPrompt(e.target.value)}
                      placeholder={
                        lang === 'zh'
                          ? '输入任何新闻或视频主题以执行实时检索与流水线模拟...'
                          : 'Enter any topic or current event to ground the pipeline run...'
                      }
                      className="w-full rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                    />
                  </div>

                  {/* Failure Injection Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-mono uppercase text-[#57534E] mb-1">
                      {lang === 'zh'
                        ? '注入治理/故障场景 (FAILURE INJECTION)'
                        : 'GOVERNANCE / FAILURE INJECTION'}
                    </label>
                    <select
                      value={injectionMode}
                      onChange={(e) => setInjectionMode(e.target.value as any)}
                      className="w-full rounded-lg border border-[#D6CEBE] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#9A3412]"
                    >
                      <option value="nominal">
                        {lang === 'zh'
                          ? '正常通过 (Nominal Full Pass)'
                          : 'Nominal Pass (All Gates Pass)'}
                      </option>
                      <option value="provider-fallback">
                        {lang === 'zh'
                          ? '注入提供商超时 -> 7维度自动降级'
                          : 'Inject Provider Timeout -> Auto-Fallback'}
                      </option>
                      <option value="ppt-risk-block">
                        {lang === 'zh'
                          ? '注入 PPT 静态幻灯片风险超标拦截'
                          : 'Inject 6-Dim PPT Slide-Deck Risk Block'}
                      </option>
                      <option value="fact-check-block">
                        {lang === 'zh'
                          ? '注入脚本事实核查拦截 (Fact-Check Gate)'
                          : 'Inject Unverified Fact-Check Gate Block'}
                      </option>
                      <option value="ffprobe-audio-block">
                        {lang === 'zh'
                          ? '注入渲染后 ffprobe 削峰/黑帧拦截'
                          : 'Inject Post-Render ffprobe Frame/Audio Block'}
                      </option>
                    </select>
                  </div>

                  {/* Run Button */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      disabled={isSimulatingRun}
                      onClick={handleSimulatePipelineAttempt}
                      className="w-full py-2 px-3 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] disabled:opacity-60 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isSimulatingRun ? 'animate-spin' : ''}`}
                      />
                      {isSimulatingRun
                        ? lang === 'zh'
                          ? '执行中...'
                          : 'Running...'
                        : lang === 'zh'
                        ? '模拟并记录运行'
                        : 'Simulate Run'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Split View: Left Attempts List (5 cols) + Right Detailed Status & Audit Inspector (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Filterable Production Attempts List */}
                <div className="lg:col-span-5 bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E5E0D5]">
                    <div className="inline-flex flex-wrap items-center gap-1 bg-[#F3EFE6] p-1 rounded-lg border border-[#E5E0D5]">
                      {[
                        { id: 'all', zh: `全部 (${attempts.length})`, en: `All (${attempts.length})` },
                        { id: 'completed', zh: '成功通过', en: 'Completed' },
                        { id: 'fallback', zh: '降级恢复', en: 'Fallback' },
                        { id: 'failed', zh: '质量门拦截', en: 'Blocked' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setAttemptStatusFilter(f.id as any)}
                          className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            attemptStatusFilter === f.id
                              ? 'bg-[#1C1917] text-[#FBF9F5] font-medium'
                              : 'text-[#57534E] hover:text-[#1C1917]'
                          }`}
                        >
                          {lang === 'zh' ? f.zh : f.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredAttempts.map((item) => {
                      const isSelected = item.id === activeAttempt?.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedAttemptId(item.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F3EFE6] border-[#9A3412] shadow-2xs'
                              : 'bg-white border-[#E5E0D5] hover:bg-[#F3EFE6]/50'
                          }`}
                        >
                          {/* Top Row: Run Code + Explicit Accessible Status Icon & Label */}
                          <div className="flex items-center justify-between gap-2 text-xs font-mono">
                            <span className="font-semibold text-[#1C1917] tabular-nums">
                              {item.runCode} · {item.runtime}
                            </span>

                            {item.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                COMPLETED
                              </span>
                            )}
                            {item.status === 'fallback' && (
                              <span className="inline-flex items-center gap-1 text-[#B45309] font-semibold">
                                <RefreshCw className="w-3.5 h-3.5" />
                                FALLBACK
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 text-[#B91C1C] font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                BLOCKED
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 text-xs font-semibold text-[#9A3412]">
                            {lang === 'zh' ? item.pipelineNameZh : item.pipelineNameEn}
                          </div>

                          <p className="mt-1 text-xs text-[#292524] line-clamp-2 leading-snug">
                            “{item.prompt}”
                          </p>

                          <div className="mt-2.5 pt-2 border-t border-[#E5E0D5] flex items-center justify-between text-[11px] font-mono text-[#78716C] tabular-nums">
                            <span>{item.createdAt}</span>
                            <span>
                              EST {item.budget.estimated} → SETTLED{' '}
                              <strong className="text-[#1C1917]">
                                {item.budget.settled}
                              </strong>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Detailed Attempt Audit Trail, Cost Breakdown & Revisit Actions */}
                {activeAttempt && (
                  <div className="lg:col-span-7 bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-6 md:p-8 space-y-6">
                    {/* Header & Primary Action: Reload Prompt & Pipeline into Research Studio */}
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#E5E0D5]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="text-[#1C1917] font-semibold tabular-nums">
                            {activeAttempt.runCode}
                          </span>
                          <span>·</span>
                          <span>
                            {lang === 'zh'
                              ? activeAttempt.pipelineNameZh
                              : activeAttempt.pipelineNameEn}
                          </span>
                          <span>·</span>
                          <span className="tabular-nums">
                            DURATION: {activeAttempt.durationSec}
                          </span>
                        </div>

                        <h3 className="text-xl font-editorial font-semibold text-[#1C1917] mt-1.5 leading-snug">
                          “{activeAttempt.prompt}”
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                          {activeAttempt.status === 'completed' && (
                            <span className="text-[#15803D] font-semibold inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              {lang === 'zh'
                                ? activeAttempt.statusLabelZh
                                : activeAttempt.statusLabelEn}
                            </span>
                          )}
                          {activeAttempt.status === 'fallback' && (
                            <span className="text-[#B45309] font-semibold inline-flex items-center gap-1.5">
                              <RefreshCw className="w-4 h-4" />
                              {lang === 'zh'
                                ? activeAttempt.statusLabelZh
                                : activeAttempt.statusLabelEn}
                            </span>
                          )}
                          {activeAttempt.status === 'failed' && (
                            <span className="text-[#B91C1C] font-semibold inline-flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              {lang === 'zh'
                                ? activeAttempt.statusLabelZh
                                : activeAttempt.statusLabelEn}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectPipelinePrompt(
                            activeAttempt.prompt,
                            `Revisited from ${activeAttempt.runCode} (${activeAttempt.pipelineNameEn} · Runtime: ${activeAttempt.runtime} · Status: ${activeAttempt.statusLabelEn})`
                          );
                          const el = document.getElementById('research-studio');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {lang === 'zh'
                          ? '载入研究工作台重新规划 / 核验'
                          : 'Reload Prompt & Pipeline into Studio'}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Failure / Fallback Diagnostic Callout (if applicable) */}
                    {activeAttempt.failureReasonZh && (
                      <div
                        className={`p-4 rounded-xl border text-xs leading-relaxed ${
                          activeAttempt.status === 'failed'
                            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                            : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                        }`}
                      >
                        <div className="font-mono font-semibold uppercase mb-1">
                          {activeAttempt.failedStage}
                        </div>
                        <p>
                          {lang === 'zh'
                            ? activeAttempt.failureReasonZh
                            : activeAttempt.failureReasonEn}
                        </p>
                      </div>
                    )}

                    {/* Itemized Budget & Cost Breakdown Ledger */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#9A3412]" />
                          {lang === 'zh'
                            ? '预算锁定与实际结算账单 (BUDGET & COST BREAKDOWN)'
                            : 'BUDGET LOCK & SETTLED COST LEDGER'}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C]">
                          MODE: {activeAttempt.budget.mode}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F3EFE6] border border-[#E5E0D5] text-center">
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-[#78716C]">
                            {lang === 'zh' ? '执行前预估 (ESTIMATED)' : 'PRE-RUN ESTIMATE'}
                          </span>
                          <span className="text-base font-mono font-semibold text-[#1C1917] tabular-nums">
                            {activeAttempt.budget.estimated}
                          </span>
                        </div>
                        <div className="border-x border-[#E5E0D5]">
                          <span className="block text-[10px] font-mono uppercase text-[#78716C]">
                            {lang === 'zh' ? '调用前锁定 (LOCKED)' : 'BUDGET LOCKED'}
                          </span>
                          <span className="text-base font-mono font-semibold text-[#1C1917] tabular-nums">
                            {activeAttempt.budget.locked}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-[#78716C]">
                            {lang === 'zh' ? '最终结算 (SETTLED)' : 'FINAL SETTLED'}
                          </span>
                          <span className="text-base font-mono font-semibold text-[#9A3412] tabular-nums">
                            {activeAttempt.budget.settled}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Provider Decision Audit Trail Table */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold">
                          {lang === 'zh'
                            ? '7 维度提供商选择决策审计跟踪 (PROVIDER DECISION AUDIT TRAIL)'
                            : '7-DIMENSION PROVIDER DECISION AUDIT TRAIL'}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C]">
                          state.decision_audit_log
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-[#E5E0D5] rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#F3EFE6] border-b border-[#E5E0D5] text-[11px] font-mono text-[#78716C] uppercase">
                              <th className="py-2.5 px-3">Modality</th>
                              <th className="py-2.5 px-3">Selected Winner (Score)</th>
                              <th className="py-2.5 px-3">Runner-Up Considered</th>
                              <th className="py-2.5 px-3 text-right">Conf.</th>
                              <th className="py-2.5 px-3 text-right">Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E0D5] bg-white">
                            {activeAttempt.providerDecisions.map((dec, idx) => (
                              <tr key={idx}>
                                <td className="py-3 px-3 font-mono font-medium text-[#1C1917] whitespace-nowrap">
                                  {dec.modality}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-[#1C1917]">
                                    {dec.selectedProvider}{' '}
                                    <span className="font-mono text-[#9A3412] tabular-nums">
                                      ({dec.selectedScore})
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[#57534E] mt-0.5">
                                    {lang === 'zh' ? dec.reasonZh : dec.reasonEn}
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-mono text-[11px] text-[#78716C]">
                                  {dec.runnerUpProvider}
                                  {dec.runnerUpScore > 0 ? ` (${dec.runnerUpScore})` : ''}
                                </td>
                                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#44403C]">
                                  {dec.confidence}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-[#9A3412]">
                                  {dec.cost}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Stage-by-Stage Execution & Quality Gate Log */}
                    <div>
                      <span className="block text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold mb-2.5">
                        {lang === 'zh'
                          ? '分阶段检查点与质量门日志 (STAGE EXECUTION LOGS)'
                          : 'STAGE-BY-STAGE CHECKPOINT & QUALITY GATE LOGS'}
                      </span>
                      <div className="space-y-2">
                        {activeAttempt.stageLogs.map((log, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/40 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-[#9A3412] font-semibold">
                                  STAGE {log.stageIndex}
                                </span>
                                <span>·</span>
                                <span className="font-semibold text-[#1C1917]">
                                  {lang === 'zh' ? log.stageNameZh : log.stageNameEn}
                                </span>
                                <span>·</span>
                                <span
                                  className={
                                    log.outcome === 'pass'
                                      ? 'text-[#15803D] font-semibold'
                                      : log.outcome === 'warn'
                                      ? 'text-[#B45309] font-semibold'
                                      : 'text-[#B91C1C] font-semibold'
                                  }
                                >
                                  {log.outcome.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[#44403C] mt-1 leading-relaxed">
                                {lang === 'zh' ? log.detailZh : log.detailEn}
                              </p>
                            </div>
                            <span className="text-[11px] font-mono text-[#78716C] tabular-nums shrink-0">
                              {log.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage 01 Google Search Grounding & News Citations recorded for this attempt */}
                    <div className="pt-4 border-t border-[#E5E0D5]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#1E3A8A] font-semibold flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" />
                          {lang === 'zh'
                            ? 'STAGE 01 实时 GOOGLE SEARCH 研究与事实核查记录'
                            : 'STAGE 01 GOOGLE SEARCH GROUNDING & FACT AUDIT'}
                        </span>
                        <span className="text-[11px] font-mono text-[#78716C]">
                          {activeAttempt.citations.length} verified web sources
                        </span>
                      </div>
                      <p className="text-xs text-[#44403C] leading-relaxed bg-[#F3EFE6]/60 p-3.5 rounded-lg border border-[#E5E0D5]">
                        {activeAttempt.groundedSummary}
                      </p>

                      {activeAttempt.citations.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeAttempt.citations.map((cite, idx) => (
                            <a
                              key={idx}
                              href={cite.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg border border-[#E5E0D5] bg-white hover:border-[#1E3A8A]/40 transition-colors flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="truncate font-medium text-[#1C1917]">
                                [{idx + 1}] {cite.title}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VIEW B: 11+ PIPELINE BLUEPRINTS & YAML MANIFEST INSPECTOR */
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Pipeline List (5 cols) */}
              <div className="lg:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#78716C] pb-2 px-1">
                  <span>PIPELINE_DEFS/*.YAML</span>
                  <span>RUNTIME · ZERO-KEY</span>
                </div>
                {PIPELINES.map((pipe, index) => {
                  const isSelected = pipe.id === selectedPipelineId;
                  return (
                    <button
                      key={pipe.id}
                      type="button"
                      onClick={() => setSelectedPipelineId(pipe.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FBF9F5] border-[#1C1917]'
                          : 'bg-[#FBF9F5] text-[#1C1917] border-[#E5E0D5] hover:bg-[#F3EFE6]'
                      }`}
                    >
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-mono mr-2 tabular-nums ${
                            isSelected ? 'text-[#D6CEBE]' : 'text-[#9A3412]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        <span className="text-sm font-medium truncate">
                          {lang === 'zh' ? pipe.nameZh : pipe.nameEn}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-mono shrink-0 ${
                          isSelected ? 'text-[#D6CEBE]' : 'text-[#78716C]'
                        }`}
                      >
                        <span>{pipe.defaultRuntime}</span>
                        <span className="mx-1.5">·</span>
                        <span>{pipe.zeroKeyReady ? 'FREE-READY' : 'CLOUD/GPU'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Selected Pipeline Deep-Dive & YAML Manifest (7 cols) */}
              <div className="lg:col-span-7 bg-[#F3EFE6]/70 border border-[#E5E0D5] rounded-xl p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E0D5]">
                  <div>
                    <div className="text-xs font-mono text-[#9A3412] flex items-center gap-2">
                      <span>LOCKED RENDER_RUNTIME: {activePipeline.defaultRuntime}</span>
                      <span>·</span>
                      <span className="tabular-nums">COST: {activePipeline.typicalCost}</span>
                    </div>
                    <h3 className="text-2xl font-editorial font-semibold text-[#1C1917] mt-1">
                      {lang === 'zh' ? activePipeline.nameZh : activePipeline.nameEn}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPipelinePrompt(
                        lang === 'zh'
                          ? `请使用【${activePipeline.nameZh}】流水线制作一部 60 秒视频，主题为：${activePipeline.bestForZh}`
                          : `Run the ${activePipeline.nameEn} pipeline to create a 60-second video about: ${activePipeline.bestForEn}`
                      );
                      const el = document.getElementById('research-studio');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {lang === 'zh' ? '使用此流水线规划视频' : 'Plan with This Pipeline'}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#FBF9F5] border border-[#E5E0D5]">
                    <span className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-1">
                      {lang === 'zh' ? '产出内容 (DELIVERABLE)' : 'DELIVERABLE OUTPUT'}
                    </span>
                    <p className="text-sm text-[#1C1917] leading-relaxed">
                      {lang === 'zh' ? activePipeline.outputZh : activePipeline.outputEn}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#FBF9F5] border border-[#E5E0D5]">
                    <span className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-1">
                      {lang === 'zh' ? '最适用场景 (BEST FOR)' : 'OPTIMAL USE CASES'}
                    </span>
                    <p className="text-sm text-[#1C1917] leading-relaxed">
                      {lang === 'zh' ? activePipeline.bestForZh : activePipeline.bestForEn}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-2">
                    {lang === 'zh'
                      ? '核心调用的生产工具链 (REGISTERED TOOLS)'
                      : 'CORE REGISTERED TOOLS'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#1C1917]">
                    {activePipeline.keyTools.map((tool, i) => (
                      <React.Fragment key={tool}>
                        {i > 0 && <span className="text-[#A8A29E]">·</span>}
                        <span>{tool}</span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-mono text-[#78716C] mb-2">
                    <span>pipeline_defs/{activePipeline.id.replace('-', '_')}.yaml</span>
                    <span>3-TIER KNOWLEDGE LAYER 1</span>
                  </div>
                  <pre className="p-4 rounded-lg bg-[#1C1917] text-[#E7E5E4] text-xs font-mono overflow-x-auto leading-relaxed">
                    <code>{activePipeline.manifestSnippet}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* 7-Stage Director Workflow Stepper */}
          <div className="mt-12 pt-10 border-t border-[#E5E0D5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-xl font-editorial font-semibold text-[#1C1917]">
                {lang === 'zh'
                  ? '7 阶段标准制作流与质量检验门 (点击阶段查看导演技能契约)'
                  : '7-Stage Structured Workflow & Quality Gates (Click Stage to Inspect)'}
              </h3>
              <span className="text-xs font-mono text-[#78716C]">
                研究 → 提案 → 脚本 → 场景规划 → 资产生成 → 剪辑 → 合成
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const active = idx === selectedStageIdx;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStageIdx(idx)}
                    className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#9A3412] text-white border-[#9A3412]'
                        : 'bg-[#FBF9F5] text-[#1C1917] border-[#E5E0D5] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <div
                      className={`text-xs font-mono tabular-nums ${
                        active ? 'text-white/80' : 'text-[#9A3412]'
                      }`}
                    >
                      STAGE {stage.index}
                    </div>
                    <div className="text-xs font-semibold mt-1 truncate">
                      {lang === 'zh' ? stage.nameZh : stage.nameEn}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Inspector Card */}
            <div className="mt-4 p-6 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <div className="text-xs font-mono text-[#78716C] flex flex-wrap items-center gap-2">
                  <span className="text-[#9A3412] font-semibold">
                    STAGE {activeStage.index}
                  </span>
                  <span>·</span>
                  <span>SKILL: {activeStage.directorSkillPath}</span>
                  <span>·</span>
                  <span>CHECKPOINT: {activeStage.checkpointField}</span>
                </div>
                <h4 className="text-lg font-editorial font-semibold text-[#1C1917] mt-1.5">
                  {lang === 'zh' ? activeStage.nameZh : activeStage.nameEn}
                </h4>
                <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                  {lang === 'zh' ? activeStage.roleZh : activeStage.roleEn}
                </p>
              </div>
              <div className="lg:col-span-5 p-4 rounded-lg bg-[#F3EFE6] border border-[#E5E0D5]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#1C1917] font-semibold mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#9A3412]" />
                  <span>
                    {lang === 'zh'
                      ? '强制质量检验门 (QUALITY GATE)'
                      : 'MANDATORY QUALITY GATE'}
                  </span>
                </div>
                <p className="text-xs text-[#44403C] leading-relaxed">
                  {lang === 'zh' ? activeStage.qualityGateZh : activeStage.qualityGateEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05: 7-DIMENSION PROVIDER SCORING SIMULATOR & ZERO-KEY CONFIGURATOR */}
      <section
        id="providers"
        className="py-16 md:py-20 border-b border-[#E5E0D5] bg-[#F3EFE6]/50"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#9A3412] mb-2">
                {lang === 'zh'
                  ? '05 · 7 维度提供商评分模拟器与零密钥体验配置'
                  : '05 · 7-DIMENSION PROVIDER SCORING ENGINE & ZERO-KEY SIMULATOR'}
              </p>
              <h2
                className="text-3xl md:text-4xl font-editorial font-semibold tracking-tight text-[#1C1917]"
                style={{ textWrap: 'balance' }}
              >
                {lang === 'zh'
                  ? '没有供应商锁定：勾选您拥有的密钥，实时预览 7 维度智能打分'
                  : 'Zero Vendor Lock-In: Toggle Your API Keys to Simulate 7-Dimension Scoring'}
              </h2>
            </div>
            <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
              {lang === 'zh'
                ? '评分权重：任务契合度 (30%) · 输出质量 (20%) · 控制功能 (15%) · 可靠性 (15%) · 成本效益 (10%) · 延迟 (5%) · 连续性 (5%)。不配置任何密钥也可直接通过 Piper TTS + 开源档案库 + Remotion/HyperFrames 免费出片。'
                : 'Scoring weights: Task Fit (30%) · Output Quality (20%) · Control (15%) · Reliability (15%) · Cost Efficiency (10%) · Latency (5%) · Continuity (5%).'}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Key Toggles & .env Generator (4 cols) */}
            <div className="lg:col-span-4 bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#9A3412]" />
                  {lang === 'zh' ? '模拟您的 .env 密钥环境' : 'SIMULATE YOUR .ENV KEYS'}
                </span>
                <button
                  type="button"
                  onClick={onResetZeroKeys}
                  className="text-xs font-mono text-[#9A3412] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  {lang === 'zh' ? '重置为零密钥模式' : 'Reset to Zero-Key Mode'}
                </button>
              </div>

              <div className="space-y-2">
                {ENV_KEY_OPTIONS.map((opt) => {
                  const checked = availableKeys.includes(opt.key);
                  return (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#F3EFE6] border-[#9A3412] text-[#1C1917] font-medium'
                          : 'bg-white border-[#E5E0D5] text-[#57534E] hover:bg-[#F3EFE6]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleKey(opt.key)}
                        className="accent-[#9A3412] rounded"
                      />
                      <span className="font-mono truncate">{opt.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Live .env Preview */}
              <div className="mt-5 pt-5 border-t border-[#E5E0D5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#78716C]">.env PREVIEW</span>
                  <button
                    type="button"
                    onClick={handleCopyEnv}
                    className="text-xs font-mono text-[#1C1917] hover:text-[#9A3412] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy .env
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#1C1917] text-[#D6CEBE] text-[11px] font-mono overflow-x-auto leading-relaxed">
                  <code>{generateEnvSnippet()}</code>
                </pre>
              </div>
            </div>

            {/* Right: 7-Dimension Scored Provider Table (8 cols) */}
            <div className="lg:col-span-8 bg-[#FBF9F5] border border-[#E5E0D5] rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E0D5]">
                <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg border border-[#E5E0D5]">
                  {[
                    { id: 'all', zh: '全部工具 (16)', en: 'All Providers (16)' },
                    { id: 'video', zh: '视频与档案库', en: 'Video & Archives' },
                    { id: 'image', zh: '图像生成', en: 'Image' },
                    { id: 'tts', zh: '语音合成 (TTS)', en: 'TTS Voice' },
                    { id: 'music', zh: '音乐与音效', en: 'Music & SFX' },
                    { id: 'runtime', zh: '合成运行时', en: 'Runtimes' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setProviderCategory(tab.id as any)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        providerCategory === tab.id
                          ? 'bg-[#1C1917] text-[#FBF9F5] font-medium'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {lang === 'zh' ? tab.zh : tab.en}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-mono text-[#78716C] tabular-nums">
                  {visibleProviders.filter((p) => p.isAvailable).length} /{' '}
                  {visibleProviders.length} READY IN CURRENT ENV
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E0D5] text-[11px] font-mono text-[#78716C] uppercase">
                      <th className="py-2.5 pr-3">Provider / Tool</th>
                      <th className="py-2.5 px-2">Type / Env</th>
                      <th className="py-2.5 px-2 text-right">Fit 30%</th>
                      <th className="py-2.5 px-2 text-right">Qual 20%</th>
                      <th className="py-2.5 px-2 text-right">Cost 10%</th>
                      <th className="py-2.5 pl-2 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D5] text-xs">
                    {visibleProviders.map((prov) => (
                      <tr
                        key={prov.id}
                        className={
                          prov.isAvailable
                            ? 'bg-transparent'
                            : 'opacity-50 bg-[#F3EFE6]/30'
                        }
                      >
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-[#1C1917]">{prov.name}</div>
                          <div className="text-[11px] text-[#78716C] line-clamp-1 mt-0.5">
                            {lang === 'zh' ? prov.notesZh : prov.notesEn}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono text-[11px] text-[#57534E] whitespace-nowrap">
                          <span>{prov.type}</span>
                          <span className="mx-1">·</span>
                          <span
                            className={
                              prov.isAvailable
                                ? 'text-[#15803D] font-medium'
                                : 'text-[#78716C]'
                            }
                          >
                            {prov.isAvailable ? 'ACTIVE' : `NEEDS ${prov.envKey}`}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-[#44403C]">
                          {prov.scores.taskFit}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-[#44403C]">
                          {prov.scores.quality}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-[#44403C]">
                          {prov.scores.costEfficiency}
                        </td>
                        <td className="py-3 pl-2 text-right font-mono tabular-nums font-semibold text-[#9A3412]">
                          {prov.weightedScore.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Platform Output Profiles Bar */}
              <div className="mt-6 pt-5 border-t border-[#E5E0D5]">
                <span className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-3">
                  {lang === 'zh'
                    ? '内置主流平台渲染输出配置 (PLATFORM OUTPUT PROFILES)'
                    : 'BUILT-IN PLATFORM RENDER PROFILES'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PLATFORM_PROFILES.map((prof) => (
                    <div
                      key={prof.nameEn}
                      className="p-2.5 rounded-lg border border-[#E5E0D5] bg-[#F3EFE6]/50"
                    >
                      <div className="text-xs font-medium text-[#1C1917] truncate">
                        {lang === 'zh' ? prof.nameZh : prof.nameEn}
                      </div>
                      <div className="text-[11px] font-mono text-[#78716C] tabular-nums mt-0.5">
                        {prof.res} · {prof.ratio}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
