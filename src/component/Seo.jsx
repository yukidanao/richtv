import { useEffect } from 'react';

export const SITE_URL = 'https://rich-tv.me';
export const SITE_NAME = 'Rich TV';
export const DEFAULT_TITLE = 'Rich TV — Watch Free Movies & TV Shows Online';
export const DEFAULT_DESCRIPTION =
    'Watch free movies and TV shows online in HD on Rich TV. Stream the latest movies, popular TV series, and trending titles instantly — no sign-up, no subscription. Your free movie streaming hub.';

function upsertMeta(attrName, attrKey, content) {
    if (!content) return;
    const selector = `meta[${attrName}="${attrKey}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrKey);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function upsertLink(rel, href) {
    if (!href) return;
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function setJsonLd(id, data) {
    const existing = document.getElementById(id);
    if (!data) {
        if (existing) existing.remove();
        return;
    }
    if (!existing) {
        const el = document.createElement('script');
        el.type = 'application/ld+json';
        el.id = id;
        document.head.appendChild(el);
    }
    document.getElementById(id).textContent = JSON.stringify(data);
}

function Seo({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, path = '/', image, keywords, jsonLd }) {
    useEffect(() => {
        const fullPath = path.startsWith('http') ? path : `${SITE_URL}${path}`;

        document.title = title;
        upsertMeta('name', 'description', description);
        if (keywords) upsertMeta('name', 'keywords', keywords);

        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:url', fullPath);
        upsertMeta('property', 'og:site_name', SITE_NAME);

        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);

        if (image) {
            upsertMeta('property', 'og:image', image);
            upsertMeta('name', 'twitter:image', image);
        }

        upsertLink('canonical', fullPath);
        setJsonLd('route-jsonld', jsonLd);
    }, [title, description, path, image, keywords, jsonLd]);

    return null;
}

export default Seo;
