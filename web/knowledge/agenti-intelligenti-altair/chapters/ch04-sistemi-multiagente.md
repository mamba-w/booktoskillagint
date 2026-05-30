# Capitolo 4: Sistemi Multiagente

## Core Idea
I MAS richiedono ACL (atti comunicativi), semantica degli scambi e protocolli di interazione verificabili; la semantica sociale basata su commitment supera i limiti degli stati mentali opachi in contesti eterogenei e competitivi.

## Frameworks Introduced
- **Speech act theory (Austin/Searle)**: locuzione, illocuzione, perlocuzione — performative.
  - When to use: progettare messaggi con forza illocutoria esplicita.
  - How: felicity conditions (procedura convenzionale, esecuzione corretta, sincerità).
- **KQML / KIF / Ontolingua** (KSE): performative + content indipendente da trasporto.
- **FIPA ACL + SL**: semantica multimodale con Feasible, Done, Agent, persistent goals, FP/RE.
- **Semantica sociale (commitment)**: debtor/creditor, contesto team, metacommitment (Singh/Castelfranchi).
- **Contract Net Protocol**: manager/contractor, announce–bid–award–result.
- **BSPL**: protocolli dichiarativi con parametri in/out/nil, chiavi, causalità esplicita.
- **Coordinazione**: blackboard, norme sociali.

## Key Concepts
- **DAI**: modularità + distribuzione + astrazione + intelligenza.
- **Cooperazione vs negoziazione**: coordinazione non antagonista vs self-interested.
- **KQML performatives**: tell, achieve, ask-one, ask-all, reply, sorry, advertise.
- **Conformità FIPA**: FP(communicative act) sul mittente; RE non garantiti.
- **Commitment protocol run**: sequenza finita che discharge tutti i commitment.
- **Information protocols**: autonomia, miopia locale, eterogeneità stato pubblico/privato.

## Mental Models
- Use **ACL dichiarativo** per stati desiderati, non solo RPC sincrone.
- Prefer **semantica sociale** quando non puoi introspezione su stati mentali altrui.
- Think of **Contract Net** per task sharing quando capacità locale insufficiente.

## Anti-patterns
- **Assumere cooperazione totale** con semantica mentalistica in agenti competitivi.
- **Protocollo senza policy** — semantica ACL troppo ricca per decidere risposta.
- **Violare integrità BSPL** — binding chiavi inconsistenti tra messaggi.

## Code Examples
```lisp
;; KQML-style (concettuale)
(ask-one :sender a :receiver b :content (price ?x) :reply-with id1)
```

## Reference Tables
| Messaggio / costrutto | Ruolo |
|----------------------|--------|
| tell | informare content |
| achieve | richiedere azione receiver |
| ask-one / ask-all | query con risposta parziale/totale |
| FP / RE (FIPA) | feasibility preconditions / rational effects |

## Key Takeaways
1. Comunicazione = percezione + azione; coordinazione emerge da messaggi.
2. KQML e FIPA ACL simili in sintassi, diversi in semantica (SL formale per FIPA).
3. Verifica protocolli: sintattica vs semantica; stati mentali difficili da osservare.
4. Commitment sociali rendono violazioni pubblicamente verificabili.
5. BSPL: no control flow esplicito; causalità e chiavi per enactment unici.

## Connects To
- **Ch 5**: JADE implementa FIPA ACL e Contract Net.
- **Ch 6**: meccanismi e equilibri per agenti self-interested.
- **cheatsheet**: confronto KQML vs FIPA.
