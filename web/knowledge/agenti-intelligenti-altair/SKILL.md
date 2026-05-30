---
name: agenti-intelligenti-altair
description: "Knowledge base from \"Agenti Intelligenti — Teoria (Altair's Notes)\" course notes. Use when applying frameworks for multi-agent systems, BDI agents, modal/epistemic logic, FIPA/KQML communication, JADE/JASON, game theory, mechanism design, or referencing this informatics course material."
---

# Agenti Intelligenti — Teoria (Altair's Notes)
**Author**: Altair (appunti corso) | **Pages**: ~84 | **Chapters**: 6 | **Generated**: 2026-05-30

## How to Use This Skill

- **Without arguments** — load core frameworks below
- **With a topic** — e.g. `BDI`, `Contract Net`, `Nash`, `JASON`; read relevant chapter first
- **With chapter** — e.g. `ch03` or `ch05` for full chapter file
- **Browse** — ask "quali capitoli hai?" for the index

When a topic is not in Core Frameworks, read the matching chapter file before answering.

---

## Core Frameworks & Mental Models

### 1. Perché agenti e MAS
Use the **five computing trends** (ubiquity, interconnection, intelligence, delegation, human-orientation) when justifying agent-based design over centralized or pure OO solutions. A **MAS** coordinates **self-interested or cooperative** agents via communication; distinguish **single-agent design** (autonomy, reactivity, proactivity) from **society design** (cooperation, negotiation, conflict).

### 2. Agente intelligente = reattivo + proattivo + sociale
- **Reactive**: timely response to environment changes (if-then feel, but insufficient alone).
- **Proactive**: goal-directed behavior with plans and initiative.
- **Social**: ACL-based interaction and cooperation.
Prefer **balance** over maximizing one axis; Wooldridge: situated system with own agenda that influences future perceptions.

### 3. Paradigma agent-oriented (Meyer)
Map **Agent** → process force, **Environment** → action/object forces. Use when objects are too passive and functional decomposition cannot express multiple goals or distributed interaction.

### 4. Logica modale per stati mentali
Use **Kripke models** ⟨W,R,L⟩ for belief/knowledge: □φ true in world w iff φ in all accessible worlds. Classical logic fails on **referential opacity** (belief takes formulas, not terms). For agents:
- **Epistemic**: K_a, B_a with axioms T (knowledge truth), D (consistency), 4/5 (introspection).
- **Temporal**: LTL (X, U, F, G) and CTL* for **model checking** concurrent/multi-agent behavior.
- **Dynamic/situation calculus**: actions, fluents, **frame problem**.

### 5. BDI e practical reasoning
**Practical reasoning** = deliberation (what state to achieve) + means-ends planning (how). **Intentions** enable proactivity, persist, filter conflicting intentions, and bound future reasoning. Seven intention properties include **intention-belief inconsistency** (irrational) vs **incompleteness** (acceptable). **Commitment strategies**: blindly committed, single-minded, open-minded — choose drop conditions for intentions.

### 6. Architetture (evoluzione controllo)
Progression: slow deliberation/plan → **option/filter** → replan on failure → reconsider on success/impossibility → meta-level **reconsider()** heuristic. **PRS**: events, Prolog beliefs, plan library, intention stack. **Brooks subsumption**: layered behaviours with inhibition — no explicit symbolic world model. **Hybrid**: reactive layer priority + deliberative symbolic planner (horizontal/vertical layering).

### 7. Comunicazione e protocolli
**Speech acts**: locution, illocution (performative), perlocution. **KQML** and **FIPA ACL** are transport- and content-independent; FIPA uses **SL** semantics (Feasible, Done, Agent, persistent goals). **Social semantics**: **commitments** (debtor/creditor) for verifiable public interaction vs opaque mental states. **Contract Net**: manager announces task, contractors bid, award, report. **BSPL**: declarative protocols with in/out parameters and keys for enactment integrity.

### 8. JADE e JASON (implementazione)
- **JADE**: Java FIPA platform — `Agent`, **AID**, cooperative **Behaviours**, ACL `send`/`receive`, **block()** vs **blockingReceive()**, built-in **Contract-Net** and other interaction protocols.
- **JASON**: **AgentSpeak(L)** — beliefs, plans `event : context ← body`, triggering events `+/-`, intention stacks, operational cycle (Sε, S_O, S_I), failure handling `-!g`, annotated beliefs, distributed MAS.

### 9. Teoria dei giochi e mechanism design
For **self-interested agents**: analyze **dominant strategies**, **Nash equilibrium**, **Pareto optimality**. **Prisoner's dilemma**: defect is Nash, mutual cooperate is Pareto — cooperation needs **repeated interaction** (TIT-FOR-TAT rules: nice, retaliatory, forgiving) or designed **mechanisms**. **Mechanism design** specifies strategy language + outcome rule for properties (IR, Nash stability, welfare). **Vickrey auction**: truthful bidding is dominant.

### 10. Agent-Based Modelling
Use **complex adaptive systems** lens: interacting units → **emergent** global properties not visible at unit level; simulation complements deduction/induction for social/economic MAS studies.

---

## Chapter Index

| # | Title | Key Frameworks |
|---|-------|----------------|
| [ch01](chapters/ch01-introduzione.md) | Introduzione | 5 trends, agente/MAS, reattivo/proattivo/sociale, Meyer, architetture simboliche/reattive/ibride |
| [ch02](chapters/ch02-logica-per-agenti.md) | Logica per Agenti | Kripke, assioma K, epistemica, LTL/CTL*, model checking, frame problem |
| [ch03](chapters/ch03-agenti-razionali-architetture.md) | Agenti Razionali e Architetture | BDI, intenzioni, commitment, PRS, Brooks, ibride, AgentSpeak(L) |
| [ch04](chapters/ch04-sistemi-multiagente.md) | Sistemi Multiagente | speech acts, KQML, FIPA ACL, commitment sociale, Contract Net, BSPL |
| [ch05](chapters/ch05-jade-jason.md) | JADE e JASON | FIPA platform, behaviours, ACL, AgentSpeak cycle, Jason extensions |
| [ch06](chapters/ch06-teoria-dei-giochi.md) | Teoria dei Giochi | Nash, Pareto, PD ripetuto, Axelrod, mechanism design, aste, ABM |

## Topic Index

- **Agente / autonomia** → ch01
- **MAS / cooperazione** → ch01, ch04, ch06
- **BDI / intenzioni** → ch03, ch05
- **Logica modale / epistemica** → ch02
- **Model checking** → ch02
- **KQML / FIPA / ACL** → ch04, ch05
- **Contract Net** → ch04, ch05
- **BSPL / commitment** → ch04
- **PRS / Subsumption / architetture ibride** → ch03
- **JADE** → ch05
- **JASON / AgentSpeak(L)** → ch03, ch05
- **Nash / dilemma prigioniero / TFT** → ch06
- **Mechanism design / aste Vickrey** → ch06
- **Agent-Based Modelling** → ch06

## Supporting Files

- [glossary.md](glossary.md) — termini chiave con riferimento capitolo
- [patterns.md](patterns.md) — tecniche e architetture operative
- [cheatsheet.md](cheatsheet.md) — tabelle decisionali rapide

---

## Scope & Limits

Skill basata su appunti didattici (CC BY 4.0). Non sostituisce testi originali (Wooldridge, Russell & Norvig, ecc.). Per implementazione progetto-specifica, combinare con codice e API JADE/JASON ufficiali. Estrazione PDF in modalità testo (pdftotext); formule e diagrammi possono essere approssimati.
