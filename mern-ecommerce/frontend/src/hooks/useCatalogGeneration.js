import { useSyncExternalStore } from 'react';
import { subscribeCatalog, catalogGeneration } from '../services/publicCatalog';
export default function useCatalogGeneration() {
  return useSyncExternalStore(subscribeCatalog, catalogGeneration, catalogGeneration);
}
