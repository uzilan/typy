/**
 * Two kinds of passages:
 * - Everyday texts in modern Swedish written for Typy (no source), used for
 *   the drill levels.
 * - Excerpts from public-domain Swedish literature (post-1906 spelling),
 *   kept as published, used for the long-text level.
 * normalizeText() makes all text typeable when exercises are built.
 */

export interface Source {
  author: string
  work: string
  year: number
  url: string
}

export interface Passage {
  id: string
  title: string
  source?: Source
  text: string
}

const NILS: Source = {
  author: 'Selma Lagerlöf',
  work: 'Nils Holgerssons underbara resa genom Sverige',
  year: 1906,
  url: 'https://runeberg.org/nilsholg/',
}

const LEKEN: Source = {
  author: 'Hjalmar Söderberg',
  work: 'Den allvarsamma leken',
  year: 1912,
  url: 'https://sv.wikisource.org/wiki/Den_allvarsamma_leken/Del_1',
}

const NORRTULL: Source = {
  author: 'Elin Wägner',
  work: 'Norrtullsligan',
  year: 1908,
  url: 'https://sv.wikisource.org/wiki/Norrtullsligan/Kap_01',
}

const MARKURELL: Source = {
  author: 'Hjalmar Bergman',
  work: 'Markurells i Wadköping',
  year: 1919,
  url: 'https://runeberg.org/markurel/01.html',
}

