# ====================================
# سكريبت النشر الأولي
# ====================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   بدء نشر تطبيق CRM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. التحقق من Node.js
Write-Host "🔍 التحقق من Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js مثبت - الإصدار: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت!" -ForegroundColor Red
    Write-Host "الرجاء تحميله من: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. التحقق من PM2
Write-Host ""
Write-Host "🔍 التحقق من PM2..." -ForegroundColor Yellow
try {
    $pm2Version = pm2 --version
    Write-Host "✅ PM2 مثبت - الإصدار: $pm2Version" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PM2 غير مثبت. جاري التثبيت..." -ForegroundColor Yellow
    npm install -g pm2
    npm install -g pm2-windows-startup
    Write-Host "✅ تم تثبيت PM2 بنجاح" -ForegroundColor Green
}

# 3. تثبيت المكتبات
Write-Host ""
Write-Host "📦 تثبيت المكتبات..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل تثبيت المكتبات!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم تثبيت المكتبات بنجاح" -ForegroundColor Green

# 4. التحقق من ملف البيئة
Write-Host ""
Write-Host "🔍 التحقق من ملف البيئة..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ ملف .env.local موجود" -ForegroundColor Green
} else {
    Write-Host "⚠️  ملف .env.local غير موجود!" -ForegroundColor Yellow
    Write-Host "الرجاء إنشاء الملف وإضافة المتغيرات المطلوبة:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "هل تريد المتابعة بدون ملف البيئة؟ (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# 5. بناء التطبيق
Write-Host ""
Write-Host "🔨 بناء التطبيق للإنتاج..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل بناء التطبيق!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم بناء التطبيق بنجاح" -ForegroundColor Green

# 6. إنشاء مجلد السجلات
Write-Host ""
Write-Host "📁 إنشاء مجلد السجلات..." -ForegroundColor Yellow
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "✅ تم إنشاء مجلد logs" -ForegroundColor Green
} else {
    Write-Host "✅ مجلد logs موجود بالفعل" -ForegroundColor Green
}

# 7. بدء التطبيق باستخدام PM2
Write-Host ""
Write-Host "🚀 بدء التطبيق..." -ForegroundColor Yellow
pm2 delete crm-app 2>$null
pm2 start ecosystem.config.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل بدء التطبيق!" -ForegroundColor Red
    exit 1
}

# 8. حفظ قائمة PM2
Write-Host ""
Write-Host "💾 حفظ إعدادات PM2..." -ForegroundColor Yellow
pm2 save --force

# 9. تفعيل التشغيل التلقائي
Write-Host ""
Write-Host "⚙️  تفعيل التشغيل التلقائي عند بدء Windows..." -ForegroundColor Yellow
pm2-startup install

# 10. فتح المنفذ في Firewall
Write-Host ""
Write-Host "🔓 فتح المنفذ 3000 في Firewall..." -ForegroundColor Yellow
try {
    $existingRule = Get-NetFirewallRule -DisplayName "CRM App - Port 3000" -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "✅ قاعدة Firewall موجودة بالفعل" -ForegroundColor Green
    } else {
        New-NetFirewallRule -DisplayName "CRM App - Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow | Out-Null
        Write-Host "✅ تم فتح المنفذ 3000 في Firewall" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  فشل فتح المنفذ (قد يتطلب صلاحيات المسؤول)" -ForegroundColor Yellow
}

# 11. عرض حالة التطبيق
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   حالة التطبيق" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ تم النشر بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 التطبيق يعمل على: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 أوامر مفيدة:" -ForegroundColor Yellow
Write-Host "  - عرض الحالة:        pm2 status" -ForegroundColor White
Write-Host "  - عرض السجلات:       pm2 logs crm-app" -ForegroundColor White
Write-Host "  - إعادة التشغيل:      pm2 restart crm-app" -ForegroundColor White
Write-Host "  - إيقاف التطبيق:      pm2 stop crm-app" -ForegroundColor White
Write-Host "  - مراقبة الأداء:      pm2 monit" -ForegroundColor White
Write-Host ""

