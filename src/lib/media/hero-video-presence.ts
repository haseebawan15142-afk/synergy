type Listener = (active: boolean) => void;

let heroVideoActive = false;
const listeners = new Set<Listener>();

/** True while a desktop hero video is mounted and intersecting the viewport. */
export function setHeroVideoActive(next: boolean) {
  if (heroVideoActive === next) return;
  heroVideoActive = next;

  if (typeof document !== "undefined") {
    if (next) {
      document.documentElement.dataset.heroVideo = "1";
    } else {
      delete document.documentElement.dataset.heroVideo;
    }
  }

  for (const listener of listeners) {
    listener(heroVideoActive);
  }
}

export function subscribeHeroVideoActive(listener: Listener) {
  listeners.add(listener);
  listener(heroVideoActive);
  return () => {
    listeners.delete(listener);
  };
}
