import { trackSections } from './modules/navigation.js';
import { initPreferences } from './modules/preferences.js';
import { initMotion } from './modules/motion.js';
import { initLab } from './modules/lab.js';
import { initCareerTimeline } from './modules/career-timeline.js?v=career-progression-20260928';
import { initCapabilityConstellation } from './modules/capability-map.js?v=capability-interaction-20260928';
import { initCapabilityRoleDetails } from './modules/capability-role-details.js?v=capability-role-detail-20260928b';
import { initProjectShowcase } from './modules/project-showcase.js?v=project-showcase-20260928';
import './project-gallery.js?v=gallery-cursor-no-zoom-20260925';

initPreferences();
trackSections();
initCareerTimeline();
initMotion();
initLab();
initCapabilityConstellation();
initCapabilityRoleDetails();
initProjectShowcase();
