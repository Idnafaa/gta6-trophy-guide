# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Idnafaa/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Idnafaa/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Trophy Log** is an offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI.
It is plain static files in `app/` (ES modules, CSS, one JSON data file, no build step) and loads nothing from the network.

- Checklist of all 55 trophies with the official name, description and grade; progress saved in localStorage.
- Filters by kind (story, side quests, activities, collectibles, crime, world, completion, missable, online: there are none), grade and status, plus search.
- Spoiler setting: hide the 12 story trophies, or all 28 hidden ones, until earned (or reveal one at a time).
- Export progress to a `.json` file and import it back (merge or replace).
- Roadmap to the platinum in three stages, stage 1 split by chapter, with the single potentially missable trophy flagged.
- A guide for every trophy, written for this app in its own words, with its sources linked beside it (PowerPyx, GTA Zone, KeenGamer, GTA Vibes, the official list). Where the trigger is not known yet, the guide says so.

No Rockstar logo, artwork or screenshots are used; the look is original.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
# hand-in: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=01tnmm85&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
