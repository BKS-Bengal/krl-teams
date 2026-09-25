# KRL TEAMS — MEDIA + DATA + UX ARCHITECTURE QA REPORT

Inspected locally at `http://127.0.0.1:8790/` after the architecture change. Production inspection follows the dedicated `krl-teams` deploy. KRL Media Connect was not modified.

## 1. Root cause of repeated images

`command-data.js` generated ~413 farms and, for ~22% of them, minted an activity. About 35% of those activities were given one of three library stills (`images/field/irrigation.jpg`, `paddy.jpg`, `pond.jpg`) at random.

The Command Centre then rendered `ACTIVITIES.filter(a => a.photo).slice(0, 5)`. That is why the same photograph appeared as Demo Farm 272, Demo Farm 241, Demo Farm 096 and others.

A second path stamped the same three stills onto every Farm 360 header by crop name. Maa Ganga evidence and before/after reused irrigation and pond again as separate “events”.

This was a content-model failure, not a CSS problem.

## 2. Root cause of synthetic / demo records

A seeded generator (`mulberry(20260925)`) manufactured:

- 360 farmers (`Demo Farmer NNN`)
- 413 farms (`Demo Farm NNN`)
- 120 agents (`AG-001` … `AG-120`)
- Random visit dates between 2026-09-14 and 2026-09-25
- Random activity titles (“Photo evidence uploaded”, “Follow-up pending”, …)

Those rows existed only to fill tables and cards. They were not Knowledge Base records.

## 3. Media architecture changes

Media is now a first-class collection, separate from Activity.

Each item has: `id`, `src`, `caption`, `context`, `category`, optional `date`, optional `relatedFarmId` / `relatedFarmerId` / `relatedTeamId` / `relatedActivityId`, `role`, `placement`.

Rules now enforced:

- One photograph = one placement.
- An activity may exist with no photograph.
- A photograph may exist with no activity.
- Unverified field stills are labelled editorial context, never farm evidence.
- Farm 360 shows a contextual image only when that farm has a unique `contextualMediaId`.
- Media page is featured + supporting + field context. No masonry fill. No repeated src.

## 4. Duplicate asset findings

SHA-256 inventory of the workspace (exact duplicates):

| Hash (12) | Files |
|---|---|
| 84A4FFE11227 | `images/audience.jpg` = `images/archive/audience.jpg` |
| 9CE11008F368 | `images/banner.jpg` = `images/archive/banner.jpg` |
| 037E7AA76133 | `images/g-from-stage.jpg` = `images/archive/g-from-stage.jpg` |
| 25713BFD7F42 | `images/hero.jpg` = `images/archive/hero.jpg` |
| 3527AC67B544 | `images/launch-wide.jpg` = `images/archive/launch-wide.jpg` |
| BD09BE3E8959 | `images/opening.jpg` = `images/archive/opening.jpg` |
| 3C22756B6181 | `images/press-panel.jpg` = `images/archive/press-panel.jpg` |
| BAE9197CAB9B | `images/stage.jpg` = `images/archive/stage.jpg` |

Field stills are unique files. Official team PNGs are unique. Archive copies were not renamed and were not bound to extra records.

## 5. Assets retained

- 15 official team logos
- Programme stills: hero, banner, g-krl-mark, press-huddle, launch-wide
- Field library: irrigation, paddy, pond, visit, training
- Brand: krl-logo, bks-seal, wb-outline
- Videos remain in the library (`video/clip-1.mp4`, `video/krl-intro-bg.mp4`) but are not attached to farm evidence

## 6. Assets removed from UI (not deleted from disk)

Removed from public render because they would repeat a hash or invent a relationship:

- Archive folder copies of the same launch stills
- `irrigation.jpg` as activity photo, evidence, video poster, and before/after
- `paddy.jpg` / `pond.jpg` as farm-header fallbacks and fake evidence
- Videos presented as Maa Ganga field evidence

## 7. Assets newly discovered / used

Previously unused legitimate assets now used once:

- `images/field/visit.jpg` — editorial field / community
- `images/launch-wide.jpg` — Media Connect CTA (not reused as featured)
- `images/press-release-cover.jpg` — poster for the session-film link only
- `images/field/paddy.jpg` and `pond.jpg` — editorial field context, no farm IDs

`images/field/training.jpg` and unused launch stills (audience, opening, stage, press-panel, g-opening) remain in the library. They are not forced into the grid.

## 8. Unsupported records removed

Removed entirely:

- 359 synthetic farmers
- 412 synthetic farms (Demo Farm 001–360 and B holdings)
- 119 synthetic agents (including AG-010, AG-048)
- All random photo-linked activities
- Random last-visit dates
- Invented evidence counts and before/after pairs
- Empty social channels (Facebook / Instagram “Not linked”)
- Placeholder support roles (Demo Trainer 02, NRB match pending, Not assigned)

