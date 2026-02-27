import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function App() {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);
  useEffect(() => {
    const sections = {
      terraza: 36,
      arboles: 6,
      sala: 25,
      habitacion: 48,
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();

    const totalFrames = 52;
    const textures = [];
    let currentFrame = 0;
    let targetFrame = 0;

    // 🔥 ZOOM VARIABLES
    let currentZoom = 2;
    let targetZoom = 2;
    const minZoom = 1.2;
    const maxZoom = 4;

    // 🔥 Precarga
    for (let i = 1; i <= totalFrames; i++) {
      textures.push(loader.load(`/framesmodel/frame${i}.jpg`));
    }

    const geometry = new THREE.PlaneGeometry(1.6, 1);
    const material = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function goToFrame(index) {
      targetFrame = (index + totalFrames) % totalFrames;
    }

    controllerRef.current = {
      start: () => goToFrame(0),
      middle: () => goToFrame(Math.floor(totalFrames / 2)),
      end: () => goToFrame(totalFrames - 20),
      goTo: (sectionName) => {
        const frame = sections[sectionName];
        if (frame !== undefined) {
          goToFrame(frame);
        }
      },
    };

    // 🔥 DRAG CONTROL
    let isDragging = false;
    let previousX = 0;
    const sensitivity = 5;

    renderer.domElement.addEventListener("mousedown", (e) => {
      isDragging = true;
      previousX = e.clientX;
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousX;
      targetFrame += Math.floor(deltaX / sensitivity);
      previousX = e.clientX;
    });

    renderer.domElement.addEventListener("mouseup", () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    // 🔥 ZOOM CON RUEDA
    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();

      targetZoom += e.deltaY * 0.001;
      targetZoom = Math.max(minZoom, Math.min(maxZoom, targetZoom));
    });

    // 🔥 Animación suave
    function animate() {
      requestAnimationFrame(animate);

      // Frames
      currentFrame += (targetFrame - currentFrame) * 0.1;

      let frameIndex = Math.round(currentFrame);
      frameIndex = (frameIndex + totalFrames) % totalFrames;

      material.map = textures[frameIndex];
      material.needsUpdate = true;

      // Zoom suave
      currentZoom += (targetZoom - currentZoom) * 0.1;
      camera.position.z = currentZoom;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-around", // distribuye a lo largo
          alignItems: "center",
        }}
      >
        <button
          onClick={() => controllerRef.current?.start()}
          style={buttonStyle}
        >
          ⏮ Inicio
        </button>

        <button
          onClick={() => controllerRef.current?.middle()}
          style={buttonStyle}
        >
          🔵 Mitad
        </button>

        <button
          onClick={() => controllerRef.current?.end()}
          style={buttonStyle}
        >
          ⏭ Final
        </button>
        <button
          onClick={() => controllerRef.current?.goTo("terraza")}
          style={buttonStyle}
        >
          Ir a Terraza
        </button>

        <button
          onClick={() => controllerRef.current?.goTo("arboles")}
          style={buttonStyle}
        >
          Ir a Arboles
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#42873c",
  color: "#fff",
};
