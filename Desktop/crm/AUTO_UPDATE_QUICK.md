# 🔄 التحديث التلقائي - سريع

## اختر طريقة واحدة:

---

## 1️⃣ الأسهل: اختصار سطح المكتب 🖱️

### ما تحتاجه:
- ملف `تحديث_CRM.bat` موجود

### الخطوات:
1. انقر مرتين على `تحديث_CRM.bat`
2. انتهى! ✅

**متى تستخدمه:** بعد أي تعديل على الكود

---

## 2️⃣ الأسرع: Webhook 🚀

### الإعداد (مرة واحدة):
```powershell
cd C:\inetpub\crm

# بدء Webhook
pm2 start ecosystem.webhook.config.js
pm2 save

# فتح المنفذ
New-NetFirewallRule -DisplayName "Webhook - Port 9000" -Direction Inbound -Protocol TCP -LocalPort 9000 -Action Allow
```

### على GitHub:
Settings > Webhooks > Add webhook:
- URL: `http://YOUR-IP:9000/webhook`
- Content type: `application/json`

### النتيجة:
✅ **Push على Git = تحديث تلقائي فوري!**

---

## 3️⃣ الأوتوماتيكي: جدولة ⏰

### في Task Scheduler:
```
Name: تحديث CRM
Trigger: كل ساعة (أو يومياً)
Action: powershell.exe
Arguments: -File "C:\inetpub\crm\scripts\scheduled-update.ps1"
```

### النتيجة:
✅ **تحقق تلقائي من التحديثات كل فترة**

---

## 4️⃣ الاحترافي: GitHub Actions 🌟

### الإعداد:
1. الملف `.github/workflows/deploy.yml` موجود
2. أضف Secrets في GitHub:
   - `SERVER_HOST`
   - `SERVER_USERNAME`
   - `SERVER_PASSWORD`

### النتيجة:
✅ **Push على GitHub = تحديث تلقائي آمن!**

---

## أوامر سريعة:

```bash
npm run update:auto        # تحديث كامل بأمر واحد
npm run webhook:start      # بدء Webhook
npm run webhook:logs       # سجل Webhook
pm2 logs crm-webhook       # متابعة Webhook
```

---

## 🎯 التوصية:

- **للبداية**: استخدم `تحديث_CRM.bat`
- **للاحتراف**: استخدم **Webhook**
- **للأمان**: استخدم **GitHub Actions**

---

**اختر وطبّق! 🚀**

