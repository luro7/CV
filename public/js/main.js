import { trackSections } from './modules/navigation.js';
import { initPreferences } from './modules/preferences.js';
initPreferences();
trackSections();

import { initReadingMotion } from './modules/reading-motion.js';
initReadingMotion();
