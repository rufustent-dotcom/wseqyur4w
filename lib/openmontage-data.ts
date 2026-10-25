export interface ShowcaseVideo {
  id: string;
  catalogId: string;
  titleZh: string;
  titleEn: string;
  category: 'native-video' | 'zero-video-api' | 'single-key-ad';
  categoryLabelZh: string;
  categoryLabelEn: string;
  videoUrl: string;
  cost: string;
  duration: string;
  pipeline: string;
  runtime: 'Remotion' | 'HyperFrames';
  summaryZh: string;
  summaryEn: string;
  providers: string[];
  promptUsed: string;
  costBreakdown: { item: string; provider: string; cost: string }[];
  visualTheme: {
    bgGradient: string;
    accentHex: string;
    motif: string;
  };
  featured?: boolean;
}

export interface PipelineDefinition {
  id: string;
  nameZh: string;
  nameEn: string;
  outputZh: string;
  outputEn: string;
  bestForZh: string;
  bestForEn: string;
  defaultRuntime: 'Remotion' | 'HyperFrames' | 'FFmpeg';
  typicalCost: string;
  zeroKeyReady: boolean;
  manifestSnippet: string;
  keyTools: string[];
}

export interface WorkflowStage {
  index: string;
  id: string;
  nameZh: string;
  nameEn: string;
  roleZh: string;
  roleEn: string;
  directorSkillPath: string;
  checkpointField: string;
  qualityGateZh: string;
  qualityGateEn: string;
}

export interface CuratedPrompt {
  id: string;
  group: 'reference' | 'zero-key' | 'documentary' | 'provider-backed' | 'full-setup';
  groupLabelZh: string;
  groupLabelEn: string;
  promptEn: string;
  promptZh: string;
  pipeline: string;
  estimatedCost: string;
  runtime: 'Remotion' | 'HyperFrames' | 'FFmpeg';
  referenceNote?: string;
}

export interface ProviderEntry {
  id: string;
  name: string;
  category: 'video' | 'image' | 'tts' | 'music' | 'runtime';
  type: 'Cloud API' | 'Local GPU' | 'Stock / Open Archive' | 'Local Free';
  envKey?: string;
  notesZh: string;
  notesEn: string;
  scores: {
    taskFit: number; // 30%
    quality: number; // 20%
    control: number; // 15%
    reliability: number; // 15%
    costEfficiency: number; // 10%
    latency: number; // 5%
    continuity: number; // 5%
  };
}

export interface GroundedCitation {
  title: string;
  uri: string;
}

export interface TrendTopicItem {
  id: string;
  beat: 'explainer' | 'documentary' | 'cinematic' | 'product';
  title: string;
  angle: string;
  recommendedPipeline: string;
  estimatedCost: string;
  suggestedPrompt: string;
  whyNow: string;
}

export interface ProviderDecisionLog {
  modality: string;
  selectedProvider: string;
  selectedScore: number;
  runnerUpProvider: string;
  runnerUpScore: number;
  confidence: string;
  reasonZh: string;
  reasonEn: string;
  cost: string;
}

export interface StageExecutionLog {
  stageIndex: string;
  stageNameZh: string;
  stageNameEn: string;
  outcome: 'pass' | 'warn' | 'fail';
  timestamp: string;
  detailZh: string;
  detailEn: string;
}

export interface ProductionAttempt {
  id: string;
  runCode: string;
  pipelineId: string;
  pipelineNameZh: string;
  pipelineNameEn: string;
  prompt: string;
  runtime: 'Remotion' | 'HyperFrames' | 'FFmpeg';
  status: 'completed' | 'fallback' | 'failed';
  statusLabelZh: string;
  statusLabelEn: string;
  failedStage?: string;
  failureReasonZh?: string;
  failureReasonEn?: string;
  createdAt: string;
  durationSec: string;
  budget: {
    estimated: string;
    locked: string;
    settled: string;
    mode: 'cap ($10.00)' | 'warn ($2.00)' | 'observe';
  };
  providerDecisions: ProviderDecisionLog[];
  stageLogs: StageExecutionLog[];
  groundedSummary: string;
  citations: GroundedCitation[];
}

