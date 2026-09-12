export type LightingPreset = 'gallery' | 'cyber' | 'obsidian' | 'golden';

export type ViewMode = 'exhibition' | 'inspect';

export interface ArtPieceMetadata {
  id: string;
  title: string;
  artist: string;
  year: string;
  medium: string;
  description: string;
  curatorNotes: string;
  specs: {
    polyCount: string;
    dimensions: string;
    technique: string;
    edition: string;
  };
  accentColor: string;
  secondaryColor: string;
  defaultRotationSpeed: number;
}

export interface StudioControls {
  isRotating: boolean;
  rotationSpeed: number;
  isWireframe: boolean;
  isExploded: boolean;
  explosionFactor: number;
  lightingPreset: LightingPreset;
  colorShift: number; // 0 to 360 hue offset
  showAura: boolean;
  soundEnabled: boolean;
}
