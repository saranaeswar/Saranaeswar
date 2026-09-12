import React from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  Maximize,
  Minimize,
  HelpCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { ViewMode } from '../../types';
import { ART_PIECES } from '../../data/artPieces';

interface GalleryHeaderProps {
  activeIndex: number;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCaptureScreenshot: () => void;
  onOpenHelp: () => void;
  fps: number;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  activeIndex,
  viewMode,
  onToggleViewMode,
  soundEnabled,
  onToggleSound,
  onCaptureScreenshot,
  onOpenHelp,
  fps,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentPiece = ART_PIECES[activeIndex];

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-4 sm:p-6 flex items-start justify-between">
      {/* Brand & Artwork Index */}
      <div className="pointer-events-auto flex items-center space-x-3 bg-neutral-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-neutral-800 shadow-xl">
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentPiece.accentColor }} />
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">ATELIER 3D</span>
            <span className="text-neutral-600 text-xs">/</span>
            <span className="text-xs font-mono font-medium text-neutral-200">
              0{activeIndex + 1} &middot; 0{ART_PIECES.length}
            </span>
          </div>
          <span className="text-sm font-semibold text-neutral-100 truncate max-w-[140px] sm:max-w-none">
            {currentPiece.title}
          </span>
        </div>
      </div>

      {/* Mode Switcher & Actions */}
      <div className="pointer-events-auto flex items-center space-x-2 bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-full border border-neutral-800 shadow-xl">
        {/* View Mode Toggle Button */}
        <button
          id="btn-toggle-view-mode"
          onClick={onToggleViewMode}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:bg-neutral-800 text-neutral-200"
          title={viewMode === 'exhibition' ? 'Switch to Inspect Studio' : 'Switch to Exhibition Pavilion'}
        >
          {viewMode === 'exhibition' ? (
            <>
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Inspect Piece</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Pavilion Mode</span>
            </>
          )}
        </button>

        <div className="w-px h-4 bg-neutral-800" />

        {/* Audio Ambience Toggle */}
        <button
          id="btn-toggle-audio"
          onClick={onToggleSound}
          className={`p-2 rounded-full transition-colors ${
            soundEnabled
              ? 'text-sky-400 bg-sky-950/40 hover:bg-sky-900/50'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
          title={soundEnabled ? 'Mute generative soundscape' : 'Enable ambient soundscape'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Screenshot / Snapshot */}
        <button
          id="btn-capture-screenshot"
          onClick={onCaptureScreenshot}
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors"
          title="Capture high-res snapshot"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Help / Guide */}
        <button
          id="btn-open-help"
          onClick={onOpenHelp}
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors"
          title="Controls and shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          id="btn-toggle-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-full transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* FPS Counter */}
        <div className="px-2 py-1 text-[10px] font-mono text-neutral-400 hidden md:block">
          {fps} FPS
        </div>
      </div>
    </header>
  );
};
