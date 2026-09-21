# Publicación en Cloudflare Pages

Proyecto solicitado: `lucasrosat`. URL objetivo: https://lucasrosat.pages.dev . Consultar `cloudflare.json` para el estado confirmado de la publicación.

## Actualizar con carga directa

1. Ejecutar `exec/Generar-Web.cmd` y `node scripts/check.mjs`.
2. En Cloudflare, abrir Workers & Pages y elegir exclusivamente `lucasrosat`.
3. Crear un despliegue de producción y subir el contenido de `dist/` mediante carga directa. `index.html` debe quedar en la raíz de la subida.
4. Esperar el estado de publicación correcto y comprobar la URL de producción.

Los proyectos de la landing de Marcos son independientes. No usar ninguno de ellos para publicar este CV.

El dominio pages.dev se incluye con Pages. Un dominio personalizado como lucasrosat.cv requiere tenerlo registrado y configurar su vinculación; no se compró ningún dominio.

Documentación oficial: https://developers.cloudflare.com/pages/get-started/direct-upload/

Solo se suben los archivos de dist. El PDF fuente, documentación, scripts y datos de mantenimiento no forman parte del sitio público.
