import * as THREE from 'three';
import { StudioControls } from '../../types';

export interface ArtPieceInstance {
  group: THREE.Group;
  update: (time: number, delta: number, controls: StudioControls) => void;
  setWireframe: (wireframe: boolean) => void;
  setColorShift: (hueOffset: number) => void;
  setExplosion: (factor: number) => void;
  dispose: () => void;
}

// Helper to convert HSL adjustments to materials
function shiftMaterialColor(mat: THREE.Material, baseColorHex: string, hueOffset: number) {
  if ('color' in mat && (mat as THREE.MeshStandardMaterial).color) {
    const stdMat = mat as THREE.MeshStandardMaterial;
    const baseColor = new THREE.Color(baseColorHex);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    hsl.h = (hsl.h + hueOffset / 360) % 1.0;
    if (hsl.h < 0) hsl.h += 1.0;
    stdMat.color.setHSL(hsl.h, hsl.s, hsl.l);
    if ('emissive' in stdMat && stdMat.emissive && stdMat.emissive.getHex() !== 0) {
      stdMat.emissive.setHSL(hsl.h, hsl.s, Math.min(hsl.l * 0.8, 0.5));
    }
  }
}

// 1. QUANTUM MONOLITH
export function createQuantumMonolith(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'quantum-monolith';

  const materials: THREE.Material[] = [];
  const explodables: { obj: THREE.Object3D; originalPos: THREE.Vector3; dir: THREE.Vector3 }[] = [];

  // Central Obsidian Faceted Monolith
  const obeliskGeo = new THREE.CylinderGeometry(0.7, 1.4, 4.2, 6, 1);
  const obeliskMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0c1017'),
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.95,
  });
  materials.push(obeliskMat);
  const obeliskMesh = new THREE.Mesh(obeliskGeo, obeliskMat);
  obeliskMesh.castShadow = true;
  obeliskMesh.receiveShadow = true;
  group.add(obeliskMesh);

  // Inner Quantum Core (Pulsing glowing icosahedron)
  const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 2.2,
    roughness: 0.2,
    wireframe: false,
  });
  materials.push(coreMat);
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // Orbiting Crystalline Shards
  const shardsGroup = new THREE.Group();
  group.add(shardsGroup);

  const shardGeo1 = new THREE.OctahedronGeometry(0.28, 0);
  const shardGeo2 = new THREE.TetrahedronGeometry(0.25, 0);
  const shardMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(secondaryHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 0.4,
    metalness: 0.8,
    roughness: 0.15,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.9,
  });
  materials.push(shardMat);

  const shardItems: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; y: number; rotSpeed: THREE.Vector3 }[] = [];
  const shardCount = 20;

  for (let i = 0; i < shardCount; i++) {
    const geo = i % 2 === 0 ? shardGeo1 : shardGeo2;
    const mesh = new THREE.Mesh(geo, shardMat);
    const radius = 1.8 + Math.sin(i * 1.5) * 0.7;
    const angle = (i / shardCount) * Math.PI * 2;
    const y = ((i - shardCount / 2) / (shardCount / 2)) * 1.8;

    mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    mesh.castShadow = true;
    shardsGroup.add(mesh);

    const dir = mesh.position.clone().normalize();
    explodables.push({ obj: mesh, originalPos: mesh.position.clone(), dir });

    shardItems.push({
      mesh,
      angle,
      speed: 0.6 + (i % 5) * 0.25,
      radius,
      y,
      rotSpeed: new THREE.Vector3(Math.random() * 2, Math.random() * 2, Math.random() * 2),
    });
  }

  // Floating horizontal energy rings
  const ringGeo = new THREE.TorusGeometry(1.6, 0.015, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentHex),
    transparent: true,
    opacity: 0.7,
  });
  materials.push(ringMat);
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.rotation.x = Math.PI / 2.3;
  ring2.scale.set(1.25, 1.25, 1.25);
  group.add(ring2);

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      // Rotation
      if (controls.isRotating) {
        group.rotation.y += delta * 0.5 * controls.rotationSpeed;
      }

      // Core pulsation
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.12;
      coreMesh.scale.set(pulse, pulse, pulse);
      coreMat.emissiveIntensity = 1.8 + Math.sin(time * 5.0) * 0.7;

      // Orbiting shards animation
      shardItems.forEach(item => {
        item.angle += delta * item.speed * 0.8 * controls.rotationSpeed;
        const currentY = item.y + Math.sin(time * 2 + item.angle) * 0.2;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.z = Math.sin(item.angle) * item.radius;
        item.mesh.position.y = currentY;

        item.mesh.rotation.x += item.rotSpeed.x * delta;
        item.mesh.rotation.y += item.rotSpeed.y * delta;
      });

      ring1.rotation.z += delta * 0.4;
      ring2.rotation.z -= delta * 0.3;
      ring1.position.y = Math.sin(time * 1.5) * 0.15;
      ring2.position.y = Math.cos(time * 1.2) * 0.18;
    },
    setWireframe: (wf: boolean) => {
      materials.forEach(m => {
        if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = wf;
      });
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(coreMat, accentHex, hue);
      shiftMaterialColor(shardMat, secondaryHex, hue);
      shiftMaterialColor(ringMat, accentHex, hue);
    },
    setExplosion: (factor: number) => {
      explodables.forEach(item => {
        const offset = item.dir.clone().multiplyScalar(factor * 2.5);
        item.obj.position.copy(item.originalPos.clone().add(offset));
      });
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      obeliskGeo.dispose();
      coreGeo.dispose();
      shardGeo1.dispose();
      shardGeo2.dispose();
      ringGeo.dispose();
    },
  };
}

