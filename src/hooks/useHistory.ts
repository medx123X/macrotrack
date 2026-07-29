import { useEffect, useState } from 'react';
import type { DailyLog, Food } from '@/types';
import { logRepository, foodRepository } from '@/repositories';
import { daysAgoStr, todayStr } from '@/utils/date';

export function useHistory(profileId: string | undefined, days = 7) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [foodsById, setFoodsById] = useState<Map<string, Food>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      const [range, allFoods] = await Promise.all([
        logRepository.getRange(profileId, daysAgoStr(days - 1), todayStr()),
        foodRepository.getAllFoods(),
      ]);
      if (cancelled) return;
      setLogs(range);
      setFoodsById(new Map(allFoods.map((f) => [f.id, f])));
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [profileId, days]);

  return { logs, foodsById, loaded, hasEnoughData: logs.length >= 3 };
}
