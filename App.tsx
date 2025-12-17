import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { PineTree } from './components/PineTree';
import { OrnamentMesh, GhostOrnament } from './components/Ornaments';
import { EditableOrnament } from './components/EditableOrnament';
import { TreeTopper } from './components/TreeTopper';
import { DecorationPanel } from './components/DecorationPanel';
import { ControlPanel } from './components/ControlPanel';
import { SceneEnvironment } from './components/SceneEnvironment';
import { ChristmasMusicPanel } from './components/ChristmasMusicPanel';
import { useTreeStore } from './data/treeStore';
import { SCENE_THEMES, SceneTheme, DEFAULT_THEME } from './data/themes';
import { OrnamentType, TopperType, EditorMode, TransformMode, OrnamentData } from './types';
import { Share2, Users } from 'lucide-react';

export default function App() {
  // Tree Store (data layer - ready for Convex)
  const store = useTreeStore();

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<SceneTheme>(DEFAULT_THEME);

  // Local UI State
  const [mode, setMode] = useState<EditorMode>('view');
  const [selectedOrnamentType, setSelectedOrnamentType] = useState<OrnamentType>('sphere');
  const [selectedTopperType, setSelectedTopperType] = useState<TopperType>('star');
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_THEME.ornamentColors[0]);
  const [activePlacement, setActivePlacement] = useState<[number, number, number] | null>(null);

  // Edit mode state
  const [selectedOrnamentId, setSelectedOrnamentId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // Update tree config when theme changes
  const handleThemeChange = useCallback((theme: SceneTheme) => {
    setCurrentTheme(theme);
    store.updateTreeConfig({
      color: theme.treeColor,
      snowAmount: theme.snowAmount,
    });
    setSelectedColor(theme.ornamentColors[0]);
  }, [store]);

  // Calculate tree top position based on config
  const treeTopY = 1.0 + 4 * (store.treeConfig.height * 0.18) + store.treeConfig.height * 0.25 + 0.3;
  const treeTopPosition: [number, number, number] = [0, treeTopY - 1, 0];

  // Handlers
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

    setMode('view');
  }, [mode, selectedTopperType, selectedColor, store]);

  const handleClearAll = useCallback(async () => {
    await store.clearOrnaments();
    await store.setTopper(null);
  }, [store]);

  // Edit mode handlers
  const handleOrnamentSelect = useCallback((id: string) => {
    setSelectedOrnamentId(id);
  }, []);

  const handleOrnamentDeselect = useCallback(() => {
    setSelectedOrnamentId(null);
  }, []);

  const handleOrnamentUpdate = useCallback(
    async (id: string, updates: Partial<OrnamentData>) => {
      await store.updateOrnament(id, updates);
    },
    [store]
  );

  const handleOrnamentDelete = useCallback(
    async (id: string) => {
      await store.removeOrnament(id);
      setSelectedOrnamentId(null);
    },
    [store]
  );

  // Handle mode change - clear selection when leaving edit mode
  const handleModeChange = useCallback((newMode: EditorMode) => {
    if (newMode !== 'edit') {
      setSelectedOrnamentId(null);
    }
    setMode(newMode);
  }, []);

  return (
    <div className="relative w-full h-screen text-white font-sans select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={{ background: currentTheme.skyColor }}
      >
        <PerspectiveCamera makeDefault position={[0, 3, 14]} fov={40} />

        {/* Scene Environment (lights, snow, ground, etc.) */}
        <SceneEnvironment theme={currentTheme} />

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
          {store.ornaments.map((orn) =>
            mode === 'edit' ? (
              <EditableOrnament
                key={orn.id}
                data={orn}
                isSelected={selectedOrnamentId === orn.id}
                editMode={transformMode}
                onSelect={() => handleOrnamentSelect(orn.id)}
                onDeselect={handleOrnamentDeselect}
                onUpdate={(updates) => handleOrnamentUpdate(orn.id, updates)}
                onDelete={() => handleOrnamentDelete(orn.id)}
              />
            ) : (
              <OrnamentMesh
                key={orn.id}
                data={orn}
                onClick={(e) => mode === 'view' && handleRemoveOrnament(orn.id, e)}
              />
            )
          )}

          {/* Ghost Ornament Preview */}
          {mode === 'decorate' && activePlacement && (
            <GhostOrnament
              type={selectedOrnamentType}
              color={selectedColor}
              position={activePlacement}
            />
          )}
        </group>

        <OrbitControls
          makeDefault
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.1}
          enablePan={false}
          minDistance={6}
          maxDistance={25}
          target={[0, 1.5, 0]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col">
        {/* Top Section */}
        <div className="flex justify-between items-start p-4 md:p-6">
          {/* Left Panel - Theme & Tree Controls */}
          <ControlPanel
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            treeConfig={store.treeConfig}
            onTreeConfigChange={store.updateTreeConfig}
            ornamentCount={store.ornaments.length}
            maxOrnaments={store.currentUser?.quota.maxOrnaments ?? 100}
          />

          {/* Right Panel - Session Info & Music */}
          <div className="pointer-events-auto flex flex-col items-end gap-3">
            {/* Share Button (placeholder) */}
            <button
              className="bg-black/60 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-black/70 transition-colors text-sm"
              onClick={() => alert('Share functionality will be available with Convex backend!')}
            >
              <Share2 size={16} />
              Share
            </button>

            {/* Collaborators Placeholder */}
            <div className="bg-black/60 backdrop-blur-xl px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-xs text-gray-400">
              <Users size={14} />
              <span>Solo Mode</span>
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
          onModeChange={handleModeChange}
          selectedOrnamentType={selectedOrnamentType}
          onOrnamentTypeChange={setSelectedOrnamentType}
          selectedTopperType={selectedTopperType}
          onTopperTypeChange={setSelectedTopperType}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onClearAll={handleClearAll}
          ornamentCount={store.ornaments.length}
          maxOrnaments={store.currentUser?.quota.maxOrnaments ?? 100}
          topperSet={!!store.topper}
          transformMode={transformMode}
          onTransformModeChange={setTransformMode}
          selectedOrnamentId={selectedOrnamentId}
          onDeleteSelectedOrnament={() => selectedOrnamentId && handleOrnamentDelete(selectedOrnamentId)}
        />
      </div>

      {/* Welcome Overlay */}
      {!welcomeDismissed && mode === 'view' && store.ornaments.length === 0 && !store.topper && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto bg-black/70 backdrop-blur-xl px-8 py-6 rounded-2xl border border-white/10 text-center max-w-md">
            <h2 className="text-xl font-semibold mb-3">Welcome!</h2>
            <p className="text-sm text-gray-300 mb-4">
              Choose a <span className="text-green-400 font-medium">theme</span> from the left panel,
              then switch to <span className="text-green-400 font-medium">Decorate</span> mode below to add ornaments.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
              <span>🎄 6 Themes</span>
              <span>•</span>
              <span>6 Ornament Types</span>
              <span>•</span>
              <span>4 Tree Toppers</span>
            </div>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
