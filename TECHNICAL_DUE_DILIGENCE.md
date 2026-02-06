# Aether: Technical Due Diligence Dossier

**Version:** 1.0.0 (MVP)  
**Status:** Pre-Seed / Seed Ready  
**Audience:** Technical Auditors, VCs, CTOs

---

## 1. Core Technical Thesis

**The Problem:** Existing site builders are either "dumb canvas" tools (Wix, Webflow) requiring manual labor, or "black box" AI generators (Gamma, Dorik) that produce uneditable, rigid code.

**Our Thesis:** The future of web creation is **AI-Augmented Determinism**.
We do not treat AI as a "generator" but as a "logic engine" that manipulates a strict, type-safe data structure.

**Key Architectural Decisions:**
1.  **Decoupled Intelligence:** The AI never touches the DOM directly. It outputs strictly validated JSON patches against a Zod schema. This prevents "hallucinations" from breaking the site layout.
2.  **Dual-Engine Rendering:**
    *   **Builder:** A heavy Client-Side Rendered (CSR) React application optimized for 60fps interaction and state management (Zustand).
    *   **Public Site:** A lightweight Incremental Static Regeneration (ISR) Next.js application served from the Edge.
3.  **Token-Based State:** Every AI action is a transaction. This allows us to map infrastructure costs directly to user actions, preserving unit economics.

**Why this is hard:**
Synchronizing a volatile AI output with a deterministic, drag-and-drop undo/redo history stack requires a complex "reconciliation layer" that most wrappers lack.

---

## 2. Defensibility & Moat

We are building a **System Complexity Moat**, not just a prompt engineering moat.

| Layer | Defensibility Factor |
| :--- | :--- |
| **Prompt Governance** | We don't just send prompts. We inject dynamic context (neighboring sections, brand tone, viewport constraints) and enforce output schemas. A copycat simply prompting "make a website" cannot replicate our contextual awareness. |
| **The "Heuristic Bridge"** | Our proprietary logic that translates abstract AI concepts (e.g., "Make it pop") into concrete Tailwind classes and DOM structures. |
| **State Management** | Our `BuilderContext` handles cross-language synchronization, undo/redo stacks, and optimistic UI updates. This "App-like" feel takes months of engineering to replicate. |
| **Data Gravity** | As users fix AI mistakes, we capture the "Correction Diff." This dataset (Prompt -> Output -> User Correction) becomes the training set for fine-tuning future models. |

---

## 3. Scalability & Limits

### Horizontal Scaling Strategy
*   **Public Traffic:** **Infinite Scale.** Public sites are rendered to static HTML/CSS and cached on the Vercel Edge Network (CDN). A viral user site does *not* hit our primary database or application servers.
*   **Builder Traffic:** Scales linearly with active concurrent editors. Hosted on Serverless Functions (Vercel), auto-scaling to meet demand.

### Known Bottlenecks
1.  **Database Connections:** PostgreSQL (Supabase) connection limits.
    *   *Mitigation:* We use Supabase Transaction Pooler (PgBouncer) for ephemeral serverless connections.
2.  **AI Rate Limits:** Gemini API quotas.
    *   *Mitigation:* We implement a "Token Bucket" rate limiter per user and maintain fallback API keys (or fallback models) for high-load scenarios.
3.  **DOM Complexity:** React performance degrades around 3,000+ DOM nodes in the builder.
    *   *Mitigation:* Virtualized rendering for pages with >10 sections.

---

## 4. Cost Structure & Unit Economics

**Assumption:** 1 Token = $0.0001 (Blended AI/Infra cost)

### Free Tier (Loss Leader)
*   **AI Access:** None / Very Limited.
*   **Storage/Bandwidth:** ~$0.02/month per user.
*   **Strategy:** Strict cap on assets and bandwidth.

