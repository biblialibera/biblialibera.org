// Extracts the full book list + review status the landing page shows
// (Status honesto section): every book of the Catholic canon (73 books,
// deuterocanon interleaved in the traditional order — the project is
// ecumenical, this is the superset), cross-referenced against the
// `biblialibera` package's manifest for translation status. Books the
// manifest doesn't carry yet are marked "not-translated". Re-run after
// updating the `biblialibera` dependency:
//
//   node scripts/extract-book-status.mjs
//
// Book order, names (pt-BR) and canon classification are canon facts, not
// translation progress, so they're a fixed constant here rather than synced
// from anywhere: matches the Catholic edition in sources/canon.json +
// languages/pt/book-names.json in the open-bible repo.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };

// [osis, name, abbrev], in Catholic-edition order; canon assigned per group below.
const PROTOCANONICAL_BEFORE_DEUTERO = [
  ['Gen', 'Gênesis', 'Gn'], ['Exod', 'Êxodo', 'Êx'], ['Lev', 'Levítico', 'Lv'],
  ['Num', 'Números', 'Nm'], ['Deut', 'Deuteronômio', 'Dt'], ['Josh', 'Josué', 'Js'],
  ['Judg', 'Juízes', 'Jz'], ['Ruth', 'Rute', 'Rt'], ['1Sam', '1 Samuel', '1Sm'],
  ['2Sam', '2 Samuel', '2Sm'], ['1Kgs', '1 Reis', '1Rs'], ['2Kgs', '2 Reis', '2Rs'],
  ['1Chr', '1 Crônicas', '1Cr'], ['2Chr', '2 Crônicas', '2Cr'], ['Ezra', 'Esdras', 'Ed'],
  ['Neh', 'Neemias', 'Ne'],
];

const DEUTERO_1 = [
  ['Tob', 'Tobias', 'Tb'], ['Jdt', 'Judite', 'Jt'],
];

const PROTOCANONICAL_ESTHER = [['Esth', 'Ester', 'Et']];

const DEUTERO_2 = [
  ['1Macc', '1 Macabeus', '1Mc'], ['2Macc', '2 Macabeus', '2Mc'],
];

const PROTOCANONICAL_WISDOM_ONWARD = [
  ['Job', 'Jó', 'Jó'], ['Ps', 'Salmos', 'Sl'], ['Prov', 'Provérbios', 'Pv'],
  ['Eccl', 'Eclesiastes', 'Ec'], ['Song', 'Cânticos', 'Ct'],
];

const DEUTERO_3 = [
  ['Wis', 'Sabedoria', 'Sb'], ['Sir', 'Eclesiástico', 'Eclo'],
];

const PROTOCANONICAL_ISAIAH_ONWARD = [
  ['Isa', 'Isaías', 'Is'], ['Jer', 'Jeremias', 'Jr'], ['Lam', 'Lamentações', 'Lm'],
];

const DEUTERO_4 = [['Bar', 'Baruc', 'Br']];

const PROTOCANONICAL_EZEKIEL_ONWARD = [
  ['Ezek', 'Ezequiel', 'Ez'], ['Dan', 'Daniel', 'Dn'], ['Hos', 'Oseias', 'Os'],
  ['Joel', 'Joel', 'Jl'], ['Amos', 'Amós', 'Am'], ['Obad', 'Obadias', 'Ob'],
  ['Jonah', 'Jonas', 'Jn'], ['Mic', 'Miqueias', 'Mq'], ['Nah', 'Naum', 'Na'],
  ['Hab', 'Habacuque', 'Hc'], ['Zeph', 'Sofonias', 'Sf'], ['Hag', 'Ageu', 'Ag'],
  ['Zech', 'Zacarias', 'Zc'], ['Mal', 'Malaquias', 'Ml'],
];

const NEW_TESTAMENT = [
  ['Matt', 'Mateus', 'Mt'], ['Mark', 'Marcos', 'Mc'], ['Luke', 'Lucas', 'Lc'],
  ['John', 'João', 'Jo'], ['Acts', 'Atos', 'At'], ['Rom', 'Romanos', 'Rm'],
  ['1Cor', '1 Coríntios', '1Co'], ['2Cor', '2 Coríntios', '2Co'], ['Gal', 'Gálatas', 'Gl'],
  ['Eph', 'Efésios', 'Ef'], ['Phil', 'Filipenses', 'Fp'], ['Col', 'Colossenses', 'Cl'],
  ['1Thess', '1 Tessalonicenses', '1Ts'], ['2Thess', '2 Tessalonicenses', '2Ts'],
  ['1Tim', '1 Timóteo', '1Tm'], ['2Tim', '2 Timóteo', '2Tm'], ['Titus', 'Tito', 'Tt'],
  ['Phlm', 'Filemom', 'Fm'], ['Heb', 'Hebreus', 'Hb'], ['Jas', 'Tiago', 'Tg'],
  ['1Pet', '1 Pedro', '1Pe'], ['2Pet', '2 Pedro', '2Pe'], ['1John', '1 João', '1Jo'],
  ['2John', '2 João', '2Jo'], ['3John', '3 João', '3Jo'], ['Jude', 'Judas', 'Jd'],
  ['Rev', 'Apocalipse', 'Ap'],
];

const CANON = [
  ...PROTOCANONICAL_BEFORE_DEUTERO.map(entry => [...entry, 'AT']),
  ...DEUTERO_1.map(entry => [...entry, 'DC']),
  ...PROTOCANONICAL_ESTHER.map(entry => [...entry, 'AT']),
  ...DEUTERO_2.map(entry => [...entry, 'DC']),
  ...PROTOCANONICAL_WISDOM_ONWARD.map(entry => [...entry, 'AT']),
  ...DEUTERO_3.map(entry => [...entry, 'DC']),
  ...PROTOCANONICAL_ISAIAH_ONWARD.map(entry => [...entry, 'AT']),
  ...DEUTERO_4.map(entry => [...entry, 'DC']),
  ...PROTOCANONICAL_EZEKIEL_ONWARD.map(entry => [...entry, 'AT']),
  ...NEW_TESTAMENT.map(entry => [...entry, 'NT']),
];

const statusByBook = new Map(ptManifest.books.map((b) => [b.book, b.status.formal]));

const rows = CANON.map(([osis, name, abbrev, canon]) => ({
  book: name,
  ref: abbrev,
  canon,
  status: statusByBook.get(osis) ?? 'not-translated',
}));

const translated = rows.filter((r) => r.status !== 'not-translated').length;

const outPath = fileURLToPath(new URL('../src/data/books.json', import.meta.url));
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
console.log(`wrote ${outPath} (${rows.length} books, ${translated} translated)`);