// 2. CELESTIAL MÖBIUS
export function createCelestialMobius(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'celestial-mobius';

  const materials: THREE.Material[] = [];
  const explodables: { obj: THREE.Object3D; originalPos: THREE.Vector3; dir: THREE.Vector3 }[] = [];

  // Generate Parametric Möbius Ribbon
  const uSegments = 140;
  const vSegments = 24;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const radius = 1.9;
  const width = 0.65;

  for (let i = 0; i <= uSegments; i++) {
    const u = (i / uSegments) * Math.PI * 2;
    for (let j = 0; j <= vSegments; j++) {
      const v = ((j / vSegments) - 0.5) * width;

      // Parametric formula for Möbius strip
      const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);

      positions.push(x, y, z);

      // Normal approximation
      const nx = Math.cos(u) * Math.sin(u / 2);
      const ny = Math.sin(u) * Math.sin(u / 2);
      const nz = -Math.cos(u / 2);
      normals.push(nx, ny, nz);

      uvs.push(i / uSegments, j / vSegments);
    }
  }

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = i * (vSegments + 1) + j;
      const b = (i + 1) * (vSegments + 1) + j;
      const c = (i + 1) * (vSegments + 1) + (j + 1);
      const d = i * (vSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const mobiusGeo = new THREE.BufferGeometry();
  mobiusGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  mobiusGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  mobiusGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  mobiusGeo.setIndex(indices);
  mobiusGeo.computeVertexNormals();

  // Solid iridescent physical material
  const mobiusMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 0.25,
    metalness: 0.9,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });
  materials.push(mobiusMat);

  const mobiusMesh = new THREE.Mesh(mobiusGeo, mobiusMat);
  mobiusMesh.castShadow = true;
  group.add(mobiusMesh);

  // Outer wireframe ghost ribbon
  const wireMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(secondaryHex),
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  materials.push(wireMat);
  const wireMesh = new THREE.Mesh(mobiusGeo, wireMat);
  wireMesh.scale.set(1.04, 1.04, 1.04);
  group.add(wireMesh);

  // Stardust floating particles along the strip
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount; p++) {
    const u = Math.random() * Math.PI * 2;
    const v = (Math.random() - 0.5) * (width * 1.8);
    const r = radius + (Math.random() - 0.5) * 0.4;
    particlePos[p * 3] = (r + v * Math.cos(u / 2)) * Math.cos(u);
    particlePos[p * 3 + 1] = (r + v * Math.cos(u / 2)) * Math.sin(u);
    particlePos[p * 3 + 2] = v * Math.sin(u / 2);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: new THREE.Color('#ffffff'),
    size: 0.04,
    transparent: true,
    opacity: 0.8,
  });
  materials.push(particleMat);
  const particleCloud = new THREE.Points(particleGeo, particleMat);
  group.add(particleCloud);

  explodables.push({ obj: wireMesh, originalPos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0, 1, 0) });

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      if (controls.isRotating) {
        group.rotation.x += delta * 0.4 * controls.rotationSpeed;
        group.rotation.y += delta * 0.6 * controls.rotationSpeed;
      }
      mobiusMat.emissiveIntensity = 0.25 + Math.sin(time * 3) * 0.15;
      wireMesh.rotation.z += delta * 0.1;
      particleCloud.rotation.z += delta * 0.2;
    },
    setWireframe: (wf: boolean) => {
      mobiusMat.wireframe = wf;
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(mobiusMat, accentHex, hue);
      shiftMaterialColor(wireMat, secondaryHex, hue);
    },
    setExplosion: (factor: number) => {
      wireMesh.scale.set(1.04 + factor * 0.6, 1.04 + factor * 0.6, 1.04 + factor * 0.6);
      particleCloud.scale.set(1.0 + factor * 0.8, 1.0 + factor * 0.8, 1.0 + factor * 0.8);
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      mobiusGeo.dispose();
      particleGeo.dispose();
    },
  };
}

