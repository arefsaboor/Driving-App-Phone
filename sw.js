// Service worker of the phone build (filled in and written as sw.js by tools/src/cli/deploy-phone.ts).
// - Data files and pictures are stored encrypted under x/<path>.bin. The app asks for the plain path; this worker
//   fetches the encrypted file, decrypts it with the key from IndexedDB "mtp-phone" (set on the unlock screen) and answers.
// - Offline: the app itself is cached when installed; questions are refreshed whenever the phone is online (cached for
//   offline use, still encrypted); a picture is downloaded once and then kept, encrypted.
const BASE = "/Driving-App-Phone/";
const VERSION = "2b50d5035f6f";
const SHELL_FILES = ["index.html","assets/index-BeStV-92.js","assets/index-ig2Ta9Rw.css","assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2","assets/inter-cyrillic-wght-normal-DqGufNeO.woff2","assets/inter-greek-ext-wght-normal-DlzME5K_.woff2","assets/inter-greek-wght-normal-CkhJZR-_.woff2","assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2","assets/inter-latin-wght-normal-Dx4kXJAl.woff2","assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2","assets/unlock-BNaWdCRf.js","assets/z-1000-32-BRZcX2bE.png","assets/z-1000-33-DFkbN9a5.png","assets/z-1001-30-CR7VNM68.png","assets/z-1004-32-DuR90LMO.svg","assets/z-1008-30-DpUYk32T.png","assets/z-101-10-cS1Y6TX7.png","assets/z-101-11-CnMc6hC2.png","assets/z-101-12-CdFNeYtT.png","assets/z-101-13-Dvyc6a60.png","assets/z-101-14-DMijYhQt.png","assets/z-101-15-BJZft4YV.png","assets/z-101-51-CQNxv8YW.svg","assets/z-101-52-Bg1DCO27.png","assets/z-101-53-Bz4L-Fom.png","assets/z-101-54-DViG6_2R.png","assets/z-101-55-DXVpQ-RB.png","assets/z-1010-64-CYTHhlZg.svg","assets/z-1012-32-CFukeuWq.png","assets/z-1020-30-BiQ-Avy-.svg","assets/z-1020-32-D-W5kZu_.png","assets/z-1022-10-Coep7xMR.svg","assets/z-1026-35-DxSAPf0y.svg","assets/z-1026-36-D1gtAa3s.svg","assets/z-103-10-BQ5iS1Dv.png","assets/z-1031-52-DTC-jHw3.png","assets/z-1040-32-Bv6kDESo.png","assets/z-1044-30-DeV0QgBl.svg","assets/z-105-10-DRdOQfwj.png","assets/z-1053-31-CZWfFGLB.png","assets/z-1053-35-BL4CpNZ-.png","assets/z-1060-31-oVrIE_yV.png","assets/z-108-10-J_vg81Z0.png","assets/z-110-10-Dh3YOIk3.png","assets/z-112-2WgbfG33.png","assets/z-114-Dqi2pteV.png","assets/z-117-10-DqTzGkZK.png","assets/z-121-10-nqfofcpb.png","assets/z-123-BLYDC4ce.svg","assets/z-124-DsFnAsrR.png","assets/z-125-DQqBXr2T.png","assets/z-131-C8ClofJR.png","assets/z-133-10-WjathQkF.png","assets/z-136-10-C3MrP-Md.png","assets/z-138-10-Blavoj4D.png","assets/z-142-10-CN5BOmkP.png","assets/z-151-vJnFNdQa.png","assets/z-156-10-CLzzZeN2.png","assets/z-159-10-DsPjRqdJ.png","assets/z-162-10-BSJp3VDd.png","assets/z-201-50-CnYbUvH9.png","assets/z-201-53-BP5JEQU2.png","assets/z-206-DtwJLNr-.svg","assets/z-208-CIsjR5m0.svg","assets/z-209-30-BAaj-F2j.png","assets/z-209-U4ykB90T.png","assets/z-214-DXcJfyQ3.png","assets/z-215-DmaRO6sP.svg","assets/z-220-20-CF6Ie47V.png","assets/z-222-D4IoVYVE.png","assets/z-223_2-50-BPjAlpQ6.png","assets/z-229-B4vdo_Am.svg","assets/z-230-cainU4_s.png","assets/z-237-CYyt37w7.png","assets/z-238-crE-ZKIG.svg","assets/z-239-CMCVGhW0.svg","assets/z-240-D8JfmHAc.svg","assets/z-241-30-BFDjzrN_.svg","assets/z-242_1-DXFaNPkz.png","assets/z-242_2-DD-I0HIF.png","assets/z-244_1-CNyG5ILY.svg","assets/z-244_2-B9zMBaM4.png","assets/z-244_3-D5bcMD3g.png","assets/z-244_4-D0JpceSl.png","assets/z-245-Cvmztcj3.png","assets/z-250-DJIs4yI7.svg","assets/z-251-B1Ljnt5J.png","assets/z-253-Cs-sh0dL.png","assets/z-254-Dr76tWB-.png","assets/z-255-C1l1FJqV.png","assets/z-257-50-fU9Bvy7s.png","assets/z-259-B0DqmTIE.png","assets/z-260-8z_QK1vU.svg","assets/z-261-xQRpxi2Z.png","assets/z-262-RSxDGG4b.png","assets/z-263-DBTEX7OG.png","assets/z-264-CW5wAsLr.svg","assets/z-265-BKvTOn8x.png","assets/z-266-9pwocnBm.png","assets/z-268-CoNX6cWx.png","assets/z-269-Bb63pezp.png","assets/z-270_1-BHZV1Ua3.png","assets/z-270_2-BqldMWJk.png","assets/z-272-DfOpC04v.png","assets/z-273-4i0qMVh5.png","assets/z-274-CexCf60r.png","assets/z-274_1-BJybzr4X.svg","assets/z-274_2-mxltrzLU.png","assets/z-275-30-avId1NVX.png","assets/z-276-DWEAuLuR.png","assets/z-277-CrJSGlKZ.png","assets/z-277_1-CXN_-R0x.png","assets/z-278-Dwls_oFD.png","assets/z-279-30-CsbdCXoR.png","assets/z-280-DwDDMKmw.png","assets/z-281-CnOO9l9f.png","assets/z-281_1-DHdfQ4CG.png","assets/z-282-Du6dH0TZ.png","assets/z-283-Ca0_zSCf.svg","assets/z-286-Bge60mtZ.png","assets/z-290_1-CiZkhT4A.png","assets/z-290_2-DEOkYJM2.png","assets/z-294-BB32Tmgw.png","assets/z-295-CQNQve5Q.png","assets/z-296-DOb792OA.png","assets/z-297-hXI3tKrd.svg","assets/z-297_1-DBTeEImx.png","assets/z-298-BrgE6UBo.png","assets/z-299-CerOMyve.png","assets/z-307-B-LFy_AY.svg","assets/z-310-DJdeYQYP.svg","assets/z-311-pktr_iP_.svg","assets/z-314_1-F1sXiwp5.png","assets/z-315-gqhWTLx1.png","assets/z-316-CVGB5v2b.svg","assets/z-325_1-DjHO0-vW.svg","assets/z-325_2-5RwYFmbk.png","assets/z-327-BnwqSP7w.png","assets/z-330_2-DKlOmXoN.png","assets/z-331_1-Bq8ubnJO.png","assets/z-331_2-BdAAT3qy.png","assets/z-332-C3XqTzLX.png","assets/z-333-CRf99lmn.svg","assets/z-341-BtHjz02y.png","assets/z-350-BRGphaCj.png","assets/z-354-CkEfvgx4.png","assets/z-356-D5Ec7GRh.png","assets/z-363-CPH36nPR.png","assets/z-365-51-BigSszof.png","assets/z-365-52-ChTScD71.png","assets/z-365-53-Br8VjFSz.svg","assets/z-365-54-D6R7NLgs.png","assets/z-365-65-DnroOLDy.svg","assets/z-365-66-D8MT4Cj7.png","assets/z-380-D6NJ-avE.png","assets/z-381-BlN5cB-K.png","assets/z-385-AtKh-kuC.png","assets/z-386_3-BpaRLXej.png","assets/z-390-DbebO6ZQ.png","assets/z-391-Bg7XXOjS.png","assets/z-392-CaZqIZ-P.png","assets/z-405-C4JVnx-p.png","assets/z-406-C10xu_iO.png","assets/z-410-DmV0rez1.png","assets/z-415-g-hy0VJY.png","assets/z-419-BbLAGab4.svg","assets/z-430-CegoSsYD.png","assets/z-448-CILQThdd.png","assets/z-448_1-BiqSJEQd.png","assets/z-450-52-DgZfLgke.png","assets/z-454-10-n2t41Pnk.png","assets/z-455_1-sZvimas-.png","assets/z-460-s7e15DaF.png","assets/z-467_1-DVg4cuFY.png","assets/z-605-10-QYq-i4aG.png","assets/z-610-Di0CZcML.png","assets/z-616-CXWZ94lo.png","assets/z-620-40-DLrM-SKE.png","assets/z-720-Bgvl5JR3.png","assets/z-721-GxsB9ZCg.png"];
const SHELL = `mtp-shell-${VERSION}`;
const DATA = 'mtp-data';

