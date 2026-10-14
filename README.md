# Loop Lab · Simulador

Copia para GitHub Pages del simulador de collares decorativos, llaveros y phone straps. Exportada el 14 de octubre de 2026.

Incluye las imágenes integradas, el logo, los colores de marca, la selección y movimiento de piezas, los precios, la validación de stock, el resumen y la imagen del pedido, y el enlace al chat de @looplab_pe.

## Publicar desde GitHub

1. Crea un repositorio llamado `looplab-simulador`. Para GitHub Pages con GitHub Free, el repositorio debe ser público.
2. Descomprime el ZIP. En el repositorio, elige **Add file → Upload files**. Sube el contenido de esta carpeta y la carpeta `assets`. No subas el ZIP. `index.html` debe quedar en la raíz, sin una carpeta contenedora adicional.
3. Guarda los archivos con **Commit changes**.
4. En **Settings → Pages**, selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)** y **Save**.
5. GitHub mostrará el enlace publicado. Prueba collar, llavero y phone strap, y el envío a IG desde una cuenta personal.

El archivo `.nojekyll` desactiva el procesamiento de Jekyll. Si tu explorador no lo sube, puedes crearlo vacío con **Add file → Create new file**.

## Inventario y pedidos

El stock es una copia en `catalog.json`; no se sincroniza automáticamente con el Excel ni reserva materiales. Los colores de paquetes surtidos comparten el stock y están sujetos a disponibilidad.

El enlace de IG está configurado para abrir el chat. La apertura dentro de ChatGPT aún no está confirmada. La imagen se guarda o comparte por separado.

Las imágenes son archivos integrados del proyecto: no dependen de los archivos temporales de ChatGPT. No requiere claves API, Node ni una compilación para publicarse.

Documentación: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
