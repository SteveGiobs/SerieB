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

/* ==== GENERAZIONE CARD ==== */
const container = document.getElementById("matches");
let nextFound = false;
fetch('https://SteveGiobs.github.io/SerieB/partiteCalendario.json')
  .then(res => res.json())
  .then(partiteCalendario => {
    partiteCalendario.forEach(p => {
      console.log(p.casa, p.trasf, p.sc1, p.sc2, p.data, p.ora, p.luogo);

      const nonGiocata =
        p.sc1 === null || p.sc1 === "" || p.sc1 === -1 ||
        p.sc2 === null || p.sc2 === "" || p.sc2 === -1;

      let scoreHTML = nonGiocata ?
        `<div class='score'>
          <span class='versus'>VS</span>
        </div>` :
        `<div class='score'>
          <span>${p.sc1}</span>
            <span class='dash'>–</span>
          <span>${p.sc2}</span>
        </div>`;

      const home = p.casa.toLowerCase();
      const away = p.trasf.toLowerCase();
      const logoHome = LOGHI[home] || "";
      const logoAway = LOGHI[away] || "";
      const nomeHome = nomiSquadre[home];
      const nomeAway = nomiSquadre[away];

      const resHome = nonGiocata ? "" :
        (p.sc1 > p.sc2 ? "VINCENTE" : (p.sc1 < p.sc2 ? "PERDENTE" : "PAREGGIO"));
      const resAway = nonGiocata ? "" :
        (p.sc2 > p.sc1 ? "VINCENTE" : (p.sc2 < p.sc1 ? "PERDENTE" : "PAREGGIO"));

      let badge = "";
      if (nonGiocata && !nextFound) {
        badge = `<span class='future-badge'>Prossima partita</span>`;
        nextFound = true;
      }

      container.innerHTML += `
        <div class="match-card ${nonGiocata ? "future-match" : ""}">
          <div class="match-main">
            <div class="team home">
              <span class="name">${nomeHome.toUpperCase()} </span>
              <img src="${logoHome}">
              ${!nonGiocata ? `<span class='result ${resHome}'>${resHome.toUpperCase()}</span>` : ""}
            </div>

            <div class="center-block">
              ${badge}
              ${scoreHTML}
            </div>

            <div class="team away">
              <span class="name">${nomeAway.toUpperCase()}</span>
              <img src="${logoAway}">
              ${!nonGiocata ? `<span class='result ${resAway}'>${resAway.toUpperCase()}</span>` : ""}
            </div>
          </div>

          <div class="match-footer">
            <div class="item">📅 ${new Date(p.data).toLocaleDateString("it-IT")}</div>
            <div class="item">🕒 ${p.ora}</div>
            <div class="item">📍 ${p.luogo}</div>
          </div>
        </div>
      `;
})

});
