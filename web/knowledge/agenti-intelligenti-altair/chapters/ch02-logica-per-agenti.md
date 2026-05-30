# Capitolo 2: Logica per Agenti

## Core Idea
La logica modale su mondi possibili (Kripke) modella stati mentali, tempo e azioni degli agenti; la logica classica da sola non cattura operatori intenzionali come credenza e conoscenza.

## Frameworks Introduced
- **Kripke model** ⟨W, R, L⟩: mondi, accessibilità, proposizioni vere per mondo.
  - When to use: semantica di □ (necessario/creduto) e ◇ (possibile).
  - How: □φ vera in w se φ vera in tutti i mondi accessibili da w.
- **Assioma K**: □(φ⇒ψ) ↔ (□φ⇒□ψ) + Necessitation — logiche modali normali.
- **Frame properties T/D/4/5**: riflessività, serialità, transitività, euclideità → sistemi KT, S4, KD45, S5.
- **Operatori agenti**: K_a (sa), B_a (crede), D_a (desidera), I_a (intende), O/P (deontico), X/G/F/U (temporale), [π]φ (dinamica).
- **LTL / CTL***: ragionare su sistemi concorrenti e model checking.
- **Situazioni–fluenti–azioni**: azioni con assiomi possibilità/effetto + frame problem.

## Key Concepts
- **Referential opacity**: Bel(John, flies(Superman)) fallisce in logica classica (formula come argomento).
- **Omniscenza logica**: K-agente conosce tutte le tautologie e chiusura logica — problema ignorato nel corso.
- **Assioma T**: Kφ⇒φ (vero per conoscenza, non per credenza).
- **Assioma D**: coerenza conoscenza/credenza.
- **Assiomi 4 e 5**: introspezione positiva/negativa.
- **Muddy Children**: esempio epistemico con K-operatori.
- **Model checking**: verifica proprietà temporali su automi a stati finiti.

## Mental Models
- Use **□ come B (belief)** quando modelli credenze, non solo necessità metafisica.
- Prefer **frame scelto** (T, 4, 5…) in base a proprietà desiderate dell’agente (veridicità, introspezione).
- Think of **LTL until (U)** per proprietà “φ fino a ψ” in protocolli e sistemi concorrenti.

## Anti-patterns
- **Usare solo logica proposizionale** per stati mentali — sintassi e semantica inadeguate.
- **Assumere □ distribuisce su OR** — □(φ∨ψ) ≠ □φ∨□ψ.
- **Ignorare costo model checking** — CTL* restritta a CTL per complessità.

## Code Examples
```text
Modus Ponens:  α⇒β, α ⊢ β
K axiom:       □(φ⇒ψ) ↔ (□φ⇒□ψ)
LTL derived:   Fα ≡ true U α ;  Gα ≡ ¬F¬α
```

## Reference Tables
| Sistema | Proprietà frame | Uso tipico |
|---------|-----------------|------------|
| KT | T (reflexive) | Base con veridicità |
| S4 | T + 4 (transitive) | Conoscenza positiva ripetuta |
| KD45 | D + 4 + 5 | Credenza debole |
| S5 | T + D + 4 + 5 | Equivalenza epistemica |

## Key Takeaways
1. Logica modale = mondi possibili + accessibilità, non solo tavole di verità.
2. Operatori modali reinterpretati per epistemica, BDI, tempo, azioni.
3. Conoscenza vs credenza: T per K, non per B.
4. LTL lineare per futuro infinito; CTL* unisce path e state formulas.
5. Frame problem: descrivere cosa non cambia dopo un’azione.

## Connects To
- **Ch 3**: Rao–Georgeff BDI su branching time.
- **Ch 4**: semantica FIPA SL multimodale.
- **glossary**: Kripke, LTL, epistemic logic.
