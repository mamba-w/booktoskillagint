# Patterns — Agenti Intelligenti

## Agente vs Programma (Wooldridge)
**When to use**: classificare un componente software.
**How**: verifica autonomia, situazione, percezione/azione nel tempo, agenda propria.
**Trade-offs**: definizione ampia include termostati; serve filtro su reattività/proattività/socialità.

## Pipeline BDI: Belief Revision → Options → Filter → Plan → Act
**When to use**: progettare loop controllo agente deliberativo.
**How**: `brf` aggiorna B; `option` genera alternative; `filter` crea commitment (intenzioni); `plan` produce sequenza azioni; esecuzione con eventuale replan.
**Trade-offs**: versioni 1–7 aggiungono replan e `reconsider()` con costi meta-reasoning.

## Commitment Strategy Selection
**When to use**: definire quando abbandonare intenzioni.
**How**:
- Blind: mantieni finché non credi φ realizzato.
- Single-minded: abbandona se φ impossibile (¬BEL(EF φ)).
- Open-minded: abbandona se φ non è più goal.
**Trade-offs**: blind = overcommitment; open-minded = overhead riconsiderazione.

## PRS Control Loop
**When to use**: agente con piani predefiniti e eventi.
**How**: (1) aggiorna belief/goal da event queue; (2) trigger piani; (3) scegli piani applicabili → intention structure; (4) seleziona task; (5) esegui passo (azione o subgoal).
**Trade-offs**: no pianificazione automatica; flessibilità via meta-piano deliberazione.

## Brooks Subsumption Layer
**When to use**: robotica/ambiente dinamico senza ragionamento simbolico pesante.
**How**: behaviours (condizione, azione) con inibizione; strato basso ha priorità; competizione per controllo.
**Trade-offs**: semplice e veloce; difficile goal lunghi e molti behaviours.

## Architettura Ibrida Layered
**When to use**: serve reazione rapida + pianificazione simbolica.
**How**: sottosistema reattivo ha precedenza; deliberativo aggiorna modello e piani; horizontal vs vertical layering per I/O sensori/attuatori.
**Trade-offs**: complessità integrazione; esempi TOURINGMACHINES, Stanley.

## Speech Act Messaging
**When to use**: progettare messaggi tra agenti.
**How**: specifica locuzione (sintassi), illocuzione (performative: inform, request, agree), perlocuzione attesa; rispetta felicity conditions.
**Trade-offs**: semantica mentalistica difficile da verificare su agenti opachi.

## Contract Net Task Delegation
**When to use**: task troppo grande o meglio esternalizzato.
**How**: manager announce → contractors bid/decline → award → execute → result; deadline offerte; contractor può sub-delegare come manager.
**Trade-offs**: overhead messaggi; richiede infrastruttura ACL + protocollo.

## FIPA ACL Message + Conformance
**When to use**: implementare comunicazione standard (JADE).
**How**: costruisci ACLMessage con performative; verifica FP sul mittente; non assumere RE sul receiver.
**Trade-offs**: SL complesso; test semantico richiede stati mentali o riduzione a verifica programma.

## BSPL Enactment with Keys
**When to use**: protocolli dichiarativi verificabili senza DFA esplicita.
**How**: parametri in/out/nil; chiave univoca per enactment; invia solo se binding consistenti e vincoli integrità; causalità messaggi.
**Trade-offs**: messaggistica sincrona assumta; implementazione per-ruolo con archivio messaggi.

## AgentSpeak(L) Plan Triggering
**When to use**: programmare agente BDI in Jason.
**How**: evento +/− su belief/goal → unifica triggering event piani → filtra per context ⊆ B → S_O sceglie piano → push intention stack → esegui body (!, ?, azioni).
**Trade-offs**: selezione piani e fallimenti richiedono piani recovery (-!g).

## Nash Equilibrium Analysis
**When to use**: prevedere comportamento agenti egoisti.
**How**: costruisci payoff matrix; cerca strategie dominanti; altrimenti profili dove nessuno devia unilateralmente; usa miste se pure non esistono.
**Trade-offs**: predice equilibrio, non ottimo sociale; multipli equilibri possibili.

## Mechanism Design for MAS
**When to use**: progettare regole piattaforma/asta/negoziazione.
**How**: definisci linguaggio strategie + regola outcome; verifica IR, Nash stability, Pareto, successo; es. Vickrey per bid veraci.
**Trade-offs**: proprietà multiple in conflitto; semplicità vs ottimalità.

## TIT-FOR-TAT in Repeated Games
**When to use**: interazione ripetuta con stessi agenti.
**How**: coopera round 0; poi copia mossa avversario; punisci defection senza escalation infinita; perdona cooperando subito dopo.
**Trade-offs**: vulnerabile a noise e ad ALLD; ottimo dipende popolazione strategie.
