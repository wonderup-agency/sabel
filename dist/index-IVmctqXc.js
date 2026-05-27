import { getLenis } from './global-BJE8xaNW.js';

// Pricing calculator configuration.
// Edit values here when prices, tiers, or component data change.
// No need to touch the calculator logic in index.js.

const CONFIG = {
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
};

/*
Component: pricing-calculator
Webflow attribute: data-component="pricing-calculator"

Drop a single empty container with this attribute on the pricing page.
The component builds the entire qualifier zone, builder zone, sticky price
panel, and reveal-gate modal inside it (modal is appended to body).
*/


const STORAGE_KEY_CURRENCY = 'sabelCurrency';

function index (elements) {
  elements.forEach((root) => {
    initCalculator(root);
  });
}

function readStoredCurrency() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_CURRENCY);
    if (v && CONFIG.fx[v] !== undefined) return v
  } catch {
    // localStorage unavailable (private mode, restricted iframe)
  }
  return 'AUD'
}

function initCalculator(root) {
  // ----- State -----
  const state = {
    setup: 'new',
    migrationEnabled: false,
    teamSize: '6-15',
    currency: readStoredCurrency(),
    components: {},
    migration: {
      sourcePlatform: 'Zendesk',
      ticketVolume: 150000,
    },
    retainerSelected: null,
    priceRevealed: false,
    contact: { name: '', company: '' },
    pdfLoading: false,
  };

  // Initialise component state from defaults
  CONFIG.components.forEach((c) => {
    state.components[c.id] = {
      enabled: c.defaultEnabled,
      count: c.defaultCount,
      complexity: c.defaultComplexity,
    };
  });

  // ----- Pricing math -----
  const calcComponentHours = (c) => {
    const s = state.components[c.id];
    if (!s.enabled || s.count === 0) return 0
    const mult = CONFIG.complexity[s.complexity];
    return c.baseHours * s.count * mult
  };
  const calcComponentUSD = (c) => calcComponentHours(c) * CONFIG.hourlyRate;

  const calcMigrationUSD = () => {
    if (!state.migrationEnabled) return 0
    const qty = state.migration.ticketVolume;
    const tiers = CONFIG.migration.tiers;
    let subtotal;

    if (qty <= 0) {
      subtotal = 0;
    } else if (qty < tiers[0].qty) {
      subtotal = qty * tiers[0].perTicket;
    } else {
      let i = 0;
      for (let k = 0; k < tiers.length; k++) {
        if (tiers[k].qty <= qty) i = k;
      }
      const base = tiers[i].totalUSD;
      const surplus = qty - tiers[i].qty;
      const nextRate =
        i + 1 < tiers.length ? tiers[i + 1].perTicket : tiers[i].perTicket;
      subtotal = base + surplus * nextRate;
    }

    const platDef =
      CONFIG.migration.platforms[state.migration.sourcePlatform] ||
      CONFIG.migration.platforms['Other'];
    const surcharge = CONFIG.migration.surchargeBaseUSD * platDef.multiplier;
    let total = subtotal + surcharge;

    if (qty > 0 && total < CONFIG.migration.minPriceUSD) {
      total = CONFIG.migration.minPriceUSD;
    }
    return total
  };

  const getRetainerUSD = () => {
    if (!state.retainerSelected) return 0
    const tier = CONFIG.retainerTiers.find(
      (t) => t.id === state.retainerSelected
    );
    return tier ? tier.pricing.USD : 0
  };

  const calcProjectSubtotalUSD = () => {
    let total = CONFIG.components.reduce(
      (sum, c) => sum + calcComponentUSD(c),
      0
    );
    total += calcMigrationUSD();
    return total
  };

  // ----- Formatting -----
  const fmtCurrency = (amountUSD, currency) => {
    const cur = state.currency;
    const fxd = amountUSD * CONFIG.fx[cur];
    const sym = CONFIG.currencySymbol[cur];
    return sym + Math.round(fxd).toLocaleString('en-US')
  };
  const fmtNumber = (n) => Number(n).toLocaleString('en-US');
  const escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (m) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[m]
    );

  // ----- Build the static shell once -----
  root.innerHTML = `
    <div class="pc-scoping-grid">
      <div class="pc-scoping-column">
        <section class="pc-zone" data-pc="zone-qualifier">
          <div class="pc-step-header">
            <div class="pc-step-badge">01</div>
            <div class="pc-step-title">
              <h2>Where are you with Intercom?</h2>
              <p class="pc-sub">Tell us your situation so we can tailor the components and defaults below.</p>
            </div>
          </div>

          <div class="pc-q-block">
            <h3>1. Your Intercom setup</h3>
            <div class="pc-radio-row" data-pc="setup-radios">
              <label class="pc-selectable is-selected" data-value="new">
                <span class="pc-radio-dot"></span>
                <span class="pc-label-block">
                  <span class="pc-name">New to Intercom</span>
                  <span class="pc-desc">Starting from a clean workspace</span>
                </span>
              </label>
              <label class="pc-selectable" data-value="existing">
                <span class="pc-radio-dot"></span>
                <span class="pc-label-block">
                  <span class="pc-name">Already live on Intercom</span>
                  <span class="pc-desc">Optimising an existing setup</span>
                </span>
              </label>
            </div>

            <div class="pc-checkbox-row" style="margin-top:1rem;">
              <label class="pc-selectable" data-pc="migration-check">
                <span class="pc-checkbox-tick"></span>
                <span class="pc-label-block">
                  <span class="pc-name">Migration required <span class="pc-tag" style="margin-left:0.5rem;">VIA MIGR8NOW</span></span>
                  <span class="pc-desc">Migrating from another platform.</span>
                  <div class="pc-platform-list">
                    <span class="pc-platform-list-label">Supported:</span>
                    <span class="pc-platform-name">Zendesk</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">Freshdesk</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">Help Scout</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">Zoho Desk</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">LiveChat</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">Salesforce Service Cloud</span><span class="pc-platform-sep">·</span>
                    <span class="pc-platform-name">Intercom</span>
                  </div>
                </span>
              </label>
            </div>
          </div>

          <div class="pc-q-block">
            <h3>2. How large is your CX team?</h3>
            <div class="pc-pill-group" data-pc="team-size">
              <button class="pc-pill-btn" data-value="1-5">1–5 agents</button>
              <button class="pc-pill-btn is-selected" data-value="6-15">6–15 agents</button>
              <button class="pc-pill-btn" data-value="16-50">16–50 agents</button>
              <button class="pc-pill-btn" data-value="50+">50+ agents</button>
            </div>
          </div>
        </section>

        <section class="pc-zone pc-zone-builder">
          <div class="pc-step-header">
            <div class="pc-step-badge">02</div>
            <div class="pc-step-title">
              <h2>Build your engagement</h2>
              <p class="pc-sub">All components are optional. Adjust counts and complexity to match your needs.</p>
            </div>
          </div>
          <div class="pc-components" data-pc="components-list"></div>
        </section>
      </div>

      <aside class="pc-price-panel" data-pc="price-panel">
        <div class="pc-price-header">
          <div class="pc-label">YOUR ENGAGEMENT</div>
        </div>
        <div class="pc-currency-pill" data-pc="currency-pill">
          <button data-currency="USD">USD</button>
          <button data-currency="AUD">AUD</button>
          <button data-currency="EUR">EUR</button>
          <button data-currency="GBP">GBP</button>
        </div>
        <div class="pc-total-block">
          <div class="pc-from-label" data-pc="from-label"></div>
          <div class="pc-total is-pending" data-pc="grand-total">$ —</div>
          <div class="pc-total-meta" data-pc="total-meta">Click Calculate to reveal pricing</div>
        </div>
        <div class="pc-breakdown" data-pc="breakdown-list"></div>
        <div class="pc-disclaimer">
          Prices shown are indicative estimates based on your selections.
          Final scope confirmed during discovery.
        </div>
        <div class="pc-panel-cta">
          <button class="pc-btn-primary" data-pc="cta-primary">Calculate my engagement</button>
          <button class="pc-btn-secondary" data-pc="cta-pdf" style="display:none;">Download estimate (PDF)</button>
        </div>
      </aside>
    </div>
  `;

  // ----- DOM refs -----
  const componentsList = root.querySelector('[data-pc="components-list"]');
  const breakdownList = root.querySelector('[data-pc="breakdown-list"]');
  const fromLabel = root.querySelector('[data-pc="from-label"]');
  const grandTotalEl = root.querySelector('[data-pc="grand-total"]');
  const totalMetaEl = root.querySelector('[data-pc="total-meta"]');
  const ctaPrimary = root.querySelector('[data-pc="cta-primary"]');
  const ctaPdf = root.querySelector('[data-pc="cta-pdf"]');

  // ----- Build modal once and append to body -----
  const modal = document.createElement('div');
  modal.className = 'pc-modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="pc-modal">
      <button class="pc-modal-close" aria-label="Close">×</button>
      <h3>Reveal your estimate</h3>
      <p class="pc-modal-sub">Tell us who you are and we'll show your indicative engagement pricing right here, plus drop a copy in our inbox so we can follow up if helpful.</p>

      <label for="pc-calc-name">Your name</label>
      <input type="text" id="pc-calc-name" autocomplete="name" required>
      <div class="pc-field-error" data-pc="err-name">Please enter your name.</div>

      <label for="pc-calc-company">Company</label>
      <input type="text" id="pc-calc-company" autocomplete="organization" required>
      <div class="pc-field-error" data-pc="err-company">Please enter your company name.</div>

      <button class="pc-modal-cta" data-pc="calc-submit">Reveal my estimate</button>

      <div class="pc-submit-error" data-pc="submit-error"></div>

      <p class="pc-privacy-note">We use your details to follow up on your enquiry. No spam, no sharing.</p>
    </div>
  `;
  document.body.appendChild(modal);

  const modalNameInput = modal.querySelector('#pc-calc-name');
  const modalCompanyInput = modal.querySelector('#pc-calc-company');
  const modalErrName = modal.querySelector('[data-pc="err-name"]');
  const modalErrCompany = modal.querySelector('[data-pc="err-company"]');
  const modalSubmitBtn = modal.querySelector('[data-pc="calc-submit"]');
  const modalSubmitError = modal.querySelector('[data-pc="submit-error"]');
  const modalCloseBtn = modal.querySelector('.pc-modal-close');

  // ----- Renderers -----
  const renderComponents = () => {
    componentsList.innerHTML = '';

    // Group by pillar (preserving insertion order)
    const groups = new Map();
    CONFIG.components.forEach((c) => {
      if (!groups.has(c.pillar)) groups.set(c.pillar, []);
      groups.get(c.pillar).push(c);
    });

    groups.forEach((comps, pillar) => {
      const label = document.createElement('div');
      label.className = 'pc-section-label';
      label.textContent = pillar;
      componentsList.appendChild(label);
      comps.forEach((c) => componentsList.appendChild(renderComponentCard(c)));
    });

    if (state.migrationEnabled) {
      const migLabel = document.createElement('div');
      migLabel.className = 'pc-section-label';
      migLabel.textContent = 'MIGRATION';
      componentsList.appendChild(migLabel);
      componentsList.appendChild(renderMigrationCard());
    }

    const retLabel = document.createElement('div');
    retLabel.className = 'pc-section-label';
    retLabel.textContent = 'ONGOING OPTIMISATION';
    componentsList.appendChild(retLabel);
    componentsList.appendChild(renderRetainerCard());
  };

  const renderComponentCard = (c) => {
    const s = state.components[c.id];
    const div = document.createElement('div');
    div.className = 'pc-component' + (s.enabled ? ' is-active' : '');

    const usd = calcComponentUSD(c);
    const priceLabel = s.enabled
      ? state.priceRevealed
        ? fmtCurrency(usd)
        : 'Calculating'
      : 'Not added';
    const fromText = s.enabled && state.priceRevealed ? 'From ' : '';

    div.innerHTML = `
      <div class="pc-comp-head">
        <div>
          <div class="pc-comp-title">
            <span class="pc-name">${escape(c.name)}</span>
            <a class="pc-learn-more" href="${escape(c.learnMore)}" target="_blank" rel="noopener">Learn more ↗</a>
          </div>
          <p class="pc-comp-desc">${escape(c.desc)}</p>
        </div>
        <div class="pc-comp-price-block">
          <div class="pc-comp-price"><span class="pc-from">${fromText}</span>${escape(priceLabel)}</div>
        </div>
      </div>

      <div class="pc-toggle-row">
        <div class="pc-toggle-switch ${s.enabled ? 'is-on' : ''}" data-action="toggle"></div>
        <span class="pc-toggle-label">${s.enabled ? 'Included in your engagement' : 'Add to your engagement'}</span>
      </div>

      ${
        s.enabled
          ? `
        <div class="pc-comp-controls">
          <div class="pc-counter">
            <button data-action="dec" ${s.count <= 0 ? 'disabled' : ''}>−</button>
            <span class="pc-value">${fmtNumber(s.count)} ${escape(c.unitLabel)}${s.count === 1 ? '' : 's'}</span>
            <button data-action="inc" ${s.count >= c.maxCount ? 'disabled' : ''}>+</button>
          </div>
          ${['Simple', 'Moderate', 'Complex']
            .map(
              (level) => `
            <button class="pc-small-pill-btn ${s.complexity === level ? 'is-selected' : ''}" data-action="complexity" data-level="${level}">${level}</button>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
    `;

    div.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        const comp = state.components[c.id];
        if (action === 'toggle') {
          comp.enabled = !comp.enabled;
          if (comp.enabled && comp.count === 0) comp.count = c.defaultCount || 1;
        } else if (action === 'inc') {
          if (comp.count < c.maxCount) comp.count += 1;
        } else if (action === 'dec') {
          if (comp.count > 0) comp.count -= 1;
        } else if (action === 'complexity') {
          comp.complexity = el.dataset.level;
        }
        renderAll();
      });
    });

    return div
  };

  const renderMigrationCard = () => {
    const div = document.createElement('div');
    div.className = 'pc-component is-active';
    const usd = calcMigrationUSD();
    const platformOpts = Object.keys(CONFIG.migration.platforms).filter(
      (k) => !CONFIG.migration.platforms[k].fallback
    );
    const priceLabel = state.priceRevealed ? fmtCurrency(usd) : 'Calculating';
    const fromText = state.priceRevealed ? 'From ' : '';

    div.innerHTML = `
      <div class="pc-comp-head">
        <div style="flex:1;">
          <div class="pc-comp-title">
            <span class="pc-name">Migration</span>
            <a class="pc-learn-more" href="${escape(CONFIG.migration.learnMore)}" target="_blank" rel="noopener">Learn more ↗</a>
            <span class="pc-tag">VIA MIGR8NOW</span>
          </div>
          <p class="pc-comp-desc">Tickets, users, articles, tags, and historical data via Migr8Now.</p>
        </div>
        <div class="pc-comp-price-block">
          <div class="pc-comp-price"><span class="pc-from">${fromText}</span>${escape(priceLabel)}</div>
        </div>
      </div>

      <div class="pc-comp-controls" style="gap:1.5rem; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.625rem;">
          <label style="color:var(--pc-body); font-size:0.875rem;">Source:</label>
          <select class="pc-select-input" data-pc="mig-source">
            ${platformOpts
              .map(
                (p) =>
                  `<option value="${escape(p)}" ${state.migration.sourcePlatform === p ? 'selected' : ''}>${escape(p)}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="pc-slider-wrap">
          <label style="color:var(--pc-body); font-size:0.875rem; white-space:nowrap;">Volume:</label>
          <input type="range" class="pc-slider-input" data-pc="mig-volume"
                 min="0" max="2000000" step="10000" value="${state.migration.ticketVolume}">
          <span class="pc-slider-value" data-pc="mig-volume-label">~${fmtNumber(state.migration.ticketVolume)} tickets</span>
        </div>
      </div>
    `;

    div
      .querySelector('[data-pc="mig-source"]')
      .addEventListener('change', (e) => {
        state.migration.sourcePlatform = e.target.value;
        renderAll();
      });

    const slider = div.querySelector('[data-pc="mig-volume"]');
    const lab = div.querySelector('[data-pc="mig-volume-label"]');
    const priceEl = div.querySelector('.pc-comp-price-block .pc-comp-price');
    slider.addEventListener('input', (e) => {
      state.migration.ticketVolume = parseInt(e.target.value, 10);
      lab.textContent =
        '~' + fmtNumber(state.migration.ticketVolume) + ' tickets';
      if (state.priceRevealed) {
        priceEl.innerHTML = `<span class="pc-from">From </span>${fmtCurrency(calcMigrationUSD())}`;
      }
      renderPricePanel();
    });

    return div
  };

  const renderRetainerCard = () => {
    const div = document.createElement('div');
    div.className = 'pc-retainer-card';
    div.innerHTML = `
      <div class="pc-comp-head">
        <div style="flex:1;">
          <div class="pc-comp-title">
            <span class="pc-name">Ongoing Retainer</span>
            <a class="pc-learn-more" href="https://www.sabelcustomersuccess.com/services/retainer" target="_blank" rel="noopener">Learn more ↗</a>
            <span class="pc-tag">RECOMMENDED AFTER LAUNCH</span>
          </div>
          <p class="pc-comp-desc">Continuous Fin tuning, workflow optimisation, and support. Hours pool quarterly.</p>
        </div>
      </div>

      <div class="pc-retainer-tiers">
        ${CONFIG.retainerTiers
          .map(
            (t) => `
          <div class="pc-retainer-tier ${state.retainerSelected === t.id ? 'is-selected' : ''}" data-tier="${escape(t.id)}">
            <div class="pc-tier-name">${escape(t.name)}</div>
            <div class="pc-tier-hours">${t.hoursPerMonth} HRS / MO</div>
            <hr>
            <ul>${t.inclusions.map((i) => `<li>${escape(i)}</li>`).join('')}</ul>
          </div>
        `
          )
          .join('')}
      </div>
      ${state.retainerSelected ? `<button class="pc-clear-retainer" data-pc="clear-retainer">Remove retainer</button>` : ''}
    `;

    div.querySelectorAll('.pc-retainer-tier').forEach((el) => {
      el.addEventListener('click', () => {
        state.retainerSelected = el.dataset.tier;
        renderAll();
      });
    });
    const clear = div.querySelector('[data-pc="clear-retainer"]');
    if (clear) {
      clear.addEventListener('click', () => {
        state.retainerSelected = null;
        renderAll();
      });
    }
    return div
  };

  const renderPricePanel = () => {
    const projectUSD = calcProjectSubtotalUSD();
    const retainerUSD = getRetainerUSD();

    if (state.priceRevealed) {
      fromLabel.textContent = 'FROM';
      grandTotalEl.textContent = fmtCurrency(projectUSD);
      grandTotalEl.classList.remove('is-pending');
      totalMetaEl.textContent = `${state.currency}, project total (indicative)`;
    } else {
      fromLabel.textContent = '';
      grandTotalEl.textContent = '$ —';
      grandTotalEl.classList.add('is-pending');
      totalMetaEl.textContent = 'Click Calculate to reveal pricing';
    }

    // Build breakdown
    const items = [];
    CONFIG.components.forEach((c) => {
      const s = state.components[c.id];
      if (s.enabled && s.count > 0) {
        const usd = calcComponentUSD(c);
        const unitLabel = s.count === 1 ? c.unitLabel : c.unitLabel + 's';
        items.push({
          label: `${c.name} (${s.count} ${unitLabel})`,
          value: state.priceRevealed ? fmtCurrency(usd) : '—',
        });
      }
    });

    if (state.migrationEnabled) {
      items.push({
        label: `Migration (${fmtNumber(state.migration.ticketVolume)}, ${state.migration.sourcePlatform})`,
        value: state.priceRevealed ? fmtCurrency(calcMigrationUSD()) : '—',
      });
    }

    let html = '';
    if (items.length === 0) {
      html = `<div class="pc-breakdown-row is-empty"><span class="pc-label">No components selected yet</span><span class="pc-value">—</span></div>`;
    } else {
      html = items
        .map(
          (it) => `
        <div class="pc-breakdown-row">
          <span class="pc-label">${escape(it.label)}</span>
          <span class="pc-value">${escape(it.value)}</span>
        </div>
      `
        )
        .join('');
    }

    html += `
      <hr class="pc-breakdown-divider">
      <div class="pc-breakdown-row is-subtotal">
        <span class="pc-label">Project subtotal</span>
        <span class="pc-value">${state.priceRevealed ? 'From ' + fmtCurrency(projectUSD) : '—'}</span>
      </div>
    `;

    if (state.retainerSelected && retainerUSD > 0) {
      const tier = CONFIG.retainerTiers.find(
        (t) => t.id === state.retainerSelected
      );
      html += `
        <div class="pc-breakdown-row is-retainer" style="margin-top:0.875rem;">
          <span class="pc-label">Retainer · ${escape(tier.name)}</span>
          <span class="pc-value">${state.priceRevealed ? fmtCurrency(retainerUSD) + ' / mo' : '—'}</span>
        </div>
        <div class="pc-breakdown-row is-retainer">
          <span class="pc-label" style="color:var(--pc-muted-dim); font-size:0.75rem;">First quarter commitment</span>
          <span class="pc-value" style="color:var(--pc-muted); font-weight:600;">${state.priceRevealed ? fmtCurrency(retainerUSD * 3) : '—'}</span>
        </div>
      `;
    }

    breakdownList.innerHTML = html;

    if (state.priceRevealed) {
      ctaPrimary.textContent = 'Book a discovery call';
      ctaPrimary.dataset.action = 'book';
      ctaPdf.style.display = 'block';
    } else {
      ctaPrimary.textContent = 'Calculate my engagement';
      ctaPrimary.dataset.action = 'calculate';
      ctaPdf.style.display = 'none';
    }
  };

  const renderAll = () => {
    renderComponents();
    renderPricePanel();
  };

  // ----- Wiring -----
  const wireQualifier = () => {
    root
      .querySelectorAll('[data-pc="setup-radios"] .pc-selectable')
      .forEach((el) => {
        el.addEventListener('click', () => {
          root
            .querySelectorAll('[data-pc="setup-radios"] .pc-selectable')
            .forEach((x) => x.classList.remove('is-selected'));
          el.classList.add('is-selected');
          state.setup = el.dataset.value;
          if (state.priceRevealed) state.priceRevealed = false;
          renderAll();
        });
      });

    const mig = root.querySelector('[data-pc="migration-check"]');
    mig.addEventListener('click', () => {
      state.migrationEnabled = !state.migrationEnabled;
      mig.classList.toggle('is-selected', state.migrationEnabled);
      if (state.priceRevealed) state.priceRevealed = false;
      renderAll();
    });

    root
      .querySelectorAll('[data-pc="team-size"] .pc-pill-btn')
      .forEach((el) => {
        el.addEventListener('click', () => {
          root
            .querySelectorAll('[data-pc="team-size"] .pc-pill-btn')
            .forEach((x) => x.classList.remove('is-selected'));
          el.classList.add('is-selected');
          state.teamSize = el.dataset.value;
        });
      });
  };

  const wireCurrencyPill = () => {
    const buttons = root.querySelectorAll('[data-pc="currency-pill"] button');
    buttons.forEach((b) => {
      b.classList.toggle('is-selected', b.dataset.currency === state.currency);
      b.addEventListener('click', () => {
        state.currency = b.dataset.currency;
        try {
          localStorage.setItem(STORAGE_KEY_CURRENCY, state.currency);
        } catch {
          // localStorage may be unavailable (private mode, quota); fail silently
        }
        buttons.forEach((x) => x.classList.remove('is-selected'));
        b.classList.add('is-selected');
        renderAll();
      });
    });
  };

  const wireCTAs = () => {
    ctaPrimary.addEventListener('click', () => {
      if (state.priceRevealed) {
        window.open(CONFIG.bookingUrl, '_blank', 'noopener');
      } else {
        openModal();
      }
    });
    ctaPdf.addEventListener('click', generatePDF);
  };

  // ----- Modal + Lenis lock -----
  let scrollLocked = false;
  const lockScroll = () => {
    if (scrollLocked) return
    scrollLocked = true;
    const lenis = getLenis();
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  };
  const unlockScroll = () => {
    if (!scrollLocked) return
    scrollLocked = false;
    const lenis = getLenis();
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  };

  const clearFieldErrors = () => {
    modalErrName.classList.remove('is-shown');
    modalErrCompany.classList.remove('is-shown');
    modalNameInput.classList.remove('is-error');
    modalCompanyInput.classList.remove('is-error');
    modalSubmitError.classList.remove('is-shown');
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modalNameInput.value = state.contact.name;
    modalCompanyInput.value = state.contact.company;
    clearFieldErrors();
    lockScroll();
    setTimeout(() => modalNameInput.focus(), 60);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    unlockScroll();
  };

  const validateForm = () => {
    clearFieldErrors();
    const name = modalNameInput.value.trim();
    const company = modalCompanyInput.value.trim();
    let ok = true;
    if (!name) {
      modalNameInput.classList.add('is-error');
      modalErrName.classList.add('is-shown');
      ok = false;
    }
    if (!company) {
      modalCompanyInput.classList.add('is-error');
      modalErrCompany.classList.add('is-shown');
      ok = false;
    }
    return ok ? { name, company } : null
  };

  const buildSubmissionPayload = (contact) => {
    const fxRate = CONFIG.fx[state.currency];
    const symbol = CONFIG.currencySymbol[state.currency];
    const projectUSD = calcProjectSubtotalUSD();

    const components = CONFIG.components
      .filter(
        (c) =>
          state.components[c.id].enabled && state.components[c.id].count > 0
      )
      .map((c) => {
        const s = state.components[c.id];
        const hours = calcComponentHours(c);
        const priceUSD = calcComponentUSD(c);
        return {
          id: c.id,
          name: c.name,
          count: s.count,
          complexity: s.complexity,
          unitLabel: c.unitLabel,
          hours: Number(hours.toFixed(2)),
          priceUSD: Math.round(priceUSD),
          priceClient: Math.round(priceUSD * fxRate),
        }
      });

    const totalHours = components.reduce((sum, c) => sum + c.hours, 0);

    let migration = null;
    if (state.migrationEnabled) {
      const migUSD = calcMigrationUSD();
      const platDef =
        CONFIG.migration.platforms[state.migration.sourcePlatform] ||
        CONFIG.migration.platforms['Other'];
      const surcharge = CONFIG.migration.surchargeBaseUSD * platDef.multiplier;
      migration = {
        sourcePlatform: state.migration.sourcePlatform,
        ticketVolume: state.migration.ticketVolume,
        surchargeUSD: Math.round(surcharge),
        priceUSD: Math.round(migUSD),
        priceClient: Math.round(migUSD * fxRate),
      };
    }

    let retainer = null;
    if (state.retainerSelected) {
      const tier = CONFIG.retainerTiers.find(
        (t) => t.id === state.retainerSelected
      );
      if (tier) {
        retainer = {
          tierId: tier.id,
          tierName: tier.name,
          hoursPerMonth: tier.hoursPerMonth,
          priceUSD: tier.pricing.USD,
          priceClient: tier.pricing[state.currency] || tier.pricing.USD,
        };
      }
    }

    return {
      contact,
      setup: {
        key: state.setup,
        label:
          state.setup === 'new'
            ? 'New to Intercom'
            : 'Already live on Intercom',
        migrationRequired: state.migrationEnabled,
        teamSize: state.teamSize,
      },
      components,
      migration,
      retainer,
      pricing: {
        currency: state.currency,
        currencySymbol: symbol,
        fxRate,
        hourlyRateUSD: CONFIG.hourlyRate,
        totalHours: Number(totalHours.toFixed(2)),
        projectSubtotalUSD: Math.round(projectUSD),
        projectSubtotalClient: Math.round(projectUSD * fxRate),
      },
      meta: {
        submittedAt: new Date().toISOString(),
        page: window.location.href,
      },
    }
  };

  const submitCalculation = async () => {
    const contact = validateForm();
    if (!contact) return

    modalSubmitError.classList.remove('is-shown');
    modalSubmitBtn.disabled = true;
    modalSubmitBtn.textContent = 'Submitting...';

    const payload = buildSubmissionPayload(contact);

    try {
      const res = await fetch(CONFIG.submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        modalSubmitError.textContent =
          data.error ||
          'Could not submit. Please try again or email us directly.';
        modalSubmitError.classList.add('is-shown');
        modalSubmitBtn.disabled = false;
        modalSubmitBtn.textContent = 'Reveal my estimate';
        return
      }
      state.contact = contact;
      state.priceRevealed = true;
      closeModal();
      renderAll();
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.textContent = 'Reveal my estimate';
    } catch (err) {
      console.error('Submission failed:', err);
      modalSubmitError.textContent =
        'Network error. Please check your connection and try again.';
      modalSubmitError.classList.add('is-shown');
      modalSubmitBtn.disabled = false;
      modalSubmitBtn.textContent = 'Reveal my estimate';
    }
  };

  const wireModal = () => {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modalSubmitBtn.addEventListener('click', submitCalculation)
    ;[modalNameInput, modalCompanyInput].forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitCalculation();
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  };

  // ----- PDF (lazy-loaded jsPDF) -----
  let jspdfLoadPromise = null;
  const loadJsPDF = () => {
    if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF)
    if (jspdfLoadPromise) return jspdfLoadPromise
    jspdfLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CONFIG.jspdfCdnUrl;
      s.async = true;
      s.onload = () => {
        if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error('jsPDF loaded but global not found'));
      };
      s.onerror = () => reject(new Error('Failed to load jsPDF from CDN'));
      document.head.appendChild(s);
    });
    // Reset on rejection so a future click can retry the load.
    jspdfLoadPromise.catch(() => {
      jspdfLoadPromise = null;
    });
    return jspdfLoadPromise
  };

  async function generatePDF() {
    if (state.pdfLoading) return
    state.pdfLoading = true;
    ctaPdf.disabled = true;
    ctaPdf.textContent = 'Generating...';
    try {
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 40;
      let y = M + 20;

      const RED = [225, 6, 0];
      const DARK = [30, 41, 59];
      const MUTED = [100, 116, 139];
      const BODY = [51, 65, 85];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...RED);
      doc.text('SABEL CUSTOMER SUCCESS', M, y);
      y += 8;
      doc.setDrawColor(...RED);
      doc.setLineWidth(2);
      doc.line(M, y, M + 80, y);

      y += 30;
      doc.setFontSize(24);
      doc.setTextColor(...DARK);
      doc.text('Engagement Estimate', M, y);

      y += 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(
        `Generated ${new Date().toLocaleDateString()} · Indicative pricing only · Final scope confirmed during discovery.`,
        M,
        y
      );

      y += 40;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...RED);
      doc.text('YOUR SETUP', M, y);
      y += 6;
      doc.setLineWidth(1);
      doc.line(M, y, M + 60, y);
      y += 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...BODY);
      const setupLabel =
        state.setup === 'new' ? 'New to Intercom' : 'Already live on Intercom';
      doc.text(
        `Intercom: ${setupLabel}${state.migrationEnabled ? ' · Migration required' : ''}`,
        M,
        y
      );
      y += 16;
      doc.text(`Team size: ${state.teamSize} agents`, M, y);
      y += 16;
      doc.text(`Currency: ${state.currency}`, M, y);

      y += 36;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...RED);
      doc.text('PROJECT COMPONENTS', M, y);
      y += 6;
      doc.line(M, y, M + 100, y);
      y += 22;

      const projectUSD = calcProjectSubtotalUSD();

      CONFIG.components.forEach((c) => {
        const s = state.components[c.id];
        if (s.enabled && s.count > 0) {
          const usd = calcComponentUSD(c);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...DARK);
          doc.text(c.name, M, y);
          doc.text(fmtCurrency(usd), W - M, y, { align: 'right' });
          y += 14;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...MUTED);
          doc.text(
            `${s.count} × ${s.complexity.toLowerCase()} · ${calcComponentHours(c).toFixed(1)} hrs`,
            M,
            y
          );
          y += 18;
        }
      });

      if (state.migrationEnabled) {
        const usd = calcMigrationUSD();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.text('Migration', M, y);
        doc.text(fmtCurrency(usd), W - M, y, { align: 'right' });
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(
          `${fmtNumber(state.migration.ticketVolume)} tickets from ${state.migration.sourcePlatform} · via Migr8Now`,
          M,
          y
        );
        y += 18;
      }

      y += 6;
      doc.setDrawColor(200, 200, 200);
      doc.line(M, y, W - M, y);
      y += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...DARK);
      doc.text('Project subtotal', M, y);
      doc.setTextColor(...RED);
      doc.text('From ' + fmtCurrency(projectUSD), W - M, y, { align: 'right' });

      if (state.retainerSelected) {
        y += 36;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...RED);
        doc.text('ONGOING RETAINER', M, y);
        y += 6;
        doc.line(M, y, M + 100, y);
        y += 22;

        const tier = CONFIG.retainerTiers.find(
          (t) => t.id === state.retainerSelected
        );
        const usd = tier.pricing.USD;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.text(`${tier.name} retainer`, M, y);
        doc.text(`${fmtCurrency(usd)} / mo`, W - M, y, { align: 'right' });
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(`${tier.hoursPerMonth} hrs/mo · pooled quarterly`, M, y);
        y += 14;
        doc.text(`First-quarter commitment: ${fmtCurrency(usd * 3)}`, M, y);
      }

      const footY = H - 50;
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(
        'PERFECT MADE POSSIBLE  ·  sabelcustomersuccess.com',
        W / 2,
        footY,
        { align: 'center' }
      );
      doc.setFontSize(7);
      doc.text(
        'Indicative estimate only. Final scope and pricing confirmed during discovery.',
        W / 2,
        footY + 14,
        { align: 'center' }
      );

      doc.save(`Sabel_Estimate_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try again or contact us directly.');
    } finally {
      ctaPdf.disabled = false;
      ctaPdf.textContent = 'Download estimate (PDF)';
      state.pdfLoading = false;
    }
  }

  // ----- Boot -----
  wireQualifier();
  wireCurrencyPill();
  wireCTAs();
  wireModal();
  renderAll();
}

export { index as default };
//# sourceMappingURL=index-IVmctqXc.js.map
