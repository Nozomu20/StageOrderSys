export interface ParsedName {
  familyName: string;
  givenName?: string;
}

// 1行1名のテキスト貼り付けを姓名に分割する。
// 区切りは半角/全角スペース。区切りがなければ全体を姓として扱う。
export function parseBulkNames(text: string): ParsedName[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(/[ 　]+/).filter(Boolean);
      if (parts.length <= 1) {
        return { familyName: line };
      }
      const [familyName, ...rest] = parts;
      return { familyName, givenName: rest.join(" ") };
    });
}
