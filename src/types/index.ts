import type { DefaultSession } from "next-auth";

// =============================================================================
// Extend NextAuth types
// =============================================================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isActive?: boolean;
  }
}

// =============================================================================
// Application Types
// =============================================================================

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type BreadcrumbItem = {
  title: string;
  href?: string;
};
