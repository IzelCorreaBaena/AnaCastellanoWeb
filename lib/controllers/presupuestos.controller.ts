import { RequestHandler } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import https from 'https';
import http from 'http';
import { prisma } from '../db';

// ── Image fetch helper ────────────────────────────────────────────────────────

async function fetchImageBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const itemSchema = z.object({
  descripcion:    z.string().trim().min(1).max(300),
  cantidad:       z.number().positive(),
  precioUnitario: z.number().nonnegative(),
});

const presupuestoSchema = z.object({
  clienteNombre:   z.string().trim().min(1).max(150),
  clienteEmail:    z.string().trim().toLowerCase().email().max(254).optional(),
  clienteTelefono: z.string().trim().optional(),
  nombreEvento:    z.string().trim().max(200).optional(),
  fechaEvento:     z.string().optional(),
  anticipo:        z.number().nonnegative().optional(),
  imagenes:        z.array(z.string().url()).max(10).optional(),
  items:           z.array(itemSchema).min(1),
  igicPorcentaje:  z.number().min(0).max(100).default(7),
  notas:           z.string().trim().max(1000).optional(),
});

type PresupuestoItem = { descripcion: string; cantidad: number; precioUnitario: number };

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

const fmtDate = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Controller ───────────────────────────────────────────────────────────────

