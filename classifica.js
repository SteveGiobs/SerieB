/* ==== CARICO I LOGHI ==== */
const LOGHI = {
  savona: "Logo_SavonaBianco.jpg",
	ivrea: "Logo_Ivrea.jpg",
	biella: "Logo_Biella.jpg",
	mauro: "Logo_SanMauro.jpg",
	rho: "Logo_Rho.jpg",
	parabiago: "Logo_Parabiago.jpg",
	cernusco: "Logo_Cernusco.jpg",
	varese: "Logo_Varese.jpg",
	milano: "Logo_CusMilano.jpg",
	sondrio: "RLogo_Sondrio.jpg"
};

/* ==== NOMI COMPLETI==== */
const nomiSquadre = {
  savona: "Savona Rugby",
	ivrea: "Ivrea Rugby Club",
	biella: "Biella Rugby Club",
	mauro: "Rugby San Mauro",
	rho: "Rugby Rho",
	parabiago: "Rugby Parabiago",
	cernusco: "Rugby Cernusco",
	varese: "Rugby Varese",
	milano: "CUS Milano Rugby",
	sondrio: "Rugby Sondrio"
  
};

/* ==========================================================
   INIZIALIZZA SQUADRE
========================================================== */
const squadre = {};

function aggiungiSquadra(nome) {
  if (!squadre[nome]) {
    squadre[nome] = {
      nome: nomiSquadre[nome.toLowerCase()],
      logo: LOGHI[nome.toLowerCase()] || "",
      giocate: 0,
      vinte: 0,
      pareggiate: 0,
      perse: 0,
      punti: 0,
      fatti: 0,
      subiti: 0,
      diff: 0
    };
  }
}

fetch('https://SteveGiobs.github.io/SerieB/partiteClassifica.json')
  .then(res => res.json())
  .then(partiteCalendario => {
    partiteCalendario.forEach(p => {
      console.log(p.casa, p.trasf, p.sc1, p.sc2, p.pt1, p.pt2);
    })

        partiteCalendario.forEach(p => {
          aggiungiSquadra(p.casa);
          aggiungiSquadra(p.trasf);

          // se la partita non è giocata, salta
          if (p.sc1 === null || p.sc2 === null || p.sc1 === "" || p.sc2 === "") return;

          const home = squadre[p.casa];
          const away = squadre[p.trasf];


          home.giocate++;
          away.giocate++;

          home.fatti += p.sc1;
          home.subiti += p.sc2;
          away.fatti += p.sc2;
          away.subiti += p.sc1;

          if (p.sc1 > p.sc2) {
            home.vinte++;
            away.perse++;
            home.punti += p.pt1;
          away.punti += p.pt2;
          } else if (p.sc1 < p.sc2) {
            away.vinte++;
            home.perse++;
          home.punti += p.pt1;
            away.punti += p.pt2;
          } else {
            home.pareggiate++;
            away.pareggiate++;
            home.punti += 2;
            away.punti += 2;
          }
        });

        /* ==========================================================
          CALCOLA DIFFERENZE & ORDINA CLASSIFICA
        ========================================================== */
        Object.values(squadre).forEach(s => {
          s.diff = s.fatti - s.subiti;
        });

        const classifica = Object.values(squadre)
          .sort((a, b) => b.punti - a.punti || b.diff - a.diff || b.fatti - a.fatti);

        /* ==========================================================
          GENERA HTML DELLA CLASSIFICA
        ========================================================== */
        const tab = document.getElementById("classifica");

        classifica.forEach((s, i) => {


          tab.innerHTML += `
            <div class="classifica-row">
              <div class="posizione">${i + 1}</div>
              <div class="logo"><img src="${s.logo}"></div>
              <div class="squadra">${s.nome.toUpperCase()}</div>
              <div class="dati">${s.punti} pt</div>
              <div class="dati extra">${s.vinte}V / ${s.pareggiate}P / ${s.perse}S</div>
              <div class="dati extra">Diff: ${s.diff}</div>
            </div>
          `;
        })
  });
