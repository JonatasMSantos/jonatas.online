// Todo o copy do site, PT e EN com a mesma forma.
// Regras: sem travessão, sem emoji, tom direto e minimalista.

export const DICT = {
  pt: {
    meta: {
      title: 'Jônatas Santos · Desenvolvedor Fullstack Sênior',
      desc: 'Java e JavaScript. Doze anos construindo sistemas de ponta a ponta, do banco de dados à interface.',
    },
    nav: { inicio: 'Início', sala: 'Sala', projetos: 'Projetos', contato: 'Contato' },
    hero: {
      kicker: 'Desenvolvedor Fullstack Sênior',
      sub: 'Java e JavaScript. Doze anos construindo sistemas de ponta a ponta, do banco de dados à interface.',
      hint: 'role',
    },
    dive: { line: 'A tecnologia muda. O ofício permanece.' },
    room: {
      fullstack: {
        kicker: '02 · Fullstack',
        title: 'Do banco de dados à interface',
        body: 'Doze anos resolvendo o problema inteiro: Java no núcleo, TypeScript na ponta. Node, NestJS, Angular, React e Next.js em produção, hoje em sistemas críticos do setor bancário no Bradesco.',
        tags: ['Java', 'TypeScript', 'NestJS', 'Angular', 'Next.js'],
      },
      ai: {
        kicker: '03 · Inteligência Artificial',
        title: 'Agentes que trabalham junto',
        body: 'Harness engineering, agents e skills no fluxo de trabalho diário. Integração com Anthropic e OpenAI, e o entendimento de como um LLM funciona por dentro.',
        tags: ['Agents', 'Skills', 'Anthropic', 'OpenAI'],
      },
      infra: {
        kicker: '04 · Infra e Resiliência',
        title: 'Sistemas que não caem',
        body: 'Docker, CI/CD com Jenkins, filas com BullMQ e Cloudflare. Circuit breaker, retry com backoff e jitter, bulkhead, idempotência, canary e chaos engineering: resiliência como disciplina, não como acaso.',
        tags: ['Docker', 'CI/CD', 'BullMQ', 'Cloudflare', 'OpenTelemetry'],
      },
      arch: {
        kicker: '01 · Arquitetura',
        title: 'Decisões que envelhecem bem',
        body: 'DDD, SOLID, arquitetura hexagonal e microsserviços. Dez anos no Grupo Memorial: do ERP construído em Java à migração completa para Angular e NestJS, como responsável técnico do departamento.',
        tags: ['DDD', 'SOLID', 'Hexagonal', 'Microsserviços'],
      },
      iot: {
        kicker: '05 · Eletrônica e IoT',
        title: 'Hardware nas horas vagas',
        body: 'Solda, osciloscópio e microcontroladores na bancada. O hobby que mantém afiado o raciocínio de sistemas, do firmware ao protocolo.',
        tags: ['IoT', 'Eletrônica', 'Firmware'],
      },
      music: {
        kicker: '06 · Música',
        title: 'Violão e gravação',
        body: 'Cordas de aço, timbres e gravação caseira. O contraponto criativo que ensina escuta, ritmo e paciência.',
        tags: ['Violão', 'Gravação', 'Home studio'],
      },
    },
    projects: {
      eyebrow: 'Trabalho selecionado',
      heading: 'Projetos',
      visit: 'visitar',
      reporte: {
        role: 'SaaS próprio · da concepção ao deploy',
        body: 'Plataforma multi-tenant para PMEs brasileiras: kanban, formulários, finanças, cursos, automações e sites no-code em um único workspace. O sistema que cresce junto com você.',
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
    contact: {
      eyebrow: 'Próximo projeto',
      title: 'Vamos conversar',
    },
    footer: { line: '© 2026 Jônatas Santos. Feito à mão com Three.js.' },
  },

  en: {
    meta: {
      title: 'Jônatas Santos · Senior Fullstack Developer',
      desc: 'Java and JavaScript. Twelve years building systems end to end, from database to interface.',
    },
    nav: { inicio: 'Home', sala: 'Room', projetos: 'Projects', contato: 'Contact' },
    hero: {
      kicker: 'Senior Fullstack Developer',
      sub: 'Java and JavaScript. Twelve years building systems end to end, from database to interface.',
      hint: 'scroll',
    },
    dive: { line: 'Technology changes. Craft remains.' },
    room: {
      fullstack: {
        kicker: '02 · Fullstack',
        title: 'From database to interface',
        body: 'Twelve years solving the whole problem: Java at the core, TypeScript at the edge. Node, NestJS, Angular, React and Next.js in production, now on critical banking systems at Bradesco.',
        tags: ['Java', 'TypeScript', 'NestJS', 'Angular', 'Next.js'],
      },
      ai: {
        kicker: '03 · Artificial Intelligence',
        title: 'Agents that work alongside',
        body: 'Harness engineering, agents and skills in the daily workflow. Anthropic and OpenAI integrations, plus a working grasp of how an LLM behaves inside.',
        tags: ['Agents', 'Skills', 'Anthropic', 'OpenAI'],
      },
      infra: {
        kicker: '04 · Infra and Resilience',
        title: 'Systems that stay up',
        body: 'Docker, CI/CD with Jenkins, queues with BullMQ and Cloudflare. Circuit breaker, retry with backoff and jitter, bulkhead, idempotency, canary and chaos engineering: resilience as a discipline, not luck.',
        tags: ['Docker', 'CI/CD', 'BullMQ', 'Cloudflare', 'OpenTelemetry'],
      },
      arch: {
        kicker: '01 · Architecture',
        title: 'Decisions that age well',
        body: 'DDD, SOLID, hexagonal architecture and microservices. Ten years at Grupo Memorial: from an ERP built in Java to its full migration to Angular and NestJS, as technical lead.',
        tags: ['DDD', 'SOLID', 'Hexagonal', 'Microservices'],
      },
      iot: {
        kicker: '05 · Electronics and IoT',
        title: 'Hardware after hours',
        body: 'Soldering, an oscilloscope and microcontrollers on the bench. The hobby that keeps systems thinking sharp, from firmware to protocol.',
        tags: ['IoT', 'Electronics', 'Firmware'],
      },
      music: {
        kicker: '06 · Music',
        title: 'Guitar and recording',
        body: 'Steel strings, tone and home recording. The creative counterpoint that teaches listening, rhythm and patience.',
        tags: ['Guitar', 'Recording', 'Home studio'],
      },
    },
    projects: {
      eyebrow: 'Selected work',
      heading: 'Projects',
      visit: 'visit',
      reporte: {
        role: 'Own SaaS · from concept to deploy',
        body: 'Multi-tenant platform for Brazilian small businesses: kanban, forms, finance, courses, automations and no-code sites in a single workspace. The system that grows with you.',
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
    contact: {
      eyebrow: 'Next project',
      title: 'Let’s talk',
    },
    footer: { line: '© 2026 Jônatas Santos. Handmade with Three.js.' },
  },
};
