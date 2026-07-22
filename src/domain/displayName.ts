import type { Member } from "./roster";
import type { MemberId } from "./ids";

// コマに表示する名前を、名簿全体を見て自動的に決定する。
// 1. 基本は姓のみ
// 2. 同姓が複数いる場合、その姓の全員に名の1文字目を付加する
// 3. それでも重複するなら、区別がつくまで名の文字数を増やす
// 4. displayNameOverride があれば常にそれを優先する
// 出欠で除外された団員(isPresent=false)は重複判定の対象から外す。
export function resolveDisplayNames(
  members: Member[],
): Map<MemberId, string> {
  const result = new Map<MemberId, string>();

  for (const member of members) {
    if (member.displayNameOverride) {
      result.set(member.id, member.displayNameOverride);
    }
  }

  const targets = members.filter(
    (m) => m.isPresent && !m.displayNameOverride,
  );
  const byFamilyName = new Map<string, Member[]>();
  for (const member of targets) {
    const group = byFamilyName.get(member.familyName) ?? [];
    group.push(member);
    byFamilyName.set(member.familyName, group);
  }

  for (const [familyName, group] of byFamilyName) {
    if (group.length === 1) {
      result.set(group[0].id, familyName);
      continue;
    }

    const maxGivenNameLength = Math.max(
      ...group.map((m) => (m.givenName ?? "").length),
    );
    let len = 1;
    for (;;) {
      const names = group.map((m) => {
        const suffix = (m.givenName ?? "").slice(0, len);
        return suffix ? `${familyName} ${suffix}` : familyName;
      });
      const isUnique = new Set(names).size === names.length;
      if (isUnique || len >= maxGivenNameLength) {
        group.forEach((m, i) => result.set(m.id, names[i]));
        break;
      }
      len++;
    }
  }

  for (const member of members) {
    if (!member.isPresent && !member.displayNameOverride) {
      result.set(member.id, member.familyName);
    }
  }

  return result;
}
