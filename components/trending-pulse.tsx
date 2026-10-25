'use client';

import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  RefreshCw,
  ArrowUpRight,
  ExternalLink,
  Compass,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_TRENDING_TOPICS,
  TrendTopicItem,
  GroundedCitation,
} from '@/lib/openmontage-data';

interface TrendingPulseProps {
  lang: 'zh' | 'en';
  useGoogleSearch: boolean;
  onLoadTopicIntoStudio: (prompt: string, note?: string) => void;
}

export function TrendingPulse({
  lang,
  useGoogleSearch,
  onLoadTopicIntoStudio,
}: TrendingPulseProps) {
  const [selectedBeat, setSelectedBeat] = useState<
    'all' | 'explainer' | 'documentary' | 'cinematic' | 'product'
  >('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveReportMarkdown, setLiveReportMarkdown] = useState<string | null>(null);
  const [liveCitations, setLiveCitations] = useState<GroundedCitation[]>([]);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const beats = [
    { id: 'all', zh: '全部热门方向 (4)', en: 'All Production Beats (4)' },
    { id: 'explainer', zh: '科学解说 (Animated Explainer)', en: 'Science & Explainers' },
    { id: 'documentary', zh: '档案纪录片 (Archival Montage)', en: 'Archival Documentary' },
    { id: 'cinematic', zh: '电影级预告 (Cinematic Sci-Fi)', en: 'Cinematic & Sci-Fi' },
    { id: 'product', zh: '硬件与产品发布 (Product Teaser)', en: 'Tech & Product Launch' },
  ] as const;

  const filteredCards: TrendTopicItem[] =
    selectedBeat === 'all'
      ? INITIAL_TRENDING_TOPICS
      : INITIAL_TRENDING_TOPICS.filter((item) => item.beat === selectedBeat);

  const handleRefreshLiveWebTrends = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    const targetBeat = selectedBeat === 'all' ? 'explainer' : selectedBeat;

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'trends',
          beat: targetBeat,
          language: lang,
          useGoogleSearch,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to refresh trends');
      }
      setLiveReportMarkdown(data.text);
      setLiveCitations(data.citations || []);
      setLastRefreshedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (lang === 'zh'
            ? '选题检索失败，请稍后重试。'
            : 'Failed to fetch trends.')
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section id="live-trends" className="py-16 md:py-20 border-b border-[#E5E0D5]">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#9A3412] mb-2">
              {lang === 'zh'
                ? '03 · 实时热门视频选题雷达 (LIVE GOOGLE SEARCH TRENDS)'
                : '03 · LIVE TRENDING VIDEO TOPICS & PRODUCTION PULSE'}
            </p>
            <h2
              className="text-3xl md:text-4xl font-editorial font-semibold tracking-tight text-[#1C1917]"
              style={{ textWrap: 'balance' }}
            >
              {lang === 'zh'
                ? '实时捕捉全网高热度议题，一键转化为视频制作流水线'
                : 'Discover Live Cultural & Technical Topics Ready for Production'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleRefreshLiveWebTrends}
              className="px-4 py-2.5 rounded-lg bg-[#1C1917] hover:bg-[#292524] disabled:opacity-60 text-[#FBF9F5] text-xs font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing
                ? useGoogleSearch
                  ? lang === 'zh'
                    ? '正在从 Google Search 拉取实时选题...'
                    : 'Searching Live Web Trends...'
                  : lang === 'zh'
                  ? '正在从静态训练数据生成选题...'
                  : 'Generating Topics (Static Data)...'
                : useGoogleSearch
                ? lang === 'zh'
                  ? '刷新实时全网选题 (Google Search)'
                  : 'Refresh Live Web Pulse (Google Search)'
                : lang === 'zh'
                ? '生成常青选题建议 (静态训练数据)'
                : 'Generate Topics (Static Training Data)'}
            </button>
          </div>
        </div>

        {/* Beat Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg border border-[#E5E0D5]">
            {beats.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBeat(b.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedBeat === b.id
                    ? 'bg-[#FBF9F5] text-[#1C1917] shadow-xs font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {lang === 'zh' ? b.zh : b.en}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-[#78716C]">
            <span
              className={
                useGoogleSearch
                  ? 'text-[#15803D] font-semibold'
                  : 'text-[#B45309] font-semibold'
              }
            >
              {useGoogleSearch
                ? 'SOURCE: Live Google Search Grounding'
                : 'SOURCE: Static Training Data Only'}
            </span>
            {lastRefreshedTime && (
              <>
                <span className="mx-2">·</span>
                <span className="text-[#15803D] tabular-nums">
                  UPDATED {lastRefreshedTime}
                </span>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
            {errorMsg}
          </div>
        )}

        {/* Curated Editorial Trend Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((item, idx) => (
            <div
              key={item.id}
              className="p-6 rounded-xl border border-[#E5E0D5] bg-[#FBF9F5] hover:border-[#D6CEBE] transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Unboxed metadata row with middots */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#78716C]">
                  <span className="text-[#9A3412] font-semibold tabular-nums">
                    0{idx + 1}. {item.recommendedPipeline}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{item.estimatedCost}</span>
                </div>

                <h3 className="mt-2.5 text-xl font-editorial font-semibold text-[#1C1917] leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-[#44403C] leading-relaxed">
                  {item.angle}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-[#F3EFE6]/70 border border-[#E5E0D5]">
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-[#78716C] mb-1">
                    {lang === 'zh' ? '推荐提示词 (PROMPT)' : 'RECOMMENDED PROMPT'}
                  </span>
                  <p className="text-xs font-mono text-[#1C1917] leading-relaxed">
                    “{item.suggestedPrompt}”
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E5E0D5] flex items-center justify-between gap-4">
                <span className="text-xs text-[#78716C] line-clamp-1">
                  {item.whyNow}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onLoadTopicIntoStudio(item.suggestedPrompt, item.angle);
                    const el = document.getElementById('research-studio');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F3EFE6] hover:bg-[#9A3412] text-[#1C1917] hover:text-white text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'zh' ? '载入研究工作台' : 'Load into Studio'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Search Grounded Report Drawer (When Refreshed) */}
        {(isRefreshing || liveReportMarkdown) && (
          <div className="mt-8 p-6 md:p-8 rounded-xl border border-[#D6CEBE] bg-[#F3EFE6]/60">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D5]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#9A3412]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#1C1917] font-semibold">
                  {lang === 'zh'
                    ? 'GEMINI-3.8-FLASH + GOOGLE SEARCH 实时全网选题简报'
                    : 'LIVE GOOGLE SEARCH PRODUCTION INTELLIGENCE REPORT'}
                </span>
              </div>
              {lastRefreshedTime && (
                <span className="text-xs font-mono text-[#78716C] tabular-nums">
                  {lastRefreshedTime}
                </span>
              )}
            </div>

            {isRefreshing ? (
              <div className="py-8 space-y-3 animate-pulse">
                <div className="h-4 bg-[#E5E0D5] rounded w-1/3" />
                <div className="h-3 bg-[#E5E0D5] rounded w-full" />
                <div className="h-3 bg-[#E5E0D5] rounded w-5/6" />
                <div className="h-3 bg-[#E5E0D5] rounded w-3/4" />
              </div>
            ) : (
              <>
                <div className="mt-4 markdown-editorial text-sm max-w-[75ch]">
                  <Markdown>{liveReportMarkdown || ''}</Markdown>
                </div>

                {liveCitations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#E5E0D5]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#1E3A8A] mb-2.5">
                      {lang === 'zh'
                        ? `实时网络新闻与研究来源 (${liveCitations.length})`
                        : `LIVE WEB SOURCES (${liveCitations.length})`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {liveCitations.map((cite, idx) => (
                        <a
                          key={idx}
                          href={cite.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg border border-[#E5E0D5] bg-[#FBF9F5] hover:border-[#1E3A8A]/40 transition-colors flex items-start justify-between gap-2 text-xs"
                        >
                          <span className="truncate font-medium text-[#1C1917]">
                            [{idx + 1}] {cite.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
