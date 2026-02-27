import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const textureLoader = new THREE.TextureLoader();

    let frame = 1;
    const totalFrames = 800;

    let material;
    let plane;

    function loadInitialFrame() {
      const padded = String(frame).padStart(4, "0");
      const imagePath = `/ImagenesWeb/MS_PierHouseWeb_RTX_${padded}.png`;

      textureLoader.load(imagePath, (texture) => {
        const aspect = texture.image.width / texture.image.height;

        const geometry = new THREE.PlaneGeometry(aspect, 1);

        material = new THREE.MeshBasicMaterial({
          map: texture,
        });

        plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
      });
    }

    function updateFrame() {
      frame++;
      if (frame > totalFrames) frame = 1;

      const padded = String(frame).padStart(4, "0");
      const imagePath = `/ImagenesWeb/MS_PierHouseWeb_RTX_${padded}.png`;

      textureLoader.load(imagePath, (texture) => {
        material.map.dispose(); // limpia textura anterior
        material.map = texture;
        material.needsUpdate = true;
      });
    }

    loadInitialFrame();

    const interval = setInterval(() => {
      if (material) updateFrame();
    }, 33); // ~30 FPS

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      clearInterval(interval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
