# 📡 Simulador OSI / TCP-IP

Aplicación web educativa para 1SMR que muestra **cómo viaja un mensaje por la red**: encapsulación (OSI 7→1), tránsito por switches y routers, y desencapsulación (1→7), con su correspondencia con TCP/IP.

Es un único archivo, [`index.html`](./index.html), en HTML+CSS+JS puro. No necesita servidor ni dependencias: basta abrirlo en el navegador.

## Uso

1. Elige el **contenido**: un **texto** (máx. 30 caracteres) o una **imagen 8×8** (píxeles en blanco/negro; píxel a píxel con clic, o un ejemplo prediseñado). La imagen se codifica a 1 bit por píxel: cada fila = 1 byte, 8 bytes en total.
2. Elige **topología** (LAN, dos redes con router, tres redes con ISP) y **destino**.
3. Elige la vista **OSI (7 capas)** o **TCP/IP (4 capas)**.
   Al viajar entre dispositivos, cada segmento se anima como un **sobre numerado** por el enlace, y una **bandeja de segmentos** indica cuáles están listos, en camino, entregados, perdidos o retransmitiéndose.
4. Avanza con **Siguiente / Anterior**, o pulsa **Reproducir** (velocidad ajustable).
   Atajos: `←` `→` y `Espacio`.
5. Opcional:
   - **Flood:** el primer switch no conoce la MAC destino y reenvía por todos los puertos menos el de entrada.
   - **Perder segmento:** TCP detecta el hueco en destino y retransmite.

## Qué se muestra en cada capa

| Capa | PDU | Contenido |
|------|-----|-----------|
| 7 | Datos | Texto original o imagen 8×8 |
| 6 | Datos | Bytes en hexadecimal (UTF-8 en texto; 1 bit/píxel en imagen) |
| 5 | Datos | ID de sesión |
| 4 | Segmento | Segmentos n/N, puertos, SEQ |
| 3 | Paquete | IP origen/destino (extremo a extremo), TTL |
| 2 | Trama | MAC origen/destino por salto + CRC-32 |
| 1 | Bits | Bits y señal simplificada en canvas |

## Simplificaciones

Segmentos de 4 bytes (real: ~1460), SEQ inicial fijo, CRC-32 sobre datos de ejemplo, sin ARP ni saludo TCP de tres vías, y sin NAT en la topología 3. La propia aplicación lo indica en pantalla.

## Tests (Playwright)

Requiere [Node.js](https://nodejs.org) 18+.

```bash
npm install
npx playwright install chromium
npm test
```

Los tests están en [`tests/`](./tests) y la configuración en [`playwright.config.js`](./playwright.config.js). La CI de GitHub los ejecuta en cada push y pull request a `main` (`.github/workflows/playwright.yml`).

## Licencia

Ver [LICENSE](./LICENSE).
