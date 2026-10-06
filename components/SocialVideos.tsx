import { Play } from 'lucide-react';
import { site, socialVideos } from '@/content/site';
import { parseSocialVideo } from '@/lib/social';
import { InstagramIcon, TikTokIcon } from './SocialIcons';

const PLACEHOLDERS = 4;

export function SocialVideos() {
  const videos = socialVideos.map(parseSocialVideo).filter((v) => v !== null);

  return (
    <section className="section section-alt social-section" id="video">
      <div className="container">
        <div className="social-head">
          <div>
            <p className="eyebrow">Social</p>
            <h2>Bekijk ons werk</h2>
            <p className="social-intro">Fades, strakke lijnen en verse coupes. Rechtstreeks uit de stoel bij Kadir&rsquo;s.</p>
          </div>
          <div className="social-links">
            {site.tiktok && (
              <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost social-btn">
                <TikTokIcon size={16} /> TikTok
              </a>
            )}
            {site.instagram && (
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost social-btn">
                <InstagramIcon size={16} /> Instagram
              </a>
            )}
          </div>
        </div>

        <ul className="social-rail">
          {videos.length > 0
            ? videos.map((v) => (
                <li key={v.url} className={`social-card ${v.platform}`}>
                  <iframe
                    src={v.embedUrl}
                    title={v.platform === 'tiktok' ? 'TikTok-video van Kadir’s Hairstyle' : 'Instagram-video van Kadir’s Hairstyle'}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    scrolling="no"
                  />
                  <span className="social-badge" aria-hidden="true">
                    {v.platform === 'tiktok' ? <TikTokIcon size={14} /> : <InstagramIcon size={14} />}
                  </span>
                </li>
              ))
            : Array.from({ length: PLACEHOLDERS }, (_, i) => (
                <li key={i} className="social-card placeholder">
                  <span className="social-placeholder">
                    <span className="social-play">
                      <Play size={20} strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    <span>Video volgt binnenkort</span>
                  </span>
                  <span className="social-badge" aria-hidden="true">
                    {i % 2 === 0 ? <TikTokIcon size={14} /> : <InstagramIcon size={14} />}
                  </span>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
