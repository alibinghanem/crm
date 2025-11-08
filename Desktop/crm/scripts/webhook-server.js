// ====================================
// خادم Webhook للتحديث التلقائي
// ====================================

const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

// إعدادات
const PORT = 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here'; // غيّر هذا!
const PROJECT_PATH = 'C:\\inetpub\\crm';

// دالة للتحقق من التوقيع (للأمان)
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// دالة التحديث
function updateApp() {
  console.log('🔄 بدء التحديث...');
  
  try {
    // الانتقال إلى مجلد المشروع
    process.chdir(PROJECT_PATH);
    console.log('✅ انتقل إلى:', PROJECT_PATH);
    
    // سحب التحديثات من Git
    console.log('📥 سحب التحديثات من Git...');
    execSync('git pull origin main', { stdio: 'inherit' });
    
    // تثبيت المكتبات
    console.log('📦 تحديث المكتبات...');
    execSync('npm install', { stdio: 'inherit' });
    
    // بناء التطبيق
    console.log('🔨 بناء التطبيق...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // إعادة تشغيل PM2
    console.log('🔄 إعادة تشغيل التطبيق...');
    execSync('pm2 reload crm-app', { stdio: 'inherit' });
    
    console.log('✅ تم التحديث بنجاح!');
    return true;
  } catch (error) {
    console.error('❌ خطأ في التحديث:', error.message);
    return false;
  }
}

// إنشاء الخادم
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('\n🔔 تم استقبال webhook');
      console.log('⏰ الوقت:', new Date().toLocaleString('ar-SA'));
      
      // يمكنك تفعيل التحقق من التوقيع للأمان
      // const signature = req.headers['x-hub-signature-256'];
      // if (signature && !verifySignature(body, signature)) {
      //   res.writeHead(401);
      //   res.end('Unauthorized');
      //   return;
      // }
      
      // تشغيل التحديث
      const success = updateApp();
      
      if (success) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'success', 
          message: 'تم التحديث بنجاح',
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error', 
          message: 'فشل التحديث',
          timestamp: new Date().toISOString()
        }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           🎯 خادم Webhook للتحديث التلقائي               ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 الخادم يعمل على المنفذ: ${PORT}`);
  console.log(`📡 عنوان Webhook: http://localhost:${PORT}/webhook`);
  console.log('');
  console.log('⏳ في انتظار التحديثات...');
  console.log('');
});

// معالجة إيقاف الخادم
process.on('SIGINT', () => {
  console.log('\n\n👋 إيقاف خادم Webhook...');
  server.close();
  process.exit(0);
});

