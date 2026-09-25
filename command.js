(function () {
  "use strict";
  const D = window.KRL;
  const app = document.getElementById("app");
  const crumbEl = document.getElementById("crumb");
  const overlay = document.getElementById("search-overlay");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const PAGE = 24;
  const MEDIA_CONNECT = "https://krl-media-connect.vercel.app/";

  const I18N = {
    en: {
      notice: "Prototype book for interface testing. Not live programme statistics.",
      find: "Find farmer, farm, AC, team",
      command: "Command",
      geography: "Geography",
      teams: "Teams",
      agents: "Agents",
      farmers: "Farmers",
      farms: "Farms",
      activity: "Activity",
      media: "Media",
      reports: "Reports",
      product: "KRL Teams",
      know_more: "Know more",
    },
    bn: {
      notice: "ইন্টারফেস পরীক্ষার প্রোটোটাইপ খাতা. চালু কর্মসূচির পরিসংখ্যান নয়.",
      find: "কৃষক, খামার, কেন্দ্র, দল খুঁজুন",
      command: "কমান্ড",
      geography: "ভূগোল",
      teams: "দল",
      agents: "এজেন্ট",
      farmers: "কৃষক",
      farms: "খামার",
      activity: "কাজ",
      media: "মিডিয়া",
      reports: "প্রতিবেদন",
      product: "কেআরএল টিমস",
      know_more: "আরও জানুন",
    },
  };

  function lang() {
    try { return localStorage.getItem("krl-lang") || "en"; } catch (_) { return "en"; }
  }

  function t(key) {
    return (I18N[lang()] || I18N.en)[key] || I18N.en[key] || key;
  }

  function applyLang() {
    const L = lang();
    document.documentElement.lang = L;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (I18N[L] && I18N[L][key]) el.textContent = I18N[L][key];
    });
    document.querySelectorAll(".lang button").forEach((b) => {
      b.setAttribute("aria-pressed", b.dataset.lang === L ? "true" : "false");
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function href(path, params) {
    const q = params && Object.keys(params).length
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return "#/" + path.replace(/^\//, "") + q;
  }

  function parse() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const [path, qs] = raw.split("?");
    const parts = path.split("/").filter(Boolean);
    const params = Object.fromEntries(new URLSearchParams(qs || ""));
    return { parts, params };
  }

  function nameOf(type, id) {
    if (type === "district") return (D.byId(D.DISTRICTS, id) || {}).name || id;
    if (type === "ac") return (D.byId(D.ACS, id) || {}).name || id;
    if (type === "team") return (D.byId(D.TEAMS, id) || {}).name || id;
    if (type === "agent") return (D.byId(D.AGENTS, id) || {}).code || id;
    if (type === "farmer") return (D.byId(D.FARMERS, id) || {}).name || id;
    if (type === "farm") return (D.byId(D.FARMS, id) || {}).name || id;
    return id;
  }

  function crumb(items) {
    crumbEl.innerHTML = items.map((it, i) => {
      const last = i === items.length - 1;
      return last
        ? `<span aria-current="page">${esc(it.label)}</span>`
        : `<a href="${it.href}">${esc(it.label)}</a><span aria-hidden="true">/</span>`;
    }).join("");
  }

  function stageLabel(id) {
    const s = D.STAGES.find((x) => x.id === id);
    return s ? (lang() === "bn" ? s.bn : s.label) : id;
  }

  function statusBadge(status) {
    const map = { attention: "warn", completed: "ok", in_progress: "hold", blocked: "warn" };
    const cls = map[status] || "";
    const label = (D.STATUSES.find((s) => s.id === status) || { label: status }).label;
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  }

  function teamRegion(team) {
    return (team.districts || []).map((id) => nameOf("district", id)).join(", ");
  }


  function teamIdentity(team, extra) {
    if (!team || team.placeholder || !team.logo) return "";
    return '<span class="tid"><img src="' + esc(team.logo) + '" alt="' + esc(team.name) + ' official mark"><span><b>' + esc(team.name) + "</b><small>" + esc(extra || teamRegion(team)) + "</small></span></span>";
  }

  function teamMark(team) {
    if (!team || team.placeholder || !team.logo) return "";
    return '<img src="' + esc(team.logo) + '" alt="' + esc(team.name) + ' official mark">';
  }

  function supportPeople(farm) {
    return (farm.support || []).filter((p) => p.name && !/not assigned|pending/i.test(p.name));
  }

  function socialChannels(farm) {
    return ((farm.social && farm.social.channels) || []).filter((c) => c.url);
  }

  function smartRows(farm) {
    if (!farm.smart) return [];
    return D.SMART_CATS.filter((c) => {
      const row = farm.smart[c.id];
      return row && row.status !== "not_started" && (row.pct > 0 || row.evidence > 0);
    }).map((c) => Object.assign({ cat: c }, farm.smart[c.id]));
  }

  function hasAuthoredJourney(farm) {
    return !!(farm.journey && farm.journey.some((j) => j.date && j.note && j.note !== "Prototype milestone."));
  }

  function farmAvailableTabs(farm) {
    const tabs = [["overview", "Overview"]];
    if (hasAuthoredJourney(farm)) tabs.push(["journey", "Farm journey"]);
    if (smartRows(farm).length) tabs.push(["smart", "Smart farming"]);
    if (farm.lastVisit || (farm.plots && farm.plots.length)) tabs.push(["monitor", "Monitoring"]);
    if ((farm.evidence || []).length) tabs.push(["media", "Media"]);
    if (supportPeople(farm).length) tabs.push(["people", "People and support"]);
    if (socialChannels(farm).length) tabs.push(["social", "Social presence"]);
    return tabs;
  }

  function mediaConnectCta() {
    return `<aside class="know-more">
      <figure><img src="images/banner.jpg" alt=""></figure>
      <div>
        <p class="sec-k">KRL Media Connect</p>
        <h2>More stories, photographs and programme coverage</h2>
        <p>The independent Media Connect archive holds the launch essay, session film and press record. KRL Teams stays here.</p>
        <a class="know-more-link" href="${MEDIA_CONNECT}" target="_blank" rel="noopener noreferrer">
          <span>Know more</span>
          <span lang="bn">আরও জানুন</span>
        </a>
      </div>
    </aside>`;
  }

  function captionFor(kind, title) {
    const map = {
      irrigation: "Irrigation planning",
      soil: "Soil preparation",
      crop: "Crop development",
      pond: "Water management",
      visit: "Farm visit",
      training: "Training",
      photo: "Field activity",
      video: "Field walk-through",
    };
    return map[kind] || title || "Field activity";
  }

  function leagueBoard() {
    const rows = D.TEAMS.map(function (t) {
      const st = D.teamStats(t.id);
      return '<a class="reg-team" href="' + href("team/" + t.id) + '">' +
        teamMark(t) +
        "<div><strong>" + esc(t.name) + "</strong><span>" + esc(teamRegion(t)) + "</span></div>" +
        "<span>" + st.agents + " agents</span>" +
        "<span>" + st.farmers + " farmers · " + st.farms + " farms</span></a>";
    }).join("");
    return '<section class="league"><header class="sec-head"><p class="sec-k">Team network</p><h2>Team Register</h2>' +
      "<p>Fifteen official identities. Counts are prototype book volumes, not live enrolment.</p></header>" +
      '<div class="register-list">' + rows + "</div></section>";
  }

  function setNav(active) {
    document.querySelectorAll(".subnav a").forEach((a) => {
      const on = a.dataset.nav === active;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function pageSlice(list, page) {
    const p = Math.max(1, parseInt(page || "1", 10) || 1);
    const start = (p - 1) * PAGE;
    return { page: p, total: list.length, pages: Math.max(1, Math.ceil(list.length / PAGE)), rows: list.slice(start, start + PAGE) };
  }

  function pager(base, pageInfo, params) {
    if (pageInfo.pages <= 1) return "";
    const prev = Object.assign({}, params, { page: String(pageInfo.page - 1) });
    const next = Object.assign({}, params, { page: String(pageInfo.page + 1) });
    return `<div class="pager">
      <span>${pageInfo.total} records · page ${pageInfo.page} of ${pageInfo.pages}</span>
      <div>
        <button type="button" ${pageInfo.page <= 1 ? "disabled" : ""} data-go="${href(base, prev)}">Previous</button>
        <button type="button" ${pageInfo.page >= pageInfo.pages ? "disabled" : ""} data-go="${href(base, next)}">Next</button>
      </div>
    </div>`;
  }

  function filtersBar(params, extras) {
    const districts = D.DISTRICTS.map((d) => `<option value="${d.id}" ${params.district === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("");
    const teams = D.TEAMS.map((t) => `<option value="${t.id}" ${params.team === t.id ? "selected" : ""}>${esc(t.name)}</option>`).join("");
    const stages = D.STAGES.map((s) => `<option value="${s.id}" ${params.stage === s.id ? "selected" : ""}>${esc(s.label)}</option>`).join("");
    return `<form class="filters" data-filter>
      <label>District <select name="district"><option value="">All</option>${districts}</select></label>
      <label>Team <select name="team"><option value="">All</option>${teams}</select></label>
      <label>Stage <select name="stage"><option value="">All</option>${stages}</select></label>
      ${extras || ""}
      <label>Search <input name="q" value="${esc(params.q || "")}" placeholder="Name or code"></label>
    </form>`;
  }

  function empty(title, body) {
    return `<div class="state"><h2>${esc(title)}</h2><p>${esc(body)}</p></div>`;
  }

  function notFound(kind, id) {
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Not found" }]);
    return empty(kind + " not found", "No prototype record matches “" + id + "”. Return to the command centre and try another path.");
  }

  function viewCommand() {
    setNav("command");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Command Centre" }]);
    const s = D.programmeStats();
    const acts = D.ACTIVITIES.filter((a) => a.photo).slice(0, 5).map((a) => {
      const farm = D.byId(D.FARMS, a.farmId);
      const agent = D.byId(D.AGENTS, a.agentId);
      return `<article><a href="${href("farm/" + a.farmId)}"><img src="${esc(a.photo)}" alt="${esc(a.title)}"><div class="act-body"><strong>${esc(a.title)}</strong><p>${esc(farm ? farm.name : "")} · ${esc(agent ? agent.code : "")} · ${esc(a.date)}</p></div></a></article>`;
    }).join("");
    const flag = D.byId(D.FARMS, "maa-ganga");
    const flagTeam = flag ? D.byId(D.TEAMS, flag.teamId) : null;

    return `
      <header class="mast">
        <div>
          <p class="mast-k">Krishi Ratna League · Bharatiya Krishak Samaj</p>
          <h1>Smart Farming<br>Command Centre</h1>
          <p class="mast-place">West Bengal</p>
          <p class="mast-sub">State to constituency to team to agent to farmer to farm.</p>
        </div>
        <div class="mast-aside">
          <div><strong>Programme target</strong> ${s.targetFarmers.toLocaleString("en-IN")} farmers</div>
          <div><strong>State frame</strong> ${s.acs} assembly constituencies · ${s.teams} official teams</div>
          <div><strong>Demo book</strong> ${s.prototypeFarmers} farmers · ${s.prototypeFarms} farms · ${s.agents} agents</div>
        </div>
      </header>
      <dl class="scale">
        <a href="${href("farmers")}"><dt>Demo farmers</dt><dd>${s.prototypeFarmers}</dd><small>Programme target ${s.targetFarmers.toLocaleString("en-IN")}</small></a>
        <a href="${href("farms")}"><dt>Demo farms</dt><dd>${s.prototypeFarms}</dd><small>Holdings in the prototype book</small></a>
        <a href="${href("agents")}"><dt>Demo agents</dt><dd>${s.agents}</dd><small>Field operators in the book</small></a>
        <a href="${href("teams")}"><dt>Official teams</dt><dd>${s.teams}</dd><small>${s.acs} assembly constituencies</small></a>
      </dl>
      <section class="geo-command">
        <div>
          <p class="geo-kicker">Programme Geographic View</p>
          <h2 class="sec-title" style="margin-top:0">West Bengal</h2>
          ${wbMap(false)}
        </div>
        ${flag ? `<aside>
          <p class="geo-kicker">Flagship record</p>
          <h2 class="sec-title" style="margin-top:0">${esc(flag.name)}</h2>
          ${teamIdentity(flagTeam, "Jalpaiguri · Maynaguri")}
          <p class="mast-sub">68% implementation. Demo Farmer 014 · AG-024.</p>
          <p><a href="${href("farm/maa-ganga")}">Open Farm 360</a></p>
        </aside>` : ""}
      </section>
      ${acts ? `<section>
        <header class="sec-head"><p class="sec-k">Field journal</p><h2>Current activity</h2></header>
        <div class="journal">${acts}</div>
      </section>` : ""}
      ${leagueBoard()}`;
  }

  function districtTone(st) {
    if (st.farmers >= 8) return "active";
    if (st.farmers > 0) return "indicated";
    return "upcoming";
  }

  function wbMap(withList) {
    const max = Math.max.apply(null, D.DISTRICTS.map((d) => D.districtStats(d.id).farmers)) || 1;
    const marks = D.DISTRICTS.map((d) => {
      const st = D.districtStats(d.id);
      if (!st.farmers) return "";
      const left = ((d.x - 8) / 64) * 100;
      const top = ((d.y - 2) / 82) * 100;
      return `<a class="geo-dot ${districtTone(st)}" href="${href("district/" + d.id)}" style="left:${left}%;top:${top}%" title="${esc(d.name)}" aria-label="${esc(d.name)}"></a>`;
    }).join("");
    const rows = D.DISTRICTS.map((d) => {
      const st = D.districtStats(d.id);
      const pct = Math.round((st.farmers / max) * 100);
      return `<a href="${href("district/" + d.id)}"><strong>${esc(d.name)}</strong><em>${st.farmers} · ${st.acsCovered}/${st.acs}</em><span class="dens" aria-hidden="true"><i style="width:${pct}%"></i></span></a>`;
    }).join("");
    return `<div class="geo-frame">
      <div class="geo-stage">
        <img class="wb-base" src="images/wb-outline.svg" alt="West Bengal programme geographic view">
        <div class="geo-marks">${marks}</div>
      </div>
      <p class="geo-legend"><span><b class="l-a"></b>Active</span><span><b class="l-i"></b>Present in the book</span></p>
      <p class="geo-note">Programme Geographic View. Not a cadastral map.</p>
    </div>
    ${withList === false ? "" : `<aside class="geo-register"><h2 class="sec-title" style="margin-top:0">District register</h2><div class="geo-list" role="list">${rows}</div></aside>`}`;
  }

  function viewGeo(params) {
    setNav("geo");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Geography" }]);
    return `<section class="ident"><div>
      <p class="mast-k">Programme Geographic View</p>
      <h1>Geography</h1>
      <p>West Bengal to district to assembly constituency to the field network. This is a programme geographic view, not a cadastral map.</p>
    </div></section>
      <div class="geo-page">${wbMap(true)}</div>`;
  }

  function viewDistrict(id) {
    setNav("geo");
    const d = D.byId(D.DISTRICTS, id);
    if (!d) return notFound("District", id);
    const st = D.districtStats(id);
    crumb([{ href: "#/", label: "West Bengal" }, { href: href("geo"), label: "Geography" }, { label: d.name }]);
    const team = D.TEAMS.find((t) => t.districts.includes(id));
    const list = D.ACS.filter((a) => a.districtId === id).map((a) => {
      const as = D.acStats(a.id);
      return `<a class="reg-row" href="${href("ac/" + a.id)}"><b>${esc(a.name)}</b><span>${as.farmers} farmers · ${as.farms} farms</span><em>${as.progress ? as.progress + "%" : ""}</em><em></em></a>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">District</p>
      <h1>${esc(d.name)}</h1>
      ${team ? teamIdentity(team) : ""}
      <p>${d.acs.length} assembly constituencies in the state frame</p>
    </div></section>
    <dl class="ledger">
      <div><dt>Farmers</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Teams</dt><dd>${st.teams}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
      <div><dt>ACs in frame</dt><dd>${st.acs}</dd></div>
    </dl>
    <section class="register">
      <h2 class="sec-title">Assembly constituencies</h2>
      ${list}
    </section>`;
  }

  function viewAc(id) {
    setNav("geo");
    const ac = D.byId(D.ACS, id);
    if (!ac) return notFound("Assembly constituency", id);
    const d = D.byId(D.DISTRICTS, ac.districtId);
    const team = D.byId(D.TEAMS, ac.teamId);
    const st = D.acStats(id);
    crumb([
      { href: "#/", label: "West Bengal" },
      { href: href("district/" + ac.districtId), label: d.name },
      { label: ac.name },
    ]);
    const people = D.FARMERS.filter((f) => f.acId === id);
    const rows = people.slice(0, 40).map((f) => {
      const farm = D.byId(D.FARMS, f.farmIds[0]);
      return `<tr><td><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></td><td><a href="${href("farm/" + (farm ? farm.id : ""))}">${esc(farm ? farm.name : "—")}</a></td><td>${esc(stageLabel(f.stage))}</td><td>${f.progress}%</td></tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Assembly constituency</p>
      <h1>${esc(ac.name)}</h1>
      ${teamIdentity(team)}
      <p>${esc(d.name)} · target ${D.META.targetPerAc} farms at full book</p>
    </div></section>
    <dl class="ledger">
      <div><dt>Farmers</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Teams</dt><dd>${st.teams}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
    </dl>
    ${people.length ? `<div class="table-wrap" style="margin-top:18px"><table class="data"><thead><tr><th>Farmer</th><th>Farm</th><th>Stage</th><th>Progress</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}`;
  }

  function viewTeams() {
    setNav("teams");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Teams" }]);
    return `<section class="ident"><div>
      <p class="mast-k">Organisation</p>
      <h1>Teams</h1>
      <p>Fifteen official identities in the current Knowledge Base.</p>
    </div></section>${leagueBoard()}`;
  }

  function viewTeam(id) {
    setNav("teams");
    const team = D.byId(D.TEAMS, id);
    if (!team || team.placeholder) return notFound("Team", id);
    crumb([{ href: "#/", label: "West Bengal" }, { href: href("teams"), label: "Teams" }, { label: team.name }]);
    const st = D.teamStats(id);
    const teamAgents = D.AGENTS.filter((a) => a.teamId === id).map((a) => {
      const as = D.agentStats(a.id);
      return `<a class="reg-row" href="${href("agent/" + a.id)}"><b>${esc(a.code)}</b><span>${esc(a.name)}</span><em>${as.farmers} farmers</em><em>${as.farms} farms</em></a>`;
    }).join("");
    const acts = D.ACTIVITIES.filter((a) => a.teamId === id && a.photo).slice(0, 6).map((a) => {
      const farm = D.byId(D.FARMS, a.farmId);
      return `<article class="act"><a href="${href("farm/" + a.farmId)}"><img src="${esc(a.photo)}" alt="${esc(a.title)}"><div class="act-body"><strong>${esc(a.title)}</strong><p>${esc(farm ? farm.name : "")} · ${esc(a.date)}</p></div></a></article>`;
    }).join("");
    const districts = team.districts.map((did) => `<a href="${href("district/" + did)}">${esc(nameOf("district", did))}</a>`).join(" · ");
    return `<section class="ident ident-row">${teamMark(team)}<div>
      <p class="mast-k">Team operations</p>
      <h1>${esc(team.name)}</h1>
      <p>${districts}</p>
    </div></section>
    <dl class="ledger">
      <div><dt>Farmers</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
      <div><dt>ACs</dt><dd>${st.acsCovered}/${st.acs}</dd></div>
      <div><dt>Districts</dt><dd>${st.districts}</dd></div>
    </dl>
    <section>
      <h2 class="sec-title">Agents</h2>
      <div class="register">${teamAgents}</div>
    </section>
    ${acts ? `<section class="rail">
      <h2 class="sec-title">Recent activity</h2>
      <div class="film">${acts}</div>
    </section>` : ""}`;
  }

  function viewAgents(params) {
    setNav("agents");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Agents" }]);
    let list = D.AGENTS.slice();
    if (params.team) list = list.filter((a) => a.teamId === params.team);
    const slice = pageSlice(list, params.page);
    const rows = slice.rows.map((a) => {
      const st = D.agentStats(a.id);
      return `<tr><td><a href="${href("agent/" + a.id)}">${esc(a.code)}</a></td><td>${esc(a.name)}</td><td><a href="${href("team/" + a.teamId)}">${teamIdentity(D.byId(D.TEAMS, a.teamId))}</a></td><td>${st.farmers}</td><td>${st.farms}</td></tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Field roster</p>
      <h1>Agents</h1>
      <p>${list.length} agents in the prototype book.</p>
    </div></section>
      ${filtersBar(params)}
      <div class="table-wrap"><table class="data"><thead><tr><th>Code</th><th>Name</th><th>Team</th><th>Farmers</th><th>Farms</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${pager("agents", slice, params)}`;
  }

  function viewAgent(id) {
    setNav("agents");
    const agent = D.byId(D.AGENTS, id);
    if (!agent) return notFound("Agent", id);
    const st = D.agentStats(id);
    const team = D.byId(D.TEAMS, agent.teamId);
    crumb([{ href: "#/", label: "West Bengal" }, { href: href("agents"), label: "Agents" }, { label: agent.code }]);
    const mine = D.FARMERS.filter((f) => f.agentId === id);
    const rows = mine.map((f) => {
      const farm = D.byId(D.FARMS, f.farmIds[0]);
      return `<tr>
        <td><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></td>
        <td><a href="${href("farm/" + (farm ? farm.id : ""))}">${esc(farm ? farm.name : "—")}</a></td>
        <td>${esc(team.name)}</td>
        <td>${esc(stageLabel(f.stage))}</td>
        <td>${f.progress}%</td>
        <td>${esc(farm ? farm.lastVisit : "")}</td>
      </tr>`;
    }).join("");
    return `<section class="ident ident-row">${teamMark(team)}<div>
      <p class="mast-k">Field agent</p>
      <h1>${esc(agent.code)}</h1>
      <p>${esc(agent.name)} · ${esc(nameOf("district", agent.districtId))}</p>
    </div></section>
    <dl class="ledger">
      <div><dt>Assigned farmers</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Visits</dt><dd>${st.visits}</dd></div>
    </dl>
    ${mine.length ? `<h2 style="margin:22px 0 12px;font-size:20px">Farmers</h2>
    <div class="table-wrap"><table class="data"><thead><tr><th>Farmer</th><th>Farm</th><th>Team</th><th>Stage</th><th>Progress</th><th>Last visit</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}`;
  }

  function viewFarmers(params) {
    setNav("farmers");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Farmers" }]);
    let list = D.filterFarms(params).reduce((acc, farm) => {
      if (!acc.find((f) => f.id === farm.farmerId)) acc.push(D.byId(D.FARMERS, farm.farmerId));
      return acc;
    }, []);
    if (params.q) {
      const q = params.q.toLowerCase();
      list = D.FARMERS.filter((f) => f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q) || f.village.toLowerCase().includes(q));
    }
    if (params.team) list = list.filter((f) => f.teamId === params.team);
    if (params.district) list = list.filter((f) => f.districtId === params.district);
    if (params.stage) list = list.filter((f) => f.stage === params.stage);
    const slice = pageSlice(list, params.page);
    const rows = slice.rows.map((f) => `<tr>
      <td><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></td>
      <td>${esc(f.code)}</td>
      <td>${esc(f.village)}</td>
      <td><a href="${href("district/" + f.districtId)}">${esc(nameOf("district", f.districtId))}</a></td>
      <td><a href="${href("team/" + f.teamId)}">${teamIdentity(D.byId(D.TEAMS, f.teamId))}</a></td>
      <td>${f.farmIds.length}</td>
      <td>${esc(stageLabel(f.stage))}</td>
    </tr>`).join("");
    return `<section class="ident"><div>
      <p class="mast-k">People</p>
      <h1>Farmers</h1>
      <p>${list.length} demo farmers. A farmer may hold more than one farm.</p>
    </div></section>
      ${filtersBar(params)}
      ${list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Farmer</th><th>ID</th><th>Village</th><th>District</th><th>Team</th><th>Farms</th><th>Stage</th></tr></thead><tbody>${rows}</tbody></table></div>${pager("farmers", slice, params)}` : empty("No farmers match", "Change filters or clear search.")}`;
  }

  function viewFarmer(id) {
    setNav("farmers");
    const f = D.byId(D.FARMERS, id);
    if (!f) return notFound("Farmer", id);
    const team = D.byId(D.TEAMS, f.teamId);
    const agent = D.byId(D.AGENTS, f.agentId);
    crumb([
      { href: "#/", label: "West Bengal" },
      { href: href("district/" + f.districtId), label: nameOf("district", f.districtId) },
      { href: href("ac/" + f.acId), label: nameOf("ac", f.acId) },
      { label: f.name },
    ]);
    const farmRows = f.farmIds.map((fid) => {
      const farm = D.byId(D.FARMS, fid);
      return `<a class="reg-row" href="${href("farm/" + fid)}"><b>${esc(farm.name)}</b><span>${farm.sizeAcres} acres · ${esc(farm.crop)}</span><em>${esc(stageLabel(farm.stage))}</em><em>${farm.progress}%</em></a>`;
    }).join("");
    return `<section class="ident ident-row">${teamMark(team)}<div>
      <p class="mast-k">Farmer</p>
      <h1>${esc(f.name)}</h1>
      <p>${esc(f.code)} · ${esc(f.village)} · no phone, identity number or private contact is shown</p>
    </div></section>
    <dl class="ledger">
      <div><dt>District</dt><dd style="font-size:16px"><a href="${href("district/" + f.districtId)}">${esc(nameOf("district", f.districtId))}</a></dd></div>
      <div><dt>Assembly seat</dt><dd style="font-size:16px"><a href="${href("ac/" + f.acId)}">${esc(nameOf("ac", f.acId))}</a></dd></div>
      <div><dt>Team</dt><dd style="font-size:16px"><a href="${href("team/" + f.teamId)}">${esc(team.name)}</a></dd></div>
      <div><dt>Agent</dt><dd style="font-size:16px"><a href="${href("agent/" + f.agentId)}">${esc(agent.code)}</a></dd></div>
      <div><dt>Stage</dt><dd style="font-size:16px">${esc(stageLabel(f.stage))}</dd></div>
      <div><dt>Farms</dt><dd>${f.farmIds.length}</dd></div>
    </dl>
    <ol class="spine">
      ${f.voice ? `<li><h3>Voice</h3><p>${esc(f.voice)}</p></li>` : ""}
      ${f.goal && f.goal !== "Complete onboarding and first training." ? `<li><h3>Why</h3><p>${esc(f.goal)}</p></li>` : ""}
      ${f.challenge && f.challenge !== "Awaiting verification visit." ? `<li><h3>Constraint</h3><p>${esc(f.challenge)}</p></li>` : ""}
      ${f.achievement ? `<li><h3>Recorded so far</h3><p>${esc(f.achievement)}</p></li>` : ""}
    </ol>
    <section class="register">
      <h2 class="sec-title">Farms</h2>
      ${farmRows}
    </section>`;
  }

  function viewFarms(params) {
    setNav("farms");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Farms" }]);
    let list = D.filterFarms(params);
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.id.includes(q));
    }
    const slice = pageSlice(list, params.page);
    const rows = slice.rows.map((f) => `<tr>
      <td><a href="${href("farm/" + f.id)}">${esc(f.name)}</a></td>
      <td><a href="${href("farmer/" + f.farmerId)}">${esc(nameOf("farmer", f.farmerId))}</a></td>
      <td>${esc(nameOf("district", f.districtId))}</td>
      <td><a href="${href("team/" + f.teamId)}">${teamIdentity(D.byId(D.TEAMS, f.teamId))}</a></td>
      <td>${esc(stageLabel(f.stage))}</td>
      <td>${f.progress}%</td>
    </tr>`).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Holdings</p>
      <h1>Farms</h1>
      <p>${list.length} demo farms. Distinct from the farmer who holds them.</p>
    </div></section>
      ${filtersBar(params)}
      ${list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Farm</th><th>Farmer</th><th>District</th><th>Team</th><th>Stage</th><th>Progress</th></tr></thead><tbody>${rows}</tbody></table></div>${pager("farms", slice, params)}` : empty("No farms match", "Change filters or clear search.")}`;
  }

  function farmTabs(farm, tab) {
    const tabs = farmAvailableTabs(farm);
    return `<nav class="tabs" aria-label="Farm sections">${tabs.map(([id, label]) =>
      `<a href="${href("farm/" + farm.id + "/" + id)}" ${tab === id ? 'aria-current="page"' : ""}>${label}</a>`
    ).join("")}</nav>`;
  }

  function farmHeader(farm) {
    const farmer = D.byId(D.FARMERS, farm.farmerId);
    const team = D.byId(D.TEAMS, farm.teamId);
    const agent = D.byId(D.AGENTS, farm.agentId);
    crumb([
      { href: "#/", label: "West Bengal" },
      { href: href("district/" + farm.districtId), label: nameOf("district", farm.districtId) },
      { href: href("ac/" + farm.acId), label: nameOf("ac", farm.acId) },
      { href: href("farmer/" + farm.farmerId), label: farmer.name },
      { label: farm.name },
    ]);
    const visual = farm.id === "maa-ganga" ? "images/field/irrigation.jpg" : (farm.crop && /paddy|rice/i.test(farm.crop) ? "images/field/paddy.jpg" : "images/field/pond.jpg");
    return `<section class="dossier">
      <figure class="dossier-visual"><img src="${esc(visual)}" alt="Field context for ${esc(farm.name)}"></figure>
      <div>
        <p class="dossier-k">${farm.id === "maa-ganga" ? "Farm 360 · Flagship record" : "Farm 360"}</p>
        <h1>${esc(farm.name)}</h1>
        <p class="dossier-place">${esc(nameOf("district", farm.districtId))} · ${esc(nameOf("ac", farm.acId))}</p>
        ${teamIdentity(team)}
        <dl class="dossier-meta">
          <div><dt>Who</dt><dd><a href="${href("farmer/" + farmer.id)}">${esc(farmer.name)}</a></dd></div>
          <div><dt>Where</dt><dd>${esc(farm.village)}</dd></div>
          <div><dt>What</dt><dd>${farm.sizeAcres} acres · ${esc(farm.crop)}</dd></div>
          <div><dt>Agent</dt><dd><a href="${href("agent/" + agent.id)}">${esc(agent.code)}</a></dd></div>
        </dl>
      </div>
      <div class="dossier-prog">
        ${team && team.logo ? `<img class="dossier-crest" src="${esc(team.logo)}" alt="${esc(team.name)} official mark">` : ""}
        <b>${farm.progress}</b>
        <span>${esc(stageLabel(farm.stage))}<br>Path share, not yield</span>
      </div>
    </section>`;
  }

  function viewFarm(id, tab) {
    setNav("farms");
    const farm = D.byId(D.FARMS, id);
    if (!farm) return notFound("Farm", id);
    const farmer = D.byId(D.FARMERS, farm.farmerId);
    const agent = D.byId(D.AGENTS, farm.agentId);
    const allowed = farmAvailableTabs(farm).map((x) => x[0]);
    const current = allowed.includes(tab) ? tab : "overview";
    const head = farmHeader(farm) + farmTabs(farm, current);

    if (current === "journey") {
      const items = (farm.journey || []).filter((j) => j.date).map((j) => `<li data-status="${esc(j.status)}">
        <time>${esc(j.date)}</time><i></i>
        <div><h3>${esc(j.title)}</h3><p>${esc(j.note)} · ${esc(agent.code)}${j.evidence ? " · " + j.evidence + " evidence" : ""}</p>
        ${j.evidence ? `<p><a href="${href("farm/" + farm.id + "/media")}">View evidence</a></p>` : ""}</div>
      </li>`).join("");
      return head + `<ol class="journey">${items}</ol>`;
    }

    if (current === "smart") {
      const cards = smartRows(farm).map((row) => `<article>
          <h3>${esc(row.cat.label)}</h3>
          <div class="progress"><span class="bar" aria-hidden="true"><i style="width:${row.pct}%"></i></span><strong>${row.pct}%</strong></div>
          <p>${statusBadge(row.status)}${row.updated ? " · " + esc(row.updated) : ""} · ${esc(agent.code)}</p>
          <p>${esc(row.note)}</p>
          ${row.evidence ? `<p>${row.evidence} ${row.evidence === 1 ? "item" : "items"} · <a href="${href("farm/" + farm.id + "/media")}">View evidence</a></p>` : ""}
        </article>`).join("");
      return head + `<div class="smart">${cards}</div>`;
    }

    if (current === "monitor") {
      const latest = D.ACTIVITIES.find((a) => a.farmId === farm.id);
      return head + `<dl class="ledger">
        <div><dt>Current stage</dt><dd style="font-size:16px">${esc(stageLabel(farm.stage))}</dd></div>
        ${farm.lastVisit ? `<div><dt>Last visit</dt><dd style="font-size:16px">${esc(farm.lastVisit)}</dd></div>` : ""}
        <div><dt>Agent</dt><dd style="font-size:16px">${esc(agent.code)}</dd></div>
        ${latest ? `<div><dt>Latest activity</dt><dd style="font-size:16px">${esc(latest.title)}</dd></div>` : ""}
        <div><dt>Plots</dt><dd>${farm.plots.length}</dd></div>
      </dl>
      ${farm.plots.length ? `<section class="register">
        <h2 class="sec-title">Plots</h2>
        ${farm.plots.map((p) => `<div class="reg-row"><b>${esc(p.name)}</b><span>${esc(p.crop)}</span><em>${esc(p.size)}</em><em></em></div>`).join("")}
      </section>` : ""}`;
    }

    if (current === "media") {
      const ev = farm.evidence || [];
      const gal = ev.map((e, i) => {
        const media = e.type === "video"
          ? `<video controls playsinline preload="metadata" poster="${esc(e.poster || "images/g-krl-mark.jpg")}"><source src="${esc(e.src)}" type="video/mp4"></video>`
          : `<img src="${esc(e.src)}" alt="${esc(e.title)}">`;
        return `<figure class="${i === 0 ? "wide" : ""}">${media}<figcaption>${esc(captionFor(e.type, e.title))} · ${esc(farm.name)} · ${esc(e.date)}</figcaption></figure>`;
      }).join("");
      const ba = farm.beforeAfter
        ? `<h2 style="margin:22px 0 12px;font-size:18px">Field sequence</h2><div class="ba">
            <figure><img src="${esc(farm.beforeAfter.before.src)}" alt=""><figcaption>Irrigation planning</figcaption></figure>
            <figure><img src="${esc(farm.beforeAfter.after.src)}" alt=""><figcaption>Smart farming implementation</figcaption></figure>
          </div>`
        : "";
      return head + `<div class="gallery">${gal}</div>${ba}${mediaConnectCta()}`;
    }

    if (current === "people") {
      const people = supportPeople(farm).map((p) => {
        const link = p.id && p.role === "Farmer" ? href("farmer/" + p.id)
          : p.id && p.role === "Agent" ? href("agent/" + p.id)
          : p.id && p.role === "Team" ? href("team/" + p.id)
          : null;
        return `<article><small>${esc(p.role)}</small><strong>${link ? `<a href="${link}">${esc(p.name)}</a>` : esc(p.name)}</strong></article>`;
      }).join("");
      return head + `<div class="people" style="margin-top:14px">${people}</div>`;
    }

    if (current === "social") {
      const rows = socialChannels(farm).map((c) => `<article>
        <small>${esc(c.network)}</small>
        <strong><a href="${esc(c.url)}" rel="noopener noreferrer" target="_blank">${esc(c.handle)}</a></strong>
      </article>`).join("");
      return head + `<p>${esc((farm.social && farm.social.note) || "")}</p><div class="people" style="margin-top:14px">${rows}</div>`;
    }

    const latest = D.ACTIVITIES.find((a) => a.farmId === farm.id);
    const ev = (farm.evidence || []).slice(0, 3);
    const plan = farm.id === "maa-ganga"
      ? "Integrated crop management with monitored irrigation, soil practices and seasonal field activities."
      : "";
    const why = farmer.challenge && farmer.challenge !== "Awaiting verification visit." ? farmer.challenge : "";
    return head + `<div class="narrative">
      <ol class="spine">
        <li><h3>Who</h3><p><a href="${href("farmer/" + farmer.id)}">${esc(farmer.name)}</a> · ${esc(farmer.code)}</p></li>
        <li><h3>Where</h3><p>${esc([...new Set([nameOf("district", farm.districtId), nameOf("ac", farm.acId), farm.village])].join(" · "))}</p></li>
        ${why ? `<li><h3>Why</h3><p>${esc(why)}</p></li>` : ""}
        <li><h3>What</h3><p>${farm.sizeAcres} acres · ${esc(farm.crop)}</p></li>
        ${plan ? `<li><h3>How</h3><p>${esc(plan)}</p></li>` : ""}
        <li><h3>Progress</h3><p>${farm.progress}% · ${esc(stageLabel(farm.stage))}${farmer.achievement ? ". " + esc(farmer.achievement) : ""}</p></li>
        ${ev.length ? `<li><h3>Evidence</h3><p>${ev.length} items on this record. <a href="${href("farm/" + farm.id + "/media")}">Open gallery</a></p></li>` : ""}
        <li><h3>People</h3><p><a href="${href("agent/" + agent.id)}">${esc(agent.code)}</a> · <a href="${href("team/" + farm.teamId)}">${esc(nameOf("team", farm.teamId))}</a>${allowed.includes("people") ? ` · <a href="${href("farm/" + farm.id + "/people")}">Support network</a>` : ""}</p></li>
      </ol>
      <aside>
        ${latest ? `<h2 class="sec-title">Now on the farm</h2><p class="now">${esc(latest.title)} · ${esc(latest.date)}</p>` : ""}
        ${ev.length ? ev.map((e) => `<figure class="now-fig"><img src="${esc(e.poster || e.src)}" alt="${esc(e.title)}"><figcaption>${esc(captionFor(e.type, e.title))} · ${esc(e.date)}</figcaption></figure>`).join("") : ""}
        ${farmer.voice ? `<blockquote class="voice">${esc(farmer.voice)}</blockquote>` : ""}
      </aside>
    </div>`;
  }

  function viewActivity(params) {
    setNav("activity");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Activity" }]);
    let list = D.ACTIVITIES.slice();
    if (params.team) list = list.filter((a) => a.teamId === params.team);
    if (params.district) list = list.filter((a) => a.districtId === params.district);
    const slice = pageSlice(list, params.page);
    const rows = slice.rows.map((a) => {
      const farm = D.byId(D.FARMS, a.farmId);
      const agent = D.byId(D.AGENTS, a.agentId);
      return `<tr>
        <td>${esc(a.date)}</td>
        <td><a href="${href("farm/" + a.farmId)}">${esc(a.title)}</a></td>
        <td>${esc(farm ? farm.name : "—")}</td>
        <td>${esc(agent ? agent.code : "—")}</td>
        <td>${esc(nameOf("ac", a.acId))}</td>
        <td>${statusBadge(a.status)}</td>
      </tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Field book</p>
      <h1>Activity</h1>
      <p>${list.length} prototype visits.</p>
    </div></section>
      ${filtersBar(params)}
      ${rows ? `<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Activity</th><th>Farm</th><th>Agent</th><th>AC</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : empty("No activity", "No visits match.")}
      ${pager("activity", slice, params)}`;
  }

  function viewMedia() {
    setNav("media");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Media" }]);
    const prog = D.PROGRAMME_MEDIA.map((m, i) => {
      const media = m.type === "video" && !String(m.src).includes("youtu")
        ? `<video controls playsinline preload="metadata" poster="${esc(m.poster || m.src)}"><source src="${esc(m.src)}" type="video/mp4"></video>`
        : `<img src="${esc(m.poster || m.src)}" alt="${esc(m.title)}">`;
      return `<figure class="${i === 0 ? "wide" : ""}">${media}<figcaption>${esc(m.title)} · ${esc(m.context)}</figcaption></figure>`;
    }).join("");
    const farmEv = D.FARMS.flatMap((f) => (f.evidence || []).map((e) => Object.assign({ farm: f }, e)));
    return `<section class="ident"><div>
      <p class="mast-k">Archive</p>
      <h1>Media</h1>
      <p>Selected programme stills and farm records available in this book.</p>
    </div></section>
      ${prog ? `<h2 style="font-size:18px;margin:8px 0 12px">Programme archive</h2><div class="gallery">${prog}</div>` : ""}
      ${farmEv.length ? `<h2 style="font-size:18px;margin:22px 0 12px">Farm records</h2><div class="gallery">${farmEv.slice(0,5).map((e,i) => `<figure class="${i===0?"wide":""}"><img src="${esc(e.poster || e.src)}" alt="${esc(e.title)}"><figcaption>${esc(captionFor(e.type, e.title))} · ${esc(e.farm.name)}</figcaption></figure>`).join("")}</div>` : ""}
      ${mediaConnectCta()}`;
  }

  function viewReports() {
    setNav("reports");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Reports" }]);
    const s = D.programmeStats();
    const teamRows = D.TEAMS.map((t) => {
      const st = D.teamStats(t.id);
      return `<tr><td><a href="${href("team/" + t.id)}">${teamIdentity(t)}</a></td><td>${st.farmers}</td><td>${st.farms}</td><td>${st.acsCovered}/${st.acs}</td><td>${st.agents}</td></tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Operations</p>
      <h1>Reports</h1>
      <p>Book volumes only. Not a published league table.</p>
    </div></section>
      <dl class="ledger">
        <div><dt>Demo farmers</dt><dd>${s.prototypeFarmers}</dd></div>
        <div><dt>Demo farms</dt><dd>${s.prototypeFarms}</dd></div>
        <div><dt>Demo agents</dt><dd>${s.agents}</dd></div>
        <div><dt>Official teams</dt><dd>${s.teams}</dd></div>
        <div><dt>ACs in frame</dt><dd>${s.acs}</dd></div>
        <div><dt>Programme target</dt><dd>${s.targetFarmers.toLocaleString("en-IN")}</dd></div>
      </dl>
      <div class="table-wrap" style="margin-top:18px"><table class="data"><thead><tr><th>Team</th><th>Farmers</th><th>Farms</th><th>ACs</th><th>Agents</th></tr></thead><tbody>${teamRows}</tbody></table></div>`;
  }

  function resolveAcId(id) {
    if (D.byId(D.ACS, id)) return id;
    const hits = D.ACS.filter((a) => a.id.endsWith("-" + id));
    return hits.length === 1 ? hits[0].id : id;
  }

  function resolveFarmTab(tab) {
    if (!tab || tab === "overview") return "overview";
    if (tab === "support") return "people";
    return tab;
  }

  function render() {
    applyLang();
    const { parts, params } = parse();
    const root = parts[0] || "";
    let html = "";
    if (!root) html = viewCommand();
    else if (root === "geo" || root === "geography") html = viewGeo(params);
    else if (root === "district" && parts[1]) html = viewDistrict(parts[1]);
    else if (root === "ac" && parts[1]) html = viewAc(resolveAcId(parts[1]));
    else if (root === "teams") html = viewTeams();
    else if (root === "team" && parts[1]) html = viewTeam(parts[1]);
    else if (root === "agents") html = viewAgents(params);
    else if (root === "agent" && parts[1]) html = viewAgent(parts[1]);
    else if (root === "farmers") html = viewFarmers(params);
    else if (root === "farmer" && parts[1]) html = viewFarmer(parts[1]);
    else if (root === "farms") html = viewFarms(params);
    else if (root === "farm" && parts[1]) html = viewFarm(parts[1], resolveFarmTab(parts[2]));
    else if (root === "activity") html = viewActivity(params);
    else if (root === "media") html = viewMedia();
    else if (root === "reports") html = viewReports();
    else html = notFound("Page", parts.join("/"));
    app.innerHTML = html;
    const h = app.querySelector("h1");
    if (h) h.setAttribute("tabindex", "-1");
    if (h && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) h.focus({ preventScroll: true });
  }

  function openSearch() {
    overlay.hidden = false;
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchInput.focus();
  }
  function closeSearch() {
    overlay.hidden = true;
  }
  function runSearch() {
    const hits = D.search(searchInput.value);
    if (!hits.length) {
      searchResults.innerHTML = `<li class="empty">No matches</li>`;
      return;
    }
    const route = { district: "district", ac: "ac", team: "team", agent: "agent", farmer: "farmer", farm: "farm" };
    searchResults.innerHTML = hits.map((h) => `<li><a href="${href(route[h.type] + "/" + h.id)}"><small>${esc(h.type)}</small>${esc(h.label)}</a></li>`).join("");
  }

  document.querySelectorAll(".lang button").forEach((b) => {
    b.addEventListener("click", () => {
      try { localStorage.setItem("krl-lang", b.dataset.lang); } catch (_) {}
      render();
    });
  });
  document.getElementById("open-search").addEventListener("click", openSearch);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSearch(); });
  searchInput.addEventListener("input", runSearch);
  searchResults.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });
  app.addEventListener("change", (e) => {
    const form = e.target.closest("[data-filter]");
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((k) => { if (!data[k]) delete data[k]; });
    const { parts } = parse();
    location.hash = href(parts.join("/") || "", data);
  });
  app.addEventListener("submit", (e) => {
    if (e.target.matches("[data-filter]")) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      Object.keys(data).forEach((k) => { if (!data[k]) delete data[k]; });
      const { parts } = parse();
      location.hash = href(parts.join("/") || "", data);
    }
  });
  app.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) location.hash = go.getAttribute("data-go");
  });
  window.addEventListener("hashchange", render);
  applyLang();
  render();
})();
