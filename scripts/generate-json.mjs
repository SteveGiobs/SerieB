// scripts/generate-json.mjs
//
// Scarica il CSV pubblicato dal Google Sheet (UNA sola scheda con TUTTE le
// partite di TUTTE le squadre: casa, trasf, sc1, sc2, pt1, pt2, data, ora,
// luogo) e rigenera da questo stesso foglio:
//   - partiteClassifica.json  -> TUTTE le partite (serve per la classifica generale)
//   - partiteCalendario.json  -> SOLO le partite della propria squadra
//
// Va eseguito con Node 18+ (fetch nativo incluso).

import fs from "fs";

// Incolla qui il link CSV pubblicato del tuo Google Sheet
// (File → Condividi → Pubblica sul web → scegli il foglio → formato CSV)
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS5zfIOPMDHUmjMnokA_S8C5spCAR8bKnGPNXuh_TCsgr5rMXkKaIqpe2RK2eatci9cKz8AukcCSOtC/pub?gid=108566343&single=true&output=csv";

// Nome esatto della tua squadra come compare nelle colonne casa/trasf del foglio
const SQUADRA_PRINCIPALE = "savona";

const CLASSIFICA_PATH = "partiteClassifica.json";
const CALENDARIO_PATH = "partiteCalendario.json";

// Colonne attese nel foglio (header nella prima riga, questi nomi esatti):
// casa,trasf,sc1,sc2,pt1,pt2,data,ora,luogo
// Per le partite non ancora giocate lascia sc1/sc2/pt1/pt2 vuoti.
// Parser CSV che gestisce correttamente i campi tra virgolette (es. "Campo
// Fontanassa, Savona"), come li esporta Google Sheets quando un campo
// contiene una virgola. Un semplice split(",") romperebbe su questi campi.
function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (insideQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          // virgolette raddoppiate dentro un campo quotato -> una virgoletta letterale
          current += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      insideQuotes = true;
    } else if (char === ",") {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(text) {
  const lines = text.trim().split("\n").map((l) => l.replace(/\r$/, ""));
  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

// Cella vuota -> null (sia partiteClassifica che partiteCalendario
// controllano già p.sc1 === null nel loro codice, quindi usiamo null
// ovunque per coerenza)
function toNumberOrNull(value) {
  if (value === "" || value === undefined) return null;
  return Number(value);
}

// Converte una data scritta in formato italiano GG/MM/AAAA (come la esporta
// di default Google Sheets) nel formato ISO AAAA-MM-GG, l'unico che
// new Date(...) interpreta sempre allo stesso modo in ogni browser.
// Se la cella è già in formato ISO, la lascia invariata.
function toISODate(value) {
  if (!value) return value;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return value; // già ISO o formato non riconosciuto: non tocco
  const [, giorno, mese, anno] = match;
  return `${anno}-${mese.padStart(2, "0")}-${giorno.padStart(2, "0")}`;
}

function isPropriaSquadra(row) {
  const target = SQUADRA_PRINCIPALE.toLowerCase();
  return (
    (row.casa || "").toLowerCase() === target ||
    (row.trasf || "").toLowerCase() === target
  );
}

async function main() {
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) {
    throw new Error(`Impossibile scaricare il CSV: ${res.status} ${res.statusText}`);
  }
  const csvText = await res.text();
  const rows = parseCSV(csvText);

  // Classifica: TUTTE le partite, di tutte le squadre
  const classifica = rows.map((r) => ({
    casa: r.casa,
    trasf: r.trasf,
    sc1: toNumberOrNull(r.sc1),
    sc2: toNumberOrNull(r.sc2),
    pt1: toNumberOrNull(r.pt1),
    pt2: toNumberOrNull(r.pt2),
  }));

  // Calendario: SOLO le partite in cui gioca la squadra principale
  const calendario = rows
    .filter(isPropriaSquadra)
    .map((r) => ({
      casa: r.casa,
      trasf: r.trasf,
      sc1: toNumberOrNull(r.sc1),
      sc2: toNumberOrNull(r.sc2),
      data: toISODate(r.data),
      ora: r.ora,
      luogo: r.luogo,
    }));

  fs.writeFileSync(CLASSIFICA_PATH, JSON.stringify(classifica, null, 2));
  fs.writeFileSync(CALENDARIO_PATH, JSON.stringify(calendario, null, 2));

  console.log(
    `Scritte ${classifica.length} partite in ${CLASSIFICA_PATH} e ${calendario.length} partite (solo ${SQUADRA_PRINCIPALE}) in ${CALENDARIO_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
