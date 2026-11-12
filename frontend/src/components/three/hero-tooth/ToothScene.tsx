"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { use, useEffect, useEffectEvent, useMemo, useRef } from "react";
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
  Points,
  RectAreaLight,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { loadGsap } from "@/lib/motion";
import { buildEntrance, ENTRANCE_FINAL as FINAL, ENTRANCE_START as START, SCAN_TOP } from "./entrance";
import { decodeTooth } from "./toothFormat";

RectAreaLightUniformsLib.init(); // the polish glint is a RectAreaLight sweep

export type Tier = 1 | 2; // 2 = desktop (transmission), 1 = mobile/tablet (no extra render pass) — 3D_HERO_MASTER_PLAN §8
export type Still = "scan" | "final"; // poster capture states (scripts/render-poster.mjs, D-065)

const BACKGROUND = "#f3eeea"; // = hero bg (ice-50); transmission cannot see the DOM, so the canvas paints it
export const POSE = { pitch: 0.3, yaw: -0.5 } as const;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
/** Cemento-enamel junction height — mirrors cej() in scripts/build-tooth.mjs. */
const cej = (x: number, z: number) => {
  const r2 = x * x + z * z;
  return 0.1 + (r2 > 1e-6 ? 0.035 * ((x * x - z * z) / r2) : 0);
};

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
      // uv.y = enamel: 1 on the crown … 0 on the roots, split along the curved cemento-enamel junction.
      const count = tooth.positions.length / 3, uv = new Float32Array(count * 2);
      const world = (v: number, a: number) => tooth.min[a] + ((tooth.positions[v * 3 + a] / 32767 + 1) / 2) * (tooth.max[a] - tooth.min[a]);
      for (let v = 0; v < count; v++) {
        const x = world(v, 0), y = world(v, 1), z = world(v, 2);
        uv[v * 2 + 1] = smoothstep(-0.035, 0.035, y - cej(x, z));
      }
      geometry.setAttribute("uv", new BufferAttribute(uv, 2));
      geometry.userData.halfSize = [0, 1, 2].map((a) => (tooth.max[a] - tooth.min[a]) / 2);
      return geometry;
    });
  return geometryPromise;
}

/** 1×64 gradient along uv.y (roots → crown): per texel [r, g, b, a] in 0–255. */
function gradient(texel: (enamel: number) => [number, number, number, number], srgb = false): DataTexture {
  const data = new Uint8Array(64 * 4);
  for (let i = 0; i < 64; i++) data.set(texel(i / 63), i * 4);
  const texture = new DataTexture(data, 1, 64, RGBAFormat, UnsignedByteType);
  texture.magFilter = texture.minFilter = LinearFilter;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

type ScanUniforms = { uScan: { value: number }; uScanGlow: { value: number }; uScanColor: { value: Color } };

/** Porcelain crown, translucent roots — with the scan plane injected: discard below it, a gentian laser band at it. */
function toothMaterial(tier: Tier): MeshPhysicalMaterial {
  const scan: ScanUniforms = { uScan: { value: SCAN_TOP }, uScanGlow: { value: 1 }, uScanColor: { value: new Color("#3b4d65") } };
  // R = transmission (ice roots only), G = roughness (glossy crown 0.26 → satin roots 0.16 under the glass).
  const surface = gradient((e) => [255 * 0.94 * (1 - e), 255 * (0.16 + 0.1 * e), 0, 255]);
  const common = {
    color: new Color("#ffffff"),
    roughness: 1,
    roughnessMap: surface,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    sheen: 0.3,
    sheenColor: new Color("#efeae5"),
    sheenRoughness: 0.45,
    specularIntensity: 1,
  };
  const material =
    tier === 2
      ? new MeshPhysicalMaterial({
          ...common,
          transmission: 1,
          transmissionMap: surface,
          thickness: 0.7,
          ior: 1.5,
          attenuationColor: new Color("#d8cbbe"),
          attenuationDistance: 0.85,
        })
      : // Tier 1: no transmission pass — the roots get a beige tint instead.
        new MeshPhysicalMaterial({ ...common, map: gradient((e) => [255 - 21 * (1 - e), 255 - 28 * (1 - e), 255 - 35 * (1 - e), 255], true) });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, scan);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vScanY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvScanY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vScanY;\nuniform float uScan;\nuniform float uScanGlow;\nuniform vec3 uScanColor;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vScanY < uScan) discard;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat scanBand = uScanGlow * (1.0 - smoothstep(0.0, 0.06, vScanY - uScan));\ndiffuseColor.rgb = mix(diffuseColor.rgb, uScanColor, scanBand);",
      )
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uScanColor * scanBand * 1.4;");
  };
  material.customProgramCacheKey = () => `tooth-scan-${tier}`;
  material.userData.scan = scan; // driven per frame through the mesh ref
  return material;
}

