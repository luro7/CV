# Interfaz y preferencias

- Navegación lateral fija en escritorio y cabecera sticky en pantallas compactas. Sección actual marcada con color y un indicador, enlaces de 44–48 px de altura y foco visible para teclado.
- Jerarquía: nombre, cargos, resumen principal, detalle; empresas y puestos por encima de fechas y etiquetas. Ancho de lectura acotado. No se agregaron mensajes comerciales.
- Botón LinkedIn azul con logo blanco descargado del paquete oficial: https://content.linkedin.com/content/dam/me/business/en-us/amp/xbu/linkedin-revised-brand-guidelines/logos/in-logo.zip . Página fuente: https://brand.linkedin.com/downloads . LinkedIn sigue siendo el único contacto.
- Inglés inicial, español mediante un botón sin cambio de URL. Traducciones en Content/locales/es.json; nombres propios y tecnologías conservan su denominación. Idioma recordado en cv-language.
- Borrado y escritura simultáneos de texto en 620 ms; bloqueo de pulsaciones repetidas mientras termina. Estados de lectura accesible y anuncio de finalización. Con movimiento reducido, cambio inmediato.
- Tema según preferencia guardada o sistema; controles reversibles con sol/luna y transición de amanecer/atardecer. Guardado en cv-theme, con tolerancia a almacenamiento bloqueado.
- Mejora progresiva: sin JavaScript, CV en inglés y navegación/desplegables nativos; preferencias no se muestran para evitar botones sin función.

Referencias: tamaño de objetivos WCAG 2.5.8 (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) y movimiento reducido (https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html).

Comprobación: node scripts/check.mjs y node --test tests/preferences.test.mjs. Las pruebas de preferencias usan un adaptador DOM y no sustituyen una auditoría visual completa de navegador.

Experiencia: libro progresivo controlado por scroll del documento, con páginas de contenido desplazable si exceden la pantalla, flechas, teclado izquierda/derecha y gestos horizontales. No intercepta wheel ni impide salir de la sección. Sin JavaScript conserva los desplegables; impresión muestra todos los puestos; movimiento reducido elimina transiciones. Volver arriba queda fijo. Se quitaron los puestos de la barra lateral, la línea temática y el resumen inicial duplicado de la portada.




StPageFlip 2.0.7 (MIT) local: hojas suaves desde la esquina inferior. CSS externo compatible con CSP. Cada gesto vertical se limita a una hoja, incluyendo inercia del trackpad; pausa de 180 ms o cambio de direcci�n inicia otro gesto. La lectura completa precede al giro y los extremos permiten salir de la secci�n.
`nLibro retirado: experiencias siempre abiertas en flujo vertical. Entradas decorativas de 480 ms una sola vez y progreso de lectura. Scroll nativo sin captura de gestos. Movimiento reducido cancela animaciones. Sin librerías externas.
