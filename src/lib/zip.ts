/**
 * A minimal ZIP writer, storing files without compression.
 *
 * Written rather than installed for two reasons. The export is a handful of
 * CSVs that gzip would shrink and that every operating system opens either
 * way, so compression buys little; and a dependency added for one download
 * button is a dependency to audit, update and explain for as long as the
 * product exists.
 *
 * Store-only archives (method 0) are read by Windows Explorer, macOS Archive
 * Utility, Files on Android, and every unzip tool, because method 0 has been
 * in the format since 1989. The one thing that must be right is the CRC of
 * each entry; a wrong CRC produces an archive that opens and then reports
 * corruption, which is worse than one that fails immediately.
 *
 * Sizes here are 32-bit, so this is not for archives above 4GB. A data export
 * for a consultancy is measured in megabytes.
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** MS-DOS date and time, which is what the format stores. */
function dosStamp(d = new Date()) {
  const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
  const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
  return { time, date };
}

export type ZipEntry = { name: string; body: string };

export function zip(entries: ZipEntry[]): Buffer {
  const enc = new TextEncoder();
  const { time, date } = dosStamp();
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = enc.encode(entry.name);
    // A BOM so Excel on Windows opens UTF-8 CSV without mangling Nepali names.
    const data = enc.encode(entry.name.endsWith(".csv") ? `﻿${entry.body}` : entry.body);
    const crc = crc32(data);

    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);   // local file header
    local.writeUInt16LE(20, 4);           // version needed
    local.writeUInt16LE(0x0800, 6);       // bit 11: the name is UTF-8
    local.writeUInt16LE(0, 8);            // stored, no compression
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);           // no extra field
    Buffer.from(name).copy(local, 30);

    const dir = Buffer.alloc(46 + name.length);
    dir.writeUInt32LE(0x02014b50, 0);     // central directory header
    dir.writeUInt16LE(20, 4);             // version made by
    dir.writeUInt16LE(20, 6);             // version needed
    dir.writeUInt16LE(0x0800, 8);
    dir.writeUInt16LE(0, 10);
    dir.writeUInt16LE(time, 12);
    dir.writeUInt16LE(date, 14);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(data.length, 20);
    dir.writeUInt32LE(data.length, 24);
    dir.writeUInt16LE(name.length, 28);
    dir.writeUInt16LE(0, 30);             // extra
    dir.writeUInt16LE(0, 32);             // comment
    dir.writeUInt16LE(0, 34);             // disk number
    dir.writeUInt16LE(0, 36);             // internal attributes
    dir.writeUInt32LE(0, 38);             // external attributes
    dir.writeUInt32LE(offset, 42);        // where the local header is
    Buffer.from(name).copy(dir, 46);

    locals.push(local, Buffer.from(data));
    central.push(dir);
    offset += local.length + data.length;
  }

  const dirBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);       // end of central directory
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dirBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);               // no archive comment

  return Buffer.concat([...locals, dirBytes, end]);
}
