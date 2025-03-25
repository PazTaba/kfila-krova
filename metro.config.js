// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// הוספת התמיכה במודולים עם סיומת mjs (חשוב ל־Firebase Firestore!)
config.resolver.sourceExts.push('mjs');

module.exports = config;
