@echo off
cd /d "%~dp0"

echo Eliminando index.lock si existe...
if exist .git\index.lock del /f /q .git\index.lock
echo Lock eliminado (o no existia).

echo.
echo Ejecutando git add -A...
git add -A
if %errorlevel% neq 0 (
    echo ERROR en git add. Abortando.
    pause
    exit /b 1
)

echo.
echo Ejecutando git commit...
git commit -m "feat: actualizacion general del proyecto - backend, frontend y configuracion

- Refactor de controllers: auth, blocks, calendar, contacto, cursos, notifications, presupuestos, reservations, services, uploads
- Actualizacion de rutas y middleware (auth, errorHandler, notFoundHandler)
- Cambios en servicios: calendar.service, email.service
- Frontend: App.tsx, paginas (Home, About, Contact, Cursos, Reservations, Admin/*), componentes UI y layouts
- Hooks: useAuth, useNotifications, useToast
- Servicios API del cliente actualizados
- Esquema Prisma y migraciones actualizadas
- Configuracion: package.json, vite.config.ts, tsconfig*.json, vercel.json, tailwind, postcss"
if %errorlevel% neq 0 (
    echo ERROR en git commit. Abortando.
    pause
    exit /b 1
)

echo.
echo Ejecutando git push origin main...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR en git push.
    pause
    exit /b 1
)

echo.
echo ===================================
echo  COMMIT Y PUSH COMPLETADOS CON EXITO
echo ===================================
pause
