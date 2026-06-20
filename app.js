const API_URL = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/hero-meta-final.json";

let heroes = [];
let currentRole = "All";

const heroGrid = document.getElementById("heroGrid");
const searchInput = document.getElementById("searchInput");

async function loadHeroes() {
  heroGrid.innerHTML = "<p class='loading'>Loading heroes...</p>";

  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    heroes = json.data || json || [];
    renderHeroes();
  } catch (e) {
    console.log(e);
    heroes = fallbackHeroes();
    renderHeroes();
  }
}

function renderHeroes() {
  const search = searchInput.value.toLowerCase();

  const filtered = heroes.filter(hero => {
    const name = getName(hero).toLowerCase();
    const role = getRole(hero);

    const matchSearch = name.includes(search);
    const matchRole = currentRole === "All" || role.toLowerCase().includes(currentRole.toLowerCase());

    return matchSearch && matchRole;
  });

  if (filtered.length === 0) {
    heroGrid.innerHTML = "<p class='loading'>No hero found.</p>";
    return;
  }

  heroGrid.innerHTML = filtered.map((hero, index) => `
    <div class="card">
      <h3>${getName(hero)}</h3>
      <div class="role">${getRole(hero)}</div>
      <button onclick="openHero(${heroes.indexOf(hero)})">View Guide</button>
    </div>
  `).join("");
}

function openHero(index) {
  const hero = heroes[index];

  document.getElementById("modalContent").innerHTML = `
    <h2>${getName(hero)}</h2>
    <p class="role">${getRole(hero)}</p>

    <h3>Hero Guide</h3>
    <div class="stat"><b>Playstyle:</b> ${getRole(hero)} type hero. Use proper positioning and timing.</div>
    <div class="stat"><b>Best For:</b> Ranked games, team fights, and counter pick strategy.</div>
    <div class="stat"><b>Tip:</b> Study the hero stats, skills, and item synergy before using in match.</div>

    <h3>Raw Data</h3>
    <pre>${JSON.stringify(hero, null, 2)}</pre>
  `;

  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function filterRole(role) {
  currentRole = role;
  renderHeroes();
}

function getName(hero) {
  return hero.name || hero.hero_name || hero.heroName || hero.title || "Unknown Hero";
}

function getRole(hero) {
  if (Array.isArray(hero.role)) return hero.role.join(", ");
  if (Array.isArray(hero.roles)) return hero.roles.join(", ");
  return hero.role || hero.roles || hero.type || "Unknown Role";
}

searchInput.addEventListener("input", renderHeroes);

function fallbackHeroes() {
  return [
    { name: "Layla", role: "Marksman" },
    { name: "Miya", role: "Marksman" },
    { name: "Alucard", role: "Fighter" },
    { name: "Tigreal", role: "Tank" },
    { name: "Eudora", role: "Mage" },
    { name: "Saber", role: "Assassin" },
    { name: "Rafaela", role: "Support" }
  ];
}

loadHeroes();