// 3. NEURAL FLORA
export function createNeuralFlora(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'neural-flora';

  const materials: THREE.Material[] = [];
  const petals: { mesh: THREE.Mesh; baseScale: THREE.Vector3; phase: number; origPos: THREE.Vector3; dir: THREE.Vector3 }[] = [];
  const nodes: THREE.Mesh[] = [];

  // Central core
  const stemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#064e3b'),
    roughness: 0.4,
    metalness: 0.6,
  });
  materials.push(stemMat);

  const petalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.7,
    clearcoat: 0.8,
    transmission: 0.2,
    side: THREE.DoubleSide,
  });
  materials.push(petalMat);

  const nodeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#ffffff'),
  });
  materials.push(nodeMat);

  // Fibonacci Phyllotaxis Generation
  const petalCount = 42;
  const goldenAngle = 137.5 * (Math.PI / 180);
  const petalGeo = new THREE.ConeGeometry(0.35, 1.6, 6);
  petalGeo.rotateX(Math.PI / 2); // align along growth vector

  const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);

  for (let i = 0; i < petalCount; i++) {
    const t = i / petalCount;
    const r = Math.sqrt(t) * 1.8;
    const theta = i * goldenAngle;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (1 - t * 1.2) * 1.5 - 0.5;

    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(x, y, z);

    // Orient petal outward and upward
    petal.lookAt(x * 2.2, y + 1.2 + (1 - t) * 0.8, z * 2.2);

    const scale = 0.5 + Math.sin(t * Math.PI) * 0.9;
    petal.scale.set(scale, scale, scale * 1.2);
    petal.castShadow = true;
    group.add(petal);

    // Tip node
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(0, 0, 0.8);
    petal.add(node);
    nodes.push(node);

    const dir = new THREE.Vector3(x, y, z).normalize();
    petals.push({
      mesh: petal,
      baseScale: petal.scale.clone(),
      phase: i * 0.2,
      origPos: petal.position.clone(),
      dir,
    });
  }

  // Central blooming pod
  const podGeo = new THREE.SphereGeometry(0.45, 16, 16);
  const podMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(secondaryHex),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 1.5,
    roughness: 0.1,
  });
  materials.push(podMat);
  const pod = new THREE.Mesh(podGeo, podMat);
  pod.position.y = 0.6;
  group.add(pod);

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      if (controls.isRotating) {
        group.rotation.y += delta * 0.4 * controls.rotationSpeed;
      }

      // Organic breathing of petals
      petals.forEach(p => {
        const breathe = 1.0 + Math.sin(time * 2.5 + p.phase) * 0.08;
        p.mesh.scale.set(
          p.baseScale.x * breathe,
          p.baseScale.y * breathe,
          p.baseScale.z * (1.0 + Math.cos(time * 2.0 + p.phase) * 0.1)
        );
      });

      // Flashing synaptic tip nodes
      nodes.forEach((n, idx) => {
        const spark = Math.sin(time * 6 + idx) > 0.85 ? 1 : 0.2;
        n.scale.setScalar(spark * 1.4);
      });

      const podPulse = 1.0 + Math.sin(time * 3) * 0.1;
      pod.scale.set(podPulse, podPulse, podPulse);
    },
    setWireframe: (wf: boolean) => {
      petals.forEach(p => {
        petalMat.wireframe = wf;
      });
      podMat.wireframe = wf;
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(petalMat, accentHex, hue);
      shiftMaterialColor(podMat, secondaryHex, hue);
    },
    setExplosion: (factor: number) => {
      petals.forEach(p => {
        const offset = p.dir.clone().multiplyScalar(factor * 2.0);
        p.mesh.position.copy(p.origPos.clone().add(offset));
      });
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      petalGeo.dispose();
      nodeGeo.dispose();
      podGeo.dispose();
    },
  };
}