export const SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: 'signal-from-tomorrow',
    catalogId: 'OM-FILM-01',
    titleZh: '来自明天的信号',
    titleEn: 'SIGNAL FROM TOMORROW',
    category: 'native-video',
    categoryLabelZh: '电影级预告片 · Veo 动态生成',
    categoryLabelEn: 'Cinematic Sci-Fi Trailer · Veo Motion',
    videoUrl: 'https://github.com/user-attachments/assets/f77ce7a4-68b8-4f94-a287-e94bf50a32e1',
    cost: '$2.40',
    duration: '0:45',
    pipeline: 'Cinematic',
    runtime: 'Remotion',
    summaryZh:
      '一部完全通过 OpenMontage 制作的电影级科幻预告片：包括概念构建、剧本编写、分镜场景规划、Google Veo 生成的原生动态片段、定制氛围配乐以及 Remotion 最终合成。',
    summaryEn:
      'A theatrical sci-fi trailer produced end-to-end by OpenMontage: concept development, screenplay, scene planning, Google Veo generated motion clips, original score, and Remotion composition.',
    providers: ['Google Veo 3', 'Remotion', 'FFmpeg', 'ElevenLabs SFX'],
    promptUsed:
      'Create a cinematic 30-second trailer for a sci-fi concept: humanity receives a warning from 1000 years in the future',
    costBreakdown: [
      { item: 'Scene Motion Clips (Veo 3)', provider: 'FAL_KEY / Google Veo', cost: '$1.85' },
      { item: 'Cinematic Score & SFX', provider: 'ElevenLabs Audio', cost: '$0.40' },
      { item: 'Voiceover & Mastering', provider: 'Google Chirp3-HD + FFmpeg', cost: '$0.15' },
    ],
    visualTheme: {
      bgGradient: 'from-[#1C1917] via-[#292524] to-[#431407]',
      accentHex: '#EA580C',
      motif: 'ANAMORPHIC · 2.39:1',
    },
    featured: true,
  },
  {
    id: 'the-last-banana',
    catalogId: 'OM-FILM-02',
    titleZh: '最后的香蕉',
    titleEn: 'THE LAST BANANA',
    category: 'native-video',
    categoryLabelZh: '皮克斯风格短片 · Kling v3',
    categoryLabelEn: 'Pixar-Style 3D Short · Kling v3',
    videoUrl: 'https://github.com/user-attachments/assets/8daca07f-cdf8-4bec-89c3-9dc2176363fa',
    cost: '$1.33',
    duration: '1:00',
    pipeline: 'Animation',
    runtime: 'Remotion',
    summaryZh:
      '一部 60 秒皮克斯风格的动画短片，讲述了一根孤独的香蕉与奇异果建立友谊的故事。使用了 6 个 Kling v3 生成的动态片段（通过 fal.ai）、Google Chirp3-HD 旁白、免版税钢琴曲、TikTok 风格的词级字幕以及 Remotion 合成。总成本仅 1.33 美元。',
    summaryEn:
      'A 60-second Pixar-style animated short about a lonely banana befriending a kiwi. Built with 6 Kling v3 motion clips via fal.ai, Google Chirp3-HD narration, royalty-free piano score, TikTok word-level captions, and Remotion.',
    providers: ['Kling v3 (fal.ai)', 'Google Chirp3-HD TTS', 'Remotion', 'Royalty-Free Piano'],
    promptUsed:
      'Create a 60-second Pixar-style animated short story about a lonely banana on a kitchen counter who forms an unexpected friendship with a kiwi fruit, with warm narration and word-level captions.',
    costBreakdown: [
      { item: '6x Motion Clips (Kling v3)', provider: 'FAL_KEY', cost: '$1.20' },
      { item: 'Narrator Voiceover', provider: 'Google Chirp3-HD', cost: '$0.13' },
      { item: 'Piano Score & Remotion Render', provider: 'Built-in / Local', cost: '$0.00' },
    ],
    visualTheme: {
      bgGradient: 'from-[#292524] via-[#3F2E1E] to-[#713F12]',
      accentHex: '#F59E0B',
      motif: '6 CLIPS · CHIRP3-HD',
    },
    featured: true,
  },
  {
    id: 'void-neural-interface',
    catalogId: 'OM-FILM-03',
    titleZh: '虚空神经接口',
    titleEn: 'VOID — Neural Interface',
    category: 'single-key-ad',
    categoryLabelZh: '单一密钥产品广告 · OpenAI',
    categoryLabelEn: 'Single-Key Product Ad · OpenAI',
    videoUrl: 'https://github.com/user-attachments/assets/8a6d2cc3-7ad2-46f5-922f-a8e3e5848d9f',
    cost: '$0.69',
    duration: '0:40',
    pipeline: 'Animated Explainer',
    runtime: 'Remotion',
    summaryZh:
      '仅使用一个 API 密钥 (OpenAI) 制作的产品广告。包含 4 张 AI 生成的图像 (gpt-image-1)、TTS 旁白、自动获取的免版税音乐、通过 WhisperX 生成的词级字幕以及 Remotion 数据可视化。零手动资产工作。',
    summaryEn:
      'Produced using only a single API key (OpenAI). Features 4 gpt-image-1 visuals, OpenAI TTS narration, auto-retrieved royalty-free music, WhisperX word-level timestamps, and Remotion data visualizations.',
    providers: ['gpt-image-1', 'OpenAI TTS', 'WhisperX', 'Remotion Data Viz'],
    promptUsed:
      'Make a sleek hardware product launch commercial for VOID, a minimalist non-invasive neural interface, including telemetry data visualizations and crisp narration.',
    costBreakdown: [
      { item: '4x Product Keyframes (gpt-image-1)', provider: 'OPENAI_API_KEY', cost: '$0.60' },
      { item: 'Narration Voiceover (OpenAI TTS)', provider: 'OPENAI_API_KEY', cost: '$0.09' },
      { item: 'WhisperX Alignment & Remotion Charts', provider: 'Local Free', cost: '$0.00' },
    ],
    visualTheme: {
      bgGradient: 'from-[#09090B] via-[#18181B] to-[#27272A]',
      accentHex: '#3B82F6',
      motif: '1 API KEY · ZERO MANUAL ASSETS',
    },
  },
  {
    id: 'afternoon-in-candyland',
    catalogId: 'OM-FILM-04',
    titleZh: '糖果乐园的午后',
    titleEn: 'Afternoon in Candyland',
    category: 'zero-video-api',
    categoryLabelZh: '吉卜力风格动画 · 零视频生成 API',
    categoryLabelEn: 'Ghibli Anime · Zero Video-Gen API',
    videoUrl: 'https://github.com/user-attachments/assets/3c5d7122-7198-43e2-a97d-ed27558dd324',
    cost: '$0.15',
    duration: '0:45',
    pipeline: 'Animation',
    runtime: 'Remotion',
    summaryZh:
      '一部吉卜力风格的动漫。一个小女孩在糖果门、软糖河和棒棒糖花园中奇妙的午后冒险。包含 12 张 FLUX 生成的图像，配有多图交叉淡入淡出、电影级摄像机运动（缩放、平移、Ken Burns 特效）、闪光/花瓣/萤火虫粒子叠加效果，以及带有自动检测能量偏移的环境音乐。无需视频生成 API。',
    summaryEn:
      'Ghibli-inspired anime adventure across candy gates and gummy rivers. 12 FLUX images animated via Remotion with multi-layer cross-fades, Ken Burns camera motion, sparkle/petal particles, and energy-synced ambient music.',
    providers: ['FLUX (12 Frames)', 'Remotion Camera Engine', 'Particle Shaders', 'FFmpeg'],
    promptUsed:
      'Create a Ghibli-style animated video of a young girl exploring a magical afternoon Candyland with gummy rivers, lollipop gardens, petal particles, and gentle camera drift.',
    costBreakdown: [
      { item: '12x Storyboard Illustrations (FLUX)', provider: 'FAL_KEY', cost: '$0.15' },
      { item: 'Ken Burns Camera & Particle Overlays', provider: 'Remotion Local', cost: '$0.00' },
      { item: 'Ambient Energy-Matched Soundtrack', provider: 'Built-in Archive', cost: '$0.00' },
    ],
    visualTheme: {
      bgGradient: 'from-[#451A03] via-[#78350F] to-[#9A3412]',
      accentHex: '#F97316',
      motif: '12 FLUX FRAMES · $0.15',
    },
  },
  {
    id: 'mori-no-seishin',
    catalogId: 'OM-FILM-05',
    titleZh: '森林之灵 (Mori no Seishin)',
    titleEn: 'Mori no Seishin — Spirit of the Forest',
    category: 'zero-video-api',
    categoryLabelZh: '视差粒子动画 · 0.15 美元',
    categoryLabelEn: 'Parallax & Particle Anime · $0.15',
    videoUrl: 'https://github.com/user-attachments/assets/e8dc5e32-5c70-46de-bd52-eef887719d13',
    cost: '$0.15',
    duration: '0:48',
    pipeline: 'Animation',
    runtime: 'Remotion',
    summaryZh:
      '讲述森林之灵穿过古老树林的旅程。包含 12 张 FLUX 生成的图像，配有视差交叉淡入淡出、漂移和平移的摄像机运动、萤火虫和花瓣粒子、电影级暗角光照效果以及环境森林配乐。通过 Remotion 动画引擎让静态图像栩栩如生。',
    summaryEn:
      'A forest spirit journeying through ancient woods. 12 FLUX frames brought to life by the Remotion animation engine with parallax cross-fades, camera drift, firefly particles, cinematic vignette lighting, and ambient forest score.',
    providers: ['FLUX (12 Frames)', 'Remotion Parallax', 'Firefly Particle System', 'FFmpeg'],
    promptUsed:
      'Create a Ghibli-style anime short titled Mori no Seishin following a luminous forest spirit through ancient moss-covered woods with fireflies and ambient forest soundscape.',
    costBreakdown: [
      { item: '12x Ancient Forest Keyframes (FLUX)', provider: 'FAL_KEY', cost: '$0.15' },
      { item: 'Parallax Camera & Firefly Particles', provider: 'Remotion Local', cost: '$0.00' },
      { item: 'Forest Soundscape & Color Grade', provider: 'FFmpeg Local', cost: '$0.00' },
    ],
    visualTheme: {
      bgGradient: 'from-[#052E16] via-[#14532D] to-[#166534]',
      accentHex: '#10B981',
      motif: 'PARALLAX · FIREFLY ENGINE',
    },
  },
  {
    id: 'into-the-abyss',
    catalogId: 'OM-FILM-06',
    titleZh: '潜入深渊 (Into the Abyss)',
    titleEn: 'Into the Abyss — Deep Sea Exploration',
    category: 'zero-video-api',
    categoryLabelZh: '深海生物发光 · 零视频生成 API',
    categoryLabelEn: 'Bioluminescent Anime · Zero Video API',
    videoUrl: 'https://github.com/user-attachments/assets/9cf633d9-c264-4961-bfd0-b1db188654aa',
    cost: '$0.15',
    duration: '0:45',
    pipeline: 'Animation',
    runtime: 'Remotion',
    summaryZh:
      '以动漫风格渲染的深海探索。生物发光的花园、珊瑚大教堂和发光生物 — 12 张 FLUX 生成的图像，配有闪烁和薄雾粒子叠加、光线特效、平滑的摄像机运动和海洋环境配乐。完全不需要视频生成 API。',
    summaryEn:
      'Anime-rendered deep ocean exploration featuring bioluminescent gardens, coral cathedrals, and glowing fauna—12 FLUX frames with mist/shimmer overlays, volumetric light rays, smooth camera motion, and ocean ambient music.',
    providers: ['FLUX (12 Frames)', 'Remotion Light Rays', 'Mist & Shimmer Overlay', 'FFmpeg'],
    promptUsed:
      'Make a 30-second anime-style animation of an underwater temple and deep-sea abyss with bioluminescent coral cathedrals, volumetric light rays, and ambient ocean score.',
    costBreakdown: [
      { item: '12x Bioluminescent Frames (FLUX)', provider: 'FAL_KEY', cost: '$0.15' },
      { item: 'Volumetric Ray & Mist Compositing', provider: 'Remotion Local', cost: '$0.00' },
      { item: 'Deep Ocean Ambient Mix', provider: 'Audio Mixer Local', cost: '$0.00' },
    ],
    visualTheme: {
      bgGradient: 'from-[#082F49] via-[#0C4A6E] to-[#1E3A8A]',
      accentHex: '#38BDF8',
      motif: 'VOLUMETRIC RAYS · $0.15',
    },
  },
];

