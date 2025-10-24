import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Theme state
  private themeSignal = signal<'light' | 'dark'>('light');

  // Public computed properties
  readonly isDark = computed(() => this.themeSignal() === 'dark');
  readonly isLight = computed(() => this.themeSignal() === 'light');
  readonly currentTheme = computed(() => this.themeSignal());

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (!this.isBrowser) return;

    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      this.themeSignal.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(prefersDark ? 'dark' : 'light');
    }

    // Apply initial theme
    this.applyTheme();
  }

  toggleTheme(): void {
    const newTheme = this.isDark() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeSignal.set(theme);

    if (this.isBrowser) {
      // Save to localStorage
      localStorage.setItem('theme', theme);

      // Apply theme to document
      this.applyTheme();
    }
  }

  private applyTheme(): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    const isDark = this.isDark();

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
