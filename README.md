# Lucas Rosat — CV profesional

Landing CV sin foto, en inglés y español, con LinkedIn como único enlace de contacto. Contenido tomado del CV y contrastado con LinkedIn, sin texto promocional. HTML y CSS estáticos, con JavaScript modular para sección activa, idioma y tema; el contenido y los desplegables funcionan también sin JavaScript.

## Abrir y generar

- `exec/Abrir-Web.cmd`: genera la página y abre http://localhost:5081/. Mantener la ventana abierta mientras se usa la vista local.
- `exec/Generar-Web.cmd`: genera `dist/`, la carpeta lista para publicar.
- Requiere Node.js 20 o superior solo para generar y previsualizar. Los accesos también detectan el Node incluido con Codex en esta PC.

## Organización

Se sigue la estructura del proyecto vecino `LandingViejo`:

```text
Content/site.json               Contenido editable del CV
src/render.mjs                 Renderizado y escape seguro de contenido
src/templates/layout.html      Documento HTML y metadatos
src/templates/sections/        Hero, perfil, experiencia, formación, contacto
src/templates/cards/           Experiencia, especialidades y formación
src/templates/shared/          Cabecera y pie
public/css/main.css            Estilos base
public/css/experience.css      Navegación, temas, controles y transiciones
Content/locales/es.json        Traducciones al español
public/assets/favicon.svg      Marca tipográfica LR
public/js/modules/             Navegación progresiva por secciones
public/_headers                Cabeceras de seguridad de Cloudflare Pages
public/robots.txt              Indexación
scripts/                      Generación, servidor y comprobaciones
exec/                         Accesos para Windows
docs/                         Mantenimiento, fuentes y publicación
dist/                         Archivos generados para subir
Lucas_Rosat_CV_2026_Tools_Compact_v2.pdf  Referencia original, no publicada
```

No editar `dist/`: los cambios se realizan en contenido, plantillas o estilos y luego se regenera.

## Comprobaciones

```powershell
node scripts/build.mjs
node scripts/check.mjs
node --test tests/preferences.test.mjs
node scripts/serve.mjs
```

No hace falta `npm install`. Puerto local 5081 para poder usar simultáneamente la landing de Marcos en 5080.

Ver [mantenimiento](docs/MANTENIMIENTO.md), [fuentes](docs/FUENTES.md) y [publicación](docs/PUBLICACION.md).

Ver [criterios de interfaz](docs/UX.md) para navegación, idioma, tema y fuentes.
