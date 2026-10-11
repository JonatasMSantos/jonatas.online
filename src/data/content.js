// Todo o copy do site, PT e EN com a mesma forma.
// Regras: sem travessão, sem emoji, tom direto e minimalista.

export const LINKS = {
  email: 'mailto:jts.msantos@gmail.com',
  emailLabel: 'jts.msantos@gmail.com',
  linkedin: 'https://linkedin.com/in/jonatas-m-santos',
  github: 'https://github.com/JonatasMSantos',
  contact: 'https://contato.jonatas.online',
};

export const PROJECTS = [
  { id: 'reporte', name: 'reporte.me', url: 'https://reporte.me', image: '/img/reporte/project-1.webp' },
  { id: 'poker', name: 'Plan · Planning Poker', url: 'https://plan.reporte.me', image: '/img/plan/poker.webp' },
  { id: 'retro', name: 'Plan · Retro & Review', url: 'https://plan.reporte.me', image: '/img/plan/retro.webp' },
  {
    id: 'extensao',
    name: 'Reporte.me Captura',
    url: 'https://chromewebstore.google.com/detail/dnddcaifegobkjbkghoppfbpmeekkibn',
    image: '/img/extensao/captura.webp',
  },
  {
    id: 'pagaoupassa',
    name: 'pagaoupassa.com',
    url: 'https://pagaoupassa.com',
    image: '/img/pagaoupassa/landing-page.webp',
  },
  { id: 'medeligne', name: 'medeligne.com', url: 'https://medeligne.com', image: '/img/medeligne/landing.webp' },
];

// Lista que cai letra por letra na janela de Skills. Os destaques ganham a cor de acento.
export const SKILLS = [
  'Java',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'NestJS',
  'Angular',
  'React',
  'Next.js',
  'React Native',
  'Java EE',
  'JSF',
  'JPA',
  'REST',
  'SQL Server',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Jenkins',
  'CI/CD',
  'Cloudflare',
  'BullMQ',
  'Monorepos',
  'DDD',
  'SOLID',
  'Hexagonal',
  'Microsserviços',
  'Scrum',
  'Agents',
  'Skills',
  'Anthropic',
  'OpenAI',
  'Circuit Breaker',
  'Idempotência',
  'Three.js',
];
export const SKILLS_HIGHLIGHT = [
  'Java',
  'TypeScript',
  'NestJS',
  'Angular',
  'React',
  'Next.js',
  'PostgreSQL',
  'Docker',
  'Agents',
];

