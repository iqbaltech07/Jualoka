# Product Performance Tracking System PRD

## 1. Overview

Product Performance Tracking System adalah sistem yang menganalisis
performa penjualan produk UMKM berdasarkan data transaksi dalam periode
tertentu. Sistem ini mengklasifikasikan produk menjadi beberapa kategori
performa untuk membantu pemilik usaha mengambil keputusan terkait menu
atau produk yang dijual.

Tujuan utama sistem ini adalah: - Memberikan insight sederhana kepada
UMKM tentang performa produk - Membantu menentukan produk yang harus
dipromosikan, dipertahankan, atau dihapus - Memberikan analisis otomatis
tanpa mempersulit pengguna

------------------------------------------------------------------------

# 2. Goals

## Business Goals

-   Membantu UMKM mengetahui produk yang paling diminati
-   Menghindari penumpukan stok pada produk yang tidak laku
-   Membantu UMKM meningkatkan penjualan dengan insight sederhana

## User Goals

Pemilik UMKM dapat: - Melihat produk mana yang **laris** - Mengetahui
produk yang **penjualannya stabil** - Mengetahui produk yang **kurang
laku** - Mengetahui produk yang **tidak layak dijual**

------------------------------------------------------------------------

# 3. System Scope

Sistem tracking akan: - Mengumpulkan data penjualan dari transaksi -
Menghitung total penjualan produk dalam periode tertentu -
Mengklasifikasikan performa produk - Menampilkan status performa pada
dashboard admin

Periode analisis default: - **30 hari terakhir**

------------------------------------------------------------------------

# 4. Data Source

Data yang digunakan berasal dari tabel transaksi.

## Order

  Field       Type
  ----------- ----------
  id          string
  createdAt   datetime

## OrderItem

  Field       Type
  ----------- ----------
  id          string
  orderId     string
  productId   string
  quantity    number
  createdAt   datetime

## Product

  Field   Type
  ------- --------
  id      string
  name    string
  price   number

------------------------------------------------------------------------

# 5. Tracking Logic

Sistem akan menghitung total penjualan produk dalam periode tertentu.

### Formula

    total_sold = SUM(quantity)

Dengan kondisi:

    createdAt >= (today - 30 days)

------------------------------------------------------------------------

# 6. Product Performance Classification

Setelah total penjualan dihitung, sistem akan menentukan status produk.

  Total Terjual (30 Hari)   Status        Deskripsi
  ------------------------- ------------- ------------------------
  ≥ 30                      Laris         Produk sangat diminati
  10 -- 29                  Stabil        Produk cukup diminati
  1 -- 9                    Kurang Laku   Produk jarang dibeli
  0                         Tidak Layak   Tidak ada penjualan

------------------------------------------------------------------------

# 7. System Flow

Proses tracking performa produk:

    User melakukan pembelian
            ↓
    Data transaksi disimpan
            ↓
    Sistem menghitung total penjualan produk
            ↓
    Sistem menentukan status performa produk
            ↓
    Status produk ditampilkan di dashboard admin

------------------------------------------------------------------------

# 8. Dashboard Display

Pada halaman admin, setiap produk akan menampilkan status performa.

Contoh tampilan:

  Produk        Terjual (30 Hari)   Status
  ------------- ------------------- ----------------
  Nasi Goreng   45                  🔥 Laris
  Mie Ayam      17                  🟢 Stabil
  Ayam Geprek   5                   🟡 Kurang Laku
  Jus Mangga    0                   ❌ Tidak Layak

Status ditampilkan dalam bentuk **badge** pada tabel produk.

------------------------------------------------------------------------

# 9. Automated Insight (Optional Enhancement)

Sistem dapat memberikan rekomendasi otomatis kepada pemilik UMKM.

Contoh insight:

-   Produk **Ayam Geprek** kurang laku dalam 30 hari terakhir
-   Pertimbangkan untuk:
    -   Menambahkan promo
    -   Mengubah harga
    -   Menghapus produk dari menu

------------------------------------------------------------------------

# 10. Update Frequency

Perhitungan performa produk dapat dilakukan dengan dua metode:

### Real-time

Dihitung setiap kali admin membuka dashboard.

### Scheduled Job (Recommended)

Dihitung otomatis setiap hari menggunakan background job.

------------------------------------------------------------------------

# 11. Performance Consideration

Untuk menjaga performa sistem: - Query analitik hanya mengambil data
**30 hari terakhir** - Index database digunakan pada: - `productId` -
`createdAt`

------------------------------------------------------------------------

# 12. Future Improvements

Pengembangan sistem tracking di masa depan dapat mencakup:

## Trend Analysis

Membandingkan penjualan antar periode.

Contoh: - 7 hari terakhir vs 7 hari sebelumnya

## Top Product Ranking

Menampilkan produk terlaris.

## Revenue Tracking

Menampilkan produk dengan pendapatan terbesar.

------------------------------------------------------------------------

# 13. Summary

Product Performance Tracking System memberikan analisis sederhana kepada
UMKM untuk memahami performa produk mereka berdasarkan data penjualan.

Dengan sistem ini, pemilik usaha dapat: - Mengetahui produk yang paling
diminati - Mengidentifikasi produk yang kurang laku - Mengambil
keputusan bisnis yang lebih tepat
