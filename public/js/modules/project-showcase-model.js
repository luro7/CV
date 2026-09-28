export const projectCaseStudies = {
  'manos-a-la-obra': {
    en: {
      problem: 'Publish and maintain renovation content while keeping the operating stack at zero recurring cost.',
      solution: 'A public website backed by a private editor, review and publish workflow, plus persistent content and media management.'
    },
    es: {
      problem: 'Publicar y mantener contenido de refacciones manteniendo la operación sin costos recurrentes.',
      solution: 'Un sitio público con editor privado, flujo de revisión y publicación, y gestión persistente de contenido y archivos multimedia.'
    }
  },
  'my-flight': {
    en: {
      problem: 'Bring flight lookup, recent ADS-B traces, aircraft details and map context into one mobile flow.',
      solution: 'A native Android companion built with Jetpack Compose and MapLibre, with API credentials protected by Android Keystore.'
    },
    es: {
      problem: 'Reunir búsqueda de vuelos, trazas ADS-B recientes, datos de aeronaves y contexto de mapa en un único flujo móvil.',
      solution: 'Una app Android nativa con Jetpack Compose y MapLibre, con las credenciales de API protegidas mediante Android Keystore.'
    }
  },
  'display-conductor': {
    en: {
      problem: 'Make multi-monitor profiles, startup behavior and recovery easier to control from one Windows interface.',
      solution: 'A WinUI desktop app with display profiles, window grouping, startup rules, recovery tools and diagnostic reporting.'
    },
    es: {
      problem: 'Centralizar perfiles de múltiples monitores, comportamiento de inicio y recuperación en una sola interfaz de Windows.',
      solution: 'Una app de escritorio WinUI con perfiles de pantalla, agrupación de ventanas, reglas de inicio, herramientas de recuperación y diagnóstico.'
    }
  },
  'sound-mixer': {
    en: {
      problem: 'Control Windows application audio and individual browser tabs without treating the browser as a single session.',
      solution: 'A WinUI mixer using WASAPI plus a Chromium extension and Native Messaging for per-tab volume control.'
    },
    es: {
      problem: 'Controlar el audio de aplicaciones de Windows y pestañas individuales sin tratar al navegador como una única sesión.',
      solution: 'Un mixer WinUI con WASAPI, una extensión Chromium y Native Messaging para controlar el volumen por pestaña.'
    }
  }
};

export function getProjectCaseStudy(slug, language = 'en') {
  const entry = projectCaseStudies[slug];
  if (!entry) return null;
  return entry[language === 'es' ? 'es' : 'en'];
}
