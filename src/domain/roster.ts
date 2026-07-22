import { createId, type MemberId, type PartId } from "./ids";

export interface Part {
  id: PartId;
  name: string;
  color: string;
  order: number;
}

export interface Member {
  id: MemberId;
  familyName: string;
  givenName?: string;
  partId: PartId;
  isPresent: boolean;
  displayNameOverride?: string;
}

export function createPart(name: string, color: string, order: number): Part {
  return { id: createId<"Part">(), name, color, order };
}

export function createMember(
  familyName: string,
  givenName: string | undefined,
  partId: PartId,
): Member {
  return {
    id: createId<"Member">(),
    familyName,
    givenName,
    partId,
    isPresent: true,
  };
}
