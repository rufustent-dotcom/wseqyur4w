# OpenMontage — Search-Grounded Pipeline History, Audit Logs & Current Events Agent

This plan updates the **Pipeline Production Attempts History View** and **Research Studio** so that pipeline runs, status logs, and interactive agent queries are directly powered by **real-time Google Search data (`gemini-3.8-flash` with `googleSearch`)**. Users can inspect past successful or failed production attempts, view the provider decision audit trail and cost breakdown, trigger **live Google Search–grounded pipeline runs** that cite breaking news and current events in Stage 01, and converse with a dedicated **Current Events & Fact-Checking Agent**.

### User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been updated to integrate **real-time Google Search grounding (`gemini-3.8-flash` + `googleSearch`)** into both the Pipeline Production Attempts History View and an interactive Current Events & Fact-Checking Agent. Review the plan below and click **Proceed** to build.

- **Confirmed Status Log & Audit Details**:
  1. **Provider Decision Audit Trail**: Full 7-dimension scoring comparison (Selected Provider vs. Runner-Up, confidence score, and automatic fallback reasoning).
  2. **Itemized Cost & Budget Ledger**: Pre-run **Estimated**, **Locked**, and **Settled** USD costs per stage (`tabular-nums`).
  3. **Live Google Search Stage 01 Citations**: Every pipeline production attempt records the verified web news and current-event sources (`groundingMetadata.groundingChunks`) used to ground its script and fact-check its claims.
- **Confirmed Revisit & Interactive Actions**:
  1. **Run Live Search-Grounded Pipeline Attempt (with Custom Failure Injection)**: Users can trigger a new pipeline attempt that calls `gemini-3.8-flash` with `googleSearch` in real time to fetch current events and recent news on the topic, while optionally testing governance scenarios (*Nominal Full Pass*, *Provider Timeout -> Auto-Fallback*, *6-Dim PPT Slide-Deck Risk Gate Blocked*, *Fact-Check Hallucination Blocked*, or *Post-Render `ffprobe` Gate Failure*).
  2. **Reload Prompt & Pipeline into the Research & Current Events Agent**: One-click button on any historical attempt to open its prompt, pipeline context, and cited news sources inside the Search-Grounded Studio for deeper current-events discussion or script fact-checking.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Pipeline Production Attempts History View (`#pipelines`)**: Displays a filterable log of recent pipeline production attempts (`Completed`, `Fallback Recovered`, `Gate Blocked / Failed`) with detailed **Provider Decision Audit Trails**, **USD Cost Breakdowns**, **Stage-by-Stage Execution Logs**, and **Cited Google Search News Sources**.
  2. **Live Search-Grounded Pipeline Simulator**: Connects the Pipeline Run Simulator to `/api/research` (`gemini-3.8-flash` + `googleSearch`) so simulated pipeline executions pull real-time news, verify facts against live web results, and log authentic web citations in the attempt history.
  3. **Current Events, News Citation & Fact-Checking Agent (`#research-studio`)**: Expands the Research Studio with a multi-turn **Current Events & News Fact-Checking Agent** tab where users can ask about breaking news, verify current events for documentary or explainer scripts, and cite live web sources.
