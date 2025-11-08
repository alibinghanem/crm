# 🚀 دليل نشر CRM على سيرفر ويندوز

## 📋 المتطلبات الأساسية

### 1. تثبيت Node.js
- **النسخة المطلوبة**: Node.js 18.x أو أحدث
- **رابط التحميل**: https://nodejs.org/
- **التحقق من التثبيت**:
```bash
node --version
npm --version
```

### 2. تثبيت Git (اختياري للتحديثات السريعة)
- **رابط التحميل**: https://git-scm.com/download/win
- **الفائدة**: سحب التحديثات من المستودع بسهولة

### 3. PM2 - مدير العمليات
- **التثبيت**:
```bash
npm install -g pm2
npm install -g pm2-windows-startup
```

### 4. قاعدة البيانات Supabase
- **متطلب**: اتصال بالإنترنت للوصول إلى Supabase
- **البديل**: يمكن تثبيت PostgreSQL محلياً

---

## 🔧 خطوات النشر

### الخطوة 1️⃣: رفع الملفات إلى السيرفر

#### الطريقة الأولى: باستخدام Git (مستحسن)
```bash
# في السيرفر
cd C:\inetpub\
git clone <your-repository-url> crm
cd crm
```

#### الطريقة الثانية: رفع يدوي
- ضغط المشروع كاملاً في ملف ZIP
- رفعه إلى السيرفر (عبر RDP أو FTP)
- فك الضغط في المسار: `C:\inetpub\crm`

---

### الخطوة 2️⃣: تثبيت المكتبات

```bash
cd C:\inetpub\crm
npm install
```

---

### الخطوة 3️⃣: إعداد ملف البيئة `.env.local`

