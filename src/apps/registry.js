import { lazy } from 'react';
import {
  ComputerTerminal01Icon,
  CubeIcon,
  Folder01Icon,
  GithubIcon,
  Linkedin01Icon,
  Mail01Icon,
  SparklesIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { LINKS } from '@/data/content';

// Os apps pesados (three, matter) só carregam quando a janela abre.
export const APPS = {
  about: {
    icon: UserIcon,
    colors: ['#6cc4ff', '#1a73e8'],
    size: { w: 560, h: 620 },
    component: lazy(() => import('./AboutApp')),
  },
  projects: {
    icon: Folder01Icon,
    colors: ['#7cc0ff', '#2b7de9'],
    size: { w: 940, h: 560 },
    component: lazy(() => import('./ProjectsApp')),
  },
  bust: {
    icon: CubeIcon,
    colors: ['#b79cff', '#6d3fd6'],
    size: { w: 520, h: 600 },
    bodyClass: 'window-body-flush',
    component: lazy(() => import('./BustApp')),
  },
  skills: {
    icon: SparklesIcon,
    colors: ['#ffcf5a', '#f7801f'],
    size: { w: 760, h: 500 },
    bodyClass: 'window-body-flush',
    component: lazy(() => import('./SkillsApp')),
  },
  terminal: {
    icon: ComputerTerminal01Icon,
    colors: ['#4a4a52', '#16161a'],
    size: { w: 760, h: 540 },
    bodyClass: 'window-body-terminal',
    component: lazy(() => import('./TerminalApp')),
  },
  contact: {
    icon: Mail01Icon,
    colors: ['#5fe08a', '#18a34a'],
    size: { w: 440, h: 480 },
    component: lazy(() => import('./ContactApp')),
  },
};

export const EXTERNAL = {
  linkedin: { icon: Linkedin01Icon, colors: ['#3a9ae6', '#0a5fb0'], href: LINKS.linkedin },
  github: { icon: GithubIcon, colors: ['#3d3d45', '#111114'], href: LINKS.github },
};

export const DOCK_ORDER = ['about', 'projects', 'bust', 'skills', 'terminal', 'contact'];
export const DESKTOP_ORDER = ['projects', 'bust', 'skills', 'terminal'];
