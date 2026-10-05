import { Star } from 'lucide-react';
import { googleReviewsUrl, reviews } from '@/content/site';
import { Eyebrow } from '../ui/Eyebrow';
import { Reveal } from '../ui/Reveal';
import { TextLink } from '../ui/TextLink';

const PLACEHOLDER_COUNT = 3;

function Stars({ rating, placeholder }: { rating: number; placeholder?: boolean }) {
  return (
    <div className="flex gap-1" role="img" aria-label={placeholder ? 'Beoordeling volgt' : `${rating} van 5 sterren`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          strokeWidth={1.2}
          className={`h-3.5 w-3.5 ${
            placeholder ? 'text-stone/40' : i < rating ? 'fill-mocha text-mocha' : 'text-stone/40'
          }`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const hasReviews = reviews.length > 0;
  const items = hasReviews
    ? reviews.slice(0, 3)
    : Array.from({ length: PLACEHOLDER_COUNT }, () => null);

  return (
    <section aria-labelledby="reviews-title" className="relative bg-cream py-24 md:py-36">
      <div className="container-edge">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow>Reviews</Eyebrow>
            <h2 id="reviews-title" className="mt-7 max-w-2xl text-[2.6rem] leading-[0.98] md:text-[4rem]">
              Wat onze klanten <span className="italic">zeggen</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-center gap-3 text-sm text-stone">
            <GoogleMark />
            <span>Reviews via Google</span>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-1 border-t border-ink/15 md:mt-20 md:grid-cols-3">
          {items.map((review, i) => (
            <li
              key={i}
              className={`border-b border-ink/15 py-10 md:border-b-0 md:py-12 ${
                i > 0 ? 'md:border-l md:pl-10' : ''
              } ${i < items.length - 1 ? 'md:pr-10' : ''}`}
            >
              <Reveal delay={i * 0.08}>
                <figure>
                  <Stars rating={review?.rating ?? 0} placeholder={!review} />
                  <blockquote
                    className={`mt-6 font-display text-[1.6rem] leading-[1.3] md:text-[1.75rem] ${
                      review ? 'text-ink' : 'italic text-stone/70'
                    }`}
                  >
                    {review ? `“${review.text}”` : 'Hier verschijnt binnenkort een echte Google Review van een klant.'}
                  </blockquote>
                  <figcaption className="mt-8 flex items-center justify-between gap-4">
                    <span className={`caps ${review ? 'text-ink' : 'text-stone/70'}`}>
                      {review ? review.author : '[Naam klant]'}
                    </span>
                    <span className="text-xs text-stone">Google</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>

        {googleReviewsUrl && (
          <Reveal className="mt-12">
            <TextLink href={googleReviewsUrl} external arrow="↗">
              Bekijk alle reviews
            </TextLink>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}