- **Target Audience / Persona**: Creators, video journalists, documentary filmmakers, and developers using OpenMontage who need both transparent pipeline governance (audit logs, cost control, fallback recovery) and real-time factual grounding from Google Search.
- **Key Value**: Links real-time Google Search news verification directly to video pipeline execution—showing not only *which* providers and costs were logged, but *which live web sources* grounded or blocked the production attempt.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Inspecting Pipeline Attempts, Provider Audits & Cited News**:
     - In Section 04 (`#pipelines`), users switch between **Pipeline Blueprints (11)** and **Production Attempts History (`流水线执行历史与状态审计`)**.
     - Selecting any attempt reveals its **Audit & Status Sheet**:
       - **Provider Decision Audit Table**: Shows Video, Image, TTS, and Music provider winners, runner-ups, 7-dimension scores, and fallback triggers.
       - **Cost & Budget Ledger**: Shows `Estimated`, `Locked`, and `Settled` USD amounts.
       - **Stage 01 Google Search Grounding & Fact-Check Log**: Displays the live current-events summary and clickable news citations (`groundingChunks`) gathered during that pipeline run, or shows why the **Fact-Check / PPT Risk / `ffprobe` Gate** halted the run.
  2. **Running a Live Search-Grounded Pipeline Attempt (with Failure Injection)**:
     - Inside the History View, users enter a current-events topic (or use the active pipeline's prompt), choose a Governance / Failure-Injection mode (*Nominal Live Search Pass*, *Inject Provider Fallback*, *Inject Unverified Fact-Check Block*, *Inject PPT Slide-Deck Risk Block*, or *Inject `ffprobe` Audio/Frame Failure*), and click **Run Search-Grounded Attempt**.
     - The app queries `gemini-3.8-flash` with `googleSearch` to fetch real-time news & facts on the topic, combines them with the selected pipeline's provider audit and failure-injection logic, and logs the new attempt with clickable web citations.
  3. **Discussing Current Events & Fact-Checking in the Studio**:
     - Clicking **Reload into Research Studio** on any pipeline attempt transfers the topic and pipeline into Section 02, where users can generate full proposals, run line-by-line fact-checks, or chat with the **Current Events & News Agent** backed by Google Search.

- **Visual Identity & Theme**:
  - Maintains the **Archival Warm Paper (`#FBF9F5`)** and **Limestone (`#F3EFE6`)** editorial aesthetic with 1px `#E5E0D5` borders, `Fraunces` editorial headings, `Plus Jakarta Sans` prose, and `JetBrains Mono` (`tabular-nums`) for all provider scores, timestamps, and USD cost tables.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-Time `gemini-3.8-flash` + `googleSearch` Integration in Pipeline Runs**
  - *Chosen Approach*: Extend the server-side `/api/research` route with a `pipeline-run` and `news-agent` mode using `gemini-3.8-flash` and `config: { tools: [{ googleSearch: {} }] }`.
  - *Why*: Ensures that when a user triggers a new pipeline attempt or inspects current events, the Stage 01 Web Research log and Fact-Check Gate are populated with real, up-to-the-minute web search results and clickable URLs rather than static text.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                 OpenMontage Editorial Application (Client)                   │
│                                                                              │
│  ┌────────────────────────────────────┐ ┌─────────────────────────────────┐  │
│  │ Pipeline Explorer (#pipelines)     │ │ Research Studio (#research)     │  │
│  │ • Blueprints vs. Attempts History  │ │ • Topic & Reference Planner     │  │
│  │ • Provider Decision Audit Table    │ │ • Script Fact-Checker           │  │
│  │ • Budget & Cost Breakdown Ledger   │ │ • Current Events & News Agent   │  │
│  │ • Failure-Injection Simulator      │ │ • Recent Searches Sidebar/Drawer│  │
│  │ • [Reload into Research Studio] ───┼─► Pre-fills Prompt & Citations    │  │
│  └─────────────────┬──────────────────┘ └────────────────┬────────────────┘  │
└────────────────────┼─────────────────────────────────────┼───────────────────┘
                     │ POST /api/research                  │ POST /api/research
                     ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  Next.js Server Route (/api/research)                        │
│                                                                              │
│  • Modes: "proposal" | "fact-check" | "trends" | "pipeline-run" | "agent"    │
│  • Model: "gemini-3.8-flash" with tools: [{ googleSearch: {} }]              │
│  • Extracts grounded markdown + groundingMetadata.groundingChunks (URLs)     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **ProductionAttempt**:
    - `id`, `runCode`, `pipelineId`, `pipelineNameZh`, `pipelineNameEn`, `prompt`, `runtime`, `status` (`completed` | `fallback` | `failed`), `injectionScenario`, `createdAt`, `durationSec`.
    - `budget`: `{ estimated: string, locked: string, settled: string, mode: 'observe' | 'warn' | 'cap' }`.
    - `providerDecisions[]`: `{ modality: string, selectedProvider: string, selectedScore: number, runnerUpProvider: string, runnerUpScore: number, confidence: string, reasonZh: string, reasonEn: string, cost: string }`.
    - `stageLogs[]`: `{ stageIndex: string, stageName: string, outcome: 'pass' | 'warn' | 'fail', messageZh: string, messageEn: string, timestamp: string }`.
    - `groundedSummary`: Live current-events research brief & fact-check note from `gemini-3.8-flash`.
    - `citations[]`: `{ title: string, uri: string }[]` extracted from `groundingMetadata.groundingChunks`.
