import React, { useState } from 'react';
import { X, Sparkles, Plus, Link2, Box, Layers, HelpCircle } from 'lucide-react';
import { Concept, Relationship, RelationshipType } from '../../types';
import { sfx } from '../../utils/soundEffects';

interface AddConceptIslandModalProps {
  existingConcepts: Concept[];
  onClose: () => void;
  onAddConcept: (concept: Concept, relationship?: Relationship) => void;
}

export const AddConceptIslandModal: React.FC<AddConceptIslandModalProps> = ({
  existingConcepts,
  onClose,
  onAddConcept,
}) => {
  const [title, setTitle] = useState('');
  const [cluster, setCluster] = useState('');
  const [briefExplanation, setBriefExplanation] = useState('');
  const [beginnerExample, setBeginnerExample] = useState('');
  const [targetId, setTargetId] = useState(existingConcepts[0]?.id || '');
  const [relLabel, setRelLabel] = useState<RelationshipType>('extends');
  const [relExplanation, setRelExplanation] = useState('');

  const clusterOptions = Array.from(new Set(existingConcepts.map((c) => c.cluster)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !briefExplanation.trim()) return;

    // Calculate smart 3D spatial position
    let basePos: [number, number, number] = [0, 0, 0];
    const targetConcept = existingConcepts.find((c) => c.id === targetId);

    if (targetConcept) {
      basePos = [...targetConcept.position];
    } else if (existingConcepts.length > 0) {
      basePos = [...existingConcepts[existingConcepts.length - 1].position];
    }

    // Determine random angle with slight spread
    const angle = Math.random() * Math.PI * 2;
    const distance = 4.2 + Math.random() * 1.5;
    const newX = parseFloat((basePos[0] + Math.cos(angle) * distance).toFixed(2));
    const newY = 0; // maintain bedrock plane alignment
    const newZ = parseFloat((basePos[2] + Math.sin(angle) * distance).toFixed(2));

    const conceptId =
      title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24) + '_' + Date.now().toString(36);

    const newConcept: Concept = {
      id: conceptId,
      title: title.trim(),
      briefExplanation: briefExplanation.trim(),
      beginnerExample: beginnerExample.trim(),
      sourceExcerpt: 'Custom added during live interactive exploration.',
      sourceReference: 'Interactive Synthesizer',
      isVerified: true,
      cluster: cluster.trim() || (targetConcept ? targetConcept.cluster : 'Core Concepts'),
      position: [newX, newY, newZ],
      reviewStatus: 'not_started',
    };

    let newRelationship: Relationship | undefined = undefined;
    if (targetConcept) {
      newRelationship = {
        id: `rel_${conceptId}_${targetConcept.id}`,
        sourceId: conceptId,
        targetId: targetConcept.id,
        label: relLabel,
        explanation: relExplanation.trim() || `${title} ${relLabel} ${targetConcept.title}`,
      };
    }

    sfx.playSpawnEffect();
    onAddConcept(newConcept, newRelationship);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-cyan-500/50 rounded-2xl w-full max-w-lg p-5 sm:p-6 text-slate-100 shadow-2xl space-y-4 font-sans animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Synthesize 3D Concept Island
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Materialize a new node into the 3D space in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Concept Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Abstract Classes, Garbage Collection..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Cluster & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cluster / Category
              </label>
              <input
                type="text"
                list="cluster-suggestions"
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                placeholder="e.g. OOP Fundamentals"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <datalist id="cluster-suggestions">
                {clusterOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Connect to Existing Island
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {existingConcepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Relationship Connection */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                Directional Relationship Bridge
              </span>
              <select
                value={relLabel}
                onChange={(e) => setRelLabel(e.target.value as RelationshipType)}
                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]"
              >
                <option value="extends">extends</option>
                <option value="implements">implements</option>
                <option value="contains">contains</option>
                <option value="prerequisite">prerequisite</option>
                <option value="related_to">related to</option>
              </select>
            </div>
            <input
              type="text"
              value={relExplanation}
              onChange={(e) => setRelExplanation(e.target.value)}
              placeholder="e.g. Abstract classes define common template methods inherited by subclasses"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Brief Explanation */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Core Definition / Brief Explanation <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={briefExplanation}
              onChange={(e) => setBriefExplanation(e.target.value)}
              placeholder="Provide a concise 1-2 sentence core definition..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-sans text-xs"
            />
          </div>

          {/* Beginner Code Example (Optional) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Code Snippet / Example <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={beginnerExample}
              onChange={(e) => setBeginnerExample(e.target.value)}
              placeholder="abstract class Vehicle { abstract void drive(); }"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/25 flex items-center gap-1.5 active:scale-95 font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Spawn 3D Island</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