const TYPES = { json: 'application/json; charset=utf-8', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
const isData = (rel) => rel === 'themen-manifest.json' || /^thema-\d{2}\.json$/.test(rel) || rel.startsWith('media/');

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES.map((f) => BASE + f))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mtp-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'claim') e.waitUntil(self.clients.claim());
});

let keyPromise = null;
function readKey() {
  return new Promise((resolve) => {
    const r = indexedDB.open('mtp-phone', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onerror = () => resolve(null);
    r.onsuccess = () => {
      const g = r.result.transaction('kv').objectStore('kv').get('k');
      g.onsuccess = () => resolve(g.result ?? null);
      g.onerror = () => resolve(null);
    };
  });
}
function getKey() {
  keyPromise ??= readKey().then((raw) => {
    if (!raw) {
      keyPromise = null; // not unlocked yet: ask again next time
      return null;
    }
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  });
  return keyPromise;
}

async function fromCacheFirst(cacheName, url) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(url);
  if (hit) return hit;
  const res = await fetch(url);
  if (res.ok) await cache.put(url, res.clone());
  return res;
}

async function fromNetworkFirst(cacheName, url) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      await cache.put(url, res.clone());
      return res;
    }
    return (await cache.match(url)) ?? res;
  } catch {
    const hit = await cache.match(url);
    if (hit) return hit;
    throw new Error('offline');
  }
}

async function serveData(rel) {
  try {
    const url = `${BASE}x/${rel}.bin`;
    const res = rel.startsWith('media/') ? await fromCacheFirst(DATA, url) : await fromNetworkFirst(DATA, url);
    if (!res.ok) return new Response('', { status: res.status });
    const key = await getKey();
    if (!key) return new Response('locked', { status: 401 });
    const buf = await res.arrayBuffer();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12));
    const type = TYPES[rel.split('.').pop()] ?? 'application/octet-stream';
    return new Response(plain, { headers: { 'content-type': type, 'cache-control': 'no-store' } });
  } catch {
    return new Response('', { status: 504 });
  }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== 'GET' || !url.pathname.startsWith(BASE)) return;
  const rel = decodeURIComponent(url.pathname.slice(BASE.length));
  if (isData(rel)) return e.respondWith(serveData(rel));
  // every page of the app is index.html (GitHub Pages has no rewrites); offline it comes from the cache
  if (e.request.mode === 'navigate') return e.respondWith(fromNetworkFirst(SHELL, `${BASE}index.html`));
  if (rel.startsWith('assets/')) return e.respondWith(fromCacheFirst(SHELL, url.href));
});
