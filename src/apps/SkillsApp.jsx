import FallingText from '@/components/FallingText';
import { SKILLS, SKILLS_HIGHLIGHT } from '@/data/content';
import { useLang } from '@/lib/i18n';

const TEXT = SKILLS.join(' ');

export default function SkillsApp() {
  const { t } = useLang();
  return (
    <div className="skills">
      <FallingText
        text={TEXT}
        highlightWords={SKILLS_HIGHLIGHT}
        split="words"
        trigger="auto"
        theme="light"
        accentColor="#0455BF"
        fontSize="1.35rem"
        gravity={0.9}
        stagger={0.03}
        restoreDelay={5}
      />
      <p className="skills-hint">{t.skills.hint}</p>
    </div>
  );
}
