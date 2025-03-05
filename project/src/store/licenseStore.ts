import { nanoid } from 'nanoid';
import { create } from 'zustand';

interface License {
  key: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  usedBy?: string;
}

interface LicenseState {
  licenseKeys: License[];
  generateLicenseKey: (expiresInDays: number) => string;
  activateLicense: (key: string, agentId: string) => Promise<boolean>;
  deactivateLicense: (key: string) => void;
  isLicenseValid: (key: string) => boolean;
  cleanupExpiredLicenses: () => void;
  getLicenseExpiry: (key: string) => number | null;
  licenseKey: string;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  licenseKeys: [],
  licenseKey: '',

  generateLicenseKey: (expiresInDays) => {
    // 生成16位的随机密钥
    const key = nanoid(16);
    const now = Date.now();

    const newLicense: License = {
      key,
      createdAt: now,
      expiresAt: now + (expiresInDays * 24 * 60 * 60 * 1000),
      isActive: true
    };

    set(state => ({
      licenseKeys: [...state.licenseKeys, newLicense]
    }));

    return key;
  },

  activateLicense: async (key, agentId) => {
    const license = get().licenseKeys.find(l => l.key === key);

    if (!license) {
      return false;
    }

    // 检查密钥是否过期
    if (license.expiresAt < Date.now()) {
      return false;
    }

    // 检查密钥是否已被使用
    if (license.usedBy && license.usedBy !== agentId) {
      return false;
    }

    // 激活密钥
    set(state => ({
      licenseKeys: state.licenseKeys.map(l =>
        l.key === key
          ? { ...l, usedBy: agentId }
          : l
      ),
      licenseKey: key
    }));

    return true;
  },

  deactivateLicense: (key) => {
    set(state => ({
      licenseKeys: state.licenseKeys.filter(l => l.key !== key)
    }));
  },

  isLicenseValid: (key) => {
    const license = get().licenseKeys.find(l => l.key === key);
    if (!license) {
      return false;
    }

    return license.isActive && license.expiresAt > Date.now();
  },

  cleanupExpiredLicenses: () => {
    const now = Date.now();
    set(state => ({
      licenseKeys: state.licenseKeys.filter(license =>
        license.expiresAt > now || license.usedBy
      )
    }));
  },

  getLicenseExpiry: (key) => {
    const license = get().licenseKeys.find(l => l.key === key);
    return license ? license.expiresAt : null;
  },
}));
