export const SERVERS = {
  1: { id: 1, name: 'VIDSRC.IN',   build: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}` },
  2: { id: 2, name: 'VIDSRC.PRO',  build: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
  3: { id: 3, name: 'VIDLINK',     build: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
  4: { id: 4, name: 'VSEMBED',     build: (id, s, e) => `https://vsembed.ru/embed/tv/${id}/${s}/${e}?autoplay=1` },
  // Anime-friendly backups (S3 of Mushoku Tensei is currently airing and may be missing
  // from the primary four — these are known to carry newer anime via IMDb id).
  5: { id: 5, name: 'VIDSRC.XYZ',  build: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}/` },
  6: { id: 6, name: 'VIDSRC.NET',  build: (id, s, e) => `https://vidsrc.net/embed/tv/${id}/${s}/${e}/` },
  7: { id: 7, name: '2EMBED.CC',   build: (id, s, e) => `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  8: { id: 8, name: 'EMBED.SU',    build: (id, s, e) => `https://embed.su/embedtv/${id}/${s}/${e}` },
  9: { id: 9, name: 'MULTIEDBED',  build: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tv=1&s=${s}&e=${e}` }
};

export const SERVER_LIST = Object.values(SERVERS);
