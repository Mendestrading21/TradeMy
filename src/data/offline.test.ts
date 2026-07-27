import { describe, it, expect } from '@jest/globals';
import { offlineCapabilities } from './offline';
import { ALL_MODULE_SKILLS } from './seed';
import { GLOSSARY_TERMS } from './glossary';
import { BADGES } from './badges';
import { V5_CONCEPTS } from './learningContent';
import { WORLDS } from './learningConcept';
import { UNIFIED_GLOSSARY } from './glossaryUnified';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

describe('offlineCapabilities', () => {
  const cap = offlineCapabilities();

  it('reflète le contenu réellement embarqué', () => {
    expect(cap.skills).toBe(ALL_MODULE_SKILLS.length);
    expect(cap.glossaryTerms).toBe(GLOSSARY_TERMS.length);
    expect(cap.badges).toBe(BADGES.length);
  });

  it('garantit que le parcours est disponible hors-ligne', () => {
    expect(cap.lessons).toBeGreaterThan(0);
    expect(cap.exercises).toBeGreaterThan(0);
    expect(cap.contentReady).toBe(true);
    expect(cap.progressLocal).toBe(true);
  });

  it('embarque la couche V5 (concepts, visuels, mondes, glossaire unifié)', () => {
    expect(cap.concepts).toBe(V5_CONCEPTS.length);
    expect(cap.concepts).toBeGreaterThanOrEqual(12);
    expect(cap.visualDatasets).toBe(Object.keys(VISUAL_DATASETS).length);
    expect(cap.visualDatasets).toBeGreaterThan(0);
    expect(cap.worlds).toBe(WORLDS.length);
    expect(cap.worlds).toBe(15);
    expect(cap.unifiedGlossary).toBe(UNIFIED_GLOSSARY.length);
    // contentReady exige désormais aussi les concepts et les visuels.
    expect(cap.contentReady).toBe(true);
  });

  it('est déterministe (aucune I/O, appels stables)', () => {
    expect(offlineCapabilities()).toEqual(cap);
  });
});
