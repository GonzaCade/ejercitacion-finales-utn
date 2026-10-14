# Ejercitación para finales UTN

Simulador web de los exámenes finales del **Seminario Universitario – UTN Haedo**
(Noción de Precálculo y Física). Genera exámenes aleatorios de 10 puntos con la misma
dificultad que los modelos y finales reales, corrige automáticamente y muestra la
solución paso a paso. Sin backend ni base de datos: todo corre en el navegador.

## Uso

Abrí `index.html` directamente en el navegador o servilo con cualquier servidor
estático (por ejemplo `python -m http.server 8080` dentro de `app/`).

Configuración disponible al comenzar:

- **Materia:** Precálculo + Física (5 + 5), solo Precálculo (10) o solo Física (10).
- **Tiempo:** sin tiempo, o 2 horas (como un final real) con dos modos:
  - *Óptimo:* 8 min por punto; al vencer pasa al siguiente y, al terminar los 10, se
    pueden completar los pendientes con el tiempo restante.
  - *Máximo:* 10 min por punto; cada punto se cierra al vencer o al entregarlo.
- **Ayudas:** muestra una pista inicial por ejercicio (Ruffini, SohCahToa, etc.).
- **Código de tema:** permite repetir exactamente el mismo examen.

Al entregar se muestra la nota (se aprueba con 70 %), el detalle por ítem, la solución
paso a paso con gráficos y un botón para **descargar el PDF**. El historial de intentos
y el examen en curso se guardan en `localStorage`.

## Estructura

```
app/
├── index.html          # única página (vistas: inicio, examen, resultados)
├── assets/logo.png
├── css/styles.css      # Tailwind v4 compilado y minificado
├── src/input.css       # fuente de Tailwind (paleta #00455C / #f8f9fa)
├── js/utils.js         # RNG con semilla, parser de respuestas, formateo KaTeX
├── js/charts.js        # gráficos (Chart.js bajo demanda) y figuras SVG
├── js/gen-math-1.js    # generadores de Precálculo (números, vectores, polinomios, ecuaciones)
├── js/gen-math-2.js    # generadores de Precálculo (rectas, sistemas, cuadráticas, trigonometría…)
├── js/gen-guia.js      # temas de la guía de la cátedra (intervalos, ecuaciones, dominio, magnitudes…)
├── js/gen-fisica.js    # generadores de Física (unidades, vectores, cinemática)
├── js/app.js           # flujo del examen, temporizadores, corrección, PDF, historial
└── test/gen-test.js    # prueba de todos los generadores: node test/gen-test.js 200
```

Dependencias por CDN (cdnjs): KaTeX (fórmulas), Chart.js (gráficos, se carga solo
cuando hace falta) y html2pdf.js (solo al descargar el PDF).

## Desarrollo

```
npm install
npm run build:css   # recompila css/styles.css tras cambiar clases o src/input.css
npm run watch:css
node test/gen-test.js 200
```

Cada generador recibe un `RNG` con semilla y devuelve `{ topic, title, hint, statement,
items, solution, figure?, chart?, qchart? }`. Los ítems admiten los tipos `number`,
`vector`, `vectorset`, `set`, `poly` y `choice`, con tolerancias configurables.
