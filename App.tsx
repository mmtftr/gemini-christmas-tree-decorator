import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Sky,
  PerspectiveCamera,
  Stars,
} from '@react-three/drei';
import { PineTree } from './components/PineTree';
import { OrnamentMesh, GhostOrnament } from './components/Ornaments';
import { TreeTopper } from './components/TreeTopper';
import { DecorationPanel } from './components/DecorationPanel';
import { ChristmasMusicPanel } from './components/ChristmasMusicPanel';
import { generateTreeTheme } from './services/geminiService';
import { useTreeStore } from './data/treeStore';
import {
  OrnamentType,
  TopperType,
  EditorMode,
} from './types';
import { Loader2, Sparkles, RefreshCw, Share2, Users } from 'lucide-react';

// ============================================
// MAIN APP
// ============================================

export default function App() {
  // Tree Store (data layer - ready for Convex)
  const store = useTreeStore();

  // Local UI State
  const [mode, setMode] = useState<EditorMode>('view');
  const [selectedOrnamentType, setSelectedOrnamentType] = useState<OrnamentType>('sphere');
  const [selectedTopperType, setSelectedTopperType] = useState<TopperType>('star');
  const [selectedColor, setSelectedColor] = useState<string>('#ffd700');
  const [activePlacement, setActivePlacement] = useState<[number, number, number] | null>(null);

  // AI Theme State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Calculate tree top position based on config (matches PineTree geometry)
  // Tree has 5 tiers, top spike ends at: 1.0 + 4 * (height * 0.18) + height * 0.25
  const treeTopY = 1.0 + 4 * (store.treeConfig.height * 0.18) + store.treeConfig.height * 0.25 + 0.3;
  const treeTopPosition: [number, number, number] = [0, treeTopY - 1, 0]; // -1 for group offset

  // ============================================
  // HANDLERS
  // ============================================

  const handleGenerateTheme = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError(null);
    try {
      const theme = await generateTreeTheme(aiPrompt);
      store.updateTreeConfig({
        color: theme.treeColor,
        snowAmount: theme.snowAmount,
        seed: Math.random() * 1000,
      });
      if (theme.ornamentColors.length > 0) {
        setSelectedColor(theme.ornamentColors[0]);
      }
      document.body.style.backgroundColor = theme.backgroundColor;
    } catch (e) {
      console.error(e);
      setAiError('Failed to generate theme. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTreeHover = useCallback(
    (e: any) => {
      if (mode !== 'decorate') {
        if (activePlacement) setActivePlacement(null);
        return;
      }

      e.stopPropagation();
      const point = e.point;
      const normal = e.face?.normal?.clone()?.transformDirection(e.object.matrixWorld)?.normalize();

      if (!normal) return;

      const pos: [number, number, number] = [
        point.x + normal.x * 0.15,
        point.y + normal.y * 0.15,
        point.z + normal.z * 0.15,
      ];
      setActivePlacement(pos);
    },
    [mode, activePlacement]
  );

  const handleTreeClick = useCallback(
    async (e: any) => {
      if (mode !== 'decorate' || !activePlacement) return;

      e.stopPropagation();

      if (!store.canAddOrnament()) {
        console.warn('Quota exceeded');
        return;
      }

      await store.addOrnament({
        type: selectedOrnamentType,
        color: selectedColor,
        position: activePlacement,
        scale: 1,
      });
    },
    [mode, activePlacement, selectedOrnamentType, selectedColor, store]
  );

  const handleTreeOut = useCallback(() => {
    setActivePlacement(null);
  }, []);

  const handleRemoveOrnament = useCallback(
    async (id: string, e: any) => {
      e.stopPropagation();
      await store.removeOrnament(id);
    },
    [store]
  );

  const handleTopperClick = useCallback(async () => {
    if (mode !== 'topper') return;

    await store.setTopper({
      type: selectedTopperType,
      color: selectedColor,
      scale: 1.2,
      glow: true,
    });

    // Switch back to view mode after placing topper
    setMode('view');
  }, [mode, selectedTopperType, selectedColor, store]);

  const handleClearAll = useCallback(async () => {
    await store.clearOrnaments();
    await store.setTopper(null);
  }, [store]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="relative w-full h-screen text-white font-sans select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows dpr={[1, 2]} className="bg-gradient-to-b from-slate-900 to-slate-800">
        <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={45} />
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 20, 10]}
          angle={0.25}
          penumbra={1}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.4} color="#ffd700" />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#ff6b6b" />

        {/* Environment */}
        <Environment preset="night" background={false} />
        <Sky sunPosition={[100, 10, 100]} turbidity={8} rayleigh={2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Tree */}
        <group position={[0, -2, 0]}>
          <PineTree
            config={store.treeConfig}
            onPointerMove={handleTreeHover}
            onPointerOut={handleTreeOut}
            onClick={handleTreeClick}
          />

          {/* Tree Topper */}
          <TreeTopper
            data={store.topper}
            position={treeTopPosition}
            onClick={handleTopperClick}
            isPlacementMode={mode === 'topper'}
          />
        </group>

        {/* Ornaments */}
        <group>
          {store.ornaments.map((orn) => (
            <OrnamentMesh
              key={orn.id}
              data={orn}
              onClick={(e) => mode === 'view' && handleRemoveOrnament(orn.id, e)}
            />
          ))}

          {/* Ghost Ornament Preview */}
          {mode === 'decorate' && activePlacement && (
            <GhostOrnament
              type={selectedOrnamentType}
              color={selectedColor}
              position={activePlacement}
            />
          )}
        </group>

        {/* Ground */}
        <ContactShadows
          position={[0, -3.2, 0]}
          opacity={0.6}
          scale={25}
          blur={2.5}
          far={4}
          resolution={256}
          color="#000000"
        />

        {/* Snowy ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]}>
          <circleGeometry args={[15, 64]} />
          <meshStandardMaterial color="#f0f8ff" roughness={0.9} metalness={0} />
        </mesh>

        <OrbitControls
          makeDefault
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          target={[0, 1, 0]}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col">
        {/* Top Section */}
        <div className="flex justify-between items-start p-4 md:p-6">
          {/* Left Panel - Controls */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/10 max-w-xs shadow-2xl">
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-green-500 flex items-center justify-center">
                <span className="text-xl">🎄</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 via-white to-green-400 bg-clip-text text-transparent">
                  Tree Decorator
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Collaborative Edition</p>
              </div>
            </div>

            {/* AI Theme Generator */}
            <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
              <label className="text-xs font-semibold uppercase text-blue-300 flex items-center gap-1.5">
                <Sparkles size={12} /> AI Theme Generator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateTheme()}
                  placeholder="e.g. 'Frozen Wonderland'"
                  className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                />
                <button
                  onClick={handleGenerateTheme}
                  disabled={isGenerating || !aiPrompt}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors font-medium"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Go'}
                </button>
              </div>
              {aiError && <p className="text-xs text-red-400">{aiError}</p>}
            </div>

            {/* Tree Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-gray-400">Tree Seed</label>
                <button
                  onClick={() => store.updateTreeConfig({ seed: Math.random() * 1000 })}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Height</span>
                  <span>{store.treeConfig.height.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={store.treeConfig.height}
                  onChange={(e) =>
                    store.updateTreeConfig({ height: parseFloat(e.target.value) })
                  }
                  className="w-full accent-green-500 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Snow</span>
                  <span>{Math.round(store.treeConfig.snowAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={store.treeConfig.snowAmount}
                  onChange={(e) =>
                    store.updateTreeConfig({ snowAmount: parseFloat(e.target.value) })
                  }
                  className="w-full accent-blue-300 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Session Info & Music */}
          <div className="pointer-events-auto flex flex-col items-end gap-3">
            {/* Share Button (placeholder) */}
            <button
              className="bg-black/60 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-black/70 transition-colors text-sm"
              onClick={() => alert('Share functionality will be available with Convex backend!')}
            >
              <Share2 size={16} />
              Share Tree
            </button>

            {/* Collaborators Placeholder */}
            <div className="bg-black/60 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-xs text-gray-400">
              <Users size={14} />
              <span>Solo Mode</span>
            </div>

            {/* Ornament Count */}
            <div className="bg-black/60 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 text-xs">
              <span className="text-gray-400">Ornaments: </span>
              <span className="text-white font-medium">{store.ornaments.length}</span>
              <span className="text-gray-500">
                {' '}
                / {store.currentUser?.quota.maxOrnaments === Infinity ? '∞' : store.currentUser?.quota.maxOrnaments}
              </span>
            </div>

            {/* Christmas Music Panel */}
            <ChristmasMusicPanel />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom - Decoration Panel */}
        <DecorationPanel
          mode={mode}
          onModeChange={setMode}
          selectedOrnamentType={selectedOrnamentType}
          onOrnamentTypeChange={setSelectedOrnamentType}
          selectedTopperType={selectedTopperType}
          onTopperTypeChange={setSelectedTopperType}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onClearAll={handleClearAll}
          ornamentCount={store.ornaments.length}
          maxOrnaments={store.currentUser?.quota.maxOrnaments ?? 10}
          topperSet={!!store.topper}
        />
      </div>

      {/* Instructions Overlay */}
      {mode === 'view' && store.ornaments.length === 0 && !store.topper && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 text-center max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Welcome to Tree Decorator!</h2>
            <p className="text-sm text-gray-300 mb-3">
              Switch to <span className="text-green-400 font-medium">Decorate</span> mode to add ornaments,
              or <span className="text-yellow-400 font-medium">Topper</span> mode to crown your tree.
            </p>
            <p className="text-xs text-gray-500">
              Try the AI Theme Generator for instant holiday magic!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
