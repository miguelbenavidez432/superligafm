# 📋 Configuración de Transferibles en Discord - Guía Hostinger

## 🎯 Resumen de lo que hicimos

Creamos un **Command de Laravel** que cada 3 horas busca todos los jugadores con status `transferible` y envía una lista formateada a Discord.

## ⚙️ Pasos de configuración

### 1️⃣ Crear el Webhook en Discord

1. Ve a tu **servidor de Discord**
2. Haz clic derecho en el **canal** donde quieres recibir la lista
3. Selecciona **Editar canal**
4. Ve a **Integraciones** → **Webhooks**
5. Crea un nuevo webhook
6. Copia la URL del webhook (se parece a esto):
   ```
   https://discord.com/api/webhooks/1234567890/abcdefghijklmnop
   ```

### 2️⃣ Configurar variables de entorno

Abre tu archivo `.env` en la raíz del proyecto y agrega:

```env
# Si tienes un webhook específico para transferibles
DISCORD_WEBHOOK_TRANSFERIBLES=https://discord.com/api/webhooks/1234567890/abcdefghijklmnop

# Si no tienes webhook secreto, déjalo vacío
DISCORD_WEBHOOK_SECRET=
```

Alternativa: Si prefieres reutilizar un webhook existente, puedes usar:
```env
DISCORD_WEBHOOK_TRANSFERIBLES=${DISCORD_WEBHOOK_URL}
```

### 3️⃣ Prueba el comando localmente

Antes de configurar el cron, prueba que funcione:

```bash
# En tu servidor local o a través de SSH en Hostinger
php artisan transferibles:send-discord
```

Si ves un mensaje como `✅ Lista de transferibles enviada a Discord correctamente`, ¡funciona!

---

## 🚀 Configurar en Hostinger

### Opción A: Usando Cron Jobs en Hostinger (RECOMENDADO)

1. **Accede al Panel de Control de Hostinger**
2. Ve a **Advanced** → **Cron Jobs**
3. **Haz clic en "Add Cron Job"**

4. **Configura así:**
   - **Interval:** Cada 3 horas (usa minutos: `0 */3 * * *`)
   - **Command:**
     ```
     cd /home/tuusuario/public_html && php artisan schedule:run > /dev/null 2>&1
     ```
     
     *Nota: Reemplaza `tuusuario` con tu usuario de Hostinger y ajusta la ruta si es necesario*

5. **Haz clic en Save**

### Opción B: Ejecutar directamente el comando cada 3 horas

Si prefieres ejecutar solo nuestro comando cada 3 horas sin depender del schedule:

```
0 */3 * * * cd /home/tuusuario/public_html && php artisan transferibles:send-discord >> /dev/null 2>&1
```

---

## 📝 Configuración alternativa: Comando específico

Si quieres que se ejecute **en horarios específicos** en lugar de cada 3 horas, puedes modificar el `Kernel.php`:

```php
// En lugar de everyThreeHours(), usa:
$schedule->command('transferibles:send-discord')
    ->at('00:00')  // Medianoche
    ->timezone('America/Argentina/Buenos_Aires');

$schedule->command('transferibles:send-discord')
    ->at('03:00')  // 3 AM
    ->timezone('America/Argentina/Buenos_Aires');

$schedule->command('transferibles:send-discord')
    ->at('06:00')  // 6 AM
    ->timezone('America/Argentina/Buenos_Aires');

// ... y así sucesivamente cada 3 horas
```

---

## 🔍 Verificar que funciona

### En Hostinger:

1. **Espera el próximo intervalo de 3 horas**
2. **Revisa tu canal de Discord** - debe aparecer la lista

### Para verificar que el cron está activo:

1. En el panel de Hostinger, ve a **Cron Jobs**
2. Verifica que tu comando esté listado
3. Si hay errores, Hostinger te enviará un email

---

## 📊 Ejemplo del mensaje en Discord

```
📋 **LISTA DE JUGADORES TRANSFERIBLES** 📋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 Actualizado: **12/05/2026 15:30** (Cada 3 horas)
👥 Total: **45 jugadores**

⚽ **River Plate** (8 jugadores)
```
  1. Messi                     | CA:97 | PA:96 | $100M
  2. De Paul                   | CA:89 | PA:88 | $75.5M
...

```

---

## 🐛 Troubleshooting

### El comando no se ejecuta
- ✅ Verifica que el cron job esté **activo** en Hostinger
- ✅ Comprueba la ruta del archivo en el comando cron
- ✅ Revisa los logs: `/home/tuusuario/public_html/storage/logs/`

### No aparece el mensaje en Discord
- ✅ Verifica que la URL del webhook sea correcta
- ✅ El webhook no debe tener `"` o caracteres especiales sin escapar
- ✅ Revisa que el bot tenga permisos de escribir en el canal

### Encuentra los errores en los logs
```bash
# En SSH
tail -f storage/logs/laravel.log
```

---

## 🔐 Seguridad

- El webhook de Discord debería estar en el `.env` como variable de entorno
- Nunca commits la URL del webhook en el repositorio
- Agrega `.env` al `.gitignore` si no está ya

---

## 📌 Próximas mejoras

Cuando tengas funcionando esto, puedes agregar:

✨ **Filtrar solo jugadores de Primera División**
✨ **Mostrar emoji según la posición (GK, DEF, MID, FWD)**
✨ **Agregar trending (quién sube/baja en valor)**
✨ **Mencionar usuarios de Discord interesados**

¿Necesitas ayuda con alguno de estos pasos? 🚀
