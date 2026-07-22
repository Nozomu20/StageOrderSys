import type { Millimeter } from "../domain/units";
import type { MemberId, PartId, TierId } from "../domain/ids";
import type { Member, Part } from "../domain/roster";
import type { ParsedName } from "../domain/nameParsing";
import type { BoardSize } from "../domain/boardCatalog";
import type { Settings } from "./settings";
import type { OutputInfo } from "./outputInfo";

// domain state を変更する操作は、すべてこのunion型を通してdispatchする。
// 1アクション=1つの意味のある操作、という単位を守ること。
// (Undo/Redoを後から導入する際、この単位がそのまま履歴の単位になる)
export type DomainAction =
  | { type: "ADD_TIER" }
  | { type: "REMOVE_TIER"; tierId: TierId }
  | { type: "MOVE_TIER"; tierId: TierId; direction: "up" | "down" }
  | {
      type: "SET_TIER_BOARD";
      tierId: TierId;
      board: BoardSize;
      count: number;
    }
  | { type: "SET_TIER_HEIGHT"; tierId: TierId; height_mm: Millimeter }
  | { type: "ADD_PART"; name: string; color: string }
  | {
      type: "UPDATE_PART";
      partId: PartId;
      patch: Partial<Pick<Part, "name" | "color" | "order">>;
    }
  | { type: "REMOVE_PART"; partId: PartId }
  | { type: "ADD_MEMBERS_BULK"; names: ParsedName[]; partId: PartId }
  | { type: "ADD_MEMBER"; familyName: string; givenName?: string; partId: PartId }
  | {
      type: "UPDATE_MEMBER";
      memberId: MemberId;
      patch: Partial<
        Pick<
          Member,
          "familyName" | "givenName" | "partId" | "isPresent" | "displayNameOverride"
        >
      >;
    }
  | { type: "REMOVE_MEMBER"; memberId: MemberId }
  | { type: "PLACE_MEMBER"; memberId: MemberId; x_mm: Millimeter; y_mm: Millimeter }
  | { type: "UNPLACE_MEMBER"; memberId: MemberId }
  | { type: "UPDATE_SETTINGS"; patch: Partial<Settings> }
  | { type: "UPDATE_OUTPUT_INFO"; patch: Partial<OutputInfo> };
