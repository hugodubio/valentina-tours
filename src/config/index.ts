import type { AppConfig } from './types';
import { valentina } from './valentina';
import { martina } from './martina';

const configs: Record<string, AppConfig> = { valentina, martina };

const USER_KEY = 'app_user';

const urlParam = new URLSearchParams(window.location.search).get('user');
if (urlParam && configs[urlParam]) {
  localStorage.setItem(USER_KEY, urlParam);
}

const key = localStorage.getItem(USER_KEY) ?? 'valentina';
export const config: AppConfig = configs[key] ?? valentina;
