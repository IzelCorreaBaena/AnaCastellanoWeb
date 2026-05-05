# Instrucciones para Solucionar el Problema de Imágenes Múltiples en Servicios

## Problema Actual
Las imágenes múltiples no se guardan correctamente en la base de datos porque el campo `imagenes` no existe físicamente en la tabla `servicios`.

## Solución: Aplicar Migración de Base de Datos

### Paso 1: Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:
```
POSTGRES_PRISMA_URL="postgresql://usuario:password@localhost:5432/nombre_db"
POSTGRES_URL_NON_POOLING="postgresql://usuario:password@localhost:5432/nombre_db"
```

### Paso 2: Aplicar Migración
```bash
npx prisma migrate dev --name add_images_to_services
```

### Paso 3: Generar Client de Prisma
```bash
npx prisma generate
```

### Paso 4: Reiniciar Servidor
```bash
npm run server
```

## Verificación
Después de aplicar la migración:

1. **Verificar campo en base de datos:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'servicios' AND column_name = 'imagenes';
   ```

2. **Probar en frontend:**
   - Subir múltiples imágenes en un servicio
   - Verificar que todas se muestren en la galería
   - Confirmar que la primera sea la imagen principal

## Estado Actual del Código
- ✅ Frontend modificado para usar ImageUploader
- ✅ Backend actualizado para aceptar campo `imagenes`
- ✅ Typescript actualizado
- ⏳ Esperando migración de base de datos

## Nota Importante
Mientras no se aplique la migración, el sistema funcionará con la primera imagen del array como imagen principal, pero solo se guardará una imagen en la base de datos.
