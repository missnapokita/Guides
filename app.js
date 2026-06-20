const HERO_API = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/hero-meta-final.json";
const BASE = "https://raw.githubusercontent.com/p3hndrx/MLBB-API/main/v1/";

let heroes = [];
let currentRole = "All";
let currentTab = "heroes";

const $ = id => document.getElementById(id);
const statusBox = $("status");
const heroGrid = $("heroGrid");
const searchInput = $("searchInput");

const buildRules = {
  "Assassin": ["Rapid Boots", "Blade of the Heptaseas", "Hunter Strike", "Blade of Despair", "Malefic Roar", "Immortality"],
  "Marksman": ["Swift Boots", "Corrosion Scythe", "Demon Hunter Sword", "Golden Staff", "Malefic Roar", "Wind of Nature"],
  "Mage": ["Arcane Boots", "Clock of Destiny", "Lightning Truncheon", "Genius Wand", "Holy Crystal", "Divine Glaive"],
  "Tank": ["Tough Boots", "Dominance Ice", "Athena's Shield", "Antique Cuirass", "Immortality", "Guardian Helmet"],
  "Fighter": ["Warrior Boots", "War Axe", "Bloodlust Axe", "Queen's Wings", "Blade of Despair", "Immortality"],
  "Support": ["Tough Boots", "Enchanted Talisman", "Fleeting Time", "Oracle", "Immortality", "Dominance Ice"]
};

const emblemRules = {
  "Assassin": "Assassin Emblem - Master Assassin + Killing Spree",
  "Marksman": "Marksman Emblem - Weapon Master + Quantum Charge",
  "Mage": "Mage Emblem - Bargain Hunter + Lethal Ignition",
  "Tank": "Tank Emblem - Tenacity + Brave Smite",
  "Fighter": "Fighter Emblem - Festival of Blood + Brave Smite",
  "Support": "Support Emblem - Pull Yourself Together + Focusing Mark"
};

const tierRules = {
  "S+": ["Assassin", "Marksman"],
  "S": ["Mage", "Fighter"],
  "A": ["Tank", "Support"],
  "B": []
};

function img(path){
  if(!path || path === "null.png") return "https://placehold.co/300x300/0f1512/00e676?text=MLBB";
  if(String(path).startsWith("http")) return path;
  return BASE + path;
}

function heroName(h){ return h.hero_name || h.name || "Unknown Hero"; }
function heroRole(h){ return h.class || h.role || "Unknown"; }
function heroLane(h){ return Array.isArray(h.laning) ? h.laning.filter(Boolean).join(", ") : (h.laning || "Unknown lane"); }
function heroSpeciality(h){ return Array.isArray(h.speciality) ? h.speciality.filter(Boolean).join(" • ") : (h.speciality || ""); }
function cleanDesc(text){ return String(text || "No description.").replace(/Skill terms[\s\S]*/i, "").trim(); }
function mainRole(h){
  const role = heroRole(h);
  return Object.keys(buildRules).find(r => role.toLowerCase().includes(r.toLowerCase())) || "Fighter";
}
function findHeroById(id){ return heroes.find(h => Number(h.mlid) === Number(id)); }
function relationImage(item){
  const h = findHeroById(item.heroid);
  return img(h?.hero_icon || h?.portrait || "");
}
function relationName(item){
  const h = findHeroById(item.heroid);
  return h ? heroName(h) : item.heroname;
}

async function loadData(){
  try{
    const res = await fetch(HERO_API);
    const json = await res.json();
    heroes = (json.data || []).filter(h => h.hero_name && h.hero_name !== "None");
    statusBox.textContent = `Loaded ${heroes.length} heroes from MLBB API.`;
  }catch(e){
    console.error(e);
    statusBox.textContent = "API failed to load. Check internet or GitHub raw access.";
    heroes = [];
  }

  renderAll();
}

function filteredHeroes(){
  const q = searchInput.value.toLowerCase().trim();
  return heroes.filter(h => {
    const matchSearch = heroName(h).toLowerCase().includes(q);
    const matchRole = currentRole === "All" || heroRole(h).toLowerCase().includes(currentRole.toLowerCase());
    return matchSearch && matchRole;
  });
}

function renderAll(){
  renderHeroes();
  renderBuilds();
  renderEmblems();
  renderCounters();
  renderCalculatorOptions();
  renderTierList();
}

function renderHeroes(){
  const list = filteredHeroes();
  if(!list.length){ heroGrid.innerHTML = `<div class="status">No heroes found.</div>`; return; }
  heroGrid.innerHTML = list.map(h => `
    <article class="hero-card">
      <div class="hero-cover"><img src="${img(h.portrait || h.hero_icon)}" alt="${heroName(h)}" loading="lazy"></div>
      <div class="hero-body">
        <div class="hero-title">
          <img class="mini-icon" src="${img(h.hero_icon || h.portrait)}" alt="${heroName(h)} icon" loading="lazy">
          <div><h3>${heroName(h)}</h3><div class="meta">${heroRole(h)} • ${heroLane(h)}</div></div>
        </div>
        <div class="tags">${heroSpeciality(h).split(" • ").filter(Boolean).map(s => `<span class="tag">${s}</span>`).join("")}</div>
        <div class="actions"><button class="primary" onclick="openHero('${h.mlid}')">Guide</button><button onclick="openRaw('${h.mlid}')">Raw</button></div>
      </div>
    </article>
  `).join("");
}

