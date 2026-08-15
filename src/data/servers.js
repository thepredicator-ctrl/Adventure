export const SERVERS = {
  1: { id: 1, name: 'VIDSRC.IN',  build: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}` },
  2: { id: 2, name: 'VIDSRC.PRO', build: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
  3: { id: 3, name: 'VIDLINK',    build: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
  4: { id: 4, name: 'VSEMBED',    build: (id, s, e) => `https://vsembed.ru/embed/tv/${id}/${s}/${e}?autoplay=1` }
};

export const SERVER_LIST = Object.values(SERVERS);