قم بإنشاء ملف `.env.local` في مجلد المشروع:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://your-server-ip:3000
NODE_ENV=production
```

**⚠️ مهم**: استبدل القيم بالمعلومات الفعلية من Supabase

---

### الخطوة 4️⃣: بناء التطبيق للإنتاج

```bash
npm run build
```

**ما يحدث**: يتم إنشاء مجلد `.next` يحتوي على التطبيق المُحسَّن

---

### الخطوة 5️⃣: إعداد PM2 للتشغيل التلقائي

#### 1. إنشاء ملف إعدادات PM2

قم بإنشاء ملف `ecosystem.config.js` في مجلد المشروع:

```javascript
module.exports = {
  apps: [{
    name: 'crm-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: 'C:\\inetpub\\crm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

#### 2. بدء التطبيق باستخدام PM2

```bash
# انتقل إلى مجلد المشروع
cd C:\inetpub\crm

# بدء التطبيق
pm2 start ecosystem.config.js

# حفظ القائمة الحالية
pm2 save

# تفعيل التشغيل التلقائي عند بدء Windows
pm2-startup install
```

#### 3. أوامر PM2 المفيدة

```bash
# عرض حالة التطبيقات
pm2 status

# عرض السجلات (Logs)
pm2 logs crm-app

# إعادة تشغيل التطبيق
pm2 restart crm-app

# إيقاف التطبيق
pm2 stop crm-app

# حذف التطبيق من PM2
pm2 delete crm-app

# مراقبة الأداء
pm2 monit
```

---

## 🔄 عملية التحديث (بدون توقف كامل)

### السيناريو 1: تحديث بسيط (تغيير في الواجهات)

```bash
# 1. انتقل إلى مجلد المشروع
cd C:\inetpub\crm

# 2. سحب التحديثات (إذا كنت تستخدم Git)
git pull origin main

# 3. تثبيت أي مكتبات جديدة
npm install

# 4. بناء التطبيق
npm run build

# 5. إعادة تشغيل التطبيق بسلاسة
pm2 reload crm-app
```

**ملاحظة**: `pm2 reload` يُعيد التشغيل بشكل تدريجي (Zero Downtime)

---

### السيناريو 2: تحديث يدوي (بدون Git)

```bash
# 1. إيقاف التطبيق مؤقتاً
pm2 stop crm-app

# 2. استبدل الملفات المُحدثة يدوياً
# (انسخ الملفات الجديدة فوق القديمة)

# 3. تثبيت المكتبات
npm install

# 4. بناء التطبيق
npm run build

# 5. بدء التطبيق
pm2 start crm-app
```

---

## 🔒 إعدادات الأمان والجدار الناري

### 1. فتح المنفذ (Port) في Windows Firewall

```powershell
# تشغيل PowerShell كمسؤول
New-NetFirewallRule -DisplayName "CRM App - Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 2. إعدادات الأمان

- **تفعيل HTTPS**: استخدم Nginx أو IIS كـ Reverse Proxy
- **تقييد الوصول**: حدد IP addresses المسموح لها
- **نسخ احتياطية**: جدولة نسخ احتياطية لقاعدة البيانات

---

## 🌐 إعداد Reverse Proxy (اختياري - مستحسن)

### لماذا Reverse Proxy?
- تشغيل التطبيق على منفذ 80 (HTTP) أو 443 (HTTPS)
- دعم SSL/TLS
- Load Balancing
- أمان أفضل

### الخيار 1: استخدام IIS (Internet Information Services)

#### تثبيت IIS URL Rewrite و ARR:
1. **IIS URL Rewrite Module**: https://www.iis.net/downloads/microsoft/url-rewrite
2. **Application Request Routing (ARR)**: https://www.iis.net/downloads/microsoft/application-request-routing

#### إعداد IIS:
```xml
<!-- في web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### الخيار 2: استخدام Nginx على Windows

```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 المراقبة والصيانة

### 1. مراقبة PM2

```bash
# مراقبة الأداء في الوقت الفعلي
pm2 monit

# عرض معلومات مفصلة
pm2 info crm-app

# عرض استهلاك الموارد
pm2 list
```

### 2. السجلات (Logs)

```bash
# عرض السجلات مباشرة
pm2 logs crm-app

# عرض آخر 100 سطر
pm2 logs crm-app --lines 100

# مسح السجلات
pm2 flush
```

### 3. تنظيف دوري

```bash
# إزالة الملفات المؤقتة
npm cache clean --force

# إزالة node_modules وإعادة التثبيت (عند المشاكل)
rmdir /s /q node_modules
npm install
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: التطبيق لا يعمل بعد إعادة تشغيل السيرفر
**الحل**:
```bash
pm2 save
pm2 startup
pm2-startup install
```

### المشكلة: خطأ في الاتصال بـ Supabase
**الحل**: تحقق من:
- ملف `.env.local` موجود
- المعلومات صحيحة
- السيرفر يملك اتصال بالإنترنت

### المشكلة: الموقع بطيء
**الحل**:
```bash
# زيادة عدد النسخ (Instances)
pm2 scale crm-app 2

# أو تعديل ecosystem.config.js
# instances: 2  أو  instances: 'max'
```

### المشكلة: نفاد الذاكرة
**الحل**: في `ecosystem.config.js`:
```javascript
max_memory_restart: '2G'  // زيادة الحد الأقصى
```

---

## 📝 قائمة التحقق النهائية

- [ ] Node.js مثبت (v18+)
- [ ] PM2 مثبت ومُفعل
- [ ] ملف `.env.local` مُعد بشكل صحيح
- [ ] التطبيق يعمل: `pm2 status` يظهر "online"
- [ ] التشغيل التلقائي مُفعل: `pm2 startup`
- [ ] Firewall يسمح بالمنفذ 3000
- [ ] النسخ الاحتياطية مجدولة
- [ ] اختبار إعادة تشغيل السيرفر

---

## 📞 الدعم

للمشاكل والاستفسارات:
1. تحقق من السجلات: `pm2 logs crm-app`
2. مراجعة حالة التطبيق: `pm2 info crm-app`
3. إعادة بناء التطبيق: `npm run build`
4. إعادة تشغيل PM2: `pm2 restart crm-app`

---

## 🎯 نصائح للأداء الأفضل

1. **استخدم SSD** للسيرفر
2. **خصص RAM كافية** (2GB+ مستحسن)
3. **فعّل Gzip Compression** في Reverse Proxy
4. **استخدم CDN** للملفات الثابتة (الصور، CSS، JS)
5. **جدولة إعادة التشغيل الأسبوعية**: `pm2 restart crm-app --cron "0 3 * * 0"`
6. **مراقبة الأداء**: استخدم أدوات مثل PM2 Plus (مدفوع) أو New Relic

---

**تم بنجاح! 🎉** التطبيق الآن جاهز للعمل على السيرفر بشكل دائم ومستقر.

