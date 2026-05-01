export const THEME_STORAGE_KEY = "charity-directory-theme";

export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export function normalizeThemePreference(
  value: string | null | undefined,
): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

