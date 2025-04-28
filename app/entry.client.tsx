import { useEffect } from 'react';
import { loadDefaultsToDexie } from '~/db/loadDefaults';
import { defaultCustomTrackers } from '~/data/defaultCustomTrackers';

useEffect(() => {
  loadDefaultsToDexie(defaultCustomTrackers);
}, []);
