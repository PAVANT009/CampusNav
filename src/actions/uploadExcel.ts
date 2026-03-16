"use server";

import * as XLSX from "xlsx";
import db from "@/lib/db";

type ExcelRow = Record<string, string | number | boolean | null>;

type TimetableEntry = {
  day: string;
  time: string;
  type: string | null;
  group: string | null;
  course: string | null;
  room: string | null;
  section: string | null;
  note: string | null;
  raw: string;
};

const DAY_NAMES = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

function normalizeHeader(value: unknown): string {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
}

function cleanCell(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  return String(value).trim();
}

function parseTimetableCell(rawValue: string): Omit<TimetableEntry, "day" | "time"> {
  const raw = rawValue.trim();
  if (!raw) {
    return { type: null, group: null, course: null, room: null, section: null, note: null, raw: "" };
  }

  const parts = raw
    .split("/")
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 0);

  const result: Omit<TimetableEntry, "day" | "time"> = {
    type: parts.length ? parts[0] : null,
    group: null,
    course: null,
    room: null,
    section: null,
    note: null,
    raw,
  };

  for (const part of parts.slice(1)) {
    let matchedAny = false;
    const re = /([GCRS]):\s*(.+?)(?=\s*[GCRS]:|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(part)) !== null) {
      matchedAny = true;
      const key = m[1].toUpperCase();
      const value = m[2].trim();
      if (key === "G") result.group = value;
      if (key === "C") result.course = value;
      if (key === "R") result.room = value;
      if (key === "S") result.section = value;
    }
    if (!matchedAny) {
      result.note = result.note ? `${result.note} / ${part}` : part;
    }
  }

  return result;
}

function parseTimeRange(label: string): { start: string; end: string } | null {
  const match = label.match(
    /^\s*(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*$/i
  );
  if (!match) return null;

  const [, h1, m1, h2, m2, mer] = match;
  const meridiem = mer.toUpperCase() as "AM" | "PM";
  const to24 = (h: string, m: string | undefined, md: "AM" | "PM") => {
    let hh = parseInt(h, 10) % 12;
    if (md === "PM") hh += 12;
    const mm = m ?? "00";
    return `${String(hh).padStart(2, "0")}:${mm}`;
  };

  return {
    start: to24(h1, m1, meridiem),
    end: to24(h2, m2, meridiem),
  };
}

export async function parseExcel(
  formData: FormData
): Promise<
  | { success: true; data: TimetableEntry[] }
  | { success: false; message: string }
> {
  try {
    const file = formData.get("file");

    if (!file || typeof file === "string" || !("arrayBuffer" in file)) {
      throw new Error("No file uploaded");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("No sheets found in Excel file");
    }
    const sheet = workbook.Sheets[firstSheetName];

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    const headerRowIndex = rawRows.findIndex((row) =>
      row.some((cell) => normalizeHeader(cell) === "timing")
    );

    if (headerRowIndex >= 0) {
      const headerRow = rawRows[headerRowIndex];
      const timeCol = headerRow.findIndex(
        (cell) => normalizeHeader(cell) === "timing"
      );

      const dayCols: Array<{ index: number; day: string }> = [];
      headerRow.forEach((cell, index) => {
        const normalized = normalizeHeader(cell);
        if (DAY_NAMES.has(normalized)) {
          dayCols.push({ index, day: normalized[0].toUpperCase() + normalized.slice(1) });
        }
      });

      const normalizedRows: ExcelRow[] = [];
      for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const timeValue = timeCol >= 0 ? cleanCell(row[timeCol]) : null;
        if (!timeValue) continue;

        const record: ExcelRow = { Timing: timeValue as string | number | boolean | null };
        for (const { index, day } of dayCols) {
          const value = cleanCell(row[index]);
          if (value != null) {
            record[day] = value;
          }
        }

        normalizedRows.push(record);
      }

      const entries: TimetableEntry[] = [];
      console.log(normalizedRows)
      for (const row of normalizedRows) {
        const time = row.Timing ? String(row.Timing) : "";
        if (!time) continue;
        for (const [key, value] of Object.entries(row)) {
          if (key === "Timing" || value == null) continue;
          const cell = String(value).trim();
          if (!cell) continue;
          const parsed = parseTimetableCell(cell);
          entries.push({
            day: key,
            time,
            ...parsed,
          });
        }
      }

      return { success: true, data: entries };
    }

    return {
      success: false,
      message: "Could not find a timetable header row (Timing, Monday, Tuesday, ...).",
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Excel parsing failed",
    };
  }
}

export async function saveTimetable(
  entries: TimetableEntry[],
  options?: { name?: string; userId?: string; sourceFile?: string }
): Promise<
  | { success: true; timetableId: string; inserted: number }
  | { success: false; message: string }
> {
  try {
    if (!entries.length) {
      return { success: false, message: "No timetable entries to save." };
    }

    const timetable = await db.timetable.create({
      data: {
        name: options?.name ?? null,
        sourceFile: options?.sourceFile ?? null,
        userId: options?.userId ?? null,
      },
      select: { id: true },
    });

    const data = entries.map((entry) => {
      const range = parseTimeRange(entry.time);
      return {
        timetableId: timetable.id,
        day: entry.day,
        time: entry.time,
        timeStart: range?.start ?? null,
        timeEnd: range?.end ?? null,
        type: entry.type ?? null,
        group: entry.group ?? null,
        course: entry.course ?? null,
        room: entry.room ?? null,
        section: entry.section ?? null,
        note: entry.note ?? null,
        raw: entry.raw ?? "",
      };
    });

    await db.timetableEntry.createMany({ data });

    return { success: true, timetableId: timetable.id, inserted: data.length };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save timetable.",
    };
  }
}
