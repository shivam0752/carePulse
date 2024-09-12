import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://50d6ac31fb4f3e4b74ef9fd886124ef9@o4507940003446784.ingest.de.sentry.io/4507940023763024",

  integrations: [
    Sentry.replayIntegration(),
  ],
  // Session Replay
  replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});