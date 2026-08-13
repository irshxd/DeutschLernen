export class StorageService {
  static STORAGE_KEY = "deutsch_syllabus_progress";
  static FLASHCARDS_KEY = "deutsch_flashcards_progress";
  static THEME_KEY = "deutsch_theme_preference";
  static API_KEYS_KEY = "deutsch_api_keys";
  static LEGACY_KEY = "GEMINI_API_KEY";
  static USER_NAME_KEY = "USER_NAME";
  static USER_LEVEL_KEY = "CURRENT_LEVEL";

  static getUserProfile() {
    try {
      const name = localStorage.getItem(this.USER_NAME_KEY) || "";
      const level = localStorage.getItem(this.USER_LEVEL_KEY) || "A2";
      return { name, level };
    } catch (error) {
      console.error("StorageService.getUserProfile error:", error);
      return { name: "", level: "A2" };
    }
  }

  static saveUserProfile(name, level) {
    try {
      if (name) localStorage.setItem(this.USER_NAME_KEY, name.trim());
      if (level) localStorage.setItem(this.USER_LEVEL_KEY, level);
      window.dispatchEvent(new Event("user_profile_changed"));
      return true;
    } catch (error) {
      console.error("StorageService.saveUserProfile error:", error);
      return false;
    }
  }

  static async saveProgress(level, topicId, status) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const progress = await this.getProgress();
      if (!progress[level]) {
        progress[level] = {};
      }
      progress[level][topicId] = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error("StorageService.saveProgress error:", error);
      return false;
    }
  }

  static async getProgress() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 20));
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("StorageService.getProgress error:", error);
      return {};
    }
  }

  static async clearProgress() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("StorageService.clearProgress error:", error);
      return false;
    }
  }

  static async saveFlashcardStatus(wordId, status) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const progress = await this.getFlashcardsProgress();
      progress[wordId] = status;
      localStorage.setItem(this.FLASHCARDS_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error("StorageService.saveFlashcardStatus error:", error);
      return false;
    }
  }

  static async getFlashcardsProgress() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 20));
      const stored = localStorage.getItem(this.FLASHCARDS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("StorageService.getFlashcardsProgress error:", error);
      return {};
    }
  }

  static async clearFlashcardsProgress() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      localStorage.removeItem(this.FLASHCARDS_KEY);
      return true;
    } catch (error) {
      console.error("StorageService.clearFlashcardsProgress error:", error);
      return false;
    }
  }

  static getThemePreference() {
    try {
      const stored = localStorage.getItem(this.THEME_KEY);
      if (stored !== null) {
        return stored === "true";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (error) {
      console.error("StorageService.getThemePreference error:", error);
      return false;
    }
  }

  static saveThemePreference(isDark) {
    try {
      localStorage.setItem(this.THEME_KEY, String(isDark));
      return true;
    } catch (error) {
      console.error("StorageService.saveThemePreference error:", error);
      return false;
    }
  }

  static getApiKeys() {
    try {
      const stored = localStorage.getItem(this.API_KEYS_KEY);
      const keys = stored ? JSON.parse(stored) : [];
      if (keys.length === 0) {
        const legacyKey = localStorage.getItem(this.LEGACY_KEY);
        if (legacyKey) {
          const migratedKey = {
            id: 1,
            key: legacyKey,
            provider: "Gemini",
            active: true
          };
          localStorage.setItem(this.API_KEYS_KEY, JSON.stringify([migratedKey]));
          return [migratedKey];
        }
      }
      return keys;
    } catch (error) {
      console.error("StorageService.getApiKeys error:", error);
      return [];
    }
  }

  static saveApiKey(keyObj) {
    try {
      const keys = this.getApiKeys();
      const newId = keyObj.id || Date.now();
      const hasActive = keys.some(k => k.active);
      const active = keyObj.active !== undefined ? keyObj.active : !hasActive;
      const newKey = {
        id: newId,
        key: keyObj.key,
        provider: keyObj.provider || "Gemini",
        active: active
      };
      keys.push(newKey);
      localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(keys));
      if (active) {
        localStorage.setItem(this.LEGACY_KEY, keyObj.key);
      }
      return true;
    } catch (error) {
      console.error("StorageService.saveApiKey error:", error);
      return false;
    }
  }

  static deleteApiKey(id) {
    try {
      let keys = this.getApiKeys();
      const deletedKey = keys.find(k => k.id === id);
      keys = keys.filter(k => k.id !== id);
      if (deletedKey && deletedKey.active && keys.length > 0) {
        keys[0].active = true;
        localStorage.setItem(this.LEGACY_KEY, keys[0].key);
      } else if (keys.length === 0) {
        localStorage.removeItem(this.LEGACY_KEY);
      }
      localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(keys));
      return true;
    } catch (error) {
      console.error("StorageService.deleteApiKey error:", error);
      return false;
    }
  }

  static setActiveKey(id) {
    try {
      const keys = this.getApiKeys();
      keys.forEach(k => {
        k.active = (k.id === id);
        if (k.active) {
          localStorage.setItem(this.LEGACY_KEY, k.key);
        }
      });
      localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(keys));
      return true;
    } catch (error) {
      console.error("StorageService.setActiveKey error:", error);
      return false;
    }
  }

  static getActiveApiKey() {
    try {
      const keys = this.getApiKeys();
      const activeKey = keys.find(k => k.active);
      return activeKey ? activeKey.key : "";
    } catch (error) {
      console.error("StorageService.getActiveApiKey error:", error);
      return "";
    }
  }
}
