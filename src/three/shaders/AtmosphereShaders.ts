import * as THREE from 'three';

export const VolumetricFogShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#0f172a') },
    uDensity: { value: 0.8 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uDensity;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex / Hash Noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      vec2 uv = vUv * 3.0;
      float n1 = noise(uv + vec2(uTime * 0.04, uTime * 0.02));
      float n2 = noise(uv * 2.0 - vec2(uTime * 0.03, 0.0));
      float fog = (n1 + n2 * 0.5) / 1.5;

      // Kenar sönümlemesi
      float edgeFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y) *
                       smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);

      gl_FragColor = vec4(uColor, fog * uDensity * edgeFade);
    }
  `,
};

export const GodRaySearchlightShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ffffff') },
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Y ekseni boyunca koni ucundan tabanına doğru zayıflama (falloff)
      float beamFalloff = pow(1.0 - vUv.y, 1.5);
      
      // Merkezden kenarlara doğru yumuşak silindirik sönümleme
      float radial = 1.0 - abs(vUv.x - 0.5) * 2.0;
      radial = smoothstep(0.0, 1.0, radial);

      // Dinamik ışık tozlanması
      float flicker = 0.95 + 0.05 * sin(uTime * 18.0 + vUv.y * 30.0);

      float alpha = beamFalloff * radial * uIntensity * flicker * 0.45;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};
