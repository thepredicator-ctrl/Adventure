import { useState, useCallback } from 'react';

export function useActiveSection(initial = 0) {
  const [active, setActive] = useState(initial);
  const setIndex = useCallback(index => setActive(index), []);
  return [active, setIndex];
}
