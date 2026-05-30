# Capitolo 6: Teoria dei Giochi

## Core Idea
Con agenti self-interested, decisioni razionali si analizzano con strategie, equilibri e mechanism design; cooperazione emerge solo con incentivi ripetuti o regole che allineano utilità privata e sociale.

## Frameworks Introduced
- **Strategia dominante (forte/debole)**: scelta migliore (o ≥) qualunque mossa altrui.
- **Equilibrio di Nash**: nessun giocatore migliora deviando, dati gli altri fissi.
- **Pareto optimal**: nessun miglioramento strict per tutti simultaneo.
- **Dilemma del prigioniero**: testify dominate; (refuse,refuse) Pareto ma non Nash.
- **Strategie miste + teorema di Nash**: equilibrio esiste in giochi finiti (es. morra).
- **Prisoner’s dilemma ripetuto**: cooperazione razionale se orizzonte infinito; backward induction se n finito noto.
- **Axelrod tournament**: TIT-FOR-TAT vince in media — simpatia, vendetta proporzionata, no rancore.
- **Mechanism design**: regole che garantiscono proprietà (successo, welfare, IR, stabilità).
- **Aste**: inglese, olandese, busta chiusa, Vickrey (second price → bid verità dominante).
- **Agent-Based Modelling (ABM)**: complex adaptive systems, simulazione vs deduzione.

## Key Concepts
- **Strategy profile**: scelta simultanea per tutti i giocatori.
- **Giochi a somma zero**: utilità opposte; spesso nessun equilibrio in strategie pure.
- **Tragedy of the commons**: utilità individuale distrugge risorsa condivisa.
- **Individual rationality**: incentivo a partecipare al meccanismo.
- **ALLD / TIT-FOR-TAT / TESTER / JOSS**: strategie torneo Axelrod.

## Mental Models
- Use **Nash** per prevedere esiti con egoisti one-shot; **Pareto** per valutare miglioramento sociale possibile.
- Prefer **mechanism design** quando progetti piattaforme MAS, non solo singolo agente.
- Think of **ripetizione** come prerequisito per cooperazione stabile tra self-interested.

## Anti-patterns
- **Assumere cooperazione senza incentivi** in MAS competitivi.
- **Confondere Pareto optimal con equilibrio** — profili Pareto-efficienti possono essere instabili.
- **TIT-FOR-TAT sempre ottimo** — dipende da distribuzione avversari (perde vs ALLD).

## Code Examples
```text
Payoff intuition (Prisoner's Dilemma):
  (refuse, refuse)  → (1,1)   Pareto, not Nash
  (testify, testify)→ (5,5)   Nash, not Pareto
```

## Reference Tables
| Asta | Strategia dominante partecipante |
|------|----------------------------------|
| Inglese | bid finché costo < valore privato |
| Vickrey 2nd price | bid = valore privato vero |

## Key Takeaways
1. Razionalità = massimizzare utilità attesa, non bene comune automatico.
2. Equilibrio Nash ⊇ equilibri a strategie dominanti; mora richiede miste.
3. Cooperazione ripetuta: futuro incerto favorisce TFT; orizzonte noto → defection finale.
4. Mechanism design allinea comportamento locale a proprietà globali desiderate.
5. ABM esplora emergenza da micro-regole senza teoremi generali come deduzione.

## Connects To
- **Ch 1**: domande MAS su cooperazione self-interested.
- **Ch 4**: Contract Net e negoziazione.
- **cheatsheet**: Nash vs Pareto vs dominanza.
