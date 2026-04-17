import { RequestHandler } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../db';

const itemSchema = z.object({
  descripcion:    z.string().trim().min(1).max(300),
  cantidad:       z.number().positive(),
  precioUnitario: z.number().nonnegative(),
});

const presupuestoSchema = z.object({
  clienteNombre:   z.string().trim().min(1).max(150),
  clienteEmail:    z.string().trim().toLowerCase().email().max(254).optional(),
  clienteTelefono: z.string().trim().optional(),
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

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`,
      );
      doc.pipe(res);

      // ── Header ──
      doc.fontSize(20).fillColor('#2C2C2C').text('Ana Castellano Florista', { align: 'center' });
      doc.fontSize(10).fillColor('#888888').text('anacastellano.com  ·  hola@anacastellano.com', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown();

      // ── Número y fecha ──
      doc.fillColor('#2C2C2C').fontSize(14).text(`PRESUPUESTO Nº ${presupuesto.numero}`);
      doc.fontSize(10).fillColor('#555555').text(
        `Fecha: ${presupuesto.createdAt.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      );
      doc.moveDown();

      // ── Datos cliente ──
      doc.fillColor('#2C2C2C').fontSize(12).text('Datos del cliente');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333333').text(`Nombre: ${presupuesto.clienteNombre}`);
      if (presupuesto.clienteEmail) doc.text(`Email: ${presupuesto.clienteEmail}`);
      if (presupuesto.clienteTelefono) doc.text(`Teléfono: ${presupuesto.clienteTelefono}`);
      doc.moveDown();

      // ── Tabla items — cabecera ──
      doc.fillColor('#2C2C2C').fontSize(12).text('Detalle del presupuesto');
      doc.moveDown(0.5);

      const tableLeft = 50;
      const tableWidth = 495;
      const rowHeight = 20;
      let y = doc.y;

      doc.rect(tableLeft, y, tableWidth, rowHeight).fill('#2C2C2C');
      doc.fillColor('#ffffff').fontSize(9)
        .text('Descripción',    tableLeft + 5, y + 5, { width: 250, lineBreak: false })
        .text('Cant.',          tableLeft + 260, y + 5, { width: 50,  align: 'right', lineBreak: false })
        .text('Precio unit.',   tableLeft + 315, y + 5, { width: 80,  align: 'right', lineBreak: false })
        .text('Importe',        tableLeft + 400, y + 5, { width: 90,  align: 'right', lineBreak: false });

      y += rowHeight;

      items.forEach((item, i) => {
        const importe = item.cantidad * item.precioUnitario;
        doc.rect(tableLeft, y, tableWidth, rowHeight).fill(i % 2 === 0 ? '#FAF7F2' : '#FFFFFF');
        doc.fillColor('#333333').fontSize(9)
          .text(item.descripcion,                    tableLeft + 5,   y + 5, { width: 250, lineBreak: false })
          .text(String(item.cantidad),               tableLeft + 260, y + 5, { width: 50,  align: 'right', lineBreak: false })
          .text(`${item.precioUnitario.toFixed(2)} €`, tableLeft + 315, y + 5, { width: 80, align: 'right', lineBreak: false })
          .text(`${importe.toFixed(2)} €`,           tableLeft + 400, y + 5, { width: 90,  align: 'right', lineBreak: false });
        y += rowHeight;
      });

      doc.y = y + 10;
      doc.moveDown(0.5);

      // ── Totales ──
      const labelX = 370;
      const valueX = 460;
      const valueW = 85;

      const printTotal = (label: string, value: string, bold = false) => {
        const ty = doc.y;
        doc.fontSize(bold ? 11 : 10).fillColor(bold ? '#000000' : '#333333')
          .text(label, labelX, ty, { width: 85, align: 'right', lineBreak: false })
          .text(value, valueX, ty, { width: valueW, align: 'right', lineBreak: false });
        doc.moveDown(0.4);
      };

      printTotal('Subtotal:', `${Number(presupuesto.subtotal).toFixed(2)} €`);
      printTotal(`IGIC (${presupuesto.igicPorcentaje}%):`, `${Number(presupuesto.igicImporte).toFixed(2)} €`);
      printTotal('TOTAL:', `${Number(presupuesto.total).toFixed(2)} €`, true);

      // ── Notas ──
      if (presupuesto.notas) {
        doc.moveDown();
        doc.fontSize(10).fillColor('#555555').text(`Notas: ${presupuesto.notas}`, { width: 495 });
      }

      // ── Footer ──
      doc.moveDown(2);
      doc.fontSize(9).fillColor('#999999')
        .text('Presupuesto válido por 30 días desde la fecha de emisión.', { align: 'center' });

      doc.end();
    } catch (e) { next(e); }
  }) as RequestHandler,
};
