#!/usr/bin/env python3
"""Geocode data/kos.json (lokakos PR #2, opsi B).

- Plus code di alamat -> decode Open Location Code (referensi Banda Aceh
  5.55, 95.32), accuracy "place". Matematika murni, tanpa API.
- Alamat jalan -> Nominatim (OpenStreetMap), 1 request/detik, User-Agent
  jelas, accuracy "street" (hasil alamat penuh) atau "area" (fallback nama
  area). Hasil di luar bbox Banda Aceh (5.40-5.70, 95.20-95.45) ditolak.
- Entri yang sudah punya lat/lon (mis. Cahaya kos putri dari gites.fr)
  tidak di-geocode ulang.
- Yang gagal/tidak punya alamat tetap lat/lon null (jujur, bukan karangan).
"""
import json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
DATA = BASE.parent.parent / "data" / "kos.json"
LOG = BASE / "geocode-log.json"

REF_LAT, REF_LON = 5.55, 95.32
BBOX = (5.40, 5.70, 95.20, 95.45)  # lat_min, lat_max, lon_min, lon_max

# ---------- Open Location Code (decode + recoverNearest) ----------
CODE_ALPHABET = "23456789CFGHJMPQRVWX"
SEPARATOR = "+"
PADDING = "0"
ENCODING_BASE = 20
PAIR_CODE_LEN = 10
GRID_COLS = 4
GRID_ROWS = 5
LAT_MAX = 90
LON_MAX = 180
GRID_LAT_FIRST = 0.000125
GRID_LON_FIRST = 0.000125


def _decode_pairs(code):
    """Decode the pair part (up to 10 chars). Returns (lat, lon, cell_lat, cell_lon)
    where lat/lon are the SW corner and cell_* the cell size."""
    lat = lon = 0.0
    lat_res = lon_res = 20.0  # first pair: 20-degree cells
    for i in range(0, len(code), 2):
        lat += CODE_ALPHABET.index(code[i]) * lat_res
        lon += CODE_ALPHABET.index(code[i + 1]) * lon_res
        lat_res /= ENCODING_BASE
        lon_res /= ENCODING_BASE
    # after the loop lat_res/lon_res are 1/20 of the cell size
    return lat - LAT_MAX, lon - LON_MAX, lat_res * ENCODING_BASE, lon_res * ENCODING_BASE


