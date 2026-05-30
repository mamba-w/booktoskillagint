# Capitolo 5: JADE e JASON

## Core Idea
JADE materializza lo standard FIPA in Java (agenti, ACL, protocolli); JASON implementa AgentSpeak(L) con ciclo operazionale BDI, estensioni per fallimento e sistemi multi-agente distribuiti.

## Frameworks Introduced
- **Piattaforma FIPA**: lifecycle, trasporto messaggi, struttura messaggio, protocolli, ontologie.
- **JADE Agent model**: extends `jade.core.Agent`, AID univoco, un thread per agente, cooperative scheduling behaviours.
- **Behaviour types**: OneShot, Cyclic, Complex (DFA), WakerBehaviour, TickerBehaviour.
- **Comunicazione JADE**: `send`/`receive`, `block()` non blocca thread, `blockingReceive()` sì.
- **FIPA interaction protocols in JADE**: Request, Contract-Net, Subscribe con timeout.
- **AgentSpeak(L) reasoning cycle**: eventi E, belief revision Sε, option selection S_O, intention selection S_I, stack intentions.
- **JASON extensions**: strong negation, annotated beliefs, plan labels, failure events (-!g), internal actions, SACI distribution.

## Key Concepts
- **AID**: nome locale + GUID + indirizzi; univoco globalmente.
- **Yellow Pages**: pubblicazione/discovery servizi agenti.
- **Piano AgentSpeak**: `e : context ← body` (head : context ← body).
- **Triggering events**: `+g` aggiunta, `-g` rimozione goal/belief.
- **Achievement goal !g** vs **test goal ?g**.
- **Intention stack**: `[p1|p2|...|pz]` frame parzialmente istanziati.
- **doDelete/takeDown**: terminazione agente JADE dopo setup.

## Mental Models
- Use **behaviour pool** in JADE quando modelli task concorrenti nello stesso thread cooperativo.
- Prefer **AgentSpeak plans** over ad-hoc Java quando logica agente è dichiarativa e event-driven.
- Think of **Tit-for-Tat style** protocol compliance via JADE Interaction Protocol classes.

## Anti-patterns
- **blockingReceive con altre behaviours attive** — blocca tutto il thread agente.
- **Rubare messaggi tra behaviours** — usare filtri su receive.
- **Ignorare failure events in JASON** — intention intera eliminata se no piano per -!g.
- **Assumere JADE nasconde tutto FIPA** — serve conoscenza ACL per debug serio.

## Code Examples
```java
// JADE — scheletro agente
public class Hello extends Agent {
  protected void setup() {
    addBehaviour(new OneShotBehaviour(this) {
      public void action() { /* ... */ }
    });
  }
}
```

```agentspeak
// AgentSpeak(L) — piano tipico
+!go(loc) : belief(here(X)) & X \== loc
  <- !move(loc); !go(loc).
```

## Reference Tables
| Behaviour JADE | action() | done() |
|----------------|----------|--------|
| OneShot | una volta | sempre true |
| Cyclic | ripetuta | sempre false |
| Complex | dipende da stato | quando condizione |

## Key Takeaways
1. FIPA definisce interoperabilità; JADE è implementazione Java reference-style.
2. Un agente JADE = thread + pool behaviours; IDLE quando pool vuoto.
3. AgentSpeak(L) unifica eventi, piani, goals, beliefs in programmazione logica.
4. Ciclo: evento → piani rilevanti → applicabili → intended means → intention stack.
5. JASON aggiunge gestione fallimento, annotazioni source(percept/self), MAS su rete.

## Connects To
- **Ch 3**: PRS/AgentSpeak teorici.
- **Ch 4**: ACL e Contract Net usati in JADE.
- **patterns**: JADE behaviour lifecycle, Jason reasoning cycle.
