# Nopeuskiipeily — Pikaopas

**Nopeuskiipeily (Speed)** -tila on suunniteltu virallisen IFSC 15 metrin nopeuskiipeilyn harjoitteluun ja kilpailuihin. Se tarjoaa automaattiset lähtöäänimerkit, kahden radan ajanoton millisekunnin tarkkuudella, varaslähdön tunnistuksen sekä yläantureiden rekisteröinnin.

---

## Pikanavigointi

- [Mikä on Nopeuskiipeily-tila?](#mika-on-nopeuskiipeily-tila)
- [Aktivointi ja käynnistys](#aktivointi-ja-kaynnistys)
- [Mitä voit säätää](#mita-voit-saataa)
- [Miten ajastin toimii vaihe vaiheelta](#miten-ajastin-toimii-vaihe-vaiheelta)
- [Tuomarin toiminnot](#tuomarin-toiminnot)

---

## Mikä on Nopeuskiipeily-tila?

Nopeuskiipeilyssä kaksi kiipeilijää kisaa rinnakkain identtisillä 15 metrin radoilla (Rata A ja Rata B). Ajastin:
- Soittaa virallisen maailmancup-lähtöäänisarjan ("Piip... Piip... Piiiip!").
- Käynnistää molempien ratojen kellon yhtäaikaisesti GO-äänimerkillä.
- Tunnistaa varaslähdön automaattisesti, jos kiipeilijä irrottaa jalkansa lähtölevyltä liian aikaisin.
- Pysäyttää kummankin radan kellon erikseen kiipeilijän osuessa seinän yläreunassa olevaan kosketuslevyyn.

---

## Aktivointi ja käynnistys

### 1. Valitse Nopeuskiipeily
- **Puhelimella / Selainsovelluksessa**: Avaa valikko ja valitse *Climb Mode* -kohdasta **IFSC Speed**.
- **Ajastinyksiköstä**: Käännä säätönuppia, kunnes OLED-näytöllä lukee `SPEED`, ja paina nuppia valitaksesi.

### 2. Valmistele kiipeilijät
- Kiipeilijät astuvat seinän juurella oleville lähtölevyille.
- Ajastimen näytölle syttyy teksti **READY** ja vihreät merkkivalot.

### 3. Käynnistä lähtö
- Paina selainsovelluksesta **START** tai ajastinyksiköstä **Button 0 (Action)**.

---

## Mitä voit säätää

Asetuksia voi muuttaa helposti selainsovelluksen **⚙️ Configuration** -valikosta tai laitteen nupilla:

| Asetus | Mitä se tekee | Suositus |
| :--- | :--- | :--- |
| **Countdown Beeps** | Kytkee lähtöpiipitykset päälle tai pois | Pidä **Päällä** kisaharjoittelussa |
| **Audio Waveform** | Äänen sävy: *Warm Sine* (pehmeä) tai *Sharp Square* (terävä) | *Warm Sine* sisähalliin, *Sharp Square* meluisaan tilaan |
| **Volume Slider** | Äänenvoimakkuus (0–100%) | Säädä riittävän kovalle, jotta GO-ääni kuuluu selvästi seinälle |
| **Active Lanes** | Aktivoi Rata A (vasen), Rata B (oikea) tai molemmat | Kytke Rata B pois, jos harjoittelet yksin yhdellä radalla |

---

## Miten ajastin toimii vaihe vaiheelta

Näin ajastin etenee suorituksen aikana:

| Vaihe / Aika | Näytön tila | Äänimerkki | Mitä seinällä tapahtuu |
| :--- | :--- | :--- | :--- |
| **Valmistautuminen** | `READY` | *Hiljaisuus* | Kiipeilijät seisovat lähtölevyillä. |
| **-2.0 s** | `SET .` | Lyhyt piippaus (880 Hz) | "Paikoillenne" – Kiipeilijät asettuvat lähtöasentoon otteille. |
| **-1.0 s** | `SET . .` | Lyhyt piippaus (880 Hz) | Pysy liikkumatta lähtölevyllä. |
| **0.0 s (GO)** | `RACING` | Korkea pitkä merkkiääni (1760 Hz) | **LÄHTÖ!** Kello käynnistyy ajasta `00.000`. Kiipeilijät säntäävät seinälle. |
| **Kiipeily** | `SS.MMM` | *Hiljaisuus* | Kello rullaa sekunteja ja millisekunteja. |
| **Top-kosketus** | `WINNER` (Vihreä) | Vahvistusääni | Kiipeilijä lyö ylälevyä. Loppuaika lukitaan välittömästi. |

### Varaslähdön käsittely
- Jos kiipeilijän jalka nousee lähtölevyltä alle **100 ms** sisällä GO-äänestä (tai ennen sitä), järjestelmä rekisteröi **VARASLÄHDÖN**.
- Kuuluu matala varoitusääni, radan väri muuttuu **PUNAISEKSI** ja näytölle tulee `FALSE`.

---

## Tuomarin toiminnot

Valmentaja tai tuomari voi hallita suoritusta suoraan sovelluksesta:

- **WINNER A / WINNER B**: Merkitse radan voittaja manuaalisesti, jos ylälevyyn osuttiin mutta anturi ei lauennut.
- **FALL A / FALL B**: Merkitse kiipeilijä pudonneeksi.
- **ABORT**: Keskeytä lähtö tai kisa heti.
- **RESET**: Palauta ajastin valmiustilaan seuraavaa paria varten.