export const PASSAGES: Passage[] = [
  // Modern everyday prose
  {
    id: 'bussen',
    title: 'Bussen',
    text: 'Det regnade när jag gick till bussen i morse. Bussen var sen, som vanligt, så jag köpte en kopp kaffe på hörnet. När den till slut kom var den nästan full, och jag fick stå hela vägen till jobbet. Bredvid mig satt en pojke och läste en tjock bok om rymden. Han var så uppslukad att han nästan missade sin hållplats.',
  },
  {
    id: 'fika',
    title: 'Fika',
    text: 'Klockan tre samlas hela kontoret i fikarummet. Någon har alltid bakat, och i dag är det kanelbullar som fortfarande är varma. Vi pratar om helgen, om vädret och om vem som glömde diska sin kaffekopp i fredags. Efter en kvart går alla tillbaka till sina skrivbord, lite gladare än förut.',
  },
  {
    id: 'stugan',
    title: 'Stugan',
    text: 'Varje sommar åker vi till sommarstugan vid sjön. Det första vi gör är att öppna alla fönster och bära ut madrasserna i solskenet. Sedan springer barnen ner till badbryggan för att känna på vattnet. Det är alltid för kallt, men de badar ändå. På kvällen grillar vi korv och sitter ute på verandan tills myggorna jagar in oss.',
  },
  {
    id: 'svamp',
    title: 'Svampskogen',
    text: 'I oktober går vi ut i granskogen för att plocka svamp. Marken är blöt och mjuk, och det luktar mossa och granbarr. Min mormor hittar alltid kantareller, även när vi andra inte ser en enda. Hon säger att man måste gå långsamt och titta noggrant under löven. När vi kommer hem gör hon svampstuvning med smör och grädde, och hela lägenheten doftar höst.',
  },
  {
    id: 'flytten',
    title: 'Flytten',
    text: 'Förra veckan flyttade min syster till en lägenhet i Göteborg. Vi hyrde en flyttbil och packade allt på en enda dag. Det visade sig att hon ägde fler böcker än kläder. Bokhyllan fick inte plats i hissen, så vi bar den uppför fyra trappor. På kvällen åt vi pizza på golvet, eftersom bordet fortfarande låg i delar.',
  },
  {
    id: 'snon',
    title: 'Snön',
    text: 'När det snöar i Stockholm blir staden plötsligt tyst. Bilarna kör långsammare och folk går försiktigt på trottoarerna. Barnen drar fram sina pulkor och åker i varenda backe de hittar. På kvällen lyser fönstren gula i mörkret, och alla verkar vilja stanna inne med en kopp te.',
  },

  // Modern everyday dialogue
  {
    id: 'nycklarna',
    title: 'Nycklarna',
    text: '"Har du sett mina nycklar?" frågade Sara. "Nej, men har du tittat i jackan?" svarade Ali. "Där har jag redan letat!" "Då ligger de nog på köksbordet, som vanligt." Sara gick ut i köket och kom tillbaka med ett generat leende. "Du har rätt. Igen."',
  },
  {
    id: 'samtalet',
    title: 'Samtalet',
    text: '"Hej mamma, det är jag!" "Hej gumman! Har du ätit ordentligt i dag?" "Ja, jag har ätit. Jag ringer bara för att säga att jag kommer på lördag." "Vad roligt! Ska jag göra köttbullar?" "Gärna, men inte så många den här gången." "Det säger du alltid."',
  },
  {
    id: 'restaurangen',
    title: 'Restaurangen',
    text: '"Vad vill ni beställa?" frågade servitören. "Jag tar dagens fisk", sa Johan. "Och du?" "Jag vet inte riktigt. Vad kan du rekommendera?" "Köttgrytan är väldigt god i dag." "Då tar jag den. Och ett glas vatten, tack!"',
  },
  {
    id: 'cykeln',
    title: 'Cykel eller buss',
    text: '"Ska vi cykla eller ta bussen?" frågade Emil. Lina tittade ut genom fönstret: det regnade fortfarande. "Bussen", sa hon. "Jag vill inte komma fram dyblöt igen." "Men det är ju bara lite duggregn!" "Det sa du förra gången också; sedan öste det ner."',
  },
  {
    id: 'matchen',
    title: 'Matchen',
    text: '"Vilken match!" ropade pappa när domaren blåste av. "Tre mål på tio minuter, har du någonsin sett något liknande?" Jag skakade på huvudet. "Aldrig. Men varför tittade du bort när de gjorde det sista?" "Jag vågade inte titta", erkände han. "Jag trodde att vi skulle förlora."',
  },

  // Public-domain literature
  {
    id: 'varvader',
    title: 'Vårväder',
    source: NILS,
    text: 'Ute var det allra vackraste vårväder. Året var inte längre kommet än till den tjugonde mars, men pojken bodde i Västra Vemmenhögs socken långt nere i södra Skåne, och där var våren redan i full gång. Det var inte grönt än, men det var friskt och knoppande. Det fanns vatten i alla diken, och hästhovsörten stod i blom på dikeskanten. Allt det krattet, som växte på stengärdsgården, hade blivit brunt och blankt. Bokskogen långt borta stod och liksom svällde och blev tätare för varje ögonblick. Himmelen var hög och rent blå.',
  },
  {
    id: 'lydia',
    title: 'Lydia simmar',
    source: LEKEN,
    text: 'Så böjde hon sig framöver och simmade ut på det smaragdklara djupet. Hon njöt av att känna vattnet bära sig — hon kände sig så lätt. Hon simmade lugnt och tyst. Hon såg inga abborrar i dag; annars brukade hon leka litet med dem ibland. En gång hade hon varit så nära att fånga en med handen, att hon stack sig på hans ryggfena.',
  },
  {
    id: 'middagen',
    title: 'Middagen',
    source: LEKEN,
    text: 'Och hon lät tankarna löpa. Hon tänkte på, att det snart var middag. De skulle ha bräckt skinka och spenat. Och det var nog gott — men det kunde nu inte hjälpas, middagen var i alla fall den tråkigaste stunden på dagen. Fadern sade just inte många ord, och bror Otto satt tyst och tvär. Han hade ju också sina bekymmer, Otto. Det var så trångt på ingenjörsbanan här hemma, och i höst skulle han fara till Amerika.',
  },
  {
    id: 'sparvagnen',
    title: 'Spårvagnen',
    source: NORRTULL,
    text: 'Spårvagnen var full av morgonbleka och småfrusna arbetsmänniskor. När jag såg dem, försökte jag att ta tillfället i akt och höja min stämning genom att ”tänka på dem, som har det sämre än jag”. Eftersom jag skall vara på kontoret klockan 9, borde det ha gjort ovanligt gott att tänka på dem, som börjar knoget klockan 7, men det där är nog bara en av gammalt folks legender, för inte höjde 7-människorna mitt humör något nämnvärt.',
  },
  {
    id: 'humlan',
    title: 'Humlan',
    source: MARKURELL,
    text: 'Under linden stod ett bord och två stolar av järn. På bordet, vars skiva pryddes av zodiakens stjärnetecken, stod en kopp med kaffe och en kopp med punsch som helt fylldes av flugor, getingar och en jättestor humla. Humlan levde ännu. Uppklättrad på sina olyckskamraters lik kämpade hon en ojämn kamp mot rusets fördärvliga verkningar. Då och då gav hon till ett ångestfullt surr, dovt och dystert som virveln från förstämda trummor.',
  },
]
