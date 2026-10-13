import { Play } from 'lucide-react';
import { site, socialVideos } from '@/content/site';
import { parseSocialVideo } from '@/lib/social';
import { InstagramIcon, TikTokIcon } from './SocialIcons';
import { CtaInner } from '@/components/CtaInner';

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
              <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" className="cta cta-soft cta-sm social-btn">
                <CtaInner>
                  <TikTokIcon size={16} /> TikTok
                </CtaInner>
              </a>
            )}
            {site.instagram && (
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="cta cta-soft cta-sm social-btn">
                <CtaInner>
                  <InstagramIcon size={16} /> Instagram
                </CtaInner>
              </a>
            )}
          </div>
        </div>

        <ul className="social-rail">
          {videos.length > 0
            ? videos.map((v) => (
                <li key={v.url} className={`social-card ${v.platform}`}>
                  {v.platform === 'file' ? (
                    <video src={v.embedUrl} poster={v.poster} autoPlay muted loop playsInline preload="metadata" />
                  ) : (
                    <iframe
                      src={v.embedUrl}
                      title={v.platform === 'tiktok' ? 'TikTok-video van Kadir’s Hairstyle' : 'Instagram-video van Kadir’s Hairstyle'}
                      loading="lazy"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      scrolling="no"
                      tabIndex={-1}
                    />
                  )}
                  {/* Klikvlak over de video: geen speler-menu's, wel doorklikken naar TikTok/Instagram. */}
                  <a
                    href={v.platform === 'file' ? (site.tiktok?.url ?? v.url) : v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={v.platform === 'instagram' ? 'Bekijk deze video op Instagram' : 'Bekijk deze video op TikTok'}
                  />
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
