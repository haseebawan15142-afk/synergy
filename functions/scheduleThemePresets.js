/**
 * Daily theme preset scheduler (Asia/Karachi).
 * - Enter window → snapshot + activate preset
 * - Day after endDate → revert to isDefault
 * Logs each action to themeAutomationLogs.
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");

if (!getApps().length) initializeApp();

const COLLECTION_THEME = "theme";
const COLLECTION_PRESETS = "themePresets";
const COLLECTION_LOGS = "themeAutomationLogs";
const DOC_TOKENS = "tokens";
const DOC_PREVIOUS = "previousTokens";
const DOC_ACTIVE = "activePreset";
const PRESET_PREFIX = "preset_";
const RESERVED = new Set([
  DOC_TOKENS,
  DOC_PREVIOUS,
  DOC_ACTIVE,
  "originalBaseline",
]);

function mmddToOrdinal(mmdd) {
  const m = String(mmdd || "").trim().match(/^(\d{2})-(\d{2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return month * 100 + day;
}

function todayParts(timeZone) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    mmdd: `${parts.month}-${parts.day}`,
  };
}

function shiftMmdd(mmdd, deltaDays, year) {
  const ord = mmddToOrdinal(mmdd);
  if (ord == null) return null;
  const month = Math.floor(ord / 100);
  const day = ord % 100;
  const dt = new Date(Date.UTC(year, month - 1, day + deltaDays));
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function isInRange(mmdd, startDate, endDate) {
  const d = mmddToOrdinal(mmdd);
  const s = mmddToOrdinal(startDate);
  const e = mmddToOrdinal(endDate);
  if (d == null || s == null || e == null) return false;
  if (s <= e) return d >= s && d <= e;
  return d >= s || d <= e;
}

function pickTokens(data) {
  const src = data || {};
  return {
    primary: src.primary,
    secondary: src.secondary,
    accent: src.accent,
    text: src.text,
    textMuted: src.textMuted,
    buttonBg: src.buttonBg,
    buttonText: src.buttonText,
    background: src.background,
    surface: src.surface,
    border: src.border,
    borderRadius: src.borderRadius,
    shadow: src.shadow,
    fontFamily: src.fontFamily,
    fontSizeBase: src.fontSizeBase,
    containerWidth: src.containerWidth,
    spacing: src.spacing,
    animationsEnabled: src.animationsEnabled,
    darkModeDefault: src.darkModeDefault,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function writeLog(db, entry) {
  await db.collection(COLLECTION_LOGS).add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  });
}

async function activatePreset(db, preset, reason) {
  const tokensRef = db.collection(COLLECTION_THEME).doc(DOC_TOKENS);
  const previousRef = db.collection(COLLECTION_THEME).doc(DOC_PREVIOUS);
  const activeRef = db.collection(COLLECTION_THEME).doc(DOC_ACTIVE);

  const [currentSnap, activeSnap] = await Promise.all([tokensRef.get(), activeRef.get()]);
  const activeData = activeSnap.exists ? activeSnap.data() : {};

  if (currentSnap.exists) {
    await previousRef.set(
      {
        ...pickTokens(currentSnap.data()),
        previousActivePresetId: activeData.presetId || "",
        previousPresetName: activeData.name || "",
        previousPresetEmoji: activeData.emoji || "",
      },
      { merge: true },
    );
  }

  const presetId = preset.id;
  await tokensRef.set(
    { ...pickTokens(preset.tokens || {}), activePresetId: presetId },
    { merge: true },
  );
  const heroVideos = Array.isArray(preset.heroVideos)
    ? preset.heroVideos
        .map((v, i) => {
          const mp4 = String(v?.mp4 || "").trim();
          const poster = String(v?.poster || "").trim();
          const webm = String(v?.webm || "").trim();
          const label = String(v?.label || `Event clip ${i + 1}`).trim();
          const durationRaw = Number(v?.durationSec);
          const durationSec = Number.isFinite(durationRaw)
            ? Math.min(60, Math.max(1, Math.round(durationRaw)))
            : 3;
          const row = { mp4, label, durationSec };
          if (poster) row.poster = poster;
          if (webm) row.webm = webm;
          return row;
        })
        .filter((v) => Boolean(v.mp4))
        .slice(0, 3)
    : [];

  await activeRef.set(
    {
      presetId,
      eventKey: preset.eventKey || presetId,
      name: preset.name || "",
      emoji: preset.emoji || "",
      bannerMessage: preset.bannerMessage || "",
      bannerEnabled: Boolean(preset.bannerEnabled) && Boolean(preset.bannerMessage),
      heroVideos: preset.isDefault ? [] : heroVideos,
      activatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await writeLog(db, {
    action: "activate",
    reason,
    presetId,
    eventKey: preset.eventKey || presetId,
    name: preset.name || "",
  });
}

exports.scheduleThemePresets = onSchedule(
  {
    schedule: "every day 00:15",
    timeZone: "Asia/Karachi",
    region: "asia-south1",
  },
  async () => {
    const db = getFirestore();
    const { mmdd, year } = todayParts("Asia/Karachi");
    const yesterday = shiftMmdd(mmdd, -1, year);

    const presetsSnap = await db.collection(COLLECTION_PRESETS).get();
    let presets = presetsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (presets.length === 0) {
      const themeSnap = await db.collection(COLLECTION_THEME).get();
      presets = themeSnap.docs
        .filter((d) => {
          const data = d.data() || {};
          return (
            !RESERVED.has(d.id) &&
            (data.kind === "preset" || d.id.startsWith(PRESET_PREFIX)) &&
            data.tokens
          );
        })
        .map((d) => {
          const data = d.data() || {};
          const eventKey =
            data.eventKey ||
            (d.id.startsWith(PRESET_PREFIX) ? d.id.slice(PRESET_PREFIX.length) : d.id);
          return { id: eventKey, ...data, eventKey };
        });
    }

    const defaultPreset = presets.find((p) => p.isDefault) || null;
    const activeSnap = await db.collection(COLLECTION_THEME).doc(DOC_ACTIVE).get();
    const active = activeSnap.exists ? activeSnap.data() : null;
    const activePreset = active?.presetId
      ? presets.find((p) => p.id === active.presetId) || null
      : null;

    const dated = presets
      .filter((p) => !p.isDefault && p.startDate && p.endDate)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    const inWindow = dated.find((p) => isInRange(mmdd, p.startDate, p.endDate));

    if (inWindow) {
      if (active?.presetId === inWindow.id) {
        logger.info("Theme preset already active", { presetId: inWindow.id, mmdd });
        return;
      }
      await activatePreset(db, inWindow, "date-window");
      logger.info("Activated theme preset", { presetId: inWindow.id, mmdd });
      return;
    }

    if (
      activePreset &&
      !activePreset.isDefault &&
      activePreset.endDate &&
      yesterday &&
      activePreset.endDate === yesterday &&
      defaultPreset
    ) {
      await activatePreset(db, defaultPreset, "end-date-revert");
      logger.info("Reverted to default after event window", {
        endedPresetId: activePreset.id,
        mmdd,
      });
      return;
    }

    logger.info("No theme preset change", { mmdd, activePresetId: active?.presetId || null });
  },
);