/** The scan data: every vertex as a point, visible below the scan plane, flaring just under it. */
function cloudMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScan: { value: SCAN_TOP },
      uOpacity: { value: 1 },
      uSize: { value: 15 },
      uColor: { value: new Color("#3b4d65") },
    },
    vertexShader: /* glsl */ `
      uniform float uScan;
      uniform float uOpacity;
      uniform float uSize;
      varying float vAlpha;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float id = float(gl_VertexID);
        float h = hash(id * 12.9898);
        // Marching-cubes vertices sit on a grid; a small jitter makes the cloud read as scan data.
        vec3 p = position + (vec3(hash(id * 3.1), hash(id * 5.7), hash(id * 7.3)) - 0.5) * 0.016;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float pending = step(position.y, uScan);
        float flare = 1.0 - smoothstep(0.0, 0.16, uScan - position.y);
        float depth = smoothstep(-7.5, -5.8, mv.z); // the far side of the tooth fades
        float kept = step(0.28, h); // a sparser, irregular cloud
        vAlpha = kept * pending * uOpacity * (0.25 + 0.75 * depth) * (0.3 + 0.7 * h) * (1.0 + 1.6 * flare);
        gl_PointSize = uSize * (0.6 + 0.9 * h) * (1.0 + 0.7 * flare) / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r2 = dot(c, c);
        if (r2 > 0.25 || vAlpha <= 0.0) discard;
        gl_FragColor = vec4(uColor, min(vAlpha, 1.0) * (1.0 - 4.0 * r2));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

/** Studio light built in-scene and prefiltered once — no HDRI download (D-025). Mid-grey walls and bright
 *  softboxes: the clearcoat shows crisp, long highlights, the body keeps its form. */
function Studio() {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => {
    const room = new Scene();
    room.add(new Mesh(new BoxGeometry(14, 14, 14), new MeshBasicMaterial({ color: "#939daa", side: BackSide })));
    const panel = (w: number, h: number, color: string, power: number, p: [number, number, number], r: [number, number, number]) => {
      const mesh = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(power), side: DoubleSide }));
      mesh.position.set(...p);
      mesh.rotation.set(...r);
      room.add(mesh);
    };
    panel(7, 3.5, "#ffffff", 4.2, [0, 5.5, 1.2], [Math.PI / 2, 0, 0]); // key softbox overhead
    panel(1.4, 10, "#ffffff", 3.4, [-5.5, 0.5, 2], [0, Math.PI / 2, 0]); // strip, start side
    panel(1.1, 9, "#ffffff", 2.4, [5.5, 0, 1], [0, -Math.PI / 2, 0]); // strip, end side
    panel(8, 2.4, "#cbbaa8", 3.4, [0, 1.2, -5.5], [0, 0, 0]); // beige rim from behind
    panel(4, 3, "#ffffff", 1.6, [0, 0.4, 5.5], [0, Math.PI, 0]); // soft front fill
    panel(10, 6, "#ebe5de", 1.1, [0, -5.5, 0], [-Math.PI / 2, 0, 0]); // floor bounce
    const pmrem = new PMREMGenerator(gl);
    const texture = pmrem.fromScene(room, 0.03).texture;
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

function radialTexture(): DataTexture {
  const size = 64, data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (x / (size - 1)) * 2 - 1, dy = (y / (size - 1)) * 2 - 1;
      data.set([255, 255, 255, 255 * (1 - smoothstep(0, 1, Math.hypot(dx, dy))) ** 1.6], (y * size + x) * 4);
    }
  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  texture.magFilter = texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

type Props = {
  tier: Tier;
  still?: Still;
  onFirstFrame?: () => void;
  onSettled?: () => void;
  onContextLost?: () => void;
};

function Tooth({ tier, still, onFirstFrame, onSettled, onContextLost }: Props) {
  const geometry = use(loadGeometry());
  const material = useMemo(() => toothMaterial(tier), [tier]);
  const cloud = useMemo(() => cloudMaterial(), []);
  const halo = useMemo(() => radialTexture(), []);
  const [hx, hy, hz] = geometry.userData.halfSize as number[];
  const { gl, scene, camera, invalidate } = useThree();
  const group = useRef<Group>(null);
  const tooth = useRef<Mesh>(null);
  const points = useRef<Points>(null);
  const rim = useRef<DirectionalLight>(null);
  const sweep = useRef<RectAreaLight>(null);
  // Everything that moves, in one plain object: GSAP tweens it, useFrame applies it, invalidate() renders it.
  const motion = useMemo(
    () => ({
      ...(still === "final" ? FINAL : START),
      sweepX: -3.2,
      sweepI: 0,
      float: 0,
      tiltX: 0,
      tiltY: 0,
      drag: 0,
      exitY: 0,
      exitYaw: 0,
      exitPitch: 0,
      exitScale: 1,
    }),
    [still],
  );

  useFrame((state) => {
    const g = group.current, bob = Math.sin(motion.float * Math.PI);
    if (!g || !tooth.current || !points.current || !rim.current || !sweep.current) return;
    state.camera.position.z = motion.z;
    g.position.y = 0.05 * bob + motion.exitY;
    g.rotation.set(
      POSE.pitch + motion.tiltX + motion.exitPitch,
      POSE.yaw + motion.spin + motion.tiltY + motion.drag + 0.15 * bob + motion.exitYaw,
      0,
    );
    g.scale.setScalar(motion.exitScale);
    const scan = (tooth.current.material as MeshPhysicalMaterial).userData.scan as ScanUniforms;
    const cloudUniforms = (points.current.material as ShaderMaterial).uniforms;
    scan.uScan.value = cloudUniforms.uScan.value = motion.scan;
    scan.uScanGlow.value = motion.glow;
    cloudUniforms.uOpacity.value = motion.points;
    cloudUniforms.uSize.value = 15 * state.gl.getPixelRatio();
    points.current.visible = motion.points > 0.001;
    rim.current.intensity = 2.6 * motion.rim;
    sweep.current.intensity = motion.sweepI;
    sweep.current.position.x = motion.sweepX;
    sweep.current.lookAt(0, 0, 0);
  });

  // The parent's callbacks may change identity on every render; as effect events they never restart the scene.
  const firstFrame = useEffectEvent(() => onFirstFrame?.());
  const settled = useEffectEvent(() => onSettled?.());
  const contextLost = useEffectEvent(() => onContextLost?.());

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      contextLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    let cleanup = () => {};
    let cancelled = false;

    // Compile shaders off the main thread before showing anything (no first-frame jank).
    gl.compileAsync(scene, camera).then(async () => {
      if (cancelled) return;
      invalidate();
      requestAnimationFrame(() => firstFrame());
      if (still) return;

      const { gsap, ScrollTrigger } = await loadGsap();
      if (cancelled) return;
      const tick = () => invalidate();
      // Entrance after the 0.5 s cross-fade from the scan poster (entrance.ts); afterwards only the user moves it.
      const entrance = buildEntrance(gsap, motion, tick, () => settled());

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

      // Scroll (AN-09): while the hero scrolls away the tooth turns its occlusal surface to the visitor,
      // rises and recedes.
      const exit = gsap
        .timeline({ onUpdate: tick })
        .to(motion, { exitY: 0.45, exitYaw: 0.9, exitPitch: 0.42, exitScale: 0.9, ease: "none" });
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
  }, [gl, scene, camera, invalidate, motion, still]);

  return (
    <>
      <mesh position={[0, 0.15, -2.4]} scale={7.5}>
        <planeGeometry />
        <meshBasicMaterial map={halo} color="#e0d6cb" transparent opacity={0.9} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* Soft contact shadow: grounds the floating tooth. */}
      <mesh position={[0, -1.72, 0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.6, 1.3, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={halo} color="#2f3e51" transparent opacity={0.16} toneMapped={false} depthWrite={false} />
      </mesh>
      <directionalLight position={[-3, 5, 4]} intensity={1.1} />
      <directionalLight position={[4, 1, 3]} intensity={0.35} color="#ebe5de" />
      <directionalLight ref={rim} position={[0, 2, -4]} color="#cbbaa8" />
      <rectAreaLight ref={sweep} width={1.2} height={4} position={[-3.2, 1.2, 3]} />
      <group ref={group} rotation={[POSE.pitch, POSE.yaw + motion.spin, 0]}>
        <mesh ref={tooth} geometry={geometry} material={material} scale={[hx, hy, hz]} />
        <points ref={points} geometry={geometry} material={cloud} scale={[hx, hy, hz]} />
      </group>
    </>
  );
}

export default function ToothScene({ tier, still, onFirstFrame, onSettled, onContextLost }: Props) {
  return (
    <Canvas
      dpr={[1, tier === 2 ? 2 : 1.5]}
      frameloop="demand" // renders only when something moves (3D_HERO_MASTER_PLAN §7)
      camera={{ fov: 28, position: [0, 0.15, still === "final" ? FINAL.z : START.z] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(BACKGROUND, 1);
        gl.toneMapping = NeutralToneMapping;
      }}
      aria-hidden="true"
    >
      <Studio />
      <Tooth tier={tier} still={still} onFirstFrame={onFirstFrame} onSettled={onSettled} onContextLost={onContextLost} />
    </Canvas>
  );
}
