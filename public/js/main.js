import { trackSections } from './modules/navigation.js';
import { initPreferences } from './modules/preferences.js';
import { initMotion } from './modules/motion.js';
import { initLab } from './modules/lab.js';
import { initCareerTimeline } from './modules/career-timeline.js?v=career-progression-20260928';
import { initCapabilityConstellation } from './modules/capability-map.js?v=capability-interaction-20260928';
import { initCapabilityRoleDetails } from './modules/capability-role-details.js?v=capability-role-detail-20260928b';
import { initProjectShowcase } from './modules/project-showcase.js?v=project-showcase-layout-fix-20260928';
import { initCredentials } from './modules/credentials.js?v=credentials-static-badges-20260929';
import { initCredentialImages } from './modules/credential-images.js?v=credential-registry-v2-20260929';
import { initCredentialDescriptions } from './modules/credential-descriptions.js?v=credential-local-badges-20260929c';
import { initProjectGallery } from './project-gallery.js?v=gallery-redesign-20260929';

initPreferences();
trackSections();
initCareerTimeline();
initMotion();
initLab();
initCapabilityConstellation();
initCapabilityRoleDetails();
initProjectShowcase();
initCredentials();
initCredentialImages();
initCredentialDescriptions();

initProjectGallery();

const locationPreview = document.querySelector('.location-preview');
const locationWindow = locationPreview?.querySelector('.location-window');
const positionLocation = () => {
  if (!locationPreview?.open || !locationWindow) return;
  const anchor = locationPreview.querySelector('summary').getBoundingClientRect();
  const panel = locationWindow.getBoundingClientRect();
  const left = window.innerWidth > 800 ? anchor.right + 12 : 16;
  const top = window.innerWidth > 800 ? anchor.top : anchor.bottom + 8;
  locationWindow.style.left = Math.max(16, Math.min(left, window.innerWidth - panel.width - 16)) + 'px';
  locationWindow.style.top = Math.max(16, Math.min(top, window.innerHeight - panel.height - 16)) + 'px';
};
if (locationWindow) {
  locationWindow.hidden = true;
  document.body.append(locationWindow);
  locationPreview.addEventListener('toggle', () => {
    locationWindow.hidden = !locationPreview.open;
    const map = locationWindow.querySelector('[data-map-src]');
    if (locationPreview.open && map && !map.hasAttribute('src')) map.src = map.dataset.mapSrc;
    positionLocation();
  });
  window.addEventListener('resize', positionLocation);
  window.addEventListener('scroll', positionLocation, { passive: true });
}
const closeLocation = () => {
  if (!locationPreview?.open) return;
  locationPreview.open = false;
  if (locationWindow) locationWindow.hidden = true;
  locationPreview.querySelector('summary').focus();
};
document.querySelector('[data-location-close]')?.addEventListener('click', closeLocation);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && locationPreview?.open) closeLocation();
});
