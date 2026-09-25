# PK Bengal — Smart Farming Command Centre

Independent operational prototype for the Krishi Ratna League Bengal programme.

This repository is **not** KRL Media Connect. Media Connect remains at `BKS-Bengal/krl-media-connect`.

## What this is
A static Command Centre: West Bengal → District → Assembly Constituency → Team → Agent → Farmer → Farm 360°.

## What the numbers mean
- 5,000 farmers = programme target
- 360 / 413 / 120 = demo book volumes
- 15 official teams + 5 identity-pending slots
- 294 assembly constituencies in the geography model

All farmer, farm, agent, activity and score records are synthetic and labelled as prototype data.

## Run locally
```
python -m http.server 8788
```
Open http://127.0.0.1:8788/

## Architecture
Vanilla HTML / CSS / JS. No framework, no database.

## Team marks
The 15 official team identities come from the issued team sheet in `images/teams/`. Slots 16–20 remain Identity pending.
