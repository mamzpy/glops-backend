# OR1-213 — Verifica Pladway / Composer

## Obiettivo

Questo documento riassume la prima verifica tecnica svolta per l’integrazione Pladway all’interno del flusso Composer.

L’obiettivo della verifica è capire quali informazioni Pladway rende disponibili rispetto a:

* campagna / creatività;
* prezzo / CPM;
* location / display di destinazione.

## Contesto

Nel flusso previsto, Pladway viene utilizzato come provider pubblicitario esterno.

Il Composer backend riceve la richiesta dal dispositivo OPT/PWA, recupera il contesto locale del dispositivo e richiede a Pladway un contenuto pubblicitario disponibile.

La risposta di Pladway viene poi normalizzata dal backend per permettere al client di riprodurre il contenuto e confermare successivamente l’avvenuta impression.

## Verifica effettuata

È stata implementata una prima integrazione backend verso endpoint VAST reali di Pladway.

La verifica ha permesso di controllare:

* gestione di risposte VAST piene;
* gestione di risposte VAST vuote;
* estrazione di informazioni creative;
* estrazione del media riproducibile;
* estrazione delle URL di impression/tracking;
* conferma impression lato backend dopo playback;
* recupero del contesto OPT/stazione lato GLOPS tramite autenticazione device.

## Esito verifica

### Campagna / creatività

Dalle risposte VAST analizzate risultano disponibili informazioni creative parziali, come identificativi annuncio/creatività, media riproducibile e URL di impression/tracking.

Non risultano invece disponibili metadati campagna completi, come nome campagna, advertiser o informazioni di targeting.

### Prezzo / CPM

Nelle risposte VAST analizzate non è presente un campo chiaro relativo a prezzo o CPM.

La verifica del prezzo richiede quindi documentazione OpenRTB / bid API da Pladway o un esempio ufficiale di bid response.

### Location / display

Il contesto location/display è disponibile lato GLOPS tramite autenticazione device.

Il backend può identificare quale OPT e quale stazione stanno richiedendo il contenuto.

La mappatura finale tra OPT/stazione GLOPS e placement/location Pladway dipende dalla configurazione e dalla documentazione ufficiale Pladway.

## Stato attuale

La branch di verifica conferma che il backend può:

* interrogare endpoint VAST reali di Pladway;
* distinguere risposte piene e vuote;
* estrarre media riproducibile;
* estrarre informazioni creative e tracking disponibili;
* risolvere il contesto OPT/stazione;
* confermare impression lato backend dopo playback.

## Punto aperto

Rimane aperta la verifica del CPM/prezzo, che richiede documentazione OpenRTB / bid API da Pladway.
