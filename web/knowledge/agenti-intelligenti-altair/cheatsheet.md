# Cheatsheet — Agenti Intelligenti

## Agente intelligente (checklist)
| Proprietà | Domanda |
|-----------|---------|
| Reattivo | Risponde in tempo utile ai cambiamenti? |
| Proattivo | Persegue goal con piani, non solo eventi? |
| Sociale | Usa ACL e coopera/negotia? |
| Autonomo | Agenda propria, non solo invocazione esterna? |

## Paradigmi computazionali (Meyer)
| Forza | Imperativo | OO | Agent-oriented |
|-------|------------|-----|----------------|
| Processo | centrale | esterno decide | **Agente** |
| Azione | sequenza passi | metodi su oggetti | **Ambiente** |
| Oggetto | dati condivisi | entità passive | percepito/agito |

## Logiche modali agenti
| Operatore | Significato tipico |
|-----------|-------------------|
| K_a φ | a sa φ |
| B_a φ | a crede φ |
| D_a φ | a desidera φ |
| I_a φ | a intende φ |
| X φ / G φ / F φ | next / always / eventually |
| [π]φ | dopo π, φ |

## Frame → sistema (esempi)
| Proprietà | Assioma | Sistema |
|-----------|---------|---------|
| T | □φ⇒φ | KT |
| 4 | □φ⇒□□φ | S4 |
| 5 | ¬□φ⇒□¬□φ | parte di S5 |

## BDI commitment types
| Tipo | Abbandona intenzione quando |
|------|----------------------------|
| Blind | solo se crede φ fatto |
| Single-minded | φ fatto o φ impossibile |
| Open-minded | φ fatto o φ non più goal |

## KQML vs FIPA ACL
| Aspetto | KQML | FIPA ACL |
|---------|------|----------|
| Content | indipendente | indipendente |
| Semantica | attitudini, incompleta | SL formale |
| Facilitators | sì | no |

## Contract Net (ruoli)
| Ruolo | Azioni chiave |
|-------|----------------|
| Manager | announce → evaluate bids → award → receive result |
| Contractor | evaluate → bid/decline → execute if awarded → report |

## JADE behaviours
| Tipo | done() |
|------|--------|
| OneShot | true dopo 1 action |
| Cyclic | sempre false |
| Complex | true quando condizione stato |

## Teoria dei giochi rapida
| Concetto | Regola pratica |
|----------|----------------|
| Dominante | scegli sempre, ignorando altri |
| Nash | nessuno vuole deviare da solo |
| Pareto | non migliori tutti insieme |
| PD one-shot | defection Nash, cooperate Pareto |
| PD ripetuto ∞ | cooperazione possibile (TFT) |

## Aste — strategia dominante
| Tipo | Bid |
|------|-----|
| Inglese | finché prezzo < valore privato |
| Vickrey | bid = valore privato vero |

## Quando usare cosa
| Bisogno | Strumento corso |
|---------|-----------------|
| Modellare credenze | Logica epistemica / BDI |
| Verificare protocolli concorrenti | LTL + model checking |
| Standard industria agenti | JADE + FIPA |
| Agente BDI pratico | JASON / AgentSpeak(L) |
| Task delegation | Contract Net |
| Agenti egoisti | Nash + mechanism design |
