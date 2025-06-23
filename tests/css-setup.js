// Custom setup file for handling CSS modules
import { vi } from 'vitest';

// Mock CSS
class CSSStyleSheet {
  replace() {
    return Promise.resolve(this);
  }

  replaceSync() {}
}

// Add CSS constructable stylesheets API
global.CSSStyleSheet = CSSStyleSheet;

// Mock adoptedStyleSheets
Object.defineProperty(Document.prototype, 'adoptedStyleSheets', {
  configurable: true,
  get: () => [],
  set: () => {},
});

// Mock specific CSS modules that we know cause issues
vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}));
vi.mock('@/components/form/scss/form.scss', () => ({}));
vi.mock('vuetify/styles', () => ({}));

export default {};