export const DICT = {
  pt: {
    meta: {
      title: 'Jônatas Santos · Desenvolvedor Fullstack Sênior',
      desc: 'Java e JavaScript. Doze anos construindo sistemas de ponta a ponta, do banco de dados à interface.',
    },
    name: 'Jônatas Santos',
    role: 'Desenvolvedor Fullstack Sênior',
    location: 'São Paulo, SP',
    apps: {
      about: 'Sobre mim',
      projects: 'Projetos',
      bust: 'Busto 3D',
      skills: 'Skills',
      terminal: 'Terminal',
      contact: 'Contato',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    menu: { language: 'English', close: 'Fechar', minimize: 'Minimizar', zoom: 'Ampliar' },
    badge: { flip: 'clique para virar', since: 'desde 2012' },
    hint: 'Arraste o crachá. Abra os atalhos.',
    about: {
      kicker: 'Desenvolvedor Fullstack Sênior',
      sub: 'Java e JavaScript. Doze anos construindo sistemas de ponta a ponta, do banco de dados à interface.',
      line: 'A tecnologia muda. O ofício permanece.',
      sections: {
        arch: {
          title: 'Arquitetura',
          body: 'DDD, SOLID, arquitetura hexagonal e microsserviços. Dez anos no Grupo Memorial: do ERP construído em Java à migração completa para Angular e NestJS, como responsável técnico do departamento.',
        },
        fullstack: {
          title: 'Fullstack',
          body: 'Doze anos resolvendo o problema inteiro: Java no núcleo, TypeScript na ponta. Node, NestJS, Angular, React e Next.js em produção, hoje em sistemas críticos do setor bancário no Bradesco.',
        },
        ai: {
          title: 'Inteligência Artificial',
          body: 'Harness engineering, agents e skills no fluxo de trabalho diário. Integração com Anthropic e OpenAI, e o entendimento de como um LLM funciona por dentro.',
        },
        infra: {
          title: 'Infra e Resiliência',
          body: 'Docker, CI/CD com Jenkins, filas com BullMQ e Cloudflare. Circuit breaker, retry com backoff e jitter, bulkhead, idempotência e canary: resiliência como disciplina, não como acaso.',
        },
        hobbies: {
          title: 'Fora do teclado',
          body: 'Solda, osciloscópio e microcontroladores na bancada. Violão de cordas de aço e gravação caseira.',
        },
      },
    },
    experience: {
      command: 'cat experiencia.txt',
      jobs: [
        {
          role: 'Bradesco · Analista de Sistemas Sênior',
          date: 'set 2024 até o momento · Osasco, SP (híbrido)',
          body: 'Desenvolvimento em sistemas críticos do setor financeiro, com alto rigor de segurança, disponibilidade e conformidade.',
        },
        {
          role: 'Grupo Memorial · de Programador Júnior a Analista Sênior',
          date: 'mai 2014 a ago 2024 · São Paulo, SP',
          body: 'Dez anos de evolução na mesma empresa, saindo como responsável técnico do departamento. Entrei na equipe que construiu o ERP do zero em Java (JSF, JPA, SQL Server) e depois liderei sua migração para Angular e NestJS em monorepo. Orientação de equipe, arquitetura e DevOps. Integrações com Cielo, Itaú (CNAB), Iugu, Convenia e Active Directory.',
        },
        {
          role: 'Freelancer · Desenvolvedor Java e Web',
          date: '2012 a 2014 · São Paulo',
          body: 'Soluções web para pequenas e médias empresas com Java, AngularJS e Ionic.',
        },
      ],
    },
    projects: {
      visit: 'visitar',
      hint: 'Arraste o cartão da frente ou clique nos de trás.',
      reporte: {
        role: 'SaaS próprio · da concepção ao deploy',
        body: 'Plataforma multi-tenant para PMEs brasileiras: kanban, formulários, finanças, cursos, automações e sites no-code em um único workspace. O sistema que cresce junto com você.',
      },
      poker: {
        role: 'plan.reporte.me · ecossistema Reporte.me',
        body: 'Planning poker em horas para o time estimar junto, em tempo real. Sem cadastro: a sala vive no navegador, com relay em memória via Socket.IO e gravação opcional no Reporte.me por login OAuth.',
      },
      retro: {
        role: 'plan.reporte.me · ecossistema Reporte.me',
        body: 'Retrospectiva em fases (escrever, agrupar, votar, discutir) com cartões ocultos até a revelação, votos por pessoa, timer e modelos de quadro. As ações viram tarefas no Reporte.me ou saem em CSV.',
      },
      extensao: {
        role: 'Extensão do Chrome · ecossistema Reporte.me',
        body: 'Viu um problema em qualquer site? Aponte um elemento ou arraste uma área, tarje dados sensíveis e pronto: vira tarefa no Reporte.me com print e contexto para um agente de IA resolver.',
      },
      pagaoupassa: {
        role: 'Jogo de tabuleiro online',
        body: 'Salas em tempo real, configuração de jogadores e um tabuleiro que vai do 2D ao 3D direto no navegador.',
      },
      medeligne: {
        role: 'Landing page de moda',
        body: 'Direção enxuta e tipografia em primeiro plano para uma marca de moda: rápida, elegante e direta ao ponto.',
      },
    },
    bust: { hint: 'Arraste para girar. Role para aproximar.' },
    skills: { hint: 'Arraste as palavras. Elas voltam sozinhas.' },
    resume: {
      summary:
        'Mais de 12 anos construindo sistemas de ponta a ponta: comecei criando um ERP em Java, liderei sua migração completa para JavaScript e hoje atuo no setor bancário enquanto desenvolvo minha própria plataforma SaaS. Gosto de resolver o problema inteiro, do banco de dados à interface, sempre pensando em escalabilidade, manutenção e impacto real no negócio.',
      competencies: [
        ['JavaScript e TypeScript', 'Node.js, NestJS, Angular, React, Next.js, React Native'],
        ['Java', 'Java EE, JSF (Primefaces), JPA, APIs REST (Jersey)'],
        ['Bancos de dados', 'SQL Server, PostgreSQL, MongoDB, Redis'],
        ['Infra e DevOps', 'Docker, CI/CD (Jenkins), Cloudflare, filas (BullMQ), monorepos'],
        ['Práticas', 'Scrum, DDD, SOLID, arquitetura hexagonal, microsserviços'],
        ['IA', 'Harness engineering, agents, skills, funcionamento de LLMs, integração com Anthropic e OpenAI'],
        [
          'Resiliência',
          'Circuit breaker, retry com backoff e jitter, bulkhead, timeout e fallback, rate limiting, idempotência, canary e blue-green',
        ],
      ],
      strengths: [
        'Visão estratégica para alinhar tecnologia aos objetivos de negócio',
        'Resolução de problemas complexos e decisões técnicas sólidas',
        'Orientação e apoio ao time',
        'Metodologias ágeis aplicadas de verdade',
        'Atitude proativa e foco em soluções eficientes',
      ],
      ownProject:
        'Reporte.me: plataforma SaaS multi-tenant para PMEs brasileiras, com kanban, formulários, LMS e gestão de projetos. Concepção, arquitetura e desenvolvimento completos com Next.js, NestJS, PostgreSQL, MongoDB, Redis e Cloudflare.',
      education: 'Análise e Desenvolvimento de Sistemas · Universidade Cruzeiro do Sul',
      languages: 'Português nativo · Inglês avançado',
      interests: 'Violão, gravação de música, eletrônica e IoT',
    },
    terminal: {
      welcome: 'Bem-vindo ao terminal do Jônatas. Digite help e aperte Enter.',
      notFound: 'comando não encontrado: {cmd}. Digite help para ver a lista.',
      help: 'Comandos disponíveis:',
      tip: 'Dica: Tab completa, setas recuperam o histórico.',
      opening: 'abrindo {app}...',
      openUsage: 'uso: abrir <projetos | busto | skills | sobre | contato>',
      lang: 'idioma alterado para português.',
      sudo: 'Boa tentativa. Este incidente será reportado (no reporte.me).',
      headings: {
        summary: 'Resumo',
        competencies: 'Competências',
        strengths: 'Principais skills',
        experience: 'Experiência',
        ownProject: 'Projeto próprio',
        education: 'Formação',
        languages: 'Idiomas',
        interests: 'Interesses',
        projects: 'Projetos',
        contact: 'Contato',
      },
      commands: {
        help: 'lista os comandos',
        sobre: 'quem sou eu',
        experiencia: 'trajetória profissional',
        projetos: 'projetos com links',
        skills: 'competências técnicas',
        curriculo: 'currículo completo',
        formacao: 'formação e idiomas',
        contato: 'onde me encontrar',
        abrir: 'abre uma janela (ex.: abrir busto)',
        ls: 'lista os arquivos',
        lang: 'troca o idioma (pt | en)',
        clear: 'limpa a tela',
      },
    },
    contact: {
      title: 'Vamos conversar',
      sub: 'Próximo projeto, uma vaga ou só um oi.',
      email: 'E-mail',
      extra: 'Currículo e formulário',
    },
  },

  en: {
    meta: {
      title: 'Jônatas Santos · Senior Fullstack Developer',
      desc: 'Java and JavaScript. Twelve years building systems end to end, from database to interface.',
    },
    name: 'Jônatas Santos',
    role: 'Senior Fullstack Developer',
    location: 'São Paulo, Brazil',
    apps: {
      about: 'About me',
      projects: 'Projects',
      bust: '3D Bust',
      skills: 'Skills',
      terminal: 'Terminal',
      contact: 'Contact',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    menu: { language: 'Português', close: 'Close', minimize: 'Minimize', zoom: 'Zoom' },
    badge: { flip: 'click to flip', since: 'since 2012' },
    hint: 'Drag the badge. Open the shortcuts.',
    about: {
      kicker: 'Senior Fullstack Developer',
      sub: 'Java and JavaScript. Twelve years building systems end to end, from database to interface.',
      line: 'Technology changes. Craft remains.',
      sections: {
        arch: {
          title: 'Architecture',
          body: 'DDD, SOLID, hexagonal architecture and microservices. Ten years at Grupo Memorial: from an ERP built in Java to its full migration to Angular and NestJS, as technical lead.',
        },
        fullstack: {
          title: 'Fullstack',
          body: 'Twelve years solving the whole problem: Java at the core, TypeScript at the edge. Node, NestJS, Angular, React and Next.js in production, now on critical banking systems at Bradesco.',
        },
        ai: {
          title: 'Artificial Intelligence',
          body: 'Harness engineering, agents and skills in the daily workflow. Anthropic and OpenAI integrations, plus a working grasp of how an LLM behaves inside.',
        },
        infra: {
          title: 'Infra and Resilience',
          body: 'Docker, CI/CD with Jenkins, queues with BullMQ and Cloudflare. Circuit breaker, retry with backoff and jitter, bulkhead, idempotency and canary: resilience as a discipline, not luck.',
        },
        hobbies: {
          title: 'Away from the keyboard',
          body: 'Soldering, an oscilloscope and microcontrollers on the bench. Steel string guitar and home recording.',
        },
      },
    },
    experience: {
      command: 'cat experience.txt',
      jobs: [
        {
          role: 'Bradesco · Senior Systems Analyst',
          date: 'Sep 2024 to present · Osasco, SP (hybrid)',
          body: 'Development of critical systems in the financial sector, with high rigor in security, availability and compliance.',
        },
        {
          role: 'Grupo Memorial · From Junior Programmer to Senior Analyst',
          date: 'May 2014 to Aug 2024 · São Paulo, SP',
          body: 'Ten years of growth in the same company, leaving as technical lead of the department. Joined the team that built the ERP from scratch in Java (JSF, JPA, SQL Server) and later led its migration to Angular and NestJS in a monorepo. Team mentoring, architecture and DevOps. Integrations with Cielo, Itaú (CNAB), Iugu, Convenia and Active Directory.',
        },
        {
          role: 'Freelancer · Java and Web Developer',
          date: '2012 to 2014 · São Paulo',
          body: 'Web solutions for small and medium businesses using Java, AngularJS and Ionic.',
        },
      ],
    },
    projects: {
      visit: 'visit',
      hint: 'Drag the front card or click the ones behind.',
      reporte: {
        role: 'Own SaaS · from concept to deploy',
        body: 'Multi-tenant platform for Brazilian small businesses: kanban, forms, finance, courses, automations and no-code sites in a single workspace. The system that grows with you.',
      },
      poker: {
        role: 'plan.reporte.me · Reporte.me ecosystem',
        body: 'Planning poker in hours so the team estimates together, in real time. No sign up: the room lives in the browser, with an in-memory Socket.IO relay and optional saving to Reporte.me through OAuth login.',
      },
      retro: {
        role: 'plan.reporte.me · Reporte.me ecosystem',
        body: 'Retrospective in phases (write, group, vote, discuss) with cards hidden until reveal, votes per person, timer and board templates. Actions become Reporte.me tasks or export to CSV.',
      },
      extensao: {
        role: 'Chrome extension · Reporte.me ecosystem',
        body: 'Spotted a problem on any site? Point at an element or drag an area, redact sensitive data and done: it becomes a Reporte.me task with a screenshot and context for an AI agent to fix.',
      },
      pagaoupassa: {
        role: 'Online board game',
        body: 'Real-time rooms, player setup and a board that goes from 2D to 3D right in the browser.',
      },
      medeligne: {
        role: 'Fashion landing page',
        body: 'Lean direction and typography first for a fashion brand: fast, elegant, straight to the point.',
      },
    },
    bust: { hint: 'Drag to rotate. Scroll to zoom.' },
    skills: { hint: 'Drag the words. They come back on their own.' },
    resume: {
      summary:
        'Over 12 years building systems end to end: I started by creating an ERP in Java, led its full migration to JavaScript and now work in the banking sector while building my own SaaS platform. I like solving the whole problem, from database to interface, always thinking about scalability, maintainability and real business impact.',
      competencies: [
        ['JavaScript and TypeScript', 'Node.js, NestJS, Angular, React, Next.js, React Native'],
        ['Java', 'Java EE, JSF (Primefaces), JPA, REST APIs (Jersey)'],
        ['Databases', 'SQL Server, PostgreSQL, MongoDB, Redis'],
        ['Infra and DevOps', 'Docker, CI/CD (Jenkins), Cloudflare, queues (BullMQ), monorepos'],
        ['Practices', 'Scrum, DDD, SOLID, hexagonal architecture, microservices'],
        ['AI', 'Harness engineering, agents, skills, how LLMs work, Anthropic and OpenAI integrations'],
        [
          'Resilience',
          'Circuit breaker, retry with backoff and jitter, bulkhead, timeout and fallback, rate limiting, idempotency, canary and blue-green',
        ],
      ],
      strengths: [
        'Strategic vision to align technology with business goals',
        'Solving complex problems and making sound technical decisions',
        'Mentoring and supporting the team',
        'Agile methodologies applied for real',
        'Proactive attitude focused on efficient solutions',
      ],
      ownProject:
        'Reporte.me: multi-tenant SaaS platform for Brazilian small businesses, with kanban, forms, LMS and project management. Full concept, architecture and development with Next.js, NestJS, PostgreSQL, MongoDB, Redis and Cloudflare.',
      education: 'Systems Analysis and Development · Universidade Cruzeiro do Sul',
      languages: 'Portuguese (native) · English (advanced)',
      interests: 'Guitar, music recording, electronics and IoT',
    },
    terminal: {
      welcome: 'Welcome to Jônatas’s terminal. Type help and press Enter.',
      notFound: 'command not found: {cmd}. Type help to see the list.',
      help: 'Available commands:',
      tip: 'Tip: Tab completes, arrow keys bring back history.',
      opening: 'opening {app}...',
      openUsage: 'usage: open <projects | bust | skills | about | contact>',
      lang: 'language switched to English.',
      sudo: 'Nice try. This incident will be reported (on reporte.me).',
      headings: {
        summary: 'Summary',
        competencies: 'Competencies',
        strengths: 'Key skills',
        experience: 'Experience',
        ownProject: 'Own project',
        education: 'Education',
        languages: 'Languages',
        interests: 'Interests',
        projects: 'Projects',
        contact: 'Contact',
      },
      commands: {
        help: 'list the commands',
        about: 'who I am',
        experience: 'career path',
        projects: 'projects with links',
        skills: 'technical competencies',
        resume: 'full résumé',
        education: 'education and languages',
        contact: 'where to find me',
        open: 'open a window (e.g. open bust)',
        ls: 'list the files',
        lang: 'switch language (pt | en)',
        clear: 'clear the screen',
      },
    },
    contact: {
      title: 'Let’s talk',
      sub: 'Next project, a role or just a hello.',
      email: 'Email',
      extra: 'Résumé and contact form',
    },
  },
};