// 4. CYBER KINETIC GYRO
export function createCyberKineticGyro(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'cyber-kinetic-gyro';

  const materials: THREE.Material[] = [];
  const explodables: { obj: THREE.Object3D; originalPos: THREE.Vector3; dir: THREE.Vector3 }[] = [];

  // Ring 1 (Outer)
  const ring1Geo = new THREE.TorusGeometry(2.1, 0.09, 16, 80);
  const metalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#334155'),
    metalness: 0.95,
    roughness: 0.18,
  });
  materials.push(metalMat);
  const ring1 = new THREE.Mesh(ring1Geo, metalMat);
  ring1.castShadow = true;
  group.add(ring1);
  explodables.push({ obj: ring1, originalPos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0, 1.2, 0) });

  // Outer Neon Accent Ring
  const neonMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accentHex) });
  materials.push(neonMat);
  const neon1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.02, 8, 80), neonMat);
  ring1.add(neon1);

  // Ring 2 (Middle)
  const ring2Geo = new THREE.TorusGeometry(1.6, 0.08, 16, 70);
  const ring2 = new THREE.Mesh(ring2Geo, metalMat);
  ring2.castShadow = true;
  group.add(ring2);
  explodables.push({ obj: ring2, originalPos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(1.2, 0, 0) });

  const neon2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.02, 8, 70), neonMat);
  ring2.add(neon2);

  // Ring 3 (Inner)
  const ring3Geo = new THREE.TorusGeometry(1.15, 0.07, 16, 60);
  const ring3 = new THREE.Mesh(ring3Geo, metalMat);
  ring3.castShadow = true;
  group.add(ring3);
  explodables.push({ obj: ring3, originalPos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0, 0, 1.2) });

  // Center Stellated Icosahedron
  const centerGeo = new THREE.DodecahedronGeometry(0.55, 0);
  const centerMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(secondaryHex),
    emissive: new THREE.Color(accentHex),
    emissiveIntensity: 1.8,
    metalness: 0.5,
    roughness: 0.2,
    clearcoat: 1.0,
  });
  materials.push(centerMat);
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  group.add(centerMesh);

  // Laser spokes radiating from core
  const spokeGroup = new THREE.Group();
  const spokeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accentHex),
    transparent: true,
    opacity: 0.6,
  });
  materials.push(spokeMat);
  const spokeGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 8);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(spokeGeo, spokeMat);
    spoke.rotation.z = (i / 6) * Math.PI;
    spokeGroup.add(spoke);
  }
  group.add(spokeGroup);

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      const speed = controls.rotationSpeed * (controls.isRotating ? 1.0 : 0.0);
      ring1.rotation.x += delta * 0.9 * speed;
      ring1.rotation.y += delta * 0.3 * speed;

      ring2.rotation.y += delta * 1.3 * speed;
      ring2.rotation.z += delta * 0.5 * speed;

      ring3.rotation.z += delta * 1.8 * speed;
      ring3.rotation.x += delta * 0.6 * speed;

      centerMesh.rotation.y += delta * 2.2 * speed;
      centerMesh.rotation.x -= delta * 1.5 * speed;

      const pulse = 1.0 + Math.sin(time * 4) * 0.15;
      centerMesh.scale.set(pulse, pulse, pulse);
      spokeGroup.rotation.y -= delta * 0.5 * speed;
    },
    setWireframe: (wf: boolean) => {
      metalMat.wireframe = wf;
      centerMat.wireframe = wf;
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(neonMat, accentHex, hue);
      shiftMaterialColor(centerMat, secondaryHex, hue);
      shiftMaterialColor(spokeMat, accentHex, hue);
    },
    setExplosion: (factor: number) => {
      explodables.forEach(item => {
        const offset = item.dir.clone().multiplyScalar(factor * 1.6);
        item.obj.position.copy(item.originalPos.clone().add(offset));
      });
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      centerGeo.dispose();
      spokeGeo.dispose();
    },
  };
}

