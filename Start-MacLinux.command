#!/bin/bash
cd "$(dirname "$0")"

echo "=============================================================="
echo "Menjalankan LocalPic Converter secara lokal..."
echo "=============================================================="
echo "Pastikan Anda sudah menginstall Node.js di PC/Mac ini."
echo "(https://nodejs.org/)"
echo ""
echo "Menginstall dependencies jika belum ada..."
npm install --no-audit --no-fund
echo ""
echo "Membuka aplikasi di browser Anda..."
npm run dev -- --open
