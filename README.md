# Noventa — Product Catalog (Piton Technology Case)

Bu proje, Piton Technology “Frontend Ürün Katalog Projesi” değerlendirme kapsamında geliştirilmiştir.  
Uygulama; kullanıcı kayıt/giriş akışı, ürün listeleme, ürün detay ve favoriler akışlarını içerir.

##  Özellikler

### Kimlik Doğrulama (Auth)
- Login / Register ekranları
- Validasyonlar (e-mail, şifre, ad-soyad, telefon)
- Telefon maskeleme: `+90(505) 888-88-88`
- “Beni Hatırla” seçeneği (token’ı localStorage’da saklar)
- Register sonrası yönlendirme, uygulama yeniden açıldığında tekrar login ekranı ile karşılaşma davranışı

### Ürünler
- Ürün listeleme (API veya mock fallback)
- Arama, kategori filtresi, fiyat sıralama
- Ürün kartlarından favoriye ekleme / çıkarma + küçük kullanıcı bildirimi (toast)
- Ürün detaya geçiş

### Ürün Detay
- Ürün bilgileri
- Favoriye ekle / çıkar

### Favoriler
- Favori ürünleri listeleme
- Favori yokken “empty state” ekranı

## Teknolojiler
- **Next.js (App Router)**
- **TypeScript**
- **Redux Toolkit**
- **Tailwind CSS**

##  API Entegrasyonu
Auth ve ürün verisi için aşağıdaki base API kullanılmıştır:
- `https://store-api-dev.piton.com.tr`

Not: Ürün endpoint’i hata döndüğü durumlarda kullanıcı deneyimini bozmamak adına **mock verilerle fallback** çalışır.

## 🚀 Kurulum

```bash
npm install
npm run dev
Uygulama varsayılan olarak: http://localhost:3000

⚙️ Environment

Projede .env.example örnek dosyası bulunmaktadır. Gerekli değişkenler:

API base URL (projeye göre)

🧪 Kullanım Akışı (Önerilen)

/auth ekranından register veya login olun.

Login sonrası /products sayfasına yönlendirilirsiniz.

Ürünlerden favorilere ekleyebilir, detay sayfasına geçebilirsiniz.

Favoriler sayfasında favori listenizi görüntüleyebilir ve favorilerinizden çıkarabilirsiniz.


## 📸 Ekran Görüntüleri

### Auth
![Auth](./docs/screenshots/auth.png)

### Register
![Register](./docs/screenshots/auth-register.png)

### Products
![Products](./docs/screenshots/products.png)

### Product Detail
![Product Detail](./docs/screenshots/product-detail.png)

### Favorites
![Favorites](./docs/screenshots/favorites.png)


📌 Notlar

Token yönetimi sessionStorage/localStorage üzerinden yapılır.

Protected sayfalar (products, favorites, detail) auth kontrolü ile korunur.

İyi çalışmalar.
Görkem Sakartepe