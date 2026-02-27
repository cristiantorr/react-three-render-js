import { useEffect, useRef } from "react";
import * as THREE from "three";
export default function App() {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const sections = {
      playa: 796,
      arboles: 672,
      casa: 650,
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.appendChild(renderer.domElement);

    // 🔥 FUNCIÓN RESPONSIVE REAL
    function handleResize() {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    const loader = new THREE.TextureLoader();

    const totalFrames = 838;
    const textures = new Array(totalFrames);
    let currentFrame = 0;
    let targetFrame = 0;

    let isPlaying = false;
    const playSpeed = 1.2;

    let currentZoom = 1;
    let targetZoom = 1;
    const minZoom = 1.2;
    const maxZoom = 4;

    for (let i = 0; i < totalFrames; i++) {
      const padded = String(i).padStart(4, "0");
      const path = `/ImagenesWeb/MS_PierHouseWeb_RTX_${padded}.webp`;

      loader.load(path, (texture) => {
        textures[i] = texture;
      });
    }

    const geometry = new THREE.PlaneGeometry(1.6, 1);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function goToFrame(index) {
      targetFrame = (index + totalFrames) % totalFrames;
      isPlaying = false;
    }

    controllerRef.current = {
      start: () => goToFrame(0),
      middle: () => goToFrame(Math.floor(totalFrames / 2)),
      end: () => goToFrame(totalFrames - 20),
      play: () => (isPlaying = true),
      stop: () => (isPlaying = false),

      zoomIn: () => {
        targetZoom -= 0.4;
        targetZoom = Math.max(minZoom, targetZoom);
      },

      zoomOut: () => {
        targetZoom += 0.4;
        targetZoom = Math.min(maxZoom, targetZoom);
      },

      goTo: (sectionName) => {
        const frame = sections[sectionName];
        if (frame !== undefined) {
          goToFrame(frame);
        }
      },
    };

    let isDragging = false;
    let previousX = 0;

    renderer.domElement.addEventListener("mousedown", (e) => {
      isDragging = true;
      isPlaying = false;
      previousX = e.clientX;
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousX;
      targetFrame += deltaX * 0.5;
      previousX = e.clientX;
    });

    renderer.domElement.addEventListener("mouseup", () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.001;
      targetZoom = Math.max(minZoom, Math.min(maxZoom, targetZoom));
    });

    function animate() {
      requestAnimationFrame(animate);

      if (isPlaying) {
        currentFrame += playSpeed;
      } else {
        currentFrame += (targetFrame - currentFrame) * 0.08;
      }

      let frameIndex = Math.floor(currentFrame) % totalFrames;
      if (frameIndex < 0) frameIndex += totalFrames;

      if (textures[frameIndex]) {
        material.map = textures[frameIndex];
        material.needsUpdate = true;
      }

      currentZoom += (targetZoom - currentZoom) * 0.1;
      camera.position.z = currentZoom;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div className="flex h-screen overflow-hidden p-4 gap-4">
        <main className="relative flex-grow canvas-container group rounded-2xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800">
          <div
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            ref={mountRef}
            style={{
              width: "100%",
              height: "100vh",
              overflow: "hidden",
            }}
          />

          <div className="absolute top-6 left-6 z-10">
            <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 shadow-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
                Render
              </span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex gap-3">
            <button className="glass-panel p-3 rounded-full hover:bg-white/40 dark:hover:bg-black/40 transition-all">
              <span
                className="material-icons-outlined"
                onClick={() => controllerRef.current?.zoomIn()}
              >
                zoom_in
              </span>
            </button>
            <button className="glass-panel p-3 rounded-full hover:bg-white/40 dark:hover:bg-black/40 transition-all">
              <span
                className="material-icons-outlined"
                onClick={() => controllerRef.current?.zoomOut()}
              >
                zoom_out
              </span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="glass-panel p-3 rounded-full hover:bg-white/40 dark:hover:bg-black/40 transition-all"
            >
              <span className="material-icons-outlined">refresh</span>
            </button>
          </div>
        </main>

        <aside class="w-80 flex flex-col gap-4">
          <div class="glass-panel p-6 rounded-2xl border border-white/20 shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <h1 class="font-display font-bold text-xl tracking-tight">
                REAL VIEW
              </h1>
              <button
                class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onclick="toggleDarkMode()"
              >
                <span class="material-icons-outlined text-lg dark:hidden">
                  dark_mode
                </span>
                <span class="material-icons-outlined text-lg hidden dark:block">
                  light_mode
                </span>
              </button>
            </div>
            <p class="text-xs opacity-60 leading-relaxed font-light">
              Explore our interactive viewer
            </p>
          </div>
          <div class="glass-panel flex-grow p-4 rounded-2xl border border-white/20 shadow-xl overflow-y-auto">
            <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40 px-2">
              Project Navigation
            </h2>
            <nav class="space-y-2">
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl active-nav transition-all duration-300">
                <span class="material-icons-outlined">home</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.start()}
                >
                  Home
                </span>
              </button>
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                <span class="material-icons-outlined">language</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.middle()}
                >
                  Overview
                </span>
              </button>
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                <span class="material-icons-outlined">language</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.end()}
                >
                  Last seen
                </span>
              </button>
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                <span class="material-icons-outlined">beach_access</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.goTo("playa")}
                >
                  Playa
                </span>
              </button>
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                <span class="material-icons-outlined">park</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.goTo("arboles")}
                >
                  Zonas Verdes
                </span>
              </button>
              <button class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                <span class="material-icons-outlined">apartment</span>
                <span
                  class="font-medium"
                  onClick={() => controllerRef.current?.goTo("casa")}
                >
                  Residencias
                </span>
              </button>
            </nav>
            <div class="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
              <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40 px-2">
                Data Layers
              </h2>
              <div class="space-y-3 px-2">
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    Option 1
                  </span>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input
                      checked=""
                      class="sr-only peer"
                      type="checkbox"
                      value=""
                    />
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    Option 2
                  </span>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input class="sr-only peer" type="checkbox" value="" />
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    Option 3
                  </span>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input class="sr-only peer" type="checkbox" value="" />
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
                <label class="flex items-center justify-between cursor-pointer group">
                  <span class="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    Option 4
                  </span>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input class="sr-only peer" type="checkbox" value="" />
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div class="glass-panel p-4 rounded-2xl border border-white/20 shadow-xl">
            <a
              href="https://wa.me/573024505859?text=Hello%2C%20I%20would%20like%20to%20schedule%20a%20visit%20to%20the%20project.%20Please%20provide%20more%20information.%20Thank%20you."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all text-center block"
            >
              Schedule a Visit on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );

  /*   return (
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
          onClick={() => controllerRef.current?.goTo("playa")}
          style={buttonStyle}
        >
          Ir a Playa
        </button>

        <button
          onClick={() => controllerRef.current?.goTo("arboles")}
          style={buttonStyle}
        >
          Ir a Arboles
        </button>

        <button
          onClick={() => controllerRef.current?.goTo("casa")}
          style={buttonStyle}
        >
          Ir a Casa
        </button>
      </div>
    </div>
  ); */
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
