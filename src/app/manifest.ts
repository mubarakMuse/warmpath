import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Warmpath",
    short_name: "Warmpath",
    description: "Hire through warm intros—one link per role, structured submissions.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#c2410c",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
