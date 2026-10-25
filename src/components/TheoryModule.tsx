import React, { useState } from 'react';
import { KatexMath } from './KatexMath';
import { BookOpen, ChevronRight, Layers, Sparkles, CheckCircle, Lightbulb } from 'lucide-react';

interface TopicSection {
  id: string;
  title: string;
  badge: string;
  content: React.ReactNode;
}

export const TheoryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('domain_range');

  const topics: TopicSection[] = [
    {
      id: 'domain_range',
      title: '1. Domain & Range Fungsi',
      badge: 'Fondasi Aljabar',
      content: (
        <div className="theory-body">
          <h3>Definisi Matematis Fungsi</h3>
          <p>
            Sebuah <strong>fungsi</strong> <KatexMath math="f" /> dari himpunan <KatexMath math="D" /> ke himpunan <KatexMath math="Y" /> adalah suatu aturan yang mengaitkan <em>setiap</em> elemen <KatexMath math="x \in D" /> dengan <strong>tepat satu</strong> elemen unik <KatexMath math="f(x) \in Y" />.
          </p>

          <div className="theory-grid-2">
            <div className="theory-card-sub">
              <h4>Daerah Asal (Domain, <KatexMath math="D_f" />)</h4>
              <p>Himpunan seluruh nilai masukan <KatexMath math="x" /> yang membuat fungsi bernilai riil dan terdefinisi.</p>
              <ul>
                <li>Penyebut tidak boleh sama dengan 0: Pada <KatexMath math="f(x) = \frac{1}{g(x)}" />, syaratnya <KatexMath math="g(x) \neq 0" />.</li>
                <li>Radikal berindeks genap harus tak negatif: Pada <KatexMath math="f(x) = \sqrt{g(x)}" />, syaratnya <KatexMath math="g(x) \geq 0" />.</li>
                <li>Argumen logaritma harus positif: Pada <KatexMath math="f(x) = \ln(g(x))" />, syaratnya <KatexMath math="g(x) > 0" />.</li>
              </ul>
            </div>

            <div className="theory-card-sub">
              <h4>Daerah Hasil (Range, <KatexMath math="R_f" />)</h4>
              <p>Himpunan semua nilai keluaran <KatexMath math="y = f(x)" /> saat <KatexMath math="x" /> menjelajahi seluruh domainnya.</p>
              <div className="formula-highlight">
                <KatexMath math="R_f = \{ y \in \mathbb{R} \mid \exists x \in D_f, \, y = f(x) \}" block />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'symmetry_parity',
      title: '2. Simetri & Paritas Grafik',
      badge: 'Karakteristik Geometris',
      content: (
        <div className="theory-body">
          <h3>Fungsi Genap, Ganjil, dan Simetri Koordinat</h3>
          <p>
            Mengenali simetri fungsi memungkinkan kita menggambar separuh grafik (misal untuk <KatexMath math="x \ge 0" />) lalu merefleksikannya secara akurat.
          </p>

          <div className="theory-grid-2">
            <div className="theory-card-sub">
              <h4>Fungsi Genap (Even Function)</h4>
              <div className="formula-highlight">
                <KatexMath math="f(-x) = f(x), \quad \forall x \in D_f" block />
              </div>
              <p>
                Grafiknya <strong>simetris terhadap Sumbu Y</strong>. Jika titik <KatexMath math="(x, y)" /> ada pada kurva, maka titik <KatexMath math="(-x, y)" /> juga berada pada kurva.
              </p>
              <div className="example-tag">Contoh: <KatexMath math="f(x) = x^2, \, \cos(x), \, x^4 - 2x^2" /></div>
            </div>

            <div className="theory-card-sub">
              <h4>Fungsi Ganjil (Odd Function)</h4>
              <div className="formula-highlight">
                <KatexMath math="f(-x) = -f(x), \quad \forall x \in D_f" block />
              </div>
              <p>
                Grafiknya <strong>simetris terhadap Titik Asal (0,0)</strong> (inversi putar 180°). Jika titik <KatexMath math="(x, y)" /> ada pada kurva, maka <KatexMath math="(-x, -y)" /> juga ada.
              </p>
              <div className="example-tag">Contoh: <KatexMath math="f(x) = x^3 - 3x, \, \sin(x), \, \frac{1}{x}" /></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'derivative_slope',
      title: '3. Garis Singgung & Turunan Pertama',
      badge: 'Inti Kalkulus Diferensial',
      content: (
        <div className="theory-body">
          <h3>Definisi Kemiringan Garis Singgung sebagai Limit</h3>
          <p>
            Garis singgung pada titik <KatexMath math="P(x_0, f(x_0))" /> merupakan limit dari garis potong (secant line) ketika titik kedua mendekati <KatexMath math="P" />:
          </p>

          <div className="formula-highlight">
            <KatexMath math="f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}" block />
          </div>

          <div className="theory-grid-2">
            <div className="theory-card-sub">
              <h4>Persamaan Garis Singgung</h4>
              <p>Persamaan garis singgung bergradien <KatexMath math="m = f'(x_0)" /> pada titik <KatexMath math="(x_0, y_0)" /> dirumuskan oleh:</p>
              <div className="formula-highlight">
                <KatexMath math="y - f(x_0) = f'(x_0) \cdot (x - x_0)" block />
              </div>
            </div>

            <div className="theory-card-sub">
              <h4>Uji Kemonotonan Grafik</h4>
              <ul>
                <li>Jika <KatexMath math="f'(x) > 0" /> pada interval <KatexMath math="I" />, maka grafik <strong>NAIK (increasing)</strong>.</li>
                <li>Jika <KatexMath math="f'(x) < 0" /> pada interval <KatexMath math="I" />, maka grafik <strong>TURUN (decreasing)</strong>.</li>
                <li>Jika <KatexMath math="f'(x) = 0" />, garis singgung mendatar (titik stasioner).</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'concavity_inflection',
      title: '4. Kecekungan & Turunan Kedua',
      badge: 'Bentuk Kurva & Titik Belok',
      content: (
        <div className="theory-body">
          <h3>Uji Kecekungan (Concavity) dan Titik Belok</h3>
          <p>
            Turunan kedua <KatexMath math="f''(x)" /> mengukur laju perubahan gradien garis singgung atau kelengkungan grafik:
          </p>

          <div className="theory-grid-2">
            <div className="theory-card-sub">
              <h4>Cekung ke Atas (Concave Upward)</h4>
              <p>Kurva berada di atas garis-garis singgungnya (berbentuk seperti mangkok menampung air):</p>
              <div className="formula-highlight">
                <KatexMath math="f''(x) > 0 \implies \text{Cekung ke Atas}" block />
              </div>
              <p>Jika <KatexMath math="f'(c) = 0" /> dan <KatexMath math="f''(c) > 0" />, maka <KatexMath math="x = c" /> adalah <strong>Minimum Lokal</strong>.</p>
            </div>

            <div className="theory-card-sub">
              <h4>Cekung ke Bawah (Concave Downward)</h4>
              <p>Kurva berada di bawah garis-garis singgungnya (berbentuk seperti kubah):</p>
              <div className="formula-highlight">
                <KatexMath math="f''(x) < 0 \implies \text{Cekung ke Bawah}" block />
              </div>
              <p>Jika <KatexMath math="f'(c) = 0" /> dan <KatexMath math="f''(c) < 0" />, maka <KatexMath math="x = c" /> adalah <strong>Maksimum Lokal</strong>.</p>
            </div>
          </div>

          <div className="theory-card-sub mt-3">
            <h4>Titik Belok (Point of Inflection)</h4>
            <p>
              Titik pada grafik di mana <strong>kecekungan kurva berubah arah</strong> (dari cekung atas ke cekung bawah atau sebaliknya). Syarat perlu: <KatexMath math="f''(x) = 0" /> atau <KatexMath math="f''(x)" /> tidak terdefinisi, disertai tanda <KatexMath math="f''(x)" /> yang berlawanan di sekitar titik tersebut.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'asymptotes_limits',
      title: '5. Asimtot & Perilaku di Tak Hingga',
      badge: 'Garis Pembatas Grafik',
      content: (
        <div className="theory-body">
          <h3>Asimtot Tegak, Asimtot Datar, dan Asimtot Miring</h3>
          <p>
            Asimtot adalah garis lurus yang didekati kurva sedekat mungkin saat variabel menuju suatu nilai batas tertentu atau tak hingga.
          </p>

          <div className="theory-grid-3">
            <div className="theory-card-sub">
              <h4>Asimtot Tegak (Vertical)</h4>
              <p>Garis <KatexMath math="x = c" /> adalah asimtot tegak jika salah satu limit sepihak bernilai <KatexMath math="\pm \infty" />:</p>
              <div className="formula-highlight">
                <KatexMath math="\lim_{x \to c^\pm} f(x) = \pm \infty" block />
              </div>
              <p className="sub-note">Sering muncul saat penyebut fungsi rasional sama dengan nol.</p>
            </div>

            <div className="theory-card-sub">
              <h4>Asimtot Datar (Horizontal)</h4>
              <p>Garis <KatexMath math="y = L" /> adalah asimtot datar jika limit saat <KatexMath math="x \to \pm \infty" /> berhingga:</p>
              <div className="formula-highlight">
                <KatexMath math="\lim_{x \to \infty} f(x) = L \quad \text{atau} \quad \lim_{x \to -\infty} f(x) = L" block />
              </div>
            </div>

            <div className="theory-card-sub">
              <h4>Asimtot Miring (Oblique)</h4>
              <p>Garis <KatexMath math="y = mx + b" /> terjadi pada fungsi rasional ketika derajat pembilang tepat satu derajat lebih tinggi dari penyebut:</p>
              <div className="formula-highlight">
                <KatexMath math="\lim_{x \to \pm \infty} [f(x) - (mx + b)] = 0" block />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'step_by_step_guide',
      title: '6. Panduan 5 Langkah Menggambar Grafik Kalkulus',
      badge: 'Prosedur Baku Standar',
      content: (
        <div className="theory-body">
          <h3>Panduan Komprehensif Menggambar Sketsa Grafik Fungsi</h3>
          <div className="step-pipeline">
            <div className="pipeline-step">
              <span className="step-num">01</span>
              <div className="step-content">
                <h5>Analisis Pra-Turunan (Domain & Simetri)</h5>
                <p>Tentukan daerah asal domain <KatexMath math="D_f" />, titik potong sumbu Y <KatexMath math="(0, f(0))" />, akar-akar persilangan sumbu X <KatexMath math="f(x) = 0" />, serta periksa apakah fungsi genap atau ganjil.</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-num">02</span>
              <div className="step-content">
                <h5>Deteksi Asimtot & Limit Ujung</h5>
                <p>Hitung <KatexMath math="\lim_{x \to \pm \infty} f(x)" /> untuk asimtot datar dan periksa singularitas penyebut untuk asimtot tegak.</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-num">03</span>
              <div className="step-content">
                <h5>Turunan Pertama: Titik Kritis & Kemonotonan</h5>
                <p>Cari <KatexMath math="f'(x) = 0" /> atau <KatexMath math="f'(x)" /> tak ada. Buat garis bilangan tanda <KatexMath math="f'(x)" /> untuk menentukan interval kurva naik dan turun serta ekstrim lokal.</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-num">04</span>
              <div className="step-content">
                <h5>Turunan Kedua: Kecekungan & Titik Belok</h5>
                <p>Cari <KatexMath math="f''(x) = 0" />. Evaluasi tanda <KatexMath math="f''(x)" />: interval di mana kurva cekung ke atas (+) dan cekung ke bawah (-), serta tandai koordinat titik belok.</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-num">05</span>
              <div className="step-content">
                <h5>Plot Titik Kunci & Sambungkan Kurva Mulus</h5>
                <p>Hubungkan titik-titik ekstrim, titik belok, dan titik potong dengan kurva mulus yang mematuhi batasan asimtot dan arah kelengkungan.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTab) || topics[0];

  return (
    <div className="theory-module-card">
      <div className="theory-header">
        <div className="card-badge">
          <BookOpen size={14} className="text-cyan" />
          <span>Buku Panduan & Modul Materi Kalkulus: Fungsi & Grafik</span>
        </div>
        <p className="theory-sub">
          Materi teoritis lengkap dengan notasi matematika baku KaTeX, sifat geometris, dan pembuktian kalkulus.
        </p>
      </div>

      <div className="theory-tabs-nav">
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`theory-nav-btn ${activeTab === t.id ? 'active' : ''}`}
          >
            <span>{t.title}</span>
            <span className="theory-tab-tag">{t.badge}</span>
          </button>
        ))}
      </div>

      <div className="theory-content-container">
        {currentTopic.content}
      </div>
    </div>
  );
};