export const PIPELINES: PipelineDefinition[] = [
  {
    id: 'animated-explainer',
    nameZh: '动画解说 (Animated Explainer)',
    nameEn: 'Animated Explainer',
    outputZh: '包含实时网络研究、旁白、视觉效果、数据图表与音乐的 AI 生成解说视频',
    outputEn: 'AI-generated explainer with web research, narration, visuals, charts, and music',
    bestForZh: '教育内容、科学原理教程、深度主题解析、数据驱动故事',
    bestForEn: 'Educational content, tutorials, topic deep-dives, data-driven storytelling',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00 – $0.85',
    zeroKeyReady: true,
    keyTools: ['Web Research (15-25 Queries)', 'Piper / Google TTS', 'FLUX / Stock Images', 'Remotion Charts & Captions'],
    manifestSnippet: `pipeline: animated_explainer
render_runtime: remotion
stages:
  - research:   { min_queries: 15, verify_claims: true }
  - proposal:   { lock_runtime: true, budget_gate: true }
  - script:     { voice_direction: true, pacing_wpm: 145 }
  - scene_plan: { max_static_ratio: 0.35, ppt_risk_gate: 0.40 }
  - assets:     { scoring_dimensions: 7 }
  - edit:       { word_level_captions: true, audio_ducking: -14dB }
  - compose:    { post_review: ["ffprobe", "frame_sample_4x", "lufs_check"] }`,
  },
  {
    id: 'documentary-montage',
    nameZh: '纪录片蒙太奇 (Documentary Montage)',
    nameEn: 'Documentary Montage',
    outputZh: '从通过 CLIP 索引的免费影像库和开放档案（Archive.org、NASA、Wikimedia、Pexels）剪辑出的真实动态画面蒙太奇',
    outputEn: 'Real-footage thematic montage cut from CLIP-indexed open archives (Archive.org, NASA, Wikimedia, Pexels)',
    bestForZh: '视频随笔、情绪化音画诗、检索优先的空镜头剪辑、零付费视频 API 的真实原生视频 (“video video”)',
    bestForEn: 'Video essays, tone poems, archival collages, true native footage ("video video") without paid video APIs',
    defaultRuntime: 'FFmpeg',
    typicalCost: '$0.00 (100% Free)',
    zeroKeyReady: true,
    keyTools: ['Archive.org Corpus', 'NASA & Wikimedia Commons', 'CLIP Semantic Retrieval', 'Video Trimmer & Stitch', 'Color Grade LUT'],
    manifestSnippet: `pipeline: documentary_montage
render_runtime: ffmpeg
promise: native_motion_footage_only
stages:
  - research:   { archival_epochs: true, visual_motifs: true }
  - corpus:     { sources: ["archive_org", "nasa", "wikimedia", "pexels"], clip_index: true }
  - scene_plan: { forbid_ken_burns_stills: true, min_clip_motion: 0.65 }
  - edit:       { crossfade_curve: "film_dissolve", color_lut: "archival_16mm" }
  - compose:    { post_review: ["ffprobe", "black_frame_scan", "promise_verification"] }`,
  },
  {
    id: 'cinematic',
    nameZh: '电影级 (Cinematic)',
    nameEn: 'Cinematic Trailer',
    outputZh: '电影级预告片、前导片、高张力情绪剪辑与声效设计',
    outputEn: 'Theatrical trailers, teasers, mood-driven cuts, and sound design',
    bestForZh: '品牌宣传片、科幻概念预告、电影前导片、高端产品发布',
    bestForEn: 'Brand films, sci-fi concept trailers, teasers, high-impact launches',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.80 – $2.80',
    zeroKeyReady: false,
    keyTools: ['Google Veo 3 / Kling / Runway Gen-4', 'ElevenLabs SFX & Score', 'Color Grade LUT', 'Remotion Compositor'],
    manifestSnippet: `pipeline: cinematic
render_runtime: remotion
aspect_ratio: "21:9"
stages:
  - research:   { visual_references: true, pacing_curve: "three_act_trailer" }
  - proposal:   { lock_runtime: true, approval_threshold_usd: 0.50 }
  - assets:     { video_providers: ["veo3", "kling_v3", "runway_gen4", "wan2_1_local"] }
  - compose:    { letterbox: "2560x1080", lufs_target: -14.0 }`,
  },
  {
    id: 'animation',
    nameZh: '动画与角色表演 (Animation & Character)',
    nameEn: 'Animation & Rigged SVG/GSAP',
    outputZh: '吉卜力视差动画、动态图形、动态排版、或绑定的 SVG/GSAP 角色动画',
    outputEn: 'Parallax anime sequences, kinetic typography, motion graphics, or rigged SVG/GSAP character animation',
    bestForZh: '故事短片、吉卜力/动漫视觉、社交媒体动态排版、卡通角色表演',
    bestForEn: 'Animated stories, Ghibli/anime visuals, kinetic typography, rigged SVG character performances',
    defaultRuntime: 'HyperFrames',
    typicalCost: '$0.00 – $1.35',
    zeroKeyReady: true,
    keyTools: ['HyperFrames (HTML/CSS/GSAP)', 'Remotion Parallax & Particles', 'FLUX Storyboards', 'SVG Rig & Pose Library'],
    manifestSnippet: `pipeline: animation
render_runtime: hyperframes # or remotion for multi-plane parallax
stages:
  - proposal:   { select_runtime_matrix: "skills/core/hyperframes.md" }
  - scene_plan: { camera_rig: ["drift", "parallax_3d", "ken_burns"], particles: ["fireflies", "petals", "mist"] }
  - compose:    { output: "projects/<name>/renders/final.mp4" }`,
  },
  {
    id: 'clip-factory',
    nameZh: '片段工厂 (Clip Factory)',
    nameEn: 'Clip Factory',
    outputZh: '从单一长视频素材中批量分析、排名并裁剪出高传播度短视频片段',
    outputEn: 'Batch-generates ranked short-form vertical clips from a single long-form source video',
    bestForZh: '将长访谈、发布会或课程重制为 YouTube Shorts / TikTok / Reels',
    bestForEn: 'Repurposing long-form videos into YouTube Shorts, TikToks, and Instagram Reels',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00 (Local WhisperX + FFmpeg)',
    zeroKeyReady: true,
    keyTools: ['Source File Probe (ffprobe)', 'WhisperX Word Timestamps', 'Scene Detect', 'TikTok Word-Level Captions'],
    manifestSnippet: `pipeline: clip_factory
render_runtime: remotion
aspect_ratio: "9:16"
stages:
  - inspect:    { ffprobe_source: true, whisperx_align: true }
  - rank_hooks: { min_virality_score: 0.78, count: 5 }
  - compose:    { tiktok_captions: true, face_reframe: true }`,
  },
  {
    id: 'avatar-spokesperson',
    nameZh: '化身代言 (Avatar Spokesperson)',
    nameEn: 'Avatar Spokesperson',
    outputZh: '数字人驱动的演讲者视频，支持唇形同步与多图卡插入',
    outputEn: 'Digital human presenter videos with lip-sync and B-roll overlays',
    bestForZh: '企业通讯、多语言培训、产品更新公告',
    bestForEn: 'Corporate communications, training modules, product announcements',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00 – $1.20',
    zeroKeyReady: true,
    keyTools: ['SadTalker / MuseTalk', 'Wav2Lip', 'HeyGen API', 'Remotion TalkingHead Component'],
    manifestSnippet: `pipeline: avatar_spokesperson
render_runtime: remotion
stages:
  - script:     { teleprompter_cadence: true }
  - avatar_gen: { engines: ["musetalk_local", "sadtalker_local", "heygen_cloud"] }
  - compose:    { component: "TalkingHead", b_roll_cutaways: true }`,
  },
  {
    id: 'localization-dub',
    nameZh: '本地化与配音 (Localization & Dub)',
    nameEn: 'Localization & Dubbing',
    outputZh: '为现有视频自动转录、翻译、多语言配音（50+ 语言）并烧录双语字幕',
    outputEn: 'Transcribes, translates, dubs (50+ languages), and burns synchronized subtitles for existing videos',
    bestForZh: '全球多语言内容分发、跨境产品演示、教育课程出海',
    bestForEn: 'Global multi-language distribution, international product demos, course localization',
    defaultRuntime: 'FFmpeg',
    typicalCost: '$0.00 – $0.45',
    zeroKeyReady: true,
    keyTools: ['WhisperX Transcriber', 'Google TTS (700+ Voices / 50+ Languages)', 'Piper Local TTS', 'Wav2Lip / Audio Ducking'],
    manifestSnippet: `pipeline: localization_dub
render_runtime: ffmpeg
stages:
  - transcribe: { engine: "whisperx", word_timestamps: true }
  - translate:  { preserve_syllable_budget: true }
  - dub:        { provider: "google_tts_chirp3", duck_original_bed: -18dB }`,
  },
  {
    id: 'hybrid',
    nameZh: '混合制作 (Hybrid Footage + AI)',
    nameEn: 'Hybrid (Source Footage + AI B-Roll)',
    outputZh: '将用户实拍素材与 AI 生成的辅助视觉效果、动态数据卡片无缝融合',
    outputEn: 'Combines user source footage with AI-generated B-roll, motion graphics, and data overlays',
    bestForZh: '使用动态图形与视觉生成增强实拍评测、访谈或纪录片',
    bestForEn: 'Enhancing real footage with custom motion graphics, charts, and AI cutaways',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00 – $0.90',
    zeroKeyReady: true,
    keyTools: ['Source File Inspector', 'Scene Detect', 'Remotion Overlays', 'ManimCE / FLUX Cutaways'],
    manifestSnippet: `pipeline: hybrid
render_runtime: remotion
stages:
  - inspect:    { probe_codecs: true, scene_boundary_detect: true }
  - augment:     { insert_data_cards: true, generate_b_roll_gaps: true }`,
  },
  {
    id: 'podcast-repurpose',
    nameZh: '播客重制 (Podcast Repurpose)',
    nameEn: 'Podcast Repurpose',
    outputZh: '将长音频播客精彩片段转化为带声波可视化、说话人跟踪与逐词字幕的视频',
    outputEn: 'Transforms audio podcast highlights into dynamic videos with waveforms and word-level captions',
    bestForZh: '播客节目营销、音频通讯视频化、社交平台分发',
    bestForEn: 'Podcast marketing, audiograms, social video highlights',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00',
    zeroKeyReady: true,
    keyTools: ['WhisperX Diarization', 'Audio Enhance', 'Remotion Waveform & Captions', 'FFmpeg'],
    manifestSnippet: `pipeline: podcast_repurpose
render_runtime: remotion
stages:
  - analyze:    { speaker_diarization: true, highlight_extraction: true }
  - compose:    { audio_normalize_lufs: -16, waveform_style: "editorial" }`,
  },
  {
    id: 'screen-demo',
    nameZh: '屏幕演示 (Screen Demo)',
    nameEn: 'Screen Demo & Product Walkthrough',
    outputZh: '精美打磨的软件屏幕录制、自动焦点缩放、键盘快捷键高亮与专业配音',
    outputEn: 'Polished software screen recordings with kinetic zoom callouts, UI framing, and voiceover',
    bestForZh: 'SaaS 产品发布演示、开发者工具教程、技术文档视频',
    bestForEn: 'SaaS product launches, developer tool walkthroughs, documentation videos',
    defaultRuntime: 'HyperFrames',
    typicalCost: '$0.00 – $0.25',
    zeroKeyReady: true,
    keyTools: ['HyperFrames Website-to-Video', 'Frame Sampler', 'Piper / OpenAI TTS', 'FFmpeg Mastering'],
    manifestSnippet: `pipeline: screen_demo
render_runtime: hyperframes
stages:
  - capture:    { viewport_zoom_keyframes: true, cursor_smoothing: true }
  - compose:    { device_frame: "minimal_browser", kinetic_callouts: true }`,
  },
  {
    id: 'talking-head',
    nameZh: '口播精剪 (Talking Head)',
    nameEn: 'Talking Head Editorial Cut',
    outputZh: '以真人出镜为主的演讲视频，自动去除气口静音、插入章节卡片、B-roll 与词级字幕',
    outputEn: 'Human presenter video with silence removal, chapter title cards, B-roll cutaways, and captions',
    bestForZh: '创始人演讲、知识型 Vlog、深度访谈、在线课程',
    bestForEn: 'Founder keynotes, educational vlogs, interviews, online courses',
    defaultRuntime: 'Remotion',
    typicalCost: '$0.00 – $0.30',
    zeroKeyReady: true,
    keyTools: ['Audio Enhance (Denoise)', 'Face Enhance', 'Video Trimmer', 'Remotion Chapter Cards'],
    manifestSnippet: `pipeline: talking_head
render_runtime: remotion
stages:
  - clean:      { trim_silences: true, audio_denoise: true }
  - enrich:     { chapter_cards: true, b_roll_insertion: true }`,
  },
];

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    index: '01',
    id: 'research',
    nameZh: '实时网络研究',
    nameEn: 'Web Research (First-Class)',
    roleZh: '在写下一句脚本前，执行 15–25 次网络检索（YouTube、Reddit、HN、学术与新闻），收集真实数据点、受众痛点与视觉参考。',
    roleEn: 'Executes 15–25 live web searches across YouTube, Reddit, Hacker News, news, and academic sources before writing a single line of script.',
    directorSkillPath: 'skills/pipelines/<pipeline>/01_research.md',
    checkpointField: 'state.research_brief',
    qualityGateZh: '拒绝无来源的幻觉事实；所有核心数据必须附带可验证的来源 URL。',
    qualityGateEn: 'Rejects ungrounded claims; every key statistic must link to a verifiable web source.',
  },
  {
    index: '02',
    id: 'proposal',
    nameZh: '创意提案与预算锁定',
    nameEn: 'Proposal & Runtime Lock',
    roleZh: '基于研究简报或参考视频，生成 2–3 个差异化概念，锁定 render_runtime（Remotion 或 HyperFrames），并在生成资产前估算准确成本。',
    roleEn: 'Generates 2–3 differentiated concepts, locks render_runtime (Remotion vs. HyperFrames), and calculates pre-execution cost estimates.',
    directorSkillPath: 'skills/pipelines/<pipeline>/02_proposal.md',
    checkpointField: 'state.approved_proposal',
    qualityGateZh: '人类批准门（Human Approval Gate）+ 预算上限锁定（默认单操作 >$0.50 需确认）。',
    qualityGateEn: 'Human approval gate + budget lock (pauses for confirmation above $0.50 threshold).',
  },
  {
    index: '03',
    id: 'script',
    nameZh: '带语音指导的脚本',
    nameEn: 'Voice-Directed Script',
    roleZh: '撰写分幕旁白脚本，内嵌语速节奏、情绪重音、停顿标记以及与画面严格对应的视觉提示锚点。',
    roleEn: 'Drafts scene-by-scene narration with pacing cues, vocal inflection notes, pause markers, and visual sync anchors.',
    directorSkillPath: 'skills/pipelines/<pipeline>/03_script.md',
    checkpointField: 'state.script_manifest',
    qualityGateZh: 'Schema 契约验证 + 词数与目标时长匹配度检查（误差 ≤ 8%）。',
    qualityGateEn: 'JSON Schema validation + word-count-to-duration pacing audit (within 8% tolerance).',
  },
  {
    index: '04',
    id: 'scene-plan',
    nameZh: '分镜规划与 PPT 风险拦截',
    nameEn: 'Scene Plan & PPT Risk Gate',
    roleZh: '为每个镜头指定视觉语法、镜头运动、转场与排版比例，并运行 6 维度 PPT 风险评分器。',
    roleEn: 'Assigns camera motion, visual grammar, and transitions per shot while running the 6-dimension PPT Risk Scorer.',
    directorSkillPath: 'skills/pipelines/<pipeline>/04_scene_plan.md',
    checkpointField: 'state.edit_decisions',
    qualityGateZh: '6 维度 PPT 风险评分（重复性、装饰性视觉、弱运动幅度、镜头意图、排版过度依赖、虚假电影感宣称）必须通过。',
    qualityGateEn: '6-dimension Slide-Deck Risk Gate blocks plans that rely on static slides or weak motion.',
  },
  {
    index: '05',
    id: 'assets',
    nameZh: '7 维度评分资产生成与检索',
    nameEn: '7-Dim Scored Asset Generation',
    roleZh: '通过 7 维度评分引擎自动选择最佳视频、图像、TTS 与音乐提供商（或 CLIP 开源档案语料库），记录完整决策审计日志。',
    roleEn: 'Scores all available providers across 7 dimensions (Task Fit 30%, Quality 20%, Control 15%, Reliability 15%, Cost 10%, Latency 5%, Continuity 5%).',
    directorSkillPath: 'skills/pipelines/<pipeline>/05_assets.md',
    checkpointField: 'state.asset_manifest',
    qualityGateZh: '每个生成/检索资产验证分辨率、时长、音频采样率并记录备选方案得分。',
    qualityGateEn: 'Verifies asset resolution, duration, and audio levels while logging all runner-up provider scores.',
  },
  {
    index: '06',
    id: 'edit',
    nameZh: '时间线剪辑与混音',
    nameEn: 'Timeline Assembly & Audio Mix',
    roleZh: '执行精确裁剪、WhisperX 词级时间轴对齐、背景音乐自动闪避（ducking）、色彩调色 LUT 与转场编排。',
    roleEn: 'Performs precision trimming, WhisperX word-level alignment, BGM audio ducking, LUT color grading, and transition timing.',
    directorSkillPath: 'skills/pipelines/<pipeline>/06_edit.md',
    checkpointField: 'state.timeline_assembly',
    qualityGateZh: '合成前验证关卡（Pre-Composition Gate）：检查交付承诺（如“纯真实素材”不可混入静态图）与渲染器治理。',
    qualityGateEn: 'Pre-Composition Gate blocks rendering if delivery promises or runtime governance rules are violated.',
  },
  {
    index: '07',
    id: 'compose',
    nameZh: '合成渲染与多点自我审查',
    nameEn: 'Render & Post-Render Self-Review',
    roleZh: '调用 Remotion、HyperFrames 或 FFmpeg 渲染最终成片，随后强制运行 ffprobe、4 点抽帧黑屏检查、音频静音/削峰分析与字幕核验。',
    roleEn: 'Renders via Remotion, HyperFrames, or FFmpeg, followed by mandatory ffprobe verification, 4-point frame extraction, and audio clipping checks.',
    directorSkillPath: 'skills/pipelines/<pipeline>/07_compose.md',
    checkpointField: 'projects/<name>/renders/final.mp4',
    qualityGateZh: '只有通过全部渲染后自我审查（ffprobe + 4x 帧采样 + 音频电平 + 字幕检查）的视频才会交付给用户。',
    qualityGateEn: 'Video is only delivered after passing ffprobe, 4x frame inspection, audio level analysis, and caption verification.',
  },
];

