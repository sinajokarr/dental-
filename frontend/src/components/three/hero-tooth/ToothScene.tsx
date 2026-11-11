"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { use, useEffect, useMemo } from "react";
import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { decodeTooth } from "./toothFormat";

export type Tier = 1 | 2; // 2 = desktop (transmission), 1 = mobile/tablet (no extra render pass) — 3D_HERO_MASTER_PLAN §8

const BACKGROUND = "#f8fcff"; // = hero bg (ice-50); transmission cannot see the DOM, so the canvas paints it
export const POSE = { pitch: 0.14, yaw: -0.44 } as const;

let geometryPromise: Promise<BufferGeometry> | undefined;
function loadGeometry(): Promise<BufferGeometry> {
  geometryPromise ??= fetch("/models/tooth.bin")
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      const tooth = decodeTooth(buffer);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(tooth.positions, 3, true));
      geometry.setAttribute("normal", new BufferAttribute(tooth.normals, 3, true));
      geometry.setIndex(new BufferAttribute(tooth.indices, 1));
      // uv.y: 0 at the root apices … 1 at the cusps — drives the porcelain-crown → ice-root gradient.
      const uv = new Float32Array((tooth.positions.length / 3) * 2);
      for (let v = 0; v < uv.length / 2; v++) uv[v * 2 + 1] = (tooth.positions[v * 3 + 1] / 32767 + 1) / 2;
      geometry.setAttribute("uv", new BufferAttribute(uv, 2));
      geometry.userData.halfSize = [0, 1, 2].map((a) => (tooth.max[a] - tooth.min[a]) / 2);
      return geometry;
    });
  return geometryPromise;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** 1×64 vertical gradient: per texel [r, g, b, a] in 0–255. */
function gradient(texel: (y: number) => [number, number, number, number], srgb = false): DataTexture {
  const data = new Uint8Array(64 * 4);
  for (let i = 0; i < 64; i++) data.set(texel(i / 63), i * 4);
  const texture = new DataTexture(data, 1, 64, RGBAFormat, UnsignedByteType);
  texture.magFilter = texture.minFilter = LinearFilter;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function toothMaterial(tier: Tier): MeshPhysicalMaterial {
  // Cemento-enamel junction sits at ~62% of the height: crown above, roots below.
  const root = (y: number) => 1 - smoothstep(0.46, 0.64, y);
  // R = transmission (roots → ice glass), G = roughness (crown 0.22 → roots 0.38).
  const surface = gradient((y) => [255 * root(y), 255 * (0.22 + 0.16 * root(y)), 0, 255]);
  const common = {
    color: new Color("#f7fbfe"),
    roughness: 1,
    roughnessMap: surface,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.35,
    sheenColor: new Color("#bdeaff"),
    sheenRoughness: 0.5,
  };
  if (tier === 2) {
    return new MeshPhysicalMaterial({
      ...common,
      transmission: 1,
      transmissionMap: surface,
      thickness: 0.9,
      ior: 1.5,
      attenuationColor: new Color("#bdeaff"),
      attenuationDistance: 0.9,
      iridescence: 0.08,
    });
  }
  // Tier 1: imitate the icy roots with a colour gradient instead of a transmission pass.
  const tint = gradient((y) => {
    const t = root(y);
    return [255 - 34 * t, 255 - 11 * t, 255, 255]; // white → #DDF4FF
  }, true);
  return new MeshPhysicalMaterial({ ...common, map: tint });
}

/** Studio light built in-scene and prefiltered once — no HDRI download (D-025). */
function Studio() {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => {
    const room = new Scene();
    // Bright, cool walls keep the porcelain white; emissive panels draw the highlights.
    room.add(new Mesh(new BoxGeometry(14, 14, 14), new MeshBasicMaterial({ color: "#c3cdd7", side: BackSide })));
    const panel = (w: number, h: number, color: string, power: number, p: [number, number, number], r: [number, number, number]) => {
      const mesh = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(power), side: DoubleSide }));
      mesh.position.set(...p);
      mesh.rotation.set(...r);
      room.add(mesh);
    };
    panel(6, 3, "#ffffff", 3.2, [0, 5.5, 1.5], [Math.PI / 2, 0, 0]); // key softbox overhead
    panel(1.3, 9, "#ffffff", 2.4, [-5.5, 0.5, 2], [0, Math.PI / 2, 0]); // strip, start side
    panel(1, 8, "#ffffff", 1.6, [5.5, 0, 0.5], [0, -Math.PI / 2, 0]); // strip, end side
    panel(7, 2.2, "#7fd3f4", 3, [0, 1, -5.5], [0, 0, 0]); // ice-blue rim from behind
    panel(9, 5, "#ddf4ff", 1.2, [0, -5.5, 0], [-Math.PI / 2, 0, 0]); // floor bounce
    const pmrem = new PMREMGenerator(gl);
    const texture = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    room.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        (object.material as MeshBasicMaterial).dispose();
      }
    });
    return texture;
  }, [gl]);
  useEffect(() => () => environment.dispose(), [environment]);
  return <primitive object={environment} attach="environment" />;
}

function radialTexture(stretch = 1): DataTexture {
  const size = 64, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (x / (size - 1)) * 2 - 1, dy = ((y / (size - 1)) * 2 - 1) * stretch;
      data.set([255, 255, 255, 255 * (1 - smoothstep(0, 1, Math.hypot(dx, dy)))], (y * size + x) * 4);
    }
  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function Tooth({ tier, onFirstFrame }: { tier: Tier; onFirstFrame?: () => void }) {
  const geometry = use(loadGeometry());
  useEffect(() => {
    // Two frames after mount the tooth is on screen (frameloop="demand" renders once after mounting).
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onFirstFrame?.()));
    return () => cancelAnimationFrame(id);
  }, [onFirstFrame]);
  const material = useMemo(() => toothMaterial(tier), [tier]);
  const glow = useMemo(() => radialTexture(), []);
  const caustic = useMemo(() => radialTexture(), []);
  const [hx, hy, hz] = geometry.userData.halfSize as number[];
  return (
    <>
      <mesh position={[0, 0.1, -2.2]} scale={7}>
        <planeGeometry />
        <meshBasicMaterial map={glow} color="#bdeaff" transparent opacity={0.85} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -1.62, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.8, 1.2, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={caustic} color="#7fd3f4" transparent opacity={0.32} toneMapped={false} depthWrite={false} />
      </mesh>
      <group rotation={[POSE.pitch, POSE.yaw, 0]}>
        <mesh geometry={geometry} material={material} scale={[hx, hy, hz]} />
      </group>
    </>
  );
}

export default function ToothScene({ tier, onFirstFrame }: { tier: Tier; onFirstFrame?: () => void }) {
  return (
    <Canvas
      dpr={[1, tier === 2 ? 2 : 1.5]}
      frameloop="demand"
      camera={{ fov: 28, position: [0, 0.15, 6.4] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(BACKGROUND, 1);
        gl.toneMapping = NeutralToneMapping;
      }}
      aria-hidden="true"
    >
      <Studio />
      <directionalLight position={[0, 2, -4]} intensity={2.4} color="#7fd3f4" />
      <directionalLight position={[-3, 4, 4]} intensity={0.6} />
      <Tooth tier={tier} onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
