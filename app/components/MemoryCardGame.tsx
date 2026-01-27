import { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardGameProps {
  onBack: () => void;
  onScoreUpdate: (score: number) => void;
}

const emojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝'];

export function MemoryCardGame({ onBack, onScoreUpdate }: MemoryCardGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const initializeGame = () => {
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.value === secondCard.value) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches((prev) => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
          onScoreUpdate(10);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards, onScoreUpdate]);

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length === 2) return;
    const card = cards[id];
    if (card.isFlipped || card.isMatched) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  const isGameComplete = matches === emojis.length;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="bg-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로</span>
          </button>
          <button
            onClick={initializeGame}
            className="flex items-center gap-2 px-4 py-2 bg-[#0064FF] text-white rounded-xl hover:bg-[#0055DD] transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>다시</span>
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl mb-2">카드 매칭</h2>
          <div className="flex gap-4 text-sm text-gray-600">
            <div>이동: {moves}</div>
            <div>매칭: {matches}/{emojis.length}</div>
          </div>
        </div>

        {isGameComplete && (
          <div className="bg-blue-50 border border-[#0064FF] rounded-2xl p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-lg">
                {moves}번 만에 완성!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isChecking || card.isMatched}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-2 border-[#0064FF]'
                  : 'bg-[#0064FF] hover:bg-[#0055DD]'
              } ${
                card.isMatched ? 'opacity-50' : ''
              } active:scale-95`}
            >
              {(card.isFlipped || card.isMatched) && card.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
