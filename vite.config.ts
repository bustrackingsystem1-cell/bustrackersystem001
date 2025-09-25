import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { networkInterfaces } from 'os';

// Get local IP address
function getLocalIP() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    onListening(server) {
      const localIP = getLocalIP();
      console.log('\n🎨 ===== FRONTEND MAP VIEW STARTED =====');
      console.log('');
      console.log('🎨 Frontend running at:');
      console.log(`   📱 http://localhost:5173`);
      console.log(`   🌍 Access from other devices: http://${localIP}:5173`);
      console.log('');
      console.log('📍 Map Features:');
      console.log('   🗺️  Interactive map with bus markers');
      console.log('   📡 Auto-refresh every 5 seconds');
      console.log('   🛰️  Street & Satellite view toggle');
      console.log('   📊 Real-time bus status & speed');
      console.log('');
      console.log('===============================================\n');
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    __LOCAL_IP__: JSON.stringify(getLocalIP()),
  },
});
