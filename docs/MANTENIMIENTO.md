# Mantenimiento

El contenido se edita en `Content/site.json`: LinkedIn, introducción, especialidades, cargos, formación y certificaciones. Conservar JSON válido, comillas dobles y las propiedades de cada entrada.

Los encabezados y textos de interfaz están en `src/templates/`. Los colores, medidas, versión móvil e impresión están en `public/css/main.css`. No se cargan tipografías externas ni rastreadores. La navegación activa usa JavaScript modular como mejora progresiva. Los enlaces y desplegables nativos funcionan sin él.

Después de editar, ejecutar `exec/Generar-Web.cmd` y `node scripts/check.mjs`. Refrescar la vista local. Publicar exclusivamente el contenido de `dist/`.

El generador copia los recursos y reemplaza index.html sin eliminar archivos. Si se retira o renombra un recurso de public, retirar también su copia obsoleta de dist antes de publicar.

La fecha final de un trabajo actual y el estado académico requieren revisión cuando cambien. Los años de experiencia conservan la formulación del CV original. No se publican el email, el teléfono, el PDF original ni información privada de la cuenta de LinkedIn.

## Vista previa social
El head declara og:type=website, og:url y og:image absoluto a /linkedin-preview.png, junto a dimensiones 1200x630 y Twitter summary_large_image.
La imagen se mantiene en public/linkedin-preview.png; puede regenerarse con scripts/create-preview.ps1 (PowerShell y System.Drawing en Windows). El build la copia a dist. No reemplazar por una insignia de certificación.

## Google Search Console
El archivo public/google6cc6f994cc0e992b.html proviene de la carpeta propiedad google console search. Se publica en la raíz del sitio y debe conservarse en todos los despliegues para mantener la verificación de propiedad.


Iconos: scripts/create-favicon.ps1 genera favicon.ico y PNG de 48, 180 y 192 px. Se conservan en public y el head declara los formatos compatibles.

