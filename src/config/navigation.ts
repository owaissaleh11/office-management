import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Building2,
  CalendarDays,
  Briefcase,
  FolderKanban,
  UserRound,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// Navigation Configuration
// =============================================================================

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Sidebar navigation groups.
 * Add new modules here — the sidebar will render them automatically.
 */
export const sidebarNavGroups: NavGroup[] = [
  {
    label: "عام",
    items: [
      {
        title: "لوحة التحكم",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "إدارة",
    items: [
      {
        title: "الأقسام (الخدمات)",
        href: "/categories",
        icon: Building2,
      },
      {
        title: "الخدمات",
        href: "/services",
        icon: Briefcase,
      },
      {
        title: "المعاملات",
        href: "/cases",
        icon: FolderKanban,
      },
      {
        title: "العملاء",
        href: "/clients",
        icon: UserRound,
      },
      {
        title: "الموظفون",
        href: "/users",
        icon: Users,
      },

      {
        title: "التقارير وسجل النشاطات",
        href: "/reports",
        icon: FileText,
      },
    ],
  },
  {
    label: "النظام",
    items: [
      {
        title: "الإعدادات",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

/**
 * Application metadata
 */
export const appConfig = {
  name: "نظام إدارة المكتب",
  shortName: "إدارة",
  description: "نظام متكامل لإدارة شؤون المكتب",
  version: "0.1.0",
} as const;
