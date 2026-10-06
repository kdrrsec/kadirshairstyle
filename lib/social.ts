export type SocialVideo = {
  platform: 'tiktok' | 'instagram';
  url: string;
  embedUrl: string;
};

/** Zet een TikTok- of Instagram-link om naar de officiële embed-URL. */
export function parseSocialVideo(url: string): SocialVideo | null {
  const tiktok = url.match(/tiktok\.com\/.*\/video\/(\d+)/) || url.match(/tiktok\.com\/(?:embed\/v2|player\/v1)\/(\d+)/);
  if (tiktok) {
    return {
      platform: 'tiktok',
      url,
      embedUrl: `https://www.tiktok.com/player/v1/${tiktok[1]}?music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0`,
    };
  }
  const insta = url.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (insta) {
    const kind = insta[1] === 'p' ? 'p' : 'reel';
    return { platform: 'instagram', url, embedUrl: `https://www.instagram.com/${kind}/${insta[2]}/embed/` };
  }
  return null;
}
