# 🚀 Developer Career Simulator (Yazılımcı Kariyer Simülatörü)

React Native ve Expo kullanılarak geliştirilmiş, kaynak yönetimi ve ilerleme (tycoon) mekaniklerine sahip eğlenceli bir mobil simülasyon oyunu. Oyuncular stajyerlikten CTO seviyesine kadar yükselmeye çalışırken enerjilerini, paralarını ve akıl sağlıklarını (burnout) yönetmek zorundadır.

## 🎬 Proje Tanıtım Videosu
https://youtube.com/shorts/eZxpawczAFc?feature=share

## 📦 Oynanabilir APK
Uygulamanın test edilebilir sürümü GitHub Releases üzerinden yayınlanmıştır. Aşağıdaki bağlantıdan doğrudan cihazınıza indirip kurabilirsiniz:

🔗 **İndirme Bağlantısı:** [Developer Career Simulator v1.0.0 APK](https://github.com/Hakan-grsy/Developer_Career_Simulator/releases/latest)

## ✨ Temel Özellikler
* **Kariyer İlerlemesi (Progression):** Stajyer seviyesinden başlayıp deneyim (XP) kazanarak Lead Developer ve CTO seviyelerine kadar yükselme.
* **Dinamik Ekonomi ve Enerji Sistemi:** Her kod yazma işlemi enerji tüketir ve para kazandırır. Seviye arttıkça enerji verimliliği artar.
* **Mağaza (Store) Mekaniği:** Kazanılan paralarla ekipman (Mekanik Klavye, Çift Monitör vb.) alınarak kalıcı güçlendirmeler (buff) elde edilir.
* **Freelance İşler & Risk Yönetimi:** Bionluk üzerinden zorlu görevler alarak yüksek kazanç sağlama.
* **Rastgele Olaylar (Random Events):** %10 ihtimalle tetiklenen iyi (Hackathon kazanma) veya kötü (Production veritabanını silme) olaylarla yüzdelik cezalar/ödüller.
* **Tükenmişlik Sendromu (Burnout):** Enerji ve para tamamen sıfırlanırsa oyun kaybedilir (Game Over).
* **Büyük Final (Win State):** $5000 biriktirilip TÜBİTAK projesi fonlandığında oyun başarıyla tamamlanır.

## 🛠️ Kurulum (Geliştiriciler İçin)

Projeyi bilgisayarınızda yerel olarak çalıştırmak için şu adımları izleyin:

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/Hakan-grsy/Developer_Career_Simulator
   ```
2. Klasöre gidin ve bağımlılıkları yükleyin:
   ```bash
   cd DeveloperCareerSimulator
   npm install
   ```
3. Expo geliştirici sunucusunu başlatın:
   ```bash
   npx expo start
   ```

## 💻 Teknolojiler
* React Native
* Expo
* JavaScript (ES6+)

## ⚠️ Sorun Giderme (Troubleshooting)

**Hata:** Uygulamayı geliştirme ortamında (Debug) açarken kırmızı ekranda `"Unable to load script"` veya `"Make sure you're running Metro"` hatası alıyorsanız:

**Nedeni:** Bu durum uygulamanın çöktüğü anlamına gelmez; test edilen cihazın (veya emülatörün) geliştirici bilgisayarındaki Metro Bundler sunucusuna ağ üzerinden ulaşamadığını gösterir.

**Çözüm Adımları:**
1. Bilgisayarınızın ve test cihazınızın **aynı Wi-Fi ağına** bağlı olduğundan emin olun.
2. Cihazı fiziksel olarak sallayarak (veya emülatörde `Ctrl + M` / `Cmd + M` tuşlarına basarak) **Geliştirici Menüsünü (Dev Menu)** açın.
3. Menüden **Settings** > **Debug server host & port for device** seçeneğine dokunun.
4. Bilgisayarınızın yerel IP adresini ve portunu (Örn: `192.168.1.15:8081`) girip kaydedin.
5. Geliştirici menüsünü tekrar açıp **Reload** seçeneğine tıklayarak uygulamayı başarıyla başlatabilirsiniz.

*(Alternatif olarak, cihaz bilgisayara USB ile bağlıysa terminalde `adb reverse tcp:8081 tcp:8081` komutunu çalıştırarak köprü kurabilirsiniz).*