export const INITIAL_PRODUCTION_ATTEMPTS: ProductionAttempt[] = [
  {
    id: 'attempt-841',
    runCode: 'OM-RUN-841',
    pipelineId: 'animated-explainer',
    pipelineNameZh: '动画解说 (Animated Explainer)',
    pipelineNameEn: 'Animated Explainer',
    prompt: 'Make a 60-second animated explainer on how 2026 solid-state EV batteries eliminate lithium dendrites and charge in 10 minutes.',
    runtime: 'Remotion',
    status: 'completed',
    statusLabelZh: '已完成通过 (COMPLETED)',
    statusLabelEn: 'COMPLETED · ALL GATES PASSED',
    createdAt: '2026-10-22 18:40',
    durationSec: '48.2s',
    budget: {
      estimated: '$0.30',
      locked: '$0.30',
      settled: '$0.27',
      mode: 'cap ($10.00)',
    },
    providerDecisions: [
      {
        modality: 'Keyframes & Diagrams',
        selectedProvider: 'FLUX (via fal.ai)',
        selectedScore: 95.3,
        runnerUpProvider: 'Google Imagen 4',
        runnerUpScore: 93.1,
        confidence: '0.94',
        reasonZh: '分镜一致性得分最高 (92)，10 张分子结构插图仅消耗 $0.14',
        reasonEn: 'Highest storyboard continuity (92); 10 molecular keyframes rendered for $0.14',
        cost: '$0.14',
      },
      {
        modality: 'TTS Narration',
        selectedProvider: 'Google TTS (Chirp3-HD)',
        selectedScore: 95.2,
        runnerUpProvider: 'OpenAI TTS HD',
        runnerUpScore: 91.8,
        confidence: '0.92',
        reasonZh: '科学术语发音准确率 100%，支持逐词时间戳对齐',
        reasonEn: '100% accuracy on electrochemistry terminology with clean word boundaries',
        cost: '$0.13',
      },
      {
        modality: 'Composition & Charts',
        selectedProvider: 'Remotion (React Engine)',
        selectedScore: 98.1,
        runnerUpProvider: 'HyperFrames (GSAP)',
        runnerUpScore: 94.0,
        confidence: '0.97',
        reasonZh: '锁定 Remotion 以驱动能量密度对比图 (Wh/kg) 与弹簧物理动画',
        reasonEn: 'Locked Remotion for reactive Wh/kg bar charts and spring transitions',
        cost: '$0.00',
      },
    ],
    stageLogs: [
      {
        stageIndex: '01',
        stageNameZh: '实时网络研究',
        stageNameEn: 'Web Research (Google Search)',
        outcome: 'pass',
        timestamp: '18:39:12',
        detailZh: '完成 18 次实时检索；核实 2026 硫化物固态电池 450 Wh/kg 与 10 分钟快充数据。',
        detailEn: '18 search queries completed; verified 450 Wh/kg sulfide electrolyte benchmarks.',
      },
      {
        stageIndex: '04',
        stageNameZh: '分镜与 PPT 风险门',
        stageNameEn: 'Scene Plan & PPT Risk Gate',
        outcome: 'pass',
        timestamp: '18:39:28',
        detailZh: '6 维度 PPT 风险得分 0.16（低于 0.40 阈值），动态图表占比 68%。',
        detailEn: '6-dim PPT Risk Score: 0.16 (threshold <= 0.40); 68% active kinetic scenes.',
      },
      {
        stageIndex: '07',
        stageNameZh: '合成与渲染后自检',
        stageNameEn: 'Post-Render Self-Review',
        outcome: 'pass',
        timestamp: '18:40:00',
        detailZh: 'ffprobe 校验 1920x1080@60fps 通过；4 点抽帧无黑屏；响度 -14.1 LUFS。',
        detailEn: 'ffprobe 1920x1080@60fps verified; 4x frame samples clean; audio -14.1 LUFS.',
      },
    ],
    groundedSummary:
      'Grounded via Google Search: Verified 2026 pilot production metrics for solid-state EV cells (400–500 Wh/kg energy density, 10–80% state-of-charge in 9.5 minutes using ceramic/sulfide separators that physically block lithium dendrite propagation).',
    citations: [
      {
        title: 'Solid-State Battery Commercialization & Energy Density Benchmarks — Nature Energy',
        uri: 'https://www.nature.com/nenergy/',
      },
      {
        title: 'U.S. Department of Energy — Vehicle Technologies Office Battery R&D',
        uri: 'https://www.energy.gov/eere/vehicles/batteries',
      },
    ],
  },
  {
    id: 'attempt-840',
    runCode: 'OM-RUN-840',
    pipelineId: 'cinematic',
    pipelineNameZh: '电影级 (Cinematic)',
    pipelineNameEn: 'Cinematic Trailer',
    prompt: 'Create a 45-second cinematic 21:9 trailer following an autonomous cryobot melting through Europa ice into a hydrothermal ocean.',
    runtime: 'Remotion',
    status: 'fallback',
    statusLabelZh: '自动降级恢复 (FALLBACK RECOVERED)',
    statusLabelEn: 'FALLBACK RECOVERED · COMPLETED',
    failedStage: 'Stage 05 (Primary Video Provider)',
    failureReasonZh: '首选提供商 Google Veo 3 遇到上游并发速率限制 (HTTP 429)，7 维度评分器在 1.2 秒内自动切换至次优提供商 Kling v3 (得分 92.6) 完成渲染，节省 $0.77。',
    failureReasonEn: 'Primary provider Google Veo 3 returned HTTP 429 rate limit on shot 3; 7-dimension selector automatically failed over to Kling v3 (score 92.6), completing render and saving $0.77.',
    createdAt: '2026-10-22 18:15',
    durationSec: '74.5s',
    budget: {
      estimated: '$2.10',
      locked: '$2.10',
      settled: '$1.33',
      mode: 'cap ($10.00)',
    },
    providerDecisions: [
      {
        modality: 'Motion Video Clips',
        selectedProvider: 'Kling v3 (Fallback from Veo 3)',
        selectedScore: 92.6,
        runnerUpProvider: 'Google Veo 3 (Primary 429)',
        runnerUpScore: 93.8,
        confidence: '0.89',
        reasonZh: 'Veo 3 触发 429 限流后自动切换至 Kling v3，保持 21:9 冰层折射光影连续性',
        reasonEn: 'Auto-switched from Veo 3 on HTTP 429; maintained 21:9 subsurface lighting continuity',
        cost: '$1.20',
      },
      {
        modality: 'Cinematic SFX & Score',
        selectedProvider: 'ElevenLabs SFX + Built-in Score',
        selectedScore: 94.0,
        runnerUpProvider: 'Suno AI v4',
        runnerUpScore: 93.2,
        confidence: '0.91',
        reasonZh: '生成深海声呐脉冲与冰层断裂低频音效',
        reasonEn: 'Generated deep-ocean sonar pings and glacial fracture sub-bass stems',
        cost: '$0.13',
      },
    ],
    stageLogs: [
      {
        stageIndex: '01',
        stageNameZh: '实时网络研究',
        stageNameEn: 'Web Research (Google Search)',
        outcome: 'pass',
        timestamp: '18:13:50',
        detailZh: '检索 NASA Europa Clipper 任务冰层厚度（15–25 公里）与热液喷口科学模型。',
        detailEn: 'Retrieved NASA Europa Clipper ice-shell thickness (15–25 km) & plume telemetry.',
      },
      {
        stageIndex: '05',
        stageNameZh: '资产生成与容错切换',
        stageNameEn: 'Asset Generation & Failover',
        outcome: 'warn',
        timestamp: '18:14:22',
        detailZh: 'FALLBACK: Google Veo 3 速率受限 -> 自动无缝切换至 Kling v3 生成 6 段镜头。',
        detailEn: 'FALLBACK: Google Veo 3 rate-limited -> seamlessly switched to Kling v3 for 6 shots.',
      },
      {
        stageIndex: '07',
        stageNameZh: '合成与渲染后自检',
        stageNameEn: 'Post-Render Self-Review',
        outcome: 'pass',
        timestamp: '18:15:04',
        detailZh: '2560x1080 (21:9) 宽银幕容器验证通过；无黑帧；预算退回差额 $0.77。',
        detailEn: '2560x1080 (21:9) verified; zero black frames; $0.77 unused lock refunded.',
      },
    ],
    groundedSummary:
      'Grounded via Google Search: Incorporated NASA Europa Clipper mission parameters, estimating Europa’s icy crust at 15–25 km thick above a global saltwater ocean heated by tidal flexing.',
    citations: [
      {
        title: 'NASA Europa Clipper Mission Overview — Jet Propulsion Laboratory',
        uri: 'https://europa.nasa.gov/',
      },
    ],
  },
  {
    id: 'attempt-839',
    runCode: 'OM-RUN-839',
    pipelineId: 'animated-explainer',
    pipelineNameZh: '动画解说 (Animated Explainer)',
    pipelineNameEn: 'Animated Explainer',
    prompt: 'Make a 60-second explainer about global coffee supply chains using static bullet-point slides.',
    runtime: 'Remotion',
    status: 'failed',
    statusLabelZh: '质量门拦截 · PPT 风险超标 (GATE BLOCKED)',
    statusLabelEn: 'GATE BLOCKED · PPT SLIDE-DECK RISK',
    failedStage: 'Stage 04 / Stage 06 (Pre-Composition PPT Risk Gate)',
    failureReasonZh: '合成前验证门阻止渲染：检测到 82% 镜头为静态文字列表，6 维度 PPT 风险得分达 0.78（危险阈值 > 0.40）。在消耗任何云端 API 预算前已自动拦截（实际花费 $0.00）。',
    failureReasonEn: 'Pre-Composition Gate blocked execution: 82% of planned scenes relied on static text bullets, yielding a 6-dimension PPT Risk Score of 0.78 (critical threshold > 0.40). Halted prior to cloud asset spend ($0.00 charged).',
    createdAt: '2026-10-22 17:50',
    durationSec: '11.4s',
    budget: {
      estimated: '$0.65',
      locked: '$0.65',
      settled: '$0.00',
      mode: 'cap ($10.00)',
    },
    providerDecisions: [
      {
        modality: 'Pre-Composition Governance',
        selectedProvider: '6-Dimension PPT Risk Scorer',
        selectedScore: 100.0,
        runnerUpProvider: 'N/A (Blocked Before Asset Spend)',
        runnerUpScore: 0,
        confidence: '0.99',
        reasonZh: '拦截“带动画的 PPT”式偷懒计划，避免浪费 $0.65 图像与配音预算',
        reasonEn: 'Intercepted slide-deck plan before API invocation, saving $0.65 in cloud spend',
        cost: '$0.00',
      },
    ],
    stageLogs: [
      {
        stageIndex: '01',
        stageNameZh: '实时网络研究',
        stageNameEn: 'Web Research (Google Search)',
        outcome: 'pass',
        timestamp: '17:49:50',
        detailZh: '完成全球咖啡贸易量与北欧人均消费量（芬兰 12kg/年）检索。',
        detailEn: 'Completed global coffee trade & Nordic per-capita consumption lookup.',
      },
      {
        stageIndex: '04',
        stageNameZh: '分镜与 PPT 风险门',
        stageNameEn: 'Scene Plan & PPT Risk Gate',
        outcome: 'fail',
        timestamp: '17:50:01',
        detailZh: 'BLOCKED: PPT 风险得分 0.78（重复性 0.85，排版过度依赖 0.90，镜头运动幅度 0.12）。建议使用 Remotion 动态地图与数据图表卡片重试。',
        detailEn: 'BLOCKED: PPT Risk Score 0.78 (Repetition 0.85, Typography Over-Reliance 0.90). Recommend re-running with Remotion kinetic charts.',
      },
    ],
    groundedSummary:
      'Grounded via Google Search: Verified International Coffee Organization (ICO) statistics showing Finland leads per-capita consumption (~12 kg/year) while Brazil leads total global production (~38% share).',
    citations: [
      {
        title: 'International Coffee Organization (ICO) — Trade & Consumption Statistics',
        uri: 'https://icocoffee.org/',
      },
    ],
  },
  {
    id: 'attempt-838',
    runCode: 'OM-RUN-838',
    pipelineId: 'documentary-montage',
    pipelineNameZh: '纪录片蒙太奇 (Documentary Montage)',
    pipelineNameEn: 'Documentary Montage',
    prompt: 'Create a 60-second Adam-Curtis-style archival collage about 1950s consumer optimism. Prefer Archive.org and Wikimedia footage.',
    runtime: 'FFmpeg',
    status: 'completed',
    statusLabelZh: '已完成通过 · 零密钥原生视频 (COMPLETED)',
    statusLabelEn: 'COMPLETED · ZERO-KEY NATIVE FOOTAGE',
    createdAt: '2026-10-22 17:20',
    durationSec: '39.0s',
    budget: {
      estimated: '$0.00',
      locked: '$0.00',
      settled: '$0.00',
      mode: 'observe',
    },
    providerDecisions: [
      {
        modality: 'Archival Video Corpus',
        selectedProvider: 'Archive.org + Wikimedia Commons (CLIP)',
        selectedScore: 94.2,
        runnerUpProvider: 'Pexels Stock Video',
        runnerUpScore: 86.5,
        confidence: '0.96',
        reasonZh: 'CLIP 语义索引检索出 14 段 1950s Prelinger 历史档案动态画面，100% 满足只用真实素材承诺',
        reasonEn: 'CLIP retrieved 14 authentic 1950s Prelinger archival motion clips; 100% native footage',
        cost: '$0.00',
      },
      {
        modality: 'Timeline & Color Grade',
        selectedProvider: 'FFmpeg + archival_16mm LUT',
        selectedScore: 97.0,
        runnerUpProvider: 'Remotion',
        runnerUpScore: 89.0,
        confidence: '0.95',
        reasonZh: '纯原生档案画面拼接与 16mm 胶片调色，无需 React 图形叠加',
        reasonEn: 'Direct native footage cutting and 16mm LUT grading via FFmpeg',
        cost: '$0.00',
      },
    ],
    stageLogs: [
      {
        stageIndex: '01',
        stageNameZh: '实时网络研究',
        stageNameEn: 'Web Research (Google Search)',
        outcome: 'pass',
        timestamp: '17:19:20',
        detailZh: '定位 Prelinger Archives 1954–1958 郊区厨房、博览会与汽车广告馆藏编号。',
        detailEn: 'Located Prelinger Archives 1954–1958 suburban appliance & auto exposition reels.',
      },
      {
        stageIndex: '06',
        stageNameZh: '合成前承诺检验',
        stageNameEn: 'Pre-Composition Promise Check',
        outcome: 'pass',
        timestamp: '17:19:45',
        detailZh: '验证 promise=native_motion_footage_only：静态图片占比 0.0%，全部为真实动态镜头。',
        detailEn: 'Verified promise=native_motion_footage_only: 0.0% static images, 100% motion reels.',
      },
      {
        stageIndex: '07',
        stageNameZh: '合成与渲染后自检',
        stageNameEn: 'Post-Render Self-Review',
        outcome: 'pass',
        timestamp: '17:20:00',
        detailZh: 'ffprobe 验证通过；4 点抽帧正常；零成本交付 final.mp4。',
        detailEn: 'ffprobe verified; 4x frame samples clean; delivered final.mp4 at $0.00.',
      },
    ],
    groundedSummary:
      'Grounded via Google Search: Cross-referenced 1950s post-war American consumer boom milestones, General Motors Motorama futurism exhibitions, and public-domain Prelinger Archive film identifiers.',
    citations: [
      {
        title: 'Prelinger Archives — Ephemeral Films 1927–1987 (Internet Archive)',
        uri: 'https://archive.org/details/prelinger',
      },
    ],
  },
  {
    id: 'attempt-837',
    runCode: 'OM-RUN-837',
    pipelineId: 'hybrid',
    pipelineNameZh: '混合制作 (Hybrid Footage + AI)',
    pipelineNameEn: 'Hybrid (Source Footage + AI B-Roll)',
    prompt: 'Produce a 60-second documentary segment on the 1969 ARPANET first message transmission ("HELLO WORLD") with archival cutaways.',
    runtime: 'Remotion',
    status: 'failed',
    statusLabelZh: '事实核查与音频门拦截 (GATE BLOCKED)',
    statusLabelEn: 'GATE BLOCKED · FACT-CHECK & AUDIO CLIP',
    failedStage: 'Stage 01 (Fact-Check) & Stage 07 (Audio Level Check)',
    failureReasonZh: '双重拦截：(1) Google Search 实时事实核查发现脚本将 1969 ARPANET 首条消息误写为“HELLO WORLD”（实际发送的是“LOGIN”，且在输入字母 G 时崩溃，仅发出“LO”）；(2) 用户上传的口播源音频在 00:34 处出现 +2.4 dBFS 削峰。',
    failureReasonEn: 'Dual Gate Intercept: (1) Google Search Fact-Checker flagged script claim that ARPANET sent "HELLO WORLD" in 1969 (actual message was "LOGIN", crashing after "LO"); (2) Source audio clipped at +2.4 dBFS at 00:34.',
    createdAt: '2026-10-22 16:55',
    durationSec: '19.8s',
    budget: {
      estimated: '$0.45',
      locked: '$0.45',
      settled: '$0.00',
      mode: 'warn ($2.00)',
    },
    providerDecisions: [
      {
        modality: 'Source File Probe & Enhance',
        selectedProvider: 'ffprobe + Audio Enhance (Denoise/Limiter)',
        selectedScore: 96.0,
        runnerUpProvider: 'Raw Audio Pass-Through',
        runnerUpScore: 42.0,
        confidence: '0.98',
        reasonZh: '源文件探查发现 48kHz 双声道存在 +2.4 dBFS 削峰，强制要求启用动态限幅器',
        reasonEn: 'Source file inspection detected +2.4 dBFS peak clipping; required limiter pass',
        cost: '$0.00',
      },
    ],
    stageLogs: [
      {
        stageIndex: '01',
        stageNameZh: '实时网络事实核查',
        stageNameEn: 'Web Research & Fact-Check Gate',
        outcome: 'fail',
        timestamp: '16:55:10',
        detailZh: 'FACT-CHECK BLOCK: 1969 年 10 月 29 日 UCLA 向 SRI 发送的首条消息为“LO”（试图输入 LOGIN 时系统崩溃），而非“HELLO WORLD”。已生成修正脚本等候确认。',
        detailEn: 'FACT-CHECK BLOCK: On Oct 29, 1969, UCLA sent "LO" (system crashed typing "LOGIN") to SRI, not "HELLO WORLD". Halted for script approval.',
      },
    ],
    groundedSummary:
      'Grounded via Google Search: Verified that on October 29, 1969 at 22:30 PST, UCLA student Charley Kline under Prof. Leonard Kleinrock transmitted "L" and "O" to Bill Duvall at Stanford Research Institute before the SDS Sigma 7 host crashed.',
    citations: [
      {
        title: 'The Birth of the Internet: Oct 29, 1969 — UCLA Kleinrock Center',
        uri: 'https://www.lk.cs.ucla.edu/data/files/Kleinrock/birth_of_the_internet.pdf',
      },
    ],
  },
];

