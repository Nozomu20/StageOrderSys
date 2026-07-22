import { createDefaultStage, type Stage } from "../domain/stage";
import { createPart, type Member, type Part } from "../domain/roster";
import type { PlacementsById } from "../domain/placement";
import { nextPartColor } from "../domain/partColors";
import { defaultSettings, type Settings } from "./settings";
import { defaultOutputInfo, type OutputInfo } from "./outputInfo";

export interface DomainState {
  stage: Stage;
  roster: { members: Member[]; parts: Part[] };
  placements: PlacementsById;
  settings: Settings;
  outputInfo: OutputInfo;
}

export function createInitialDomainState(): DomainState {
  return {
    stage: createDefaultStage(),
    roster: {
      members: [],
      parts: [createPart("Sop", nextPartColor(0), 0)],
    },
    placements: {},
    settings: defaultSettings,
    outputInfo: defaultOutputInfo,
  };
}
