const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add wasm to assetExts so Metro treats it as a binary asset, not source
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = [...assetExts, "wasm"];
config.resolver.sourceExts = sourceExts.filter((ext) => ext !== "wasm");

// Monorepo: watch root workspace
config.watchFolders = [path.resolve(__dirname, "../..")];

module.exports = config;
