import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Mush2',
  description: 'Sistema IoT de control ambiental para hongos adaptógenos',
  lang: 'es',

  base: '/mush2/',

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],

  // Ignorar enlaces rotos temporalmente
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Arquitectura', link: '/architecture/architecture' },
      { text: 'Contratos', link: '/contracts/api-contract' },
      { text: 'ADR', link: '/ADR/ADR-001-ESP32' },
      { text: 'EDD', link: '/EDD/EDD-001-sistema-control-ambiental' },
      { text: 'RFC', link: '/RFC/RFC-0001-https-tls-firmware' },
      { text: 'DDD', link: '/DDD/DDD-001-domain-model' },
      { text: 'Gobernanza', link: '/governance/contribution-guide' },
      { text: 'Operaciones', link: '/operations/deployment' }
    ],

    sidebar: {
      '/architecture/': [
        {
          text: 'Arquitectura',
          items: [
            { text: 'Visión General', link: '/architecture/architecture' },
            { text: 'Backend', link: '/architecture/backend' },
            { text: 'Firmware', link: '/architecture/firmware' },
            { text: 'Frontend', link: '/architecture/frontend' },
            { text: 'Base de Datos', link: '/architecture/database' },
            { text: 'Catálogo de Capacidades', link: '/architecture/capability-catalog' },
            { text: 'Modelo de Autorización', link: '/architecture/authorization-model' },
            { text: 'Política QoS', link: '/architecture/qos-policy' }
          ]
        }
      ],
      '/contracts/': [
        {
          text: 'Contratos',
          items: [
            { text: 'API Contract', link: '/contracts/api-contract' },
            { text: 'MQTT Contract', link: '/contracts/mqtt-contract' }
          ]
        }
      ],
      '/protocol/': [
        {
          text: 'Protocolo',
          items: [
            { text: 'Protocol v1', link: '/protocol/protocol-v1' },
            { text: 'Compatibility Matrix', link: '/protocol/compatibility-matrix' }
          ]
        }
      ],
      '/ADR/': [
        {
          text: 'ADRs (Decisiones de Arquitectura)',
          items: [
            { text: 'ADR-001: ESP32', link: '/ADR/ADR-001-ESP32' },
            { text: 'ADR-002: Sensores', link: '/ADR/ADR-002-AHT21-ENS160-sensors' },
            { text: 'ADR-003: SSR', link: '/ADR/ADR-003-SSR-low-level-04ch' },
            { text: 'ADR-004: ThingSpeak', link: '/ADR/ADR-004-ThingSpeak' },
            { text: 'ADR-005: PostgreSQL', link: '/ADR/ADR-005-PostgreSQL-SequelizeORM' },
            { text: 'ADR-006: Logs', link: '/ADR/ADR-006-Logs-Monitoreo-estrategia' },
            { text: 'ADR-007: JWT/RBAC', link: '/ADR/ADR-007-JWT-RBAC' },
            { text: 'ADR-008: HTTP Protocol', link: '/ADR/ADR-008-HTTP-Command-Protocol' },
            { text: 'ADR-009: Control Histéresis', link: '/ADR/ADR-009-Estrategia-Control-Histeresis-Fuzzy' },
            { text: 'ADR-010: Fail-Safe', link: '/ADR/ADR-010-Mecanismo-Fail-Safe-Overheat' },
            { text: 'ADR-011: Recetas', link: '/ADR/ADR-011-Automatizacion-por-Etapas-Recipes' },
            { text: 'ADR-012: FreeRTOS', link: '/ADR/ADR-012-FreeRTOS' },
            { text: 'ADR-013: Seguridad', link: '/ADR/ADR-013-Seguridad-Estrategia' },
            { text: 'ADR-014: OTA v3', link: '/ADR/ADR-014-OTA-v3' },
            { text: 'ADR-015: Docs Restructure', link: '/ADR/ADR-015-docs-restructure' },
            { text: 'ADR-016: Capability Subscription', link: '/ADR/ADR-016-capability-based-subscription' },
            { text: 'ADR-017: Event Bus', link: '/ADR/ADR-017-Event-Bus' }
          ]
        }
      ],
      '/EDD/': [
        {
          text: 'EDDs (Engineering Design Documents)',
          items: [
            { text: 'EDD-001: Sistema Control Ambiental', link: '/EDD/EDD-001-sistema-control-ambiental' },
            { text: 'EDD-002: Motor Reglas Recetas', link: '/EDD/EDD-002-motor-reglas-recetas' },
            { text: 'EDD-003: OTA v3 Canary', link: '/EDD/EDD-003-ota-v3-canary-deployment' },
            { text: 'EDD-004: Multi-tenant', link: '/EDD/EDD-004-estrategia-multitenant' },
            { text: 'EDD-005: BLE Provisioning', link: '/EDD/EDD-005-BLE-provisioning' }
          ]
        }
      ],
      '/RFC/': [
        {
          text: 'RFCs (Request for Comments)',
          items: [
            { text: 'RFC-0001: HTTPS/TLS Firmware', link: '/RFC/RFC-0001-https-tls-firmware' },
            { text: 'RFC-0002: MQTT v2', link: '/RFC/RFC-0002-mqtt-v2-upgrade' },
            { text: 'RFC-0003: Multi-device Dashboard', link: '/RFC/RFC-0003-multi-device-dashboard' },
            { text: 'RFC-0004: Notificaciones Push', link: '/RFC/RFC-0004-notificaciones-push' },
            { text: 'RFC-0005: BLE Provisioning', link: '/RFC/RFC-0005-BLE-Provisioning-&-Device-Bootstrap' },
            { text: 'RFC-0006: Real-time Streaming', link: '/RFC/RFC-0006-realtime-streaming' },
            { text: 'RFC-0007: Device Limits', link: '/RFC/RFC-0007-device-limits' },
            { text: 'RFC-0008: Button Interaction', link: '/RFC/RFC-0008-button-interaction' }
          ]
        }
      ],
      '/DDD/': [
        {
          text: 'DDD (Domain-Driven Design)',
          items: [
            { text: 'DDD-001: Domain Model', link: '/DDD/DDD-001-domain-model' },
            { text: 'DDD-002: Bounded Contexts', link: '/DDD/DDD-002-bounded-contexts' },
            { text: 'DDD-003: Aggregates', link: '/DDD/DDD-003-agregados-raices-de' },
            { text: 'DDD-004: Value Objects', link: '/DDD/DDD-004-value-objets' },
            { text: 'DDD-005: State Machines', link: '/DDD/DDD-005-state-machines' },
            { text: 'DDD-006: Domain Events', link: '/DDD/DDD-006-domain-event' },
            { text: 'DDD-007: Migration Roadmap', link: '/DDD/DDD-007-migration-roadmap' }
          ]
        }
      ],
      '/governance/': [
        {
          text: 'Gobernanza',
          items: [
            { text: 'Contribution Guide', link: '/governance/contribution-guide' },
            { text: 'Coding Standards', link: '/governance/coding-standards' },
            { text: 'Branching Strategy', link: '/governance/branching-strategy' },
            { text: 'Definition of Done', link: '/governance/definition-of-done' },
            { text: 'Tech Debt', link: '/governance/tech-debt' },
            { text: 'Versioning', link: '/governance/versioning' }
          ]
        }
      ],
      '/roadmap/': [
        {
          text: 'Roadmap',
          items: [
            { text: 'Roadmap', link: '/roadmap/roadmap' },
            { text: 'Milestone', link: '/roadmap/milestone' }
          ]
        }
      ],
      '/design/': [
        {
          text: 'Diseño',
          items: [
            { text: 'UI Standards', link: '/design/ui-standards' }
          ]
        }
      ],
      '/operations/': [
        {
          text: 'Operaciones',
          items: [
            { text: 'Deployment', link: '/operations/deployment' }
          ]
        }
      ],
      '/user/': [
        {
          text: 'Usuario',
          items: [
            { text: 'Manual', link: '/user/manual' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/AlejandroMaturana/mush2' }
    ],

    footer: {
      message: 'Sistema IoT de control ambiental para hongos adaptógenos',
      copyright: 'Copyright © 2026 AlejandroMaturana'
    },

    search: {
      provider: 'local'
    }
  }
})
