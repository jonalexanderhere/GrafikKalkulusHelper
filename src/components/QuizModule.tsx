import React, { useState } from 'react';
import { QuizQuestion } from '../types/calculus';
import { KatexMath } from './KatexMath';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: 'Titik Stasioner & Ekstrim Lokal',
    question: 'Diberikan fungsi f(x) = x³ - 3x. Manakah pernyataan berikut yang paling tepat mengenai titik stasionernya?',
    mathPrompt: 'f(x) = x^3 - 3x',
    options: [
      { id: 'a', text: 'Maksimum lokal di (1, -2) dan minimum lokal di (-1, 2)', isCorrect: false },
      { id: 'b', text: 'Maksimum lokal di (-1, 2) dan minimum lokal di (1, -2)', isCorrect: true },
      { id: 'c', text: 'Hanya memiliki titik belok di x = 0 tanpa titik ekstrim', isCorrect: false },
      { id: 'd', text: 'Maksimum lokal di x = 0 dan minimum lokal di x = 3', isCorrect: false },
    ],
    explanation: 'Turunan pertama f\'(x) = 3x² - 3 = 3(x - 1)(x + 1) = 0 menghasilkan titik kritis x = -1 dan x = 1. Uji turunan kedua f\'\'(x) = 6x: f\'\'(-1) = -6 < 0 (maksimum lokal di (-1, 2)) dan f\'\'(1) = 6 > 0 (minimum lokal di (1, -2)).',
    category: 'Turunan Pertama & Kedua',
  },
  {
    id: 2,
    title: 'Asimtot Fungsi Rasional',
    question: 'Tentukan asimtot tegak dan asimtot datar untuk fungsi rasional berikut:',
    mathPrompt: 'f(x) = \\frac{2x + 1}{x - 3}',
    options: [
      { id: 'a', text: 'Asimtot tegak x = 3 dan Asimtot datar y = 2', isCorrect: true },
      { id: 'b', text: 'Asimtot tegak x = -3 dan Asimtot datar y = 1/3', isCorrect: false },
      { id: 'c', text: 'Asimtot tegak x = 2 dan Asimtot datar y = 3', isCorrect: false },
      { id: 'd', text: 'Tidak memiliki asimtot datar karena derajat penyebut sama', isCorrect: false },
    ],
    explanation: 'Asimtot tegak terjadi saat penyebut bernilai nol, yaitu x - 3 = 0 => x = 3. Asimtot datar diperoleh dari lim_{x->±∞} (2x+1)/(x-3) = 2/1 = 2 (garis y = 2).',
    category: 'Fungsi Rasional',
  },
  {
    id: 3,
    title: 'Kecekungan & Titik Belok',
    question: 'Pada interval manakah grafik kurva f(x) = x⁴ - 6x² selalu cekung ke bawah (concave downward)?',
    mathPrompt: 'f(x) = x^4 - 6x^2',
    options: [
      { id: 'a', text: 'x ∈ (-∞, -1) ∪ (1, ∞)', isCorrect: false },
      { id: 'b', text: 'x ∈ (-1, 1)', isCorrect: true },
      { id: 'c', text: 'x ∈ (-√3, √3)', isCorrect: false },
      { id: 'd', text: 'Grafik selalu cekung ke atas di semua bilangan riil', isCorrect: false },
    ],
    explanation: 'Turunan pertama f\'(x) = 4x³ - 12x. Turunan kedua f\'\'(x) = 12x² - 12 = 12(x² - 1). Kurva cekung ke bawah saat f\'\'(x) < 0, yaitu 12(x² - 1) < 0 <=> x² < 1 <=> -1 < x < 1.',
    category: 'Kecekungan',
  },
  {
    id: 4,
    title: 'Persamaan Garis Singgung',
    question: 'Berapakah persamaan garis singgung pada kurva f(x) = x² - 4x + 5 di titik x = 3?',
    mathPrompt: 'f(x) = x^2 - 4x + 5, \\quad x = 3',
    options: [
      { id: 'a', text: 'y = 2x - 4', isCorrect: true },
      { id: 'b', text: 'y = 2x + 2', isCorrect: false },
      { id: 'c', text: 'y = -2x + 8', isCorrect: false },
      { id: 'd', text: 'y = 4x - 10', isCorrect: false },
    ],
    explanation: 'Koordinat titik singgung: f(3) = 3² - 4(3) + 5 = 9 - 12 + 5 = 2, jadi titiknya (3, 2). Kemiringan: f\'(x) = 2x - 4, sehingga m = f\'(3) = 2(3) - 4 = 2. Persamaan garis: y - 2 = 2(x - 3) => y = 2x - 6 + 2 => y = 2x - 4.',
    category: 'Garis Singgung',
  },
  {
    id: 5,
    title: 'Paritas & Simetri Grafik',
    question: 'Manakah di antara fungsi-fungsi berikut yang merupakan fungsi GANJIL (simetris terhadap titik asal O)?',
    mathPrompt: 'f(-x) = -f(x)',
    options: [
      { id: 'a', text: 'f(x) = cos(x) + x²', isCorrect: false },
      { id: 'b', text: 'f(x) = x³ - 5x', isCorrect: true },
      { id: 'c', text: 'f(x) = |x| - 3', isCorrect: false },
      { id: 'd', text: 'f(x) = e^x', isCorrect: false },
    ],
    explanation: 'Uji f(-x): f(-x) = (-x)³ - 5(-x) = -x³ + 5x = -(x³ - 5x) = -f(x). Karena f(-x) = -f(x), maka f(x) adalah fungsi ganjil.',
    category: 'Paritas & Simetri',
  },
];

