# ====================================
# سكريبت التحديث
# ====================================

param(
    [switch]$WithGit = $false,
    [switch]$NoDowntime = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   تحديث تطبيق CRM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. سحب التحديثات من Git (إذا كان مفعل)
if ($WithGit) {
    Write-Host "📥 سحب التحديثات من Git..." -ForegroundColor Yellow
    try {
        git pull origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ فشل سحب التحديثات من Git!" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ تم سحب التحديثات بنجاح" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Git غير مثبت أو المستودع غير مُعد" -ForegroundColor Yellow
        $continue = Read-Host "هل تريد المتابعة؟ (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
    Write-Host ""
}

# 2. تثبيت/تحديث المكتبات
Write-Host "📦 تحديث المكتبات..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل تحديث المكتبات!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم تحديث المكتبات بنجاح" -ForegroundColor Green
Write-Host ""

# 3. بناء التطبيق
Write-Host "🔨 بناء التطبيق الجديد..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل بناء التطبيق!" -ForegroundColor Red
    Write-Host "التطبيق القديم لا يزال يعمل" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ تم بناء التطبيق بنجاح" -ForegroundColor Green
Write-Host ""

# 4. إعادة تشغيل التطبيق
Write-Host "🔄 إعادة تشغيل التطبيق..." -ForegroundColor Yellow

if ($NoDowntime) {
    # إعادة تشغيل تدريجية (Zero Downtime)
    Write-Host "   استخدام وضع إعادة التشغيل التدريجي..." -ForegroundColor Cyan
    pm2 reload crm-app
} else {
    # إعادة تشغيل عادية
    pm2 restart crm-app
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل إعادة تشغيل التطبيق!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ تم إعادة تشغيل التطبيق بنجاح" -ForegroundColor Green
Write-Host ""

# 5. عرض حالة التطبيق
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   حالة التطبيق بعد التحديث" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
pm2 status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ تم التحديث بنجاح!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 6. عرض آخر 20 سطر من السجلات للتأكد من عدم وجود أخطاء
Write-Host "📋 آخر السجلات:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
pm2 logs crm-app --lines 20 --nostream
Write-Host ""

