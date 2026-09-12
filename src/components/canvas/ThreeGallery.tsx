import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ART_PIECES } from '../../data/artPieces';
import { StudioControls, ViewMode, LightingPreset } from '../../types';
import {
  ArtPieceInstance,
  createQuantumMonolith,
  createCelestialMobius,
  createNeuralFlora,
  createCyberKineticGyro,
  createEphemeralRipple,
  createHypercubeTesseract,
} from './artGenerators';

interface ThreeGalleryProps {
  activeIndex: number;
  onSelectPiece: (index: number) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  controls: StudioControls;
  onFpsUpdate?: (fps: number) => void;
  onHoverPiece?: (index: number | null) => void;
}

export interface GalleryCanvasHandle {
  captureScreenshot: () => string;
  resetCamera: () => void;
}

export const ThreeGallery = React.forwardRef<GalleryCanvasHandle, ThreeGalleryProps>(({
  activeIndex,
  onSelectPiece,
  viewMode,
  controls,
  onFpsUpdate,
  onHoverPiece,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const instancesRef = useRef<ArtPieceInstance[]>([]);
  const plinthGroupsRef = useRef<THREE.Group[]>([]);

  // Orbit & Camera animation state
  const orbitState = useRef({
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    spherical: new THREE.Spherical(5.5, Math.PI / 2.3, 0),
    targetSpherical: new THREE.Spherical(5.5, Math.PI / 2.3, 0),
    centerTarget: new THREE.Vector3(0, 1.8, 0),
    currentCenter: new THREE.Vector3(0, 1.8, 0),
  });

  // Lighting references
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    mainSpot: THREE.SpotLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.PointLight;
    groundGlow: THREE.PointLight;
  } | null>(null);

  // Pedestal configuration
  // Arrange in circular gallery pavilion: Radius = 10m
  const GALLERY_RADIUS = 9.5;
  const PIECE_COUNT = ART_PIECES.length;

  const getPedestalPosition = useCallback((index: number): THREE.Vector3 => {
    const angle = (index / PIECE_COUNT) * Math.PI * 2;
    return new THREE.Vector3(
      Math.sin(angle) * GALLERY_RADIUS,
      0,
      Math.cos(angle) * GALLERY_RADIUS
    );
  }, [PIECE_COUNT]);

  // Handle lighting preset changes
  const applyLightingPreset = useCallback((preset: LightingPreset) => {
    if (!lightsRef.current) return;
    const { ambient, mainSpot, fillLight, rimLight, groundGlow } = lightsRef.current;

    switch (preset) {
      case 'gallery':
        ambient.color.set('#202028');
        ambient.intensity = 1.2;
        mainSpot.color.set('#fff8ee');
        mainSpot.intensity = 35;
        fillLight.color.set('#dbeafe');
        fillLight.intensity = 0.8;
        rimLight.color.set('#fde047');
        rimLight.intensity = 1.2;
        groundGlow.color.set(ART_PIECES[activeIndex].accentColor);
        groundGlow.intensity = 1.5;
        break;
      case 'cyber':
        ambient.color.set('#0d1117');
        ambient.intensity = 0.6;
        mainSpot.color.set('#06b6d4');
        mainSpot.intensity = 45;
        fillLight.color.set('#ec4899');
        fillLight.intensity = 2.0;
        rimLight.color.set('#3b82f6');
        rimLight.intensity = 3.0;
        groundGlow.color.set('#06b6d4');
        groundGlow.intensity = 2.5;
        break;
      case 'obsidian':
        ambient.color.set('#050508');
        ambient.intensity = 0.3;
        mainSpot.color.set('#ffffff');
        mainSpot.intensity = 55;
        fillLight.color.set('#1e293b');
        fillLight.intensity = 0.3;
        rimLight.color.set('#94a3b8');
        rimLight.intensity = 1.5;
        groundGlow.color.set('#38bdf8');
        groundGlow.intensity = 0.8;
        break;
      case 'golden':
        ambient.color.set('#29180c');
        ambient.intensity = 1.0;
        mainSpot.color.set('#f59e0b');
        mainSpot.intensity = 40;
        fillLight.color.set('#b45309');
        fillLight.intensity = 1.2;
        rimLight.color.set('#fbbf24');
        rimLight.intensity = 2.5;
        groundGlow.color.set('#f97316');
        groundGlow.intensity = 2.0;
        break;
    }
  }, [activeIndex]);

  // Expose screenshot capture and camera reset
  React.useImperativeHandle(ref, () => ({
    captureScreenshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    resetCamera: () => {
      orbitState.current.targetSpherical.radius = viewMode === 'inspect' ? 4.8 : 7.2;
      orbitState.current.targetSpherical.phi = Math.PI / 2.3;
      orbitState.current.targetSpherical.theta = 0;
    },
  }));

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#08080a');
    scene.fog = new THREE.FogExp2('#08080a', 0.035);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    cameraRef.current = camera;
    camera.position.set(0, 3.5, 9.0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // ARCHITECTURAL PAVILION
    // 1. Reflective Floor
    const floorGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a0a0e'),
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      reflectivity: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle architectural floor grid lines
    const grid = new THREE.GridHelper(50, 50, '#1e293b', '#0f172a');
    grid.position.y = 0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    scene.add(grid);

    // Gallery Center Plinth / Core monument
    const centerRingGeo = new THREE.TorusGeometry(GALLERY_RADIUS, 0.04, 8, 120);
    const centerRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#1e293b'),
      transparent: true,
      opacity: 0.6,
    });
    const centerRing = new THREE.Mesh(centerRingGeo, centerRingMat);
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.y = 0.02;
    scene.add(centerRing);

    // Ambient floating dust particles
    const dustCount = 350;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 30;
      dustPositions[i * 3 + 1] = Math.random() * 8 + 0.5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: new THREE.Color('#64748b'),
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const dustCloud = new THREE.Points(dustGeo, dustMat);
    scene.add(dustCloud);

    // LIGHTING SYSTEM
    const ambient = new THREE.AmbientLight('#202028', 1.2);
    scene.add(ambient);

    const mainSpot = new THREE.SpotLight('#fff8ee', 35);
    mainSpot.position.set(0, 9, 0);
    mainSpot.angle = Math.PI / 3;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.bias = -0.0008;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const fillLight = new THREE.DirectionalLight('#dbeafe', 0.8);
    fillLight.position.set(10, 8, 10);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight('#fde047', 1.2, 18);
    rimLight.position.set(-8, 5, -8);
    scene.add(rimLight);

    const groundGlow = new THREE.PointLight('#38bdf8', 1.5, 6);
    groundGlow.position.set(0, 0.4, 0);
    scene.add(groundGlow);

    lightsRef.current = { ambient, mainSpot, fillLight, rimLight, groundGlow };

    // INSTANTIATE PEDESTALS AND 6 ART PIECES
    const instances: ArtPieceInstance[] = [];
    const plinths: THREE.Group[] = [];

    ART_PIECES.forEach((piece, index) => {
      const pedestalPos = getPedestalPosition(index);
      const plinthGroup = new THREE.Group();
      plinthGroup.position.copy(pedestalPos);
      plinthGroup.userData = { pieceIndex: index };

      // Plinth base geometry (Matte cylindrical pedestal)
      const plinthBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.85, 32);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#121319'),
        roughness: 0.35,
        metalness: 0.6,
      });
      const plinthMesh = new THREE.Mesh(plinthBaseGeo, plinthMat);
      plinthMesh.position.y = 0.425;
      plinthMesh.receiveShadow = true;
      plinthMesh.castShadow = true;
      plinthGroup.add(plinthMesh);

      // Top reflective marble inset disc
      const discGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.05, 32);
      const discMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1e2029'),
        metalness: 0.8,
        roughness: 0.1,
        clearcoat: 1.0,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = 0.85;
      disc.receiveShadow = true;
      plinthGroup.add(disc);

      // Glowing accent rim ring on plinth
      const rimGeo = new THREE.TorusGeometry(1.42, 0.025, 16, 64);
      const rimMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(piece.accentColor),
        transparent: true,
        opacity: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.86;
      plinthGroup.add(rim);

      // Floating pedestal plaque marker
      const plaqueGeo = new THREE.BoxGeometry(0.5, 0.2, 0.04);
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#242735'),
        metalness: 0.9,
        roughness: 0.2,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      // Face towards gallery center
      const angle = (index / PIECE_COUNT) * Math.PI * 2;
      plaque.position.set(
        -Math.sin(angle) * 1.5,
        0.5,
        -Math.cos(angle) * 1.5
      );
      plaque.lookAt(0, 0.5, 0);
      plinthGroup.add(plaque);

      // Create Artwork Instance
      let instance: ArtPieceInstance;
      switch (piece.id) {
        case 'quantum-monolith':
          instance = createQuantumMonolith(piece.accentColor, piece.secondaryColor);
          break;
        case 'celestial-mobius':
          instance = createCelestialMobius(piece.accentColor, piece.secondaryColor);
          break;
        case 'neural-flora':
          instance = createNeuralFlora(piece.accentColor, piece.secondaryColor);
          break;
        case 'cyber-kinetic-gyro':
          instance = createCyberKineticGyro(piece.accentColor, piece.secondaryColor);
          break;
        case 'ephemeral-ripple':
          instance = createEphemeralRipple(piece.accentColor, piece.secondaryColor);
          break;
        case 'hypercube-tesseract':
          instance = createHypercubeTesseract(piece.accentColor, piece.secondaryColor);
          break;
        default:
          instance = createQuantumMonolith(piece.accentColor, piece.secondaryColor);
      }

      // Elevate sculpture atop plinth
      instance.group.position.y = 2.4;
      plinthGroup.add(instance.group);

      scene.add(plinthGroup);
      instances.push(instance);
      plinths.push(plinthGroup);
    });

    instancesRef.current = instances;
    plinthGroupsRef.current = plinths;

    // Apply current lighting
    applyLightingPreset(controls.lightingPreset);

    // RESIZE OBSERVER
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // ANIMATION & RENDER LOOP
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsTime = lastTime;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // FPS tracking
      frameCount++;
      if (now - lastFpsTime >= 1000) {
        if (onFpsUpdate) onFpsUpdate(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      // Update Art Pieces
      instances.forEach(inst => {
        inst.update(now * 0.001, delta, controls);
      });

      // Ambient dust drift
      if (dustCloud) {
        dustCloud.rotation.y += delta * 0.02;
      }

      // CAMERA INTERPOLATION (Smooth Hermite lerp)
      const currentPos = getPedestalPosition(activeIndex);
      const targetCenter = viewMode === 'inspect'
        ? new THREE.Vector3(currentPos.x, 2.4, currentPos.z)
        : new THREE.Vector3(currentPos.x, 2.2, currentPos.z);

      orbitState.current.centerTarget.lerp(targetCenter, 0.06);

      // Interpolate spherical orbit coordinates
      const s = orbitState.current.spherical;
      const ts = orbitState.current.targetSpherical;

      s.radius += (ts.radius - s.radius) * 0.08;
      s.phi += (ts.phi - s.phi) * 0.08;
      s.theta += (ts.theta - s.theta) * 0.08;

      // Constrain phi to avoid flipping over poles
      s.phi = Math.max(0.1, Math.min(Math.PI - 0.15, s.phi));

      // Calculate camera position relative to target center
      const camOffset = new THREE.Vector3().setFromSpherical(s);
      const desiredCamPos = orbitState.current.centerTarget.clone().add(camOffset);
      camera.position.lerp(desiredCamPos, 0.08);
      camera.lookAt(orbitState.current.centerTarget);

      // Move main spotlight to follow active sculpture
      if (lightsRef.current) {
        lightsRef.current.mainSpot.target.position.copy(orbitState.current.centerTarget);
        lightsRef.current.mainSpot.target.updateMatrixWorld();
        lightsRef.current.mainSpot.position.set(
          orbitState.current.centerTarget.x,
          9,
          orbitState.current.centerTarget.z
        );
        lightsRef.current.groundGlow.position.set(
          orbitState.current.centerTarget.x,
          0.9,
          orbitState.current.centerTarget.z
        );
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      instances.forEach(inst => inst.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run once on mount

  // Watch for activeIndex or viewMode changes to reposition camera target
  useEffect(() => {
    const targetRadius = viewMode === 'inspect' ? 4.6 : 6.8;
    orbitState.current.targetSpherical.radius = targetRadius;

    // Angle of target pedestal
    const angle = (activeIndex / PIECE_COUNT) * Math.PI * 2;
    // Set camera offset so it views the piece directly
    orbitState.current.targetSpherical.theta = angle;
    orbitState.current.targetSpherical.phi = viewMode === 'inspect' ? Math.PI / 2.3 : Math.PI / 2.5;

    // Update ground glow color
    if (lightsRef.current) {
      lightsRef.current.groundGlow.color.set(ART_PIECES[activeIndex].accentColor);
    }
  }, [activeIndex, viewMode, PIECE_COUNT]);

  // Apply Lighting Presets
  useEffect(() => {
    applyLightingPreset(controls.lightingPreset);
  }, [controls.lightingPreset, applyLightingPreset]);

  // Apply Wireframe, ColorShift, Explosion
  useEffect(() => {
    instancesRef.current.forEach(inst => {
      inst.setWireframe(controls.isWireframe);
      inst.setColorShift(controls.colorShift);
      inst.setExplosion(controls.explosionFactor);
    });
  }, [controls.isWireframe, controls.colorShift, controls.explosionFactor]);

  // RAYCASTING & CLICK SELECTION
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    orbitState.current.isDragging = true;
    orbitState.current.prevMouse = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (orbitState.current.isDragging) {
      const deltaX = e.clientX - orbitState.current.prevMouse.x;
      const deltaY = e.clientY - orbitState.current.prevMouse.y;
      orbitState.current.prevMouse = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.005;
      orbitState.current.targetSpherical.theta -= deltaX * rotateSpeed;
      orbitState.current.targetSpherical.phi -= deltaY * rotateSpeed;
    } else {
      // Raycasting for hover state
      if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(plinthGroupsRef.current, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && currentObj.userData.pieceIndex === undefined && currentObj.parent) {
          currentObj = currentObj.parent;
        }
        if (currentObj && currentObj.userData.pieceIndex !== undefined) {
          if (onHoverPiece) onHoverPiece(currentObj.userData.pieceIndex);
          if (containerRef.current) containerRef.current.style.cursor = 'grab';
          return;
        }
      }
      if (onHoverPiece) onHoverPiece(null);
      if (containerRef.current) containerRef.current.style.cursor = 'default';
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    orbitState.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomSpeed = 0.0025;
    const minRadius = 2.6;
    const maxRadius = 14.0;
    orbitState.current.targetSpherical.radius = Math.max(
      minRadius,
      Math.min(maxRadius, orbitState.current.targetSpherical.radius + e.deltaY * zoomSpeed)
    );
  };

  // Click on 3D Pedestal in Exhibition Mode to jump to that piece
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cameraRef.current || !sceneRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(plinthGroupsRef.current, true);

    if (intersects.length > 0) {
      let currentObj: THREE.Object3D | null = intersects[0].object;
      while (currentObj && currentObj.userData.pieceIndex === undefined && currentObj.parent) {
        currentObj = currentObj.parent;
      }
      if (currentObj && currentObj.userData.pieceIndex !== undefined) {
        const clickedIndex = currentObj.userData.pieceIndex;
        if (clickedIndex !== activeIndex) {
          onSelectPiece(clickedIndex);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="three-gallery-canvas-container"
      className="absolute inset-0 w-full h-full touch-none select-none outline-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
});

ThreeGallery.displayName = 'ThreeGallery';
