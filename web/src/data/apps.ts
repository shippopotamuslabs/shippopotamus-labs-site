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
      "A workout tracker and training log built for people who lift on a program: build your plan, log every set, and watch the history stack up.",
    description: [
      "Stratum is a workout-logging app for Android. You build (or follow) a training program, check in for the day's session, and log every set as you go — weights, reps, and the gym you're training in.",
      "Everything is kept as a rich, queryable history, so progress is something you can look at, not something you have to remember.",
    ],
    features: [
      {
        title: "Programs, not just workouts",
        text: "Build structured training programs and reorder lifts as your plan evolves.",
      },
      {
        title: "Fast set-by-set logging",
        text: "Log sets as you train, with a daily check-in that starts the right session.",
      },
      {
        title: "Full history",
        text: "Every session is saved with its detail — browse by day, month, or year and edit past sessions when you mis-logged.",
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
      "Dictation that talks the way you meant to sound: speak naturally, and get clean text back — plain, or rewritten in a voice you pick.",
    description: [
      "Bloviate is a dictation app for Android. Transcription runs on your device, so your voice never has to leave your phone just to become text.",
      "When you want more than a transcript, cloud styles rewrite your dictation in the voice you choose — from crisp and professional to shamelessly theatrical.",
    ],
    features: [
      {
        title: "On-device transcription",
        text: "Speech-to-text runs locally on your phone. It is free, it is private, and it works without a connection.",
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
      "Bloviate is in active development and in private testing only — pre-launch. It is not on the Play Store yet.",
    linksNote: "Google Play listing arrives with the public launch.",
  },
  {
    slug: "enclave",
    name: "Enclave",
    kind: "Privacy-first AI assistant for Android",
    blurb:
      "An AI assistant that lives on your phone: on-device models up front, your own API keys for the heavy lifting, and encryption that keeps even us out.",
    description: [
      "Enclave is a privacy-first AI assistant for Android. Chat and image generation run on-device; when you want a bigger model, you bring your own API key and Enclave uses it for chat, images, video, and document creation.",
      "Sync is zero-knowledge: your data is encrypted with a vault password that is never saved in the app, so synced data is unreadable without it — including by the developer.",
    ],
    features: [
      {
        title: "On-device AI",
        text: "Chat and image generation run locally on your phone, no account and no server required.",
      },
      {
        title: "Bring your own key",
        text: "Plug in your own cloud API key for heavier work — chat, images, video, and documents — under your control and your bill.",
      },
      {
        title: "Zero-knowledge encryption",
        text: "Synced data is unreadable without your vault password, including by the developer. There is nothing to leak because there is nothing to read.",
      },
      {
        title: "Local speech-to-text",
        text: "Talk to it: transcription runs on the device, like everything else that can.",
      },
    ],
    statusLabel: "In development",
    status:
      "Enclave is in development. The plan: release it as a public repository anyone can build and install themselves, with alternative app stores a possibility after that. One deliberate choice: Enclave is not coming to Google Play — its AI policy and compliance burden is exactly what an app like this shouldn't have to carry.",
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
