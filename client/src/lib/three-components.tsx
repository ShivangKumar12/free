import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SpaceBackgroundProps {
  color1?: string;
  color2?: string;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ 
  color1 = '#7928CA', 
  color2 = '#00BFFF' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 3;
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create gradient sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(color1) },
        color2: { value: new THREE.Color(color2) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 0.1);
        }
      `,
      transparent: true,
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0005;
      
      sphere.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      scene.remove(stars);
      scene.remove(sphere);
      
      starsGeometry.dispose();
      starsMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      
      renderer.dispose();
    };
  }, [color1, color2]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full -z-10"
    />
  );
};

interface FloatingModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const FloatingModel: React.FC<FloatingModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      canvasRef.current.width / canvasRef.current.height, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvasRef.current.width, canvasRef.current.height);
    
    // Create glowing sphere
    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00bfff,
      emissive: 0x00bfff,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    mesh.scale.set(scale, scale, scale);
    scene.add(mesh);
    
    // Add lights
    const light = new THREE.PointLight(0x00bfff, 1, 100);
    light.position.set(0, 0, 2);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Animation
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      frame += 0.01;
      mesh.position.y = position[1] + Math.sin(frame) * 0.1;
      mesh.rotation.y += 0.01;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      scene.remove(mesh);
      scene.remove(light);
      scene.remove(ambientLight);
      
      geometry.dispose();
      material.dispose();
      
      renderer.dispose();
    };
  }, [position, rotation, scale]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300}
      height={300}
      className="absolute inset-0 w-full h-full"
    />
  );
};
