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
      notice: "Case-study records and published programme architecture. Not live enrolment.",
      find: "Find agri-entrepreneur, farm, AC, team",
      command: "Command",
      geography: "Geography",
      teams: "Teams",
      agents: "Agents",
      farmers: "Agri-entrepreneurs",
      farms: "Farms",
      activity: "Activity",
      media: "Media",
      reports: "Reports",
      product: "KRL Teams",
      know_more: "Know more",
      menu: "Menu",
    },
    bn: {
      notice: "কেস-স্টাডি রেকর্ড এবং প্রকাশিত কর্মসূচি কাঠামো. চালু তালিকা নয়.",
      find: "উদ্যোক্তা, খামার, কেন্দ্র, দল খুঁজুন",
      command: "কমান্ড",
      geography: "ভূগোল",
      teams: "দল",
      agents: "এজেন্ট",
      farmers: "উদ্যোক্তা",
      farms: "খামার",
      activity: "কাজ",
      media: "মিডিয়া",
      reports: "প্রতিবেদন",
      product: "কেআরএল টিমস",
      know_more: "আরও জানুন",
      menu: "মেনু",
    },
    hi: {
      notice: "केस-स्टडी रिकॉर्ड और प्रकाशित कार्यक्रम संरचना. चालू नामांकन नहीं.",
      find: "उद्यमी, फार्म, क्षेत्र, टीम खोजें",
      command: "कमांड",
      geography: "भूगोल",
      teams: "टीमें",
      agents: "एजेंट",
      farmers: "उद्यमी",
      farms: "फार्म",
      activity: "कार्य",
      media: "मीडिया",
      reports: "रिपोर्ट",
      product: "केआरएल टीम्स",
      know_more: "और जानें",
      menu: "मेन्यू",
    },
  };

  const LANGS = { en: "EN", bn: "বাং", hi: "हिं" };

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
    const cur = document.getElementById("lang-current");
    if (cur) cur.textContent = LANGS[L] || "EN";
    document.querySelectorAll("#lang-menu [data-lang]").forEach((b) => {
      b.setAttribute("aria-selected", b.dataset.lang === L ? "true" : "false");
    });
    const find = document.getElementById("open-search");
    if (find) find.setAttribute("aria-label", t("find"));
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
    if (!id) return "";
    if (type === "district") return (D.byId(D.DISTRICTS, id) || {}).name || id;
    if (type === "ac") {
      const ac = D.byId(D.ACS, id);
      if (!ac) return id;
      return ac.officialNo ? ac.officialNo + " – " + ac.name : ac.name;
    }
    if (type === "zone") return (D.byId(D.ZONES, id) || {}).name || id;
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
    if (!s) return id;
    if (lang() === "bn") return s.bn || s.label;
    if (lang() === "hi") return s.hi || s.label;
    return s.label;
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

  function teamZone(team) {
    return team && team.zoneId ? D.byId(D.ZONES, team.zoneId) : null;
  }

  function assignedTeam(person) {
    if (!person || !person.teamId) return null;
    return D.byId(D.TEAMS, person.teamId) || null;
  }

  function teamNote(person) {
    if (!person || !person.teamId) return "";
    if (person.teamSource === "enrolled") return "Live team enrolment.";
    if (person.teamSource === "named") return "Named to Himalayan Giants in Zone 1. Not inferred from Maynaguri geography. Not live enrolment.";
    if (person.teamSource === "geography") return "Official team for this assembly geography. Not live enrolment.";
    return "Team identity from the programme architecture. Not live enrolment.";
  }

  function peopleOfTeam(teamId) {
    return D.FARMERS.filter((f) => f.teamId === teamId);
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

  function digitalLinks(person) {
    return (person && person.digital || []).filter((c) => c.url);
  }

  function sourceVideos(person) {
    return (person && person.videos) || [];
  }

  function ytThumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
  }

  function portraitOf(person) {
    const img = person && person.profileImage;
    if (img && img.src && img.subject === "person") return img;
    return null;
  }

  function personStill(person) {
    const p = portraitOf(person);
    if (!p) return "";
    return `<a class="person-still" href="${href("farmer/" + person.id)}"><img src="${esc(p.src)}" alt="${esc(person.name)}"></a>`;
  }

  function campaignDesk() {
    const shots = [
      { src: "images/campaign/hook-home.jpg", title: "Krishi Ratna League campaign story" },
      { src: "images/campaign/farmer-journey.jpg", title: "Farmer journey campaign" },
      { src: "images/campaign/come-home.jpg", title: "Come home to Bengal campaign" },
      { src: "images/campaign/kolkata-farm.jpg", title: "Kolkata farm campaign" },
    ];
    return `<section class="campaign-desk">
      <h2>League story</h2>
      <p class="media-note">Campaign storyboards. Not verified farm evidence.</p>
      <div class="campaign-grid">${shots.map((s) => `<figure><img src="${s.src}" alt="${esc(s.title)}"></figure>`).join("")}</div>
    </section>`;
  }

  function gardenOnCamera() {
    const people = D.FARMERS.filter((f) => sourceVideos(f).length);
    if (!people.length) return "";
    return `<section class="cinema-desk">
      <p class="label">Garden on camera · source media</p>
      <p class="media-note">Public YouTube from named agri-entrepreneurs. Not programme archive.</p>
      <div class="garden-cast">${people.map((f) => {
        const clip = sourceVideos(f)[0];
        const handles = digitalLinks(f).map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.handle)}</a>`).join(" · ");
        return `<article class="cast">
          <a class="story-still" href="${href("farmer/" + f.id)}"><img src="${ytThumb(clip.youtubeId)}" alt="${esc(clip.title)}"></a>
          <p class="label">${esc(f.gardenName || "Garden")}</p>
          <h2><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></h2>
          <p class="meta">${esc(clip.title)}</p>
          ${handles ? `<p class="meta">${handles}</p>` : ""}
        </article>`;
      }).join("")}</div>
    </section>`;
  }

  function cinemaStage(person) {
    const videos = sourceVideos(person);
    if (!videos.length) return "";
    const lead = videos.find((v) => v.role === "featured") || videos[0];
    const rest = videos.filter((v) => v !== lead).slice(0, 4);
    return `<section class="cinema" id="garden-film">
      <p class="label">Featured video · source media</p>
      <div class="cinema-stage" data-embed="${esc(lead.youtubeId)}" data-title="${esc(lead.title)}">
        <button type="button" class="cinema-play">
          <img src="${ytThumb(lead.youtubeId)}" alt="">
          <span>Play · ${esc(lead.title)}</span>
        </button>
      </div>
      <p class="meta">${esc(lead.title)} · ${esc(lead.channel)}</p>
      ${rest.length ? `<div class="film-journey">
        <p class="label">Watch the journey</p>
        <div class="film-strip">${rest.map((v) => `<a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">
        <span class="film-still"><img src="${ytThumb(v.youtubeId)}" alt="${esc(v.title)}" loading="lazy"></span>
        <span>${esc(v.title)}</span>
      </a>`).join("")}</div>
      </div>` : ""}
    </section>`;
  }

  function placeParts(rec) {
    if (!rec) return [];
    return [
      rec.village,
      rec.acId ? nameOf("ac", rec.acId) : null,
      rec.districtId ? nameOf("district", rec.districtId) : null,
    ].filter(Boolean);
  }

  function placeLine(rec, withState) {
    const parts = placeParts(rec);
    if (withState && rec && rec.districtId) parts.push("West Bengal");
    return [...new Set(parts)].join(" · ");
  }

  function chainMarkup(items) {
    const nodes = (items || []).filter((it) => it && it.label);
    if (!nodes.length) return "";
    return `<ol class="chain" aria-label="Geographic path">${nodes.map((it, i) => {
      const body = it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`;
      return `<li>${body}${i < nodes.length - 1 ? "<i></i>" : ""}</li>`;
    }).join("")}</ol>`;
  }

  function farmerChain(person, farm) {
    const team = assignedTeam(person);
    const zone = teamZone(team);
    const items = [{ href: href(""), label: "West Bengal" }];
    if (person.teamSource === "named") {
      if (person.acId) items.push({ href: href("ac/" + person.acId), label: person.village || nameOf("ac", person.acId) });
      else if (person.village) items.push({ label: person.village });
      if (zone) items.push({ href: href("zone/" + zone.id), label: zone.name });
      if (team) items.push({ href: href("team/" + team.id), label: team.name });
    } else {
      if (person.districtId) items.push({ href: href("district/" + person.districtId), label: nameOf("district", person.districtId) });
      if (person.acId) items.push({ href: href("ac/" + person.acId), label: nameOf("ac", person.acId) });
      if (team) items.push({ href: href("team/" + team.id), label: team.name });
    }
    items.push({ href: href("farmer/" + person.id), label: person.name });
    if (farm) items.push({ href: href("farm/" + farm.id), label: farm.name });
    return chainMarkup(items);
  }

  function digitalDesk(person) {
    const channels = digitalLinks(person);
    if (!channels.length) return "";
    return `<section class="digital-desk reveal" id="digital">
      <h2>Digital presence</h2>
      <p class="media-note">Public source channels. Not treated as field-verified evidence.</p>
      <div class="digital-grid">
        ${channels.map((c) => {
          const mark = /youtube/i.test(c.network) ? "YT" : /facebook/i.test(c.network) ? "FB" : /instagram/i.test(c.network) ? "IG" : "•";
          const action = /youtube/i.test(c.network) ? "Watch channel" : "Visit";
          const thumb = c.thumbYoutubeId
            ? `<a class="story-still" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><img src="${ytThumb(c.thumbYoutubeId)}" alt="${esc(c.handle)} channel still"></a>`
            : "";
          return `<article class="digital-tile">
            <p class="plat"><span class="plat-mark" aria-hidden="true">${mark}</span> ${esc(c.network)}</p>
            <p class="plat-id">${esc(c.handle)}</p>
            ${c.note ? `<p class="meta">${esc(c.note)}</p>` : ""}
            ${thumb}
            <p class="story-links"><a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${action}</a></p>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }

  function playerHero(person) {
    const farm = D.byId(D.FARMS, person.farmIds[0]);
    const team = assignedTeam(person);
    const zone = teamZone(team);
    const clip = sourceVideos(person)[0];
    const portrait = portraitOf(person);
    const visual = portrait || (clip ? { src: ytThumb(clip.youtubeId), caption: "Source film · " + clip.title + ". Not a field portrait." } : null);
    return `<section class="player"${team ? ` style="--accent:${esc(team.accent)}"` : ""}>
      ${visual ? `<figure class="player-still${portrait ? " is-portrait" : ""}">
        <img src="${esc(visual.src)}" alt="${esc(portrait ? person.name : (visual.caption || person.name))}">
        <figcaption>${esc(portrait ? "Supplied portrait · " + person.name + ". Not an AI image and not farm evidence." : (visual.caption || "Source film. Not a field portrait."))}</figcaption>
      </figure>` : ""}
      <div class="player-copy">
        <p class="label">Agri-entrepreneur</p>
        <h1>${esc(person.name)}</h1>
        ${person.gardenName ? `<p class="player-garden">${esc(person.gardenName)}</p>` : ""}
        ${farmerChain(person, farm)}
        ${team ? `<div class="player-team">
          ${teamIdentity(team, zone ? zone.name : teamRegion(team))}
          <p class="story-links"><a href="${href("team/" + team.id)}">Explore team</a></p>
        </div>` : ""}
        ${teamNote(person) ? `<p class="meta">${esc(teamNote(person))}</p>` : ""}
        <p class="story-links">
          ${farm ? `<a class="btn" href="${href("farm/" + farm.id)}">Explore farm</a>` : ""}
          ${clip ? `<button type="button" class="btn ghost" data-jump="garden-film">Watch story</button>` : ""}
        </p>
      </div>
    </section>`;
  }

  function squadCard(person) {
    const farm = D.byId(D.FARMS, person.farmIds[0]);
    const clip = sourceVideos(person)[0];
    const team = assignedTeam(person);
    return `<article class="squad-card reveal">
      ${personStill(person) || (clip ? `<a class="story-still" href="${href("farmer/" + person.id)}"><img src="${ytThumb(clip.youtubeId)}" alt="${esc(clip.title)}"></a>` : "")}
      <h3><a href="${href("farmer/" + person.id)}">${esc(person.name)}</a></h3>
      ${person.gardenName ? `<p class="story-garden">${esc(person.gardenName)}</p>` : ""}
      ${team ? teamIdentity(team) : ""}
      ${farmerChain(person, farm)}
      <p class="story-links"><a class="btn" href="${href("farmer/" + person.id)}">Open profile</a>${farm ? `<a href="${href("farm/" + farm.id)}">Farm 360</a>` : ""}</p>
    </article>`;
  }

  function squadBlock(people, title) {
    if (!people.length) return "";
    return `<section class="squad">
      <h2>${esc(title)}</h2>
      <div class="squad-grid">${people.map(squadCard).join("")}</div>
    </section>`;
  }

  function growChips(items) {
    if (!items || !items.length) return "";
    return `<ul class="grow-list">${items.map((g) => `<li>${esc(g.name)}</li>`).join("")}</ul>`;
  }

  function featuredEntrepreneurs() {
    const cases = D.FARMERS.filter((f) => f.kind === "case-study");
    if (!cases.length) return "";
    const cards = cases.map((person) => {
      const farm = D.byId(D.FARMS, person.farmIds[0]);
      const team = assignedTeam(person);
      const zone = teamZone(team);
      const clip = sourceVideos(person)[0];
      const channels = digitalLinks(person).map((c) => esc(c.network)).join(" · ");
      const portrait = portraitOf(person);
      const visual = portrait || (clip ? { src: ytThumb(clip.youtubeId), caption: clip.title } : null);
      return `<article class="feat reveal">
        ${portrait ? personStill(person) : visual ? `<a class="story-still" href="${href("farmer/" + person.id)}"><img src="${esc(visual.src)}" alt="${esc(visual.caption || person.name)}"></a>` : ""}
        <p class="label">${person.id === "amit-shill" ? "Primary case" : "Secondary case"}</p>
        <h3><a href="${href("farmer/" + person.id)}">${esc(person.name)}</a></h3>
        ${person.gardenName ? `<p class="story-garden">${esc(person.gardenName)}</p>` : ""}
        ${farmerChain(person, farm)}
        ${team ? teamIdentity(team, zone ? zone.name : "") : ""}
        ${person.identity ? `<p class="feat-line">${esc(person.identity)}</p>` : person.practice ? `<p class="feat-line">${esc(person.practice)}</p>` : ""}
        ${channels ? `<p class="meta">Digital presence · ${channels}</p>` : ""}
        <p class="story-links"><a class="btn" href="${href("farmer/" + person.id)}">Open story</a>${farm ? `<a href="${href("farm/" + farm.id)}">Explore farm</a>` : ""}</p>
      </article>`;
    }).join("");
    return `<section class="feat-band">
      <header class="sec-head">
        <p class="sec-k">People first</p>
        <h2>Featured agri-entrepreneurs</h2>
        <p>Named people, named gardens, public source media. Not enrolment counts.</p>
      </header>
      <div class="feat-grid">${cards}</div>
    </section>`;
  }

  function networkModel() {
    const steps = [
      { k: "01", t: "Farmer", d: "A named agri-entrepreneur. The person is not the holding." },
      { k: "02", t: "Farm", d: "A named garden. Size and yield stay hidden until evidenced." },
      { k: "03", t: "Team", d: "An official KRL identity. Geography or named assignment, not a fake slot." },
      { k: "04", t: "Geography", d: "West Bengal to district to assembly seat. The operating system." },
      { k: "05", t: "Data", d: "Show what we know. Hide what we do not. Farm 360 is data-gated." },
      { k: "06", t: "Intelligence", d: "Future intelligence layer. Programme architecture, not a live claim." },
    ];
    return `<section class="network-model reveal">
      <figure class="network-visual">
        <img src="images/editorial/farm-network.jpg" alt="Editorial visual of connected Bengal farm plots">
        <figcaption>Editorial visual. Farm-to-network concept — not a live operations map and not a named holding.</figcaption>
      </figure>
      <div class="network-copy">
        <header class="sec-head">
          <p class="sec-k">From farm to network</p>
          <h2>Farmer. Farm. Team. Geography. Data. Intelligence.</h2>
          <p>The programme architecture. Not every layer is operational.</p>
        </header>
        <ol class="network-rail">${steps.map((s) => `<li><b>${s.k}</b><strong>${esc(s.t)}</strong><span>${esc(s.d)}</span></li>`).join("")}</ol>
      </div>
    </section>`;
  }

  function foundingStatement(session) {
    const film = session
      ? `<a href="${esc(session.src)}" target="_blank" rel="noopener noreferrer">published session film</a>`
      : "published session film";
    return `<section class="founding">
      <p class="sec-k">Source session</p>
      <h2>Farming needs its turning-point innings.</h2>
      <p class="lede">The ${film} names Krishi Ratna League as that strategy: a league of teams, not a protest. IPL is the reference for energy and belonging. It is not the brand we wear.</p>
      <blockquote>
        <p>What farming needs is that single Kapil Dev moment.</p>
        <footer>Mahacharya Ji · Karmyog TV. Opening statement, not a live scoreboard.</footer>
      </blockquote>
    </section>`;
  }

  function axisLine() {
    const axes = [
      { t: "Satya", d: "Honesty on the holding. Natural practice, when evidenced. Record what is known." },
      { t: "Mangalmay", d: "Useful tools and smart practice on the garden, when they can be shown." },
      { t: "Sundar", d: "A farm that can be seen and visited. Beauty as design, not decoration." },
      { t: "Samriddhi", d: "Prosperity as the aim when the three hold. Not a fake score." },
    ];
    return `<section class="axis-line reveal" aria-label="Programme axes">
      ${axes.map((ax) => `<article><h3>${esc(ax.t)}</h3><p>${esc(ax.d)}</p></article>`).join("")}
    </section>`;
  }

  function editorialField() {
    const shots = [
      { src: "images/editorial/bengal-field.jpg", t: "Bengal agricultural landscape" },
      { src: "images/editorial/garden-hands.jpg", t: "Work with plants" },
      { src: "images/editorial/pond.jpg", t: "Water and holding" },
      { src: "images/editorial/field-tech.jpg", t: "Field and a tool" },
    ];
    return `<section class="edit-band reveal">
      <header class="sec-head">
        <p class="sec-k">Field atmosphere</p>
        <h2>The work is on the ground</h2>
        <p class="media-note">Editorial visuals. Not farmer portraits, not verified farm evidence, and not programme event photographs.</p>
      </header>
      <div class="edit-strip">${shots.map((s) => `<figure>
        <img src="${s.src}" alt="${esc(s.t)}">
        <figcaption>${esc(s.t)} · editorial</figcaption>
      </figure>`).join("")}</div>
    </section>`;
  }

  function homeStories() {
    return `<section class="home-stories reveal">
      <figure>
        <img src="images/campaign/puja-days.jpg" alt="Puja days campaign storyboard">
        <figcaption>Campaign storyboard. Not farm evidence.</figcaption>
      </figure>
      <div>
        <p class="sec-k">Stories</p>
        <h2>League language, source film, named gardens.</h2>
        <p>The published session sets a Durga Puja 2026–2028 arc. Campaign boards stay labelled as campaign. Garden film stays labelled as source media. Named people keep their own portraits.</p>
        <p class="story-links"><a class="btn" href="${href("media")}">Open the media desk</a><a href="${href("farmers")}">Meet agri-entrepreneurs</a></p>
      </div>
    </section>`;
  }

  function editorialContext(person) {
    const map = {
      "amit-shill": {
        src: "images/editorial/rooftop-garden.jpg",
        title: "Rooftop cultivation, editorial",
        note: "Editorial visual. Atmospheric agriculture imagery — not a photograph of Pikas Garden and not a portrait of Amit Shill.",
      },
      "krishna-biswas": {
        src: "images/editorial/dragon-fruit.jpg",
        title: "Dragon fruit horticulture, editorial",
        note: "Editorial visual. Thematic horticulture imagery — not a photograph of Rupali Garden and not a portrait of Krishna Biswas.",
      },
    };
    const item = map[person.id];
    if (!item) return "";
    return `<figure class="edit-context reveal">
      <img src="${esc(item.src)}" alt="${esc(item.title)}">
      <figcaption>${esc(item.note)}</figcaption>
    </figure>`;
  }

  function bootHeroLogo() {
    const video = document.getElementById("krl-hero-logo");
    const brand = document.querySelector(".arena-brand");
    if (!video || !brand) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      brand.classList.add("is-static");
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.addEventListener("playing", function () {
      brand.classList.add("is-live");
    }, { once: true });
    const play = video.play();
    if (play && play.catch) play.catch(function () { brand.classList.add("is-static"); });
    video.addEventListener("ended", function () {
      brand.classList.add("is-settled");
      brand.classList.remove("is-live");
    }, { once: true });
  }

  function dash(v) {
    return v == null || v === "" ? "—" : v;
  }

  function smartRows(farm) {
    if (!farm.smart) return [];
    return D.SMART_CATS.filter((c) => {
      const row = farm.smart[c.id];
      return row && row.status !== "not_started" && row.pct > 0;
    }).map((c) => Object.assign({ cat: c }, farm.smart[c.id]));
  }

  function hasAuthoredJourney(farm) {
    return !!(farm.journey && farm.journey.some((j) => j.date && j.note && j.note !== "Prototype milestone."));
  }

  function farmArchitectureTabs() {
    return [
      ["overview", "Overview"],
      ["journey", "Journey"],
      ["smart", "Smart farming"],
      ["monitor", "Monitoring"],
      ["media", "Media"],
      ["people", "People / Support"],
      ["social", "Social"],
    ];
  }

  function farmAvailableTabs(farm) {
    const tabs = [["overview", "Overview"]];
    if (hasAuthoredJourney(farm)) tabs.push(["journey", "Journey"]);
    if (smartRows(farm).length) tabs.push(["smart", "Smart farming"]);
    if (farm.lastVisit || ((farm.plots || []).length)) tabs.push(["monitor", "Monitoring"]);
    if ((farm.evidence || []).length) tabs.push(["media", "Media"]);
    if (supportPeople(farm).length) tabs.push(["people", "People / Support"]);
    if (socialChannels(farm).length) tabs.push(["social", "Social"]);
    return tabs;
  }

  function farmHasTab(farm, id) {
    return farmAvailableTabs(farm).some((row) => row[0] === id);
  }

  function farmEmpty(label) {
    return `<div class="farm-empty">
      <p class="sec-k">Field intelligence</p>
      <h2>Verified field data will appear here</h2>
      <p class="media-note">${esc(label)} is part of the Farm 360 architecture. Nothing is shown until a source record exists.</p>
    </div>`;
  }

  function mediaConnectCta() {
    const cta = D.mediaWhere("cta")[0];
    return `<aside class="know-more">
      ${cta ? `<figure><img src="${esc(cta.src)}" alt="${esc(cta.caption)}"></figure>` : ""}
      <div>
        <p class="sec-k">KRL Media Connect</p>
        <h2>Explore more stories, photographs, event coverage and media.</h2>
        <p>KRL Media Connect remains a separate product. This command centre stays here.</p>
        <a class="know-more-link" href="${MEDIA_CONNECT}" target="_blank" rel="noopener noreferrer">
          <span>${esc(t("know_more"))}</span>
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
      const known = [];
      if (st.farmers) known.push(st.farmers + (st.farmers === 1 ? " agri-entrepreneur" : " agri-entrepreneurs"));
      if (st.farms) known.push(st.farms + (st.farms === 1 ? " farm" : " farms"));
      if (st.agents) known.push(st.agents + (st.agents === 1 ? " agent" : " agents"));
      const zone = teamZone(t);
      return '<a class="reg-team" href="' + href("team/" + t.id) + '">' +
        teamMark(t) +
        "<div><strong>" + esc(t.name) + "</strong><span>" + esc(teamRegion(t)) + (zone ? " · " + esc(zone.name) : "") + "</span></div>" +
        "<span>" + st.acs + " assembly seats</span>" +
        "<span>" + (known.length ? known.join(" · ") : "Geography assigned") + "</span></a>";
    }).join("");
    return '<section class="league"><header class="sec-head"><p class="sec-k">Team network</p><h2>Team Register</h2>' +
      "<p>Fifteen official identities. Field counts appear only where a record exists.</p></header>" +
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
    return empty(kind + " not found", "No known record matches “" + id + "”. Return to the command centre and try another path.");
  }

  function homeGeography() {
    const s = D.programmeStats();
    return `<section class="geo-home reveal">
      <div>${wbMap(false)}</div>
      <div>
        <p class="sec-k">Geographic network</p>
        <h2 class="display-s">West Bengal to the farm</h2>
        <p class="lede">The operating system is geography. This is a programme view, not a cadastral map and not a live scoreboard.</p>
        <ol class="geo-ladder">
          <li>West Bengal</li>
          <li>District</li>
          <li>Assembly constituency</li>
          <li>Team</li>
          <li>Agri-entrepreneur</li>
          <li>Farm</li>
        </ol>
        <dl class="geo-struct">
          <div><dt>Districts in the state frame</dt><dd>${s.districts}</dd></div>
          <div><dt>Assembly seats</dt><dd>${s.acs}</dd></div>
          <div><dt>Official teams</dt><dd>${s.teams}</dd></div>
        </dl>
        <p class="story-links"><a class="btn" href="${href("geo")}">Open geography</a></p>
      </div>
    </section>`;
  }

  function viewCommand() {
    setNav("command");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Command Centre" }]);
    const crests = D.TEAMS.map((t) => `<a class="crest" href="${href("team/" + t.id)}"><img src="${esc(t.logo)}" alt="${esc(t.name)}"><b>${esc(t.short)}</b></a>`).join("");
    const fan = D.TEAMS.map((t) => {
      const zone = teamZone(t);
      return `<a class="fan-cell" href="${href("team/" + t.id)}" style="--accent:${esc(t.accent)}">
        <img src="${esc(t.logo)}" alt="${esc(t.name)}">
        <span>${esc(t.short)}</span>
        <strong>${esc(t.name)}</strong>
        <em>${esc(zone ? zone.name : teamRegion(t))}</em>
      </a>`;
    }).join("");
    const session = D.mediaWhere("link")[0];

    return `<div data-motion="command">
      <section class="arena">
        <figure class="arena-brand">
          <div class="arena-frame">
            <img class="arena-poster" src="video/krl-animated-logo-poster.jpg" width="1920" height="1080" alt="Krishi Ratna League Bengal mark">
            <video id="krl-hero-logo" class="arena-logo" muted playsinline preload="metadata" poster="video/krl-animated-logo-poster.jpg" width="1920" height="1080" aria-label="KRL animated brand mark">
              <source src="video/krl-animated-logo.webm" type="video/webm">
              <source src="video/krl-animated-logo.mp4" type="video/mp4">
            </video>
          </div>
        </figure>
        <div class="arena-statement">
          <p class="label">KRL Teams</p>
          <h1>The field is the farm.<br>The farmer is the champion.</h1>
          <p class="lede">From people and farms to a connected agricultural network.</p>
          <div class="arena-cta">
            <a class="btn" href="${href("teams")}">Open teams</a>
            <a class="btn ghost" href="${href("farmers")}">Meet agri-entrepreneurs</a>
          </div>
        </div>
      </section>
      ${foundingStatement(session)}
      ${featuredEntrepreneurs()}
      ${homeGeography()}
      <section class="teams-head reveal">
        <p class="sec-k">Teams</p>
        <h2 class="display-s">Fifteen official crests</h2>
        <p class="lede">Official KRL identities. Geography assigned. Not invented slots.</p>
      </section>
      <div class="crest-marquee" aria-label="Official teams">
        <div class="crest-track">${crests}${crests}</div>
      </div>
      <section class="fan-wrap reveal">
        <div class="fan-row">${fan}</div>
        <p class="story-links"><a href="${href("teams")}">Open the team register</a></p>
      </section>
      ${networkModel()}
      ${editorialField()}
      ${homeStories()}
      ${session ? `<p class="session-link">Programme session film · <a href="${esc(session.src)}" target="_blank" rel="noopener noreferrer">${esc(session.caption)}</a></p>` : ""}
      ${mediaConnectCta()}
    </div>`;
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
      return `<a href="${href("district/" + d.id)}"><strong>${esc(d.name)}</strong><em>${st.farmers ? st.farmers + (st.farmers === 1 ? " agri-entrepreneur" : " agri-entrepreneurs") : st.acs + " ACs"}</em>${st.farmers ? `<span class="dens" aria-hidden="true"><i style="width:${pct}%"></i></span>` : ""}</a>`;
    }).join("");
    return `<div class="geo-frame">
      <div class="geo-stage${withList === false ? " geo-stage-hero" : ""}">
        <img class="wb-base" src="images/wb-outline.svg" alt="West Bengal programme geographic view">
        <div class="geo-marks">${marks}</div>
      </div>
      <p class="geo-legend"><span><b class="l-a"></b>Known farm record</span></p>
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
      <p>West Bengal to district to assembly constituency to team to agri-entrepreneur to farm. This is a programme geographic view, not a cadastral map, and not a live statistical bulletin.</p>
      <ol class="geo-ladder">
        <li>West Bengal</li>
        <li>District</li>
        <li>Assembly constituency</li>
        <li>Team</li>
        <li>Agri-entrepreneur</li>
        <li>Farm</li>
      </ol>
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
    const zone = teamZone(team);
    const list = D.ACS.filter((a) => a.districtId === id).map((a) => {
      const as = D.acStats(a.id);
      const known = as.farmers ? as.farmers + (as.farmers === 1 ? " agri-entrepreneur" : " agri-entrepreneurs") + " · " + as.farms + (as.farms === 1 ? " farm" : " farms") : "In the state frame";
      return `<a class="reg-row" href="${href("ac/" + a.id)}"><b>${esc(a.officialNo ? a.officialNo + " – " + a.name : a.name)}</b><span>${known}</span><em>${as.progress ? as.progress + "%" : ""}</em><em></em></a>`;
    }).join("");
    const locals = D.FARMERS.filter((f) => f.districtId === id);
    return `<section class="ident"><div>
      <p class="mast-k">District</p>
      <h1>${esc(d.name)}</h1>
      ${team ? teamIdentity(team, zone ? zone.name + " · " + teamRegion(team) : "") : ""}
      ${zone ? `<p class="meta"><a href="${href("zone/" + zone.id)}">${esc(zone.name)}</a></p>` : ""}
      <p>${d.acs.length} assembly constituencies in the state frame</p>
      ${locals.some((f) => f.teamId && team && f.teamId !== team.id) ? `<p class="meta">Named Model Farmers may belong to a different team than this district geography.</p>` : ""}
    </div></section>
    <dl class="ledger">
      <div><dt>Agri-entrepreneurs</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Teams</dt><dd>${st.teams}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
      <div><dt>ACs in frame</dt><dd>${st.acs}</dd></div>
    </dl>
    ${squadBlock(locals, "Named agri-entrepreneurs")}
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
      const personTeam = assignedTeam(f);
      return `<tr><td><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></td><td><a href="${href("farm/" + (farm ? farm.id : ""))}">${esc(farm ? farm.name : "—")}</a></td><td>${personTeam ? `<a href="${href("team/" + personTeam.id)}">${esc(personTeam.name)}</a>` : "—"}</td><td>${f.kind === "case-study" ? "Case study" : esc(stageLabel(f.stage))}</td></tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Assembly constituency</p>
      <h1>${esc(ac.officialNo ? ac.officialNo + " – " + ac.name : ac.name)}</h1>
      ${teamIdentity(team)}
      <p>${esc(d.name)} · target ${D.META.targetPerAc} farms at full book</p>
      ${people.some((f) => f.teamId && f.teamId !== ac.teamId) ? `<p class="meta">Named Model Farmers may belong to a different team than this assembly geography.</p>` : ""}
    </div></section>
    <dl class="ledger">
      <div><dt>Agri-entrepreneurs</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Teams</dt><dd>${st.teams}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
    </dl>
    ${people.length ? `<div class="table-wrap" style="margin-top:18px"><table class="data"><thead><tr><th>Agri-entrepreneur</th><th>Farm</th><th>Team</th><th>Record</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}`;
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

  function viewZone(id) {
    setNav("teams");
    const zone = D.byId(D.ZONES, id);
    if (!zone) return notFound("Zone", id);
    crumb([{ href: "#/", label: "West Bengal" }, { href: href("teams"), label: "Teams" }, { label: zone.name }]);
    const teams = D.teamsOfZone(zone.id);
    const rows = teams.map((t) => {
      const st = D.teamStats(t.id);
      return `<a class="reg-team" href="${href("team/" + t.id)}">${teamMark(t)}<div><strong>${esc(t.name)}</strong><span>${esc(teamRegion(t))}</span></div><span>${st.acs} assembly seats</span><span>Geography assigned</span></a>`;
    }).join("");
    const districts = [...new Set(teams.flatMap((t) => t.districts || []))].map((did) => `<a href="${href("district/" + did)}">${esc(nameOf("district", did))}</a>`).join(" · ");
    const zonePeople = teams.flatMap((t) => peopleOfTeam(t.id));
    return `<section class="ident"><div>
      <p class="mast-k">Programme zone</p>
      <h1>${esc(zone.name)}</h1>
      <p>Named zone assignment only. Other teams are not placed in a zone until a source says so.</p>
      ${districts ? `<p class="meta">${districts}</p>` : ""}
    </div></section>
    ${squadBlock(zonePeople, "Named agri-entrepreneurs")}
    <section class="league" style="margin-top:0">
      <div class="register-list">${rows}</div>
    </section>`;
  }

  function viewTeam(id) {
    setNav("teams");
    const team = D.byId(D.TEAMS, id);
    if (!team || team.placeholder) return notFound("Team", id);
    const zone = teamZone(team);
    const crumbs = [{ href: "#/", label: "West Bengal" }, { href: href("teams"), label: "Teams" }];
    if (zone) crumbs.push({ href: href("zone/" + zone.id), label: zone.name });
    crumbs.push({ label: team.name });
    crumb(crumbs);
    const st = D.teamStats(id);
    const teamAgents = D.AGENTS.filter((a) => a.teamId === id);
    const agentRows = teamAgents.map((a) => {
      const as = D.agentStats(a.id);
      return `<a class="reg-row" href="${href("agent/" + a.id)}"><b>${esc(a.code)}</b><span>${esc(a.name)}</span><em>${as.farmers ? as.farmers + (as.farmers === 1 ? " farmer" : " farmers") : ""}</em><em>${as.farms ? as.farms + (as.farms === 1 ? " farm" : " farms") : ""}</em></a>`;
    }).join("");
    const acts = D.ACTIVITIES.filter((a) => a.teamId === id);
    const actRows = acts.map((a) => {
      const farm = D.byId(D.FARMS, a.farmId);
      return `<a class="ops-line" href="${href("farm/" + a.farmId)}"><time>${esc(a.date)}</time><div><strong>${esc(a.title)}</strong><p>${esc(farm ? farm.name : "")}${a.note ? " · " + esc(a.note) : ""}</p></div></a>`;
    }).join("");
    const districts = team.districts.map((did) => `<a href="${href("district/" + did)}">${esc(nameOf("district", did))}</a>`).join(" · ");
    const acList = D.ACS.filter((a) => a.teamId === id).map((a) => `<a class="reg-row" href="${href("ac/" + a.id)}"><b>${esc(a.name)}</b><span>${esc(nameOf("district", a.districtId))}</span><em></em><em></em></a>`).join("");
    const squad = peopleOfTeam(id);
    return `<section class="ident ident-row">${teamMark(team)}<div>
      <p class="mast-k">Team identity</p>
      <h1>${esc(team.name)}</h1>
      ${zone ? `<p class="story-garden"><a href="${href("zone/" + zone.id)}">${esc(zone.name)}</a></p>` : ""}
      <p>${districts}</p>
      <p class="meta">Team relationship follows programme geography or a named assignment. Not a live enrolment record.</p>
    </div></section>
    <dl class="ledger">
      <div><dt>Agri-entrepreneurs</dt><dd>${st.farmers}</dd></div>
      <div><dt>Farms</dt><dd>${st.farms}</dd></div>
      <div><dt>Agents</dt><dd>${st.agents}</dd></div>
      <div><dt>ACs</dt><dd>${st.acs}</dd></div>
      <div><dt>Districts</dt><dd>${team.districts.length}</dd></div>
    </dl>
    ${squadBlock(squad, "Named agri-entrepreneurs")}
    ${teamAgents.length ? `<section>
      <h2 class="sec-title">Agents</h2>
      <div class="register">${agentRows}</div>
    </section>` : ""}
    ${actRows ? `<section>
      <h2 class="sec-title">Recorded activity</h2>
      ${actRows}
    </section>` : ""}
    <section class="register">
      <h2 class="sec-title">Assembly constituencies</h2>
      ${acList}
    </section>`;
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
      <p>Approved demo-book volume is ${D.DEMO_BOOK.agents} agents. Named agent records appear only when authored.</p>
    </div></section>
      ${list.length ? `${filtersBar(params)}
      <div class="table-wrap"><table class="data"><thead><tr><th>Code</th><th>Name</th><th>Team</th><th>Farmers</th><th>Farms</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${pager("agents", slice, params)}` : empty("No named agents yet", "The 120-agent demo-book volume is architecture, not a generated roster.")}`;
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
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Agri-entrepreneurs" }]);
    let list = D.FARMERS.slice();
    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter((f) => [f.name, f.gardenName, f.id].filter(Boolean).join(" ").toLowerCase().includes(q));
    }
    if (params.team) list = list.filter((f) => f.teamId === params.team);
    if (params.district) list = list.filter((f) => f.districtId === params.district);
    const slice = pageSlice(list, params.page);
    const cast = list.filter((f) => portraitOf(f) || sourceVideos(f).length).map((f) => {
      const clip = sourceVideos(f)[0];
      const portrait = portraitOf(f);
      return `<article class="cast">
        ${portrait ? personStill(f) : `<a class="story-still" href="${href("farmer/" + f.id)}"><img src="${ytThumb(clip.youtubeId)}" alt="${esc(clip.title)}"></a>`}
        <p class="label">${esc(f.gardenName || "Garden")}</p>
        <h2><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></h2>
        ${!portrait && clip ? `<p class="meta">${esc(clip.title)}</p>` : ""}
      </article>`;
    }).join("");
    const rows = slice.rows.map((f) => {
      const personTeam = assignedTeam(f);
      return `<tr>
      <td><a href="${href("farmer/" + f.id)}">${esc(f.name)}</a></td>
      <td><a href="${href("farm/" + f.farmIds[0])}">${esc(f.gardenName || "—")}</a></td>
      <td>${esc(placeLine(f, false) || "—")}</td>
      <td>${personTeam ? `<a href="${href("team/" + personTeam.id)}">${esc(personTeam.name)}</a>` : "—"}</td>
      <td>${f.districtId ? `<a href="${href("district/" + f.districtId)}">${esc(nameOf("district", f.districtId))}</a>` : "—"}</td>
      <td>${f.acId ? `<a href="${href("ac/" + f.acId)}">${esc(nameOf("ac", f.acId))}</a>` : "—"}</td>
    </tr>`;
    }).join("");
    return `<section class="ident"><div>
      <p class="mast-k">People</p>
      <h1>Agri-entrepreneurs</h1>
      <p>${list.length} named ${list.length === 1 ? "Model Farmer case study" : "Model Farmer case studies"}. A person may hold more than one farm or garden.</p>
    </div></section>
      ${cast ? `<section class="garden-cast">${cast}</section>` : ""}
      ${filtersBar(params)}
      ${list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Model Farmer</th><th>Farm / garden</th><th>Known location</th><th>Team</th><th>District</th><th>Assembly seat</th></tr></thead><tbody>${rows}</tbody></table></div>${pager("farmers", slice, params)}` : ""}`;
  }

  function viewFarmer(id) {
    setNav("farmers");
    const f = D.byId(D.FARMERS, id);
    if (!f) return notFound("Agri-entrepreneur", id);
    const team = assignedTeam(f);
    const zone = teamZone(team);
    const farm0 = D.byId(D.FARMS, f.farmIds[0]);
    const crumbs = [{ href: href(""), label: "West Bengal" }];
    if (f.teamSource === "named") {
      if (f.acId) crumbs.push({ href: href("ac/" + f.acId), label: f.village || nameOf("ac", f.acId) });
      else if (f.village) crumbs.push({ label: f.village });
      if (zone) crumbs.push({ href: href("zone/" + zone.id), label: zone.name });
      if (team) crumbs.push({ href: href("team/" + team.id), label: team.name });
    } else {
      if (f.districtId) crumbs.push({ href: href("district/" + f.districtId), label: nameOf("district", f.districtId) });
      if (f.acId) crumbs.push({ href: href("ac/" + f.acId), label: nameOf("ac", f.acId) });
      if (team) crumbs.push({ href: href("team/" + team.id), label: team.name });
    }
    crumbs.push({ label: f.name });
    crumb(crumbs);
    const farmRows = f.farmIds.map((fid) => {
      const farm = D.byId(D.FARMS, fid);
      if (!farm) return "";
      const meta = [farm.sizeAcres != null ? farm.sizeAcres + " acres" : null, farm.crop].filter(Boolean).join(" · ");
      return `<a class="reg-row" href="${href("farm/" + fid)}"><b>${esc(farm.name)}</b><span>${esc(meta || "Named garden / farm record")}</span><em></em><em></em></a>`;
    }).join("");
    const whereBits = [];
    if (f.acId) {
      const acName = nameOf("ac", f.acId);
      whereBits.push(`<a href="${href("ac/" + f.acId)}">${esc(f.village && f.village !== acName ? f.village + " · " + acName : acName)}</a>`);
    } else if (f.village) {
      whereBits.push(esc(f.village));
    }
    if (f.districtId && f.teamSource !== "named") whereBits.push(`<a href="${href("district/" + f.districtId)}">${esc(nameOf("district", f.districtId))}</a>`);
    if (zone) whereBits.push(`<a href="${href("zone/" + zone.id)}">${esc(zone.name)}</a>`);
    if (team) whereBits.push(`<a href="${href("team/" + team.id)}">${esc(team.name)}</a>`);
    whereBits.push("West Bengal");
    const grow = f.whatTheyGrow || [];
    const does = f.whatTheyDo || [];
    const story = f.story && f.story.text ? f.story : null;
    const space = f.farmSpace || f.space;
    const vision = f.smartFarmingVision || f.vision;
    return `<div data-motion="page">
      ${playerHero(f)}
      ${story ? `<section class="farmer-story">
        <p class="sec-k">Agri-entrepreneur story</p>
        <h2>The person, not a success score</h2>
        <p>${esc(story.text)}</p>
        ${story.source ? `<p class="meta">Source · ${esc(story.source)}</p>` : ""}
      </section>` : ""}
      <section class="story-chapters">
        <article>
          <h2>What they grow and do</h2>
          <p>${f.farmIds.map((fid) => `<a href="${href("farm/" + fid)}">${esc(nameOf("farm", fid))}</a>`).join(" · ")} is the known garden. Size, yield and income stay hidden until evidenced.</p>
          ${grow.length ? `<p class="meta">What they grow</p>${growChips(grow)}` : ""}
          ${does.length ? `<p class="meta">What they do</p>${growChips(does)}` : ""}
          ${f.practice ? `<p class="meta">${esc(f.practice)}</p>` : ""}
        </article>
        ${whereBits.length || team ? `<article>
          <h2>Geography and team</h2>
          ${whereBits.length ? `<p>${whereBits.join(" · ")}</p>` : ""}
          ${team ? `<p><a href="${href("team/" + team.id)}">${esc(team.name)}</a>${zone ? ` · <a href="${href("zone/" + zone.id)}">${esc(zone.name)}</a>` : ""}. ${esc(teamNote(f))}</p>` : ""}
        </article>` : ""}
        ${space ? `<article><h2>Farm space</h2><p>${esc(space)}</p></article>` : ""}
        ${vision ? `<article><h2>Smart farming vision</h2><p>${esc(typeof vision === "string" ? vision : vision.text)}</p></article>` : ""}
      </section>
      ${editorialContext(f)}
      ${cinemaStage(f)}
      ${digitalDesk(f)}
      <section class="register">
        <h2 class="sec-title">Farm 360</h2>
        <p class="media-note">The holding record is separate from the person. Open it only for what is known about the garden.</p>
        ${farmRows}
      </section>
    </div>`;
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
      <td>${esc(placeLine(f, false) || "—")}</td>
      <td>${f.districtId ? esc(nameOf("district", f.districtId)) : "—"}</td>
    </tr>`).join("");
    return `<section class="ident"><div>
      <p class="mast-k">Holdings</p>
      <h1>Farms / gardens</h1>
      <p>${list.length} named ${list.length === 1 ? "holding" : "holdings"}. Distinct from the agri-entrepreneur who holds them.</p>
    </div></section>
      ${filtersBar(params)}
      ${list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Farm / garden</th><th>Agri-entrepreneur</th><th>Known location</th><th>District</th></tr></thead><tbody>${rows}</tbody></table></div>${pager("farms", slice, params)}` : ""}`;
  }

  function farmTabs(farm, tab) {
    const tabs = farmArchitectureTabs();
    return `<nav class="tabs" aria-label="Farm sections">${tabs.map(([id, label]) =>
      `<a href="${href("farm/" + farm.id + "/" + id)}" ${tab === id ? 'aria-current="page"' : ""}${!farmHasTab(farm, id) && id !== "overview" ? ' data-empty="true"' : ""}>${label}</a>`
    ).join("")}</nav>`;
  }

  function farmHeader(farm) {
    const farmer = D.byId(D.FARMERS, farm.farmerId);
    const team = assignedTeam(farmer) || (farm.teamId ? D.byId(D.TEAMS, farm.teamId) : null);
    const zone = teamZone(team);
    const crumbs = [{ href: href(""), label: "West Bengal" }];
    if (farmer && farmer.teamSource === "named") {
      if (farm.acId) crumbs.push({ href: href("ac/" + farm.acId), label: farm.village || nameOf("ac", farm.acId) });
      else if (farm.village) crumbs.push({ label: farm.village });
      if (zone) crumbs.push({ href: href("zone/" + zone.id), label: zone.name });
      if (team) crumbs.push({ href: href("team/" + team.id), label: team.name });
    } else {
      if (farm.districtId) crumbs.push({ href: href("district/" + farm.districtId), label: nameOf("district", farm.districtId) });
      if (farm.acId) crumbs.push({ href: href("ac/" + farm.acId), label: nameOf("ac", farm.acId) });
      if (team) crumbs.push({ href: href("team/" + team.id), label: team.name });
    }
    crumbs.push({ href: href("farmer/" + farm.farmerId), label: farmer.name });
    crumbs.push({ label: farm.name });
    crumb(crumbs);
    const visual = farm.contextualMediaId ? D.mediaById(farm.contextualMediaId) : null;
    const clip = !visual && farmer ? sourceVideos(farmer)[0] : null;
    const place = placeLine(farm, !!farm.districtId);
    return `<section class="dossier${visual || clip ? "" : " dossier-plain"}">
      ${visual ? `<figure class="dossier-visual"><img src="${esc(visual.src)}" alt="${esc(visual.caption)}"></figure>` : clip ? `<figure class="dossier-visual"><a class="story-still" href="${href("farmer/" + farmer.id)}"><img src="${ytThumb(clip.youtubeId)}" alt="${esc(clip.title)}"></a></figure>` : ""}
      <div>
        <p class="label">${farm.kind === "case-study" ? "Farm 360 · field intelligence" : "Farm 360 · field intelligence"}</p>
        <h1>${esc(farm.name)}</h1>
        ${farmer ? `<p class="player-garden"><a href="${href("farmer/" + farmer.id)}">${esc(farmer.name)}</a></p>` : ""}
        ${farmerChain(farmer, farm)}
        ${place ? `<p class="meta">${esc(place)}</p>` : ""}
        ${team ? teamIdentity(team, zone ? zone.name : "") : ""}
        ${farmer ? `<p class="meta">${esc(teamNote(farmer))}</p>` : ""}
        <p class="story-links">${farmer ? `<a class="btn" href="${href("farmer/" + farmer.id)}">Explore entrepreneur</a>` : ""}</p>
        <dl class="dossier-meta">
          <div><dt>Who</dt><dd><a href="${href("farmer/" + farmer.id)}">${esc(farmer.name)}</a></dd></div>
          ${place ? `<div><dt>Where</dt><dd>${esc(place)}</dd></div>` : ""}
          ${farm.sizeAcres != null || farm.crop ? `<div><dt>What</dt><dd>${[farm.sizeAcres != null ? farm.sizeAcres + " acres" : null, farm.crop].filter(Boolean).join(" · ")}</dd></div>` : ""}
        </dl>
      </div>
      <div class="dossier-prog">
        ${team && team.logo ? `<img class="dossier-crest" src="${esc(team.logo)}" alt="${esc(team.name)} official mark">` : ""}
        ${typeof farm.progress === "number" ? `<b>${farm.progress}</b><span>${esc(stageLabel(farm.stage))}<br>Path share, not yield</span>` : `<span>Named garden record<br>No invented progress</span>`}
      </div>
    </section>`;
  }

  function viewFarm(id, tab) {
    setNav("farms");
    const farm = D.byId(D.FARMS, id);
    if (!farm) return notFound("Farm", id);
    const farmer = D.byId(D.FARMERS, farm.farmerId);
    const agent = farm.agentId ? D.byId(D.AGENTS, farm.agentId) : null;
    const allowed = farmAvailableTabs(farm).map((x) => x[0]);
    const architecture = farmArchitectureTabs().map((x) => x[0]);
    const current = architecture.includes(tab) ? tab : "overview";
    const head = farmHeader(farm) + farmTabs(farm, current);
    const labels = Object.fromEntries(farmArchitectureTabs());
    if (current !== "overview" && !allowed.includes(current)) {
      return head + farmEmpty(labels[current] || "This section");
    }

    if (current === "journey") {
      const items = (farm.journey || []).filter((j) => j.date).map((j) => `<li data-status="${esc(j.status)}">
        <time>${esc(j.date)}</time><i></i>
        <div><h3>${esc(j.title)}</h3><p>${esc(j.note)}${agent ? " · " + esc(agent.code) : ""}</p></div>
      </li>`).join("");
      return head + `<ol class="journey">${items}</ol>`;
    }

    if (current === "smart") {
      const cards = smartRows(farm).map((row) => `<article>
          <h3>${esc(row.cat.label)}</h3>
          <div class="progress"><span class="bar" aria-hidden="true"><i style="width:${row.pct}%"></i></span><strong>${row.pct}%</strong></div>
          <p>${statusBadge(row.status)}${row.updated ? " · " + esc(row.updated) : ""}</p>
          <p>${esc(row.note)}</p>
        </article>`).join("");
      return head + `<div class="smart">${cards}</div>`;
    }

    if (current === "monitor") {
      const latest = D.ACTIVITIES.find((a) => a.farmId === farm.id);
      return head + `<dl class="ledger">
        <div><dt>Current stage</dt><dd style="font-size:16px">${esc(stageLabel(farm.stage))}</dd></div>
        ${farm.lastVisit ? `<div><dt>Last visit</dt><dd style="font-size:16px">${esc(farm.lastVisit)}</dd></div>` : ""}
        ${agent ? `<div><dt>Agent</dt><dd style="font-size:16px">${esc(agent.code)}</dd></div>` : ""}
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
        const cap = [e.caption || captionFor(e.type, e.title), farm.name, e.attribution].filter(Boolean).join(" · ");
        return `<figure class="${i === 0 ? "wide" : ""}">${media}<figcaption>${esc(cap)}</figcaption></figure>`;
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
        const link = p.id && (p.role === "Farmer" || p.role === "Agri-entrepreneur") ? href("farmer/" + p.id)
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
      const owner = D.byId(D.FARMERS, farm.farmerId);
      return head + cinemaStage(owner) + `<p>${esc((farm.social && farm.social.note) || "")}</p><div class="people" style="margin-top:14px">${rows}</div>`;
    }

    const where = placeLine(farm, !!farm.districtId);
    const farmTeam = assignedTeam(farmer);
    return head + `<div class="narrative">
      <ol class="spine">
        <li><h3>Who</h3><p><a href="${href("farmer/" + farmer.id)}">${esc(farmer.name)}</a></p></li>
        ${where ? `<li><h3>Where</h3><p>${esc(where)}</p></li>` : ""}
        <li><h3>Farm / garden</h3><p>${esc(farm.name)}</p></li>
        ${farmTeam ? `<li><h3>Team</h3><p><a href="${href("team/" + farmTeam.id)}">${esc(farmTeam.name)}</a></p></li>` : ""}
        ${farmer && (farmer.whatTheyGrow || []).length ? `<li><h3>What they grow</h3>${growChips(farmer.whatTheyGrow)}</li>` : farm.sizeAcres != null || farm.crop ? `<li><h3>What they grow / do</h3><p>${[farm.sizeAcres != null ? farm.sizeAcres + " acres" : null, farm.crop].filter(Boolean).join(" · ")}</p></li>` : ""}
        ${farmer && (farmer.whatTheyDo || []).length ? `<li><h3>What they do</h3>${growChips(farmer.whatTheyDo)}</li>` : ""}
        <li><h3>People</h3><p>${allowed.includes("people") ? `<a href="${href("farm/" + farm.id + "/people")}">Support network</a>` : "Named people appear when recorded."}</p></li>
        <li><h3>Digital presence</h3><p>${allowed.includes("social") ? `<a href="${href("farm/" + farm.id + "/social")}">Source channels</a>` : "Source channels appear when published."}</p></li>
      </ol>
      <aside>
        <p class="sec-k">Field intelligence</p>
        <h2 class="display-s">Show what we know</h2>
        <p class="now">${farm.kind === "case-study" ? "Named garden record. Crop size, yield, GPS and operational history stay hidden until evidenced." : "Named garden record."}</p>
        ${farmEmpty("Journey, smart farming and monitoring")}
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
      <p>Field activities appear only when a record exists. None are authored in this book.</p>
    </div></section>
      ${rows ? `${filtersBar(params)}<div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Activity</th><th>Farm</th><th>Agent</th><th>AC</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>${pager("activity", slice, params)}` : empty("No field activities yet", "Activities are authored records. Media does not create an activity.")}`;
  }

  function viewMedia() {
    setNav("media");
    crumb([{ href: "#/", label: "West Bengal" }, { label: "Media" }]);
    const featured = D.uniqueMedia(D.mediaWhere("featured"));
    const supporting = D.uniqueMedia(D.mediaWhere("supporting"));
    const field = D.uniqueMedia(D.mediaWhere("field"));
    const session = D.mediaWhere("link")[0];
    const feat = featured[0];
    return `<section class="ident"><div>
      <p class="label">Archive</p>
      <h1>Media</h1>
      <p class="lede">Editorially curated stills. Each photograph appears once, in its own context.</p>
    </div></section>
      ${feat || supporting.length ? `<section class="media-desk">
        ${feat ? `<figure class="media-lead">
          <p class="label">Featured · editorial / programme</p>
          <img src="${esc(feat.src)}" alt="${esc(feat.caption)}">
          <figcaption>${esc(feat.caption)} · ${esc(feat.context)}${feat.date ? " · " + esc(feat.date) : ""}</figcaption>
        </figure>` : ""}
        ${supporting.length ? `<div class="media-col">
          <p class="label">Supporting · editorial / programme</p>
          ${supporting.map((m) => `<figure>
            <img src="${esc(m.src)}" alt="${esc(m.caption)}">
            <figcaption>${esc(m.caption)} · ${esc(m.context)}</figcaption>
          </figure>`).join("")}
        </div>` : ""}
      </section>` : ""}
      ${field.length ? `<section class="media-field">
        <p class="label">Field context · editorial</p>
        <p class="media-note">Editorial agriculture photographs. Not verified farm evidence.</p>
        <div class="media-strip">${field.map((m) => `<figure>
          <img src="${esc(m.src)}" alt="${esc(m.caption)}">
          <figcaption>${esc(m.caption)} · ${esc(m.context)}</figcaption>
        </figure>`).join("")}</div>
      </section>` : ""}
      ${session ? `<p class="session-link">Programme session film · <a href="${esc(session.src)}" target="_blank" rel="noopener noreferrer">${esc(session.caption)}</a></p>` : ""}
      ${campaignDesk()}
      ${gardenOnCamera()}
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
      <p>Published architecture and named case studies. Not live enrolment.</p>
    </div></section>
      <dl class="ledger">
        <div><dt>Case studies</dt><dd>${s.caseStudies}</dd></div>
        <div><dt>Demo farmers</dt><dd>${s.demoFarmers}</dd></div>
        <div><dt>Demo farms</dt><dd>${s.demoFarms}</dd></div>
        <div><dt>Demo agents</dt><dd>${s.demoAgents}</dd></div>
        <div><dt>Official teams</dt><dd>${s.teams}</dd></div>
        <div><dt>Programme target</dt><dd>${s.targetFarmers.toLocaleString("en-IN")}</dd></div>
      </dl>
      ${networkModel()}
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
    else if (root === "zone" && parts[1]) html = viewZone(parts[1]);
    else if (root === "team" && parts[1]) html = viewTeam(parts[1]);
    else if (root === "agents") html = viewAgents(params);
    else if (root === "agent" && parts[1]) html = viewAgent(parts[1]);
    else if (root === "farmers" || root === "entrepreneurs") html = viewFarmers(params);
    else if ((root === "farmer" || root === "entrepreneur") && parts[1]) html = viewFarmer(parts[1]);
    else if (root === "farms") html = viewFarms(params);
    else if (root === "farm" && parts[1]) html = viewFarm(parts[1], resolveFarmTab(parts[2]));
    else if (root === "activity") html = viewActivity(params);
    else if (root === "media") html = viewMedia();
    else if (root === "reports") html = viewReports();
    else html = notFound("Page", parts.join("/"));
    app.innerHTML = html;
    closeNav();
    closeLang();
    const h = app.querySelector("h1");
    if (h) h.setAttribute("tabindex", "-1");
    if (h && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) h.focus({ preventScroll: true });
    if (window.KRLMotion) window.KRLMotion.boot();
    bootHeroLogo();
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
    const route = { district: "district", ac: "ac", zone: "zone", team: "team", agent: "agent", farmer: "farmer", farm: "farm" };
    searchResults.innerHTML = hits.map((h) => `<li><a href="${href(route[h.type] + "/" + h.id)}"><small>${esc(h.type)}</small>${esc(h.label)}</a></li>`).join("");
  }

  const langToggle = document.getElementById("lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const menuBtn = document.getElementById("open-menu");
  const siteMenu = document.getElementById("site-menu");

  function langOpen() {
    return langMenu && !langMenu.hidden;
  }

  function closeLang() {
    if (!langMenu || !langToggle) return;
    langMenu.hidden = true;
    langToggle.setAttribute("aria-expanded", "false");
  }

  function openLang() {
    if (!langMenu || !langToggle) return;
    langMenu.hidden = false;
    langToggle.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    document.body.classList.add("nav-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    closeLang();
  }

  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (langOpen()) closeLang();
      else openLang();
    });
  }
  if (langMenu) {
    langMenu.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang]");
      if (!btn) return;
      try { localStorage.setItem("krl-lang", btn.dataset.lang); } catch (_) {}
      closeLang();
      closeNav();
      render();
    });
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (document.body.classList.contains("nav-open")) closeNav();
      else openNav();
    });
  }
  if (siteMenu) {
    siteMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#lang-dd")) closeLang();
  });
  document.getElementById("open-search").addEventListener("click", () => {
    closeNav();
    closeLang();
    openSearch();
  });
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
    if (e.key === "Escape") {
      closeSearch();
      closeLang();
      closeNav();
    }
  });
  window.addEventListener("hashchange", closeNav);
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
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      const el = document.getElementById(jump.getAttribute("data-jump"));
      if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    const stage = e.target.closest("[data-embed]");
    if (stage && !stage.querySelector("iframe")) {
      const id = stage.getAttribute("data-embed");
      const title = stage.getAttribute("data-title") || "Garden film";
      stage.innerHTML = `<iframe src="https://www.youtube.com/embed/${esc(id)}?rel=0&autoplay=1" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }
  });
  window.addEventListener("hashchange", render);
  applyLang();
  render();
})();
