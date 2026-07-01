// Pricing Calculator UI copy — lives in Webflow custom code, not the bundle.
// Paste inside <script>…</script> before </head>, above the calculator script.
// Edit only the text between quotes; missing keys fall back to config.js defaults.

window.SABEL_CALCULATOR_COPY = {
  // Step headers
  step1Title: 'Where are you with Intercom?',
  step1Sub:
    'Tell us your situation so we can tailor the components and defaults below.',
  step2Title: 'Build your engagement',
  step2Sub:
    'All components are optional. Adjust counts and complexity to match your needs.',

  // Step 1 · Intercom setup
  setupQuestion: '1. Your Intercom setup',
  setupNewName: 'New to Intercom',
  setupNewDesc: 'Starting from a clean workspace',
  setupExistingName: 'Already live on Intercom',
  setupExistingDesc: 'Optimising an existing setup',

  // Migration (qualifier checkbox)
  migrationCheckName: 'Migration required',
  migrationCheckDesc: 'Migrating from another platform.',
  supportedLabel: 'Supported:',

  // Step 1 · Team size
  teamQuestion: '2. How large is your CX team?',
  teamOption1: '1–5 agents',
  teamOption2: '6–15 agents',
  teamOption3: '16–50 agents',
  teamOption4: '50+ agents',

  // Builder section labels
  sectionMigration: 'MIGRATION',
  sectionOptimisation: 'ONGOING OPTIMISATION',

  // Migration card
  migrationCardTitle: 'Migration',
  migrationCardTag: 'VIA MIGR8NOW',
  migrationCardDesc:
    'Tickets, users, articles, tags, and historical data via Migr8Now.',
  migrationCardLearnMore: '/services/migration-accelerator',
  migrationSourceLabel: 'Source:',
  migrationVolumeLabel: 'Volume:',
  migrationTicketsSuffix: 'tickets',

  // Retainer card
  retainerTitle: 'Ongoing Retainer',
  retainerTag: 'RECOMMENDED AFTER LAUNCH',
  retainerDesc:
    'Continuous Fin tuning, workflow optimisation, and support. Hours pool quarterly.',
  retainerLearnMore: 'mailto:info@sabelcustomersuccess.com',
  retainerHoursSuffix: 'HRS / MO',
  retainerRemove: 'Remove retainer',

  // Component card states and labels
  compNotAdded: 'Not added',
  compCalculating: 'Calculating',
  compAdd: 'Add to your engagement',
  compIncluded: 'Included in your engagement',
  labelFrom: 'From',
  labelLearnMore: 'Learn more ↗',

  // Price panel
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

  // Buttons (CTAs)
  ctaCalculate: 'Calculate my engagement',
  ctaBook: 'Book a discovery call',
  ctaPdf: 'Download estimate (PDF)',

  // Capture modal
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
}
