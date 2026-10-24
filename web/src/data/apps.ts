import type { AppSlug } from "../lib/api";

export interface AppInfo {
  slug: AppSlug;
  name: string;
  kind: string; // one-line "what it is"
  blurb: string; // home-page paragraph
  description: string[]; // app-page paragraphs
  features: { title: string; text: string }[];
  statusLabel: string;
  status: string;
  linksNote: string; // Links area text — must reflect reality, no dead links
  screenshots?: { src: string; alt: string; caption: string }[];
}

export const APPS: AppInfo[] = [
  {
    slug: "stratum",
    name: "Stratum",
    kind: "Workout tracker for Android",
    blurb:
      "A workout tracker that recommends every set: the weight and the reps, computed from your past sessions and adjusted mid-workout as your performance changes.",
    description: [
      "Stratum is a workout tracker for Android built around a recommendation engine. It tells you the weight and the reps for every set, computed from your past performance, and it adjusts mid-workout: log a set and the recommendation for the next one moves with what you just did.",
      "It also generates whole programs around your training days and the equipment your gym has, runs the progression for you, and opens a coaching check-in every 20 workouts that recommends program changes from your recovery answers and your numbers.",
    ],
    features: [
      {
        title: "Recommends every set",
        text: "Weight and reps for each set, computed from your past performance. Log a set and later recommendations in the same session adjust to what you just did, with fatigue decay tracked across the workout.",
      },
      {
        title: "Progression that runs itself",
        text: "Double progression and linear progression raise the weight automatically when your performance earns the increase.",
      },
      {
        title: "Programs, generated for you",
        text: "The program generator builds your program with Google OR-Tools, a constraint solver, around your training days and the equipment at your gym.",
      },
      {
        title: "Coaching check-ins every 20 workouts",
        text: "A check-in banner lands on the Programs screen after every 20 completed workouts. You rate your recovery and flag problem muscles. Stratum turns your answers plus your trends, lift tenure, and volume landmarks into recommended changes: swap a stale lift (you pick the replacement), add a set, or cut sets. You accept or reject each one.",
      },
      {
        title: "Insights fitted to every lift",
        text: "A fatigue curve and a progress trend computed from your session history for each lift. They drive the recommendations and the generated programs, and after a workout Stratum can propose shifting a lift's rep range when your measured fatigue says the last set is falling short.",
      },
      {
        title: "Dashboard metrics",
        text: "Muscle group performance and per-lift performance across a 13-week window: volume, estimated one-rep max, and trend for everything you train. The same history drives your recommendations.",
      },
      {
        title: "Structured programs",
        text: "Build structured training programs and reorder lifts as your plan evolves.",
      },
      {
        title: "Full history",
        text: "Every session is saved with its detail. Browse by day, month, or year and edit past sessions when you mis-logged.",
      },
      {
        title: "Gyms and equipment",
        text: "Keep profiles for the gyms you train in and the equipment each one actually has.",
      },
    ],
    statusLabel: "In active development",
    status:
      "Stratum is in active development and currently in internal testing with a small group of testers. The public launch on Google Play has not happened yet.",
    linksNote: "Google Play listing arrives with the public launch.",
    screenshots: [
      {
        src: "/screenshots/stratum/workout.png",
        alt: "Logging a workout in Stratum",
        caption: "Logging a workout",
      },
      {
        src: "/screenshots/stratum/programs.png",
        alt: "Stratum program screen",
        caption: "Program",
      },
      {
        src: "/screenshots/stratum/history.png",
        alt: "Stratum history calendar",
        caption: "History",
      },
    ],
  },
  {
    slug: "bloviate",
    name: "Bloviate",
    kind: "Dictation, styled, for Android",
    blurb:
      "Dictation that talks the way you meant to sound: speak naturally, and get clean text back, plain or rewritten in a voice you pick.",
    description: [
      "Bloviate is a dictation app for Android. Transcription runs on your device, so your voice never has to leave your phone just to become text.",
      "When you want more than a transcript, cloud styles rewrite your dictation in the voice you choose, from crisp and professional to Cicero.",
    ],
    features: [
      {
        title: "On-device transcription",
        text: "Speech-to-text runs locally on your phone, free and private, and it works without a connection.",
      },
      {
        title: "Cloud styles",
        text: "Optional cloud styles rewrite your dictation in the voice you pick, from businesslike to baroque.",
      },
      {
        title: "Dictate over any app",
        text: "A floating dictation bubble lets you speak your text wherever you are typing.",
      },
    ],
    statusLabel: "In active development",
    status:
      "Bloviate is in active development and in private testing only, pre-launch. It is not on the Play Store yet.",
    linksNote: "Google Play listing arrives with the public launch.",
    screenshots: [
      {
        src: "/screenshots/bloviate/styles.png",
        alt: "Bloviate style picker, from Polish to the philosophers",
        caption: "Styles",
      },
      {
        src: "/screenshots/bloviate/setup.png",
        alt: "Bloviate setup: bubble look and on-device voice models",
        caption: "Setup",
      },
    ],
  },
  {
    slug: "enclave",
    name: "Enclave",
    kind: "Privacy-first AI assistant for Android",
    blurb:
      "An AI assistant that lives on your phone: on-device models up front, your own API keys for the heavy lifting, and encryption that keeps even us out.",
    description: [
      "Enclave is a privacy-first AI assistant for Android. Chat and image generation run on-device; when you want a bigger model, you bring your own API key and Enclave uses it for chat, images, video, and document creation.",
      "Sync is zero-knowledge: your data is encrypted with a vault password that is never saved in the app, so synced data stays unreadable without it, including to the developer.",
    ],
    features: [
      {
        title: "On-device AI",
        text: "Chat and image generation run locally on your phone, no account and no server required.",
      },
      {
        title: "Bring your own key",
        text: "Plug in your own cloud API key for heavier work (chat, images, video, and documents), under your control and on your bill.",
      },
      {
        title: "Zero-knowledge encryption",
        text: "Synced data is unreadable without your vault password, including by the developer. Sync stores ciphertext only, and the password itself is never saved.",
      },
      {
        title: "Local speech-to-text",
        text: "Talk to it: transcription runs on the device, like everything else that can.",
      },
    ],
    statusLabel: "In development",
    status:
      "Enclave is in development. The plan: release it as a public repository anyone can build and install themselves, with alternative app stores a possibility after that. One deliberate choice: Enclave is not coming to Google Play. Its AI policy and compliance burden is exactly what an app like this shouldn't have to carry.",
    linksNote:
      "The repository link will live here when the code goes public. Enclave is deliberately not coming to Google Play.",
    screenshots: [
      {
        src: "/screenshots/enclave/home.png",
        alt: "Enclave home screen with chats, Studio, and Gallery",
        caption: "Home",
      },
      {
        src: "/screenshots/enclave/chat.png",
        alt: "Chatting with a model inside Enclave",
        caption: "Chat",
      },
      {
        src: "/screenshots/enclave/studio.png",
        alt: "Enclave Studio settings with visual style presets",
        caption: "Studio",
      },
      {
        src: "/screenshots/enclave/image.png",
        alt: "Image generation in Enclave: a hippopotamus rapidly shipping code",
        caption: "Image generation",
      },
    ],
  },
];

export function appBySlug(slug: string): AppInfo | undefined {
  return APPS.find((a) => a.slug === slug);
}

export const REDDIT_URL = "https://www.reddit.com/user/Ok_Wafer_273/";
export const SUPPORT_EMAIL = "support@shippopotamuslabs.com";
