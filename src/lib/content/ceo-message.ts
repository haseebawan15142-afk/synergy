export const ceoMessage = {
  /** Replace with the CEO's name when ready */
  name: "Chief Executive Officer",
  role: "Chief Executive Officer",
  company: "Synergy Computers (Pvt.) Ltd.",
  /**
   * CEO video file — must live in `public/videos/`.
   * To update: replace the .mp4 on disk (same filename) OR change the path below.
   * Example custom name: "/videos/my-ceo-recording.mp4"
   */
  videoSrc: "/videos/my-ceo-video.mp4",
  /** Thumbnail shown before play — optional poster in public/videos/ */
  posterSrc: "/videos/ceo-message-demo-poster.jpg",
  quote:
    "For more than four decades, Synergy has stood beside Pakistan's leading enterprises — helping them secure, modernize, and run critical technology with confidence.",
  body: [
    "Our commitment remains unchanged: deliver reliable IT outcomes through deep expertise, strong vendor partnerships, and teams who understand the realities of enterprise operations.",
    "This message is a placeholder video for layout review. Replace the video file and update the details above when your CEO recording is ready.",
  ],
} as const;
