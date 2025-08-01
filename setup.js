import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting SOTI Clone project setup...');

try {
    // Check if server directory exists
    if (!fs.existsSync('./server')) {
        console.log('❌ server directory does not exist, please ensure the project structure is correct');
        process.exit(1);
    }

    console.log('📦 Installing backend dependencies...');
    execSync('cd server && npm install', { stdio: 'inherit' });

    console.log('✅ Backend dependencies installed');

    console.log('🔧 Checking database file...');
    const dbPath = './server/database.sqlite';
    if (!fs.existsSync(dbPath)) {
        console.log('📝 Database file will be automatically created on first startup');
    } else {
        console.log('✅ Database file already exists');
    }

    console.log('\n�� Setup complete!');
    console.log('\n📋 Startup instructions:');
    console.log('1. Start full development environment: npm run dev:full');
    console.log('2. Or start separately:');
    console.log('   - Backend: npm run server:dev');
    console.log('   - Frontend: npm run dev');
    console.log('\n🌐 Access addresses:');
    console.log('- Frontend: http://localhost:5173');
    console.log('- Backend API: http://localhost:3001');

} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
} 