export type ModuleKey =
  | 'shop'
  | 'categories'
  | 'payment'
  | 'analytics'
  | 'notifications'
  | 'settings'
  | 'landing-settings';

export interface ModuleItem {
  key: ModuleKey;
  label: string;
  path: string; // path part after /dashboard/:role/
  group: "Shop" | "Collections" | "Payments" | "Analytics" | "Notifications" | "Settings";
  roles: string;
}

export const MODULES: ModuleItem[] = [
  { key: 'shop', label: 'Shop', path: '/', group: 'Shop', roles: 'manager' },
  { key: 'categories', label: 'Collections', path: '/collections', group: 'Collections', roles: 'manager' },
  { key: 'payment', label: 'Payments', path: '/payment', group: 'Payments', roles: 'manager' },
  { key: 'analytics', label: 'Analytics', path: '/analytics', group: 'Analytics', roles: 'manager' },
  { key: 'notifications', label: 'Notifications', path: '/notifications', group: 'Notifications', roles: 'manager' },
  { key: 'settings', label: 'Account & Theme Settings', path: '/settings', group: 'Settings', roles: 'manager' },
  { key: 'landing-settings', label: 'Landing Page Settings', path: '/landing-settings', group: 'Settings', roles: 'manager' },
];

export function modulesForRole(role: string) {
  const normRole = (role || "").toLowerCase();
  return MODULES.filter((m) => {
    // Store managers are strictly prohibited from viewing or accessing billing/payments
    if (normRole === "manager" && m.key === "payment") {
      return false;
    }
    return true;
  });
}

export function moduleHref(role: string, modulePath: string) {
  const cleanPath = modulePath.startsWith('/') ? modulePath : `/${modulePath}`;
  return `/dashboard/1${cleanPath === '/' ? '' : cleanPath}`;
}
