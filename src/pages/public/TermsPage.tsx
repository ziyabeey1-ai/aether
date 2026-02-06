import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 prose prose-slate">
        <h1>Kullanım Koşulları</h1>
        <p className="lead">Yürürlük Tarihi: 15 Şubat 2024</p>

        <p>Lütfen Aether hizmetlerini kullanmadan önce bu Kullanım Koşullarını ("Koşullar") dikkatlice okuyun.</p>

        <h3>1. Kabul</h3>
        <p>Aether'e erişerek veya kullanarak, bu Koşullara bağlı kalmayı kabul edersiniz. Koşulları kabul etmiyorsanız, hizmetlerimizi kullanamazsınız.</p>

        <h3>2. Hesap Güvenliği</h3>
        <p>Hesap bilgilerinizin gizliliğini korumaktan siz sorumlusunuz. Hesabınız altında gerçekleşen tüm işlemlerden sorumlu olduğunuzu kabul edersiniz.</p>

        <h3>3. Kullanım Kısıtlamaları</h3>
        <p>Hizmetlerimizi şu amaçlarla kullanamazsınız:</p>
        <ul>
          <li>Yasa dışı veya yetkisiz amaçlar.</li>
          <li>Zararlı yazılım yaymak.</li>
          <li>Başkalarının haklarını ihlal etmek.</li>
          <li>Sistemin güvenliğini veya bütünlüğünü tehlikeye atmak.</li>
        </ul>

        <h3>4. İçerik Mülkiyeti</h3>
        <p>Aether ile oluşturduğunuz içeriklerin (metinler, görseller, düzenler) mülkiyeti size aittir. Ancak, Aether'e bu içerikleri barındırma ve görüntüleme lisansı verirsiniz.</p>

        <h3>5. Fesih</h3>
        <p>Koşulları ihlal etmeniz durumunda, hesabınızı askıya alma veya sonlandırma hakkımızı saklı tutarız.</p>

        <h3>6. Sorumluluk Reddi</h3>
        <p>Hizmetlerimiz "olduğu gibi" sunulmaktadır. Aether, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez.</p>
      </div>
    </div>
  );
};

export default TermsPage;