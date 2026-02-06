import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 prose prose-slate">
        <h1>Gizlilik Politikası</h1>
        <p className="lead">Son Güncelleme: 15 Şubat 2024</p>
        
        <p>Aether Platforms Inc. ("Aether", "biz", "bize"), gizliliğinize önem vermektedir. Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullandığınızda kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.</p>

        <h3>1. Topladığımız Bilgiler</h3>
        <p>Hizmetlerimizi kullandığınızda aşağıdaki bilgileri toplayabiliriz:</p>
        <ul>
          <li><strong>Hesap Bilgileri:</strong> Adınız, e-posta adresiniz ve şifreniz.</li>
          <li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileriniz ödeme işleyicimiz (Stripe) tarafından güvenle saklanır, biz bu verileri sunucularımızda tutmayız.</li>
          <li><strong>Kullanım Verileri:</strong> IP adresi, tarayıcı türü, ziyaret süresi gibi teknik veriler.</li>
          <li><strong>AI Girdileri:</strong> Web sitesi oluşturmak için girdiğiniz metinler ve görseller.</li>
        </ul>

        <h3>2. Bilgilerin Kullanımı</h3>
        <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
        <ul>
          <li>Hizmetlerimizi sağlamak ve iyileştirmek.</li>
          <li>Müşteri desteği sunmak.</li>
          <li>Yasal yükümlülükleri yerine getirmek.</li>
          <li>Size ürün güncellemeleri hakkında bilgi vermek (izninizle).</li>
        </ul>

        <h3>3. Veri Paylaşımı</h3>
        <p>Kişisel verilerinizi asla üçüncü taraflara satmayız. Ancak, hizmet sağlayıcılarımızla (hosting, analitik, ödeme) gerekli verileri paylaşabiliriz.</p>

        <h3>4. Veri Güvenliği</h3>
        <p>Verilerinizi korumak için endüstri standardı şifreleme ve güvenlik önlemleri kullanıyoruz. Ancak, internet üzerinden yapılan hiçbir iletimin %100 güvenli olmadığını unutmayın.</p>

        <h3>5. İletişim</h3>
        <p>Bu politika hakkında sorularınız varsa, lütfen <a href="mailto:privacy@aether.site">privacy@aether.site</a> adresinden bizimle iletişime geçin.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;