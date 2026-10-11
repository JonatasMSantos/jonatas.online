import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import CardSwap, { Card } from '@/components/CardSwap';
import { PROJECTS } from '@/data/content';
import { useLang } from '@/lib/i18n';

export default function ProjectsApp() {
  const { t } = useLang();
  const [front, setFront] = useState(0);
  const active = PROJECTS[front];
  const copy = t.projects[active.id];

  return (
    <div className="projects">
      <div className="projects-stack">
        <CardSwap width={440} height={320} theme="light" delay={5000} onChange={setFront}>
          {PROJECTS.map(project => (
            <Card key={project.id}>
              <div className="project-card">
                <div className="project-card-head">
                  <span className="project-card-dot" />
                  <span>{project.name}</span>
                </div>
                <img src={project.image} alt={project.name} draggable={false} />
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>
      <article className="projects-info" key={active.id}>
        <p className="eyebrow">{copy.role}</p>
        <h3>{active.name}</h3>
        <p>{copy.body}</p>
        <a className="pill-link" href={active.url} target="_blank" rel="noreferrer">
          {t.projects.visit}
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} />
        </a>
        <p className="muted small">{t.projects.hint}</p>
      </article>
    </div>
  );
}