// 5. EPHEMERAL RIPPLE
export function createEphemeralRipple(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'ephemeral-ripple';

  const materials: THREE.Material[] = [];
  const explodables: { obj: THREE.Object3D; originalPos: THREE.Vector3; dir: THREE.Vector3 }[] = [];

  // Fluid Sphere with dynamic vertex displacement
  const sphereGeo = new THREE.IcosahedronGeometry(1.65, 24);
  const posAttr = sphereGeo.attributes.position;
  const originalPositions = new Float32Array(posAttr.array);

  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 0.15,
    metalness: 0.98,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  });
  materials.push(chromeMat);

  const sphereMesh = new THREE.Mesh(sphereGeo, chromeMat);
  sphereMesh.castShadow = true;
  group.add(sphereMesh);

  // Satellite floating droplets
  const dropletGroup = new THREE.Group();
  group.add(dropletGroup);

  const dropGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(secondaryHex),
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
  });
  materials.push(dropMat);

  const drops: { mesh: THREE.Mesh; angle: number; speed: number; dist: number; yOffset: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const mesh = new THREE.Mesh(dropGeo, dropMat);
    const dist = 2.1 + (i % 3) * 0.4;
    const angle = (i / 14) * Math.PI * 2;
    const yOffset = ((i - 7) / 7) * 1.2;
    mesh.position.set(Math.cos(angle) * dist, yOffset, Math.sin(angle) * dist);
    const scale = 0.5 + Math.random() * 0.7;
    mesh.scale.set(scale, scale, scale);
    dropletGroup.add(mesh);
    drops.push({ mesh, angle, speed: 0.8 + (i % 4) * 0.3, dist, yOffset });

    const dir = mesh.position.clone().normalize();
    explodables.push({ obj: mesh, originalPos: mesh.position.clone(), dir });
  }

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      if (controls.isRotating) {
        group.rotation.y += delta * 0.5 * controls.rotationSpeed;
      }

      // Deform fluid vertices along normal based on trigonometric spherical harmonics
      const posArray = posAttr.array as Float32Array;
      const count = posAttr.count;
      const speed = controls.rotationSpeed * 2.2;

      for (let i = 0; i < count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / len;
        const ny = oy / len;
        const nz = oz / len;

        // Wave formula
        const wave =
          Math.sin(nx * 4.0 + time * speed) *
          Math.cos(ny * 4.0 + time * speed * 0.8) *
          Math.sin(nz * 3.5 + time * speed * 1.2) *
          0.22;

        const newR = len + wave;
        posArray[i * 3] = nx * newR;
        posArray[i * 3 + 1] = ny * newR;
        posArray[i * 3 + 2] = nz * newR;
      }

      posAttr.needsUpdate = true;
      sphereGeo.computeVertexNormals();

      // Droplets orbit
      drops.forEach(d => {
        d.angle += delta * d.speed * controls.rotationSpeed;
        d.mesh.position.x = Math.cos(d.angle) * d.dist;
        d.mesh.position.z = Math.sin(d.angle) * d.dist;
        d.mesh.position.y = d.yOffset + Math.sin(time * 2.0 + d.angle) * 0.2;
      });
    },
    setWireframe: (wf: boolean) => {
      chromeMat.wireframe = wf;
      dropMat.wireframe = wf;
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(chromeMat, accentHex, hue);
      shiftMaterialColor(dropMat, secondaryHex, hue);
    },
    setExplosion: (factor: number) => {
      explodables.forEach(item => {
        const offset = item.dir.clone().multiplyScalar(factor * 2.2);
        item.obj.position.copy(item.originalPos.clone().add(offset));
      });
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      sphereGeo.dispose();
      dropGeo.dispose();
    },
  };
}

