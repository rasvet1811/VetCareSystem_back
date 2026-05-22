@echo off
echo Instalando dependencias de todos los microservicios...
echo.

cd services\user-management
echo [1/6] user-management...
npm install
cd ..\..

cd services\clinical-history
echo [2/6] clinical-history...
npm install
cd ..\..

cd services\tracking-reminders
echo [3/6] tracking-reminders...
npm install
cd ..\..

cd services\storage-service
echo [4/6] storage-service...
npm install
cd ..\..

cd services\query-visualization
echo [5/6] query-visualization...
npm install
cd ..\..

cd services\notification-service
echo [6/6] notification-service...
npm install
cd ..\..

echo.
echo Listo! Todos los servicios tienen sus dependencias instaladas.
echo.
echo Recuerda copiar .env.example a .env en cada servicio y configurar:
echo   - DATABASE_URL (tu cadena de conexion de Supabase)
echo   - JWT_SECRET (un secreto seguro)
echo.
pause
