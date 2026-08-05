export const ceoMessage = {
  /**
   * Name/title from Company Profile 2026 Board of Directors (Mr. Iqbal Ahmed — CEO).
   * TODO: Confirm on-camera speaker matches this name; video file is still a layout placeholder.
   * TODO: Site leadership list still shows a different CEO title — reconcile with board when ready.
   */
  name: "Mr. Iqbal Ahmed",
  role: "CEO",
  company: "Synergy Computers (Pvt.) Ltd.",
  /**
   * CEO video file — must live in `public/videos/`.
   * To update: replace the .mp4 on disk (same filename) OR change the path below.
   * Example custom name: "/videos/my-ceo-recording.mp4"
   */
  videoSrc: "/videos/my-ceo-video.mp4",
  /** Thumbnail shown before play — optional poster in public/videos/ */
  posterSrc: "/videos/my-ceo-video-poster.jpg",
  quote:
    "For more than four decades, Synergy has stood beside Pakistan's leading enterprises — helping them secure, modernize, and run critical technology with confidence.",
  body: [
    "Our commitment remains unchanged: deliver reliable IT outcomes through deep expertise, strong vendor partnerships, and teams who understand the realities of enterprise operations.",
    // TODO: Replace placeholder video copy when the final CEO recording is approved.
    "This message is a placeholder video for layout review. Replace the video file when your CEO recording is ready.",
  ],
} as const;
