import { type Challenge } from "./types";

export const urlShorteningService: Challenge = {
  slug: "url-shortening-service",
  title: "URL Shortening Service",
  diffcutly: "Easy",
  description: `Design a URL shortening service like bit.ly, tinyurl.com, etc.`,
  // Requirements: `- The system should be able to generate a short URL for a given long URL.
  // - When a user accesses a short URL, the system should redirect the user to the original URL.
  // - Users should be able to specify a custom short URL.
  // - The system should provide analytics on the number of times a short URL is accessed.
  // - The system should be highly available and scalable.`,
  stages: [
    {
      objective:
        "Create a basic URL shortening service that can generate a short URL for a given long URL and retrieve the original URL using the short URL.",
    },
    {
      objective:
        "Improve the system's availability and scalability",
      problem: "The basic system can't handle high traffic efficiently, leading to slow responses and potential downtime.",
    },
  ],
};
