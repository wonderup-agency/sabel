// Pricing calculator configuration.
// Edit values here when prices, tiers, or component data change.
// No need to touch the calculator logic in index.js.

export const CONFIG = {
  // Hourly rate (USD) used for component pricing — Sabel rate card
  hourlyRate: 235,

  // FX rates (multiplier from USD). Derived from the rate card per-currency
  // hourly rates (USD 235 / AUD 350 / EUR 215 / GBP 175) so converted
  // component prices match the card exactly.
  fx: {
    USD: 1.0,
    AUD: 1.4894,
    EUR: 0.9149,
    GBP: 0.7447,
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
      learnMore: '/services/fin-foundations',
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
  //
  // Canonical Migr8Now model (single source of truth: the migr8now-pricing
  // calculator). Delivered fee = (rate-card base × deltaMultiplier)
  // + managementFeeUSD. The base is piecewise-linear between tier anchors
  // with a floor below the first anchor. Above the last anchor, or from a
  // non-standard source platform, there is NO auto-quote — the calculator
  // shows a bespoke prompt instead of a price.
  migration: {
    learnMore: '/services/migration-accelerator',
    floorUSD: 1000,
    deltaMultiplier: 1.1,
    managementFeeUSD: 1000,

    // Piecewise-linear anchor points. Tier order MUST be ascending by qty.
    tiers: [
      { qty: 50000, totalUSD: 1053 },
      { qty: 100000, totalUSD: 1781 },
      { qty: 500000, totalUSD: 3317 },
      { qty: 750000, totalUSD: 4050 },
      { qty: 1000000, totalUSD: 5254 },
    ],

    // standard:true = on the rate card, auto-quoted. standard:false platforms
    // stay in the dropdown but show a bespoke prompt instead of a price.
    // fallback:true marks the catch-all (hidden from the dropdown, used when
    // a selected platform is not found).
    platforms: {
      Zendesk: { standard: true, fallback: false },
      Freshdesk: { standard: true, fallback: false },
      'Help Scout': { standard: true, fallback: false },
      Intercom: { standard: true, fallback: false },
      Gorgias: { standard: true, fallback: false },
      LiveChat: { standard: false, fallback: false },
      'Zoho Desk': { standard: false, fallback: false },
      'Salesforce Service Cloud': { standard: false, fallback: false },
      Other: { standard: false, fallback: true },
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

  // UI copy — defaults / fallback. These can be overridden at runtime (without a
  // rebuild) by defining window.SABEL_CALCULATOR_COPY in Webflow custom code.
  // See webflow-calculator-copy.js in this folder for the ready-to-paste file.
  copy: {
    step1Title: 'Where are you with Intercom?',
    step1Sub:
      'Tell us your situation so we can tailor the components and defaults below.',
    step2Title: 'Build your engagement',
    step2Sub:
      'All components are optional. Adjust counts and complexity to match your needs.',

    setupQuestion: '1. Your Intercom setup',
    setupNewName: 'New to Intercom',
    setupNewDesc: 'Starting from a clean workspace',
    setupExistingName: 'Already live on Intercom',
    setupExistingDesc: 'Optimising an existing setup',

    migrationCheckName: 'Migration required',
    migrationCheckDesc: 'Migrating from another platform.',
    supportedLabel: 'Supported:',

    teamQuestion: '2. How large is your CX team?',
    teamOption1: '1–5 agents',
    teamOption2: '6–15 agents',
    teamOption3: '16–50 agents',
    teamOption4: '50+ agents',

    sectionMigration: 'MIGRATION',
    sectionOptimisation: 'ONGOING OPTIMISATION',

    migrationCardTitle: 'Migration',
    migrationCardTag: 'VIA MIGR8NOW',
    migrationCardDesc:
      'Tickets, users, articles, tags, and historical data via Migr8Now.',
    migrationCardLearnMore: '/services/migration-accelerator',
    migrationSourceLabel: 'Source:',
    migrationVolumeLabel: 'Volume:',
    migrationTicketsSuffix: 'tickets',

    retainerTitle: 'Ongoing Retainer',
    retainerTag: 'RECOMMENDED AFTER LAUNCH',
    retainerDesc:
      'Continuous Fin tuning, workflow optimisation, and support. Hours pool quarterly.',
    retainerLearnMore: 'mailto:info@sabelcustomersuccess.com',
    retainerHoursSuffix: 'HRS / MO',
    retainerRemove: 'Remove retainer',

    compNotAdded: 'Not added',
    compCalculating: 'Calculating',
    labelBespoke: 'Bespoke quote',
    migrationBespokeNote:
      'This migration needs a custom quote. Book a call and we will price it with you.',
    compAdd: 'Add to your engagement',
    compIncluded: 'Included in your engagement',
    labelFrom: 'From',
    labelLearnMore: 'Learn more ↗',

    panelLabel: 'YOUR ENGAGEMENT',
    pricePendingMeta: 'Click Calculate to reveal pricing',
    priceRevealedMeta: 'project total (indicative)',
    priceFromLabel: 'FROM',
    priceDisclaimer:
      'Prices shown are indicative estimates based on your selections. Final scope confirmed during discovery.',
    priceEmpty: 'No components selected yet',
    priceSubtotal: 'Project subtotal',
    priceFirstQuarter: 'First quarter commitment',
    pricePerMonthSuffix: '/ mo',

    ctaCalculate: 'Calculate my engagement',
    ctaBook: 'Book a discovery call',
    ctaPdf: 'Download estimate (PDF)',

    modalTitle: 'Reveal your estimate',
    modalSub:
      "Tell us who you are and we'll show your indicative engagement pricing right here, plus drop a copy in our inbox so we can follow up if helpful.",
    modalNameLabel: 'Your name',
    modalCompanyLabel: 'Company',
    modalSubmit: 'Reveal my estimate',
    modalErrName: 'Please enter your name.',
    modalErrCompany: 'Please enter your company name.',
    modalPrivacy:
      'We use your details to follow up on your enquiry. No spam, no sharing.',
  },
}
