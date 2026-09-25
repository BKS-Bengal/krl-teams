# KRL Teams — Case-study architecture implementation

Feature branch only. Production was not updated.

## 1. Repository inspected

`BKS-Bengal/krl-teams` (local workspace `pk-bengal`). Vanilla HTML / CSS / JS. No package manager, no TypeScript, no database. Existing production host is Vercel (`krl-teams.vercel.app`). No Cloudflare / Wrangler config exists in the repository.

## 2. Existing architecture found

Hash-router SPA (`#/`). Data in `command-data.js`. Fifteen official teams with official PNG logos. 23 districts / 294 ACs. Previous flagship was an invented Maa Ganga / Farmer 014 / AG-024 record. Media was already unique-by-src after the last architecture pass.

## 3. Major architecture changes

Reusable case-study model:

- Agri-entrepreneur and farm/garden are separate entities.
- One entrepreneur may hold many farms (`farmIds[]`).
- Team is attached only from the existing district → team map, and labelled as geography mapping, not enrolment.
- Unknown fields stay null and are omitted from the UI.
- Approved demo-book volumes (360 / 413 / 120) are architecture metrics, not generated rows.
- 5,000 remains a programme target.

## 4. UI / UX changes

Command Centre now features two case studies beside the West Bengal map. Nav label is Agri-entrepreneurs. Farm 360 tabs appear only when data exists. No photo-card wall of fake activities. Ivory / navy / field-green system retained.

## 5. Amit Shill / Pikas Garden

Named case study. Geography: West Bengal → Dakshin Dinajpur → 39 – Balurghat → Dinajpur Defenders (district map) → Amit Shill → Pikas Garden.

Digital presence (supplied / confirmed reachable):

- https://www.youtube.com/@PikasGardening — channel title fetched as “Pika's Gardening”
- https://www.facebook.com/reel/2557686798080686 — kept as a source URL; the reel body was not readable programmatically

Not invented: address, farm size, crops, yields, agent, quotes, vision, activities.

## 6. Krishna Biswas / Rupali Garden

Named case study. Farm: Rupali Garden. YouTube: https://www.youtube.com/@RupaliGarden — channel title fetched as “Rupali Garden”. Video list, district, AC, team, size and crops were not readable and were not invented.

## 7. Geography changes

Balurghat carries official number 39. Dakshin Dinajpur is the only district mark on the map (Amit). Drill-down works both ways for Amit. Krishna has no fabricated geography.

## 8. Team changes

Still 15 official identities and official logos. No Slot 16–20. Dinajpur Defenders shows the Amit / Pikas record because Dakshin Dinajpur is already on that team in the programme map.

## 9. Media architecture changes

Irrigation.jpg is editorial field context only. It is not attached to Amit or Krishna. Programme Media remains featured + supporting + field, unique srcs. Activity list is empty.

## 10. Duplicate media removed

No new duplicate bindings. Case studies have no farm photographs.

## 11. Unsupported / fake content removed

Removed Maa Ganga, Farmer 014, AG-024, invented journey, smart-farming percentages, drip activity, and any Demo Farm / AG-010 style operational rows.

## 12. Assets discovered

YouTube channels exist. No downloadable case-study stills were obtained from those pages. Existing team logos and programme stills unchanged.

## 13. Local QA result

Checked locally at `http://127.0.0.1:8790/`:

- Command: 5,000 target, 294 ACs, 15 teams, 2 case studies
- Amit profile and Pikas Farm 360 (Overview / People / Social only)
- Krishna profile (YouTube only; geography omitted)
- 15 teams, no reserved slots
- 0 activities, 0 agents, 2 farms

## 14. Git branch

`feat/agri-entrepreneur-case-studies`

## 15. Commit hash

`5eac0a333c96a8a25c1d5702a2e22411d65725ce`

## 16. Push result

Pushed to `origin` as the feature branch only. `master` / production branch was not merged.

## 17. Cloudflare project used

None. The repository has no `wrangler.toml`, no Cloudflare Pages config, and no Cloudflare MCP tools. Existing production is Vercel.

## 18. Cloudflare Preview URL

Not created. A Preview URL will not be invented.

## 19. Production status

Unchanged. No production deploy was made from this branch.

## 20. Manual action required

Ram Sir / the operator needs to either:

1. Connect `BKS-Bengal/krl-teams` to the existing Cloudflare account as Pages (or Workers) and enable branch Preview for `feat/agri-entrepreneur-case-studies`, or
2. Confirm that Vercel Preview on this branch is acceptable for review.

After Preview review and approval, production promotion can be considered. KRL Media Connect was not modified.