export const CURATED_PROMPTS: CuratedPrompt[] = [
  {
    id: 'ref-crispr',
    group: 'reference',
    groupLabelZh: 'Start from Reference Video',
    groupLabelEn: 'Start from Reference Video',
    promptEn: "Here's a YouTube short I love. Make me something like this, but about CRISPR for high school students.",
    promptZh: "Here's a YouTube short I love. Make me something like this, but about CRISPR for high school students.",
    pipeline: 'Animated Explainer',
    estimatedCost: '$0.00 – $0.45',
    runtime: 'Remotion',
    referenceNote: 'Retains fast 3-second visual hook, 155 WPM energetic cadence, and dynamic word-level captions while swapping subject to CRISPR-Cas9 molecular scissors.',
  },
  {
    id: 'ref-blackholes',
    group: 'reference',
    groupLabelZh: 'Start from Reference Video',
    groupLabelEn: 'Start from Reference Video',
    promptEn: 'I like the pacing and hook in this video. Keep that energy, but turn it into a 45-second explainer about black holes.',
    promptZh: 'I like the pacing and hook in this video. Keep that energy, but turn it into a 45-second explainer about black holes.',
    pipeline: 'Animated Explainer',
    estimatedCost: '$0.00 – $0.35',
    runtime: 'Remotion',
    referenceNote: 'Preserves rhythmic cut frequency (every 2.8s) and dramatic bass drop transition while grounding script in event horizon & Hawking radiation physics.',
  },
  {
    id: 'zero-sky-blue',
    group: 'zero-key',
    groupLabelZh: 'Zero API Keys Required',
    groupLabelEn: 'Zero API Keys Required',
    promptEn: 'Make a 45-second animated explainer about why the sky is blue',
    promptZh: 'Make a 45-second animated explainer about why the sky is blue',
    pipeline: 'Animated Explainer',
    estimatedCost: '$0.00 (Free)',
    runtime: 'Remotion',
  },
  {
    id: 'zero-internet-history',
    group: 'zero-key',
    groupLabelZh: 'Zero API Keys Required',
    groupLabelEn: 'Zero API Keys Required',
    promptEn: 'Create a 60-second video about the history of the internet, with narration and captions',
    promptZh: 'Create a 60-second video about the history of the internet, with narration and captions',
    pipeline: 'Animated Explainer',
    estimatedCost: '$0.00 (Free)',
    runtime: 'Remotion',
  },
  {
    id: 'zero-coffee-data',
    group: 'zero-key',
    groupLabelZh: 'Zero API Keys Required',
    groupLabelEn: 'Zero API Keys Required',
    promptEn: 'Make a data-driven explainer about coffee consumption around the world',
    promptZh: 'Make a data-driven explainer about coffee consumption around the world',
    pipeline: 'Animated Explainer',
    estimatedCost: '$0.00 (Free)',
    runtime: 'Remotion',
  },
  {
    id: 'doc-4am-city',
    group: 'documentary',
    groupLabelZh: 'Free Real-Footage Documentary',
    groupLabelEn: 'Free Real-Footage Documentary',
    promptEn: 'Make a 90-second documentary montage about what a city feels like at 4am. Use real footage only, no narration, elegiac tone.',
    promptZh: 'Make a 90-second documentary montage about what a city feels like at 4am. Use real footage only, no narration, elegiac tone.',
    pipeline: 'Documentary Montage',
    estimatedCost: '$0.00 (Real Archival Footage)',
    runtime: 'FFmpeg',
  },
  {
    id: 'doc-adam-curtis',
    group: 'documentary',
    groupLabelZh: 'Free Real-Footage Documentary',
    groupLabelEn: 'Free Real-Footage Documentary',
    promptEn: 'Create a 60-second Adam-Curtis-style archival collage about 1950s consumer optimism. Prefer Archive.org and Wikimedia footage.',
    promptZh: 'Create a 60-second Adam-Curtis-style archival collage about 1950s consumer optimism. Prefer Archive.org and Wikimedia footage.',
    pipeline: 'Documentary Montage',
    estimatedCost: '$0.00 (Archive.org + Wikimedia)',
    runtime: 'FFmpeg',
  },
  {
    id: 'doc-rain-home',
    group: 'documentary',
    groupLabelZh: 'Free Real-Footage Documentary',
    groupLabelEn: 'Free Real-Footage Documentary',
    promptEn: 'Cut together a dreamlike montage about coming home in the rain using real stock footage only. Music yes, narration no.',
    promptZh: 'Cut together a dreamlike montage about coming home in the rain using real stock footage only. Music yes, narration no.',
    pipeline: 'Documentary Montage',
    estimatedCost: '$0.00 (Real Stock Footage)',
    runtime: 'FFmpeg',
  },
  {
    id: 'prov-ghibli-library',
    group: 'provider-backed',
    groupLabelZh: 'With Image/Video Providers ($0.15–$1.50)',
    groupLabelEn: 'With Image/Video Providers ($0.15–$1.50)',
    promptEn: 'Create a 30-second Ghibli-style animated video of a magical floating library in the clouds at golden hour',
    promptZh: 'Create a 30-second Ghibli-style animated video of a magical floating library in the clouds at golden hour',
    pipeline: 'Animation',
    estimatedCost: '$0.15 (FLUX + Remotion)',
    runtime: 'Remotion',
  },
  {
    id: 'prov-aquapulse',
    group: 'provider-backed',
    groupLabelZh: 'With Image/Video Providers ($0.15–$1.50)',
    groupLabelEn: 'With Image/Video Providers ($0.15–$1.50)',
    promptEn: 'Make a product launch teaser for a fictional smart water bottle called AquaPulse',
    promptZh: 'Make a product launch teaser for a fictional smart water bottle called AquaPulse',
    pipeline: 'Animation',
    estimatedCost: '$0.45 (HyperFrames + FLUX)',
    runtime: 'HyperFrames',
  },
  {
    id: 'full-scifi-warning',
    group: 'full-setup',
    groupLabelZh: 'Full Cloud Setup ($1.00–$3.00)',
    groupLabelEn: 'Full Cloud Setup ($1.00–$3.00)',
    promptEn: 'Create a cinematic 30-second trailer for a sci-fi concept: humanity receives a warning from 1000 years in the future',
    promptZh: 'Create a cinematic 30-second trailer for a sci-fi concept: humanity receives a warning from 1000 years in the future',
    pipeline: 'Cinematic',
    estimatedCost: '$1.85 – $2.40',
    runtime: 'Remotion',
  },
  {
    id: 'full-quantum-school',
    group: 'full-setup',
    groupLabelZh: 'Full Cloud Setup ($1.00–$3.00)',
    groupLabelEn: 'Full Cloud Setup ($1.00–$3.00)',
    promptEn: 'Make a 90-second animated explainer about quantum computing for middle school students, with a fun narrator voice and custom soundtrack',
    promptZh: 'Make a 90-second animated explainer about quantum computing for middle school students, with a fun narrator voice and custom soundtrack',
    pipeline: 'Animated Explainer',
    estimatedCost: '$1.25 (ElevenLabs + Suno + FLUX)',
    runtime: 'Remotion',
  },
];

