/**
 * Cloudflare Worker — YouTube transcript proxy
 *
 * Fetches YouTube transcripts from Cloudflare's edge network so that the EC2
 * backend (whose AWS IP is flagged by YouTube's bot detection) never calls
 * YouTube directly.
 *
 * Deploy:
 *   1. Go to https://workers.cloudflare.com → Create Worker → paste this file.
 *   2. Add a secret: Settings → Variables → Add variable
 *      Name: AUTH_SECRET   Value: <any long random string>
 *   3. Note your worker URL (e.g. https://yt-transcript.YOUR-NAME.workers.dev)
 *   4. Set these in your EC2 .env:
 *        YOUTUBE_WORKER_URL=https://yt-transcript.YOUR-NAME.workers.dev
 *        YOUTUBE_WORKER_SECRET=<the same secret from step 2>
 *
 * Request format:
 *   GET /?videoId=<11-char-id>&lang=en
 *   Authorization: Bearer <AUTH_SECRET>
 *
 * Response (200):  { "transcript": "full text of the video..." }
 * Response (404):  { "error": "No transcript available" }
 */

const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const CLIENT_VERSION = '20.10.38';
const ANDROID_UA = `com.google.android.youtube/${CLIENT_VERSION} (Linux; U; Android 14)`;

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function fetchCaptionTracks(videoId) {
  const resp = await fetch(INNERTUBE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ANDROID_UA,
    },
    body: JSON.stringify({
      context: {
        client: { clientName: 'ANDROID', clientVersion: CLIENT_VERSION },
      },
      videoId,
    }),
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  return Array.isArray(tracks) && tracks.length > 0 ? tracks : null;
}

// Request JSON3 format — avoids word-timing inner tags (<c>word</c>) that break
// regex-based XML parsing of auto-generated captions.
function buildJson3Url(baseUrl) {
  const url = new URL(baseUrl);
  url.searchParams.set('fmt', 'json3');
  return url.toString();
}

async function fetchTranscriptJson3(trackUrl) {
  const resp = await fetch(buildJson3Url(trackUrl));
  if (!resp.ok) return null;

  let data;
  try {
    data = await resp.json();
  } catch {
    return null;
  }

  if (!Array.isArray(data?.events)) return null;

  const parts = [];
  for (const event of data.events) {
    if (!Array.isArray(event.segs)) continue;
    for (const seg of event.segs) {
      if (typeof seg.utf8 === 'string' && seg.utf8 !== '\n') {
        parts.push(seg.utf8);
      }
    }
  }

  const text = decodeEntities(parts.join(' ').replace(/\s+/g, ' ').trim());
  return text || null;
}

function pickTrack(tracks, lang) {
  if (!lang) return tracks[0];
  return (
    tracks.find((t) => t.languageCode === lang) ||
    tracks.find((t) => t.languageCode?.startsWith(lang)) ||
    tracks[0]
  );
}

export default {
  async fetch(request, env) {
    // Simple bearer-token auth — prevents random internet users from using
    // your worker as a free YouTube proxy.
    const secret = env.AUTH_SECRET;
    if (secret) {
      const auth = request.headers.get('Authorization') || '';
      if (auth !== `Bearer ${secret}`) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId')?.trim();
    const lang = searchParams.get('lang')?.trim() || null;

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return Response.json({ error: 'Invalid or missing videoId' }, { status: 400 });
    }

    const tracks = await fetchCaptionTracks(videoId);
    if (!tracks) {
      return Response.json({ error: 'No transcript available' }, { status: 404 });
    }

    const track = pickTrack(tracks, lang);
    if (!track?.baseUrl) {
      return Response.json({ error: 'No transcript available' }, { status: 404 });
    }

    const transcript = await fetchTranscriptJson3(track.baseUrl);
    if (!transcript) {
      return Response.json({ error: 'No transcript available' }, { status: 404 });
    }

    return Response.json({ transcript, lang: track.languageCode });
  },
};
