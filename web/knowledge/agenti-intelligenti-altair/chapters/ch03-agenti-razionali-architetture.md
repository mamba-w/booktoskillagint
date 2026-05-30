# Capitolo 3: Agenti Razionali e Architetture

## Core Idea
Il practical reasoning (deliberazione + means-ends) produce intenzioni che vincolano il futuro ragionamento; architetture BDI, PRS, reattive (Brooks) e ibride implementano trade-off tra reattività, pianificazione e costo computazionale.

## Frameworks Introduced
- **BDI (Belief–Desire–Intention)**: stati mentali per spiegare/predire comportamento.
  - When to use: agenti goal-directed con commitment espliciti.
  - How: BEL, GOAL, INTEND + temporal branching (Rao–Georgeff).
- **Sette proprietà intenzioni** (Bratman-style): persistenza, filtro conflitti, monitoraggio, credenza possibilità, no belief in fallimento, belief successo in contesto, package deal su side effects.
- **Commitment strategies**: blindly / single-minded / open-minded — quando abbandonare intenzioni.
- **Architetture BDI evolute** (fig. 3.1–3.8): da deliberation+planning lenti a option/filter, replan, reconsider, meta-level reconsider().
- **PRS**: event queue, belief Prolog-like, libreria piani, intention structure, stack.
- **Subsumption Architecture (Brooks)**: gerarchia behaviours (c, a) con inibizione b1 < b2.
- **Architetture ibride**: layer deliberativo + reattivo; horizontal vs vertical layering.

## Key Concepts
- **Sistema intenzionale**: comportamento prevedibile via credenze, desideri, acume razionale.
- **Practical vs theoretical reasoning**: azioni vs credenze.
- **Intention-belief inconsistency**: intendere φ credendo ¬possible(φ) — irrazionale.
- **Calculative rationality**: intenzione scelta a t1 può non essere ottimale a t2 se deliberazione lenta.
- **AgentSpeak(L)**: piani Horn-like; bridge teorico → Jason.
- **Bold vs cautious agents** (Kinny–Georgeff): ambienti statici vs dinamici.

## Mental Models
- Use **option generation + filtering** come pipeline deliberazione → intenzioni.
- Prefer **single-minded** quando serve abbandonare intenzioni impossibili senza riconsiderare ogni azione.
- Think of **subsumption** quando serve intelligenza senza rappresentazione simbolica esplicita.

## Anti-patterns
- **Deliberare indefinitamente** — calcolo finito, serve commitment.
- **Overcommitment (blind)** — non rivalutare intenzioni obsolete.
- **Riconsiderazione continua (open-minded estremo)** — poco tempo per agire.
- **Solo reattivo in task lunghi** — visione locale, difficile ingegnerizzare molti behaviours.

## Code Examples
```text
Blindly committed:    INTEND(AF φ) ⇒ A(INTEND(AF φ) ∪ BEL(φ))
Single-minded:        INTEND(AF φ) ⇒ A(... ∪ (BEL(φ) ∨ ¬BEL(EF φ)))
Open-minded:          INTEND(AF φ) ⇒ A(... ∪ (BEL(φ) ∨ ¬GOAL(EF φ)))
Piano AgentSpeak(L):  e : b1 & ... & bm ← h1, ..., hn
```

## Reference Tables
| Architettura | Pianificazione | Rappresentazione | Punto di forza |
|--------------|----------------|------------------|----------------|
| Deliberativa simbolica | Sì, lenta | Modello mondo | Goal complessi |
| PRS | Piani libreria | Prolog facts | BDI pratico early |
| Subsumption | No | Behaviours | Robotica reattiva |
| Ibrida | Entrambi | Layered | Bilanciamento |

## Key Takeaways
1. Intenzioni favoriscono proattività e limitano nuove intenzioni confliggenti.
2. Cohen–Levesque: BEL, GOAL, HAPPENS, DONE; intenzione derivata.
3. Sette versioni architettura mostrano evoluzione verso meta-control reconsider.
4. Brooks: intelligenza emergente, situata, senza ragionamento simbolico esplicito.
5. AgentSpeak(L) e PRS colmano gap teoria–implementazione (→ Jason).

## Connects To
- **Ch 4**: comunicazione e commitment sociali.
- **Ch 5**: JASON implementa AgentSpeak(L).
- **patterns**: PRS control loop, BDI commitment types.
