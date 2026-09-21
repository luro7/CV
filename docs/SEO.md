# SEO e indexación

- URL canónica y sitemap: https://lucasrosat.pages.dev/
- Sitemap público: /sitemap.xml. Incluye una URL porque el CV es una sola página; los anchors no son páginas independientes.
- robots.txt permite rastreo y anuncia el sitemap.
- ProfilePage/Person JSON-LD se genera desde Content/site.json: nombre, puestos, empresa actual, tecnologías y LinkedIn.
- Descripción con puestos y tecnologías presentes en el CV. Sin meta keywords ni contenido oculto para buscadores.
- 404.html evita servir el CV con estado 200 en rutas inventadas.
- El inglés es el HTML inicial indexable. El español cambia en el navegador bajo la misma URL; no constituye una segunda página indexable ni corresponde anunciar hreflang a la misma URL.
- Mantener public/google6cc6f994cc0e992b.html para Search Console.
- Revisar en Search Console las consultas por Lucas Rosat y combinaciones de nombre, puesto y tecnologías. El sitemap y la solicitud no garantizan indexación ni posiciones.
- Fuentes: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap y https://developers.google.com/search/docs/appearance/structured-data/profile-page

## Estado confirmado el 12 septiembre 2026
Search Console: La URL está en Google; la página está indexada. Página de perfil: 1 elemento válido. Sitemap reenviado el 12/09; Google todavía indica No se ha podido leer el sitemap. La comprobación pública devuelve HTTP 200, application/xml y XML válido con la URL canónica. No se solicitó otra indexación porque Google ya confirmó la página indexada.