// 6. HYPERCUBE TESSERACT (Authentic 4D Projection)
export function createHypercubeTesseract(accentHex: string, secondaryHex: string): ArtPieceInstance {
  const group = new THREE.Group();
  group.name = 'hypercube-tesseract';

  const materials: THREE.Material[] = [];

  // Generate 16 4D vertices: (±1, ±1, ±1, ±1)
  const vertices4D: number[][] = [];
  for (let i = 0; i < 16; i++) {
    vertices4D.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1,
    ]);
  }

  // Find the 32 edges connecting vertices that differ by exactly 1 coordinate
  const edges: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) {
        if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
      }
      if (diff === 1) {
        edges.push([i, j]);
      }
    }
  }

  // Vertex spheres
  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(secondaryHex) });
  materials.push(nodeMat);
  const nodeMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const mesh = new THREE.Mesh(nodeGeo, nodeMat);
    group.add(mesh);
    nodeMeshes.push(mesh);
  }

  // Line segments for the 32 hypercube edges
  const linePositions = new Float32Array(edges.length * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const edgeMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(accentHex),
    linewidth: 2,
    transparent: true,
    opacity: 0.85,
  });
  materials.push(edgeMat);
  const lineMesh = new THREE.LineSegments(lineGeo, edgeMat);
  group.add(lineMesh);

  // Inner Frosted Hologram Cube Cell
  const innerCubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const innerCubeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentHex),
    emissive: new THREE.Color(secondaryHex),
    emissiveIntensity: 0.3,
    roughness: 0.1,
    transmission: 0.8,
    thickness: 0.5,
    transparent: true,
    opacity: 0.5,
  });
  materials.push(innerCubeMat);
  const innerCube = new THREE.Mesh(innerCubeGeo, innerCubeMat);
  group.add(innerCube);

  let angle4D = 0;
  let explosionAmt = 0;

  return {
    group,
    update: (time: number, delta: number, controls: StudioControls) => {
      if (controls.isRotating) {
        group.rotation.x += delta * 0.4 * controls.rotationSpeed;
        group.rotation.y += delta * 0.5 * controls.rotationSpeed;
        angle4D += delta * 0.7 * controls.rotationSpeed;
      }

      // 4D Rotation matrix in XW and ZW plane
      const cosA = Math.cos(angle4D);
      const sinA = Math.sin(angle4D);

      const projected3D: THREE.Vector3[] = [];
      const dist4D = 2.4; // Camera distance in 4D space

      for (let i = 0; i < 16; i++) {
        const v = vertices4D[i];
        // Rotate in X-W plane
        const xRot = v[0] * cosA - v[3] * sinA;
        const wRot = v[0] * sinA + v[3] * cosA;

        // Rotate in Z-W plane
        const zRot = v[2] * cosA - wRot * sinA;
        const wRotFinal = v[2] * sinA + wRot * cosA;

        const yRot = v[1];

        // Perspective 4D to 3D projection
        const scale = (1.5 / (dist4D - wRotFinal * 0.6)) * (1.0 + explosionAmt * 0.8);
        const p3 = new THREE.Vector3(xRot * scale, yRot * scale, zRot * scale);
        projected3D.push(p3);

        nodeMeshes[i].position.copy(p3);
      }

      // Update line segments
      const posArray = lineGeo.attributes.position.array as Float32Array;
      edges.forEach(([a, b], idx) => {
        const pa = projected3D[a];
        const pb = projected3D[b];

        posArray[idx * 6] = pa.x;
        posArray[idx * 6 + 1] = pa.y;
        posArray[idx * 6 + 2] = pa.z;

        posArray[idx * 6 + 3] = pb.x;
        posArray[idx * 6 + 4] = pb.y;
        posArray[idx * 6 + 5] = pb.z;
      });

      lineGeo.attributes.position.needsUpdate = true;

      // Inner cube counter-rotation
      innerCube.rotation.x = -angle4D * 0.8;
      innerCube.rotation.y = angle4D * 0.6;
      const cubeScale = 0.7 + Math.sin(angle4D * 2) * 0.2;
      innerCube.scale.set(cubeScale, cubeScale, cubeScale);
    },
    setWireframe: (wf: boolean) => {
      innerCubeMat.wireframe = wf;
    },
    setColorShift: (hue: number) => {
      shiftMaterialColor(nodeMat, secondaryHex, hue);
      shiftMaterialColor(edgeMat, accentHex, hue);
      shiftMaterialColor(innerCubeMat, accentHex, hue);
    },
    setExplosion: (factor: number) => {
      explosionAmt = factor;
    },
    dispose: () => {
      materials.forEach(m => m.dispose());
      nodeGeo.dispose();
      lineGeo.dispose();
      innerCubeGeo.dispose();
    },
  };
}
