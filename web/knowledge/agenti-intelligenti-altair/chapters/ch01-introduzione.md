# Capitolo 1: Introduzione

## Core Idea
Gli agenti intelligenti nascono da cinque trend della computazione (ubiquità, interconnessione, intelligenza, delega, human-orientation) e risolvono due problemi distinti: progettare singoli agenti autonomi e progettare società di agenti che cooperano, negoziano e competono.

## Frameworks Introduced
- **Cinque trend computazionali**: ubiquità, interconnessione, intelligenza, delega, human-orientation — spiegano perché serve autonomia distribuita.
  - When to use: contestualizzare MAS vs AI classica o solo OO.
  - How: mappa ogni trend a un requisito (es. delega → agire per conto dell’utente).
- **Agente vs oggetto**: un oggetto fa perché deve; un agente fa perché vuole (autonomia).
  - When to use: decidere se un componente è agente o servizio passivo.
- **Triade reattivo / proattivo / sociale**: agente intelligente = flessibile su tre assi.
  - When to use: checklist architetturale minima.
- **Triangolo di Meyer**: processo, azione, oggetto — paradigma agent-oriented unisce agente (processo) + ambiente (azione/oggetto).
- **Due problemi deliberativi**: trasduzione (mondo → simboli in tempo utile) e rappresentazione/ragionamento (intrattabilità).

## Key Concepts
- **Agente**: sistema computazionale che agisce in modo indipendente per conto di utente/proprietario.
- **MAS**: insieme di agenti con obiettivi possibilmente diversi; richiede cooperazione, coordinazione, negoziazione.
- **Agente reattivo**: mantiene interazione con l’ambiente e risponde in tempo utile ai cambiamenti.
- **Agente proattivo**: persegue goal con piani, non solo eventi.
- **Abilità sociale**: interazione tramite ACL e cooperazione.
- **Wooldridge definition**: sistema situato che percepisce, agisce nel tempo, persegue agenda propria.

## Mental Models
- Use **due livelli di design** quando separi “come costruire un agente” da “come far collaborare molti agenti”.
- Think of **reattività vs proattività** as a trade-off aperto: serve bilanciamento, non massimizzare uno solo.
- Prefer **paradigma agent-oriented** over OO quando serve controllo del comportamento e task specification, non solo dati passivi.

## Anti-patterns
- **Trattare MAS come solo AI**: ignorare aspetti sociali, economici, logici.
- **Assumere società artificiali = società umane**: ispirazione sì, identità strutturale no.
- **Termostato = agente interessante**: automi triviali non modellano delega e interazione.

## Code Examples
N/A (capitolo concettuale).

## Reference Tables
| Paradigma | Pro | Contro |
|-----------|-----|--------|
| Decomposizione funzionale | Semplice, un top goal | Difficile nuovi goal, concorrenza |
| OO | Oggetti con vita propria | Oggetti passivi, no task spec |
| Attori | Thread per attore | Debole coordinazione |
| Agent-oriented | Autonomia, ambiente esplicito | Problemi simbolici aperti |

## Key Takeaways
1. MAS è campo interdisciplinare (economia, logica, teoria giochi, filosofia).
2. Autonomia è la proprietà distintiva degli agenti.
3. Agenti utili non richiedono risolvere tutta l’AI forte.
4. Architetture: 1956–1985 simboliche; 1985+ reattive; 1990+ ibride (es. Jason).
5. Progettare agenti = risolvere trasduzione + ragionamento in tempo reale.

## Connects To
- **Ch 2**: logica modale per rappresentare credenze e conoscenza.
- **Ch 3**: BDI e architetture deliberative/reattive/ibride.
- **agenti-intelligenti-altair patterns**: definizioni operative agente/MAS.
