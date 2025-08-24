import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BookIcon } from "lucide-react";
import SoneIcon from "@/components/sone-logo";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <SoneIcon />
          Sone
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        icon: <BookIcon />,
        text: "Documentation",
        url: "/docs",
        secondary: false,
      },
    ],
  };
}
