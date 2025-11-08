# ====================================
# سكريبت التحديث المجدول
# يمكن جدولته عبر Task Scheduler
# ====================================

$ErrorActionPreference = "Continue"
$LogFile = "logs\scheduled-updates.log"

# دالة للطباعة مع السجل
function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "=========================================="
Write-Log "بدء فحص التحديثات"
Write-Log "=========================================="

try {
    # الانتقال لمجلد المشروع
    cd C:\inetpub\crm
    Write-Log "✅ انتقل إلى مجلد المشروع"
    
    # فحص التحديثات من Git
    Write-Log "🔍 فحص التحديثات من Git..."
    git fetch origin main
    
    $LocalCommit = git rev-parse HEAD
    $RemoteCommit = git rev-parse origin/main
    
    if ($LocalCommit -eq $RemoteCommit) {
        Write-Log "✅ لا توجد تحديثات جديدة"
        Write-Log "=========================================="
        exit 0
    }
    
    Write-Log "🆕 توجد تحديثات جديدة!"
    Write-Log "   Local:  $LocalCommit"
    Write-Log "   Remote: $RemoteCommit"
    
    # سحب التحديثات
    Write-Log "📥 سحب التحديثات..."
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        throw "فشل سحب التحديثات من Git"
    }
    Write-Log "✅ تم سحب التحديثات"
    
    # تثبيت المكتبات
    Write-Log "📦 تحديث المكتبات..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "فشل تثبيت المكتبات"
    }
    Write-Log "✅ تم تحديث المكتبات"
    
    # بناء التطبيق
    Write-Log "🔨 بناء التطبيق..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "فشل بناء التطبيق"
    }
    Write-Log "✅ تم بناء التطبيق"
    
    # إعادة تشغيل PM2
    Write-Log "🔄 إعادة تشغيل التطبيق..."
    pm2 reload crm-app
    if ($LASTEXITCODE -ne 0) {
        throw "فشل إعادة تشغيل التطبيق"
    }
    Write-Log "✅ تم إعادة تشغيل التطبيق بنجاح"
    
    Write-Log "=========================================="
    Write-Log "✅ اكتمل التحديث بنجاح!"
    Write-Log "=========================================="
    
} catch {
    Write-Log "=========================================="
    Write-Log "❌ خطأ: $_"
    Write-Log "=========================================="
    exit 1
}

