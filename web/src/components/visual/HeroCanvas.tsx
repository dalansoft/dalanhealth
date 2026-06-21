import { Component, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────────────────────
   WebGL hero accent — a glowing teal→emerald "liquid" blob.

   A high-res sphere is displaced in the vertex shader by layered 3D simplex
   noise (so the surface flows), then shaded in the fragment shader with a
   teal→emerald gradient driven by displacement plus a fresnel rim light.
   The whole scene reacts gently to the pointer.

   Lazy-loaded from Hero so Three.js never ships with the dashboards. Renders
   nothing for reduced-motion users, and an error boundary guarantees a WebGL
   failure can never take down the hero.
   ──────────────────────────────────────────────────────────────────────────── */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  varying float vDisp;
  varying vec3  vNormal;
  varying vec3  vView;

  // Simplex 3D noise — Ian McEwan, Ashima Arts (public domain).
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main(){
    float t = uTime * 0.32;
    float n = snoise(normal * 1.3 + vec3(t)) * 0.5
            + snoise(normal * 2.8 + vec3(t * 1.6)) * 0.25;
    float disp = n * (0.52 + uMouse.x * 0.08);
    vec3 pos = position + normal * disp;
    vDisp = disp;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying float vDisp;
  varying vec3  vNormal;
  varying vec3  vView;

  void main(){
    float d = smoothstep(-0.5, 0.6, vDisp);
    vec3 col = mix(uColorA, uColorB, d);
    col = mix(col, uColorC, smoothstep(0.25, 0.95, vDisp));
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    col += fres * 0.12;                  // faint rim only — mostly flat blue
    float alpha = 0.95;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Blob() {
  const mesh = useRef<THREE.Mesh>(null);
  const target = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color('#2563eb') }, // blue-600 (flat)
      uColorB: { value: new THREE.Color('#2563eb') }, // blue-600 (flat)
      uColorC: { value: new THREE.Color('#2563eb') }, // blue-600 (flat)
    }),
    [],
  );

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    target.current.set(state.pointer.x, state.pointer.y);
    uniforms.uMouse.value.lerp(target.current, Math.min(1, delta * 2));
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.12;
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.pointer.y * 0.3, 0.04);
      mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, state.pointer.x * 0.15, 0.04);
    }
  });

  return (
    <mesh ref={mesh} scale={2.05} position={[1.3, 0.15, 0]}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroCanvas() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return null;

  return (
    <CanvasBoundary>
      <Canvas
        className="!absolute inset-0 -z-10"
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <Blob />
      </Canvas>
    </CanvasBoundary>
  );
}
