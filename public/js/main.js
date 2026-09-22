import { trackSections } from './modules/navigation.js';
import { initPreferences } from './modules/preferences.js';
import { initMotion } from './modules/motion.js';
import { initLab } from './modules/lab.js';

initPreferences();
trackSections();
initMotion();
initLab();
