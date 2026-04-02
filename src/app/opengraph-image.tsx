import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 80,
          background: `linear-gradient(135deg, ${BRAND_COLORS.canvas} 0%, #f5f0e8 50%, #ede8e0 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: 28,
              background: BRAND_COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BRAND_COLORS.canvas,
              fontSize: 44,
              fontWeight: 700,
              fontFamily:
                'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            wp
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                fontSize: 64,
                fontWeight: 600,
                color: BRAND_COLORS.ink,
                fontFamily: "Georgia, ui-serif, serif",
                letterSpacing: -1,
              }}
            >
              Warmpath
            </span>
            <span
              style={{
                fontSize: 28,
                color: "#57534e",
                fontFamily:
                  'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Hire through warm intros
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
