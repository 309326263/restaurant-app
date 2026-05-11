# printer-service

Servicio Node independiente para imprimir tickets POS directo a impresora ESC/POS (Epson TM-T20III).

## Endpoints

- `POST /print/kitchen`
- `POST /print/bar`

## Payload

```json
{
  "station": "KITCHEN",
  "table": "12",
  "ticketId": "123",
  "items": [
    { "name": "Ramen", "qty": 2, "notes": "sin sal" },
    { "name": "Coca Cola", "qty": 1, "notes": "extra picante" }
  ]
}
```

Para `/print/kitchen` y `/print/bar`, el `station` del body es opcional porque la ruta ya lo fuerza.

## Setup

1. Entrar a `printer-service`
2. Instalar dependencias:
   - `npm install`
3. Copiar `.env.example` a `.env` y ajustar si aplica.

## Ejecutar

- `npm run dev`
- o `npm start`

## Notas

- USB es el modo por defecto (`PRINTER_CONNECTION=USB`).
- Fallback LAN disponible con `PRINTER_CONNECTION=LAN`.
- Este servicio es independiente del frontend Next.js y del sistema SSE.
