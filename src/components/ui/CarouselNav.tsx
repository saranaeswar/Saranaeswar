import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { ART_PIECES } from '../../data/artPieces';

interface CarouselNavProps {
  activeIndex: number;
  onSelectPiece: (index: number) => void;
  isRotating: boolean;
  onToggleRotating: () => void;
  hoveredIndex: number | null;
}

export const CarouselNav: React.FC<CarouselNavProps> = ({
  activeIndex,
  onSelectPiece,
  isRotating,
  onToggleRotating,
  hoveredIndex,
}) => {
  const handlePrev = () => {
    onSelectPiece((activeIndex - 1 + ART_PIECES.length) % ART_PIECES.length);
  };

  const handleNext = () => {
    onSelectPiece((activeIndex + 1) % ART_PIECES.length);
  };

  return (
    <nav aria-label="Artwork Navigation" className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-2xl px-4 flex flex-col items-center space-y-2">
      {/* Active Sculpture Hover Tooltip / Sub-status if hovered */}
      {hoveredIndex !== null && hoveredIndex !== activeIndex && (
        <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono border border-neutral-800 text-neutral-300 animate-fade-in shadow-lg">
          Click to view: <span className="font-semibold text-neutral-100">{ART_PIECES[hoveredIndex].title}</span>
        </div>
      )}

      {/* Main Navigator Dock */}
      <div className="pointer-events-auto bg-neutral-900/85 backdrop-blur-xl border border-neutral-800/80 rounded-full p-1.5 shadow-2xl flex items-center space-x-1 sm:space-x-2 max-w-full overflow-x-auto">
        {/* Prev Button */}
        <button
          id="btn-nav-prev"
          onClick={handlePrev}
          className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0"
          title="Previous artwork (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Art Capsules */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {ART_PIECES.map((piece, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={piece.id}
                id={`btn-carousel-item-${idx}`}
                onClick={() => onSelectPiece(idx)}
                className={`group relative px-2.5 sm:px-3 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-2 text-xs font-medium shrink-0 ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-md ring-1 ring-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {/* Dot with accent glow */}
                <span
                  className={`w-2 h-2 rounded-full transition-transform duration-200 ${
                    isActive ? 'scale-125' : 'group-hover:scale-110 opacity-60'
                  }`}
                  style={{ backgroundColor: piece.accentColor }}
                />

                {/* Number index on mobile, full short title on desktop */}
                <span className="font-mono text-[11px]">0{idx + 1}</span>
                <span className={`hidden md:inline text-xs truncate max-w-[90px] ${isActive ? 'font-semibold' : ''}`}>
                  {piece.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          id="btn-nav-next"
          onClick={handleNext}
          className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0"
          title="Next artwork (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-neutral-800 shrink-0 mx-0.5" />

        {/* Quick Play/Pause */}
        <button
          id="btn-nav-quick-rotate"
          onClick={onToggleRotating}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            isRotating
              ? 'text-sky-400 hover:bg-neutral-800'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
          title={isRotating ? 'Pause rotation (Space)' : 'Resume rotation (Space)'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </nav>
  );
};
