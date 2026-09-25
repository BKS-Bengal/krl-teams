/* KRL Smart Farming Command Centre — knowledge-base data.
   SHOW WHAT WE KNOW. HIDE WHAT WE DON'T.
   Programme targets (5,000 farms, 294 ACs, 15 teams) come from the
   published KRL Bengal brief. Row-level farmer, farm, agent and activity
   records exist only when authored. Twenty-team capacity is internal
   architecture only and is never represented as empty public slots. */
(function (global) {
  "use strict";

  const STAGES = [
    { id: "registered", label: "Registered", bn: "নিবন্ধিত", hi: "पंजीकृत" },
    { id: "verified", label: "Verified", bn: "যাচাই", hi: "सत्यापित" },
    { id: "onboarded", label: "Onboarded", bn: "অন্তর্ভুক্ত", hi: "शामिल" },
    { id: "training", label: "Training", bn: "প্রশিক্ষণ", hi: "प्रशिक्षण" },
    { id: "plan", label: "Smart farming plan", bn: "স্মার্ট ফার্ম পরিকল্পনা", hi: "स्मार्ट फार्म योजना" },
    { id: "implementation", label: "Implementation", bn: "বাস্তবায়ন", hi: "कार्यान्वयन" },
    { id: "monitoring", label: "Monitoring", bn: "নিরীক্ষণ", hi: "निगरानी" },
    { id: "harvest", label: "Harvest / outcome", bn: "ফসল / ফল", hi: "फसल / परिणाम" },
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

  /* Programme zones are authored only when a source names them.
     District.zone remains agro-climatic (hills / terai / …), not this league zone. */
  const ZONES = [
    { id: "zone-1", name: "Zone 1" },
  ];

  const TEAMS = [
    { id: "himalayan-giants", logo: "images/teams/himalayan-giants.png", name: "Himalayan Giants", short: "HG", accent: "#3d5278", zoneId: "zone-1", districts: ["darjeeling", "kalimpong"] },
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

  const teamByDistrict = {};
  TEAMS.forEach((t) => t.districts.forEach((d) => { teamByDistrict[d] = t.id; }));

  const acs = [];
  DISTRICTS.forEach((d) => {
    d.acs.forEach((name, i) => {
      const row = {
        id: d.id + "-" + slug(name),
        name,
        districtId: d.id,
        teamId: teamByDistrict[d.id] || "sundarban-strikers",
        index: i + 1,
      };
      if (d.id === "dakshin-dinajpur" && name === "Balurghat") row.officialNo = 39;
      acs.push(row);
    });
  });

  const TARGET_FARMS = 5000;
  const TARGET_PER_AC = 20;
  const DEMO_BOOK = { farmers: 360, farms: 413, agents: 120 };

  const agents = [];

  const farmers = [
    {
      id: "amit-shill",
      kind: "case-study",
      role: "agri-entrepreneur",
      name: "Amit Shill",
      gardenName: "Pikas Garden",
      districtId: "dakshin-dinajpur",
      acId: "dakshin-dinajpur-balurghat",
      teamId: "dinajpur-defenders",
      teamSource: "geography",
      agentId: null,
      village: null,
      farmIds: ["pikas-garden"],
      practice: "Source-evidenced on the Pika's Gardening YouTube channel: adenium, tulsi, lemon, bougainvillea, jade, lotus and water lily.",
      farmSpace: null,
      space: null,
      smartFarmingVision: null,
      vision: null,
      identity: "Amit Shill is the named agri-entrepreneur for Pikas Garden. The person record stays distinct from the garden record.",
      story: {
        kind: "agri-entrepreneur-story",
        text: "Amit Shill publishes garden practice from Pikas Garden on the public YouTube channel Pika's Gardening. Source films show plant care for adenium, tulsi, lemon, bougainvillea and lotus. This is an agri-entrepreneur story from public source media, not a measured success report.",
        source: "Pika's Gardening YouTube",
        sourceUrl: "https://www.youtube.com/@PikasGardening",
        sourceType: "official-youtube",
        verified: true,
      },
      whatTheyGrow: [
        { name: "Adenium", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/watch?v=UMLbq0pd43s", sourceType: "official-youtube", verified: true },
        { name: "Tulsi", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/watch?v=cBI2poDGJNM", sourceType: "official-youtube", verified: true },
        { name: "Lemon", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/watch?v=vuK8-rKejIE", sourceType: "official-youtube", verified: true },
        { name: "Bougainvillea", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/watch?v=goHoLcUAx4M", sourceType: "official-youtube", verified: true },
        { name: "Lotus", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/watch?v=3fOW4rNbKHY", sourceType: "official-youtube", verified: true },
        { name: "Jade", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/@PikasGardening", sourceType: "official-youtube-channel", verified: true },
        { name: "Water lily", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/@PikasGardening", sourceType: "official-youtube-channel", verified: true },
      ],
      whatTheyDo: [
        { name: "Publishes garden-practice films", source: "Pika's Gardening YouTube", sourceUrl: "https://www.youtube.com/@PikasGardening", sourceType: "official-youtube", verified: true },
      ],
      profileImage: {
        src: "images/people/amit-shill.jpg",
        sourceType: "supplied-portrait",
        subject: "person",
        caption: "Amit Shill",
        attribution: "Supplied portrait",
      },
      sources: [
        { fact: "Named agri-entrepreneur for Pikas Garden", source: "KRL product owner mapping", sourceType: "programme", verified: true },
        { fact: "Public YouTube channel @PikasGardening", source: "https://www.youtube.com/@PikasGardening", sourceType: "official-youtube", verified: true },
        { fact: "Known Facebook reel", source: "https://www.facebook.com/reel/2557686798080686", sourceType: "official-facebook", verified: true },
        { fact: "Assembly geography Dakshin Dinajpur / 39 Balurghat / Dinajpur Defenders", source: "KRL geography assignment", sourceType: "programme", verified: true },
      ],
      digital: [
        { network: "YouTube", handle: "@PikasGardening", url: "https://www.youtube.com/@PikasGardening", note: "Public garden channel.", thumbYoutubeId: "UMLbq0pd43s" },
        { network: "Facebook", handle: "Known reel", url: "https://www.facebook.com/reel/2557686798080686", note: "Known public reel. No local still is stored." },
      ],
      videos: [
        { youtubeId: "UMLbq0pd43s", title: "Adenium care in monsoon", channel: "Pika's Gardening", url: "https://www.youtube.com/watch?v=UMLbq0pd43s", role: "featured" },
        { youtubeId: "cBI2poDGJNM", title: "Tulsi plant care", channel: "Pika's Gardening", url: "https://www.youtube.com/watch?v=cBI2poDGJNM", role: "journey" },
        { youtubeId: "vuK8-rKejIE", title: "Lemon tree fruiting", channel: "Pika's Gardening", url: "https://www.youtube.com/watch?v=vuK8-rKejIE", role: "journey" },
        { youtubeId: "goHoLcUAx4M", title: "Bougainvillea care", channel: "Pika's Gardening", url: "https://www.youtube.com/watch?v=goHoLcUAx4M", role: "journey" },
        { youtubeId: "3fOW4rNbKHY", title: "Lotus tuber care", channel: "Pika's Gardening", url: "https://www.youtube.com/watch?v=3fOW4rNbKHY", role: "journey" },
      ],
    },
    {
      id: "krishna-biswas",
      kind: "case-study",
      role: "agri-entrepreneur",
      name: "Krishna Biswas",
      gardenName: "Rupali Garden",
      districtId: "jalpaiguri",
      acId: "jalpaiguri-maynaguri",
      teamId: "himalayan-giants",
      teamSource: "named",
      agentId: null,
      village: "Maynaguri",
      farmIds: ["rupali-garden"],
      practice: "Source-evidenced on the Rupali Garden YouTube channel: dragon fruit (pitaya) — flowering, pruning, cuttings and fungal care.",
      farmSpace: null,
      space: null,
      smartFarmingVision: null,
      vision: null,
      identity: "Krishna Biswas is the named agri-entrepreneur for Rupali Garden in Maynaguri. The person record stays distinct from the garden record.",
      story: {
        kind: "agri-entrepreneur-story",
        text: "Krishna Biswas publishes garden practice from Rupali Garden on the public YouTube channel Rupali Garden. Source films show dragon fruit flowering, pruning, cuttings and fungal care. Named to Himalayan Giants in Zone 1. This is an agri-entrepreneur story from public source media, not a measured success report.",
        source: "Rupali Garden YouTube",
        sourceUrl: "https://www.youtube.com/@RupaliGarden",
        sourceType: "official-youtube",
        verified: true,
      },
      whatTheyGrow: [
        { name: "Dragon fruit", source: "Rupali Garden YouTube", sourceUrl: "https://www.youtube.com/watch?v=14R5zb7b_cg", sourceType: "official-youtube", verified: true },
      ],
      whatTheyDo: [
        { name: "Publishes dragon-fruit practice films", source: "Rupali Garden YouTube", sourceUrl: "https://www.youtube.com/@RupaliGarden", sourceType: "official-youtube", verified: true },
        { name: "Flowering, pruning, cuttings and fungal care", source: "Rupali Garden YouTube", sourceUrl: "https://www.youtube.com/@RupaliGarden", sourceType: "official-youtube", verified: true },
      ],
      profileImage: {
        src: "images/people/krishna-biswas.jpg",
        sourceType: "supplied-portrait",
        subject: "person",
        caption: "Krishna Biswas",
        attribution: "Supplied portrait",
      },
      sources: [
        { fact: "Named agri-entrepreneur for Rupali Garden", source: "KRL product owner mapping", sourceType: "programme", verified: true },
        { fact: "Maynaguri to Zone 1 to Himalayan Giants", source: "KRL product owner mapping", sourceType: "programme", verified: true },
        { fact: "Public YouTube channel @RupaliGarden", source: "https://www.youtube.com/@RupaliGarden", sourceType: "official-youtube", verified: true },
      ],
      digital: [
        { network: "YouTube", handle: "@RupaliGarden", url: "https://www.youtube.com/@RupaliGarden", note: "Public garden channel.", thumbYoutubeId: "14R5zb7b_cg" },
      ],
      videos: [
        { youtubeId: "14R5zb7b_cg", title: "How to force dragon fruit to flower", channel: "Rupali Garden", url: "https://www.youtube.com/watch?v=14R5zb7b_cg", role: "featured" },
        { youtubeId: "1HWKZx0efkc", title: "How to prune a dragon fruit plant", channel: "Rupali Garden", url: "https://www.youtube.com/watch?v=1HWKZx0efkc", role: "journey" },
        { youtubeId: "pSN103_mtSk", title: "How to take dragon fruit cuttings", channel: "Rupali Garden", url: "https://www.youtube.com/watch?v=pSN103_mtSk", role: "journey" },
        { youtubeId: "EOqHv5FaGPw", title: "Dragon fruit fungal attack", channel: "Rupali Garden", url: "https://www.youtube.com/watch?v=EOqHv5FaGPw", role: "journey" },
        { youtubeId: "1TjaqpSpIvM", title: "New dragon fruit variety in first flower", channel: "Rupali Garden", url: "https://www.youtube.com/watch?v=1TjaqpSpIvM", role: "journey" },
      ],
    },
  ];

  const farms = [
    {
      id: "pikas-garden",
      name: "Pikas Garden",
      kind: "case-study",
      farmerId: "amit-shill",
      districtId: "dakshin-dinajpur",
      acId: "dakshin-dinajpur-balurghat",
      village: null,
      teamId: "dinajpur-defenders",
      agentId: null,
      sizeAcres: null,
      crop: null,
      stage: null,
      progress: null,
      status: null,
      lastVisit: null,
      alerts: [],
      contextualMediaId: null,
      plots: [],
      smart: null,
      journey: [],
      support: [
        { role: "Agri-entrepreneur", name: "Amit Shill", id: "amit-shill" },
        { role: "Organisation", name: "Bharatiya Krishak Samaj West Bengal", id: null },
      ],
      social: {
        public: true,
        note: "Source media from the gardener’s public channels. Not a field-verified survey.",
        channels: [
          { network: "YouTube", handle: "@PikasGardening", url: "https://www.youtube.com/@PikasGardening" },
          { network: "Facebook", handle: "Facebook reel", url: "https://www.facebook.com/reel/2557686798080686" },
        ],
      },
      evidence: [
        { type: "photo", src: "https://i.ytimg.com/vi/UMLbq0pd43s/hqdefault.jpg", title: "Adenium care in monsoon", sourceUrl: "https://www.youtube.com/watch?v=UMLbq0pd43s", sourceType: "official-youtube-thumbnail", attribution: "Pika's Gardening", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
        { type: "photo", src: "https://i.ytimg.com/vi/goHoLcUAx4M/hqdefault.jpg", title: "Bougainvillea care", sourceUrl: "https://www.youtube.com/watch?v=goHoLcUAx4M", sourceType: "official-youtube-thumbnail", attribution: "Pika's Gardening", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
        { type: "photo", src: "https://i.ytimg.com/vi/3fOW4rNbKHY/hqdefault.jpg", title: "Lotus tuber care", sourceUrl: "https://www.youtube.com/watch?v=3fOW4rNbKHY", sourceType: "official-youtube-thumbnail", attribution: "Pika's Gardening", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
      ],
      beforeAfter: null,
      scores: null,
    },
    {
      id: "rupali-garden",
      name: "Rupali Garden",
      kind: "case-study",
      farmerId: "krishna-biswas",
      districtId: "jalpaiguri",
      acId: "jalpaiguri-maynaguri",
      village: "Maynaguri",
      teamId: "himalayan-giants",
      agentId: null,
      sizeAcres: null,
      crop: null,
      stage: null,
      progress: null,
      status: null,
      lastVisit: null,
      alerts: [],
      contextualMediaId: null,
      plots: [],
      smart: null,
      journey: [],
      support: [
        { role: "Agri-entrepreneur", name: "Krishna Biswas", id: "krishna-biswas" },
        { role: "Organisation", name: "Bharatiya Krishak Samaj West Bengal", id: null },
      ],
      social: {
        public: true,
        note: "Source media from the gardener’s public channels. Not a field-verified survey.",
        channels: [
          { network: "YouTube", handle: "@RupaliGarden", url: "https://www.youtube.com/@RupaliGarden" },
        ],
      },
      evidence: [
        { type: "photo", src: "https://i.ytimg.com/vi/14R5zb7b_cg/hqdefault.jpg", title: "How to force dragon fruit to flower", sourceUrl: "https://www.youtube.com/watch?v=14R5zb7b_cg", sourceType: "official-youtube-thumbnail", attribution: "Rupali Garden", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
        { type: "photo", src: "https://i.ytimg.com/vi/1HWKZx0efkc/hqdefault.jpg", title: "How to prune a dragon fruit plant", sourceUrl: "https://www.youtube.com/watch?v=1HWKZx0efkc", sourceType: "official-youtube-thumbnail", attribution: "Rupali Garden", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
        { type: "photo", src: "https://i.ytimg.com/vi/pSN103_mtSk/hqdefault.jpg", title: "How to take dragon fruit cuttings", sourceUrl: "https://www.youtube.com/watch?v=pSN103_mtSk", sourceType: "official-youtube-thumbnail", attribution: "Rupali Garden", subject: "garden-practice", caption: "Official YouTube thumbnail. Source film, not a field survey still." },
      ],
      beforeAfter: null,
      scores: null,
    },
  ];

  /* Activity records are optional. Shape:
     { id, type, date, title, farmId, farmerId, teamId, districtId, acId, status, mediaIds[] }
     An activity may have zero or many media. Media never auto-creates an activity. */
  const activities = [];

  const MEDIA = [
    { id: "med-hero", type: "photo", src: "images/hero.jpg", width: 1280, height: 960, source: "programme-archive", subject: "launch-hall", caption: "Hall from the stage", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "featured" },
    { id: "med-banner", type: "photo", src: "images/banner.jpg", width: 1242, height: 813, source: "programme-archive", subject: "programme-banner", caption: "Programme banner", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-krl-mark", type: "photo", src: "images/g-krl-mark.jpg", width: 1280, height: 960, source: "programme-archive", subject: "krl-mark", caption: "KRL mark in the hall", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-press", type: "photo", src: "images/press-huddle.jpg", width: 1280, height: 720, source: "programme-archive", subject: "press", caption: "Press huddle", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "supporting" },
    { id: "med-paddy", type: "photo", src: "images/field/paddy.jpg", width: 1280, height: 720, source: "editorial-library", subject: "paddy", caption: "Paddy cultivation", context: "Editorial field context — crop", category: "crop", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-pond", type: "photo", src: "images/field/pond.jpg", width: 1280, height: 720, source: "editorial-library", subject: "pond", caption: "Farm pond", context: "Editorial field context — water", category: "water", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-visit", type: "photo", src: "images/field/visit.jpg", width: 1280, height: 720, source: "editorial-library", subject: "field-visit", caption: "Field visit", context: "Editorial field context — community", category: "community", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-irrigation", type: "photo", src: "images/field/irrigation.jpg", width: 1280, height: 720, source: "editorial-library", subject: "irrigation", caption: "Irrigation layout", context: "Editorial field context — irrigation", category: "irrigation", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "field" },
    { id: "med-cta", type: "photo", src: "images/launch-wide.jpg", width: 1280, height: 960, source: "programme-archive", subject: "launch-hall", caption: "Launch hall", context: "KRL Media Connect", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "cta" },
    { id: "med-session", type: "video", src: "https://youtu.be/cXO3fjWX-jg", poster: "images/archive/press-release-cover.jpg", width: null, height: null, source: "programme-archive", subject: "session-film", caption: "Session film", context: "Programme launch", category: "programme", date: "2026-09-14", relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "link" },
    { id: "med-camp-league", type: "photo", src: "images/campaign/your-league.jpg", width: 1600, height: 2000, source: "campaign", subject: "league-poster", caption: "Your farm, your team, your league", context: "Campaign storyboard", category: "campaign", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "campaign" },
    { id: "med-camp-score", type: "photo", src: "images/campaign/scoreboard.jpg", width: 1600, height: 2000, source: "campaign", subject: "scoreboard", caption: "League scoreboard language", context: "Campaign storyboard", category: "campaign", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "campaign" },
    { id: "med-camp-field", type: "photo", src: "images/campaign/field-league.jpg", width: 1600, height: 2000, source: "campaign", subject: "field-league", caption: "The field is the farm", context: "Campaign storyboard", category: "campaign", date: null, relatedFarmId: null, relatedFarmerId: null, relatedTeamId: null, relatedActivityId: null, role: "editorial", placement: "campaign" },
  ];

  function byId(list, id) {
    return list.find((x) => x.id === id) || null;
  }

  function teamsOfZone(zoneId) {
    return TEAMS.filter((t) => t.zoneId === zoneId);
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
    const withProg = tFarms.filter((f) => typeof f.progress === "number");
    const progress = withProg.length ? Math.round(withProg.reduce((s, f) => s + f.progress, 0) / withProg.length) : 0;
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
      teams: new Set(tFarmers.map((f) => f.teamId).filter(Boolean)).size,
      agents: new Set(tFarmers.map((f) => f.agentId).filter(Boolean)).size,
      acs: tAcs.length,
      acsCovered: new Set(tFarmers.map((f) => f.acId).filter(Boolean)).size,
      progress: 0,
    };
  }

  function acStats(acId) {
    const tFarmers = farmers.filter((f) => f.acId === acId);
    const tFarms = farms.filter((f) => f.acId === acId);
    return {
      farmers: tFarmers.length,
      farms: tFarms.length,
      teams: new Set(tFarmers.map((f) => f.teamId).filter(Boolean)).size,
      agents: new Set(tFarmers.map((f) => f.agentId).filter(Boolean)).size,
      progress: 0,
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
      caseStudies: farmers.filter((f) => f.kind === "case-study").length,
      demoFarmers: DEMO_BOOK.farmers,
      demoFarms: DEMO_BOOK.farms,
      demoAgents: DEMO_BOOK.agents,
      teams: TEAMS.length,
      knownZones: ZONES.length,
      teamCapacity: TEAM_CAPACITY,
      agents: agents.length,
      districts: DISTRICTS.length,
      acs: acs.length,
      acsCovered: new Set(farmers.map((f) => f.acId).filter(Boolean)).size,
      districtsCovered: new Set(farmers.map((f) => f.districtId).filter(Boolean)).size,
      stageCounts,
      meanProgress: 0,
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
    ZONES.forEach((z) => {
      if (z.name.toLowerCase().includes(s) || z.id.replace("-", " ") === s) out.push({ type: "zone", id: z.id, label: z.name });
    });
    TEAMS.forEach((t) => {
      if (t.name.toLowerCase().includes(s) || t.short.toLowerCase() === s) out.push({ type: "team", id: t.id, label: t.name });
    });
    agents.forEach((a) => {
      if (a.code.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)) out.push({ type: "agent", id: a.id, label: a.code + " · " + a.name });
    });
    farmers.forEach((f) => {
      const hay = [f.name, f.gardenName, f.id, f.village, f.place].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(s)) out.push({ type: "farmer", id: f.id, label: f.gardenName ? f.name + " · " + f.gardenName : f.name });
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

  function mediaOfActivity(activity) {
    const ids = (activity && activity.mediaIds) || [];
    return ids.map((id) => mediaById(id)).filter(Boolean);
  }

  global.KRL = {
    META: {
      launched: "2026-09-14",
      notice: "Case-study records and published programme architecture. Not live enrolment.",
      targetFarms: TARGET_FARMS,
      targetPerAc: TARGET_PER_AC,
      teamCapacity: TEAM_CAPACITY,
      demoBook: DEMO_BOOK,
    },
    STAGES,
    STATUSES,
    SCORE_AXES,
    SMART_CATS,
    ZONES,
    TEAMS,
    DISTRICTS,
    ACS: acs,
    AGENTS: agents,
    FARMERS: farmers,
    ENTREPRENEURS: farmers,
    FARMS: farms,
    DEMO_BOOK,
    ACTIVITIES: activities,
    MEDIA,
    mediaById,
    mediaWhere,
    uniqueMedia,
    mediaOfActivity,
    byId,
    teamsOfZone,
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
