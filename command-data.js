/* KRL Smart Farming Command Centre — knowledge-base data.
   SHOW WHAT WE KNOW. HIDE WHAT WE DON'T.
   Programme targets (5,000 farms, 294 ACs, 15 teams) come from the
   published KRL Bengal brief. Row-level farmer, farm, agent and activity
   records exist only when authored. Twenty-team capacity is internal
   architecture only and is never represented as empty public slots. */
(function (global) {
  "use strict";

  const STAGES = [
    { id: "registered", label: "Registered", bn: "নিবন্ধিত" },
    { id: "verified", label: "Verified", bn: "যাচাই" },
    { id: "onboarded", label: "Onboarded", bn: "অন্তর্ভুক্ত" },
    { id: "training", label: "Training", bn: "প্রশিক্ষণ" },
    { id: "plan", label: "Smart farming plan", bn: "স্মার্ট ফার্ম পরিকল্পনা" },
    { id: "implementation", label: "Implementation", bn: "বাস্তবায়ন" },
    { id: "monitoring", label: "Monitoring", bn: "নিরীক্ষণ" },
    { id: "harvest", label: "Harvest / outcome", bn: "ফসল / ফল" },
  ];

  const STATUSES = [
    { id: "not_started", label: "Not started" },
    { id: "planned", label: "Planned" },
    { id: "in_progress", label: "In progress" },
    { id: "completed", label: "Completed" },
    { id: "blocked", label: "Blocked" },
  ];

  const SCORE_AXES = [
    { id: "sat", label: "Sat", gloss: "Organic purity" },
    { id: "mangalmay", label: "Mangalmay", gloss: "Smart innovation" },
    { id: "sundar", label: "Sundar", gloss: "Farm design" },
    { id: "samriddhi", label: "Samriddhi", gloss: "Prosperity" },
  ];

  const SMART_CATS = [
    { id: "crop", label: "Crop management" },
    { id: "irrigation", label: "Irrigation" },
    { id: "soil", label: "Soil management" },
    { id: "water", label: "Water management" },
    { id: "organic", label: "Organic inputs" },
    { id: "machinery", label: "Farm machinery" },
    { id: "weather", label: "Weather monitoring" },
    { id: "pest", label: "Pest monitoring" },
    { id: "waste", label: "Waste management" },
    { id: "livestock", label: "Livestock / poultry" },
    { id: "aqua", label: "Aquaculture" },
    { id: "energy", label: "Renewable energy" },
  ];

  const TEAMS = [
    { id: "himalayan-giants", logo: "images/teams/himalayan-giants.png", name: "Himalayan Giants", short: "HG", accent: "#3d5278", districts: ["darjeeling", "kalimpong"] },
    { id: "terai-tuskers", logo: "images/teams/terai-tuskers.png", name: "Terai Tuskers", short: "TT", accent: "#5a4a32", districts: ["jalpaiguri", "alipurduar", "uttar-dinajpur"] },
    { id: "cooch-behar-royals", logo: "images/teams/cooch-behar-royals.png", name: "Cooch Behar Royals", short: "CR", accent: "#6b3a4a", districts: ["cooch-behar"] },
    { id: "dinajpur-defenders", logo: "images/teams/dinajpur-defenders.png", name: "Dinajpur Defenders", short: "DD", accent: "#3a5a48", districts: ["dakshin-dinajpur"] },
    { id: "malda-kings", logo: "images/teams/malda-kings.png", name: "Malda Kings", short: "MK", accent: "#7a5a20", districts: ["malda"] },
    { id: "murshidabad-nawabs", logo: "images/teams/murshidabad-nawabs.png", name: "Murshidabad Nawabs", short: "MN", accent: "#4a3a5c", districts: ["murshidabad"] },
    { id: "nadia-warriors", logo: "images/teams/nadia-warriors.png", name: "Nadia Warriors", short: "NW", accent: "#2f5a4a", districts: ["nadia"] },
    { id: "bardhaman-bigha-kings", logo: "images/teams/bardhaman-bigha-kings.png", name: "Bardhaman Bigha Kings", short: "BK", accent: "#6a4a28", districts: ["purba-bardhaman", "paschim-bardhaman"] },
    { id: "hooghly-harits", logo: "images/teams/hooghly-harits.png", name: "Hooghly Harits", short: "HH", accent: "#3d6a38", districts: ["hooghly"] },
    { id: "birbhum-blasters", logo: "images/teams/birbhum-blasters.png", name: "Birbhum Blasters", short: "BB", accent: "#6a3a28", districts: ["birbhum"] },
    { id: "bankura-bulls", logo: "images/teams/bankura-bulls.png", name: "Bankura Bulls", short: "BU", accent: "#4a4030", districts: ["bankura"] },
    { id: "purulia-panthers", logo: "images/teams/purulia-panthers.png", name: "Purulia Panthers", short: "PP", accent: "#3a3a48", districts: ["purulia"] },
    { id: "medinipur-mavericks", logo: "images/teams/medinipur-mavericks.png", name: "Medinipur Mavericks", short: "MM", accent: "#2a4a5c", districts: ["jhargram", "paschim-medinipur", "purba-medinipur"] },
    { id: "ganga-gladiators", logo: "images/teams/ganga-gladiators.png", name: "Ganga Gladiators", short: "GG", accent: "#2a3a6c", districts: ["howrah", "kolkata"] },
    { id: "sundarban-strikers", logo: "images/teams/sundarban-strikers.png", name: "Sundarban Strikers", short: "SS", accent: "#2a5a50", districts: ["north-24-parganas", "south-24-parganas"] },
  ];

  const TEAM_CAPACITY = 20;

  const DISTRICTS = [
    { id: "darjeeling", name: "Darjeeling", zone: "hills", x: 38, y: 6, acs: ["Darjeeling", "Kurseong", "Matigara-Naxalbari", "Siliguri", "Phansidewa"] },
    { id: "kalimpong", name: "Kalimpong", zone: "hills", x: 48, y: 5, acs: ["Kalimpong"] },
    { id: "jalpaiguri", name: "Jalpaiguri", zone: "terai", x: 46, y: 12, acs: ["Dhupguri", "Maynaguri", "Jalpaiguri", "Rajganj", "Dabgram-Phulbari", "Mal", "Nagrakata"] },
    { id: "alipurduar", name: "Alipurduar", zone: "terai", x: 58, y: 10, acs: ["Kumargram", "Kalchini", "Alipurduars", "Falakata", "Madarihat"] },
    { id: "cooch-behar", name: "Cooch Behar", zone: "north", x: 68, y: 12, acs: ["Mekliganj", "Mathabhanga", "Cooch Behar Uttar", "Cooch Behar Dakshin", "Sitalkuchi", "Sitai", "Dinhata", "Natabari", "Tufanganj"] },
    { id: "uttar-dinajpur", name: "Uttar Dinajpur", zone: "north", x: 42, y: 22, acs: ["Chopra", "Islampur", "Goalpokhar", "Chakulia", "Karandighi", "Hemtabad", "Kaliaganj", "Raiganj", "Itahar"] },
    { id: "dakshin-dinajpur", name: "Dakshin Dinajpur", zone: "north", x: 50, y: 28, acs: ["Kushmandi", "Kumarganj", "Balurghat", "Tapan", "Gangarampur", "Harirampur"] },
    { id: "malda", name: "Malda", zone: "north", x: 44, y: 36, acs: ["Habibpur", "Gazole", "Chanchal", "Harishchandrapur", "Malatipur", "Ratua", "Manikchak", "Maldaha", "English Bazar", "Mothabari", "Sujapur", "Baisnabnagar"] },
    { id: "murshidabad", name: "Murshidabad", zone: "central", x: 42, y: 46, acs: ["Farakka", "Samserganj", "Suti", "Jangipur", "Raghunathganj", "Sagardighi", "Lalgola", "Bhagawangola", "Murshidabad", "Nabagram", "Khargram", "Burwan", "Kandi", "Bharatpur", "Rejinagar", "Beldanga", "Baharampur", "Hariharpara", "Naoda", "Domkal", "Jalangi", "Raninagar"] },
    { id: "nadia", name: "Nadia", zone: "central", x: 52, y: 54, acs: ["Karimpur", "Tehatta", "Palashipara", "Kaliganj", "Nakashipara", "Chapra", "Krishnanagar Uttar", "Nabadwip", "Krishnanagar Dakshin", "Santipur", "Ranaghat Uttar Paschim", "Krishnaganj", "Ranaghat Uttar Purba", "Ranaghat Dakshin", "Chakdaha", "Kalyani", "Haringhata"] },
    { id: "birbhum", name: "Birbhum", zone: "west", x: 30, y: 50, acs: ["Dubrajpur", "Suri", "Bolpur", "Nanoor", "Labhpur", "Sainthia", "Mayureswar", "Rampurhat", "Hansan", "Nalhati", "Murarai"] },
    { id: "purba-bardhaman", name: "Purba Bardhaman", zone: "west", x: 38, y: 58, acs: ["Bhatar", "Galsi", "Bardhaman Dakshin", "Raina", "Jamalpur", "Monteswar", "Kalna", "Memari", "Bardhaman Uttar", "Purbasthali Dakshin", "Purbasthali Uttar", "Katwa", "Ketugram", "Mangalkot", "Ausgram", "Khandaghosh"] },
    { id: "paschim-bardhaman", name: "Paschim Bardhaman", zone: "west", x: 28, y: 58, acs: ["Pandaveswar", "Durgapur Purba", "Durgapur Paschim", "Raniganj", "Jamuria", "Asansol Dakshin", "Asansol Uttar", "Kulti", "Barabani", "Hirapur", "Ondal"] },
    { id: "hooghly", name: "Hooghly", zone: "south", x: 46, y: 64, acs: ["Uttarpara", "Sreerampur", "Champdani", "Singur", "Chandannagar", "Chunchura", "Balagarh", "Pandua", "Saptagram", "Chanditala", "Jangipara", "Haripal", "Dhanekhali", "Tarakeswar", "Pursurah", "Arambagh", "Goghat", "Khanakul"] },
    { id: "bankura", name: "Bankura", zone: "west", x: 22, y: 64, acs: ["Saltora", "Chhatna", "Ranibandh", "Raipur", "Taldangra", "Bankura", "Barjora", "Onda", "Bishnupur", "Katulpur", "Indas", "Sonamukhi"] },
    { id: "purulia", name: "Purulia", zone: "west", x: 12, y: 62, acs: ["Bandwan", "Balarampur", "Baghmundi", "Joypur", "Purulia", "Manbazar", "Kashipur", "Para", "Raghunathpur"] },
    { id: "jhargram", name: "Jhargram", zone: "south-west", x: 16, y: 72, acs: ["Nayagram", "Gopiballavpur", "Jhargram", "Garbeta"] },
    { id: "paschim-medinipur", name: "Paschim Medinipur", zone: "south-west", x: 26, y: 74, acs: ["Dantan", "Keshiary", "Kharagpur", "Narayangarh", "Sabang", "Pingla", "Debra", "Daspur", "Ghatal", "Chandrakona", "Keshpur", "Salboni", "Medinipur", "Binpur"] },
    { id: "purba-medinipur", name: "Purba Medinipur", zone: "south-west", x: 36, y: 80, acs: ["Tamluk", "Panskura", "Moyna", "Nandakumar", "Mahisadal", "Haldia", "Nandigram", "Chandipur", "Patashpur", "Kanthi", "Bhagabanpur", "Khejuri", "Ramnagar", "Egra", "Contai"] },
    { id: "howrah", name: "Howrah", zone: "south", x: 50, y: 70, acs: ["Bally", "Howrah Uttar", "Howrah Madhya", "Shibpur", "Howrah Dakshin", "Sankrail", "Panchla", "Uluberia Purba", "Uluberia Uttar", "Uluberia Dakshin", "Shyampur", "Bagnan", "Amta", "Udaynarayanpur", "Jagatballavpur", "Domjur"] },
    { id: "kolkata", name: "Kolkata", zone: "south", x: 56, y: 68, acs: ["Chowrangee", "Entally", "Beleghata", "Jorasanko", "Shyampukur", "Maniktala", "Kashipur-Belgachhia", "Kolkata Port", "Bhabanipur", "Rashbehari", "Ballygunge"] },
    { id: "north-24-parganas", name: "North 24 Parganas", zone: "south", x: 62, y: 60, acs: ["Bagda", "Bongaon Uttar", "Bongaon Dakshin", "Gaighata", "Swarupnagar", "Baduria", "Habra", "Ashoknagar", "Amdanga", "Bijpur", "Naihati", "Bhatpara", "Jagatdal", "Noapara", "Barrackpur", "Khardaha", "Dum Dum Uttar", "Panihati", "Kamarhati", "Baranagar", "Dum Dum", "Rajarhat New Town", "Bidhannagar", "Rajarhat Gopalpur", "Madhyamgram", "Barasat", "Deganga", "Haroa", "Minakhan", "Sandeshkhali", "Basirhat Dakshin", "Basirhat Uttar", "Hingalganj"] },
    { id: "south-24-parganas", name: "South 24 Parganas", zone: "delta", x: 60, y: 78, acs: ["Gosaba", "Basanti", "Kultali", "Patharpratima", "Kakdwip", "Sagar", "Kulpi", "Raidighi", "Mandirbazar", "Jaynagar", "Baruipur Purba", "Canning Paschim", "Canning Purba", "Baruipur Paschim", "Magrahat Purba", "Magrahat Paschim", "Diamond Harbour", "Falta", "Satgachhia", "Bishnupur", "Sonarpur Uttar", "Sonarpur Dakshin", "Bhangar Uttar", "Bhangar Dakshin", "Kasba", "Behala Purba", "Behala Paschim", "Maheshtala", "Budge Budge", "Metiabruz", "Jadavpur"] },
  ];

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function pad(n, w) {
    return String(n).padStart(w, "0");
  }

  function dateBetween(rng, start, end) {
    const a = start.getTime();
    const b = end.getTime();
    return new Date(a + rng() * (b - a));
  }

  function fmtDate(d) {
    return d.toISOString().slice(0, 10);
  }

  const teamByDistrict = {};
  TEAMS.forEach((t) => t.districts.forEach((d) => { teamByDistrict[d] = t.id; }));

  const acs = [];
  DISTRICTS.forEach((d) => {
    d.acs.forEach((name, i) => {
      acs.push({
        id: d.id + "-" + slug(name),
        name,
        districtId: d.id,
        teamId: teamByDistrict[d.id] || "sundarban-strikers",
        index: i + 1,
      });
    });
  });

  const TARGET_FARMS = 5000;
  const TARGET_PER_AC = 20;
  const CROPS = ["Paddy", "Vegetables", "Mustard", "Jute", "Integrated pond", "Banana", "Pulses"];

  const agents = [
    {
      id: "ag-024",
      code: "AG-024",
      name: "Agent 024",
      teamId: "terai-tuskers",
      districtId: "jalpaiguri",
    },
  ];

  const farmers = [
    {
      id: "farmer-014",
      code: "F-014",
      name: "Farmer 014",
      village: "Maynaguri",
      districtId: "jalpaiguri",
      acId: "jalpaiguri-maynaguri",
      teamId: "terai-tuskers",
      agentId: "ag-024",
      stage: "implementation",
      progress: 68,
      farmIds: ["maa-ganga"],
      voice: "I want the pond and the vegetable beds to work together this season. Water is the first problem.",
      goal: "Stabilise irrigation before the next paddy cycle.",
      challenge: "Uneven water in the west plot.",
      achievement: "Baseline walk and drip layout marked.",
    },
  ];

  const farms = [
    {
      id: "maa-ganga",
      name: "Maa Ganga Smart Farm",
      farmerId: "farmer-014",
      districtId: "jalpaiguri",
      acId: "jalpaiguri-maynaguri",
      village: "Maynaguri",
      teamId: "terai-tuskers",
      agentId: "ag-024",
      sizeAcres: 2.4,
      crop: "Integrated pond and vegetables",
      stage: "implementation",
      progress: 68,
      status: "in_progress",
      lastVisit: "2026-09-24",
      alerts: [],
      contextualMediaId: "med-irrigation",
      plots: [
        { id: "plot-a", name: "West plot", size: "1.1 acres", crop: "Vegetables" },
        { id: "plot-b", name: "East plot", size: "0.8 acres", crop: "Paddy nursery" },
        { id: "plot-c", name: "Pond edge", size: "0.5 acres", crop: "Aquaculture" },
      ],
      smart: {
        crop: { status: "in_progress", pct: 70, updated: "2026-09-22", note: "Vegetable beds laid. Paddy nursery started." },
        irrigation: { status: "in_progress", pct: 80, updated: "2026-09-24", note: "Drip laterals marked. Main line pending." },
        soil: { status: "completed", pct: 100, updated: "2026-09-18", note: "Baseline walk completed with agent AG-024." },
        water: { status: "in_progress", pct: 40, updated: "2026-09-23", note: "West plot dries faster than the pond edge." },
        organic: { status: "planned", pct: 25, updated: "2026-09-20", note: "Compost bay sited. Not built." },
        machinery: { status: "not_started", pct: 0, updated: null, note: "No machinery claim on this record." },
        weather: { status: "planned", pct: 15, updated: "2026-09-21", note: "Phone weather watch only." },
        pest: { status: "not_started", pct: 0, updated: null, note: "Not claimed." },
        waste: { status: "planned", pct: 20, updated: "2026-09-19", note: "Pond silt reuse discussed." },
        livestock: { status: "not_started", pct: 0, updated: null, note: "Not part of this farm cycle." },
        aqua: { status: "in_progress", pct: 55, updated: "2026-09-22", note: "Pond held. Stocking not recorded." },
        energy: { status: "not_started", pct: 0, updated: null, note: "No solar claim on this record." },
      },
      journey: [
        { id: "j1", title: "Farmer registered", date: "2026-09-14", status: "completed", agentId: "ag-024", note: "Registration after the Media Connect launch." },
        { id: "j2", title: "Farm verified", date: "2026-09-16", status: "completed", agentId: "ag-024", note: "Boundary walk. Two plots and a pond edge recorded." },
        { id: "j3", title: "Baseline assessment", date: "2026-09-18", status: "completed", agentId: "ag-024", note: "Soil and water notes. West plot flagged." },
        { id: "j4", title: "Training", date: "2026-09-20", status: "completed", agentId: "ag-024", note: "First cluster session. Irrigation layout." },
        { id: "j5", title: "Smart farming plan", date: "2026-09-21", status: "completed", agentId: "ag-024", note: "Plan drafted. Awaiting technical review." },
        { id: "j6", title: "Implementation started", date: "2026-09-22", status: "in_progress", agentId: "ag-024", note: "Drip layout and vegetable beds." },
        { id: "j7", title: "Crop cycle", date: "2026-09-23", status: "in_progress", agentId: "ag-024", note: "Nursery and pond held." },
      ],
      support: [
        { role: "Farmer", name: "Farmer 014", id: "farmer-014" },
        { role: "Agent", name: "Agent 024", id: "ag-024" },
        { role: "Team", name: "Terai Tuskers", id: "terai-tuskers" },
        { role: "Organisation", name: "Bharatiya Krishak Samaj West Bengal", id: null },
      ],
      social: { public: false, note: "", channels: [] },
      evidence: [],
      beforeAfter: null,
      scores: { sat: 62, mangalmay: 54, sundar: 48, samriddhi: 41 },
    },
  ];

  const activities = [
    {
      id: "act-maa-ganga-drip",
      farmId: "maa-ganga",
      farmerId: "farmer-014",
      agentId: "ag-024",
      teamId: "terai-tuskers",
      districtId: "jalpaiguri",
      acId: "jalpaiguri-maynaguri",
      title: "Drip irrigation installation marked",
      date: "2026-09-24",
      status: "in_progress",
      mediaIds: [],
      note: "Main line still pending.",
    },
  ];

  const MEDIA = [
    { id: "med-hero", type: "photo", src: "images/hero.jpg", caption: "Hall from the stage", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "featured" },
    { id: "med-banner", type: "photo", src: "images/banner.jpg", caption: "Programme banner", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-krl-mark", type: "photo", src: "images/g-krl-mark.jpg", caption: "KRL mark in the hall", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-press", type: "photo", src: "images/press-huddle.jpg", caption: "Press huddle", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-paddy", type: "photo", src: "images/field/paddy.jpg", caption: "Paddy cultivation", context: "Editorial field context — crop", category: "crop", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-pond", type: "photo", src: "images/field/pond.jpg", caption: "Farm pond", context: "Editorial field context — water", category: "water", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-visit", type: "photo", src: "images/field/visit.jpg", caption: "Field visit", context: "Editorial field context — community", category: "community", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-irrigation", type: "photo", src: "images/field/irrigation.jpg", caption: "Irrigation layout", context: "Editorial farm context — Maa Ganga", category: "irrigation", date: null, relatedFarmId: "maa-ganga", relatedFarmerId: "farmer-014", relatedTeamId: "terai-tuskers", relatedActivityId: null, role: "contextual", placement: "farm" },
    { id: "med-cta", type: "photo", src: "images/launch-wide.jpg", caption: "Launch hall", context: "KRL Media Connect", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "cta" },
    { id: "med-session", type: "video", src: "https://youtu.be/cXO3fjWX-jg", poster: "images/press-release-cover.jpg", caption: "Session film", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "link" },
  ];

  function byId(list, id) {
    return list.find((x) => x.id === id) || null;
  }

  function farmersOf(pred) {
    return farmers.filter(pred);
  }

  function farmsOfFarmer(id) {
    return farms.filter((f) => f.farmerId === id);
  }

  function countBy(list, key) {
    const o = {};
    list.forEach((x) => { o[x[key]] = (o[x[key]] || 0) + 1; });
    return o;
  }

  function teamStats(teamId) {
    const tFarmers = farmers.filter((f) => f.teamId === teamId);
    const tFarms = farms.filter((f) => f.teamId === teamId);
    const tAgents = agents.filter((a) => a.teamId === teamId);
    const tAcs = acs.filter((a) => a.teamId === teamId);
    const covered = new Set(tFarmers.map((f) => f.acId)).size;
    const progress = tFarms.length ? Math.round(tFarms.reduce((s, f) => s + f.progress, 0) / tFarms.length) : 0;
    const scores = SCORE_AXES.map((ax) => {
      const vals = tFarms.map((f) => (f.scores && f.scores[ax.id]) || 0);
      return { id: ax.id, label: ax.label, gloss: ax.gloss, value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    });
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      agents: tAgents.length,
      acs: tAcs.length,
      acsCovered: covered,
      districts: new Set(tFarmers.map((f) => f.districtId)).size,
      progress,
      scores,
    };
  }

  function districtStats(districtId) {
    const tFarmers = farmers.filter((f) => f.districtId === districtId);
    const tFarms = farms.filter((f) => f.districtId === districtId);
    const tAcs = acs.filter((a) => a.districtId === districtId);
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      teams: new Set(tFarmers.map((f) => f.teamId)).size,
      agents: new Set(tFarmers.map((f) => f.agentId)).size,
      acs: tAcs.length,
      acsCovered: new Set(tFarmers.map((f) => f.acId)).size,
      progress: tFarms.length ? Math.round(tFarms.reduce((s, f) => s + f.progress, 0) / tFarms.length) : 0,
    };
  }

  function acStats(acId) {
    const tFarmers = farmers.filter((f) => f.acId === acId);
    const tFarms = farms.filter((f) => f.acId === acId);
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      teams: new Set(tFarmers.map((f) => f.teamId)).size,
      agents: new Set(tFarmers.map((f) => f.agentId)).size,
      progress: tFarms.length ? Math.round(tFarms.reduce((s, f) => s + f.progress, 0) / tFarms.length) : 0,
    };
  }

  function agentStats(agentId) {
    const tFarmers = farmers.filter((f) => f.agentId === agentId);
    const tFarms = farms.filter((f) => f.agentId === agentId);
    const visits = activities.filter((a) => a.agentId === agentId).length;
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      visits,
      pending: tFarms.filter((f) => f.stage === "registered").length,
      progress: tFarms.length ? Math.round(tFarms.reduce((s, f) => s + f.progress, 0) / tFarms.length) : 0,
    };
  }

  function programmeStats() {
    const stageCounts = {};
    STAGES.forEach((s) => { stageCounts[s.id] = farmers.filter((f) => f.stage === s.id).length; });
    return {
      targetFarmers: TARGET_FARMS,
      targetPerAc: TARGET_PER_AC,
      targetAcs: acs.length,
      knownFarmers: farmers.length,
      knownFarms: farms.length,
      teams: TEAMS.length,
      teamCapacity: TEAM_CAPACITY,
      agents: agents.length,
      districts: DISTRICTS.length,
      acs: acs.length,
      acsCovered: new Set(farmers.map((f) => f.acId)).size,
      districtsCovered: new Set(farmers.map((f) => f.districtId)).size,
      stageCounts,
      meanProgress: Math.round(farms.reduce((s, f) => s + f.progress, 0) / farms.length),
    };
  }

  function search(q) {
    const s = String(q || "").trim().toLowerCase();
    if (s.length < 2) return [];
    const out = [];
    DISTRICTS.forEach((d) => {
      if (d.name.toLowerCase().includes(s)) out.push({ type: "district", id: d.id, label: d.name });
    });
    acs.forEach((a) => {
      if (a.name.toLowerCase().includes(s) || a.id.includes(s)) out.push({ type: "ac", id: a.id, label: a.name });
    });
    TEAMS.forEach((t) => {
      if (t.name.toLowerCase().includes(s) || t.short.toLowerCase() === s) out.push({ type: "team", id: t.id, label: t.name });
    });
    agents.forEach((a) => {
      if (a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) out.push({ type: "agent", id: a.id, label: a.code + " · " + a.name });
    });
    farmers.forEach((f) => {
      if (f.name.toLowerCase().includes(s) || f.code.toLowerCase().includes(s) || f.village.toLowerCase().includes(s)) {
        out.push({ type: "farmer", id: f.id, label: f.name + " · " + f.village });
      }
    });
    farms.forEach((f) => {
      if (f.name.toLowerCase().includes(s) || f.id.includes(s)) out.push({ type: "farm", id: f.id, label: f.name });
    });
    return out.slice(0, 24);
  }

  function filterFarms(filters) {
    return farms.filter((f) => {
      if (filters.district && f.districtId !== filters.district) return false;
      if (filters.ac && f.acId !== filters.ac) return false;
      if (filters.team && f.teamId !== filters.team) return false;
      if (filters.agent && f.agentId !== filters.agent) return false;
      if (filters.stage && f.stage !== filters.stage) return false;
      if (filters.status && f.status !== filters.status) return false;
      if (filters.crop && f.crop !== filters.crop) return false;
      return true;
    });
  }

  function mediaById(id) {
    return MEDIA.find((m) => m.id === id) || null;
  }

  function mediaWhere(placement) {
    return MEDIA.filter((m) => m.placement === placement);
  }

  function uniqueMedia(list) {
    const seen = new Set();
    return (list || MEDIA).filter((m) => {
      const key = m.src;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  global.KRL = {
    META: {
      launched: "2026-09-14",
      notice: "Known records only. Programme targets are published ambitions, not live enrolment.",
      targetFarms: TARGET_FARMS,
      targetPerAc: TARGET_PER_AC,
      teamCapacity: TEAM_CAPACITY,
    },
    STAGES,
    STATUSES,
    SCORE_AXES,
    SMART_CATS,
    TEAMS,
    DISTRICTS,
    ACS: acs,
    AGENTS: agents,
    FARMERS: farmers,
    FARMS: farms,
    ACTIVITIES: activities,
    MEDIA,
    CROPS,
    mediaById,
    mediaWhere,
    uniqueMedia,
    byId,
    farmersOf,
    farmsOfFarmer,
    countBy,
    teamStats,
    districtStats,
    acStats,
    agentStats,
    programmeStats,
    search,
    filterFarms,
    teamByDistrict,
  };
})(window);
