import ModelViewer from '@/components/ModelViewer';
import { useLang } from '@/lib/i18n';

export default function BustApp() {
  const { t } = useLang();
  return (
    <div className="bust">
      <ModelViewer
        url="/models/jonatas.min.glb"
        width="100%"
        height="100%"
        environment="studio"
        startAngle={-20}
        fit={0.85}
      />
      <p className="bust-hint">{t.bust.hint}</p>
    </div>
  );
}
