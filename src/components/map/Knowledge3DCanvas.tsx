import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Focus,
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  X,
  Layers,
  ChevronRight,
  Camera,
  Share2,
  Menu,
  Box,
  GitFork,
  LayoutGrid,
  Lock,
  Unlock,
  ClipboardList,
  Upload,
  Flame,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Link2,
  Search,
  Sparkles,
  FileText,
  Mic,
  MicOff,
  Radio,
  Command,
} from 'lucide-react';
import { Concept, Relationship, CameraBookmark } from '../../types';
import { sfx } from '../../utils/soundEffects';
import { narrator } from '../../utils/voiceNarrator';

interface Knowledge3DCanvasProps {
  concepts: Concept[];
  relationships: Relationship[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
  resetTrigger: number;
  mapId?: string;
  onOpenQuiz?: () => void;
  onOpenUpload?: () => void;
  onOpenCheatSheet?: () => void;
  onOpenAddIsland?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  viewMode?: '3d' | '2d';
  onViewModeChange?: (mode: '3d' | '2d') => void;
}

export const Knowledge3DCanvas: React.FC<Knowledge3DCanvasProps> = ({
  concepts,
  relationships,
  selectedConceptId,
  onSelectConcept,
  resetTrigger,
  mapId,
  onOpenQuiz,
  onOpenUpload,
  onOpenCheatSheet,
  onOpenAddIsland,
  onToggleSidebar,
  isSidebarOpen = false,
  viewMode = '3d',
  onViewModeChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isTransitioningRef = useRef(false);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 16, 24));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const [hoveredConceptTitle, setHoveredConceptTitle] = useState<string | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isTopDown, setIsTopDown] = useState(false);
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const [cameraCoords, setCameraCoords] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 16,
    z: 24,
  });

  // Sync camera lock with controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableRotate = !isCameraLocked;
      controlsRef.current.enablePan = !isCameraLocked;
    }
  }, [isCameraLocked]);

  // Feature 1: Procedural Audio & Voice Narrator state
  const [isMuted, setIsMuted] = useState(() => sfx.isMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => narrator.isEnabled());

  // Feature 2: Cinematic 3D Tour state
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [isTourPaused, setIsTourPaused] = useState(false);
  const [tourProgress, setTourProgress] = useState(0);

  // Feature 3: Retention & Mastery Heatmap state
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);

  // Feature 4: Interactive Relationship Bridge Hover state
  const [hoveredBridge, setHoveredBridge] = useState<{
    relationship: Relationship;
    sourceTitle: string;
    targetTitle: string;
  } | null>(null);

  // Feature 5: Sci-Fi 3D Radar HUD & Spotlight Quick-Search state
  const [isRadarOpen, setIsRadarOpen] = useState(true);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');

  // Handle Tour Flight when index changes + Autonomous AI Voice Tour Narration
  useEffect(() => {
    if (!isTourActive || concepts.length === 0) {
      narrator.stop();
      return;
    }
    const target = concepts[tourIndex];
    if (target) {
      const [x, y, z] = target.position;
      targetLookAtRef.current = new THREE.Vector3(x, y + 0.35, z);
      targetCamPosRef.current = new THREE.Vector3(x + 2.5, y + 2.4, z + 4.8);
      isTransitioningRef.current = true;
      sfx.playFlightWhoosh();
      sfx.playTourStep();
      if (!isMuted && isVoiceEnabled) {
        narrator.speak(`${target.title}. ${target.briefExplanation}`);
      }
    }
  }, [isTourActive, tourIndex, concepts, isMuted, isVoiceEnabled]);

  // Sync Voice Narrator pause/resume with Tour pause state
  useEffect(() => {
    if (!isTourActive) {
      narrator.stop();
      return;
    }
    if (isTourPaused) {
      narrator.pause();
    } else {
      narrator.resume();
    }
  }, [isTourPaused, isTourActive]);

  // Handle Tour Progress timer
  useEffect(() => {
    if (!isTourActive || isTourPaused || concepts.length === 0) return;
    const interval = setInterval(() => {
      setTourProgress((prev) => {
        if (prev >= 100) {
          setTourIndex((idx) => (idx + 1) % concepts.length);
          return 0;
        }
        return prev + 2.2; // advances in ~4.5 seconds
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isTourActive, isTourPaused, concepts.length]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => narrator.stop();
  }, []);

  // Radar bounds calculation
  const radarBounds = useMemo(() => {
    if (concepts.length === 0) {
      return { minX: -10, maxX: 10, minZ: -10, maxZ: 10, spanX: 20, spanZ: 20 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    concepts.forEach((c) => {
      if (c.position[0] < minX) minX = c.position[0];
      if (c.position[0] > maxX) maxX = c.position[0];
      if (c.position[2] < minZ) minZ = c.position[2];
      if (c.position[2] > maxZ) maxZ = c.position[2];
    });
    const spanX = Math.max(maxX - minX, 12);
    const spanZ = Math.max(maxZ - minZ, 12);
    const pad = 3.5;
    return {
      minX: minX - pad,
      maxX: maxX + pad,
      minZ: minZ - pad,
      maxZ: maxZ + pad,
      spanX: spanX + pad * 2,
      spanZ: spanZ + pad * 2,
    };
  }, [concepts]);

  // Filtered concepts for Spotlight Search
  const spotlightResults = useMemo(() => {
    if (!spotlightQuery.trim()) return concepts.slice(0, 8);
    const q = spotlightQuery.toLowerCase();
    return concepts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.cluster.toLowerCase().includes(q) ||
        c.briefExplanation.toLowerCase().includes(q)
    );
  }, [concepts, spotlightQuery]);

  // Calculate active connections for the selected island (or all if none selected)
  const selectedConnectionsCount = useMemo(() => {
    if (!selectedConceptId) return relationships.length;
    return relationships.filter(
      (r) => r.sourceId === selectedConceptId || r.targetId === selectedConceptId
    ).length;
  }, [relationships, selectedConceptId]);

  // Camera Bookmarks state
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | null>(null);
  const [navFeedbackMessage, setNavFeedbackMessage] = useState<string | null>(null);

  const storageKey = `memoryscape_bookmarks_${mapId || 'default'}`;

  const [customBookmarks, setCustomBookmarks] = useState<CameraBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Re-sync custom bookmarks if mapId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCustomBookmarks(JSON.parse(saved));
      } else {
        setCustomBookmarks([]);
      }
    } catch {
      setCustomBookmarks([]);
    }
  }, [storageKey]);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webGlSupported) return;

    // 1. Scene setup with cosmic atmosphere & depth fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.022);

    // 2. Camera setup - overview framing entire island archipelago
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialTransform = calculateFitTransform(concepts);
    camera.position.copy(initialTransform.camPos);
    cameraRef.current = camera;
    targetCamPosRef.current.copy(initialTransform.camPos);
    targetLookAtRef.current.copy(initialTransform.lookAt);

    // 3. Renderer with Studio PBR Tone Mapping
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialTransform.lookAt);
    controls.enableDamping = !prefersReducedMotion;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent going below floor
    controls.minDistance = 4;
    controls.maxDistance = 75;
    controlsRef.current = controls;

    let lastCoordTime = 0;
    const updateCoordsThrottled = () => {
      const now = performance.now();
      if (now - lastCoordTime > 50) {
        lastCoordTime = now;
        setCameraCoords({
          x: Math.round(camera.position.x * 10) / 10,
          y: Math.round(camera.position.y * 10) / 10,
          z: Math.round(camera.position.z * 10) / 10,
        });
      }
    };

    const flushCoords = () => {
      setCameraCoords({
        x: Math.round(camera.position.x * 10) / 10,
        y: Math.round(camera.position.y * 10) / 10,
        z: Math.round(camera.position.z * 10) / 10,
      });
    };

    controls.addEventListener('start', () => {
      isTransitioningRef.current = false;
    });
    controls.addEventListener('change', updateCoordsThrottled);
    controls.addEventListener('end', flushCoords);

    // 5. Studio PBR Lighting Rig
    // Warm key directional light (cyan tint)
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    keyLight.position.set(12, 22, 14);
    scene.add(keyLight);

    // Cool fill directional light (violet tint)
    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.7);
    fillLight.position.set(-14, 14, -12);
    scene.add(fillLight);

    // Cosmic sky & ground hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x070b14, 0.65);
    scene.add(hemiLight);

    // Holographic perspective blueprint floor grid matching reference screenshot
    const gridHelper = new THREE.GridHelper(80, 50, 0x1e3a5f, 0x0d2038);
    gridHelper.position.y = -0.15;
    scene.add(gridHelper);

    // Reusable procedural contact shadow texture for grounding all islands
    const createShadowTexture = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rad = size / 2;
        const grad = ctx.createRadialGradient(rad, rad, 0, rad, rad, rad);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
        grad.addColorStop(0.4, 'rgba(0, 0, 0, 0.45)');
        grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const contactShadowTexture = createShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    // Helper: Canvas Texture for crisp, capped floating text labels with reduced overlap & heatmap support
    const createTextSprite = (
      text: string,
      isHighlighted: boolean,
      isRevision: boolean,
      heatmapStatus?: 'mastered' | 'revision' | 'unexplored' | null
    ) => {
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 384, 96);

        // Pill background
        if (heatmapStatus === 'mastered') {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
          ctx.strokeStyle = '#6ee7b7';
        } else if (heatmapStatus === 'revision') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
          ctx.strokeStyle = '#fca5a5';
        } else if (heatmapStatus === 'unexplored') {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.90)';
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
        } else {
          ctx.fillStyle = isRevision
            ? 'rgba(239, 68, 68, 0.95)'
            : isHighlighted
            ? 'rgba(6, 182, 212, 0.95)'
            : 'rgba(10, 16, 32, 0.92)';
          ctx.strokeStyle = isRevision
            ? '#f87171'
            : isHighlighted
            ? '#a5f3fc'
            : 'rgba(56, 189, 248, 0.5)';
        }
        ctx.lineWidth = 3;

        const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        };

        roundRect(8, 8, 368, 80, 20);

        // Text - capped, clear typography
        ctx.font = 'bold 26px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (heatmapStatus === 'mastered') {
          ctx.fillStyle = '#022c22';
        } else if (heatmapStatus === 'revision') {
          ctx.fillStyle = '#450a0a';
        } else if (heatmapStatus === 'unexplored') {
          ctx.fillStyle = '#cbd5e1';
        } else {
          ctx.fillStyle = isHighlighted || isRevision ? '#070b14' : '#f8fafc';
        }
        ctx.fillText(text, 192, 48);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.2, 0.58, 1);
      return sprite;
    };

    // Shared geometries across islands
    const baseGeo = new THREE.CylinderGeometry(1.4, 1.65, 0.35, 6);
    const terraceGeo = new THREE.CylinderGeometry(1.15, 1.3, 0.2, 6);
    const ringGeo = new THREE.TorusGeometry(1.22, 0.035, 8, 24);
    ringGeo.rotateX(Math.PI / 2);
    const studGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const plinthGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.55, 6);
    const crystalGeo = new THREE.DodecahedronGeometry(0.32, 0);
    const haloGeo = new THREE.TorusGeometry(0.55, 0.02, 6, 24);
    haloGeo.rotateX(Math.PI / 2);
    const hitBoxGeo = new THREE.BoxGeometry(3.0, 2.5, 3.0);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });

    const interactableMeshes: { mesh: THREE.Mesh; conceptId: string; title: string }[] = [];
    const islandGroups = new THREE.Group();
    scene.add(islandGroups);

    // PointLight for selected concept illumination
    let selectedPointLight: THREE.PointLight | null = null;

    // Build Composite 3-12 Part Procedural Island Models
    concepts.forEach((concept) => {
      const isSelected = concept.id === selectedConceptId;
      const isRevision = !!concept.needsRevision;
      const [x, y, z] = concept.position;

      const isMastered = concept.reviewStatus === 'reviewed';
      const isFailing = concept.needsRevision || concept.reviewStatus === 'needs_revision';
      const heatmapStatus = isHeatmapActive
        ? isMastered
          ? 'mastered'
          : isFailing
          ? 'revision'
          : 'unexplored'
        : null;

      const islandGroup = new THREE.Group();
      islandGroup.position.set(x, y, z);

      // Part 1: Radial Contact Shadow Disc on the floor plane
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, -y - 1.18, 0);
      islandGroup.add(shadowMesh);

      // Part 2: Base Bedrock Pedestal (Hexagonal foundation slab)
      let baseColor = isRevision ? 0x7f1d1d : isSelected ? 0x083344 : 0x0f172a;
      if (isHeatmapActive) {
        baseColor = isMastered ? 0x064e3b : isFailing ? 0x7f1d1d : 0x0f172a;
      }
      const baseMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.65,
        metalness: 0.25,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -0.18;
      islandGroup.add(baseMesh);

      // Part 3: Upper Stepped Terrace Deck Slab
      let terraceColor = isRevision ? 0x991b1b : isSelected ? 0x0e7490 : 0x1e293b;
      if (isHeatmapActive) {
        terraceColor = isMastered ? 0x047857 : isFailing ? 0x991b1b : 0x1e293b;
      }
      const terraceMat = new THREE.MeshStandardMaterial({
        color: terraceColor,
        roughness: 0.35,
        metalness: 0.4,
      });
      const terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
      terraceMesh.position.y = 0.08;
      islandGroup.add(terraceMesh);

      // Part 4: Luminous Perimeter Rune Ring
      let ringColor = isRevision ? 0xef4444 : isSelected ? 0x22d3ee : 0x38bdf8;
      if (isHeatmapActive) {
        ringColor = isMastered ? 0x10b981 : isFailing ? 0xef4444 : 0x64748b;
      }
      const ringMat = new THREE.MeshStandardMaterial({
        color: ringColor,
        emissive: ringColor,
        emissiveIntensity: isSelected ? 0.9 : isRevision ? 0.7 : 0.3,
        roughness: 0.2,
        metalness: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.19;
      islandGroup.add(ringMesh);

      // Part 5: Hexagonal Corner Accent Studs (6 metallic energy nodes)
      const studsGroup = new THREE.Group();
      const studMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.15,
      });
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const studMesh = new THREE.Mesh(studGeo, studMat);
        studMesh.position.set(Math.cos(angle) * 1.2, 0.2, Math.sin(angle) * 1.2);
        studsGroup.add(studMesh);
      }
      islandGroup.add(studsGroup);

      // Part 6: Center Architectural Plinth
      const plinthMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.6,
      });
      const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
      plinthMesh.position.y = 0.42;
      islandGroup.add(plinthMesh);

      // Part 7: Floating Multi-Faceted Crystalline Energy Core
      const parsedColor = parseInt((concept.color || '#8b5cf6').replace('#', '0x'), 16);
      let crystalColor = isRevision ? 0xf87171 : isSelected ? 0x67e8f9 : parsedColor;
      if (isHeatmapActive) {
        crystalColor = isMastered ? 0x34d399 : isFailing ? 0xf87171 : 0x94a3b8;
      }
      const crystalMat = new THREE.MeshStandardMaterial({
        color: crystalColor,
        emissive: crystalColor,
        emissiveIntensity: isSelected ? 0.9 : isRevision || isHeatmapActive ? 0.65 : 0.35,
        roughness: 0.08,
        metalness: 0.3,
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.position.y = 1.05;
      crystalMesh.name = `crystal-${concept.id}`;
      islandGroup.add(crystalMesh);

      // Part 8: Halo Ring for selected or revision concepts
      if (isSelected || isRevision || (isHeatmapActive && (isMastered || isFailing))) {
        const haloMat = new THREE.MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: 0.65,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.position.y = 1.05;
        haloMesh.name = `halo-${concept.id}`;
        islandGroup.add(haloMesh);
      }

      // Part 9: Local point light on the selected concept
      if (isSelected) {
        selectedPointLight = new THREE.PointLight(0x22d3ee, 2.0, 8);
        selectedPointLight.position.set(x, y + 1.2, z);
        scene.add(selectedPointLight);
      }

      // Part 10: Invisible Raycast Target Box
      const hitBoxMesh = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBoxMesh.position.y = 0.8;
      islandGroup.add(hitBoxMesh);

      interactableMeshes.push({
        mesh: hitBoxMesh,
        conceptId: concept.id,
        title: concept.title,
      });

      // Part 11: Crisp High-Legibility Overhead Label Sprite
      const labelSprite = createTextSprite(concept.title, isSelected, isRevision, heatmapStatus);
      labelSprite.position.set(0, 1.85, 0);
      islandGroup.add(labelSprite);

      islandGroups.add(islandGroup);
    });

    // 7. Directional Connection Bridges with Interactive Hover Inspection
    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    const bridgeInteractables: {
      mesh: THREE.Mesh;
      rel: Relationship;
      sourceTitle: string;
      targetTitle: string;
      defaultMat: THREE.Material;
      hoverMat: THREE.Material;
    }[] = [];

    const conceptMap = new Map<string, Concept>();
    concepts.forEach((c) => conceptMap.set(c.id, c));
    const hasSelection = !!selectedConceptId;

    relationships.forEach((rel) => {
      const source = conceptMap.get(rel.sourceId);
      const target = conceptMap.get(rel.targetId);
      if (!source || !target) return;

      const p1 = new THREE.Vector3(...source.position);
      const p2 = new THREE.Vector3(...target.position);

      const midPoint = new THREE.Vector3()
        .addVectors(p1, p2)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 0.45, 0));

      const curve = new THREE.QuadraticBezierCurve3(
        p1.clone().add(new THREE.Vector3(0, 0.15, 0)),
        midPoint,
        p2.clone().add(new THREE.Vector3(0, 0.15, 0))
      );

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.024, 6, false);
      const isConnectedToSelected =
        selectedConceptId === rel.sourceId || selectedConceptId === rel.targetId;

      const bridgeColor = isConnectedToSelected
        ? 0x22d3ee
        : hasSelection
        ? 0x1e293b
        : 0x334155;

      const bridgeOpacity = isConnectedToSelected
        ? 1.0
        : hasSelection
        ? 0.08
        : 0.35;

      const tubeMat = new THREE.MeshStandardMaterial({
        color: bridgeColor,
        emissive: isConnectedToSelected ? 0x06b6d4 : 0x000000,
        emissiveIntensity: isConnectedToSelected ? 0.8 : 0,
        transparent: true,
        opacity: bridgeOpacity,
        roughness: 0.4,
      });

      const tubeHoverMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.95,
        transparent: true,
        opacity: 1.0,
        roughness: 0.2,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      bridgeGroup.add(tubeMesh);

      bridgeInteractables.push({
        mesh: tubeMesh,
        rel,
        sourceTitle: source.title,
        targetTitle: target.title,
        defaultMat: tubeMat,
        hoverMat: tubeHoverMat,
      });
    });

    // 8. Raycasting and Click Handlers with Strict Drag-vs-Click Filtering
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let pointerDownX = 0;
    let pointerDownY = 0;
    let isDraggingOrRotating = false;
    let dragThresholdExceeded = false;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      dragThresholdExceeded = false;
      isDraggingOrRotating = false;
    };

    controls.addEventListener('start', () => {
      isTransitioningRef.current = false;
      isDraggingOrRotating = true;
      dragThresholdExceeded = true;
    });

    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons > 0) {
        const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
        if (dist > 4) {
          dragThresholdExceeded = true;
          isDraggingOrRotating = true;
        }
      }

      // If rotating or dragging, do not show hover pointers or tooltips
      if (isDraggingOrRotating || dragThresholdExceeded) {
        renderer.domElement.style.cursor = 'grabbing';
        setHoveredConceptTitle(null);
        setHoveredBridge(null);
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // 1. Raycast concept island nodes
      const hitCandidates = interactableMeshes.map((im) => im.mesh);
      const intersects = raycaster.intersectObjects(hitCandidates, false);

      if (intersects.length > 0) {
        const found = interactableMeshes.find((im) => im.mesh === intersects[0].object);
        if (found) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredConceptTitle(found.title);
          setHoveredBridge(null);
          bridgeInteractables.forEach((b) => {
            if (b.mesh.material !== b.defaultMat) b.mesh.material = b.defaultMat;
          });
          return;
        }
      }

      // 2. Raycast connection bridges!
      const bridgeMeshes = bridgeInteractables.map((b) => b.mesh);
      const bridgeIntersects = raycaster.intersectObjects(bridgeMeshes, false);

      if (bridgeIntersects.length > 0) {
        const hitBridge = bridgeInteractables.find((b) => b.mesh === bridgeIntersects[0].object);
        if (hitBridge) {
          renderer.domElement.style.cursor = 'pointer';
          bridgeInteractables.forEach((b) => {
            b.mesh.material = b === hitBridge ? b.hoverMat : b.defaultMat;
          });
          setHoveredBridge({
            relationship: hitBridge.rel,
            sourceTitle: hitBridge.sourceTitle,
            targetTitle: hitBridge.targetTitle,
          });
          setHoveredConceptTitle(null);
          sfx.playBridgeHover();
          return;
        }
      }

      // 3. Clear hover states
      renderer.domElement.style.cursor = 'default';
      setHoveredConceptTitle(null);
      setHoveredBridge(null);
      bridgeInteractables.forEach((b) => {
        if (b.mesh.material !== b.defaultMat) b.mesh.material = b.defaultMat;
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (dist > 4) {
        dragThresholdExceeded = true;
      }
      // Keep flags active momentarily so any immediate onClick event is safely suppressed
      setTimeout(() => {
        isDraggingOrRotating = false;
        dragThresholdExceeded = false;
      }, 90);
    };

    const onClick = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);

      // ABSOLUTE ROTATION & DRAG PROTECTION:
      // If user moved more than 4px or was actively rotating/orbiting, reject click completely!
      if (dragThresholdExceeded || isDraggingOrRotating || dist > 4) {
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hitCandidates = interactableMeshes.map((im) => im.mesh);
      const intersects = raycaster.intersectObjects(hitCandidates, false);

      if (intersects.length > 0) {
        const found = interactableMeshes.find((im) => im.mesh === intersects[0].object);
        if (found) {
          sfx.playNodeClick();
          onSelectConcept(found.conceptId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('click', onClick);

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // 10. Animation Loop with Pre-Allocated Scratch Math & Exponential Damping
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Respect reduced motion: subtle floating if allowed
      if (!prefersReducedMotion) {
        concepts.forEach((concept, idx) => {
          const crystal = islandGroups.getObjectByName(`crystal-${concept.id}`);
          if (crystal) {
            crystal.rotation.y = elapsedTime * 0.7 + idx;
            crystal.position.y = 1.05 + Math.sin(elapsedTime * 1.5 + idx * 0.8) * 0.05;
          }
          const halo = islandGroups.getObjectByName(`halo-${concept.id}`);
          if (halo) {
            halo.rotation.z = -elapsedTime * 0.5 + idx;
            halo.position.y = 1.05 + Math.sin(elapsedTime * 1.5 + idx * 0.8) * 0.05;
          }
        });
      }

      // Smooth camera transition using frame-rate independent exponential damping
      if (isTransitioningRef.current && cameraRef.current && controlsRef.current) {
        const cam = cameraRef.current;
        const targetPos = targetCamPosRef.current;
        const targetLook = targetLookAtRef.current;

        if (prefersReducedMotion) {
          cam.position.copy(targetPos);
          controlsRef.current.target.copy(targetLook);
          isTransitioningRef.current = false;
          flushCoords();
        } else {
          // Exponential damping: alpha = 1 - Math.exp(-decay * delta)
          const alpha = 1 - Math.exp(-6.0 * delta);
          cam.position.lerp(targetPos, alpha);
          controlsRef.current.target.lerp(targetLook, alpha);
          updateCoordsThrottled();

          if (
            cam.position.distanceTo(targetPos) < 0.03 &&
            controlsRef.current.target.distanceTo(targetLook) < 0.03
          ) {
            isTransitioningRef.current = false;
            flushCoords();
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('click', onClick);
      controls.removeEventListener('change', updateCoordsThrottled);
      controls.removeEventListener('end', flushCoords);
      controls.dispose();
      renderer.dispose();
      gridHelper.dispose();
      contactShadowTexture.dispose();
      baseGeo.dispose();
      terraceGeo.dispose();
      ringGeo.dispose();
      studGeo.dispose();
      plinthGeo.dispose();
      crystalGeo.dispose();
      haloGeo.dispose();
      shadowGeo.dispose();
      hitBoxGeo.dispose();
      if (selectedPointLight) {
        selectedPointLight.dispose();
      }
    };
  }, [concepts, relationships, selectedConceptId, webGlSupported, prefersReducedMotion, isHeatmapActive]);

  // Handle camera transition when selectedConceptId changes
  useEffect(() => {
    if (!selectedConceptId || !cameraRef.current || !controlsRef.current) return;
    const concept = concepts.find((c) => c.id === selectedConceptId);
    if (!concept) return;

    const [x, y, z] = concept.position;
    targetLookAtRef.current = new THREE.Vector3(x, y + 0.4, z);
    targetCamPosRef.current = new THREE.Vector3(x + 2.8, y + 3.8, z + 6.0);
    isTransitioningRef.current = true;
  }, [selectedConceptId, concepts]);

  // Calculate bounding box and framing parameters to fit all concept nodes
  const calculateFitTransform = (targetConcepts = concepts) => {
    if (targetConcepts.length === 0) {
      return {
        lookAt: new THREE.Vector3(0, 0, 0),
        camPos: new THREE.Vector3(0, 12, 18),
      };
    }

    const box = new THREE.Box3();
    targetConcepts.forEach((c) => {
      const [x, y, z] = c.position;
      box.expandByPoint(new THREE.Vector3(x - 2.0, y - 1.0, z - 2.0));
      box.expandByPoint(new THREE.Vector3(x + 2.0, y + 2.4, z + 2.0));
    });

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const camera = cameraRef.current;
    const fov = ((camera?.fov || 40) * Math.PI) / 180;
    const aspect =
      camera?.aspect ||
      (mountRef.current && mountRef.current.clientHeight > 0
        ? mountRef.current.clientWidth / mountRef.current.clientHeight
        : 16 / 9);

    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const distY = size.y / (2 * Math.tan(fov / 2));
    const distX = size.x / (2 * Math.tan(horizontalFov / 2));
    const distZ = size.z / (2 * Math.tan(fov / 2));

    const fitDistance = Math.max(distY, distX, distZ, 8) * 1.08;
    const clampedDistance = THREE.MathUtils.clamp(fitDistance, 10, 38);

    const elevationAngle = 0.50;
    const distanceAngle = 0.82;

    const camPos = new THREE.Vector3(
      center.x,
      center.y + clampedDistance * elevationAngle,
      center.z + clampedDistance * distanceAngle
    );

    return { lookAt: center, camPos };
  };

  // Zoom to Fit: smoothly re-frames all concepts within viewport
  const handleZoomToFit = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const { lookAt, camPos } = calculateFitTransform(concepts);
    targetLookAtRef.current.copy(lookAt);
    targetCamPosRef.current.copy(camPos);
    isTransitioningRef.current = true;
    setIsTopDown(false);
    sfx.playFlightWhoosh();
  };

  // Reset Camera to standard coordinate overview
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const { lookAt, camPos } = calculateFitTransform(concepts);
    targetLookAtRef.current.copy(lookAt);
    targetCamPosRef.current.copy(camPos);
    isTransitioningRef.current = true;
    setIsTopDown(false);
    sfx.playFlightWhoosh();
  };

  // Incremental Zoom In
  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const currentDist = dir.length();
    const newDist = Math.max(controlsRef.current.minDistance, currentDist * 0.72);
    dir.setLength(newDist);
    targetCamPosRef.current.copy(target).add(dir);
    targetLookAtRef.current.copy(target);
    isTransitioningRef.current = true;
  };

  // Incremental Zoom Out
  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    const currentDist = dir.length();
    const newDist = Math.min(controlsRef.current.maxDistance, currentDist * 1.38);
    dir.setLength(newDist);
    targetCamPosRef.current.copy(target).add(dir);
    targetLookAtRef.current.copy(target);
    isTransitioningRef.current = true;
  };

  // Focus directly on the currently active concept
  const handleFocusSelected = () => {
    if (!selectedConceptId || !cameraRef.current || !controlsRef.current) return;
    const concept = concepts.find((c) => c.id === selectedConceptId);
    if (!concept) return;
    const [x, y, z] = concept.position;
    targetLookAtRef.current.set(x, y + 0.4, z);
    targetCamPosRef.current.set(x + 2.8, y + 3.8, z + 6.0);
    isTransitioningRef.current = true;
    setIsTopDown(false);
    sfx.playFlightWhoosh();
  };

  // Toggle between 3D Isometric View and 2D Top-Down Bird's-Eye View
  const handleToggleTopDown = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (isTopDown) {
      handleZoomToFit();
    } else {
      const { lookAt } = calculateFitTransform(concepts);
      targetLookAtRef.current.copy(lookAt);
      targetCamPosRef.current.set(lookAt.x, lookAt.y + 26, lookAt.z + 0.01);
      isTransitioningRef.current = true;
      setIsTopDown(true);
    }
  };

  // Generate cluster bookmarks dynamically from concepts
  const clusterBookmarks = useMemo(() => {
    const clusterMap = new Map<string, Concept[]>();
    concepts.forEach((c) => {
      const group = clusterMap.get(c.cluster) || [];
      group.push(c);
      clusterMap.set(c.cluster, group);
    });

    const bms: CameraBookmark[] = [];

    // Global overview bookmark
    const overview = calculateFitTransform(concepts);
    bms.push({
      id: 'cluster-overview',
      name: 'Entire Archipelago',
      description: `All ${concepts.length} concept islands`,
      camPos: [
        parseFloat(overview.camPos.x.toFixed(2)),
        parseFloat(overview.camPos.y.toFixed(2)),
        parseFloat(overview.camPos.z.toFixed(2)),
      ],
      targetLookAt: [
        parseFloat(overview.lookAt.x.toFixed(2)),
        parseFloat(overview.lookAt.y.toFixed(2)),
        parseFloat(overview.lookAt.z.toFixed(2)),
      ],
      conceptCount: concepts.length,
      isCustom: false,
      createdAt: 0,
    });

    // Each specific cluster of concepts
    clusterMap.forEach((clusterConcepts, clusterName) => {
      const transform = calculateFitTransform(clusterConcepts);
      bms.push({
        id: `cluster-${clusterName}`,
        name: `${clusterName} Cluster`,
        description: `${clusterConcepts.length} islands: ${clusterConcepts.map((c) => c.title).slice(0, 3).join(', ')}${clusterConcepts.length > 3 ? '...' : ''}`,
        camPos: [
          parseFloat(transform.camPos.x.toFixed(2)),
          parseFloat(transform.camPos.y.toFixed(2)),
          parseFloat(transform.camPos.z.toFixed(2)),
        ],
        targetLookAt: [
          parseFloat(transform.lookAt.x.toFixed(2)),
          parseFloat(transform.lookAt.y.toFixed(2)),
          parseFloat(transform.lookAt.z.toFixed(2)),
        ],
        clusterName,
        conceptCount: clusterConcepts.length,
        isCustom: false,
        createdAt: 0,
      });
    });

    return bms;
  }, [concepts]);

  // Combined bookmarks list for quick numbered shortcuts (1-9)
  const allBookmarks = useMemo(() => {
    return [...clusterBookmarks, ...customBookmarks];
  }, [clusterBookmarks, customBookmarks]);

  // Fly directly to a bookmark's camera angle
  const handleFlyToBookmark = (bookmark: CameraBookmark) => {
    if (!cameraRef.current || !controlsRef.current) return;
    targetLookAtRef.current.set(...bookmark.targetLookAt);
    targetCamPosRef.current.set(...bookmark.camPos);
    isTransitioningRef.current = true;
    setIsTopDown(false);
    setActiveBookmarkId(bookmark.id);
    setNavFeedbackMessage(bookmark.name);
    sfx.playFlightWhoosh();
    setTimeout(() => {
      setNavFeedbackMessage(null);
    }, 2400);
  };

  // Save current camera view as a custom bookmark
  const handleSaveCurrentBookmark = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!cameraRef.current || !controlsRef.current) return;
    const name = newBookmarkName.trim() || `Custom View ${customBookmarks.length + 1}`;
    const cam = cameraRef.current;
    const target = controlsRef.current.target;

    const newBookmark: CameraBookmark = {
      id: `custom-${Date.now()}`,
      name,
      description: `Position [${cam.position.x.toFixed(1)}, ${cam.position.z.toFixed(1)}]`,
      camPos: [
        parseFloat(cam.position.x.toFixed(2)),
        parseFloat(cam.position.y.toFixed(2)),
        parseFloat(cam.position.z.toFixed(2)),
      ],
      targetLookAt: [
        parseFloat(target.x.toFixed(2)),
        parseFloat(target.y.toFixed(2)),
        parseFloat(target.z.toFixed(2)),
      ],
      isCustom: true,
      createdAt: Date.now(),
    };

    const updated = [newBookmark, ...customBookmarks];
    setCustomBookmarks(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsCreatingBookmark(false);
    setNewBookmarkName('');
    setActiveBookmarkId(newBookmark.id);
    setNavFeedbackMessage(`Saved: ${name}`);
    sfx.playSuccessChime();
    setTimeout(() => setNavFeedbackMessage(null), 2400);
  };

  // Delete custom bookmark
  const handleDeleteCustomBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = customBookmarks.filter((b) => b.id !== id);
    setCustomBookmarks(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (activeBookmarkId === id) setActiveBookmarkId(null);
  };

  // Handle Reset View Trigger - Smooth Zoom to Fit
  useEffect(() => {
    if (resetTrigger === 0 || !cameraRef.current || !controlsRef.current) return;
    handleZoomToFit();
  }, [resetTrigger]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        setIsSpotlightOpen(true);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleZoomToFit();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetCamera();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleToggleTopDown();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setIsBookmarksOpen((prev) => !prev);
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (allBookmarks[idx]) {
          e.preventDefault();
          handleFlyToBookmark(allBookmarks[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [concepts, selectedConceptId, isTopDown, allBookmarks]);

  if (!webGlSupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
        <p className="font-semibold text-lg text-amber-400 mb-2">3D Acceleration Not Available</p>
        <p className="text-sm max-w-md text-slate-400">
          Your browser or display environment does not support WebGL 3D rendering. Please switch to the 2D Concept List view using the toggle above.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full" />

      {/* Hover tooltip */}
      {hoveredConceptTitle && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-xs font-mono backdrop-blur-md shadow-lg flex items-center gap-2 z-20">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Click to explore room: <strong>{hoveredConceptTitle}</strong></span>
        </div>
      )}

      {/* Top Floating Viewport Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left Toolbar Cluster: Navigation, View Mode, Search */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-xl font-sans">
          {/* Sidebar Drawer Toggle */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-all ${
              isSidebarOpen
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900 border border-transparent'
            }`}
            title="Toggle Concepts Sidebar"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 my-auto" />

          {/* 3D vs 2D View Switcher */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => onViewModeChange && onViewModeChange('3d')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive 3D Map View"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Map</span>
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('2d')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Accessible 2D List Matrix"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <div className="w-px h-5 bg-slate-800 my-auto" />

          {/* Spotlight Search Trigger */}
          <button
            onClick={() => setIsSpotlightOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-sans"
            title="Search concepts (⌘K or /)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center Toolbar Cluster: Study Modes & Audio Guidance */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-1.5 shadow-xl font-sans">
          {/* Retention & Mastery Heatmap Toggle */}
          <button
            onClick={() => {
              setIsHeatmapActive((prev) => {
                const next = !prev;
                sfx.playTourStep();
                setNavFeedbackMessage(
                  next ? 'Mastery Heatmap Enabled' : 'Standard View'
                );
                setTimeout(() => setNavFeedbackMessage(null), 2500);
                return next;
              });
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium ${
              isHeatmapActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
            }`}
            title="Show retention status: Mastered (green) vs Need Revision (coral)"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                isHeatmapActive ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
            <span>Mastery Heatmap</span>
          </button>

          {/* Guided Audio Tour */}
          <button
            onClick={() => {
              setIsTourActive((prev) => {
                const next = !prev;
                if (next) {
                  setTourIndex(0);
                  setTourProgress(0);
                  setIsTourPaused(false);
                  sfx.playSuccessChime();
                  setNavFeedbackMessage('Starting Audio Tour');
                } else {
                  setNavFeedbackMessage('Audio Tour Ended');
                }
                setTimeout(() => setNavFeedbackMessage(null), 2500);
                return next;
              });
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium ${
              isTourActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
            }`}
            title="Start guided audio walkthrough of concept structures"
          >
            <Play
              className={`w-3.5 h-3.5 ${
                isTourActive ? 'text-cyan-400 fill-cyan-400' : 'text-cyan-400'
              }`}
            />
            <span>Audio Tour</span>
          </button>

          {/* Revision Sheet / Cheat Sheet Export */}
          {onOpenCheatSheet && (
            <button
              onClick={onOpenCheatSheet}
              className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Open Printable Study Summary & Revision Notes"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Study Sheet</span>
            </button>
          )}
        </div>

        {/* Right Action: Upload Notes & Take Diagnostic Quiz */}
        <div className="pointer-events-auto flex items-center gap-2 font-sans">
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Upload PDF or paste custom study notes"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Upload notes</span>
            </button>
          )}

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              title="Take 5-Question Grounded Diagnostic Quiz"
            >
              <ClipboardList className="w-4 h-4 text-slate-950" />
              <span>Take quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics & Grounding Badge */}
      <div className="absolute top-18 left-4 z-20 flex flex-col items-start gap-2 max-w-[calc(100vw-2rem)] pointer-events-none">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg text-xs font-sans">
          {/* Concepts Count */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90"
            title={`${concepts.length} Concept structures in map`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-100">{concepts.length}</span>
            <span className="text-slate-400 text-[11px]">Concepts</span>
          </div>

          {/* Active Connections */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90"
            title={`${relationships.length} directional relationships`}
          >
            <Share2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="font-semibold text-violet-300">
              {selectedConceptId
                ? `${selectedConnectionsCount} connected`
                : `${relationships.length} connections`}
            </span>
          </div>

          {/* Verified Citations Badge */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px]"
            title="All explanations grounded with citations from course notes"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Grounded in Notes</span>
          </div>
        </div>

        {/* Orbit & Navigation Hint */}
        <div className="text-[11px] font-sans text-slate-400 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-lg backdrop-blur-xs flex items-center gap-2 shadow-sm">
          <span>Drag to rotate</span>
          <span>·</span>
          <span>Scroll to zoom</span>
          <span>·</span>
          <span>Click concept to inspect</span>
        </div>

        {/* Navigation & Camera Feedback HUD Toast */}
        {navFeedbackMessage && (
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-200 font-sans text-xs flex items-center gap-2 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-2">
            <BookmarkCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{navFeedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Map Viewport Controls Toolbar */}
      <div
        className="absolute bottom-6 left-6 z-20 flex flex-col items-center bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl space-y-1"
        role="toolbar"
        aria-label="Map viewport controls"
      >
        {/* Zoom to Fit (Reset zoom to frame all structures) */}
        <button
          onClick={handleZoomToFit}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90 active:scale-95 transition-all group relative"
          title="Zoom to Fit — Frame all concept structures (F)"
          aria-label="Zoom to Fit all structures"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            Zoom to Fit (F)
          </span>
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90 active:scale-95 transition-all group relative"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            Zoom In (+)
          </span>
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90 active:scale-95 transition-all group relative"
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            Zoom Out (-)
          </span>
        </button>

        <div className="w-5 h-px bg-slate-800/80 my-0.5" />

        {/* Focus selected concept if one is active */}
        {selectedConceptId && (
          <button
            onClick={handleFocusSelected}
            className="p-2 rounded-xl text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/50 active:scale-95 transition-all group relative"
            title="Focus Selected Island"
            aria-label="Focus Selected Island"
          >
            <Focus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
              Focus Selected
            </span>
          </button>
        )}

        {/* Reset Camera / Perspective to standard coordinates */}
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90 active:scale-95 transition-all group relative"
          title="Reset Camera (R)"
          aria-label="Reset Camera"
        >
          <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            Reset Camera (R)
          </span>
        </button>

        {/* Top-Down Bird's Eye View Toggle */}
        <button
          onClick={handleToggleTopDown}
          className={`p-2 rounded-xl active:scale-95 transition-all group relative ${
            isTopDown
              ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-700/60'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90'
          }`}
          title={isTopDown ? "Return to 3D Isometric View (P)" : "Top-Down Bird's-Eye View (P)"}
          aria-label="Toggle camera view angle"
        >
          <Compass className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            {isTopDown ? '3D Isometric (P)' : "Top-Down (P)"}
          </span>
        </button>

        <div className="w-5 h-px bg-slate-800/80 my-0.5" />

        {/* Camera Bookmarks Toggle */}
        <button
          onClick={() => setIsBookmarksOpen((o) => !o)}
          className={`p-2 rounded-xl active:scale-95 transition-all group relative ${
            isBookmarksOpen
              ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 shadow-sm'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90'
          }`}
          title="Camera Bookmarks & Clusters (B)"
          aria-label="Toggle camera bookmarks"
        >
          <Bookmark className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          {allBookmarks.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
              {allBookmarks.length}
            </span>
          )}
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            Bookmarks (B)
          </span>
        </button>

        {/* Lock / Unlock Camera Rotation */}
        <button
          onClick={() => {
            setIsCameraLocked((prev) => {
              const next = !prev;
              setNavFeedbackMessage(next ? 'Camera rotation locked' : 'Camera rotation unlocked');
              setTimeout(() => setNavFeedbackMessage(null), 2500);
              return next;
            });
          }}
          className={`p-2 rounded-xl transition-all group relative ${
            isCameraLocked
              ? 'text-amber-400 bg-amber-950/70 border border-amber-600/50'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90'
          }`}
          title={isCameraLocked ? 'Unlock Camera Rotation' : 'Lock Camera Rotation'}
          aria-label="Toggle camera rotation lock"
        >
          {isCameraLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            {isCameraLocked ? 'Unlock Rotation' : 'Lock Rotation'}
          </span>
        </button>

        {/* Spatial Audio Cues Toggle */}
        <button
          onClick={() => {
            const muted = sfx.toggleMute();
            setIsMuted(muted);
            if (!muted) sfx.playNodeClick();
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-800/90 active:scale-95 transition-all group relative"
          title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
          aria-label="Toggle audio cues"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
          <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
            {isMuted ? 'Unmute Audio' : 'Mute Audio'}
          </span>
        </button>

        {/* Add Custom Concept */}
        {onOpenAddIsland && (
          <button
            onClick={onOpenAddIsland}
            className="p-2 rounded-xl text-violet-400 hover:text-violet-200 hover:bg-violet-950/60 active:scale-95 transition-all group relative"
            title="Add Custom Concept to Map"
            aria-label="Add Custom Concept"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900 border border-violet-800/80 text-[10px] font-mono text-violet-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-30">
              Add Concept
            </span>
          </button>
        )}
      </div>

      {/* Camera Bookmarks Flyout Drawer */}
      {isBookmarksOpen && (
        <div className="absolute bottom-6 left-20 z-30 w-84 max-w-[calc(100vw-6rem)] max-h-[500px] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-left-3">
          {/* Header */}
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bookmark className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-slate-100 tracking-wide">
                Camera Bookmarks
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[10px] font-mono">
                {allBookmarks.length}
              </span>
            </div>
            <button
              onClick={() => setIsBookmarksOpen(false)}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Close drawer (B)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Current View Action Form */}
          <div className="p-3 bg-slate-900/40 border-b border-slate-800/60 shrink-0">
            {!isCreatingBookmark ? (
              <button
                onClick={() => {
                  setIsCreatingBookmark(true);
                  setNewBookmarkName('');
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-300 hover:text-cyan-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Current View</span>
              </button>
            ) : (
              <form onSubmit={handleSaveCurrentBookmark} className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={newBookmarkName}
                  onChange={(e) => setNewBookmarkName(e.target.value)}
                  placeholder="e.g. Cluster Vantage Point..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/50 text-slate-100 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition-colors"
                  >
                    Save Bookmark
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingBookmark(false);
                      setNewBookmarkName('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
            {/* 1. Concept Clusters Section */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  Concept Clusters
                </span>
                <span>{clusterBookmarks.length} views</span>
              </div>
              <div className="space-y-1.5">
                {clusterBookmarks.map((bm, index) => {
                  const isActive = activeBookmarkId === bm.id;
                  const shortcutNumber = index < 9 ? index + 1 : null;
                  return (
                    <button
                      key={bm.id}
                      onClick={() => handleFlyToBookmark(bm)}
                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-cyan-950/60 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold text-xs truncate ${isActive ? 'text-cyan-300' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                            {bm.name}
                          </span>
                        </div>
                        {bm.description && (
                          <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                            {bm.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {shortcutNumber && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-700 transition-colors">
                            [{shortcutNumber}]
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Custom Saved Views Section */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3 h-3 text-violet-400" />
                  Custom Views
                </span>
                <span>{customBookmarks.length} saved</span>
              </div>
              {customBookmarks.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900/30 border border-dashed border-slate-800 text-center text-slate-500 text-[11px] font-mono">
                  No custom views saved yet.<br />
                  Orbit to any angle and click &apos;Save Current View&apos;.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {customBookmarks.map((bm, index) => {
                    const isActive = activeBookmarkId === bm.id;
                    const overallIndex = clusterBookmarks.length + index;
                    const shortcutNumber = overallIndex < 9 ? overallIndex + 1 : null;
                    return (
                      <div
                        key={bm.id}
                        onClick={() => handleFlyToBookmark(bm)}
                        className={`w-full p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                          isActive
                            ? 'bg-violet-950/50 border-violet-500/50 shadow-sm'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className={`font-semibold text-xs truncate block ${isActive ? 'text-violet-300' : 'text-slate-200 group-hover:text-violet-300'}`}>
                            {bm.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 truncate block mt-0.5">
                            {bm.description || `Pos: [${bm.camPos[0]}, ${bm.camPos[2]}]`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {shortcutNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 group-hover:text-violet-300">
                              [{shortcutNumber}]
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteCustomBookmark(bm.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete custom view"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Shortcuts Hint */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between shrink-0">
            <span>Press [1-9] to jump</span>
            <span>[B] Toggle Drawer</span>
          </div>
        </div>
      )}

      {/* Interactive Relationship Bridge Hover Inspector */}
      {hoveredBridge && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-950/95 border border-slate-700/80 text-xs font-sans backdrop-blur-xl shadow-2xl flex items-center gap-3.5 z-30 animate-in fade-in zoom-in-95">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">{hoveredBridge.sourceTitle}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                {hoveredBridge.relationship.label}
              </span>
              <span className="text-slate-400 text-xs">➔</span>
              <span className="font-semibold text-sm text-slate-100">{hoveredBridge.targetTitle}</span>
            </div>
            {hoveredBridge.relationship.explanation && (
              <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
                {hoveredBridge.relationship.explanation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Guided Audio Walkthrough Controller */}
      {isTourActive && concepts[tourIndex] && (
        <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg mx-auto px-4 z-40 animate-in fade-in slide-in-from-bottom-3 font-sans">
          <div className="bg-slate-950/95 border border-slate-700/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl space-y-3">
            {/* Top Header & Progress */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-300 font-semibold text-xs">
                  Audio Walkthrough · Concept {tourIndex + 1} of {concepts.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                  {concepts[tourIndex].cluster}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsTourActive(false);
                  setTourProgress(0);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Exit Walkthrough"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Concept Title & Brief Explanation */}
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                {concepts[tourIndex].title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed font-sans font-light">
                {concepts[tourIndex].briefExplanation}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-100"
                style={{ width: `${tourProgress}%` }}
              />
            </div>

            {/* Navigation Controls & AI Voice Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setTourProgress(0);
                    setTourIndex((prev) => (prev - 1 + concepts.length) % concepts.length);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => setIsTourPaused((p) => !p)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  {isTourPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-cyan-300" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setTourProgress(0);
                    setTourIndex((prev) => (prev + 1) % concepts.length);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Voice Guide Toggle */}
              <button
                onClick={() => {
                  const next = narrator.toggle();
                  setIsVoiceEnabled(next);
                  if (!next) {
                    narrator.stop();
                  } else if (concepts[tourIndex]) {
                    narrator.speak(
                      `${concepts[tourIndex].title}. ${concepts[tourIndex].briefExplanation}`
                    );
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                  isVoiceEnabled
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={isVoiceEnabled ? 'Disable Voice Guidance' : 'Enable Voice Guidance'}
              >
                {isVoiceEnabled ? (
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <MicOff className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] font-semibold">
                  {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Overview Navigator */}
      <div className="absolute top-18 right-6 z-20 pointer-events-auto">
        <div className="bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-2xl p-2.5 shadow-xl space-y-1.5 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-1.5 px-1">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium text-[11px] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Map Overview</span>
            </span>
            <button
              onClick={() => setIsRadarOpen((prev) => !prev)}
              className="text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
            >
              {isRadarOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          {isRadarOpen && (
            <div className="relative w-28 h-28 bg-[#060a14] border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center">
              {/* Concentric Guide Rings */}
              <div className="absolute inset-2 border border-slate-800/70 rounded-full pointer-events-none" />
              <div className="absolute inset-6 border border-slate-800/50 rounded-full pointer-events-none" />
              <div className="absolute w-full h-[1px] bg-slate-800/40 pointer-events-none" />
              <div className="absolute h-full w-[1px] bg-slate-800/40 pointer-events-none" />

              {/* Concept Blips */}
              {concepts.map((concept) => {
                const normX =
                  (concept.position[0] - (radarBounds.minX + radarBounds.maxX) / 2) /
                  (radarBounds.spanX / 2);
                const normZ =
                  (concept.position[2] - (radarBounds.minZ + radarBounds.maxZ) / 2) /
                  (radarBounds.spanZ / 2);
                const dotX = 56 + normX * 42;
                const dotY = 56 + normZ * 42;
                const isSelected = concept.id === selectedConceptId;
                const isMastered = concept.reviewStatus === 'reviewed';
                const isRevision =
                  concept.needsRevision || concept.reviewStatus === 'needs_revision';

                return (
                  <button
                    key={concept.id}
                    onClick={() => onSelectConcept(concept.id)}
                    style={{ left: `${dotX}px`, top: `${dotY}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-150 z-10 p-0.5"
                    title={`${concept.title} (${concept.cluster})`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${
                        isSelected
                          ? 'bg-cyan-300 ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 scale-125'
                          : isMastered
                          ? 'bg-emerald-400'
                          : isRevision
                          ? 'bg-rose-400 shadow-sm shadow-rose-400/50'
                          : 'bg-slate-400 hover:bg-cyan-400'
                      }`}
                    />
                  </button>
                );
              })}

              {/* Camera Position & Direction Indicator */}
              {(() => {
                const camNormX =
                  (cameraCoords.x - (radarBounds.minX + radarBounds.maxX) / 2) /
                  (radarBounds.spanX / 2);
                const camNormZ =
                  (cameraCoords.z - (radarBounds.minZ + radarBounds.maxZ) / 2) /
                  (radarBounds.spanZ / 2);
                const cx = 56 + Math.max(-1.15, Math.min(1.15, camNormX)) * 42;
                const cy = 56 + Math.max(-1.15, Math.min(1.15, camNormZ)) * 42;
                return (
                  <div
                    style={{ left: `${cx}px`, top: `${cy}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-cyan-400 rounded-full flex items-center justify-center pointer-events-none z-20 shadow-xs"
                    title="Camera Position"
                  >
                    <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Feature 5: Spotlight Quick-Search & Warp Modal */}
      {isSpotlightOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
          <div className="bg-[#0b1120] border border-cyan-500/50 rounded-2xl w-full max-w-lg p-4 text-slate-100 shadow-2xl space-y-3 font-sans animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={spotlightQuery}
                onChange={(e) => setSpotlightQuery(e.target.value)}
                placeholder="Search concepts, clusters, or definitions..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
              />
              <button
                onClick={() => setIsSpotlightOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
              {spotlightResults.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No matching concept islands found.
                </div>
              ) : (
                spotlightResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectConcept(c.id);
                      setIsSpotlightOpen(false);
                      setSpotlightQuery('');
                      sfx.playFlightWhoosh();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-cyan-950/60 border border-slate-800/80 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 group-hover:text-cyan-300 truncate font-sans">
                          {c.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400">
                          {c.cluster}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-light">
                        {c.briefExplanation}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>Click or press Enter to warp to island</span>
              </span>
              <span>[ESC] to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature 3: Retention & Mastery Heatmap Legend */}
      {isHeatmapActive && (
        <div className="absolute bottom-8 right-6 z-30 pointer-events-none flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-md shadow-2xl font-mono text-[11px] animate-in fade-in slide-in-from-right-3">
          <span className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-0.5">
            Mastery Heatmap
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-emerald-300">Mastered (Reviewed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50 animate-pulse" />
            <span className="text-rose-300">Needs Revision / Gap</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">Unexplored</span>
          </div>
        </div>
      )}
    </div>
  );
};