export const presupuestosController = {
  list: (async (_req, res, next) => {
    try {
      const presupuestos = await prisma.presupuesto.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          numero: true,
          clienteNombre: true,
          clienteEmail: true,
          total: true,
          createdAt: true,
        },
      });
      res.json(presupuestos);
    } catch (e) { next(e); }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const data = presupuestoSchema.parse(req.body);

      const subtotal = data.items.reduce(
        (sum, item) => sum + item.cantidad * item.precioUnitario,
        0,
      );
      const igicImporte = subtotal * (data.igicPorcentaje / 100);
      const total = subtotal + igicImporte;

      const presupuesto = await prisma.presupuesto.create({
        data: {
          clienteNombre:   data.clienteNombre,
          clienteEmail:    data.clienteEmail,
          clienteTelefono: data.clienteTelefono,
          nombreEvento:    data.nombreEvento,
          fechaEvento:     data.fechaEvento ? new Date(data.fechaEvento) : undefined,
          anticipo:        data.anticipo,
          imagenes:        data.imagenes ?? [],
          items:           data.items,
          subtotal,
          igicPorcentaje:  data.igicPorcentaje,
          igicImporte,
          total,
          notas:           data.notas,
        },
      });

      res.status(201).json(presupuesto);
    } catch (e) { next(e); }
  }) as RequestHandler,

  pdf: (async (req, res, next) => {
    try {
      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id: req.params.id },
      });
      if (!presupuesto) {
        res.status(404).json({ success: false, error: 'Presupuesto no encontrado' });
        return;
      }

      const items = presupuesto.items as PresupuestoItem[];
      const totalNum    = Number(presupuesto.total);
      const subtotalNum = Number(presupuesto.subtotal);
      const igicNum     = Number(presupuesto.igicImporte);
      const igicPct     = Number(presupuesto.igicPorcentaje);
      const anticipoNum = presupuesto.anticipo != null ? Number(presupuesto.anticipo) : null;

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`,
      );
      doc.pipe(res);

      const PAGE_LEFT  = 50;
      const PAGE_RIGHT = 545;
      const PAGE_WIDTH = 495;
      const GOLD       = '#C9A96E';
      const CHARCOAL   = '#2C2C2C';
      const TEXT_MAIN  = '#333333';
      const TEXT_GREY  = '#888888';

      // ── Helpers locales ──────────────────────────────────────────────────

      const drawRule = (color = GOLD, weight = 1.5) => {
        doc.moveTo(PAGE_LEFT, doc.y)
           .lineTo(PAGE_RIGHT, doc.y)
           .strokeColor(color)
           .lineWidth(weight)
           .stroke();
      };

      const sectionHeader = (title: string) => {
        doc.moveDown(0.8);
        const y = doc.y;
        doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 18).fill(CHARCOAL);
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
           .text(title.toUpperCase(), PAGE_LEFT + 8, y + 5, { width: PAGE_WIDTH - 16, lineBreak: false });
        doc.moveDown(0.2);
        doc.y = y + 24;
        doc.font('Helvetica');
      };

      // ── Cabecera ─────────────────────────────────────────────────────────

      drawRule(GOLD, 2);
      doc.moveDown(0.6);

      doc.fontSize(26).font('Helvetica-Bold').fillColor(CHARCOAL)
         .text('ANA CASTELLANO', { align: 'center' });
      doc.fontSize(11).font('Helvetica').fillColor(TEXT_GREY)
         .text('FLORISTA & DISEÑO FLORAL', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor(TEXT_GREY)
         .text('anacastellano.com  ·  hola@anacastellano.com', { align: 'center' });
      doc.moveDown(0.6);

      drawRule(GOLD, 2);
      doc.moveDown(0.8);

      // ── Número y fecha ───────────────────────────────────────────────────

      const numStr  = String(presupuesto.numero).padStart(3, '0');
      const fechaEmision = fmtDate(presupuesto.createdAt);

      doc.fontSize(13).font('Helvetica-Bold').fillColor(CHARCOAL)
         .text(`PRESUPUESTO Nº ${numStr}`, PAGE_LEFT, doc.y, { continued: false, lineBreak: false });

      // Fecha aligned right on same baseline
      doc.fontSize(10).font('Helvetica').fillColor(TEXT_GREY)
         .text(`Fecha: ${fechaEmision}`, PAGE_LEFT, doc.y - 16, { align: 'right', width: PAGE_WIDTH });

      doc.moveDown(1.2);

      // ── Datos cliente ────────────────────────────────────────────────────

      sectionHeader('Datos del cliente');

      doc.fontSize(10).font('Helvetica').fillColor(TEXT_MAIN);
      doc.text(`Nombre: ${presupuesto.clienteNombre}`, PAGE_LEFT + 8);
      if (presupuesto.clienteEmail)    doc.text(`Email: ${presupuesto.clienteEmail}`, PAGE_LEFT + 8);
      if (presupuesto.clienteTelefono) doc.text(`Teléfono: ${presupuesto.clienteTelefono}`, PAGE_LEFT + 8);

      if (presupuesto.nombreEvento || presupuesto.fechaEvento) {
        doc.moveDown(0.5);
        if (presupuesto.nombreEvento)
          doc.text(`Evento: ${presupuesto.nombreEvento}`, PAGE_LEFT + 8);
        if (presupuesto.fechaEvento)
          doc.text(`Fecha del evento: ${fmtDate(presupuesto.fechaEvento)}`, PAGE_LEFT + 8);
      }

      // ── Descripción / notas ──────────────────────────────────────────────

      if (presupuesto.notas) {
        sectionHeader('Descripción del servicio');
        doc.fontSize(10).font('Helvetica').fillColor(TEXT_MAIN)
           .text(presupuesto.notas, PAGE_LEFT + 8, doc.y, { width: PAGE_WIDTH - 16 });
      }

      // ── Tabla de servicios ───────────────────────────────────────────────

      sectionHeader('Desglose de servicios');

      const COL = { desc: PAGE_LEFT, cant: PAGE_LEFT + 300, precio: PAGE_LEFT + 355, importe: PAGE_LEFT + 415 };
      const COL_W = { desc: 290, cant: 50, precio: 55, importe: 80 };
      const ROW_H = 20;

      // Cabecera de tabla
      const hY = doc.y;
      doc.rect(PAGE_LEFT, hY, PAGE_WIDTH, ROW_H).fill(CHARCOAL);
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      doc.text('Descripción',  COL.desc    + 5, hY + 6, { width: COL_W.desc,    lineBreak: false });
      doc.text('Cant.',        COL.cant,         hY + 6, { width: COL_W.cant,    align: 'right', lineBreak: false });
      doc.text('Precio',       COL.precio,       hY + 6, { width: COL_W.precio,  align: 'right', lineBreak: false });
      doc.text('Importe',      COL.importe,      hY + 6, { width: COL_W.importe, align: 'right', lineBreak: false });

      let rowY = hY + ROW_H;

      doc.font('Helvetica').fontSize(9);
      items.forEach((item, i) => {
        const importe = item.cantidad * item.precioUnitario;
        doc.rect(PAGE_LEFT, rowY, PAGE_WIDTH, ROW_H).fill(i % 2 === 0 ? '#FAF7F2' : '#FFFFFF');
        doc.fillColor(TEXT_MAIN);
        doc.text(item.descripcion,              COL.desc    + 5, rowY + 5, { width: COL_W.desc,    lineBreak: false });
        doc.text(String(item.cantidad),         COL.cant,         rowY + 5, { width: COL_W.cant,    align: 'right', lineBreak: false });
        doc.text(fmtMoney(item.precioUnitario), COL.precio,       rowY + 5, { width: COL_W.precio,  align: 'right', lineBreak: false });
        doc.text(fmtMoney(importe),             COL.importe,      rowY + 5, { width: COL_W.importe, align: 'right', lineBreak: false });
        rowY += ROW_H;
      });

      // Línea cierre tabla
      doc.moveTo(PAGE_LEFT, rowY).lineTo(PAGE_RIGHT, rowY).strokeColor(GOLD).lineWidth(1).stroke();
      doc.y = rowY + 10;

      // ── Totales ──────────────────────────────────────────────────────────

      const LABEL_X = 370;
      const VALUE_X = 460;
      const VALUE_W = 80;

      const printRow = (label: string, value: string, bold = false, color = TEXT_MAIN) => {
        const ty = doc.y;
        doc.fontSize(bold ? 11 : 10)
           .font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(bold ? '#000000' : color)
           .text(label, LABEL_X, ty, { width: 85, align: 'right', lineBreak: false })
           .text(value, VALUE_X, ty, { width: VALUE_W, align: 'right', lineBreak: false });
        doc.moveDown(bold ? 0.6 : 0.4);
      };

      doc.moveDown(0.3);
      printRow('Subtotal:', fmtMoney(subtotalNum));
      printRow(`IGIC (${igicPct}%):`, fmtMoney(igicNum));

      // Separador antes del total
      doc.moveTo(LABEL_X, doc.y)
         .lineTo(PAGE_RIGHT, doc.y)
         .strokeColor(CHARCOAL).lineWidth(0.5).stroke();
      doc.moveDown(0.3);

      printRow('TOTAL:', fmtMoney(totalNum), true);

      // ── Condiciones de pago ──────────────────────────────────────────────

      sectionHeader('Condiciones');

      doc.fontSize(10).font('Helvetica').fillColor(TEXT_MAIN);

      if (anticipoNum !== null) {
        const resto = totalNum - anticipoNum;
        doc.text(`Anticipo:          ${fmtMoney(anticipoNum)}`, PAGE_LEFT + 8);
        doc.text(`Resto a pagar:     ${fmtMoney(resto)}  (el día del evento)`, PAGE_LEFT + 8);
        doc.moveDown(0.4);
      }

      doc.fillColor(TEXT_GREY)
         .text('Forma de pago: Transferencia bancaria o efectivo', PAGE_LEFT + 8);
      doc.text('Validez del presupuesto: 30 días desde la fecha de emisión', PAGE_LEFT + 8);
      doc.moveDown(0.3);
      doc.text(
        'Cancelación: Con más de 7 días de antelación, se devuelve el anticipo íntegro. ' +
        'Con menos de 7 días, el anticipo no es reembolsable.',
        PAGE_LEFT + 8,
        doc.y,
        { width: PAGE_WIDTH - 16 },
      );

      // ── Footer ───────────────────────────────────────────────────────────

      doc.moveDown(1.5);
      drawRule(GOLD, 1.5);
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(CHARCOAL)
         .text('Gracias por confiar en Ana Castellano Florista', { align: 'center' });
      doc.moveDown(0.3);
      drawRule(GOLD, 1.5);

      // ── Segunda página: Imágenes adjuntas ────────────────────────────────

      const imagenes = presupuesto.imagenes as string[];
      if (imagenes && imagenes.length > 0) {
        doc.addPage();

        // Título con la misma barra oscura
        drawRule(GOLD, 2);
        doc.moveDown(0.6);
        doc.fontSize(13).font('Helvetica-Bold').fillColor(CHARCOAL)
           .text('IMÁGENES ADJUNTAS', { align: 'center' });
        doc.moveDown(0.6);
        drawRule(GOLD, 1.5);
        doc.moveDown(1);

        // Grid 2 columnas — posicionamiento absoluto por fila/columna
        const IMG_W  = 220;
        const IMG_H  = 165;
        const GAP_X  = 15;
        const GAP_Y  = 20;
        const COLS   = 2;
        const GRID_TOP = doc.page.margins.top + 80; // Y base tras el título

        let pageRow = 0;
        for (let i = 0; i < imagenes.length; i++) {
          const col   = i % COLS;
          const pageH = doc.page.height - doc.page.margins.bottom;
          const imgY  = GRID_TOP + pageRow * (IMG_H + GAP_Y);
          const imgX  = PAGE_LEFT + col * (IMG_W + GAP_X);

          // Nueva página cuando la fila actual supera el área imprimible
          if (col === 0 && i > 0 && imgY + IMG_H > pageH) {
            doc.addPage();
            pageRow = 0;
          }

          const finalY = GRID_TOP + pageRow * (IMG_H + GAP_Y);

          try {
            const buffer = await fetchImageBuffer(imagenes[i]);
            doc.image(buffer, imgX, finalY, { fit: [IMG_W, IMG_H] });
          } catch {
            // Si falla la descarga, continúa con las demás imágenes
          }

          if (col === COLS - 1) pageRow++;
        }
      }

      doc.end();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
