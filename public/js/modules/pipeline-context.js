export function initPipelineContext() {
  const root = document.documentElement;
  const experience = document.querySelector('#experience');
  const dock = document.querySelector('.pipeline-dock');
  if (!experience || !dock) return;

  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = experience.getBoundingClientRect();
    const activationLine = 110;
    const experienceActive = rect.top <= activationLine && rect.bottom > activationLine;

    root.classList.toggle('experience-context-active', experienceActive);

    if (experienceActive) {
      dock.style.opacity = '0';
      dock.style.transform = 'translateY(-12px)';
    } else {
      dock.style.removeProperty('opacity');
      dock.style.removeProperty('transform');
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  update();
}
