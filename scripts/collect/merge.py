#!/usr/bin/env python3
"""Merge raw-batch-0N.json files into data/kos.json (lokakos PR #2, opsi B).

Rules (honest dataset):
- Dedupe by normalized name; explicit alias map for known same-kos variants.
- Second pass: same phone + same normalized address -> same kos.
- Scalar fields: later batch wins when non-null (fresher page wins for price).
- Facilities: union, order preserved. rooms_note: concat distinct notes.
- Address: prefer the longer / more specific one. Phone: keep first non-null;
  a different second phone is appended to rooms_note (never silently dropped).
- Nothing is fabricated: unknown fields stay null.
- Geocode preservation: kalau data/kos.json sudah berisi hasil geocode
  (scripts/collect/geocode.py), lat/lon/coordinate_accuracy/plus_code yang
  sudah ter-geocode DIPERTAHANKAN — merge ulang tidak boleh menghapus
  koordinat hasil geocode (raw batch kebanyakan lat=null).
"""
import json, re, sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE.parent.parent / "data" / "kos.json"

ALIASES = {
    "kost wati cewek": "kost wati",
    "kost putri muslimah diva ananda darussalam banda aceh":
        "kost putri muslimah diva ananda darussalam",
    "kost shifa residence banda": "kost shifa residence",
}

def norm_name(n: str) -> str:
    n = n.lower().strip()
    n = n.replace("\u201c", '"').replace("\u201d", '"')
    n = re.sub(r"\s+", " ", n)
    return ALIASES.get(n, n)

def norm_addr(a):
    if not a:
        return ""
    return re.sub(r"[^a-z0-9]", "", a.lower())

def norm_phone(p):
    if not p:
        return ""
    return re.sub(r"\D", "", p)

def merge_notes(a, b):
    parts = []
    for x in (a, b):
        if x:
            for p in x.split("; "):
                p = p.strip()
                if p and p not in parts:
                    parts.append(p)
    return "; ".join(parts) if parts else None

def merge_entry(base, new):
    """Merge `new` into `base` (newer data wins for scalars)."""
    for k, v in new.items():
        if k in ("name", "source_url"):
            continue
        if k == "facilities":
            seen = list(base.get("facilities") or [])
            for f in v or []:
                if f not in seen:
                    seen.append(f)
            base["facilities"] = seen
        elif k == "rooms_note":
            base["rooms_note"] = merge_notes(base.get("rooms_note"), v)
        elif k == "address":
            old, new_a = base.get("address") or "", v or ""
            if new_a and len(new_a) > len(old):
                base["address"] = new_a
        elif k == "phone":
            old, new_p = base.get("phone"), v
            if new_p and not old:
                base["phone"] = new_p
            elif new_p and old and norm_phone(new_p) != norm_phone(old):
                base["rooms_note"] = merge_notes(
                    base.get("rooms_note"), f"Kontak lain di sumber: {new_p}")
        elif k == "price_note":
            if v:
                base["price_note"] = v
                if "tahun" in v.lower():
                    base["price_period"] = "yearly"
        elif k in ("price_min", "price_max", "gender", "area", "photo_url",
                   "source", "source2", "plus_code", "lat", "lon",
                   "coordinate_accuracy"):
            if v is not None:
                base[k] = v
        elif k == "source":
            if v and base.get(k) != v:
                base["source2"] = base.get("source2") or base.get(k)
                base[k] = v
    return base

def main():
    batches = sorted(BASE.glob("raw-batch-*.json"))
    entries = {}
    order = []
    n_raw = 0
    for bf in batches:
        data = json.loads(bf.read_text())
        for u in data.get("updates", []):
            key = norm_name(u["name"])
            if key in entries:
                merge_entry(entries[key], u["fields"])
            else:
                print(f"WARN {bf.name}: update target not found: {u['name']}",
                      file=sys.stderr)
        for e in data.get("entries", []):
            n_raw += 1
            key = norm_name(e["name"])
            e = dict(e)
            e.setdefault("price_period", "monthly")
            e.setdefault("price_note", None)
            if key in entries:
                merge_entry(entries[key], e)
            else:
                entries[key] = e
                order.append(key)

    # second pass: same phone + same address -> same kos
    by_pa = {}
    dupes = []
    for key in list(entries):
        e = entries[key]
        pa = (norm_phone(e.get("phone")), norm_addr(e.get("address")))
        if pa[0] and pa[1]:
            if pa in by_pa:
                merge_entry(entries[by_pa[pa]], e)
                dupes.append((key, by_pa[pa]))
                del entries[key]
            else:
                by_pa[pa] = key

    final = []
    for i, key in enumerate(sorted(entries, key=lambda k: entries[k]["name"].lower())):
        e = entries[key]
        e["id"] = f"k{i+1:03d}"
        e["collected_at"] = "2026-11-19"
        e["status"] = "unknown"
        e.setdefault("lat", None)
        e.setdefault("lon", None)
        e.setdefault("coordinate_accuracy", None)
        final.append(e)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    # Pertahankan hasil geocode yang sudah ada (lihat docstring): entri yang
    # sudah punya coordinate_accuracy di kos.json lama keeps lat/lon/plus_code.
    if OUT.exists():
        try:
            old = {norm_name(k["name"]): k
                   for k in json.loads(OUT.read_text())["kos"]}
            for e in final:
                o = old.get(norm_name(e["name"]))
                if o and o.get("coordinate_accuracy"):
                    e["lat"] = o.get("lat")
                    e["lon"] = o.get("lon")
                    e["coordinate_accuracy"] = o.get("coordinate_accuracy")
                    e["plus_code"] = o.get("plus_code")
        except Exception as ex:
            print(f"WARN: gagal baca kos.json lama untuk preservasi geocode: {ex}",
                  file=sys.stderr)
    doc = {
        "meta": {
            "collected_at": "2026-11-19",
            "sources": ["mamikos.com", "carialamat.biz.id", "penginapan.net",
                        "kost1.com", "airpaz.com", "instagram.com"],
            "method": ("Dibaca halaman publik satu per satu lewat browser "
                       "(bukan scrape massal). Setiap kos tertelusur ke URL "
                       "sumber. Field yang tidak ada di sumber = null."),
            "note": ("Harga Mamikos = Rp/bulan dari kartu listing. Satu "
                     "pengecualian: Cempaka Kost Limpok harganya tahunan "
                     "(price_period=yearly). Nomor relay Mamikos "
                     "0856-4140-5202 tidak dipakai sebagai kontak pemilik. "
                     "Foto (6 kos) = hotlink URL gambar dari halaman detail "
                     "sumber, bukan download/re-host."),
        },
        "count": len(final),
        "kos": final,
    }
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n")

    from collections import Counter
    print(f"raw entries: {n_raw}")
    print(f"phone+address merges: {len(dupes)} {dupes}")
    print(f"final unique kos: {len(final)}")
    print("by source:", dict(Counter(e["source"] for e in final)))
    print("by gender:", dict(Counter(str(e["gender"]) for e in final)))
    print("with price:", sum(1 for e in final if e["price_min"]))
    print("with phone:", sum(1 for e in final if e["phone"]))
    print("with photo:", sum(1 for e in final if e["photo_url"]))
    print("with plus_code:", sum(1 for e in final if e.get("plus_code")))
    print("with address:", sum(1 for e in final if e["address"]))

if __name__ == "__main__":
    main()
