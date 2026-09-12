import React from 'react';
import { X, MousePointer, Move, ZoomIn, Compass, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          id="btn-close-help"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5">
          <Compass className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-display font-bold text-neutral-100">
            Gallery Interaction Guide
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Controls list */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center space-x-2 text-neutral-200 font-medium mb-1">
                <MousePointer className="w-4 h-4 text-sky-400" />
                <span>360° Orbit</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Click & drag with mouse or touch to freely rotate camera around any digital art piece.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center space-x-2 text-neutral-200 font-medium mb-1">
                <ZoomIn className="w-4 h-4 text-sky-400" />
                <span>Zoom & Inspect</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Use mouse scroll wheel or pinch to zoom close and inspect fine surface details.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center space-x-2 text-neutral-200 font-medium mb-1">
                <Move className="w-4 h-4 text-sky-400" />
                <span>Jump in 3D</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Click any art pedestal in the 3D gallery to smoothly glide the camera directly to it.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center space-x-2 text-neutral-200 font-medium mb-1">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Dual Modes</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Toggle between the wide Exhibition Pavilion and intimate Inspect Studio.
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-3 border-t border-neutral-800">
            <h4 className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 mb-2">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400 font-sans text-xs">Previous / Next Piece</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
                  ← / →
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400 font-sans text-xs">Toggle Auto-Rotation</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
                  Space
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400 font-sans text-xs">Toggle View Mode</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
                  V
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400 font-sans text-xs">Toggle Wireframe</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
                  W
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400 font-sans text-xs">Toggle Ambience Audio</span>
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200">
                  M
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            id="btn-understand-help"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl text-xs font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
