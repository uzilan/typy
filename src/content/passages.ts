/**
 * Passages from public-domain Swedish literature (post-1906 spelling).
 * Text is kept as published apart from fixes of obvious OCR errors, noted
 * per passage; normalizeText() makes it typeable when exercises are built.
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
  source: Source
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
  url: 'https://sv.wikisource.org/wiki/Den_allvarsamma_leken',
}

export const PASSAGES: Passage[] = [
  {
    id: 'pojken',
    title: 'Pojken',
    source: NILS,
    // OCR fix: "linhårig, Inte" → "linhårig. Inte"
    text: 'Det var en gång en pojke. Han var så där en fjorton år gammal, lång och ranglig och linhårig. Inte stort dugde han till: han hade mest av allt lust att sova och äta, och därnäst tyckte han om att ställa till odygd.',
  },
  {
    id: 'predikan',
    title: 'Predikan',
    source: NILS,
    text: 'Men det var nästan, som om far skulle ha gissat sig till pojkens tankar, för just som han stod på tröskeln och var färdig att gå, stannade han och vände sig mot honom. "Eftersom du inte vill gå i kyrkan med mor och mig," sade han, "så tycker jag, att du åtminstone kan läsa predikan hemma. Vill du lova, att du gör det?" "Ja," sade pojken, "det kan jag väl göra." Och han tänkte förstås, att inte skulle han läsa mer, än han hade lust till.',
  },
  {
    id: 'varvader',
    title: 'Vårväder',
    source: NILS,
    text: 'Ute var det allra vackraste vårväder. Året var inte längre kommet än till den tjugonde mars, men pojken bodde i Västra Vemmenhögs socken långt nere i södra Skåne, och där var våren redan i full gång. Det var inte grönt än, men det var friskt och knoppande. Det fanns vatten i alla diken, och hästhovsörten stod i blom på dikeskanten. Allt det krattet, som växte på stengärdsgården, hade blivit brunt och blankt. Bokskogen långt borta stod och liksom svällde och blev tätare för varje ögonblick. Himmelen var hög och rent blå.',
  },
  {
    id: 'spegeln',
    title: 'Spegeln',
    source: NILS,
    text: 'Han ställde sig framför spegeln och slöt ögonen. Han öppnade dem först efter ett par minuter och väntade då, att det skulle ha gått över. Men det hade det inte, utan han var och förblev lika liten. Eljest var han alldeles sådan, som han hade varit förut. Det vita linhåret och fräknarna över näsan och lapparna på skinnbyxorna och stoppen på strumpan, alltsammans var sig likt, med undantag av att det hade blivit förminskat.',
  },
  {
    id: 'loften',
    title: 'Löften',
    source: NILS,
    text: 'Medan han sökte, grät han och bad och lovade allt tänkbart. Aldrig mer skulle han svika sitt ord till någon, aldrig mer skulle han vara elak, aldrig mer skulle han somna ifrån predikan. Om han bara finge bli människa igen, så skulle det bli en så präktig och snäll och lydig gosse av honom. Men vad han än lovade, så hjälpte det inte det minsta.',
  },
  {
    id: 'grasparven',
    title: 'Gråsparven',
    source: NILS,
    text: 'På den gamla ekbrädan, som låg framför förstudörren, hoppade en gråsparv. Han hade inte väl fått ögonen på pojken, förrän han ropade: "Tititt! Tititt! Se på Nils gåsapåg! Se på Tummetott! Se på Nils Holgersson Tummetott!"',
  },
  {
    id: 'smirre',
    title: 'Smirre räv',
    source: NILS,
    text: 'Smirre stod på bergskrönet lång i synen och såg ner på vildgässen. "Det här förföljandet kan du så gärna överge genast," sade han till sig själv. "Du kan inte klättra utför ett så tvärbrant berg, du kan inte simma i en så vild ström, och det finns inte nedanför berget den minsta strimma av land, som leder fram till sovplatsen. De där gässen är för kloka för dig. Bry dig aldrig mer om att jaga dem!"',
  },
  {
    id: 'lydia',
    title: 'Lydia simmar',
    source: LEKEN,
    text: 'Så böjde hon sig framöver och simmade ut på det smaragdklara djupet. Hon njöt av att känna vattnet bära sig — hon kände sig så lätt. Hon simmade lugnt och tyst. Hon såg inga abborrar i dag; annars brukade hon leka litet med dem ibland. En gång hade hon varit så nära att fånga en med handen, att hon stack sig på hans ryggfena.',
  },
]
