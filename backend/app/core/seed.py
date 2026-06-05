"""
Seed script to populate the database with initial mock data.
Matches the luxury navy-gold theme and Gölbaşı context in Turkish.
"""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.project import ArchitectureProject, ProjectCategory, ProjectStatus
from app.models.real_estate import RealEstateListing, ListingType, PropertyType
from app.models.content import AutomatedNews, Announcement, Event, NewsSource
from app.models.contact import NewsletterSubscriber, SmsSubscriber
from app.models.user import User, UserRole
from app.models.settings import SiteSetting
from app.core.security import hash_password

logger = logging.getLogger(__name__)


async def seed_database(session: AsyncSession) -> None:
    """Populate database with seed data if tables are empty."""
    # ── SITE SETTINGS (Seed independently) ───────────────────────────
    settings_check = await session.execute(select(SiteSetting).limit(1))
    if not settings_check.scalars().first():
        logger.info("Seeding Site Settings...")
        default_settings = [
            SiteSetting(key="site_title", value="YAZE PROJE", group="general", is_public=True, description="Sitenin ana başlığı (Logoda ve sekmede gösterilir)"),
            SiteSetting(key="logo_url", value="/images/logo.jpg?v=3", group="general", is_public=True, description="Logo görsel adresi"),
            SiteSetting(key="footer_text", value="© 2026 YAZE PROJE. Tüm Hakları Saklıdır.", group="general", is_public=True, description="Footer alt telif hakkı yazısı"),
            SiteSetting(key="contact_email", value="info@yazeproje.com", group="general", is_public=True, description="İrtibat E-posta Adresi"),
            SiteSetting(key="contact_phone", value="0312 444 0 999", group="general", is_public=True, description="İletişim Telefon Numarası"),
            SiteSetting(key="contact_address", value="Bahçelievler Mah. Cumhuriyet Cad., Gölbaşı / Ankara", group="general", is_public=True, description="Merkez Ofis Adresi"),
            SiteSetting(key="social_facebook", value="https://facebook.com", group="general", is_public=True, description="Facebook Sayfa Linki"),
            SiteSetting(key="social_instagram", value="https://instagram.com/yazeproje", group="general", is_public=True, description="Instagram Sayfa Linki"),
            SiteSetting(key="social_twitter", value="https://x.com/yazeproje", group="general", is_public=True, description="Twitter (X) Sayfa Linki"),
            SiteSetting(key="social_youtube", value="https://youtube.com", group="general", is_public=True, description="YouTube Kanal Linki"),
            SiteSetting(key="social_linkedin", value="https://linkedin.com", group="general", is_public=True, description="LinkedIn Sayfa Linki"),
            
            SiteSetting(key="hero_title", value="Gölbaşı'nda Yatırımın ve Estetiğin Buluştuğu Nokta", group="hero", is_public=True, description="Giriş Bölümü (Hero) Ana Başlığı"),
            SiteSetting(key="hero_subtitle", value="İleri teknoloji emlak tarama robotları ve modern mimari projelerle, geleceği şekillendiriyoruz.", group="hero", is_public=True, description="Giriş Bölümü Alt Başlığı"),
            SiteSetting(key="hero_bg_image", value="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80", group="hero", is_public=True, description="Giriş Bölümü Arka Plan Görseli"),
            SiteSetting(key="hero_cta_text_1", value="Projelerimiz", group="hero", is_public=True, description="Birincil Buton Yazısı"),
            SiteSetting(key="hero_cta_link_1", value="/projects", group="hero", is_public=True, description="Birincil Buton Bağlantısı"),
            SiteSetting(key="hero_cta_text_2", value="Gayrimenkul Portföyü", group="hero", is_public=True, description="İkincil Buton Yazısı"),
            SiteSetting(key="hero_cta_link_2", value="/listings", group="hero", is_public=True, description="İkincil Buton Bağlantısı"),
            
            SiteSetting(key="about_badge", value="Kurumsal", group="about", is_public=True, description="Hakkımızda Üst Küçük Etiket"),
            SiteSetting(key="about_title", value="Geleceği Şekillendiren Projeler, Güvenle Atılan İmzalar", group="about", is_public=True, description="Hakkımızda Bölüm Başlığı"),
            SiteSetting(key="about_paragraph_1", value="Yazeproje, kuruluşundan bu yana mühendislik, mimari ve proje yönetimi alanlarında yenilikçi, sürdürülebilir ve yüksek katma değerli çözümler sunmak amacıyla yola çıkmıştır. Sektördeki gelişmeleri yakından takip eden, dinamik ve uzman kadromuzla; ham bir fikri, estetik ve fonksiyonellikle harmanlayarak hayata geçiriyoruz.", group="about", is_public=True, description="Hakkımızda 1. Paragraf"),
            SiteSetting(key="about_paragraph_2", value="Biz sadece projeler tasarlamıyor; modern yaşamın gereksinimlerine uygun, çevreye saygılı ve kalıcı yaşam alanlarının temellerini atıyoruz. Doğru analiz, titiz planlama ve zamanında teslim ilkelerimizle, iş ortaklarımızın ve müşterilerimizin güvenini en büyük sermayemiz olarak görüyoruz. Teknolojinin gücünü mühendislik etiğiyle birleştirerek, sektörde standartları belirleyen bir marka olma yolunda kararlılıkla ilerliyoruz.", group="about", is_public=True, description="Hakkımızda 2. Paragraf"),
            SiteSetting(key="about_image", value="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", group="about", is_public=True, description="Hakkımızda Sağ Görsel Linki"),
            SiteSetting(key="about_office_badge", value="Merkez Ofisimiz", group="about", is_public=True, description="Hakkımızda Adres Balonu Küçük Başlık"),
            SiteSetting(key="about_office_address", value="Bahçelievler Mah. Cumhuriyet Cad., Gölbaşı / Ankara", group="about", is_public=True, description="Hakkımızda Adres Balonu Metni"),
            
            SiteSetting(key="mission_title", value="Misyonumuz", group="mission_vision", is_public=True, description="Misyon Başlığı"),
            SiteSetting(key="mission_badge", value="Biz Ne Yapıyoruz?", group="mission_vision", is_public=True, description="Misyon Altındaki Küçük Yazı"),
            SiteSetting(key="mission_desc", value="Mühendislik ve proje tasarımı alanında; uluslararası standartlarda, inovatif, güvenli ve çevre dostu çözümler üreterek topluma ve iş ortaklarımıza maksimum değer sağlamaktır. Müşteri odaklı yaklaşımımızla, her projede estetik ve tekniği en üst düzeyde buluşturmayı ve sürdürülebilir bir geleceğe katkıda bulunmayı görev ediniyoruz.", group="mission_vision", is_public=True, description="Misyon Açıklaması"),
            SiteSetting(key="mission_icon", value="Target", group="mission_vision", is_public=True, description="Misyon İkon Adı (Lucide)"),
            SiteSetting(key="vision_title", value="Vizyonumuz", group="mission_vision", is_public=True, description="Vizyon Başlığı"),
            SiteSetting(key="vision_badge", value="Nereye Ulaşmak İstiyoruz?", group="mission_vision", is_public=True, description="Vizyon Altındaki Küçük Yazı"),
            SiteSetting(key="vision_desc", value="Yenilikçi teknolojileri ve modern mühendislik çözümlerini ilk uygulayan öncülerden biri olarak; kalitemizle ulusal ve uluslararası düzeyde parmakla gösterilen, sektörün en güvenilir ve en saygın proje partneri olmaktır. Future-proof (geleceğe hazır) projelerimizle, yarının dünyasını bugünden inşa etmeyi hedefliyoruz.", group="mission_vision", is_public=True, description="Vizyon Açıklaması"),
            SiteSetting(key="vision_icon", value="Eye", group="mission_vision", is_public=True, description="Vizyon İkon Adı (Lucide)"),
            
            SiteSetting(key="quality_badge", value="İlkelerimiz", group="quality_policy", is_public=True, description="Kalite Politikası Küçük Etiket"),
            SiteSetting(key="quality_title", value="Kalite Politikamız", group="quality_policy", is_public=True, description="Kalite Politikası Ana Başlığı"),
            SiteSetting(key="quality_desc", value="Yazeproje olarak başarının ve kalıcılığın anahtarının, kaliteden ödün vermeyen bir çalışma disiplini olduğuna inanıyoruz. Taahhüt ettiğimiz kalite politikamızın temel sütunları:", group="quality_policy", is_public=True, description="Kalite Politikası Açıklaması"),
            SiteSetting(
                key="quality_pillars",
                value=None,
                value_json=[
                    {"title": "Uluslararası Standartlar", "desc": "Tüm süreçlerimizde ulusal ve uluslararası mevzuatlara, standartlara ve mühendislik etiğine eksiksiz uyum sağlamak.", "icon": "Award"},
                    {"title": "Müşteri Memnuniyeti", "desc": "İş ortaklarımızın beklentilerini doğru analiz ederek, onlara sadece ihtiyaçlarını karşılayan değil, beklentilerinin ötesine geçen çözümler sunmak.", "icon": "Heart"},
                    {"title": "Sürekli Gelişim (Kaizen)", "desc": "Teknolojik gelişmeleri yakından takip ederek iş süreçlerimizi, donanımımızın ve yetkinliklerimizi sürekli modernize etmek ve geliştirmek.", "icon": "Zap"},
                    {"title": "Sıfır Hata ve Güvenlik", "desc": "Projelendirme aşamasından uygulama sürecine kadar tüm detaylarda \"sıfır hata\" felsefesiyle hareket ederek, güvenliği ve dayanıklılığı en üst seviyede tutmak.", "icon": "ShieldCheck"},
                    {"title": "Sürdürülebilirlik", "desc": "Kaynakları etkin ve verimli kullanarak, doğaya ve insana saygılı, kalıcı eserler üretmek.", "icon": "CheckCircle2"}
                ],
                group="quality_policy",
                is_public=True,
                description="Kalite Politikası 5 Temel Sütun Kartları (JSON formatında)"
            )
        ]
        session.add_all(default_settings)
        await session.commit()
        logger.info("Site Settings seeded successfully.")

    # 1. Check if we already have projects
    result = await session.execute(select(ArchitectureProject).limit(1))
    if result.scalars().first():
        logger.info("Database already seeded with domain data. Skipping domain seeding.")
        return

    logger.info("Seeding database with Gölbaşı themed mock data...")

    # ── 0. USERS ─────────────────────────────────────────────────────
    users = [
        User(
            email="krgzmstf@gmail.com",
            password_hash=hash_password("Ezam_231109"),
            full_name="Mustafa Karagöz",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="yazeproje@gmail.com",
            password_hash=hash_password("Ercan_2801"),
            full_name="Ercan G.",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="mimar@yazeproje.com",
            password_hash=hash_password("mimar123"),
            full_name="Selim Mimaroğlu",
            role=UserRole.ARCHITECT,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="emlakci@yazeproje.com",
            password_hash=hash_password("emlak123"),
            full_name="Fatma Emlakçı",
            role=UserRole.AGENT,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="yazilimci@yazeproje.com",
            password_hash=hash_password("yazilim123"),
            full_name="Kaan Yazılımcı",
            role=UserRole.DEVELOPER,
            is_active=True,
            is_verified=True,
        ),
        User(
            email="editor@yazeproje.com",
            password_hash=hash_password("editor123"),
            full_name="Aylin Editör",
            role=UserRole.EDITOR,
            is_active=True,
            is_verified=True,
        )
    ]
    session.add_all(users)

    # ── 1. ARCHITECTURE PROJECTS ─────────────────────────────────────────
    projects = [
        ArchitectureProject(
            title="Gölbaşı Premium Villaları",
            slug="golbasi-premium-villalari",
            description=(
                "Gölbaşı Mogan Gölü kıyısında konumlanan, modern mimari çizgiler ve sürdürülebilir "
                "malzemelerle tasarlanmış, akıllı ev altyapısına sahip 12 adet ultra lüks villa projesi. "
                "Göl manzarası ve doğayla iç içe yaşam konsepti bir arada sunulmaktadır."
            ),
            category=ProjectCategory.RESIDENTIAL,
            status=ProjectStatus.IN_PROGRESS,
            client_name="Yaze Yapı Ortaklığı",
            location="Karşıyaka Mah., Gölbaşı, Ankara",
            area_sqm=5400.0,
            budget_try=120000000.0,
            start_date="2026-01-10",
            end_date="2027-06-30",
            cover_image_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            gallery_urls={"images": [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
            ]},
            is_featured=True,
            is_published=True,
            sort_order=1,
            meta_title="Gölbaşı Premium Villaları | Yaze Mimarlık",
            meta_description="Gölbaşı'nda Mogan gölü manzaralı akıllı lüks villa projesi."
        ),
        ArchitectureProject(
            title="Mogan Sosyal Yaşam Merkezi",
            slug="mogan-sosyal-yasam-merkezi",
            description=(
                "Gölbaşı halkının sosyal ve kültürel ihtiyaçlarına yanıt veren, Mogan Gölü çevre "
                "peyzajıyla entegre yürüyüş yolları, amfi tiyatro, kafeler ve sergi alanları barındıran "
                "kamusal karma kullanım projesi."
            ),
            category=ProjectCategory.COMMERCIAL,
            status=ProjectStatus.COMPLETED,
            client_name="Gölbaşı Belediyesi (Yarışma Projesi)",
            location="Mogan Gölü Sahil Şeridi, Gölbaşı, Ankara",
            area_sqm=12500.0,
            budget_try=280000000.0,
            start_date="2024-05-15",
            end_date="2025-11-20",
            cover_image_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            gallery_urls={"images": [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
            ]},
            is_featured=True,
            is_published=True,
            sort_order=2,
            meta_title="Mogan Sosyal Yaşam Merkezi | Yaze Mimarlık",
            meta_description="Sosyal alanlar ve doğa entegrasyonu sunan modern kamusal merkez tasarımı."
        ),
        ArchitectureProject(
            title="Yaze Plaza & İş Merkezi",
            slug="yaze-plaza-is-merkezi",
            description=(
                "Bahçelievler Mahallesi'nde yükselen, enerji tasarruflu cam cephe panelleri, modüler iç mekan "
                "tasarımı ve yeraltı otoparkı içeren BREEAM sertifikalı sürdürülebilir ofis binası projesi."
            ),
            category=ProjectCategory.COMMERCIAL,
            status=ProjectStatus.COMPLETED,
            client_name="Yaze Yatırım Ltd. Şti.",
            location="Bahçelievler Mah., Gölbaşı, Ankara",
            area_sqm=8500.0,
            budget_try=150000000.0,
            start_date="2023-09-01",
            end_date="2025-03-10",
            cover_image_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            gallery_urls={"images": [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            ]},
            is_featured=False,
            is_published=True,
            sort_order=3,
            meta_title="Yaze Plaza & İş Merkezi | Yaze Mimarlık",
            meta_description="Ankara Gölbaşı'nda yeşil bina standartlarına uygun ofis projesi."
        )
    ]

    session.add_all(projects)

    # ── 2. REAL ESTATE LISTINGS ──────────────────────────────────────
    listings = [
        RealEstateListing(
            title="Mogan Gölü Manzaralı Satılık 5+2 Akıllı Villa",
            slug="mogan-golu-manzarali-satilik-5-2-akilli-villa",
            listing_type=ListingType.SALE,
            property_type=PropertyType.VILLA,
            description=(
                "Karşıyaka Mahallesi'nin en prestijli bölgesinde, göl manzarasına tam hakim konumda. "
                "Müstakil havuzlu, geniş bahçeli, yerden ısıtmalı ve akıllı ev otomasyon sistemine sahip, "
                "birinci sınıf malzemelerle sıfır inşa edilmiş lüks villa."
            ),
            price=34500000.0,
            currency="TRY",
            area_sqm=520.0,
            room_count="5+2",
            floor_number=1,
            total_floors=3,
            building_age=0,
            heating_type="Yerden Isıtma",
            city="Ankara",
            district="Gölbaşı",
            neighborhood="Karşıyaka Mah.",
            address="Mogan Konakları Sitesi No: 8",
            latitude=39.7925,
            longitude=32.8130,
            cover_image_url="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
            gallery_urls={"images": [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
            ]},
            features={"havuz": True, "otopark": True, "akilli_ev": True, "guvenlik": True},
            contact_name="Yaze Yapı Gayrimenkul",
            contact_phone="0312 444 0 999",
            is_featured=True,
            is_published=True
        ),
        RealEstateListing(
            title="İncek Prestij Bölgesinde Kiralık Havuzlu 4+1 Müstakil Villa",
            slug="incek-prestij-bolgesinde-kiralik-havuzlu-4-1-mustakil-villa",
            listing_type=ListingType.RENT,
            property_type=PropertyType.VILLA,
            description=(
                "İncek Mahallesi'nde, güvenlikli nezih site içerisinde yer alan, geniş veranda ve "
                "müstakil havuzlu, 3 banyolu, şömineli, bakımlı lüks villa. Diplomatlara ve ailelere uygundur."
            ),
            price=120000.0,
            currency="TRY",
            area_sqm=380.0,
            room_count="4+1",
            floor_number=1,
            total_floors=2,
            building_age=3,
            heating_type="Doğalgaz Kombi",
            city="Ankara",
            district="Gölbaşı",
            neighborhood="İncek Mah.",
            address="İncek Çamlık Sitesi No: 23",
            latitude=39.8150,
            longitude=32.7210,
            cover_image_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            gallery_urls={"images": [
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
            ]},
            features={"havuz": True, "otopark": True, "guvenlik": True, "bahce": True},
            contact_name="Ahmet Yılmaz",
            contact_phone="0532 123 45 67",
            is_featured=True,
            is_published=True
        ),
        RealEstateListing(
            title="Gölbaşı Hacılar Mahallesinde İmara Sınır Yatırımlık Satılık Arsa",
            slug="golbasi-hacilar-mahallesinde-imara-sinir-yatirimlik-satilik-arsa",
            listing_type=ListingType.SALE,
            property_type=PropertyType.LAND,
            description=(
                "Hacılar Mahallesi'nde, gelişmekte olan villa projeleri bölgesine çok yakın mesafede, "
                "yol ve altyapı çalışmalarına yakın, geleceğe yönelik yüksek prim potansiyeline sahip "
                "tek tapu yatırımlık arsa."
            ),
            price=18500000.0,
            currency="TRY",
            area_sqm=2500.0,
            city="Ankara",
            district="Gölbaşı",
            neighborhood="Hacılar Mah.",
            address="Hacılar Köyiçi Mevkii G29 Parsel",
            latitude=39.8010,
            longitude=32.7440,
            cover_image_url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
            contact_name="Yaze Emlak Ofisi",
            contact_phone="0312 444 0 999",
            is_featured=False,
            is_published=True
        )
    ]

    session.add_all(listings)

    # ── 3. AUTOMATED NEWS ────────────────────────────────────────────
    news = [
        AutomatedNews(
            title="Resmi Gazete: İmar Kanununda Otopark Düzenlemesi Değişiklikleri Yürürlüğe Girdi",
            slug="resmi-gazete-imar-kanununda-otopark-duzenlemesi-degisiklikleri",
            source=NewsSource.RESMI_GAZETE,
            source_url="https://www.resmigazete.gov.tr",
            summary=(
                "3194 Sayılı İmar Kanunu kapsamındaki otopark yönetmeliğinde yapılan yeni düzenlemeler "
                "Resmi Gazete'de yayımlanarak yürürlüğe girdi. Her daire için en az bir otopark şartı kolaylaşıyor."
            ),
            content=(
                "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı tarafından hazırlanan yeni otopark yönetmeliği "
                "Resmi Gazete'de yayımlandı. Yeni yönetmeliğe göre, her daire için en az bir otopark yeri ayrılması "
                "ana prensip olarak korunurken, parselinde otopark yapamayan binalar için bölge otoparklarından "
                "faydalanma imkanı ve ödeme kolaylıkları getirildi. Ayrıca elektrikli araçlar için şarj istasyonlarının "
                "bulunması zorunluluğu da alan genişliğine göre yeniden düzenlendi."
            ),
            cover_image_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            tags={"kategori": "İmar Yönetmeliği", "kaynak": "Resmi Gazete", "konu": "Otopark"},
            is_published=True,
            is_featured=True,
            published_at="2026-05-24T10:00:00"
        ),
        AutomatedNews(
            title="Çevre ve Şehircilik Bakanlığı Sıfır Atık Binalar Teknik Rehberini Güncelledi",
            slug="csb-sifir-atik-binalar-teknik-rehber-guncellemesi",
            source=NewsSource.CSBE,
            source_url="https://csb.gov.tr",
            summary=(
                "Bakanlık, yeni inşa edilecek olan kamu kurumları, alışveriş merkezleri ve 50+ konutlu "
                "siteler için Sıfır Atık Yönetim Sisteminin kurulması zorunluluğunu detaylandıran yeni rehberi yayınladı."
            ),
            content=(
                "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı, Sıfır Atık Hareketi kapsamında binalarda "
                "atık ayrıştırma, geri dönüşüm üniteleri ve kompost makinelerinin entegrasyonuyla ilgili teknik kuralları "
                "güncelledi. Bu rehber mimari tasarım aşamasından itibaren tüm yeni projelerin atık odası ve şaft planlaması "
                "yapmasını zorunlu kılmaktadır."
            ),
            cover_image_url="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
            tags={"kategori": "Sürdürülebilirlik", "kaynak": "Bakanlık", "konu": "Sıfır Atık"},
            is_published=True,
            is_featured=False,
            published_at="2026-05-20T14:30:00"
        ),
        AutomatedNews(
            title="TMMOB Mimarlar Odası Ankara Şubesi: Gölbaşı Kent Estetiği ve Koruma Raporu",
            slug="tmmob-mimarlar-odasi-ankara-subesi-golbasi-kent-estetigi-raporu",
            source=NewsSource.TMMOB,
            source_url="https://www.mimarlarodasiankara.org",
            summary=(
                "Mimarlar Odası Ankara Şubesi, Mogan Gölü ve Eymir Gölü çevresindeki ekolojik hassasiyeti ve "
                "son dönemdeki yatay mimari yapılaşma trendlerini ele alan kapsamlı bir kent estetiği raporu sundu."
            ),
            content=(
                "Mimarlar Odası Ankara Şubesi tarafından yayınlanan raporda, Gölbaşı bölgesinin Ankara'nın "
                "en önemli akciğerleri ve sulak alan ekosistemlerinden biri olduğu vurgulanarak, inşa edilen villa "
                "ve konut projelerinde çevre peyzajı uyumu, emsal değerlerinin korunması ve havza sınırlarındaki "
                "doğal flora-faunanın tahrip edilmemesi gerektiği teknik detaylarla anlatıldı."
            ),
            cover_image_url="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80",
            tags={"kategori": "Kent Estetiği", "kaynak": "TMMOB", "konu": "Gölbaşı Raporu"},
            is_published=True,
            is_featured=False,
            published_at="2026-05-18T09:15:00"
        )
    ]

    session.add_all(news)

    # ── 4. ANNOUNCEMENTS (MUNICIPAL / REAL ESTATE DUYURU VE ASKILAR) ──
    announcements = [
        Announcement(
            title="Karşıyaka Mahallesi 1/1000 Ölçekli Uygulama İmar Planı Değişikliği Askı İlanı",
            slug="karsiyaka-mahallesi-1-1000-olcekli-uygulama-imar-plani-degisikligi-aski-ilani",
            content=(
                "Gölbaşı Belediyesi İmar ve Şehircilik Müdürlüğü'nden ilan olunur: Belediye Meclisimizin "
                "08.05.2026 tarih ve 145 sayılı kararı ile uygun görülen ve Ankara Büyükşehir Belediye Meclisi'nce "
                "onaylanan Karşıyaka Mahallesi sınırları içindeki imar planı değişikliği, 30 gün süreyle "
                "İmar ve Şehircilik Müdürlüğü ilan panosunda askıya çıkarılmıştır."
            ),
            cover_image_url="https://images.unsplash.com/photo-1541829019-21367a596550?auto=format&fit=crop&w=800&q=80",
            is_published=True,
            is_pinned=True,
            published_at="2026-05-25"
        ),
        Announcement(
            title="Eymir Mahallesi Kentsel Yenileme Projesi Hak Sahipleri Bilgilendirme Duyurusu",
            slug="eymir-mahallesi-kentsel-yenileme-projesi-bilgilendirme-duyurusu",
            content=(
                "Eymir Mahallesi sınırları dahilindeki riskli binalar ve deprem dayanıklılığı düşük yapıların "
                "dönüştürülmesi amacıyla hazırlanan kentsel yenileme projesinin taslak yerleşim planları ve "
                "hak sahipliği dağıtım listesi 15 gün süreyle askıda kalacaktır. Vatandaşlarımızın gerekli "
                "itiraz veya onay işlemlerini yapmaları önemle rica olunur."
            ),
            cover_image_url="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
            is_published=True,
            is_pinned=False,
            published_at="2026-05-22"
        ),
        Announcement(
            title="Gölbaşı Park ve Mesire Alanları Peyzaj ve Bakım İhalesi İlanı",
            slug="golbasi-park-ve-mesire-alanlari-peyzaj-ve-bakim-ihalesi-ilani",
            content=(
                "Gölbaşı Belediyesi Destek Hizmetleri Müdürlüğü tarafından: İlçe sınırları dahilindeki 45 "
                "farklı park ve Mogan rekreasyon alanı peyzaj düzenlemesi, sulama altyapısı ve periyodik "
                "bakım işi, 4734 sayılı Kamu İhale Kanununun 19 uncu maddesine göre açık ihale usulü ile ihale "
                "edilecektir. İhale tarihi 10 Haziran 2026'dır."
            ),
            cover_image_url="https://images.unsplash.com/photo-1588880331179-bc9b93a8c5d8?auto=format&fit=crop&w=800&q=80",
            is_published=True,
            is_pinned=False,
            published_at="2026-05-19"
        )
    ]

    session.add_all(announcements)

    # ── 5. EVENTS (CULTURAL & SEMINARS) ──────────────────────────────
    events = [
        Event(
            title="Gölbaşı Belediyesi Mogan Kültür, Sanat ve Göller Festivali",
            slug="golbasi-belediyesi-mogan-kultur-sanat-ve-goller-festivali",
            description=(
                "Gölbaşı Belediyesi tarafından geleneksel olarak düzenlenen Mogan Festivali bu yıl "
                "konserler, halk oyunları, resim sergileri ve yelken yarışları ile geri dönüyor. "
                "Tüm Ankara halkı davetlidir."
            ),
            location="Mogan Gölü Rekreasyon ve Festival Alanı, Gölbaşı",
            event_date="2026-06-15T18:00:00",
            event_end_date="2026-06-20T23:30:00",
            cover_image_url="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
            registration_url="https://www.yazeproje.com/etkinlik/mogan-festivali",
            is_published=True,
            is_featured=True,
            max_attendees=10000,
            current_attendees=250
        ),
        Event(
            title="Sürdürülebilir Kentler ve Ekolojik Mimarlık Semineri",
            slug="surdurulebilir-kentler-ve-ekolojik-mimarlik-semineri",
            description=(
                "Yaze Yapı Mimarlık sponsorluğunda ve ODTÜ Mimarlık Fakültesi akademisyenlerinin katılımıyla "
                "Gölbaşı'ndaki yatay yapılaşmanın ekolojik dengelerle uyumu, yeşil çatı teknolojileri ve "
                "yağmur suyu hasadı gibi sürdürülebilir mimari pratiklerin ele alınacağı seminer."
            ),
            location="Gölbaşı Belediyesi Kültür Merkezi Mehmet Akif Ersoy Konferans Salonu",
            event_date="2026-06-05T14:00:00",
            event_end_date="2026-06-05T17:30:00",
            cover_image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
            registration_url="https://www.yazeproje.com/etkinlik/surdurulebilir-mimarlik",
            is_published=True,
            is_featured=True,
            max_attendees=300,
            current_attendees=124
        )
    ]

    session.add_all(events)

    # ── 6. SUBSCRIBERS ───────────────────────────────────────────────
    newsletter = NewsletterSubscriber(
        email="info@yazeproje.com",
        is_active=True
    )
    sms = SmsSubscriber(
        phone="05320000000",
        full_name="Test Abone",
        is_active=True
    )
    session.add(newsletter)
    session.add(sms)

    # ── 7. SOFTWARE PRODUCTS (Seed default apps) ─────────────────────
    from app.models.product import SoftwareProduct, SoftwareProductCategory
    products_check = await session.execute(select(SoftwareProduct).limit(1))
    if not products_check.scalars().first():
        logger.info("Seeding Software Products...")
        default_apps = [
            SoftwareProduct(
                name="YazeSYM",
                slug="yazesym",
                category=SoftwareProductCategory.CALCULATION,
                short_description="Mühendislik yapısal analiz ve simülasyon yazılımı.",
                description="YazeSYM, inşaat ve yapı mühendisleri için geliştirilmiş, deprem yükleri ve yapısal analizleri uluslararası yönetmeliklere uygun olarak gerçekleştiren gelişmiş bir simülasyon aracıdır.",
                price=15000.0,
                currency="TRY",
                is_free=False,
                version="v1.2.0",
                is_published=True,
                is_featured=True,
                sort_order=1,
                download_url=None,
                demo_url="https://demo.yazeproje.com/yazesym",
                cover_image_url="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80"
            ),
            SoftwareProduct(
                name="yaze_metraj",
                slug="yaze-metraj",
                category=SoftwareProductCategory.CALCULATION,
                short_description="Hızlı metraj çıkartma ve yaklaşık maliyet hesaplama aracı.",
                description="yaze_metraj, projelerinizdeki beton, demir, kalıp ve diğer tüm yapı elemanlarının metrajlarını CAD çizimleri üzerinden otomatik çıkartarak yaklaşık maliyet hesaplama süreçlerinizi dakikalar içerisine indirger.",
                price=8500.0,
                currency="TRY",
                is_free=False,
                version="v2.0.4",
                is_published=True,
                is_featured=True,
                sort_order=2,
                download_url=None,
                demo_url="https://demo.yazeproje.com/yazemetraj",
                cover_image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80"
            ),
            SoftwareProduct(
                name="Ynot",
                slug="ynot",
                category=SoftwareProductCategory.PROJECT_MANAGEMENT,
                short_description="Mimar ve mühendisler için akıllı not alma ve şantiye takip uygulaması.",
                description="Ynot, şantiyede ve ofiste ekip içi iletişimi koordine eden, anlık not alma, görev atama ve şantiye fotoğraf/doküman arşivleme özelliklerine sahip akıllı proje yönetim platformudur.",
                price=0.0,
                currency="TRY",
                is_free=True,
                version="v1.0.1",
                is_published=True,
                is_featured=True,
                sort_order=3,
                download_url=None,
                demo_url="https://ynot.yazeproje.com",
                cover_image_url="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80"
            ),
            SoftwareProduct(
                name="yaze otel",
                slug="yaze-otel",
                category=SoftwareProductCategory.OTHER,
                short_description="Modern otel, rezidans ve konaklama işletim otomasyon sistemi.",
                description="yaze otel, konuk giriş-çıkış takibi, oda rezervasyon yönetimi, faturalandırma ve temizlik koordinasyonunu tek ekrandan sunan, bulut tabanlı modern bir otel otomasyon çözümüdür.",
                price=12000.0,
                currency="TRY",
                is_free=False,
                version="v3.1.0",
                is_published=True,
                is_featured=True,
                sort_order=4,
                download_url=None,
                demo_url="https://otel.yazeproje.com",
                cover_image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
            )
        ]
        session.add_all(default_apps)

    # Commit transactions
    await session.commit()
    logger.info("Database seeding successfully completed.")
