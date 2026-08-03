export const socialPlatforms = ["instagram", "tiktok", "x", "facebook", "linkedin", "discord", "reddit"] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];

export type SocialLinks = Record<SocialPlatform, string>;

export const socialPlatformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  discord: "Discord",
  reddit: "Reddit",
};

export function createEmptySocialLinks(): SocialLinks {
  return {
    instagram: "",
    tiktok: "",
    x: "",
    facebook: "",
    linkedin: "",
    discord: "",
    reddit: "",
  };
}

export function socialLinksFromRows(rows: Array<{ platform: string; url: string }>): SocialLinks {
  const links = createEmptySocialLinks();

  for (const row of rows) {
    if (socialPlatforms.includes(row.platform as SocialPlatform)) {
      links[row.platform as SocialPlatform] = row.url;
    }
  }

  return links;
}