### Pro Tier ($20/month)
*   **Avg. AI Usage:** ~50 generations/month.
*   **AI Cost:** ~$2.00 (Gemini Pro + Flash mix).
*   **Infra Cost:** ~$0.50.
*   **Gross Margin:** **~87%**
*   **Worst Case (Power User):** If a user maxes out tokens (e.g., 500 gens), cost rises to ~$15.00.
    *   *Protection:* Hard token caps prevent negative margins.

---

## 5. Risk Analysis

| Risk Category | Risk Level | Mitigation Strategy |
| :--- | :--- | :--- |
| **AI Reliability** | High | "Hallucination" of HTML tags or invalid JSON. <br> **Fix:** Strict Zod schema validation. Failed validation triggers an automatic invisible retry (max 1) or degrades to a safe fallback layout. |
| **Vendor Lock-in** | Medium | Dependency on Google Gemini. <br> **Fix:** The AI Service Layer is interface-based (`generateSectionContent`). We can hot-swap to OpenAI (GPT-4o) or Anthropic (Claude 3.5) in <24 hours by updating the adapter. |
| **SEO Spam Abuse** | High | Users generating thousands of spam pages. <br> **Fix:** Rate limits on "Publish" actions. Automated analysis of content before indexing. |
| **Platform Cost** | Low | Vercel pricing changes. <br> **Fix:** Architecture is standard Next.js/Docker-compatible. Can be ejected to AWS (ECS/Fargate) or Render if necessary. |

---

## 6. Comparison to Incumbents

| Feature | **Aether (Us)** | **Wix / Squarespace** | **Webflow** | **Framer** |
| :--- | :--- | :--- | :--- | :--- |
| **Core Philosophy** | AI-First, Structured | Drag-and-Drop, Unstructured | Visual Coding | Canvas / Design |
| **Code Quality** | Semantic HTML + Tailwind | Bloated, Absolute Positioning | High Quality, Complex | Heavy JS Runtime |
| **Responsiveness** | Automatic (Flex/Grid) | Manual Adjustment Required | Manual Breakpoints | Manual Breakpoints |
| **Multi-Language** | Native Data Structure | Plugin / Add-on | CMS-based (Complex) | Manual Variants |
| **Learning Curve** | Low (Chat/Roll) | Low | High (Developer mental model) | Medium |

---

## 7. Execution Roadmap (90 Days)

*   **Month 1 (MVP):** Core Builder, Gemini Flash Integration, Google Auth, Netlify/Vercel Publishing.
*   **Month 2 (Stability):** Multi-language deep integration, Image generation (Imagen 3), Undo/Redo robustness.
*   **Month 3 (Growth):** Stripe Integration, Custom Domains, SEO Meta-tag AI generation.

---

## 8. Due Diligence Q&A Simulation

**Q: Why do you need a custom builder? Why not just generate React code and let developers edit it?**
**A:** We target *non-developers*. Generating raw code (JSX) creates a "eject" problem where the user can no longer use AI once they touch the code. Our internal JSON schema allows AI and Humans to edit the *same* data structure continuously without breaking each other's work.

**Q: What happens if Google kills the Gemini API?**
**A:** We use the Vercel AI SDK which abstracts the provider. We would switch to OpenAI GPT-4o or Claude 3.5 Sonnet. The prompt engineering would need ~1 week of tuning, but the infrastructure remains unchanged.

**Q: How do you prevent users from generating offensive content?**
**A:** We utilize the safety settings inherent in Gemini (SafetySettings). Additionally, our Terms of Service allows us to ban users and purge sites that violate content policies.

**Q: Why Next.js? Isn't it overkill?**
**A:** Next.js gives us ISR (Incremental Static Regeneration). This is the "Holy Grail" for site builders: easy editing (dynamic) but fast serving (static). It solves the "Wix is slow" problem architecturally.

**Q: Where is the "technical debt" right now?**
**A:** The `BuilderContext` is currently a large state object. As features grow, we will need to slice this using Zustand slices or XState for better performance monitoring. Currently, it is sufficient for MVP scope.
