import fs from 'fs';
import path from 'path';
import { AppConfig, DEFAULT_CONFIG } from './types';

const CONFIG_PATH = path.resolve(process.cwd(), 'config.json');

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  /** Load config from disk, or create with defaults if missing */
  load(): AppConfig {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<AppConfig>;
        this.config = { ...DEFAULT_CONFIG, ...parsed };
      } else {
        this.config = { ...DEFAULT_CONFIG };
        this.writeToDisk();
      }
    } catch (err) {
      console.error('⚠ Failed to read config.json, using defaults:', err);
      this.config = { ...DEFAULT_CONFIG };
    }
    return this.config;
  }

  /** Get current config */
  get(): AppConfig {
    return { ...this.config };
  }

  /** Get config safe for sending to frontend (API key masked) */
  getSafe(): AppConfig & { apiKeySet: boolean } {
    const safe = { ...this.config };
    const hasKey = !!safe.apiKey && safe.apiKey.length > 0;
    return {
      ...safe,
      apiKey: hasKey ? '••••••••' + safe.apiKey.slice(-4) : '',
      apiKeySet: hasKey,
    };
  }

  /** Merge partial config and save */
  save(partial: Partial<AppConfig>): AppConfig {
    // Don't overwrite key with masked value
    if (partial.apiKey && partial.apiKey.startsWith('••••')) {
      delete partial.apiKey;
    }
    this.config = { ...this.config, ...partial };
    this.writeToDisk();
    return this.config;
  }

  private writeToDisk(): void {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (err) {
      console.error('⚠ Failed to write config.json:', err);
    }
  }
}

// Singleton
export const configManager = new ConfigManager();
