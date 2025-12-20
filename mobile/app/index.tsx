/**
 * RARE 4N - Index Route
 * الصفحة الأولى - إعادة التوجيه إلى البوت
 */

import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // إعادة التوجيه مباشرة إلى صفحة البوت
    router.replace('/boot');
  }, []);

  return null;
}