function renderBuilds(){
  const list = filteredHeroes().slice(0, 60);
  $("buildGrid").innerHTML = list.map(h => {
    const role = mainRole(h);
    return `<div class="info-card"><div class="hero-title"><img class="mini-icon" src="${img(h.hero_icon || h.portrait)}" loading="lazy"><div><h3>${heroName(h)}</h3><div class="meta">${role} Build</div></div></div><p>${buildRules[role].map(i => `• ${i}`).join("<br>")}</p></div>`;
  }).join("");
}

function renderEmblems(){
  const list = filteredHeroes().slice(0, 60);
  $("emblemGrid").innerHTML = list.map(h => {
    const role = mainRole(h);
    return `<div class="info-card"><div class="hero-title"><img class="mini-icon" src="${img(h.hero_icon || h.portrait)}" loading="lazy"><div><h3>${heroName(h)}</h3><div class="meta">${heroRole(h)}</div></div></div><p>${emblemRules[role]}</p></div>`;
  }).join("");
}

function renderCounters(){
  const list = filteredHeroes().slice(0, 30);
  $("counterGrid").innerHTML = list.map(h => `
    <div class="info-card">
      <div class="hero-title"><img class="mini-icon" src="${img(h.hero_icon || h.portrait)}" loading="lazy"><div><h3>${heroName(h)}</h3><div class="meta">Counters / Synergies</div></div></div>
      <h4>Counters</h4>
      <div class="relation-list">${(h.counters || []).slice(0,6).map(c => relationSmall(c)).join("")}</div>
      <h4>Synergies</h4>
      <div class="relation-list">${(h.synergies || []).slice(0,6).map(s => relationSmall(s)).join("")}</div>
    </div>
  `).join("");
}

function relationSmall(item){
  return `<div class="relation-card"><img src="${relationImage(item)}" loading="lazy"><b>${relationName(item)}</b></div>`;
}

function renderCalculatorOptions(){
  const select = $("calcHero");
  select.innerHTML = heroes.map(h => `<option value="${h.mlid}">${heroName(h)}</option>`).join("");
}

function renderTierList(){
  const html = Object.entries(tierRules).map(([tier, roles]) => {
    let list = roles.length ? heroes.filter(h => roles.some(r => heroRole(h).includes(r))).slice(0,18) : heroes.slice(0,12);
    return `<div class="tier-row"><h3>${tier} Tier</h3><div class="tier-heroes">${list.map(h => `<div class="tier-hero"><img src="${img(h.hero_icon || h.portrait)}" loading="lazy"><span>${heroName(h)}</span></div>`).join("")}</div></div>`;
  }).join("");
  $("tierGrid").innerHTML = html;
}

function openHero(id){
  const h = heroes.find(x => String(x.mlid) === String(id));
  if(!h) return;
  const role = mainRole(h);
  $("modalContent").innerHTML = `
    <div class="modal-head">
      <img class="modal-portrait" src="${img(h.portrait || h.hero_icon)}" alt="${heroName(h)}">
      <div>
        <h2>${heroName(h)}</h2>
        <p class="meta">${heroRole(h)} • ${heroLane(h)}</p>
        <div class="tags">${heroSpeciality(h).split(" • ").filter(Boolean).map(s => `<span class="tag">${s}</span>`).join("")}</div>
        <p><b>Best Build</b><br>${buildRules[role].map(i => `• ${i}`).join("<br>")}</p>
        <p><b>Best Emblem</b><br>${emblemRules[role]}</p>
      </div>
    </div>
    <h3>Skills</h3>
    <div class="skill-list">${(h.skills || []).map(skill => `
      <div class="skill-card">
        <img src="${img(skill.skill_icon)}" alt="${skill.skill_name}" loading="lazy">
        <div>
          <h4>${skill.skill_name}</h4>
          <div class="meta">${skill.type} • CD: ${skill.cooldown} • Mana: ${skill.manacost}</div>
          <p>${cleanDesc(skill.description).slice(0,650)}${cleanDesc(skill.description).length > 650 ? "..." : ""}</p>
        </div>
      </div>
    `).join("")}</div>
    <h3>Counters</h3>
    <div class="relation-list">${(h.counters || []).map(c => relationSmall(c)).join("")}</div>
    <h3>Synergies</h3>
    <div class="relation-list">${(h.synergies || []).map(s => relationSmall(s)).join("")}</div>
  `;
  $("modal").classList.add("show");
}

function openRaw(id){
  const h = heroes.find(x => String(x.mlid) === String(id));
  $("modalContent").innerHTML = `<h2>${heroName(h)}</h2><pre style="white-space:pre-wrap;background:#060908;border:1px solid #1b4e31;border-radius:16px;padding:12px;overflow:auto">${JSON.stringify(h,null,2)}</pre>`;
  $("modal").classList.add("show");
}

$("modalClose").onclick = () => $("modal").classList.remove("show");
$("modal").onclick = e => { if(e.target.id === "modal") $("modal").classList.remove("show"); };
searchInput.addEventListener("input", renderAll);

$("roleFilters").addEventListener("click", e => {
  if(!e.target.matches("button")) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");
  currentRole = e.target.dataset.role;
  renderAll();
});

$("tabs").addEventListener("click", e => {
  if(!e.target.matches("button")) return;
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  e.target.classList.add("active");
  currentTab = e.target.dataset.tab;
  $(currentTab).classList.add("active");
});

$("calcBtn").onclick = () => {
  const h = heroes.find(x => String(x.mlid) === String($("calcHero").value));
  const extra = Number($("extraPower").value || 0);
  const mult = Number($("multiplier").value || 1);
  const estimated = Math.round(extra * mult);
  $("calcResult").innerHTML = `<b>${heroName(h)}</b><br>Estimated skill bonus damage: <b>${estimated}</b><br>Formula: Extra Power × Multiplier`;
};

loadData();
