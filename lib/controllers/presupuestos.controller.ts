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

const idParamSchema = z.object({ id: z.string().uuid() });

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
  ubicacion:       z.string().trim().max(200).optional(),
  anticipo:        z.number().nonnegative().optional(),
  imagenes:        z.array(z.string().url()).max(10).optional(),
  items:           z.array(itemSchema).min(1),
  igicPorcentaje:  z.number().min(0).max(100).default(7),
  notas:           z.string().trim().max(1000).optional(),
});

type PresupuestoItem = { descripcion: string; cantidad: number; precioUnitario: number };

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
          ubicacion:       data.ubicacion,
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
      const { id } = idParamSchema.parse(req.params);
      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id },
      });
      if (!presupuesto) {
        res.status(404).json({ success: false, error: 'Presupuesto no encontrado' });
        return;
      }

      const items      = presupuesto.items as PresupuestoItem[];
      const anticipoNum = presupuesto.anticipo != null ? Number(presupuesto.anticipo) : null;
      const imagenes    = presupuesto.imagenes as string[];

      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`,
      );
      doc.pipe(res);

      // ── Design tokens ─────────────────────────────────────────────────────
      const M        = 45;
      const PAGE_W   = 595;
      const DARK     = '#3A4242';
      const GOLD     = '#C4A45A';
      const TEXT_DK  = '#2C2C2C';
      const TEXT_MD  = '#555555';
      const LINE_CLR = '#DEDBD7';

      const fmt = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

      const fmtDate = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        return `${dd}-${mm}-${yy}`;
      };

      // ── 1. Info card (left) ────────────────────────────────────────────────
      const CARD_X = M;
      const CARD_Y = M;
      const CARD_W = 215;
      const CARD_H = 100;

      doc.roundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, 14).fill(DARK);

      const labelX = CARD_X + 14;
      const valueX = CARD_X + 84;
      const valueW = CARD_W - 84 - 10;

      const defaultDate = fmtDate(presupuesto.createdAt);
      const fechaStr    = presupuesto.fechaEvento ? fmtDate(presupuesto.fechaEvento) : defaultDate;

      const infoRows: [string, string][] = [
        ['Fecha',     fechaStr],
        ['Evento',    presupuesto.nombreEvento ?? '—'],
        ['Cliente',   presupuesto.clienteNombre],
        ['Ubicación', presupuesto.ubicacion    ?? '—'],
      ];

      let ry = CARD_Y + 13;
      doc.font('Helvetica').fontSize(8.5).fillColor('#FFFFFF');
      for (const [label, value] of infoRows) {
        doc.text(label, labelX, ry, { width: 62, lineBreak: false });
        doc.text(value, valueX, ry, { width: valueW, lineBreak: false, ellipsis: true });
        ry += 20;
      }

      // ── 2. Logo (right) ────────────────────────────────────────────────────
      const LOGO_X = CARD_X + CARD_W + 15;
      const LOGO_W = PAGE_W - M - LOGO_X;
      const midX   = LOGO_X + LOGO_W / 2;

      doc.font('Times-Italic').fontSize(24).fillColor(TEXT_DK)
        .text('Ana Castellano', LOGO_X, CARD_Y + 14, { width: LOGO_W, align: 'center', lineBreak: false });

      doc.moveTo(midX - 55, CARD_Y + 50)
        .lineTo(midX + 55, CARD_Y + 50)
        .strokeColor(GOLD).lineWidth(0.8).stroke();

      doc.font('Helvetica').fontSize(8).fillColor(TEXT_DK)
        .text('F L O R I S T A', LOGO_X, CARD_Y + 57, { width: LOGO_W, align: 'center', lineBreak: false });

      // ── 3. Divider ─────────────────────────────────────────────────────────
      const DIV_Y = CARD_Y + CARD_H + 18;
      doc.moveTo(M, DIV_Y).lineTo(PAGE_W - M, DIV_Y)
        .strokeColor(LINE_CLR).lineWidth(0.6).stroke();

      // ── 4. Table ───────────────────────────────────────────────────────────
      const TBL_Y = DIV_Y + 14;
      const TBL_L = M;
      const TBL_W = PAGE_W - M * 2;

      const C_DESC  = { x: TBL_L,       w: 260 };
      const C_QTY   = { x: TBL_L + 260, w: 65  };
      const C_PRICE = { x: TBL_L + 325, w: 85  };
      const C_TOTAL = { x: TBL_L + 410, w: 95  };

      const HDR_H = 24;
      doc.rect(TBL_L, TBL_Y, TBL_W, HDR_H).fill(DARK);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
      doc.text('Descripción', C_DESC.x + 8, TBL_Y + 7, { width: C_DESC.w - 8,  lineBreak: false });
      doc.text('Cantidad',    C_QTY.x,      TBL_Y + 7, { width: C_QTY.w,   align: 'center', lineBreak: false });
      doc.text('Precio',      C_PRICE.x,    TBL_Y + 7, { width: C_PRICE.w, align: 'right',  lineBreak: false });
      doc.text('Total',       C_TOTAL.x,    TBL_Y + 7, { width: C_TOTAL.w - 5, align: 'right', lineBreak: false });

      const ROW_H = 20;
      let curY = TBL_Y + HDR_H;

      items.forEach((item) => {
        const importe = item.cantidad * item.precioUnitario;
        doc.font('Helvetica').fontSize(9).fillColor(TEXT_DK);
        doc.text(item.descripcion, C_DESC.x + 8, curY + 5,
          { width: C_DESC.w - 14, lineBreak: false, ellipsis: true });
        doc.text(String(item.cantidad), C_QTY.x, curY + 5,
          { width: C_QTY.w, align: 'center', lineBreak: false });
        if (item.cantidad !== 1) {
          doc.text(fmt.format(item.precioUnitario), C_PRICE.x, curY + 5,
            { width: C_PRICE.w, align: 'right', lineBreak: false });
        }
        doc.text(fmt.format(importe), C_TOTAL.x, curY + 5,
          { width: C_TOTAL.w - 5, align: 'right', lineBreak: false });
        doc.moveTo(TBL_L, curY + ROW_H).lineTo(TBL_L + TBL_W, curY + ROW_H)
          .strokeColor(LINE_CLR).lineWidth(0.4).stroke();
        curY += ROW_H;
      });

      // ── 5. Footer ──────────────────────────────────────────────────────────
      const FTR_Y       = curY + 26;
      const FTR_LEFT_W  = 280;
      const FTR_RIGHT_X = M + FTR_LEFT_W + 15;
      const FTR_RIGHT_W = PAGE_W - M - FTR_RIGHT_X;

      const SUB      = Number(presupuesto.subtotal);
      const IGIC_PCT = Number(presupuesto.igicPorcentaje);
      const IGIC_IMP = Number(presupuesto.igicImporte);
      const TOTAL    = Number(presupuesto.total);

      const TOT_LBL_X = FTR_RIGHT_X;
      const TOT_VAL_X = FTR_RIGHT_X + 90;
      const TOT_VAL_W = FTR_RIGHT_W - 90;

      doc.font('Helvetica').fontSize(9).fillColor(TEXT_MD);
      doc.text('TOTAL',           TOT_LBL_X, FTR_Y,      { width: 85, lineBreak: false });
      doc.text(fmt.format(SUB),   TOT_VAL_X, FTR_Y,      { width: TOT_VAL_W, align: 'right', lineBreak: false });
      doc.text(`IGIC ${IGIC_PCT}%`, TOT_LBL_X, FTR_Y + 16, { width: 85, lineBreak: false });
      doc.text(fmt.format(IGIC_IMP), TOT_VAL_X, FTR_Y + 16, { width: TOT_VAL_W, align: 'right', lineBreak: false });

      if (anticipoNum !== null) {
        const resto = TOTAL - anticipoNum;
        doc.text('Anticipo',              TOT_LBL_X, FTR_Y + 32, { width: 85, lineBreak: false });
        doc.text(fmt.format(anticipoNum), TOT_VAL_X, FTR_Y + 32, { width: TOT_VAL_W, align: 'right', lineBreak: false });
        doc.text('Resto',                 TOT_LBL_X, FTR_Y + 48, { width: 85, lineBreak: false });
        doc.text(fmt.format(resto),       TOT_VAL_X, FTR_Y + 48, { width: TOT_VAL_W, align: 'right', lineBreak: false });
      }

      const sepOffset = anticipoNum !== null ? 64 : 31;
      doc.moveTo(TOT_LBL_X, FTR_Y + sepOffset).lineTo(PAGE_W - M, FTR_Y + sepOffset)
        .strokeColor(DARK).lineWidth(0.5).stroke();

      doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_DK);
      doc.text('TOTAL FINAL',      TOT_LBL_X, FTR_Y + sepOffset + 5, { width: 85, lineBreak: false });
      doc.text(fmt.format(TOTAL),  TOT_VAL_X, FTR_Y + sepOffset + 5, { width: TOT_VAL_W, align: 'right', lineBreak: false });

      // Contact info
      const CON_Y = FTR_Y + sepOffset + 30;
      doc.font('Helvetica').fontSize(8).fillColor(TEXT_MD);

      const drawInstIcon = (x: number, y: number) => {
        doc.save();
        doc.strokeColor(TEXT_MD).lineWidth(0.7);
        doc.roundedRect(x, y, 9, 9, 2).stroke();
        doc.circle(x + 4.5, y + 4.5, 2.2).stroke();
        doc.restore();
      };
      const drawPhoneIcon = (x: number, y: number) => {
        doc.save();
        doc.strokeColor(TEXT_MD).lineWidth(0.7);
        doc.moveTo(x + 1.5, y + 1).lineTo(x + 4.5, y + 1)
          .bezierCurveTo(x + 5.5, y + 1, x + 5.5, y + 4, x + 5, y + 4.5)
          .lineTo(x + 5, y + 5.5)
          .bezierCurveTo(x + 5, y + 6.5, x + 3.5, y + 8, x + 2, y + 8)
          .bezierCurveTo(x + 0.5, y + 8, x, y + 6.5, x, y + 5.5)
          .lineTo(x, y + 4.5)
          .bezierCurveTo(x, y + 4, x + 1, y + 4, x + 1.5, y + 4)
          .lineTo(x + 1.5, y + 1).stroke();
        doc.restore();
      };
      const drawMailIcon = (x: number, y: number) => {
        doc.save();
        doc.strokeColor(TEXT_MD).lineWidth(0.7);
        doc.rect(x, y + 1.5, 10, 7).stroke();
        doc.moveTo(x, y + 1.5).lineTo(x + 5, y + 6).lineTo(x + 10, y + 1.5).stroke();
        doc.restore();
      };

      drawInstIcon(FTR_RIGHT_X, CON_Y);
      doc.text('insta: anacastellanoflorista', FTR_RIGHT_X + 13, CON_Y + 1, { lineBreak: false });
      drawPhoneIcon(FTR_RIGHT_X, CON_Y + 15);
      doc.text('tlf: 662454170', FTR_RIGHT_X + 13, CON_Y + 16, { lineBreak: false });
      drawMailIcon(FTR_RIGHT_X, CON_Y + 30);
      doc.text('Anacastellano495@gmail.com', FTR_RIGHT_X + 13, CON_Y + 31, { lineBreak: false });

      // Payment info (left)
      doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT_DK)
        .text('CONFIRMACIÓN RESERVADA', M, FTR_Y, { width: FTR_LEFT_W, lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor(TEXT_MD);
      doc.text('Transferencia del 50% a la siguiente cuenta.', M, FTR_Y + 14, { width: FTR_LEFT_W, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT_DK)
        .text('Beneficiario: Ana Lourdes Castellano Dominguez', M, FTR_Y + 26, { width: FTR_LEFT_W, lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor(TEXT_MD);
      doc.text('Banco Abanca CC. ES222080085361304055062', M, FTR_Y + 38, { width: FTR_LEFT_W, lineBreak: false });
      doc.text('Concepto (Nombre de los Novios y Fecha Boda)', M, FTR_Y + 50, { width: FTR_LEFT_W, lineBreak: false });
      doc.text('El 50% restante deberá abonarse 10 días antes del evento.', M, FTR_Y + 62, { width: FTR_LEFT_W, lineBreak: false });

      if (presupuesto.notas) {
        doc.font('Helvetica').fontSize(8).fillColor(TEXT_MD)
          .text(`Notas: ${presupuesto.notas}`, M, FTR_Y + 82, { width: PAGE_W - M * 2 });
      }

      // ── 6. Segunda página: imágenes adjuntas ───────────────────────────────
      if (imagenes && imagenes.length > 0) {
        doc.addPage();

        doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT_DK)
          .text('IMÁGENES ADJUNTAS', M, M + 10, { width: PAGE_W - M * 2, align: 'center', lineBreak: false });

        doc.moveTo(M, M + 35).lineTo(PAGE_W - M, M + 35)
          .strokeColor(LINE_CLR).lineWidth(0.6).stroke();

        const IMG_W   = 220;
        const IMG_H   = 165;
        const GAP_X   = 15;
        const GAP_Y   = 20;
        const COLS    = 2;
        const GRID_TOP = M + 50;

        let pageRow = 0;
        for (let i = 0; i < imagenes.length; i++) {
          const col  = i % COLS;
          const imgY = GRID_TOP + pageRow * (IMG_H + GAP_Y);
          const imgX = M + col * (IMG_W + GAP_X);

          if (col === 0 && i > 0 && imgY + IMG_H > doc.page.height - M) {
            doc.addPage();
            pageRow = 0;
          }

          const finalY = GRID_TOP + pageRow * (IMG_H + GAP_Y);
          try {
            const buffer = await fetchImageBuffer(imagenes[i]);
            doc.image(buffer, imgX, finalY, { fit: [IMG_W, IMG_H] });
          } catch { /* skip failed images */ }

          if (col === COLS - 1) pageRow++;
        }
      }

      doc.end();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
