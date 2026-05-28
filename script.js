const n = 25;
const m = 65;
let updatesk = {};
let updatesv = {};
let updatesl = {};

let k = ['Mit jelent a likviditás?', 'Mi a nettó jövedelem?', 'Mi a THM szerepe?', 'Mi az infláció?', 'Mi a diverzifikáció?', 'Mit jelent a fedezet hitelfelvételnél?', 'Mi a kötvény?', 'Mit nevezünk passzív jövedelemnek?', 'Mi a költségvetési hiány?', 'Mi az árfolyamkockázat?', 'Mi a részvény?', 'Mit jelent az amortizáció?', 'Mi a vésztartalék célja?', 'Mit jelent a kamatos kamat?', 'Mi a biztosítási önrész?', 'Mit jelent a hitelképesség?', 'Mi a pénzügyi tudatosság?', 'Mi a bruttó jövedelem?', 'Melyik hosszú távú befektetés?', 'Mi az adó?', 'Mi a hitel futamideje?', 'Mit jelent a fizetőképesség?', 'Mi a bankkártya PIN-kód szerepe?', 'Mi a fogyasztóvédelem célja?', 'Mit jelent a megtakarítás?', 'Mi a likvid eszköz?', 'Mi a hozam?', 'Mit jelent a pénzügyi kockázat?', 'Mi a fix költség?', 'Mi a változó költség?', 'Mi a bankszámlakivonat?', 'Mit jelent a pénzügyi célkitűzés?', 'Mi a hitelkamat?', 'Mi a deviza?', 'Mit jelent a pénz vásárlóereje?', 'Mi a pénzügyi szolgáltató?', 'Mi a bankszámla egyik előnye?', 'Mi a befektetés célja?', 'Mit jelent az online csalás veszélye?', 'Mi a pénzügyi fogalom definíciójának szerepe?'];
let j = 0

for (let i = n; i < m; i++) {
    updatesk[i] = k[j];
    j++;
}

let v = ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd'];
j = 0

for (let i = n; i < m; i++) {
    updatesv[i] = v[j];
    j++;
}

let l = ['A pénzügyi kötelezettségek időbeni teljesítésének képessége\\\\A vállalkozás nyeresége\\\\A hitel kamata\\\\Az infláció mértéke', 'Megtakarítás összege\\\\Bruttó jövedelem levonások után\\\\Hitelösszeg\\\\Adómentes jövedelem', 'A banki kamat eltörlése\\\\A részvényárfolyam mérése\\\\A hitel teljes költségének összehasonlítása\\\\Az infláció kiszámítása', 'Az adók csökkenése\\\\A hitelkamat megszűnése\\\\A munkabér növekedése\\\\Az árak általános emelkedése', 'Befektetések megosztása\\\\Hitel lezárása\\\\Adófizetés\\\\Készpénzfelvétel', 'Banki reklám\\\\Biztosíték a hitel visszafizetésére\\\\Adójóváírás\\\\Kamatkedvezmény', 'Tulajdonrészt megtestesítő értékpapír\\\\Biztosítás\\\\Hitelviszonyt megtestesítő értékpapír\\\\Bankszámla', 'Rendszeres munkabér\\\\Hitel\\\\Adó\\\\Munka nélkül vagy korábbi befektetésből származó bevétel', 'Kiadás > bevétel\\\\Bevétel > kiadás\\\\Megtakarítás\\\\Nullás egyenleg', 'Biztosítási kockázat\\\\Devizaárfolyam változásából eredő kockázat\\\\Adókockázat\\\\PIN-kód elvesztése', 'Bankjegy\\\\Hitel\\\\Tulajdonrészt megtestesítő értékpapír\\\\Biztosítás', 'Hitelkamat\\\\Adónem\\\\Bankszámla típusa\\\\Eszközök értékcsökkenése', 'Váratlan kiadások fedezése\\\\Nyereség növelése\\\\Hitel felvétele\\\\Adócsökkentés', 'Kamatmentes hitel\\\\A kamat után is kamat jár\\\\Adókedvezmény\\\\Fix költség', 'A biztosító nyeresége\\\\Adó\\\\A káresemény költségének az ügyfél által viselt része\\\\Bankköltség', 'Bankszámlaegyenleg\\\\Kamatfajta\\\\Részvényérték\\\\Visszafizetési képesség megítélése', 'Felelős pénzügyi döntések képessége\\\\Sok pénz birtoklása\\\\Hitelkeret\\\\Adófizetés', 'Levonások utáni jövedelem\\\\Levonások előtti jövedelem\\\\Megtakarítás\\\\Nyereség', 'Buszjegy\\\\Kávé\\\\Részvényportfólió\\\\Villanyszámla', 'Önkéntes befizetés\\\\Banki díj\\\\Biztosítás\\\\Kötelező közteher', 'A hitel visszafizetésére rendelkezésre álló idő\\\\Kamat összege\\\\Hitel díja\\\\Bankszámla típusa', 'Adófizetés\\\\Képesség a kötelezettségek teljesítésére\\\\Részvényvásárlás\\\\Kamatcsökkentés', 'Kártyadísz\\\\Adóazonosító\\\\Tulajdonos azonosítása\\\\Bankszámlaszám', 'Áremelés\\\\Adóztatás\\\\Banknyereség\\\\Fogyasztói jogok védelme', 'Pénz félretétele jövőbeli célokra\\\\Minden pénz elköltése\\\\Hitel\\\\Adó', 'Biztosítás\\\\Gyorsan pénzzé tehető eszköz\\\\Hitel\\\\Fix költség', 'Adó\\\\Kamatmentesség\\\\Befektetés nyeresége\\\\Hitelkeret', 'Biztos nyereség\\\\Adómentesség\\\\Készpénz\\\\Veszteség lehetősége', 'Rendszeresen azonos összegű kiadás\\\\Egyszeri kiadás\\\\Változó költség\\\\Megtakarítás', 'Mindig azonos kiadás\\\\Felhasználástól függő kiadás\\\\Adó\\\\Kamat', 'Hitel\\\\Adóbevallás\\\\Számlaforgalmi összesítő\\\\Részvény', 'Adófizetés\\\\Kamat\\\\Hitel\\\\Tervezett pénzügyi eredmény vagy cél', 'A hitel használatának ára\\\\Adó\\\\Biztosítás\\\\Bankjegy', 'Készpénz\\\\Külföldi pénznem\\\\Hitel\\\\Adó', 'A pénz színe\\\\Bankjegy mérete\\\\Mit lehet a pénzből megvásárolni\\\\Hitelkeret', 'Adóhivatal\\\\Iskola\\\\Bolt\\\\Pénzügyi termékeket kínáló intézmény', 'Biztonságos pénzkezelés\\\\Infláció megszüntetése\\\\Adómentesség\\\\Nyereség garanciája', 'Pénz elköltése\\\\Hozam és értéknövekedés elérése\\\\Adófizeté\\\\Hitelkiváltás', 'Kamatcsökkenés\\\\Adóvisszatérítés\\\\Pénzügyi adatok illetéktelen megszerzése\\\\Részvénynyereség', 'Szórakoztatás\\\\Adók emelése\\\\Bankreklám\\\\A pontos megértés és helyes használat segítése'];
j = 0

for (let i = n; i < m; i++) {
    updatesl[i] = l[j];
    j++;
}

console.log(updatesk);
console.log(updatesv);
console.log(updatesl);