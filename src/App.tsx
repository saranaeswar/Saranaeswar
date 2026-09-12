import { useState, useRef, useEffect, useCallback } from 'react';
import { ThreeGallery, GalleryCanvasHandle } from './components/canvas/ThreeGallery';
import { GalleryHeader } from './components/ui/GalleryHeader';
import { CuratorialPanel } from './components/ui/CuratorialPanel';
import { CarouselNav } from './components/ui/CarouselNav';
import { HelpModal } from './components/ui/HelpModal';
import { galleryAudio } from './components/ui/AudioAmbient';
import { ART_PIECES } from './data/artPieces';
import { StudioControls, ViewMode } from './types';

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('exhibition');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [fps, setFps] = useState(60);
  const [helpOpen, setHelpOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [controls, setControls] = useState<StudioControls>({
    isRotating: true,
    rotationSpeed: 1.0,
    isWireframe: false,
    isExploded: false,
    explosionFactor: 0.0,
    lightingPreset: 'gallery',
    colorShift: 0,
    showAura: true,
    soundEnabled: false,
  });

  const canvasHandleRef = useRef<GalleryCanvasHandle>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Handle Art Piece Selection
  const handleSelectPiece = useCallback(
    (newIndex: number) => {
      if (newIndex === activeIndex) return;
      setActiveIndex(newIndex);
      if (soundEnabled) {
        galleryAudio.playPieceChange(newIndex);
      }
      showToast(`Selected: ${ART_PIECES[newIndex].title}`);
    },
    [activeIndex, soundEnabled, showToast]
  );

  // Toggle View Mode (Exhibition Pavilion vs Inspect Studio)
  const handleToggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const nextMode = prev === 'exhibition' ? 'inspect' : 'exhibition';
      showToast(nextMode === 'inspect' ? 'Entered Inspect Studio' : 'Returned to Exhibition Pavilion');
      return nextMode;
    });
  }, [showToast]);

  // Audio Toggle
  const handleToggleSound = useCallback(() => {
    const isNowPlaying = galleryAudio.toggleMute();
    setSoundEnabled(isNowPlaying);
    setControls(prev => ({ ...prev, soundEnabled: isNowPlaying }));
    showToast(isNowPlaying ? 'Ambient soundscape enabled' : 'Sound muted');
  }, [showToast]);

  // Capture High-Res Screenshot
  const handleCaptureScreenshot = useCallback(() => {
    if (!canvasHandleRef.current) return;
    const dataUrl = canvasHandleRef.current.captureScreenshot();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `atelier-3d-${ART_PIECES[activeIndex].id}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('High-resolution snapshot saved');
  }, [activeIndex, showToast]);

  // Reset Camera
  const handleResetCamera = useCallback(() => {
    if (canvasHandleRef.current) {
      canvasHandleRef.current.resetCamera();
      showToast('Camera orientation reset');
    }
  }, [showToast]);

  // Control changes updater
  const handleChangeControls = useCallback((updates: Partial<StudioControls>) => {
    setControls(prev => ({ ...prev, ...updates }));
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleSelectPiece((activeIndex + 1) % ART_PIECES.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSelectPiece((activeIndex - 1 + ART_PIECES.length) % ART_PIECES.length);
          break;
        case ' ':
          e.preventDefault();
          setControls(prev => ({ ...prev, isRotating: !prev.isRotating }));
          break;
        case 'v':
        case 'V':
          handleToggleViewMode();
          break;
        case 'w':
        case 'W':
          setControls(prev => ({ ...prev, isWireframe: !prev.isWireframe }));
          break;
        case 'm':
        case 'M':
          handleToggleSound();
          break;
        case 'r':
        case 'R':
          handleResetCamera();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleSelectPiece, handleToggleViewMode, handleToggleSound, handleResetCamera]);

  const currentPiece = ART_PIECES[activeIndex];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#08080a] text-neutral-100 font-sans select-none">
      {/* 3D Three.js Interactive Canvas */}
      <ThreeGallery
        ref={canvasHandleRef}
        activeIndex={activeIndex}
        onSelectPiece={handleSelectPiece}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        controls={controls}
        onFpsUpdate={setFps}
        onHoverPiece={setHoveredIndex}
      />

      {/* Top Header */}
      <GalleryHeader
        activeIndex={activeIndex}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onCaptureScreenshot={handleCaptureScreenshot}
        onOpenHelp={() => setHelpOpen(true)}
        fps={fps}
      />

      {/* Side Curatorial & Studio Controls Panel */}
      <CuratorialPanel
        piece={currentPiece}
        controls={controls}
        onChangeControls={handleChangeControls}
        onResetCamera={handleResetCamera}
      />

      {/* Bottom Floating Navigation Carousel */}
      <CarouselNav
        activeIndex={activeIndex}
        onSelectPiece={handleSelectPiece}
        isRotating={controls.isRotating}
        onToggleRotating={() => setControls(prev => ({ ...prev, isRotating: !prev.isRotating }))}
        hoveredIndex={hoveredIndex}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-neutral-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 text-xs font-mono text-neutral-200 shadow-xl"
        >
          {toastMessage}
        </div>
      )}

      {/* Interaction Help Guide Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