export const PROVIDERS_CATALOG: ProviderEntry[] = [
  {
    id: 'kling-v3',
    name: 'Kling v3 (via fal.ai)',
    category: 'video',
    type: 'Cloud API',
    envKey: 'FAL_KEY',
    notesZh: '高质量动态生成，速度快，支持角色动作连续性（用于《最后的香蕉》）',
    notesEn: 'High-quality motion generation, fast turnaround, strong character motion',
    scores: { taskFit: 94, quality: 95, control: 90, reliability: 92, costEfficiency: 86, latency: 88, continuity: 91 },
  },
  {
    id: 'google-veo-3',
    name: 'Google Veo 3',
    category: 'video',
    type: 'Cloud API',
    envKey: 'FAL_KEY',
    notesZh: '长篇幅电影级画质与物理光影（用于《来自明天的信号》）',
    notesEn: 'Long-form cinematic fidelity and realistic physics via fal.ai or HeyGen',
    scores: { taskFit: 96, quality: 98, control: 92, reliability: 93, costEfficiency: 78, latency: 82, continuity: 94 },
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4 / Turbo',
    category: 'video',
    type: 'Cloud API',
    envKey: 'RUNWAY_API_KEY',
    notesZh: '电影级镜头控制，支持 Gen-3 Alpha Turbo / Gen-4 Turbo / Aleph',
    notesEn: 'Cinematic camera control across Gen-3 Alpha Turbo, Gen-4 Turbo, and Aleph',
    scores: { taskFit: 93, quality: 96, control: 95, reliability: 91, costEfficiency: 80, latency: 89, continuity: 92 },
  },
  {
    id: 'wan21-local',
    name: 'WAN 2.1 (1.3B / 14B) + Hunyuan',
    category: 'video',
    type: 'Local GPU',
    envKey: 'VIDEO_GEN_LOCAL_ENABLED',
    notesZh: '本地 GPU 免费开源生成（支持 wan2.1, hunyuan-1.5, ltx2-local, cogvideo-5b）',
    notesEn: '100% free local GPU video generation (WAN 2.1, Hunyuan 1.5, LTX-2, CogVideo 5B)',
    scores: { taskFit: 88, quality: 87, control: 86, reliability: 90, costEfficiency: 100, latency: 72, continuity: 85 },
  },
  {
    id: 'open-archive-corpus',
    name: 'Archive.org + NASA + Wikimedia + Pexels',
    category: 'video',
    type: 'Stock / Open Archive',
    notesZh: 'CLIP 语义索引的真实历史档案与免费高清动态素材（零密钥可用）',
    notesEn: 'CLIP-indexed real archival and stock motion footage (zero API keys required)',
    scores: { taskFit: 92, quality: 89, control: 82, reliability: 98, costEfficiency: 100, latency: 96, continuity: 84 },
  },
  {
    id: 'flux-pro',
    name: 'FLUX (via fal.ai)',
    category: 'image',
    type: 'Cloud API',
    envKey: 'FAL_KEY',
    notesZh: '业界顶尖美学与分镜一致性（12 张分镜仅需 $0.15）',
    notesEn: 'Industry-leading visual quality and storyboard consistency ($0.15 for 12 frames)',
    scores: { taskFit: 96, quality: 97, control: 92, reliability: 96, costEfficiency: 95, latency: 94, continuity: 92 },
  },
  {
    id: 'google-imagen4',
    name: 'Google Imagen 4',
    category: 'image',
    type: 'Cloud API',
    envKey: 'GOOGLE_API_KEY',
    notesZh: '高细节还原与多长宽比构图构架控制',
    notesEn: 'Photorealistic detail and multi-aspect ratio framing',
    scores: { taskFit: 94, quality: 96, control: 90, reliability: 95, costEfficiency: 91, latency: 92, continuity: 89 },
  },
  {
    id: 'gpt-image-2',
    name: 'OpenAI GPT Image 2 / gpt-image-1',
    category: 'image',
    type: 'Cloud API',
    envKey: 'OPENAI_API_KEY',
    notesZh: '精准遵循复杂排版指令与产品渲染（用于《VOID 神经接口》）',
    notesEn: 'Precise prompt adherence and commercial product rendering',
    scores: { taskFit: 93, quality: 94, control: 94, reliability: 95, costEfficiency: 88, latency: 90, continuity: 91 },
  },
  {
    id: 'manim-local',
    name: 'ManimCE + Local Diffusion + Unsplash',
    category: 'image',
    type: 'Local Free',
    notesZh: '本地数学/科学矢量动画与免费图库，零成本解说视觉支撑',
    notesEn: 'Local mathematical/scientific animations and open stock photography at zero cost',
    scores: { taskFit: 89, quality: 88, control: 95, reliability: 97, costEfficiency: 100, latency: 91, continuity: 90 },
  },
  {
    id: 'elevenlabs-tts',
    name: 'ElevenLabs Multilingual v2',
    category: 'tts',
    type: 'Cloud API',
    envKey: 'ELEVENLABS_API_KEY',
    notesZh: '电影级情感表现力与细微呼吸重音控制',
    notesEn: 'Theatrical vocal nuance, emotional inflection, and studio clarity',
    scores: { taskFit: 97, quality: 99, control: 96, reliability: 95, costEfficiency: 82, latency: 92, continuity: 97 },
  },
  {
    id: 'google-chirp3',
    name: 'Google TTS (Chirp3-HD · 700+ Voices)',
    category: 'tts',
    type: 'Cloud API',
    envKey: 'GOOGLE_API_KEY',
    notesZh: '覆盖 50+ 种语言与 700+ 种声音，最适合多语言本地化与故事旁白',
    notesEn: '700+ voices across 50+ languages; used in THE LAST BANANA ($0.13)',
    scores: { taskFit: 95, quality: 95, control: 92, reliability: 98, costEfficiency: 94, latency: 95, continuity: 95 },
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS HD',
    category: 'tts',
    type: 'Cloud API',
    envKey: 'OPENAI_API_KEY',
    notesZh: '快速、自然且极具性价比（单次旁白约 $0.09）',
    notesEn: 'Fast, natural narration at ~$0.09 per script',
    scores: { taskFit: 91, quality: 92, control: 88, reliability: 96, costEfficiency: 95, latency: 96, continuity: 92 },
  },
  {
    id: 'piper-tts',
    name: 'Piper Neural TTS (Offline)',
    category: 'tts',
    type: 'Local Free',
    notesZh: '开箱即用的免费离线神经语音合成，无需任何 API 密钥',
    notesEn: '100% free offline neural text-to-speech included out of the box with make setup',
    scores: { taskFit: 87, quality: 84, control: 85, reliability: 99, costEfficiency: 100, latency: 98, continuity: 90 },
  },
  {
    id: 'suno-v4',
    name: 'Suno AI + ElevenLabs Music/SFX',
    category: 'music',
    type: 'Cloud API',
    envKey: 'SUNO_API_KEY',
    notesZh: '生成长达 8 分钟的定制流派配乐、环境音或完整人声歌曲',
    notesEn: 'Custom instrumental scores, ambient soundscapes, and full tracks up to 8 minutes',
    scores: { taskFit: 96, quality: 96, control: 91, reliability: 93, costEfficiency: 90, latency: 87, continuity: 92 },
  },
  {
    id: 'remotion-runtime',
    name: 'Remotion (React Video Engine)',
    category: 'runtime',
    type: 'Local Free',
    notesZh: '弹簧动画、数据图表揭示、TikTok 词级字幕、视差摄像机、粒子特效与 TalkingHead',
    notesEn: 'React programmatic video: spring physics, data charts, word-level captions, parallax & particles',
    scores: { taskFit: 98, quality: 97, control: 99, reliability: 99, costEfficiency: 100, latency: 92, continuity: 99 },
  },
  {
    id: 'hyperframes-runtime',
    name: 'HyperFrames (HTML/CSS/GSAP Engine)',
    category: 'runtime',
    type: 'Local Free',
    notesZh: '动态排版、产品发布宣传、着色器过渡、网站转视频与 SVG/GSAP 角色骨骼动画',
    notesEn: 'HTML/CSS/GSAP runtime via npx hyperframes: kinetic typography, product promos, rigged SVG characters',
    scores: { taskFit: 96, quality: 96, control: 98, reliability: 97, costEfficiency: 100, latency: 94, continuity: 97 },
  },
];

