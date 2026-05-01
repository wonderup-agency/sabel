// Pricing calculator configuration.
// Edit values here when prices, tiers, or component data change.
// No need to touch the calculator logic in index.js.

export const CONFIG = {
  // Hourly rate (USD) used for component pricing
  hourlyRate: 200,

  // FX rates (multiplier from USD)
  fx: {
    USD: 1.0,
    AUD: 1.3944,
    EUR: 0.85,
    GBP: 0.7,
  },
  currencySymbol: { USD: '$', AUD: '$', EUR: '€', GBP: '£' },

  // Complexity multipliers (applied to component hours)
  complexity: {
    Simple: 0.75,
    Moderate: 1.0,
    Complex: 1.5,
  },

  // Components — grouped on render by `pillar` in array order
  components: [
    {
      id: 'transformation-blueprint',
      pillar: 'TRANSFORMATION',
      name: 'Transformation Blueprint',
      desc: 'Strategy, journey mapping, operating model, KPI plan, and roadmap.',
      learnMore: '/services/transformation-blueprint',
      unitLabel: 'engagement',
      baseHours: 10,
      defaultCount: 1,
      maxCount: 1,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
    {
      id: 'foundation-setup',
      pillar: 'FOUNDATIONS',
      name: 'Foundation Setup',
      desc: 'Workspace, brands, channels, teams, inboxes, routing, and core configuration.',
      learnMore: '/services/intercom-foundations',
      unitLabel: 'workspace',
      baseHours: 28,
      defaultCount: 1,
      maxCount: 5,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
    {
      id: 'workflows',
      pillar: 'AUTOMATION ENGINE',
      name: 'Workflows',
      desc: 'Routing, tagging, assignment, and channel-specific logic.',
      learnMore: '/services/automation-engine#workflows',
      unitLabel: 'workflow',
      baseHours: 3,
      defaultCount: 1,
      maxCount: 50,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
    {
      id: 'fin-procedures',
      pillar: 'AUTOMATION ENGINE',
      name: 'Fin Procedures',
      desc: 'Structured, reusable reasoning steps for Fin. Components + procedures.',
      learnMore: '/services/automation-engine#fin-procedures',
      unitLabel: 'procedure',
      baseHours: 10,
      defaultCount: 1,
      maxCount: 30,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
    {
      id: 'integrations',
      pillar: 'AUTOMATION ENGINE',
      name: 'Integrations',
      desc: 'CRM, billing, product data. Salesforce, HubSpot, Stripe, Shopify, custom API.',
      learnMore: '/services/automation-engine#integrations',
      unitLabel: 'integration',
      baseHours: 20,
      defaultCount: 1,
      maxCount: 20,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
    {
      id: 'help-centre',
      pillar: 'FIN ENABLEMENT',
      name: 'Help Centre Content',
      desc: 'Fin-optimised articles written and structured for maximum resolution.',
      learnMore: '/services/fin-enablement#help-centre',
      unitLabel: 'article',
      baseHours: 0.01,
      defaultCount: 50,
      maxCount: 1000,
      defaultComplexity: 'Moderate',
      addable: true,
      defaultEnabled: false,
    },
  ],

  // Migration (only renders when user ticks "Migration required")
  migration: {
    learnMore: '/services/migration-accelerator',
    minPriceUSD: 500,

    // Cumulative tier model. Tier order MUST be ascending by qty.
    tiers: [
      { qty: 50000, totalUSD: 1053, perTicket: 0.0210609 },
      { qty: 100000, totalUSD: 1781, perTicket: 0.0178146 },
      { qty: 500000, totalUSD: 3317, perTicket: 0.006633 },
      { qty: 750000, totalUSD: 4050, perTicket: 0.0053998 },
      { qty: 1000000, totalUSD: 5254, perTicket: 0.0052542 },
    ],

    // Per-platform surcharge multipliers (multiply against base unit below)
    surchargeBaseUSD: 1500,
    platforms: {
      Zendesk: { multiplier: 0.0, fallback: false },
      Freshdesk: { multiplier: 0.0, fallback: false },
      'Help Scout': { multiplier: 0.0, fallback: false },
      Intercom: { multiplier: 0.0, fallback: false },
      LiveChat: { multiplier: 1.5, fallback: false },
      'Zoho Desk': { multiplier: 1.5, fallback: false },
      'Salesforce Service Cloud': { multiplier: 2.0, fallback: false },
      Other: { multiplier: 1.5, fallback: true },
    },
  },

  // Retainer tiers (rendered as the bottom card; only one selectable)
  retainerTiers: [
    {
      id: 'starter',
      name: 'Starter',
      hoursPerMonth: 5,
      pricing: { USD: 1000, AUD: 1500, EUR: 800, GBP: 660 },
      inclusions: [
        'Monthly Fin snapshot',
        'Minor content tweaks',
        '2-day response',
        'Quarterly health note',
      ],
    },
    {
      id: 'essentials',
      name: 'Essentials',
      hoursPerMonth: 10,
      pricing: { USD: 1900, AUD: 2850, EUR: 1520, GBP: 1254 },
      inclusions: [
        'Everything in Starter',
        'Monthly review call',
        'Workflow & Action work',
        '1-day response',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      hoursPerMonth: 15,
      pricing: { USD: 2700, AUD: 4050, EUR: 2160, GBP: 1782 },
      inclusions: [
        'Everything in Essentials',
        'Monthly strategy call',
        'Integrations & Actions',
        'Priority response',
      ],
    },
    {
      id: 'engine',
      name: 'Engine',
      hoursPerMonth: 30,
      pricing: { USD: 5100, AUD: 7650, EUR: 4080, GBP: 3366 },
      inclusions: [
        'Everything in Growth',
        'Dedicated L3 hours',
        'Monthly deep-dive',
        '4-hour SLA',
      ],
    },
    {
      id: 'partner',
      name: 'Partner',
      hoursPerMonth: 60,
      pricing: { USD: 9600, AUD: 14400, EUR: 7680, GBP: 6336 },
      inclusions: [
        'Everything in Engine',
        'Embedded delivery team',
        'Executive QBR',
        '2-hour SLA',
      ],
    },
  ],

  // External URLs
  bookingUrl: 'https://book.sabelcustomersuccess.com/bookmeeting',
  submissionEndpoint: 'https://sabel-webhook.vercel.app/api/calculator-submit',

  // jsPDF lazy-loaded for the "Download estimate (PDF)" button
  jspdfCdnUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
}
