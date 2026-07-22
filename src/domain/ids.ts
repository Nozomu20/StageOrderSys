export type Id<T extends string> = string & { readonly __brand: T };

export type TierId = Id<"Tier">;
export type SegmentId = Id<"Segment">;
export type MemberId = Id<"Member">;
export type PartId = Id<"Part">;
export type PropId = Id<"Prop">;

export function createId<T extends string>(): Id<T> {
  return crypto.randomUUID() as Id<T>;
}
