import React, { useEffect, useState } from 'react';
import { Headphones, Music2, Pause, Play, Volume2, X } from 'lucide-react';
import {
  StudySoundscape,
  studySoundscapePlayer,
} from '../../utils/studySoundscape';

const STORAGE_KEY = 'memoryscape_study_sound_settings';

const SOUNDSCAPES: { id: StudySoundscape; name: string; description: string }[] = [
  { id: 'white-noise', name: 'White noise', description: 'Steady, softly filtered noise' },
  { id: 'binaural-40hz', name: '40 Hz binaural beats', description: '200 Hz left · 240 Hz right' },
  { id: 'lofi', name: 'Lo-fi instrumental', description: 'Original, softly generated study loop' },
];

function loadPreferences(): { soundscape: StudySoundscape; volume: number } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { soundscape?: StudySoundscape; volume?: number };
      const soundscape = SOUNDSCAPES.some((option) => option.id === parsed.soundscape)
        ? parsed.soundscape!
        : 'lofi';
      const volume =
        typeof parsed.volume === 'number' && Number.isFinite(parsed.volume)
          ? Math.max(0, Math.min(0.35, parsed.volume))
          : 0.16;
      return { soundscape, volume };
    }
  } catch {
    // Use quiet defaults if browser storage is unavailable or invalid.
  }
  return { soundscape: 'lofi', volume: 0.16 };
}

export const StudySoundsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [isPlaying, setIsPlaying] = useState(studySoundscapePlayer.isPlaying());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Audio preferences remain available for this session.
    }
  }, [preferences]);

  useEffect(() => () => studySoundscapePlayer.stop(), []);

  if (!isOpen) return null;

  const handleTogglePlayback = async () => {
    setError(null);
    if (isPlaying) {
      studySoundscapePlayer.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      await studySoundscapePlayer.start(preferences.soundscape, preferences.volume);
      setIsPlaying(true);
    } catch (playbackError) {
      setError(
        playbackError instanceof Error
          ? playbackError.message
          : 'Could not start study sounds. Check your browser audio settings and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (volume: number) => {
    setPreferences((current) => ({ ...current, volume }));
    studySoundscapePlayer.setVolume(volume);
  };

  const handleSelectSoundscape = async (soundscape: StudySoundscape) => {
    setPreferences((current) => ({ ...current, soundscape }));
    setError(null);
    if (!isPlaying) return;

    setIsLoading(true);
    try {
      await studySoundscapePlayer.start(soundscape, preferences.volume);
    } catch (playbackError) {
      setIsPlaying(false);
      setError(
        playbackError instanceof Error
          ? playbackError.message
          : 'Could not switch study sounds. Check your browser audio settings and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label="Study sounds"
      className="absolute bottom-6 left-20 z-30 w-80 max-w-[calc(100vw-6rem)] bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-left-3"
    >
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-300">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100">Study sounds</h2>
            <p className="text-[10px] text-slate-400">Generated locally · choose your sound</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
          aria-label="Close study sounds"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-3">
        <div className="space-y-1.5" role="group" aria-label="Choose a study sound">
          {SOUNDSCAPES.map((soundscape) => {
            const selected = preferences.soundscape === soundscape.id;
            return (
              <button
                key={soundscape.id}
                type="button"
                aria-pressed={selected}
                onClick={() => void handleSelectSoundscape(soundscape.id)}
                className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                  selected
                    ? 'bg-violet-500/10 border-violet-400/50 text-violet-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <Music2 className="w-3.5 h-3.5 text-violet-300" />
                  {soundscape.name}
                </span>
                <span className="block pl-5 mt-0.5 text-[10px] text-slate-400">
                  {soundscape.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-1">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <label htmlFor="study-sound-volume" className="sr-only">
            Study sound volume
          </label>
          <input
            id="study-sound-volume"
            type="range"
            min="0"
            max="0.35"
            step="0.01"
            value={preferences.volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            className="w-full accent-violet-400"
          />
          <span className="w-8 text-right text-[10px] tabular-nums text-slate-400">
            {Math.round((preferences.volume / 0.35) * 100)}%
          </span>
        </div>

        <button
          type="button"
          onClick={handleTogglePlayback}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-violet-400 hover:bg-violet-300 disabled:opacity-60 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isLoading ? 'Starting…' : isPlaying ? 'Pause sounds' : 'Play study sounds'}
        </button>

        {error && (
          <p role="alert" className="text-[11px] leading-relaxed text-rose-300">
            {error}
          </p>
        )}
        <p className="text-[10px] leading-relaxed text-slate-500">
          Starts only when you press play. Closing this panel keeps audio playing; reopen and press Pause to stop. Binaural beats need stereo headphones and are not a proven focus treatment.
        </p>
      </div>
    </section>
  );
};
