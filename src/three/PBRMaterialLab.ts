import * as THREE from 'three';

export interface FrostedGlassOptions {
  color?: string | number;
  transmission?: number;
  roughness?: number;
  ior?: number;
  thickness?: number;
  clearcoat?: number;
  attenuationColor?: string | number;
  attenuationDistance?: number;
}

export function createFrostedGlassMaterial({
  color = '#ffffff',
  transmission = 0.92,
  roughness = 0.14,
  ior = 1.45,
  thickness = 1.8,
  clearcoat = 1.0,
  attenuationColor = '#e0f2fe',
  attenuationDistance = 2.0,
}: FrostedGlassOptions = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    transmission,
    roughness,
    ior,
    thickness,
    clearcoat,
    attenuationColor: new THREE.Color(attenuationColor),
    attenuationDistance,
    transparent: true,
    reflectivity: 0.8,
  });
}

export interface TitaniumOptions {
  color?: string | number;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
}

export function createTitaniumMaterial({
  color = '#27272a',
  metalness = 0.92,
  roughness = 0.22,
  clearcoat = 0.35,
}: TitaniumOptions = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness: 0.1,
  });
}

export interface EmissiveCoreOptions {
  color?: string | number;
  intensity?: number;
}

export function createEmissiveCoreMaterial({
  color = '#38bdf8',
  intensity = 2.5,
}: EmissiveCoreOptions = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.1,
  });
}
