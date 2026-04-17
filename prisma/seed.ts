/**
 * AnaCastellano Florista — Prisma Seed
 *
 * Ejecutar con: npx prisma db seed
 * O directamente: npx ts-node prisma/seed.ts
 *
 * Incluye:
 *  - Admin por defecto (username: admin, password: Admin123!)
 *  - 4 servicios con sus bloques de contenido
 *  - Reservas de ejemplo en distintos estados
 */

import { PrismaClient, EstadoReserva } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// ---------------------------------------------------------------------------
// Seed principal
// ---------------------------------------------------------------------------

async function main() {
  console.log("Iniciando seed de AnaCastellano Florista...\n");

  // -------------------------------------------------------------------------
  // 1. ADMIN POR DEFECTO
  // -------------------------------------------------------------------------
  console.log("Creando admin por defecto...");

  const adminPasswordHash = await hashPassword("Admin123!");

  const admin = await prisma.admin.upsert({
    where: { email: "admin@anacastellano.com" },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      username: "admin",
      email: "admin@anacastellano.com",
      passwordHash: adminPasswordHash,
    },
  });

  console.log(`  Admin creado: ${admin.username} (${admin.email})\n`);

  // -------------------------------------------------------------------------
  // 2. SERVICIOS Y BLOQUES
  // -------------------------------------------------------------------------
  console.log("Creando servicios y bloques...\n");

  // --------------------------------------------------------------------------
  // SERVICIO 1: Diseño floral personalizado
  // --------------------------------------------------------------------------
  console.log("  [1/4] Diseño floral personalizado");

  const servicio1 = await prisma.servicio.upsert({
    where: {
      // upsert por titulo — en producción se usaría un campo slug único
      // Prisma no permite upsert por campo no-unique sin un campo único adicional,
      // por eso usamos create + skipDuplicates en los seeds reales.
      // Aquí usamos findFirst + create para evitar duplicados.
      id: "00000000-0000-0000-0000-000000000001",
    },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      titulo: "Diseño floral personalizado",
      descripcion:
        "Creamos arreglos florales únicos adaptados a tu estilo, espacio y presupuesto. Cada composición es una obra diseñada a medida, pensada para transmitir exactamente lo que deseas.",
      orden: 1,
      activo: true,
      bloques: {
        create: [
          {
            titulo: "Ramos de novia",
            descripcion:
              "Ramos artesanales que acompañan uno de los momentos más importantes de tu vida. Diseñados con flores de temporada, hilo de seda y técnicas de alta floricultura.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/diseno-floral/ramos-novia-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/diseno-floral/ramos-novia-02.jpg",
            ],
            orden: 1,
            activo: true,
          },
          {
            titulo: "Arreglos para el hogar",
            descripcion:
              "Composiciones pensadas para transformar cualquier rincón de tu hogar en un espacio lleno de vida y color.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/diseno-floral/hogar-01.jpg",
            ],
            orden: 2,
            activo: true,
          },
          {
            titulo: "Flores preservadas",
            descripcion:
              "Diseños con flores naturales tratadas para durar años sin perder su belleza original. El regalo eterno.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/diseno-floral/preservadas-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/diseno-floral/preservadas-02.jpg",
            ],
            orden: 3,
            activo: true,
          },
        ],
      },
    },
  });

  console.log(`     OK: ${servicio1.id}`);

  // --------------------------------------------------------------------------
  // SERVICIO 2: Decoración integral de eventos
  // --------------------------------------------------------------------------
  console.log("  [2/4] Decoración integral de eventos");

  const servicio2 = await prisma.servicio.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      titulo: "Decoración integral de eventos",
      descripcion:
        "Transformamos cualquier espacio en un escenario memorable. Bodas, bautizos, comuniones, cumpleaños corporativos y eventos sociales con una propuesta floral y decorativa cohesionada de principio a fin.",
      orden: 2,
      activo: true,
      bloques: {
        create: [
          {
            titulo: "Bodas",
            descripcion:
              "Decoración completa: altar, banquete, mesa de novios, centros de mesa, arcos florales y pétalo de entrada. Coordinamos cada elemento para que el conjunto sea perfecto.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/bodas-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/bodas-02.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/bodas-03.jpg",
            ],
            orden: 1,
            activo: true,
          },
          {
            titulo: "Eventos corporativos",
            descripcion:
              "Ambientación floral para galas, presentaciones de producto, inauguraciones y eventos de empresa. Refuerza tu imagen de marca con un toque natural y elegante.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/corporativo-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/corporativo-02.jpg",
            ],
            orden: 2,
            activo: true,
          },
          {
            titulo: "Celebraciones familiares",
            descripcion:
              "Bautizos, comuniones, aniversarios y cumpleaños con decoración personalizada para hacer de cada reunión familiar un recuerdo imborrable.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/eventos/familiar-01.jpg",
            ],
            orden: 3,
            activo: true,
          },
        ],
      },
    },
  });

  console.log(`     OK: ${servicio2.id}`);

  // --------------------------------------------------------------------------
  // SERVICIO 3: Asesoramiento estético 360°
  // --------------------------------------------------------------------------
  console.log("  [3/4] Asesoramiento estético 360°");

  const servicio3 = await prisma.servicio.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      titulo: "Asesoramiento estético 360°",
      descripcion:
        "Una visión global del espacio. Analizamos tu evento, tu local o tu hogar y proponemos una propuesta estética completa que va más allá de las flores: paleta de color, texturas, materiales y armonía visual.",
      orden: 3,
      activo: true,
      bloques: {
        create: [
          {
            titulo: "Consulta de estilo",
            descripcion:
              "Sesión personalizada de 60 minutos (presencial u online) para definir el estilo, paleta cromática y concepto estético de tu evento o espacio.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/asesoria/consulta-01.jpg",
            ],
            orden: 1,
            activo: true,
          },
          {
            titulo: "Mood board y propuesta visual",
            descripcion:
              "Entrega de un tablero de inspiración digital con referencias de flores, materiales, colores y ejemplos reales para que puedas visualizar el resultado antes de confirmar.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/asesoria/moodboard-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/asesoria/moodboard-02.jpg",
            ],
            orden: 2,
            activo: true,
          },
          {
            titulo: "Seguimiento hasta el día del evento",
            descripcion:
              "Acompañamiento continuo con revisiones periódicas, ajustes de propuesta y disponibilidad por WhatsApp durante todo el proceso.",
            imagenes: [],
            orden: 3,
            activo: true,
          },
        ],
      },
    },
  });

  console.log(`     OK: ${servicio3.id}`);

  // --------------------------------------------------------------------------
  // SERVICIO 4: Coordinación con proveedores
  // --------------------------------------------------------------------------
  console.log("  [4/4] Coordinación con proveedores");

  const servicio4 = await prisma.servicio.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      titulo: "Coordinación con proveedores",
      descripcion:
        "Gestionamos la relación con todos los proveedores implicados en la decoración floral de tu evento: mercados de flores, empresas de transporte, montadores y otros decoradores para que tú no tengas que preocuparte de nada.",
      orden: 4,
      activo: true,
      bloques: {
        create: [
          {
            titulo: "Gestión de flor fresca",
            descripcion:
              "Contacto directo con mercados mayoristas y cultivadores locales para garantizar la mejor flor fresca al mejor precio. Temporalidad y sostenibilidad garantizadas.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/coordinacion/mercado-01.jpg",
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/coordinacion/mercado-02.jpg",
            ],
            orden: 1,
            activo: true,
          },
          {
            titulo: "Coordinación logística",
            descripcion:
              "Organización de entregas, montaje y desmontaje en el lugar del evento. Coordinamos con el espacio, el catering y otros proveedores para cumplir los tiempos.",
            imagenes: [
              "https://res.cloudinary.com/anacastellano/image/upload/v1/servicios/coordinacion/logistica-01.jpg",
            ],
            orden: 2,
            activo: true,
          },
          {
            titulo: "Red de profesionales de confianza",
            descripcion:
              "Acceso a nuestra red de fotógrafos, papelería artesanal, catering sostenible y otros profesionales del sector que comparten nuestra filosofía de calidad.",
            imagenes: [],
            orden: 3,
            activo: true,
          },
        ],
      },
    },
  });

  console.log(`     OK: ${servicio4.id}`);

  // -------------------------------------------------------------------------
  // 3. RESERVAS DE EJEMPLO
  // -------------------------------------------------------------------------
  console.log("\nCreando reservas de ejemplo...");

  const reservasEjemplo = [
    {
      nombre: "Laura Martínez García",
      telefono: "+34 612 345 678",
      email: "laura.martinez@email.com",
      mensaje:
        "Hola Ana, me caso en junio y me encantaría contar contigo para el ramo de novia y la decoración de la iglesia. Somos 120 personas. ¿Podemos hablar?",
      estado: EstadoReserva.PENDIENTE,
      fechaEvento: new Date("2026-06-14T12:00:00Z"),
      servicioId: "00000000-0000-0000-0000-000000000001",
      servicioNombre: "Diseño floral personalizado",
    },
    {
      nombre: "Carlos Rodríguez Sanz",
      telefono: "+34 698 765 432",
      email: "carlos.rodriguez@empresa.es",
      mensaje:
        "Necesito decoración floral para la gala anual de nuestra empresa. Seremos unos 80 asistentes en un hotel de 5 estrellas en Madrid.",
      estado: EstadoReserva.ACEPTADA,
      fechaEvento: new Date("2026-05-22T19:00:00Z"),
      notas:
        "Presupuesto confirmado: 2.400€. Reunión de coordinación el 10 de mayo. Entregar propuesta mood board antes del 30 de abril.",
      googleEventId: "google_event_placeholder_001",
      servicioId: "00000000-0000-0000-0000-000000000002",
      servicioNombre: "Decoración integral de eventos",
    },
    {
      nombre: "Marta López Fernández",
      telefono: "+34 654 321 987",
      email: "marta.lopez@gmail.com",
      mensaje:
        "Buenos días, me gustaría un asesoramiento para decorar el salón de mi casa. Tengo un estilo nórdico y me encantan los tonos neutros.",
      estado: EstadoReserva.RECHAZADA,
      notas:
        "Fechas solicitadas no disponibles. Se le indicó que contacte a partir de septiembre.",
      servicioId: "00000000-0000-0000-0000-000000000003",
      servicioNombre: "Asesoramiento estético 360°",
    },
    {
      nombre: "Isabel Ruiz Moreno",
      telefono: "+34 677 890 123",
      email: "isabel.ruiz@hotmail.com",
      mensaje:
        "Quiero organizar el bautizo de mi hija para finales de julio. Busco una decoración con flores rosas y blancas, estilo romántico y delicado.",
      estado: EstadoReserva.PENDIENTE,
      fechaEvento: new Date("2026-07-19T11:00:00Z"),
      servicioId: "00000000-0000-0000-0000-000000000002",
      servicioNombre: "Decoración integral de eventos",
    },
  ];

  for (const reservaData of reservasEjemplo) {
    const reserva = await prisma.reserva.create({ data: reservaData });
    console.log(
      `  Reserva creada: ${reserva.nombre} — Estado: ${reserva.estado}`
    );
  }

  // -------------------------------------------------------------------------
  // Resumen
  // -------------------------------------------------------------------------
  console.log("\n=========================================");
  console.log("Seed completado con éxito.");
  console.log("=========================================");

  const stats = {
    admins: await prisma.admin.count(),
    servicios: await prisma.servicio.count(),
    bloques: await prisma.bloque.count(),
    reservas: await prisma.reserva.count(),
  };

  console.log(`  Admins:    ${stats.admins}`);
  console.log(`  Servicios: ${stats.servicios}`);
  console.log(`  Bloques:   ${stats.bloques}`);
  console.log(`  Reservas:  ${stats.reservas}`);
  console.log("=========================================\n");
}

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------

main()
  .catch((error) => {
    console.error("Error durante el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
