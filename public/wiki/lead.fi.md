# Lead — Pikaopas

**Lead (Reittikiipeily)** -tila on kehitetty köysikiipeilyn virallisiin IFSC-kilpailuihin ja tavoitteelliseen liiditreeniin. Se huolehtii kiipeilijän valmistautumisajasta, laskee kiipeilyaikaa alaspäin häiritsemättä kiipeilijää ja antaa selkeät varoitusäänet kriittisillä hetkillä.

---

## Pikanavigointi

- [Mikä on Lead-tila?](#mika-on-lead-tila)
- [Aktivointi ja käynnistys](#aktivointi-ja-kaynnistys)
- [Mitä voit säätää](#mita-voit-saataa)
- [Miten ajastin toimii: Vaiheet ja äänet](#miten-ajastin-toimii-vaiheet-ja-aanet)
- [Varmistajan ja tuomarin toiminnot](#varmistajan-ja-tuomarin-toiminnot)

---

## Mikä on Lead-tila?

Liidikilpailuissa ja punapistetreenissä:
- Kiipeilijällä on lyhyt **Valmistautumisaika** (tyypillisesti 40 sekuntia) solmia kasi, tarkistaa reitin alku ja asettua seinälle.
- Heti kiipeilyn alkaessa **Kiipeilyaika** (vakiona 6 minuuttia / 360 sekuntia) alkaa kulua alaspäin ilman häiritseviä ääniä.
- Varoitusääni soi tasan 1 minuutin kohdalla, jotta kiipeilijä tietää rytmittää reitin yläosan ja katsuksen.
- Ankkuriklipsin (TOP) tai putoamisen tapahtuessa kello pysähtyy ja tallentaa virallisen nousuajan millisekunnin tarkkuudella.

---

## Aktivointi ja käynnistys

### 1. Valitse Lead-tila
- **Puhelimella / Sovelluksessa**: Valitse valikosta *Climb Mode* -kohdasta **Lead**.
- **Ajastinyksiköstä**: Käännä säätönuppia kohtaan `LEAD` ja paina nuppia.

### 2. Tarkista ajat
- Oletuksena Lead-tilassa on:
  - **40 sekuntia**: Valmistautumisaika (Prep).
  - **360 sekuntia (6:00)**: Kiipeilyaika seinällä.

### 3. Käynnistä suoritus
- Kun kiipeilijä kutsutaan seinälle, paina **START** sovelluksesta tai **Button 0 (Action)** laitteesta.

---

## Mitä voit säätää

Avaa **⚙️ Configuration** -paneeli mukauttaaksesi suoritusta:

| Asetus | Oletus | Kuvaus | Vinkki kiipeilijälle |
| :--- | :--- | :--- | :--- |
| **Climb Duration** | `360s` (6 min) | Sallittu enimmäisaika seinällä | Virallisissa IFSC-reiteissä 6 minuuttia; treeniseinällä voit asettaa esim. 8–10 minuuttia. |
| **Initial Warning / Prep** | `40s` | Valmistautumisaika ennen nousua | IFSC-standardin mukainen valmistautumisaika on 40 s. |
| **Countdown Beeps** | Päällä | Äänimerkit 1 min kohdalla ja ajan loppuessa | Pidä päällä, jotta kiipeilijä kuulee kriittisen 1 minuutin merkin. |
| **Volume Slider** | 100% | Äänenvoimakkuus | Aseta riittävän kovalle, jotta ääni kantaa korkean hallin kattoon. |

---

## Miten ajastin toimii: Vaiheet ja äänet

Näin ajastin seuraa suoritusta:

| Vaihe | Tilanäyttö | Kellon näyttö | Äänimerkki | Mitä kiipeilijä ja varmistaja tekevät |
| :--- | :--- | :--- | :--- | :--- |
| **1. Valmistautuminen** | `PREP` | `00:40` ➔ `00:00` | Hiljainen (piippaa viim. 5 s) | Kiipeilijä solmii kasisolmun, varmistaja tekee ristiintarkistuksen. |
| **2. Reitin aloitus** | `RACING` / `CLIMB` | `06:00` laskee alaspäin | Mieto aloitusääni | Kiipeilijän jalat irtoavat maasta. Kello käy hiljaa keskittymisen takaamiseksi. |
| **3. 1 minuutti jäljellä**| `CLIMB` | `01:00.0` | Selkeä korkea ääni (1760 Hz) | **1 minuutti jäljellä!** Kiipeilijä tietää puskea kruksin läpi. |
| **4. Aika päättyy** | `FINISHED` | Saavuttaa `00:00.0` | Pitkä lopetussummeri | Virallinen kiipeilyaika täyttyi. |
| **5. Toppi tai putoaminen**| `FINISHED` | Pysähtyy heti | Hiljainen | Aika lukittuu. Varmistaja laskee kiipeilijän alas. |

---

## Varmistajan ja tuomarin toiminnot

Suorituksen kirjaaminen sovelluksesta:

- **FINISH (Top-klipsi)**: Heti kun kiipeilijä klippaa viimeisen jatkon / ankkurin, paina **FINISH**. Nousuaika tallentuu viralliseksi ajaksi.
- **FALL (Putoaminen)**: Jos kiipeilijä putoaa köydelle, paina **FALL** (tai **RESET**) kirjaaksesi nousun päättyneeksi.
- **RESET**: Nollaa ajastimen valmiiksi seuraavaa kiipeilijää varten.