def decode_full(code):
    code = code.upper().replace(SEPARATOR, "")
    pair = code[:PAIR_CODE_LEN]
    lat, lon, cell_lat, cell_lon = _decode_pairs(pair)
    if len(code) > PAIR_CODE_LEN:
        grid_lat = grid_lon = 0.0
        lat_res = cell_lat / GRID_ROWS
        lon_res = cell_lon / GRID_COLS
        for ch in code[PAIR_CODE_LEN:]:
            d = CODE_ALPHABET.index(ch)
            grid_lat += (d // GRID_COLS) * lat_res
            grid_lon += (d % GRID_COLS) * lon_res
            lat_res /= GRID_ROWS
            lon_res /= GRID_COLS
        lat += grid_lat
        lon += grid_lon
        cell_lat, cell_lon = lat_res * GRID_ROWS, lon_res * GRID_COLS
    return (lat + cell_lat / 2, lon + cell_lon / 2, cell_lat, cell_lon)


def recover_nearest(short, ref_lat, ref_lon):
    short = short.upper()
    if short.startswith(SEPARATOR):
        return decode_full(short[1:])
    n_pad = PAIR_CODE_LEN - len(short.replace(SEPARATOR, ""))
    # prefix from reference: encode ref to full code then take first n_pad chars
    ref_full = encode(ref_lat, ref_lon, PAIR_CODE_LEN)
    prefix = ref_full[:n_pad]
    return decode_full(prefix + short)


def encode(lat, lon, length=PAIR_CODE_LEN):
    lat = min(max(lat + LAT_MAX, 0), LAT_MAX * 2 - 1e-9)
    lon = min(max(lon + LON_MAX, 0), LON_MAX * 2 - 1e-9)
    out = []
    lat_res = lon_res = 20.0
    for _ in range(length // 2):
        out.append(CODE_ALPHABET[int(lat // lat_res)])
        out.append(CODE_ALPHABET[int(lon // lon_res)])
        lat %= lat_res
        lon %= lon_res
        lat_res /= ENCODING_BASE
        lon_res /= ENCODING_BASE
    return "".join(out)


PLUS_RE = re.compile(r"\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b")

# ---------- Nominatim ----------
def nominatim(query, proxy=None):
    url = ("https://nominatim.openstreetmap.org/search?format=json&limit=1&q="
           + urllib.parse.quote(query))
    req = urllib.request.Request(url, headers={
        "User-Agent": "lokakos-dataset/1.0 (https://lokakos.pages.dev; dataset refresh)"})
    opener = urllib.request.build_opener()
    if proxy:
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({"https": proxy, "http": proxy}))
    try:
        with opener.open(req, timeout=20) as r:
            return json.loads(r.read())
    except Exception as e:
        print(f"  nominatim error for {query!r}: {e}", file=sys.stderr)
        return []


def in_bbox(lat, lon):
    return BBOX[0] <= lat <= BBOX[1] and BBOX[2] <= lon <= BBOX[3]


def main():
    doc = json.loads(DATA.read_text())
    kos = doc["kos"]
    proxy = None
    import socket
    s = socket.socket()
    try:
        s.settimeout(2)
        if s.connect_ex(("127.0.0.1", 18081)) == 0:
            proxy = "http://127.0.0.1:18081"
            print("forwarder proxy 127.0.0.1:18081 hidup, dipakai untuk Nominatim")
    finally:
        s.close()
    if not proxy:
        print("forwarder mati, Nominatim langsung (mungkin ditolak egress)")

    log = {"plus_code": [], "street": [], "area": [], "failed": []}
    for e in kos:
        if e.get("lat") is not None:
            continue
        addr = e.get("address") or ""
        area = e.get("area") or ""
        m = PLUS_RE.search(addr)
        if m:
            ok = False
            try:
                lat, lon, _, _ = recover_nearest(m.group(0), REF_LAT, REF_LON)
                if in_bbox(lat, lon):
                    e["lat"], e["lon"] = round(lat, 6), round(lon, 6)
                    e["coordinate_accuracy"] = "place"
                    e["plus_code"] = m.group(0)
                    log["plus_code"].append(e["id"])
                    ok = True
            except Exception as ex:
                print(f"  OLC gagal {e['id']}: {ex}", file=sys.stderr)
            if not ok:
                # kode dari sumber tidak resolve ke Banda Aceh -> jangan klaim
                e["plus_code"] = None
            else:
                continue
        # Nominatim: alamat jalan dulu
        done = False
        for q, acc in ((addr, "street"), (area + ", Banda Aceh, Aceh", "area")):
            if not q or len(q.strip()) < 4:
                continue
            res = nominatim(q + ", Banda Aceh, Aceh, Indonesia", proxy)
            time.sleep(1.1)
            if res:
                lat, lon = float(res[0]["lat"]), float(res[0]["lon"])
                if in_bbox(lat, lon):
                    e["lat"], e["lon"] = round(lat, 6), round(lon, 6)
                    e["coordinate_accuracy"] = acc
                    log[acc].append(e["id"])
                    done = True
                    break
        if not done:
            log["failed"].append(e["id"])

    DATA.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    LOG.write_text(json.dumps(log, indent=2) + "\n")
    n_geo = sum(1 for e in kos if e.get("lat") is not None)
    print(f"geocoded: {n_geo}/{len(kos)} "
          f"(plus_code={len(log['plus_code'])}, street={len(log['street'])}, "
          f"area={len(log['area'])}, failed={len(log['failed'])})")
    print("failed ids:", log["failed"])


if __name__ == "__main__":
    main()
