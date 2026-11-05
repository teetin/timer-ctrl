# Boulder — Pikaopas

**Boulder**-tila pyörittää ajastettuja kiipeily- ja lepointervalleja. Se sopii täydellisesti virallisiin IFSC-formaatin rotaatiokisoihin (esim. 4 min kiipeilyä / 4 min lepoa tai 5 min / 5 min) sekä päivittäiseen saliharjoitteluun, flässitreeneihin ja 4x4-harjoitteisiin.

---

## Pikanavigointi

- [Mikä on Boulder-tila?](#mika-on-boulder-tila)
- [Aktivointi ja käynnistys](#aktivointi-ja-kaynnistys)
- [Mitä voit säätää](#mita-voit-saataa)
- [Miten ajastin toimii: Vaiheet ja äänet](#miten-ajastin-toimii-vaiheet-ja-aanet)
- [Harjoituksen hallinta](#harjoituksen-hallinta)

---

## Mikä on Boulder-tila?

Boulder-tila automatisoi ryhmä- ja kisarotaatiot:

- Kiipeilijällä on määrätty aika kiivetä reittiä (esim. 4 minuuttia).
- Ajan päättyessä alkaa lepo-/vaihtojakso (esim. 4 minuuttia tai 15 sekuntia), jolloin siirrytään seuraavalle boulderille tai vuoro vaihtuu.
- Selkeät äänimerkit varoittavat ajan vähenemisestä, joten tiedät tarkalleen milloin on viimeisen yrityksen aika ilman kellon tuijottamista.

---

## Aktivointi ja käynnistys

### 1. Valitse Boulder-tila

- **Puhelimella / Sovelluksessa**: Valitse valikosta *Climb Mode* -kohdasta **Boulder**.
- **Ajastinyksiköstä**: Käännä nuppi kohtaan `BOULDER` ja paina vahvistaaksesi.

### 2. Aseta kiipeily- ja lepoajat

- Määritä sovelluksesta:
    - **Climb Duration**: Aika seinällä (esim. `240` sekuntia eli 4 minuuttia).
    - **Transition Duration**: Lepoaika tai siirtymäaika (esim. `240` sekuntia tai `15` sekuntia).
    - **Initial Warning**: Lähtölaskenta ennen ensimmäisen kierroksen alkua (esim. `15` sekuntia).

### 3. Käynnistä harjoitus

- Paina sovelluksesta **START** tai laitteesta **Button 0 (Action)**.

---

## Mitä voit säätää

Kaikki asetukset säädetään helposti sovelluksen **⚙️ Configuration** -paneelista:

| Asetus | Oletus | Kuvaus | Vinkki kiipeilijälle |
| :--- | :--- | :--- | :--- |
| **Climb Duration** | `60s` | Kiipeilyaika kierrosta kohden | Aseta `240s` (4 min) tai `300s` (5 min) kisaharjoitukseen. |
| **Transition Duration** | `15s` | Lepo- tai siirtymäaika | IFSC-kisoissa usein sama kuin kiipeilyaika (esim. 4 min kiipeilyä / 4 min lepoa). |
| **Initial Prep Duration** | `15s` | Ennakkoaika ennen 1. kierrosta | Antaa aikaa mankata kädet ja asettua boulderin eteen. |
| **Enable Auto-Loop** | Pois | Toistaa kierroksia automaattisesti | Laita **Päälle** 4x4-treeneissä tai ryhmäkisoissa. |
| **Countdown Beeps** | Päällä | Varoituspiippaukset siirtymissä | Pidä **Päällä**, jotta kuulet 1 minuutin varoituksen seinälle. |

---

## Miten ajastin toimii: Vaiheet ja äänet

Näin ajastin ohjaa kiipeilijää kierroksen aikana:

| Vaihe | Tilanäyttö | Jäljellä oleva aika | Äänimerkki | Mitä kiipeilijä tekee |
| :--- | :--- | :--- | :--- | :--- |
| **Valmistautuminen** | `PREP` | esim. `00:15` ➔ `00:00` | Piippaukset viimeisillä sekunneilla | Mankkaa kädet, katso beeta, valmistaudu. |
| **Kiipeilyn alku** | `CLIMB` | Täysi kiipeilyaika | Keskikorkea aloitusääni (523 Hz) | Aloita kiipeäminen! |
| **1 minuutti jäljellä** | `CLIMB` | `01:00` jäljellä | Korkea varoitusääni (1760 Hz) | **1 minuutti aikaa!** Viimeisen yrityksen hetki. |
| **Viimeiset 5 sekuntia**| `CLIMB` | `00:05` ➔ `00:01` | Lyhyet piippaukset sekunnin välein | Viimeiset sekunnit päästä toppiin. |
| **Kiipeilyaika päättyy** | `TRANS` | `00:00` | Lopetusääni (880 Hz) | Aika loppui! Astu pois patjoilta lepoalueelle. |
| **Lepo / Siirtymä** | `REST` | esim. `04:00` ➔ `00:00` | Ennakkoäänet ennen seuraavaa kierrosta | Ravistele käsiä, harjaa otteet, siirry seuraavalle boulderille. |

---

## Harjoituksen hallinta

Sovelluksen painikkeilla harjoituksen hallinta sujuu vaivattomasti:

- **PAUSE / RESUME**: Haluatko harjata otteen tai kiristää tossun? Paina **PAUSE** pysäyttääksesi kellon, ja jatka painamalla **RESUME**.
- **FINISH**: Toppasitko boulderin etuajassa? Paina **FINISH** lopettaaksesi kiipeilyajan ja siirtyäksesi heti lepojaksolle.
- **RESET**: Keskeyttää kierrokset ja nollaa ajastimen takaisin alkuasentoon.
