import { useEffect, useState } from 'react';
import Lanyard from '@/components/Lanyard';
import { buildBadge } from '@/lib/badge';
import { useLang } from '@/lib/i18n';

// No celular (toque como ponteiro principal) o crachá segue a inclinação do aparelho.
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  'DeviceOrientationEvent' in window &&
  (window.matchMedia?.('(pointer: coarse)').matches ?? false);

// Crachá que cai ao abrir a página. As artes são geradas no idioma atual.
export default function Badge() {
  const { t } = useLang();
  const [art, setArt] = useState(null);
  const [tilt] = useState(isTouchDevice);

  useEffect(() => {
    let alive = true;
    buildBadge(t).then(result => alive && setArt(result));
    return () => {
      alive = false;
    };
  }, [t]);

  return (
    <div className="badge-layer">
      {art && (
        <Lanyard
          frontImage={art.front}
          backImage={art.back}
          strapImage={art.strap}
          finish="glossy"
          metal="silver"
          size={0.5}
          strapLength={0.42}
          breeze={0.35}
          tilt={tilt}
        />
      )}
    </div>
  );
}
