"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Adapted from Animate UI Hexagon Background:
// https://github.com/imskyleen/animate-ui/tree/main/apps/www/registry/components/backgrounds/hexagon
type HexagonBackgroundProps = React.ComponentProps<"div"> & {
  hexagonProps?: React.ComponentProps<"div">;
  hexagonSize?: number;
  hexagonMargin?: number;
};

function HexagonBackground({
  className,
  children,
  hexagonProps,
  hexagonSize = 75,
  hexagonMargin = 3,
  ...props
}: HexagonBackgroundProps) {
  const hexagonWidth = hexagonSize;
  const hexagonHeight = hexagonSize * 1.1;
  const rowSpacing = hexagonSize * 0.8;
  const baseMarginTop = -36 - 0.275 * (hexagonSize - 100);
  const computedMarginTop = baseMarginTop + hexagonMargin;
  const oddRowMarginLeft = -(hexagonSize / 2);
  const evenRowMarginLeft = hexagonMargin / 2;

  const [gridDimensions, setGridDimensions] = React.useState({
    rows: 0,
    columns: 0,
  });

  const updateGridDimensions = React.useCallback(() => {
    const rows = Math.ceil(window.innerHeight / rowSpacing);
    const columns = Math.ceil(window.innerWidth / hexagonWidth) + 1;
    setGridDimensions({ rows, columns });
  }, [rowSpacing, hexagonWidth]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(updateGridDimensions);
    window.addEventListener("resize", updateGridDimensions);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateGridDimensions);
    };
  }, [updateGridDimensions]);

  return (
    <div
      data-slot="hexagon-background"
      className={cn(
        "relative size-full overflow-hidden bg-[color-mix(in_srgb,var(--color-background)_82%,var(--color-accent)_18%)]",
        className,
      )}
      {...props}
    >
      <style>{`:root { --hexagon-margin: ${hexagonMargin}px; }`}</style>
      <div className="absolute -left-0 top-0 size-full overflow-hidden">
        {Array.from({ length: gridDimensions.rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              marginTop: computedMarginTop,
              marginLeft:
                ((rowIndex + 1) % 2 === 0
                  ? evenRowMarginLeft
                  : oddRowMarginLeft) - 10,
            }}
            className="inline-flex"
          >
            {Array.from({ length: gridDimensions.columns }).map(
              (_, colIndex) => (
                <div
                  key={`hexagon-${rowIndex}-${colIndex}`}
                  {...hexagonProps}
                  style={{
                    width: hexagonWidth,
                    height: hexagonHeight,
                    marginLeft: hexagonMargin,
                    ...hexagonProps?.style,
                  }}
                  className={cn(
                    "relative",
                    "[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]",
                    "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] before:opacity-100 before:transition-all before:duration-1000 before:content-['']",
                    "after:absolute after:inset-[var(--hexagon-margin)] after:bg-[color-mix(in_srgb,var(--color-background)_92%,var(--color-surface)_8%)] after:content-['']",
                    "after:[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]",
                    "hover:before:bg-[color-mix(in_srgb,var(--color-accent)_48%,transparent)] hover:before:opacity-100 hover:before:duration-0 hover:after:bg-[color-mix(in_srgb,var(--color-background)_78%,var(--color-accent)_22%)] hover:after:duration-0",
                    hexagonProps?.className,
                  )}
                />
              ),
            )}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export { HexagonBackground, type HexagonBackgroundProps };
