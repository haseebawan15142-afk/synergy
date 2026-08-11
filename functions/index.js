/**
 * Firebase Cloud Functions entrypoint.
 * Keep theme scheduling isolated in scheduleThemePresets.js.
 */

const { scheduleThemePresets } = require("./scheduleThemePresets");

exports.scheduleThemePresets = scheduleThemePresets;