export const QuizModule: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerSubmitted(true);
    const chosen = currentQ.options.find((o) => o.id === selectedOption);
    if (chosen?.isCorrect) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="quiz-card completed-state">
        <div className="celebration-badge">
          <Award size={36} className="text-amber" />
        </div>
        <h3>Kuis Kalkulus Selesai!</h3>
        <p className="score-summary">
          Skor Akhir Anda: <strong className="highlight-score">{score} / {QUIZ_QUESTIONS.length}</strong> ({percentage}%)
        </p>
        <p className="score-feedback">
          {percentage >= 80
            ? 'Luar biasa! Pemahaman Anda tentang konsep fungsi, turunan, dan analisis grafik kalkulus sangat matang.'
            : percentage >= 60
            ? 'Bagus! Anda telah menguasai sebagian besar konsep dasar fungsi dan grafik. Tinjau kembali modul teori untuk menyempurnakan.'
            : 'Tetap semangat! Pelajari kembali materi turunan pertama, kecekungan, dan asimtot di Modul Teori, lalu coba kuis ini kembali.'}
        </p>
        <button onClick={handleResetQuiz} className="quiz-btn primary">
          <RotateCcw size={16} />
          <span>Ulangi Kuis</span>
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      {/* Quiz Header & Progress */}
      <div className="quiz-header">
        <div className="card-badge">
          <Award size={14} className="text-amber" />
          <span>Latihan Mandiri & Evaluasi Konsep</span>
        </div>
        <div className="quiz-progress-text">
          Soal <strong>{currentIndex + 1}</strong> dari {QUIZ_QUESTIONS.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question Details */}
      <div className="question-content">
        <div className="category-tag">{currentQ.category}</div>
        <h3 className="question-title">{currentQ.title}</h3>
        <p className="question-text">{currentQ.question}</p>

        {currentQ.mathPrompt && (
          <div className="question-math-box">
            <KatexMath math={currentQ.mathPrompt} block />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="quiz-options-list">
        {currentQ.options.map((opt) => {
          let optionClass = 'quiz-option-btn';
          if (selectedOption === opt.id) optionClass += ' selected';
          if (isAnswerSubmitted) {
            if (opt.isCorrect) optionClass += ' correct';
            else if (selectedOption === opt.id && !opt.isCorrect) optionClass += ' wrong';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={isAnswerSubmitted}
              className={optionClass}
            >
              <span className="opt-letter">{opt.id.toUpperCase()}</span>
              <span className="opt-text">{opt.text}</span>
              {isAnswerSubmitted && opt.isCorrect && <CheckCircle2 size={18} className="text-emerald" />}
              {isAnswerSubmitted && selectedOption === opt.id && !opt.isCorrect && (
                <XCircle size={18} className="text-rose" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation when submitted */}
      {isAnswerSubmitted && (
        <div className="explanation-card">
          <div className="explanation-title">
            <Lightbulb size={16} className="text-amber" />
            <span>Pembahasan Langkah demi Langkah:</span>
          </div>
          <p className="explanation-text">{currentQ.explanation}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="quiz-footer">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            className="quiz-btn primary"
          >
            <span>Periksa Jawaban</span>
          </button>
        ) : (
          <button onClick={handleNext} className="quiz-btn next">
            <span>{currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
