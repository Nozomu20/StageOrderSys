import type { Millimeter } from "./units";
import type { MemberId } from "./ids";

export interface Placement {
  memberId: MemberId;
  x_mm: Millimeter;
  y_mm: Millimeter;
}

// 「配置されているMemberの分だけ存在する」ことを表現する。
// 未配置かどうかは placements にキーが存在するかどうかで判定し、
// Member側に配置済みフラグは持たせない。
export type PlacementsById = Record<MemberId, Placement>;

export function withoutPlacement(
  placements: PlacementsById,
  memberId: MemberId,
): PlacementsById {
  const rest = { ...placements };
  delete rest[memberId];
  return rest;
}
