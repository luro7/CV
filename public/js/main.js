import { trackSections } from './modules/navigation.js';
import { initPreferences } from './modules/preferences.js';
import { initMotion } from './modules/motion.js';
import { initLab } from './modules/lab.js';
import './project-gallery.js?v=gallery-controls-20260925';

initPreferences();
trackSections();
initMotion();
initLab();
