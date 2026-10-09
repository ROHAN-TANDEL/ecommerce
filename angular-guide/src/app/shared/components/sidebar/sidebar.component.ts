import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

export interface SidebarDropdownOption {
  key?: string;
  name: string;
  display_name: string;
  path: string;
  component?: string;
  icon?: string;
  info_note?: string;
  order: number;
  active: boolean;
}

export interface SidebarItem {
  key: string;
  name: string;
  display_name: string;
  path: string;
  component?: string;
  icon?: string;
  active: boolean;
  pinned?: boolean;
  section: string;
  order: number;
  clickable: boolean;
  on_click: boolean;
  has_dropdown: boolean;
  dropdown_default_value?: string;
  dropdown_options?: Record<string, SidebarDropdownOption>;
  info_note?: string;
}

export interface SidebarSection {
  id: string;
  name: string;
  display_name: string;
  component?: string;
  order: number;
  pinned?: boolean;
  active: boolean;
  collapsible?: boolean;
}

export interface GroupedSection extends SidebarSection {
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Configuration state
  readonly apiUrl = 'http://localhost:3000/sidebar';
  apiStatus = signal<'connected' | 'offline' | 'loading'>('loading');
  displayName = signal<string>('Application Navigation');
  groupedSections = signal<GroupedSection[]>([]);

  // UI state
  collapsed = signal<boolean>(false);
  openDropdowns = signal<Set<string>>(new Set(['users'])); // default users dropdown open
  currentUrl = signal<string>('');

  // Fallback config when backend is offline
  private readonly fallbackConfig = {
    sidebar_key: 'app_main_sidebar_config',
    display_name: 'Application Navigation',
    sections: {
      section_1: {
        id: 'section_1',
        name: 'Section 1',
        display_name: 'Section 1',
        order: 1,
        pinned: true,
        active: true
      },
      section_2: {
        id: 'section_2',
        name: 'Section 2',
        display_name: 'Section 2',
        order: 2,
        pinned: true,
        active: true
      }
    },
    items: {
      users: {
        name: 'Users',
        display_name: 'Users',
        path: '/users',
        icon: 'users_icon',
        active: true,
        pinned: true,
        section: 'section_1',
        order: 1,
        clickable: true,
        on_click: true,
        has_dropdown: true,
        dropdown_default_value: 'all_users',
        info_note: 'User management & access control',
        dropdown_options: {
          all_users: {
            name: 'All Users',
            display_name: 'All Users',
            path: '/users',
            icon: 'users_list_icon',
            info_note: 'View all users in database',
            order: 1,
            active: true
          },
          active_users: {
            name: 'Active Users',
            display_name: 'Active Users',
            path: '/users?status=active',
            icon: 'user_check_icon',
            info_note: 'Filter active active records',
            order: 2,
            active: true
          },
          pending_users: {
            name: 'Pending Users',
            display_name: 'Pending Users',
            path: '/users?status=pending',
            icon: 'user_clock_icon',
            info_note: 'Pending approval queue',
            order: 3,
            active: true
          },
          roles_permissions: {
            name: 'Roles & Permissions',
            display_name: 'Roles & Permissions',
            path: '/users/roles',
            icon: 'shield_icon',
            info_note: 'Access security roles',
            order: 4,
            active: true
          }
        }
      },
      clients: {
        name: 'Clients',
        display_name: 'Clients',
        path: '/clients',
        icon: 'clients_icon',
        active: true,
        pinned: true,
        section: 'section_1',
        order: 2,
        clickable: true,
        on_click: true,
        has_dropdown: false,
        dropdown_options: {},
        info_note: 'Client accounts & tenant spaces'
      },
      partners: {
        name: 'Partners',
        display_name: 'Partners',
        path: '/partners',
        icon: 'partners_icon',
        active: true,
        pinned: true,
        section: 'section_2',
        order: 1,
        clickable: true,
        on_click: true,
        has_dropdown: false,
        dropdown_options: {},
        info_note: 'Affiliates, vendors, & partners'
      }
    }
  };

  ngOnInit(): void {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
      });

    this.fetchConfiguration();
  }

  fetchConfiguration(): void {
    this.apiStatus.set('loading');
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.applyConfig(data);
        this.apiStatus.set('connected');
      },
      error: () => {
        // Graceful fallback to offline mock configuration
        this.applyConfig(this.fallbackConfig);
        this.apiStatus.set('offline');
      }
    });
  }

  private applyConfig(config: any): void {
    if (!config || !config.sections || !config.items) {
      config = this.fallbackConfig;
    }

    if (config.display_name) {
      this.displayName.set(config.display_name);
    }

    const sectionsObj: Record<string, SidebarSection> = config.sections;
    const itemsObj: Record<string, any> = config.items;

    const sections: SidebarSection[] = Object.values(sectionsObj).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    const grouped: GroupedSection[] = sections.map((sec) => {
      const secItems: SidebarItem[] = Object.entries(itemsObj)
        .filter(([_, item]) => item.section === sec.id)
        .map(([key, item]) => ({
          key,
          ...item
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...sec,
        items: secItems
      };
    });

    this.groupedSections.set(grouped);
  }

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }

  toggleDropdown(itemKey: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.openDropdowns.update((set) => {
      const next = new Set(set);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  }

  isDropdownOpen(itemKey: string): boolean {
    return this.openDropdowns().has(itemKey);
  }

  onItemClick(item: SidebarItem): void {
    // Direct click works as requested!
    if (item.clickable || item.on_click) {
      this.navigate(item.path);
    }
  }

  onDropdownOptionClick(option: SidebarDropdownOption, event: Event): void {
    event.stopPropagation();
    this.navigate(option.path);
  }

  navigate(path: string): void {
    if (!path) return;
    // Map backend generic routes to angular app routes if needed
    const [routePath, queryString] = path.split('?');
    const queryParams: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    this.router.navigate([routePath], { queryParams });
  }

  isItemActive(itemPath: string): boolean {
    const active = this.currentUrl();
    const [basePath] = itemPath.split('?');
    if (basePath === '/users' && (active.includes('/emp') || active.includes('/users'))) return true;
    if (basePath === '/clients' && (active.includes('/customers') || active.includes('/clients'))) return true;
    if (basePath === '/partners' && (active.includes('/dashboard') || active.includes('/partners'))) return true;
    return active === itemPath || active === basePath;
  }

  isOptionActive(optionPath: string): boolean {
    return this.currentUrl() === optionPath;
  }

  getDropdownOptions(item: SidebarItem): SidebarDropdownOption[] {
    if (!item.dropdown_options) return [];
    return Object.entries(item.dropdown_options)
      .map(([key, opt]) => ({ key, ...opt }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}
