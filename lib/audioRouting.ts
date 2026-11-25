// iPhones/iPads mute Web Audio when the ringer (silent) switch is on. Routing
// the audio through an <audio> element (MediaStream "bridge") puts it in the
// media session instead, so it plays like a video would.
//
// Only do that on iOS: on desktop, Chrome treats that stream like a live call
// and keeps nudging its playback rate to manage buffering, which is heard as
// the tempo and pitch drifting up and down. Desktop has no silent switch, so
// it plays straight to the speakers.
export function needsSilentSwitchBridge(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports itself as a Mac; touch support gives it away.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return iOS || iPadOS;
}
