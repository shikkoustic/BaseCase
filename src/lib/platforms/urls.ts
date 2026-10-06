export function problemUrl(platform: "leetcode" | "codechef", externalRef: string): string {
  return platform === "leetcode"
    ? `https://leetcode.com/problems/${externalRef}/`
    : `https://www.codechef.com/problems/${externalRef}`;
}
