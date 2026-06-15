# VetiCalc

VetiCalc es una aplicación web estática para cálculos de dosis veterinarias, diseñada con un enfoque Mobile-First y lista para ser usada en clínicas.

## Características
- Cálculo automático de volumen a administrar (ml).
- Selección de especie (Canino, Felino, Exótico) con referencias rápidas de constantes fisiológicas.
- Validaciones de seguridad para volúmenes inusualmente altos.
- Interfaz moderna, limpia y profesional.

## Cómo desplegar en Render

Sigue estos pasos para tener VetiCalc vivo en internet en minutos:

1. **En GitHub:** Crea un repositorio nuevo y sube todos los archivos de este proyecto.
2. **En Render:** Ve a [dashboard.render.com](https://dashboard.render.com).
3. Haz clic en **"New +"** y selecciona **"Static Site"**.
4. Conecta tu cuenta de GitHub y elige el repositorio de VetiCalc.
5. Usa las siguientes configuraciones automáticas:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
6. Haz clic en **"Create Static Site"**.
7. ¡Listo! Render te dará una URL (ej: `veticalc.onrender.com`) y ya podrás usarla en tu clínica.

## Desarrollo Local

Si deseas correr o modificar el proyecto localmente:

1. Instala las dependencias: `npm install`
2. Inicia el servidor de desarrollo: `npm run dev`