export const INITIAL_TRENDING_TOPICS: TrendTopicItem[] = [
  {
    id: 'trend-solid-state-batteries',
    beat: 'explainer',
    title: 'Solid-State EV Battery Mass Production Milestones in 2026',
    angle: 'Visualizing how sulfide solid electrolytes eliminate dendrite growth compared to conventional lithium-ion cells.',
    recommendedPipeline: 'Animated Explainer',
    estimatedCost: '$0.15 (FLUX + Remotion Data Charts)',
    suggestedPrompt: 'Make a 60-second animated explainer on how 2026 solid-state batteries work at the molecular level and why EV charging drops to 10 minutes.',
    whyNow: 'Pilot production lines and energy-density benchmarks above 450 Wh/kg are dominating engineering discussions.',
  },
  {
    id: 'trend-bell-labs-archive',
    beat: 'documentary',
    title: 'The Architecture of 1960s Information Theory & Early Mainframes',
    angle: 'An Adam-Curtis-inspired archival montage juxtaposing magnetic tape vaults, microwave relay towers, and early cybernetics optimism.',
    recommendedPipeline: 'Documentary Montage',
    estimatedCost: '$0.00 (Archive.org + NASA + Wikimedia)',
    suggestedPrompt: 'Create a 75-second documentary montage exploring 1960s mainframe laboratories and early cybernetics optimism using real archival footage from Archive.org and Wikimedia.',
    whyNow: 'Retro-computing archives and institutional monographs are trending across design and technology channels.',
  },
  {
    id: 'trend-europa-subsurface',
    beat: 'cinematic',
    title: 'Subsurface Bioluminescence & Cryobot Probes on Europa',
    angle: 'A theatrical 21:9 sci-fi/scientific teaser descending through 20 kilometers of fracturing glacial ice into a hydrothermal ocean.',
    recommendedPipeline: 'Cinematic',
    estimatedCost: '$1.45 (Google Veo 3 + ElevenLabs SFX)',
    suggestedPrompt: 'Create a 45-second cinematic 21:9 trailer following an autonomous cryobot melting through Europa ice into a deep hydrothermal ocean.',
    whyNow: 'Outer-planet ocean worlds and autonomous deep-sea robotics provide high-contrast visual drama.',
  },
  {
    id: 'trend-local-first-hardware',
    beat: 'product',
    title: 'Tactile E-Ink & Local-First AI Field Recorders',
    angle: 'High-contrast studio hardware reveal with kinetic GSAP typography and real-time acoustic waveform callouts.',
    recommendedPipeline: 'Screen Demo / Animation (HyperFrames)',
    estimatedCost: '$0.35 (GPT Image + HyperFrames GSAP)',
    suggestedPrompt: 'Make a 35-second product launch teaser for MONOLITH, a machined-aluminum e-ink field recorder with offline WhisperX transcription.',
    whyNow: 'Minimalist dedicated hardware devices with physical dials and zero-cloud privacy are surging in industrial design communities.',
  },
];

export const PLATFORM_PROFILES = [
  { nameZh: 'YouTube 宽屏 (Landscape)', nameEn: 'YouTube Landscape', res: '1920x1080', ratio: '16:9' },
  { nameZh: 'YouTube 4K 超高清', nameEn: 'YouTube 4K UHD', res: '3840x2160', ratio: '16:9' },
  { nameZh: 'YouTube 短片 (Shorts)', nameEn: 'YouTube Shorts', res: '1080x1920', ratio: '9:16' },
  { nameZh: 'Instagram Reels', nameEn: 'Instagram Reels', res: '1080x1920', ratio: '9:16' },
  { nameZh: 'Instagram 动态 (Feed)', nameEn: 'Instagram Feed Square', res: '1080x1080', ratio: '1:1' },
  { nameZh: 'TikTok 竖屏', nameEn: 'TikTok Vertical', res: '1080x1920', ratio: '9:16' },
  { nameZh: 'LinkedIn 专业宽屏', nameEn: 'LinkedIn Feed', res: '1920x1080', ratio: '16:9' },
  { nameZh: '电影级宽银幕 (Cinematic)', nameEn: 'Cinematic Anamorphic', res: '2560x1080', ratio: '21:9' },
];
