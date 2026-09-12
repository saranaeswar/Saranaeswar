import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sliders,
  BookOpen,
  RotateCw,
  Sun,
  Palette,
  Box,
  Sparkles,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { ArtPieceMetadata, StudioControls, LightingPreset } from '../../types';

interface CuratorialPanelProps {
  piece: ArtPieceMetadata;
  controls: StudioControls;
  onChangeControls: (updates: Partial<StudioControls>) => void;
  onResetCamera: () => void;
}

export const CuratorialPanel: React.FC<CuratorialPanelProps> = ({
  piece,
  controls,
  onChangeControls,
  onResetCamera,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'studio'>('info');

  const lightingPresets: { id: LightingPreset; label: string; desc: string }[] = [
    { id: 'gallery', label: 'Gallery', desc: 'Warm museum spotlights' },
    { id: 'cyber', label: 'Cyber', desc: 'Neon cyan & magenta' },
    { id: 'obsidian', label: 'Obsidian', desc: 'High-contrast chiaroscuro' },
    { id: 'golden', label: 'Golden', desc: 'Sunset amber glow' },
  ];

  return (
    <aside
      className={`absolute top-20 right-4 sm:right-6 z-20 transition-transform duration-300 pointer-events-auto flex items-start ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]'
      }`}
    >
      {/* Toggle Tab Button */}
      <button
        id="btn-toggle-curatorial-panel"
        onClick={() => setIsOpen(!isOpen)}
        className="mr-2 mt-4 p-2.5 rounded-full bg-neutral-900/90 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 border border-neutral-800 shadow-2xl backdrop-blur-md transition-colors"
        title={isOpen ? 'Collapse panel' : 'Expand curatorial panel'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Card Container */}
      <div className="w-[320px] sm:w-[370px] max-h-[calc(100vh-10rem)] bg-neutral-900/90 backdrop-blur-xl border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-neutral-800/80 bg-neutral-950/40 p-1.5">
          <button
            id="tab-curatorial-info"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'info'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curatorial</span>
          </button>
          <button
            id="tab-studio-controls"
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'studio'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio Controls</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {activeTab === 'info' ? (
            /* Curatorial View */
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400">
                    {piece.artist} &middot; {piece.year}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: piece.accentColor }}
                  />
                </div>
                <h2 className="text-xl font-display font-bold text-neutral-100 tracking-tight">
                  {piece.title}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5 italic">
                  {piece.medium}
                </p>
              </div>

              {/* Artwork Statement */}
              <div className="space-y-1.5 text-xs leading-relaxed text-neutral-300">
                <p>{piece.description}</p>
              </div>

              {/* Curator Critique Box */}
              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-neutral-400" />
                  <span>Curatorial Notes</span>
                </h4>
                <p className="text-xs text-neutral-300 italic leading-relaxed">
                  &ldquo;{piece.curatorNotes}&rdquo;
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="border-t border-neutral-800/60 pt-3">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Technical Specifications
                </h4>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-neutral-950/40">
                    <dt className="text-[10px] text-neutral-400 font-mono">GEOMETRY</dt>
                    <dd className="font-mono text-neutral-200 text-[11px] mt-0.5">{piece.specs.polyCount}</dd>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/40">
                    <dt className="text-[10px] text-neutral-400 font-mono">DIMENSIONS</dt>
                    <dd className="font-mono text-neutral-200 text-[11px] mt-0.5">{piece.specs.dimensions}</dd>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/40 col-span-2">
                    <dt className="text-[10px] text-neutral-400 font-mono">METHOD</dt>
                    <dd className="text-neutral-200 text-[11px] mt-0.5">{piece.specs.technique}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            /* Studio Controls View */
            <div className="space-y-4">
              {/* Rotation Dynamics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-rotation-speed" className="text-xs font-medium text-neutral-300 flex items-center space-x-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Rotation Velocity</span>
                  </label>
                  <button
                    id="btn-toggle-rotating"
                    onClick={() => onChangeControls({ isRotating: !controls.isRotating })}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                      controls.isRotating
                        ? 'bg-neutral-800 text-sky-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {controls.isRotating ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>
                <input
                  id="input-rotation-speed"
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={controls.rotationSpeed}
                  onChange={e => onChangeControls({ rotationSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                  <span>0x</span>
                  <span>{controls.rotationSpeed.toFixed(1)}x</span>
                  <span>3.0x</span>
                </div>
              </div>

              {/* Exploded Architecture Slider */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-explosion-factor" className="text-xs font-medium text-neutral-300 flex items-center space-x-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Deconstructed View</span>
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {Math.round(controls.explosionFactor * 100)}%
                  </span>
                </div>
                <input
                  id="input-explosion-factor"
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={controls.explosionFactor}
                  onChange={e => onChangeControls({ explosionFactor: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>

              {/* Wireframe Toggle */}
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Box className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-300">Wireframe Mesh</span>
                </div>
                <button
                  id="btn-toggle-wireframe"
                  onClick={() => onChangeControls({ isWireframe: !controls.isWireframe })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                    controls.isWireframe ? 'bg-sky-500' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      controls.isWireframe ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Lighting Presets */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                <label className="text-xs font-medium text-neutral-300 flex items-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Curated Lighting</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {lightingPresets.map(preset => (
                    <button
                      key={preset.id}
                      id={`btn-preset-${preset.id}`}
                      onClick={() => onChangeControls({ lightingPreset: preset.id })}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        controls.lightingPreset === preset.id
                          ? 'border-sky-500/80 bg-sky-950/20 text-sky-200 shadow-sm'
                          : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                      }`}
                    >
                      <div className="text-xs font-medium">{preset.label}</div>
                      <div className="text-[10px] text-neutral-400 truncate">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Hue Shift */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-color-shift" className="text-xs font-medium text-neutral-300 flex items-center space-x-1.5">
                    <Palette className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Hue Calibration</span>
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {controls.colorShift}°
                  </span>
                </div>
                <input
                  id="input-color-shift"
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={controls.colorShift}
                  onChange={e => onChangeControls({ colorShift: parseInt(e.target.value, 10) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                  }}
                />
              </div>

              {/* Reset Camera */}
              <div className="pt-3 border-t border-neutral-800/60">
                <button
                  id="btn-reset-camera"
                  onClick={onResetCamera}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 border border-neutral-800/80 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recenter Viewing Angle</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
