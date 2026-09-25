/* KRL Smart Farming Command Centre — prototype data.
   All farmer, farm, agent, activity and score records are synthetic.
   Programme targets (5,000 farms, 294 ACs, 15 teams) come from the
   published KRL Bengal brief. Current book volumes are interface-test
   data only and must not be read as live programme statistics. */
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
    { id: "attention", label: "Needs attention" },
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
    { id: "himalayan-giants", name: "Himalayan Giants", short: "HG", accent: "#3d5278", districts: ["darjeeling", "kalimpong"] },
    { id: "terai-tuskers", name: "Terai Tuskers", short: "TT", accent: "#5a4a32", districts: ["jalpaiguri", "alipurduar", "uttar-dinajpur"] },
    { id: "cooch-behar-royals", name: "Cooch Behar Royals", short: "CR", accent: "#6b3a4a", districts: ["cooch-behar"] },
    { id: "dinajpur-defenders", name: "Dinajpur Defenders", short: "DD", accent: "#3a5a48", districts: ["dakshin-dinajpur"] },
    { id: "malda-kings", name: "Malda Kings", short: "MK", accent: "#7a5a20", districts: ["malda"] },
    { id: "murshidabad-nawabs", name: "Murshidabad Nawabs", short: "MN", accent: "#4a3a5c", districts: ["murshidabad"] },
    { id: "nadia-warriors", name: "Nadia Warriors", short: "NW", accent: "#2f5a4a", districts: ["nadia"] },
    { id: "bardhaman-bigha-kings", name: "Bardhaman Bigha Kings", short: "BK", accent: "#6a4a28", districts: ["purba-bardhaman", "paschim-bardhaman"] },
    { id: "hooghly-harits", name: "Hooghly Harits", short: "HH", accent: "#3d6a38", districts: ["hooghly"] },
    { id: "birbhum-blasters", name: "Birbhum Blasters", short: "BB", accent: "#6a3a28", districts: ["birbhum"] },
    { id: "bankura-bulls", name: "Bankura Bulls", short: "BU", accent: "#4a4030", districts: ["bankura"] },
    { id: "purulia-panthers", name: "Purulia Panthers", short: "PP", accent: "#3a3a48", districts: ["purulia"] },
    { id: "medinipur-mavericks", name: "Medinipur Mavericks", short: "MM", accent: "#2a4a5c", districts: ["jhargram", "paschim-medinipur", "purba-medinipur"] },
    { id: "ganga-gladiators", name: "Ganga Gladiators", short: "GG", accent: "#2a3a6c", districts: ["howrah", "kolkata"] },
    { id: "sundarban-strikers", name: "Sundarban Strikers", short: "SS", accent: "#2a5a50", districts: ["north-24-parganas", "south-24-parganas"] },
  ];

  const RESERVED_TEAMS = [16, 17, 18, 19, 20].map((n) => ({
    id: "reserved-" + n,
    name: "Identity pending",
    short: String(n),
    slot: n,
    accent: "#6a6a60",
    districts: [],
    placeholder: true,
  }));

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
  const PROTOTYPE_FARMERS = 360;
  const AGENTS_PER_TEAM = 8;

  const agents = [];
  TEAMS.forEach((team, ti) => {
    for (let i = 1; i <= AGENTS_PER_TEAM; i++) {
      const n = ti * AGENTS_PER_TEAM + i;
      agents.push({
        id: "ag-" + pad(n, 3),
        code: "AG-" + pad(n, 3),
        name: "Demo Agent " + pad(n, 3),
        teamId: n === 24 ? "terai-tuskers" : team.id,
        districtId: n === 24 ? "jalpaiguri" : (team.districts[i % team.districts.length] || team.districts[0]),
      });
    }
  });

  const STAGE_WEIGHTS = [
    ["registered", 0.38],
    ["verified", 0.24],
    ["onboarded", 0.16],
    ["training", 0.1],
    ["plan", 0.07],
    ["implementation", 0.04],
    ["monitoring", 0.01],
    ["harvest", 0],
  ];

  function weightedStage(rng) {
    let x = rng();
    for (const [id, w] of STAGE_WEIGHTS) {
      x -= w;
      if (x <= 0) return id;
    }
    return "registered";
  }

  function stageProgress(stage, rng) {
    const idx = STAGES.findIndex((s) => s.id === stage);
    const base = (idx / (STAGES.length - 1)) * 100;
    return Math.max(4, Math.min(96, Math.round(base + (rng() - 0.4) * 12)));
  }

  const ACTIVITIES = [
    "Registration visit completed",
    "Farm boundary walk",
    "Baseline soil observation",
    "Training session attended",
    "Smart farming plan drafted",
    "Drip line layout marked",
    "Compost bay prepared",
    "Pond bund inspection",
    "Seedbed preparation noted",
    "Follow-up pending",
    "Issue logged: water access",
    "Photo evidence uploaded",
  ];

  const CROPS = ["Paddy", "Vegetables", "Mustard", "Jute", "Integrated pond", "Banana", "Pulses"];

  const farmers = [];
  const farms = [];
  const activities = [];
  const rng = mulberry(20260925);
  const start = new Date("2026-09-14T08:00:00+05:30");
  const end = new Date("2026-09-25T18:00:00+05:30");

  const teamAcs = {};
  acs.forEach((ac) => {
    (teamAcs[ac.teamId] || (teamAcs[ac.teamId] = [])).push(ac);
  });

  for (let i = 1; i <= PROTOTYPE_FARMERS; i++) {
    let team = TEAMS[(i - 1) % TEAMS.length];
    let pool = teamAcs[team.id] || acs;
    let ac = pool[Math.floor(rng() * pool.length)];
    if (i === 14) {
      team = TEAMS.find((t) => t.id === "terai-tuskers");
      ac = acs.find((a) => a.id === "jalpaiguri-maynaguri") || ac;
    }
    const district = DISTRICTS.find((d) => d.id === ac.districtId);
    const teamAgents = agents.filter((a) => a.teamId === team.id);
    const agent = i === 14
      ? agents.find((a) => a.id === "ag-024")
      : teamAgents[(i - 1) % teamAgents.length];
    const stage = i === 14 ? "implementation" : weightedStage(rng);
    const progress = i === 14 ? 68 : stageProgress(stage, rng);
    const farmCount = rng() < 0.16 ? 2 : 1;
    const farmerId = "farmer-" + pad(i, 3);
    const farmer = {
      id: farmerId,
      code: "DF-" + pad(i, 3),
      name: "Demo Farmer " + pad(i, 3),
      village: i === 14 ? "Maynaguri" : "Demo Village " + pad(i, 3),
      districtId: district.id,
      acId: ac.id,
      teamId: team.id,
      agentId: agent.id,
      stage,
      progress,
      farmIds: [],
      voice: i === 14
        ? "I want the pond and the vegetable beds to work together this season. Water is the first problem."
        : null,
      goal: i === 14 ? "Stabilise irrigation before the next paddy cycle." : "Complete onboarding and first training.",
      challenge: i === 14 ? "Uneven water in the west plot." : "Awaiting verification visit.",
      achievement: i === 14 ? "Baseline walk and drip layout marked." : null,
    };
    farmers.push(farmer);

    for (let f = 0; f < farmCount; f++) {
      const farmId = f === 0 && i === 14 ? "maa-ganga" : "farm-" + pad(i, 3) + (f ? "-b" : "");
      const farmName = f === 0 && i === 14
        ? "Maa Ganga Smart Farm"
        : "Demo Farm " + pad(i, 3) + (f ? " B" : "");
      const size = +(1.1 + rng() * 2.8).toFixed(1);
      const crop = i === 14 ? "Integrated pond and vegetables" : pick(rng, CROPS);
      const attention = stage === "registered" && rng() < 0.12 || rng() < 0.06;
      const farm = {
        id: farmId,
        name: farmName,
        farmerId,
        districtId: district.id,
        acId: ac.id,
        village: farmer.village,
        teamId: team.id,
        agentId: agent.id,
        sizeAcres: i === 14 ? 2.4 : size,
        crop,
        stage,
        progress: i === 14 && f === 0 ? 68 : Math.max(3, progress - f * 8),
        status: attention ? "attention" : (stage === "implementation" || stage === "monitoring" ? "in_progress" : "planned"),
        lastVisit: fmtDate(dateBetween(rng, start, end)),
        alerts: attention ? ["Verification visit overdue"] : [],
        plots: i === 14 && f === 0
          ? [
              { id: "plot-a", name: "West plot", size: "1.1 acres", crop: "Vegetables" },
              { id: "plot-b", name: "East plot", size: "0.8 acres", crop: "Paddy nursery" },
              { id: "plot-c", name: "Pond edge", size: "0.5 acres", crop: "Aquaculture" },
            ]
          : [{ id: "plot-main", name: "Main plot", size: size + " acres", crop }],
      };
      farms.push(farm);
      farmer.farmIds.push(farmId);

      if (i === 14 && f === 0) {
        farm.smart = {
          crop: { status: "in_progress", pct: 70, updated: "2026-09-22", evidence: 2, note: "Vegetable beds laid. Paddy nursery started." },
          irrigation: { status: "in_progress", pct: 80, updated: "2026-09-24", evidence: 4, note: "Drip laterals marked. Main line pending." },
          soil: { status: "completed", pct: 100, updated: "2026-09-18", evidence: 3, note: "Baseline walk completed with agent AG-024." },
          water: { status: "attention", pct: 40, updated: "2026-09-23", evidence: 1, note: "West plot dries faster than the pond edge." },
          organic: { status: "planned", pct: 25, updated: "2026-09-20", evidence: 0, note: "Compost bay sited. Not built." },
          machinery: { status: "not_started", pct: 0, updated: null, evidence: 0, note: "No machinery claim in the prototype book." },
          weather: { status: "planned", pct: 15, updated: "2026-09-21", evidence: 0, note: "Phone weather watch only." },
          pest: { status: "not_started", pct: 0, updated: null, evidence: 0, note: "Not claimed." },
          waste: { status: "planned", pct: 20, updated: "2026-09-19", evidence: 0, note: "Pond silt reuse discussed." },
          livestock: { status: "not_started", pct: 0, updated: null, evidence: 0, note: "Not part of this farm cycle." },
          aqua: { status: "in_progress", pct: 55, updated: "2026-09-22", evidence: 2, note: "Pond held. Stocking not recorded." },
          energy: { status: "not_started", pct: 0, updated: null, evidence: 0, note: "No solar claim in the prototype book." },
        };
        farm.journey = [
          { id: "j1", title: "Farmer registered", date: "2026-09-14", status: "completed", agentId: agent.id, note: "Prototype registration after the Media Connect launch.", evidence: 1 },
          { id: "j2", title: "Farm verified", date: "2026-09-16", status: "completed", agentId: agent.id, note: "Boundary walk. Two plots and a pond edge recorded.", evidence: 3 },
          { id: "j3", title: "Baseline assessment", date: "2026-09-18", status: "completed", agentId: agent.id, note: "Soil and water notes. West plot flagged.", evidence: 3 },
          { id: "j4", title: "Training", date: "2026-09-20", status: "completed", agentId: agent.id, note: "First cluster session. Irrigation layout.", evidence: 2 },
          { id: "j5", title: "Smart farming plan", date: "2026-09-21", status: "completed", agentId: agent.id, note: "Plan drafted. Awaiting technical review.", evidence: 1 },
          { id: "j6", title: "Implementation started", date: "2026-09-22", status: "in_progress", agentId: agent.id, note: "Drip layout and vegetable beds.", evidence: 4 },
          { id: "j7", title: "Crop cycle", date: "2026-09-23", status: "in_progress", agentId: agent.id, note: "Nursery and pond held.", evidence: 2 },
          { id: "j8", title: "Monitoring", date: null, status: "planned", agentId: agent.id, note: "Weekly visit cadence not yet due.", evidence: 0 },
          { id: "j9", title: "Harvest", date: null, status: "not_started", agentId: agent.id, note: "Out of season for this prototype.", evidence: 0 },
          { id: "j10", title: "Outcome", date: null, status: "not_started", agentId: agent.id, note: "No outcome claimed.", evidence: 0 },
        ];
        farm.support = [
          { role: "Farmer", name: farmer.name, id: farmerId },
          { role: "Agent", name: agent.name, id: agent.id },
          { role: "Team", name: team.name, id: team.id },
          { role: "Trainer", name: "Demo Trainer 02", id: null },
          { role: "Technical support", name: "KRL field desk (prototype)", id: null },
          { role: "Agronomist", name: "Not assigned", id: null },
          { role: "Organisation", name: "Bharatiya Krishak Samaj West Bengal", id: null },
          { role: "Supporter", name: "NRB match pending", id: null },
        ];
        farm.social = {
          public: true,
          note: "Optional public storytelling only. No private farmer contacts are published.",
          channels: [
            { network: "YouTube", handle: "Karmyog TV", url: "https://youtu.be/cXO3fjWX-jg", status: "programme" },
            { network: "Facebook", handle: "Not linked for this farm", url: null, status: "empty" },
            { network: "Instagram", handle: "Not linked for this farm", url: null, status: "empty" },
          ],
        };
        farm.evidence = [
          { id: "ev-1", type: "photo", title: "Soil beds after layout", date: "2026-09-18", agentId: agent.id, location: farmer.village + ", Maynaguri", activity: "Baseline assessment", notes: "Demo evidence frame for soil preparation.", src: "images/field/irrigation.jpg", kind: "prototype" },
          { id: "ev-2", type: "photo", title: "Pond edge after rain", date: "2026-09-22", agentId: agent.id, location: farmer.village, activity: "Water management", notes: "Demo evidence frame for the pond bund.", src: "images/field/pond.jpg", kind: "prototype" },
          { id: "ev-3", type: "video", title: "Layout walk-through", date: "2026-09-24", agentId: agent.id, location: farmer.village, activity: "Drip irrigation installation", notes: "Programme clip used only to test the player.", src: "video/clip-1.mp4", poster: "images/field/irrigation.jpg", kind: "prototype" },
          { id: "ev-4", type: "photo", title: "Paddy nursery", date: "2026-09-22", agentId: agent.id, location: farmer.village, activity: "Crop management", notes: "Demo evidence frame for the nursery plots.", src: "images/field/paddy.jpg", kind: "prototype" },
        ];
        farm.beforeAfter = {
          before: { src: "images/field/pond.jpg", caption: "Pond edge before the drip laterals were marked. Demo frame." },
          after: { src: "images/field/irrigation.jpg", caption: "Beds and laterals after the 22 Sep layout. Demo frame." },
        };
        farm.scores = { sat: 62, mangalmay: 54, sundar: 48, samriddhi: 41 };
      } else {
        farm.smart = null;
        farm.journey = STAGES.map((s, idx) => ({
          id: farmId + "-" + s.id,
          title: s.label,
          date: idx <= STAGES.findIndex((x) => x.id === stage) && idx < 6 ? fmtDate(dateBetween(rng, start, end)) : null,
          status: idx < STAGES.findIndex((x) => x.id === stage) ? "completed" : (s.id === stage ? "in_progress" : "planned"),
          agentId: agent.id,
          note: "Prototype milestone.",
          evidence: idx < 2 ? 1 : 0,
        }));
        farm.support = [
          { role: "Farmer", name: farmer.name, id: farmerId },
          { role: "Agent", name: agent.name, id: agent.id },
          { role: "Team", name: team.name, id: team.id },
        ];
        farm.social = { public: false, note: "No public social link on this prototype record.", channels: [] };
        farm.evidence = [];
        farm.beforeAfter = null;
        farm.scores = {
          sat: Math.round(30 + rng() * 40),
          mangalmay: Math.round(20 + rng() * 35),
          sundar: Math.round(20 + rng() * 30),
          samriddhi: Math.round(15 + rng() * 30),
        };
      }
    }
  }

  farms.forEach((farm) => {
    if (rng() < 0.22 || farm.id === "maa-ganga") {
      activities.push({
        id: "act-" + farm.id,
        farmId: farm.id,
        farmerId: farm.farmerId,
        agentId: farm.agentId,
        teamId: farm.teamId,
        districtId: farm.districtId,
        acId: farm.acId,
        title: farm.id === "maa-ganga" ? "Drip irrigation installation marked" : pick(rng, ACTIVITIES),
        date: farm.lastVisit,
        status: farm.status,
        photo: farm.id === "maa-ganga" ? "images/field/irrigation.jpg" : (rng() < 0.35 ? pick(rng, ["images/field/irrigation.jpg", "images/field/paddy.jpg", "images/field/pond.jpg"]) : null),
        video: farm.id === "maa-ganga" ? "video/clip-1.mp4" : null,
        prototype: true,
      });
    }
  });

  activities.sort((a, b) => (a.date < b.date ? 1 : -1));

  const programmeMedia = [
    { id: "pm-1", type: "photo", title: "Media Connect banner", src: "images/banner.jpg", date: "2026-09-14", context: "Programme launch", kind: "archive" },
    { id: "pm-2", type: "photo", title: "KRL mark in the hall", src: "images/g-krl-mark.jpg", date: "2026-09-14", context: "Programme launch", kind: "archive" },
    { id: "pm-3", type: "photo", title: "Hall from the stage", src: "images/hero.jpg", date: "2026-09-14", context: "Programme launch", kind: "archive" },
    { id: "pm-4", type: "video", title: "KRL intro", src: "video/krl-intro-bg.mp4", poster: "images/banner.jpg", date: "2026-09-14", context: "Programme launch", kind: "archive" },
    { id: "pm-5", type: "video", title: "Session film", src: "https://youtu.be/cXO3fjWX-jg", poster: "images/g-from-stage.jpg", date: "2026-09-14", context: "YouTube", kind: "archive" },
    { id: "pm-6", type: "photo", title: "Press huddle", src: "images/press-huddle.jpg", date: "2026-09-14", context: "Programme launch", kind: "archive" },
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
    const attention = tFarms.filter((f) => f.status === "attention").length;
    const progress = tFarms.length ? Math.round(tFarms.reduce((s, f) => s + f.progress, 0) / tFarms.length) : 0;
    const scores = SCORE_AXES.map((ax) => {
      const vals = tFarms.map((f) => f.scores[ax.id]);
      return { id: ax.id, label: ax.label, gloss: ax.gloss, value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    });
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      agents: tAgents.length,
      acs: tAcs.length,
      acsCovered: covered,
      districts: new Set(tFarmers.map((f) => f.districtId)).size,
      attention,
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
      attention: tFarms.filter((f) => f.status === "attention").length,
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
      attention: tFarms.filter((f) => f.status === "attention").length,
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
      pending: tFarms.filter((f) => f.stage === "registered" || f.status === "attention").length,
      issues: tFarms.filter((f) => f.status === "attention").length,
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
      prototypeFarmers: farmers.length,
      prototypeFarms: farms.length,
      teams: TEAMS.length,
      teamCapacity: 20,
      agents: agents.length,
      districts: DISTRICTS.length,
      acs: acs.length,
      acsCovered: new Set(farmers.map((f) => f.acId)).size,
      districtsCovered: new Set(farmers.map((f) => f.districtId)).size,
      attention: farms.filter((f) => f.status === "attention").length,
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

  global.KRL = {
    META: {
      prototype: true,
      launched: "2026-09-14",
      generated: "2026-09-25",
      notice: "Prototype book for interface testing. Not live programme statistics.",
      targetFarms: TARGET_FARMS,
      targetPerAc: TARGET_PER_AC,
    },
    STAGES,
    STATUSES,
    SCORE_AXES,
    SMART_CATS,
    TEAMS,
    RESERVED_TEAMS,
    DISTRICTS,
    ACS: acs,
    AGENTS: agents,
    FARMERS: farmers,
    FARMS: farms,
    ACTIVITIES: activities,
    PROGRAMME_MEDIA: programmeMedia,
    CROPS,
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
