import { createDefaultStage, type Stage } from "../domain/stage";
import { createPart, type Member, type Part } from "../domain/roster";
import type { PlacementsById } from "../domain/placement";
import { defaultSettings, type Settings } from "./settings";

export interface DomainState {
  stage: Stage;
  roster: { members: Member[]; parts: Part[] };
  placements: PlacementsById;
  settings: Settings;
}

export function createInitialDomainState(): DomainState {
  return {
    stage: createDefaultStage(),
    roster: {
      members: [],
      parts: [createPart("Sop", "#e57373", 0)],
    },
    placements: {},
    settings: defaultSettings,
  };
}
