import React, { useState } from 'react';
import { SCENE_THEMES, SceneTheme, ThemeId } from '../data/themes';
import { TreeConfig } from '../types';
import { useAction, api } from '../lib/convex';
import {
  Palette,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Snowflake,
  Sun,
  TreeDeciduous,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ControlPanelProps {
  currentTheme: SceneTheme;
  onThemeChange: (theme: SceneTheme) => void;
  treeConfig: TreeConfig;
  onTreeConfigChange: (updates: Partial<TreeConfig>) => void;
  ornamentCount: number;
  maxOrnaments: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentTheme,
  onThemeChange,
  treeConfig,
  onTreeConfigChange,
  ornamentCount,
  maxOrnaments,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'theme' | 'customize'>('theme');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Use the Convex-style action hook for AI theme generation
  const generateTheme = useAction(api.ai.generateTheme);

  const handleGenerateTheme = async () => {
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const generated = await generateTheme({ prompt: aiPrompt });

      // Convert AI response to SceneTheme format
      const aiTheme: SceneTheme = {
        id: 'ai-generated',
        name: 'AI: ' + aiPrompt.slice(0, 20) + (aiPrompt.length > 20 ? '...' : ''),
        description: generated.description,
        preview: '🤖',
        treeColor: generated.treeColor,
        snowAmount: generated.snowAmount,
        skyColor: generated.backgroundColor,
        groundColor: '#e8f4f8',
        fogColor: generated.backgroundColor,
        fogDensity: 0.02,
        ambientIntensity: 0.4,
        ambientColor: '#ffffff',
        mainLightColor: '#ffffff',
        mainLightIntensity: 1.0,
        accentLightColor: generated.ornamentColors[0] || '#ffffff',
        accentLightIntensity: 0.5,
        snowfall: generated.snowAmount > 0.3,
        snowfallIntensity: generated.snowAmount,
        starsVisible: true,
        ornamentColors: generated.ornamentColors,
      };

      onThemeChange(aiTheme);
      setAiPrompt('');
    } catch (error) {
      console.error('Failed to generate theme:', error);
      setAiError(error instanceof Error ? error.message : 'Failed to generate theme');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pointer-events-auto bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-xs">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-green-500 flex items-center justify-center text-xl">
            🎄
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Tree Decorator</h1>
            <p className="text-[10px] text-gray-400">{ornamentCount} ornaments placed</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'theme'
                  ? 'text-white bg-white/10 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette size={14} className="inline mr-1.5" />
              Themes
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'customize'
                  ? 'text-white bg-white/10 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TreeDeciduous size={14} className="inline mr-1.5" />
              Customize
            </button>
          </div>

          {/* Theme Selection */}
          {activeTab === 'theme' && (
            <div className="p-3 space-y-3">
              {/* AI Theme Generator */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">AI Theme Generator</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateTheme()}
                    placeholder="e.g., cozy cabin, arctic aurora..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleGenerateTheme}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {isGenerating ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                  </button>
                </div>
                {aiError && (
                  <p className="text-xs text-red-400 mt-2">{aiError}</p>
                )}
              </div>

              {/* Preset Themes */}
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Preset Themes</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.values(SCENE_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    currentTheme.id === theme.id
                      ? 'bg-green-600/30 ring-2 ring-green-400'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{theme.preview}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">
                        {theme.name}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {theme.description}
                      </div>
                    </div>
                    {/* Color preview */}
                    <div className="flex gap-0.5">
                      {theme.ornamentColors.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
              </div>
            </div>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && (
            <div className="p-4 space-y-4">
              {/* Tree Color */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <TreeDeciduous size={12} />
                  Tree Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={treeConfig.color}
                    onChange={(e) => onTreeConfigChange({ color: e.target.value })}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {['#0d3d1a', '#1a472a', '#2d5a3d', '#1a3830', '#0a2818'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onTreeConfigChange({ color })}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          treeConfig.color === color ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Snow Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Snowflake size={12} />
                    Snow on Tree
                  </label>
                  <span className="text-xs text-gray-300">{Math.round(treeConfig.snowAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={treeConfig.snowAmount}
                  onChange={(e) => onTreeConfigChange({ snowAmount: parseFloat(e.target.value) })}
                  className="w-full accent-blue-400 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Tree Height */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Sun size={12} />
                    Tree Height
                  </label>
                  <span className="text-xs text-gray-300">{treeConfig.height.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.5"
                  value={treeConfig.height}
                  onChange={(e) => onTreeConfigChange({ height: parseFloat(e.target.value) })}
                  className="w-full accent-green-500 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Randomize Seed */}
              <button
                onClick={() => onTreeConfigChange({ seed: Math.random() * 1000 })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Randomize Tree Shape
              </button>
            </div>
          )}

          {/* Suggested Colors from Theme */}
          <div className="p-3 border-t border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">
              Suggested Ornament Colors
            </div>
            <div className="flex gap-2 justify-center">
              {currentTheme.ornamentColors.map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full ring-2 ring-white/20 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                  onClick={() => {
                    navigator.clipboard.writeText(color);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
