let chartInstance = null; // Variabel untuk menyimpan instance Chart.js

// 1. Fungsi Konversi Input F(X) ke Fungsi JavaScript
function buatFungsi(inputStr) {
    // Mengganti notasi matematika dasar agar bisa dieksekusi JavaScript
    // Contoh: mengganti 'x*x' atau 'x^2'
    let funcBody = inputStr.replace(/\^/g, '**');
    
    // Perbaikan sederhana untuk perkalian implisit (mis: 2x menjadi 2*x)
    // Hati-hati dengan ini, ini adalah penyederhanaan yang kasar!
    funcBody = funcBody.replace(/(\d)x/g, '$1*x');

    try {
        // Menggunakan new Function untuk membuat fungsi dari string
        return new Function('x', 'return ' + funcBody + ';');
    } catch (e) {
        alert("Fungsi tidak valid. Pastikan formatnya benar.");
        return null;
    }
}

// 2. Metode Integral Numerik: Trapezoid Rule
function hitungNumerik(f, a, b, n = 1000) {
    if (a >= b) return 0;
    const h = (b - a) / n;
    let sum = 0.5 * (f(a) + f(b));
    
    for (let i = 1; i < n; i++) {
        sum += f(a + i * h);
    }
    return sum * h;
}

// 3. Fungsi Utama: Hitung dan Gambar
function hitungIntegral() {
    const inputFungsi = document.getElementById('fungsi').value;
    const batasA = parseFloat(document.getElementById('batas_a').value);
    const batasB = parseFloat(document.getElementById('batas_b').value);

    const f = buatFungsi(inputFungsi);
    if (!f) return;

    // A. Hitung Integral Numerik
    const hasil = hitungNumerik(f, batasA, batasB);
    document.getElementById('hasil-numerik').innerHTML = 
        `Nilai Integral Tentu (Perkiraan): <strong>${hasil.toFixed(4)}</strong>`;

    // B. Perbarui Notasi MathJax
    const notasi = `$$\\int_{${batasA}}^{${batasB}} ${inputFungsi} dx = ${hasil.toFixed(4)}$$`;
    document.getElementById('notasi-integral').innerHTML = notasi;
    
    // Meminta MathJax untuk merender ulang notasi baru
    if (window.MathJax) {
        window.MathJax.typeset();
    }
    
    // C. Visualisasi Grafik
    gambarGrafik(f, batasA, batasB);
}


// 4. Visualisasi menggunakan Chart.js
function gambarGrafik(f, a, b) {
    const ctx = document.getElementById('integralChart').getContext('2d');

    // Tentukan rentang plot yang sedikit lebih lebar dari batas integral
    const minX = Math.min(a, b) - 1;
    const maxX = Math.max(a, b) + 1;
    const steps = 100;
    const dataPoints = [];
    const shadingPoints = [];

    // Persiapkan data untuk garis fungsi (f(x))
    for (let i = 0; i <= steps; i++) {
        const x = minX + (maxX - minX) * i / steps;
        const y = f(x);
        dataPoints.push({ x: x, y: y });
        
        // Data untuk area yang diarsir (Integral Tentu)
        if (x >= Math.min(a, b) && x <= Math.max(a, b)) {
            shadingPoints.push({ x: x, y: y });
        }
    }
    // Tambahkan titik nol di batas-batas untuk menutup area arsir
    shadingPoints.unshift({ x: a, y: 0 });
    shadingPoints.push({ x: b, y: 0 });


    // Hancurkan instance Chart sebelumnya jika ada
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Buat Chart baru
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Fungsi f(x)',
                data: dataPoints,
                borderColor: 'rgba(204, 240, 85, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                showLine: true
            }, {
                label: 'Area Integral',
                data: shadingPoints,
                backgroundColor: 'rgba(40, 167, 69, 0.4)', // Hijau muda untuk area
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 0,
                fill: 'origin',
                pointRadius: 0 // Sembunyikan titik
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'x' },
                    min: minX,
                    max: maxX
                },
                y: {
                    title: { display: true, text: 'f(x)' }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}