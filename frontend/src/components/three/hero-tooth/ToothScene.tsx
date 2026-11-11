"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { use, useEffect, useMemo, useRef } from "react";
import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  RectAreaLight,
  RGBAFormat,
  Scene,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { loadGsap } from "@/lib/motion";
import { decodeTooth } from "./toothFormat";

RectAreaLightUniformsLib.init(); // the entrance light sweep is a RectAreaLight

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

type Props = { tier: Tier; still?: boolean; onFirstFrame?: () => void; onContextLost?: () => void };

function Tooth({ tier, still, onFirstFrame, onContextLost }: Props) {
  const geometry = use(loadGeometry());
  const material = useMemo(() => toothMaterial(tier), [tier]);
  const glow = useMemo(() => radialTexture(), []);
  const caustic = useMemo(() => radialTexture(), []);
  const [hx, hy, hz] = geometry.userData.halfSize as number[];
  const { gl, scene, camera, invalidate } = useThree();
  const group = useRef<Group>(null);
  const rim = useRef<DirectionalLight>(null);
  const sweep = useRef<RectAreaLight>(null);
  // Everything that moves, in one plain object: GSAP tweens it, useFrame applies it, invalidate() renders it.
  const motion = useMemo(
    () => ({ z: 7.0, rim: 0, sweepX: -3.2, sweepI: 0, float: 0, tiltX: 0, tiltY: 0, drag: 0, exitY: 0, exitYaw: 0, exitScale: 1 }),
    [still],
  );

  useFrame((state) => {
    const g = group.current, bob = Math.sin(motion.float * Math.PI);
    if (!g || !rim.current || !sweep.current) return;
    state.camera.position.z = motion.z;
    g.position.y = 0.05 * bob + motion.exitY;
    g.rotation.set(POSE.pitch + motion.tiltX, POSE.yaw + motion.tiltY + motion.drag + 0.17 * bob + motion.exitYaw, 0);
    g.scale.setScalar(motion.exitScale);
    rim.current.intensity = 2.4 * motion.rim;
    sweep.current.intensity = motion.sweepI;
    sweep.current.position.x = motion.sweepX;
    sweep.current.lookAt(0, 0, 0);
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", lost);
    let cleanup = () => {};
    let cancelled = false;

    // Compile shaders off the main thread before showing anything (no first-frame jank).
    gl.compileAsync(scene, camera).then(async () => {
      if (cancelled) return;
      invalidate();
      requestAnimationFrame(() => onFirstFrame?.());
      if (still) return;

      const { gsap, ScrollTrigger } = await loadGsap();
      if (cancelled) return;
      const tick = () => invalidate();
      // Entrance after the 0.5 s cross-fade: dolly, rim light, light sweep, one gentle float, rest.
      // Automatic motion ends ≈ 4.6 s after reveal (WCAG 2.2.2); afterwards only the user moves it.
      const entrance = gsap
        .timeline({ delay: 0.4, onUpdate: tick })
        .to(motion, { z: 6.0, duration: 1.8, ease: "power2.inOut" }, 0)
        .to(motion, { rim: 1, duration: 0.6, ease: "power1.out" }, 0)
        .fromTo(motion, { sweepX: -3.2 }, { sweepX: 3.2, duration: 1.4, ease: "power1.inOut" }, 0.2)
        .to(motion, { sweepI: 14, duration: 0.7, ease: "sine.in", yoyo: true, repeat: 1 }, 0.2)
        .to(motion, { float: 1, duration: 2.4, ease: "sine.inOut" }, 1.8);

      const section = canvas.closest("section");
      const tiltX = gsap.quickTo(motion, "tiltX", { duration: 0.6, ease: "power3", onUpdate: tick });
      const tiltY = gsap.quickTo(motion, "tiltY", { duration: 0.6, ease: "power3", onUpdate: tick });
      const tilt = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || !section) return;
        const box = section.getBoundingClientRect();
        tiltY(((event.clientX - box.left) / box.width - 0.5) * 0.42); // ±12°
        tiltX(((event.clientY - box.top) / box.height - 0.5) * 0.28); // ±8°
      };
      const untilt = () => (tiltX(0), tiltY(0));

      // Drag to rotate (mouse or horizontal touch; vertical touch keeps scrolling via touch-action: pan-y).
      let dragging = false, lastX = 0, springBack: gsap.core.Tween | undefined;
      const down = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        springBack?.kill();
        canvas.setPointerCapture(event.pointerId);
      };
      const move = (event: PointerEvent) => {
        if (!dragging) return;
        motion.drag += (event.clientX - lastX) * 0.008;
        lastX = event.clientX;
        tick();
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        springBack = gsap.to(motion, { drag: 0, duration: 1.2, delay: 1.5, ease: "power3.out", onUpdate: tick });
      };

      section?.addEventListener("pointermove", tilt);
      section?.addEventListener("pointerleave", untilt);
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);

      // Scroll exit (AN-09): the tooth rises, turns and shrinks while the hero scrolls away.
      const exit = gsap.timeline({ onUpdate: tick }).to(motion, { exitY: 0.5, exitYaw: 0.42, exitScale: 0.94, ease: "none" });
      const trigger = ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom top", scrub: 0.6, animation: exit });

      cleanup = () => {
        entrance.kill();
        springBack?.kill();
        trigger.kill();
        exit.kill();
        section?.removeEventListener("pointermove", tilt);
        section?.removeEventListener("pointerleave", untilt);
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
      };
    });

    return () => {
      cancelled = true;
      cleanup();
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, scene, camera, invalidate, motion, still, onFirstFrame, onContextLost]);

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
      <directionalLight ref={rim} position={[0, 2, -4]} color="#7fd3f4" />
      <rectAreaLight ref={sweep} width={1.2} height={4} position={[-3.2, 1.2, 3]} />
      <group ref={group} rotation={[POSE.pitch, POSE.yaw, 0]}>
        <mesh geometry={geometry} material={material} scale={[hx, hy, hz]} />
      </group>
    </>
  );
}

export default function ToothScene({ tier, still, onFirstFrame, onContextLost }: Props) {
  return (
    <Canvas
      dpr={[1, tier === 2 ? 2 : 1.5]}
      frameloop="demand" // renders only when something moves (3D_HERO_MASTER_PLAN §7)
      camera={{ fov: 28, position: [0, 0.15, 7.0] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(BACKGROUND, 1);
        gl.toneMapping = NeutralToneMapping;
      }}
      aria-hidden="true"
    >
      <Studio />
      <directionalLight position={[-3, 4, 4]} intensity={0.6} />
      <Tooth tier={tier} still={still} onFirstFrame={onFirstFrame} onContextLost={onContextLost} />
    </Canvas>
  );
}
