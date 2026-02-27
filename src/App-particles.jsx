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
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const textureLoader = new THREE.TextureLoader();

    let frame = 1000; // número inicial real CUANDO ES 1004 PERO SI EL 0003 PONER 1
    const startFrame = 1000;
    const totalFrames = 800;
    let currentPoints = null;

    function loadFrame() {
      const padded = String(frame).padStart(4, "0");
      const imagePath = `/frames/MS_PierHouseWeb_RTX_${padded}.png`;
      console.log("Cargando frame:", imagePath);
      textureLoader.load(imagePath, (texture) => {
        const img = texture.image;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const positions = [];
        const colors = [];

        const skip = 4; // densidad
        const scale = img.width / 2;

        for (let y = 0; y < img.height; y += skip) {
          for (let x = 0; x < img.width; x += skip) {
            const index = (y * img.width + x) * 4;

            const r = data[index] / 255;
            const g = data[index + 1] / 255;
            const b = data[index + 2] / 255;

            const brightness = (r + g + b) / 3;

            positions.push(
              (x - img.width / 2) / scale,
              -(y - img.height / 2) / scale,
              brightness * 0.5,
            );

            colors.push(r, g, b);
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3),
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3),
        );

        const material = new THREE.PointsMaterial({
          size: 0.02,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
        });

        const points = new THREE.Points(geometry, material);

        // eliminar frame anterior
        if (currentPoints) {
          scene.remove(currentPoints);
          currentPoints.geometry.dispose();
          currentPoints.material.dispose();
        }

        currentPoints = points;
        scene.add(points);
      });
    }

    // cargar primer frame
    loadFrame();

    // animar frames cada 100ms
    /*  const frameInterval = setInterval(() => {
      frame++;
      if (frame > totalFrames) frame = 1;
      loadFrame();
    }, 100); */

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
      /*       clearInterval(frameInterval);
       */ mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