Retained as the only authored field case:

- Farmer 014 · F-014 · Maynaguri
- Maa Ganga Smart Farm
- Agent AG-024 · Terai Tuskers
- Activity: “Drip irrigation installation marked” (no photograph)

## 9. Team placeholder cleanup

`RESERVED_TEAMS` is deleted from data and export.

Twenty-team capacity remains an internal `TEAM_CAPACITY` constant on `META`. It is not rendered.

Public Teams view shows only the 15 official identities, each with its official logo. No “Identity pending”. No Slot 16–20.

## 10. UX / UI improvements

After the data cut, the layout was rebalanced rather than left with holes:

- Command mast shows programme target (5,000), 294 ACs, 15 teams, 1 known farm
- Current activity is a single operational line, not a five-card photo wall
- Team register leads with geography; field counts appear only when a record exists
- Media is featured + three supporting launch stills + three distinct field stills
- Farm 360 tabs are data-aware: Overview, Journey, Smart farming, Monitoring, People. Media and Social tabs are absent because those records are not trustworthy
- Ivory / navy / field-green / wheat system retained. No new card wall, no lime gradients

## 11. Research / design principles applied

Reviewed Cropin Cloud, OneSoil, John Deere Operations Center, and Climate FieldView.

Translated, not copied:

- Field-first hierarchy (state → district → AC → team → agent → farmer → farm)
- Map as orientation, not decoration
- Scouting / activity as an operational record that does not require a photograph
- Media as evidence only when the relationship is known
- Progressive disclosure: hide empty future tabs
- Data density over decorative occupancy

## 12. Build / test results

Static HTML / CSS / JS. No TypeScript build.

Local checks on `http://127.0.0.1:8790/`:

- Command, Teams, Media, Farm 360, Activity render
- `KRL.TEAMS.length === 15`
- `KRL.RESERVED_TEAMS` is undefined
- `KRL.FARMS` = Maa Ganga only
- Media main-column images: 8 unique srcs, 0 duplicates
- Forbidden strings absent from rendered Command / Teams / Farm / Media

## 13. Production smoke-test results

Dedicated project: Vercel `krl-teams` (`prj_RM0HeVzqHGR3DDKUaqy28l5syQnP`) on team `ram-badrinathans-projects`.

Repository: `BKS-Bengal/krl-teams`.

KRL Media Connect (`prj_Z7tnzctmKOSWiHyc6owqAsPhWMv5`, https://krl-media-connect.vercel.app/) was not opened for write and was not merged.

Production inspected at https://krl-teams.vercel.app/ after deploy `dpl_E4Piaajne3oPi5hWsT3v3s5tepBc` (commit `291760b`). Command, Teams and Media match the local architecture: 15 official teams, no reserved slots, one known farm, unique media srcs, Media Connect CTA intact.

Local smoke (pre-deploy) checklist:

- [x] No repeated photograph used as unrelated content
- [x] No artificial farm/activity records in the public book
- [x] No Demo Farm filler
- [x] No Identity pending / Slot 16–20
- [x] Only 15 official teams, official logos
- [x] No empty / “No media” cards
- [x] Media count matches curated unique assets
- [x] Farmer and Farm remain separate entities
- [x] Activity and Media remain separate entities
- [x] Farm 360 is data-aware
- [x] West Bengal map remains, with a mark only where a farm record exists
- [x] Media Connect CTA: Know more / আরও জানুন → https://krl-media-connect.vercel.app/ `target=_blank` `rel=noopener noreferrer`

## 14. Git commit

`291760b94c8693ae52c8b960021ee41e66eb4e75` on `BKS-Bengal/krl-teams` (`master`).

Message: Stop minting demo farms and stop reusing one field photo as many events.

## 15. Vercel deployment

Production deploy `dpl_E4Piaajne3oPi5hWsT3v3s5tepBc` on project `krl-teams` (`prj_RM0HeVzqHGR3DDKUaqy28l5syQnP`) is READY.

Aliases include https://krl-teams.vercel.app/

Media Connect (`prj_Z7tnzctmKOSWiHyc6owqAsPhWMv5`) was not written to and remains a separate repository and deployment.

## 16. Remaining limitations

- Farmer 014 / AG-024 / Maa Ganga remain authored case identities, not published civil names.
- Journey dates on the flagship are the authored case timeline from the 14 September 2026 launch, not a live field log.
- Most districts and teams correctly show geography with no farmer/farm/agent rows. That emptiness is honest, not a hole to fill.
- Unused unique stills stay in the library rather than being forced into a larger grid.
- This is still a static command surface, not a live enrolment database.
- Twenty-team capacity is internal only; adding a 16th public team requires an official identity and logo, not a placeholder slot.
