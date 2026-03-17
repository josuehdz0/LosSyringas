import type * as ToneType from "tone";

// Shared analysers — keyed by stem id, populated by StemPlayer after audio starts
export const stemAnalysers: Record<string, ToneType.Analyser> = {};

// Mirror of StemPlayer's active set and muted state — updated by StemPlayer
let _activeStemIds: Set<string> = new Set(["magic"]);
let _isMuted = false;
let _isPlaying = true;

export function getActiveStemIds(): Set<string> { return _activeStemIds; }
export function setActiveStemIds(ids: Set<string>): void { _activeStemIds = new Set(ids); }

export function getIsMuted(): boolean { return _isMuted; }
export function setIsMuted(m: boolean): void { _isMuted = m; }

export function getIsPlaying(): boolean { return _isPlaying; }
export function setIsPlaying(p: boolean): void { _isPlaying = p; }
