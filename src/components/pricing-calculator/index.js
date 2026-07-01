/*
Component: pricing-calculator
Webflow attribute: data-component="pricing-calculator"

Drop a single empty container with this attribute on the pricing page.
The component builds the entire qualifier zone, builder zone, sticky price
panel, and reveal-gate modal inside it (modal is appended to body).
*/

import './styles.css'
import { CONFIG } from './config.js'
import { getLenis } from '../global.js'

const STORAGE_KEY_CURRENCY = 'sabelCurrency'

export default function (elements) {
  elements.forEach((root) => {
    initCalculator(root)
  })
}

function readStoredCurrency() {
  try {
    const v = localStorage.getItem(STORAGE_KEY_CURRENCY)
    if (v && CONFIG.fx[v] !== undefined) return v
  } catch {
    // localStorage unavailable (private mode, restricted iframe)
  }
  return 'AUD'
}

function initCalculator(root) {
  // Data: Webflow-hosted overrides merged over config defaults.
  const DATA = window.SABEL_CALCULATOR_DATA || {}
  const COMPONENTS = Array.isArray(DATA.components)
    ? DATA.components
    : CONFIG.components
  const RETAINER_TIERS = Array.isArray(DATA.retainerTiers)
    ? DATA.retainerTiers
    : CONFIG.retainerTiers
  const MIGRATION_PLATFORMS =
    DATA.migrationPlatforms && typeof DATA.migrationPlatforms === 'object'
      ? DATA.migrationPlatforms
      : CONFIG.migration.platforms

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
  }

  // Initialise component state from defaults
  COMPONENTS.forEach((c) => {
    state.components[c.id] = {
      enabled: c.defaultEnabled,
      count: c.defaultCount,
      complexity: c.defaultComplexity,
    }
  })

  // ----- Pricing math -----
  const calcComponentHours = (c) => {
    const s = state.components[c.id]
    if (!s.enabled || s.count === 0) return 0
    const mult = CONFIG.complexity[s.complexity]
    return c.baseHours * s.count * mult
  }
  const calcComponentUSD = (c) => calcComponentHours(c) * CONFIG.hourlyRate

  const calcMigrationUSD = () => {
    if (!state.migrationEnabled) return 0
    const qty = state.migration.ticketVolume
    const tiers = CONFIG.migration.tiers
    let subtotal

    if (qty <= 0) {
      subtotal = 0
    } else if (qty < tiers[0].qty) {
      subtotal = qty * tiers[0].perTicket
    } else {
      let i = 0
      for (let k = 0; k < tiers.length; k++) {
        if (tiers[k].qty <= qty) i = k
      }
      const base = tiers[i].totalUSD
      const surplus = qty - tiers[i].qty
      const nextRate =
        i + 1 < tiers.length ? tiers[i + 1].perTicket : tiers[i].perTicket
      subtotal = base + surplus * nextRate
    }

    const platDef =
      MIGRATION_PLATFORMS[state.migration.sourcePlatform] ||
      MIGRATION_PLATFORMS['Other']
    const surcharge = CONFIG.migration.surchargeBaseUSD * platDef.multiplier
    let total = subtotal + surcharge

    if (qty > 0 && total < CONFIG.migration.minPriceUSD) {
      total = CONFIG.migration.minPriceUSD
    }
    return total
  }

  const getRetainerUSD = () => {
    if (!state.retainerSelected) return 0
    const tier = RETAINER_TIERS.find((t) => t.id === state.retainerSelected)
    return tier ? tier.pricing.USD : 0
  }

  const calcProjectSubtotalUSD = () => {
    let total = COMPONENTS.reduce((sum, c) => sum + calcComponentUSD(c), 0)
    total += calcMigrationUSD()
    return total
  }

  // ----- Formatting -----
  const fmtCurrency = (amountUSD, currency) => {
    const cur = currency || state.currency
    const fxd = amountUSD * CONFIG.fx[cur]
    const sym = CONFIG.currencySymbol[cur]
    return sym + Math.round(fxd).toLocaleString('en-US')
  }
  const fmtNumber = (n) => Number(n).toLocaleString('en-US')
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
    )

  // Copy: Webflow-hosted overrides merged over config defaults.
  const COPY = { ...CONFIG.copy, ...(window.SABEL_CALCULATOR_COPY || {}) }
  const t = (key) => COPY[key] ?? CONFIG.copy[key] ?? ''

  // Supported platforms list (qualifier) — the non-fallback platforms.
  const supportedHtml = Object.keys(MIGRATION_PLATFORMS)
    .filter((k) => !MIGRATION_PLATFORMS[k].fallback)
    .map((n) => `<span class="pc-platform-name">${escape(n)}</span>`)
    .join('<span class="pc-platform-sep">·</span>')

  // ----- Build the static shell once -----
  root.innerHTML = `
    <div class="pc-scoping-grid">
      <div class="pc-scoping-column">
        <section class="pc-zone" data-pc="zone-qualifier">
          <div class="pc-step-header">
            <div class="pc-step-badge">01</div>
            <div class="pc-step-title">
              <h2>${escape(t('step1Title'))}</h2>
              <p class="pc-sub">${escape(t('step1Sub'))}</p>
            </div>
          </div>

          <div class="pc-q-block">
            <h3>${escape(t('setupQuestion'))}</h3>
            <div class="pc-radio-row" data-pc="setup-radios">
              <label class="pc-selectable is-selected" data-value="new">
                <span class="pc-radio-dot"></span>
                <span class="pc-label-block">
                  <span class="pc-name">${escape(t('setupNewName'))}</span>
                  <span class="pc-desc">${escape(t('setupNewDesc'))}</span>
                </span>
              </label>
              <label class="pc-selectable" data-value="existing">
                <span class="pc-radio-dot"></span>
                <span class="pc-label-block">
                  <span class="pc-name">${escape(t('setupExistingName'))}</span>
                  <span class="pc-desc">${escape(t('setupExistingDesc'))}</span>
                </span>
              </label>
            </div>

            <div class="pc-checkbox-row" style="margin-top:1rem;">
              <label class="pc-selectable" data-pc="migration-check">
                <span class="pc-checkbox-tick"></span>
                <span class="pc-label-block">
                  <span class="pc-name">${escape(t('migrationCheckName'))} <span class="pc-tag" style="margin-left:0.5rem;">${escape(t('migrationCardTag'))}</span></span>
                  <span class="pc-desc">${escape(t('migrationCheckDesc'))}</span>
                  <div class="pc-platform-list">
                    <span class="pc-platform-list-label">${escape(t('supportedLabel'))}</span>
                    ${supportedHtml}
                  </div>
                </span>
              </label>
            </div>
          </div>

          <div class="pc-q-block">
            <h3>${escape(t('teamQuestion'))}</h3>
            <div class="pc-pill-group" data-pc="team-size">
              <button class="pc-pill-btn" data-value="1-5">${escape(t('teamOption1'))}</button>
              <button class="pc-pill-btn is-selected" data-value="6-15">${escape(t('teamOption2'))}</button>
              <button class="pc-pill-btn" data-value="16-50">${escape(t('teamOption3'))}</button>
              <button class="pc-pill-btn" data-value="50+">${escape(t('teamOption4'))}</button>
            </div>
          </div>
        </section>

        <section class="pc-zone pc-zone-builder">
          <div class="pc-step-header">
            <div class="pc-step-badge">02</div>
            <div class="pc-step-title">
              <h2>${escape(t('step2Title'))}</h2>
              <p class="pc-sub">${escape(t('step2Sub'))}</p>
            </div>
          </div>
          <div class="pc-components" data-pc="components-list"></div>
        </section>
      </div>

      <aside class="pc-price-panel" data-pc="price-panel">
        <div class="pc-price-header">
          <div class="pc-label">${escape(t('panelLabel'))}</div>
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
          <div class="pc-total-meta" data-pc="total-meta">${escape(t('pricePendingMeta'))}</div>
        </div>
        <div class="pc-breakdown" data-pc="breakdown-list"></div>
        <div class="pc-disclaimer">${escape(t('priceDisclaimer'))}</div>
        <div class="pc-panel-cta">
          <button class="pc-btn-primary" data-pc="cta-primary">${escape(t('ctaCalculate'))}</button>
          <button class="pc-btn-secondary" data-pc="cta-pdf" style="display:none;">${escape(t('ctaPdf'))}</button>
        </div>
      </aside>
    </div>
  `

  // ----- DOM refs -----
  const componentsList = root.querySelector('[data-pc="components-list"]')
  const breakdownList = root.querySelector('[data-pc="breakdown-list"]')
  const fromLabel = root.querySelector('[data-pc="from-label"]')
  const grandTotalEl = root.querySelector('[data-pc="grand-total"]')
  const totalMetaEl = root.querySelector('[data-pc="total-meta"]')
  const ctaPrimary = root.querySelector('[data-pc="cta-primary"]')
  const ctaPdf = root.querySelector('[data-pc="cta-pdf"]')

  // ----- Build modal once and append to body -----
  const modal = document.createElement('div')
  modal.className = 'pc-modal-backdrop'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.innerHTML = `
    <div class="pc-modal">
      <button class="pc-modal-close" aria-label="Close">×</button>
      <h3>${escape(t('modalTitle'))}</h3>
      <p class="pc-modal-sub">${escape(t('modalSub'))}</p>

      <label for="pc-calc-name">${escape(t('modalNameLabel'))}</label>
      <input type="text" id="pc-calc-name" autocomplete="name" required>
      <div class="pc-field-error" data-pc="err-name">${escape(t('modalErrName'))}</div>

      <label for="pc-calc-company">${escape(t('modalCompanyLabel'))}</label>
      <input type="text" id="pc-calc-company" autocomplete="organization" required>
      <div class="pc-field-error" data-pc="err-company">${escape(t('modalErrCompany'))}</div>

      <button class="pc-modal-cta" data-pc="calc-submit">${escape(t('modalSubmit'))}</button>

      <div class="pc-submit-error" data-pc="submit-error"></div>

      <p class="pc-privacy-note">${escape(t('modalPrivacy'))}</p>
    </div>
  `
  document.body.appendChild(modal)

  const modalNameInput = modal.querySelector('#pc-calc-name')
  const modalCompanyInput = modal.querySelector('#pc-calc-company')
  const modalErrName = modal.querySelector('[data-pc="err-name"]')
  const modalErrCompany = modal.querySelector('[data-pc="err-company"]')
  const modalSubmitBtn = modal.querySelector('[data-pc="calc-submit"]')
  const modalSubmitError = modal.querySelector('[data-pc="submit-error"]')
  const modalCloseBtn = modal.querySelector('.pc-modal-close')

  // ----- Renderers -----
  const renderComponents = () => {
    componentsList.innerHTML = ''

    // Group by pillar (preserving insertion order)
    const groups = new Map()
    COMPONENTS.forEach((c) => {
      if (!groups.has(c.pillar)) groups.set(c.pillar, [])
      groups.get(c.pillar).push(c)
    })

    groups.forEach((comps, pillar) => {
      const label = document.createElement('div')
      label.className = 'pc-section-label'
      label.textContent = pillar
      componentsList.appendChild(label)
      comps.forEach((c) => componentsList.appendChild(renderComponentCard(c)))
    })

    if (state.migrationEnabled) {
      const migLabel = document.createElement('div')
      migLabel.className = 'pc-section-label'
      migLabel.textContent = t('sectionMigration')
      componentsList.appendChild(migLabel)
      componentsList.appendChild(renderMigrationCard())
    }

    const retLabel = document.createElement('div')
    retLabel.className = 'pc-section-label'
    retLabel.textContent = t('sectionOptimisation')
    componentsList.appendChild(retLabel)
    componentsList.appendChild(renderRetainerCard())
  }

  const renderComponentCard = (c) => {
    const s = state.components[c.id]
    const div = document.createElement('div')
    div.className = 'pc-component' + (s.enabled ? ' is-active' : '')

    const usd = calcComponentUSD(c)
    const priceLabel = s.enabled
      ? state.priceRevealed
        ? fmtCurrency(usd)
        : t('compCalculating')
      : t('compNotAdded')
    const fromText =
      s.enabled && state.priceRevealed ? t('labelFrom') + ' ' : ''

    div.innerHTML = `
      <div class="pc-comp-head">
        <div>
          <div class="pc-comp-title">
            <span class="pc-name">${escape(c.name)}</span>
            <a class="pc-learn-more" href="${escape(c.learnMore)}" target="_blank" rel="noopener">${escape(t('labelLearnMore'))}</a>
          </div>
          <p class="pc-comp-desc">${escape(c.desc)}</p>
        </div>
        <div class="pc-comp-price-block">
          <div class="pc-comp-price"><span class="pc-from">${escape(fromText)}</span>${escape(priceLabel)}</div>
        </div>
      </div>

      <div class="pc-toggle-row">
        <div class="pc-toggle-switch ${s.enabled ? 'is-on' : ''}" data-action="toggle"></div>
        <span class="pc-toggle-label">${escape(s.enabled ? t('compIncluded') : t('compAdd'))}</span>
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
    `

    div.querySelectorAll('[data-action]').forEach((el) => {
      el.addEventListener('click', () => {
        const action = el.dataset.action
        const comp = state.components[c.id]
        if (action === 'toggle') {
          comp.enabled = !comp.enabled
          if (comp.enabled && comp.count === 0) comp.count = c.defaultCount || 1
        } else if (action === 'inc') {
          if (comp.count < c.maxCount) comp.count += 1
        } else if (action === 'dec') {
          if (comp.count > 0) comp.count -= 1
        } else if (action === 'complexity') {
          comp.complexity = el.dataset.level
        }
        renderAll()
      })
    })

    return div
  }

  const renderMigrationCard = () => {
    const div = document.createElement('div')
    div.className = 'pc-component is-active'
    const usd = calcMigrationUSD()
    const platformOpts = Object.keys(MIGRATION_PLATFORMS).filter(
      (k) => !MIGRATION_PLATFORMS[k].fallback
    )
    const priceLabel = state.priceRevealed
      ? fmtCurrency(usd)
      : t('compCalculating')
    const fromText = state.priceRevealed ? t('labelFrom') + ' ' : ''

    div.innerHTML = `
      <div class="pc-comp-head">
        <div style="flex:1;">
          <div class="pc-comp-title">
            <span class="pc-name">${escape(t('migrationCardTitle'))}</span>
            <a class="pc-learn-more" href="${escape(t('migrationCardLearnMore'))}" target="_blank" rel="noopener">${escape(t('labelLearnMore'))}</a>
            <span class="pc-tag">${escape(t('migrationCardTag'))}</span>
          </div>
          <p class="pc-comp-desc">${escape(t('migrationCardDesc'))}</p>
        </div>
        <div class="pc-comp-price-block">
          <div class="pc-comp-price"><span class="pc-from">${escape(fromText)}</span>${escape(priceLabel)}</div>
        </div>
      </div>

      <div class="pc-comp-controls" style="gap:1.5rem; align-items:center;">
        <div style="display:flex; align-items:center; gap:0.625rem;">
          <label style="color:var(--pc-body); font-size:0.875rem;">${escape(t('migrationSourceLabel'))}</label>
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
          <label style="color:var(--pc-body); font-size:0.875rem; white-space:nowrap;">${escape(t('migrationVolumeLabel'))}</label>
          <input type="range" class="pc-slider-input" data-pc="mig-volume"
                 min="0" max="2000000" step="10000" value="${state.migration.ticketVolume}">
          <span class="pc-slider-value" data-pc="mig-volume-label">~${fmtNumber(state.migration.ticketVolume)} ${escape(t('migrationTicketsSuffix'))}</span>
        </div>
      </div>
    `

    div
      .querySelector('[data-pc="mig-source"]')
      .addEventListener('change', (e) => {
        state.migration.sourcePlatform = e.target.value
        renderAll()
      })

    const slider = div.querySelector('[data-pc="mig-volume"]')
    const lab = div.querySelector('[data-pc="mig-volume-label"]')
    const priceEl = div.querySelector('.pc-comp-price-block .pc-comp-price')
    slider.addEventListener('input', (e) => {
      state.migration.ticketVolume = parseInt(e.target.value, 10)
      lab.textContent =
        '~' +
        fmtNumber(state.migration.ticketVolume) +
        ' ' +
        t('migrationTicketsSuffix')
      if (state.priceRevealed) {
        priceEl.innerHTML = `<span class="pc-from">${escape(t('labelFrom'))} </span>${fmtCurrency(calcMigrationUSD())}`
      }
      renderPricePanel()
    })

    return div
  }

  const renderRetainerCard = () => {
    const div = document.createElement('div')
    div.className = 'pc-retainer-card'
    div.innerHTML = `
      <div class="pc-comp-head">
        <div style="flex:1;">
          <div class="pc-comp-title">
            <span class="pc-name">${escape(t('retainerTitle'))}</span>
            <a class="pc-learn-more" href="${escape(t('retainerLearnMore'))}">${escape(t('labelLearnMore'))}</a>
            <span class="pc-tag">${escape(t('retainerTag'))}</span>
          </div>
          <p class="pc-comp-desc">${escape(t('retainerDesc'))}</p>
        </div>
      </div>

      <div class="pc-retainer-tiers">
        ${RETAINER_TIERS.map(
          (tier) => `
          <div class="pc-retainer-tier ${state.retainerSelected === tier.id ? 'is-selected' : ''}" data-tier="${escape(tier.id)}">
            <div class="pc-tier-name">${escape(tier.name)}</div>
            <div class="pc-tier-hours">${tier.hoursPerMonth} ${escape(t('retainerHoursSuffix'))}</div>
            <hr>
            <ul>${tier.inclusions.map((i) => `<li>${escape(i)}</li>`).join('')}</ul>
          </div>
        `
        ).join('')}
      </div>
      ${state.retainerSelected ? `<button class="pc-clear-retainer" data-pc="clear-retainer">${escape(t('retainerRemove'))}</button>` : ''}
    `

    div.querySelectorAll('.pc-retainer-tier').forEach((el) => {
      el.addEventListener('click', () => {
        state.retainerSelected = el.dataset.tier
        renderAll()
      })
    })
    const clear = div.querySelector('[data-pc="clear-retainer"]')
    if (clear) {
      clear.addEventListener('click', () => {
        state.retainerSelected = null
        renderAll()
      })
    }
    return div
  }

  const renderPricePanel = () => {
    const projectUSD = calcProjectSubtotalUSD()
    const retainerUSD = getRetainerUSD()

    if (state.priceRevealed) {
      fromLabel.textContent = t('priceFromLabel')
      grandTotalEl.textContent = fmtCurrency(projectUSD)
      grandTotalEl.classList.remove('is-pending')
      totalMetaEl.textContent = `${state.currency}, ${t('priceRevealedMeta')}`
    } else {
      fromLabel.textContent = ''
      grandTotalEl.textContent = '$ —'
      grandTotalEl.classList.add('is-pending')
      totalMetaEl.textContent = t('pricePendingMeta')
    }

    // Build breakdown
    const items = []
    COMPONENTS.forEach((c) => {
      const s = state.components[c.id]
      if (s.enabled && s.count > 0) {
        const usd = calcComponentUSD(c)
        const unitLabel = s.count === 1 ? c.unitLabel : c.unitLabel + 's'
        items.push({
          label: `${c.name} (${s.count} ${unitLabel})`,
          value: state.priceRevealed ? fmtCurrency(usd) : '—',
        })
      }
    })

    if (state.migrationEnabled) {
      items.push({
        label: `Migration (${fmtNumber(state.migration.ticketVolume)}, ${state.migration.sourcePlatform})`,
        value: state.priceRevealed ? fmtCurrency(calcMigrationUSD()) : '—',
      })
    }

    let html = ''
    if (items.length === 0) {
      html = `<div class="pc-breakdown-row is-empty"><span class="pc-label">${escape(t('priceEmpty'))}</span><span class="pc-value">—</span></div>`
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
        .join('')
    }

    html += `
      <hr class="pc-breakdown-divider">
      <div class="pc-breakdown-row is-subtotal">
        <span class="pc-label">${escape(t('priceSubtotal'))}</span>
        <span class="pc-value">${state.priceRevealed ? t('labelFrom') + ' ' + fmtCurrency(projectUSD) : '—'}</span>
      </div>
    `

    if (state.retainerSelected && retainerUSD > 0) {
      const tier = RETAINER_TIERS.find((t) => t.id === state.retainerSelected)
      html += `
        <div class="pc-breakdown-row is-retainer" style="margin-top:0.875rem;">
          <span class="pc-label">Retainer · ${escape(tier.name)}</span>
          <span class="pc-value">${state.priceRevealed ? fmtCurrency(retainerUSD) + ' ' + t('pricePerMonthSuffix') : '—'}</span>
        </div>
        <div class="pc-breakdown-row is-retainer">
          <span class="pc-label" style="color:var(--pc-muted-dim); font-size:0.75rem;">${escape(t('priceFirstQuarter'))}</span>
          <span class="pc-value" style="color:var(--pc-muted); font-weight:600;">${state.priceRevealed ? fmtCurrency(retainerUSD * 3) : '—'}</span>
        </div>
      `
    }

    breakdownList.innerHTML = html

    if (state.priceRevealed) {
      ctaPrimary.textContent = t('ctaBook')
      ctaPrimary.dataset.action = 'book'
      ctaPdf.style.display = 'block'
    } else {
      ctaPrimary.textContent = t('ctaCalculate')
      ctaPrimary.dataset.action = 'calculate'
      ctaPdf.style.display = 'none'
    }
  }

  const renderAll = () => {
    renderComponents()
    renderPricePanel()
  }

  // ----- Wiring -----
  const wireQualifier = () => {
    root
      .querySelectorAll('[data-pc="setup-radios"] .pc-selectable')
      .forEach((el) => {
        el.addEventListener('click', () => {
          root
            .querySelectorAll('[data-pc="setup-radios"] .pc-selectable')
            .forEach((x) => x.classList.remove('is-selected'))
          el.classList.add('is-selected')
          state.setup = el.dataset.value
          if (state.priceRevealed) state.priceRevealed = false
          renderAll()
        })
      })

    const mig = root.querySelector('[data-pc="migration-check"]')
    mig.addEventListener('click', () => {
      state.migrationEnabled = !state.migrationEnabled
      mig.classList.toggle('is-selected', state.migrationEnabled)
      if (state.priceRevealed) state.priceRevealed = false
      renderAll()
    })

    root
      .querySelectorAll('[data-pc="team-size"] .pc-pill-btn')
      .forEach((el) => {
        el.addEventListener('click', () => {
          root
            .querySelectorAll('[data-pc="team-size"] .pc-pill-btn')
            .forEach((x) => x.classList.remove('is-selected'))
          el.classList.add('is-selected')
          state.teamSize = el.dataset.value
        })
      })
  }

  const wireCurrencyPill = () => {
    const buttons = root.querySelectorAll('[data-pc="currency-pill"] button')
    buttons.forEach((b) => {
      b.classList.toggle('is-selected', b.dataset.currency === state.currency)
      b.addEventListener('click', () => {
        state.currency = b.dataset.currency
        try {
          localStorage.setItem(STORAGE_KEY_CURRENCY, state.currency)
        } catch {
          // localStorage may be unavailable (private mode, quota); fail silently
        }
        buttons.forEach((x) => x.classList.remove('is-selected'))
        b.classList.add('is-selected')
        renderAll()
      })
    })
  }

  const wireCTAs = () => {
    ctaPrimary.addEventListener('click', () => {
      if (state.priceRevealed) {
        window.open(CONFIG.bookingUrl, '_blank', 'noopener')
      } else {
        openModal()
      }
    })
    ctaPdf.addEventListener('click', generatePDF)
  }

  // ----- Modal + Lenis lock -----
  let scrollLocked = false
  const lockScroll = () => {
    if (scrollLocked) return
    scrollLocked = true
    const lenis = getLenis()
    if (lenis) lenis.stop()
    document.body.style.overflow = 'hidden'
  }
  const unlockScroll = () => {
    if (!scrollLocked) return
    scrollLocked = false
    const lenis = getLenis()
    if (lenis) lenis.start()
    document.body.style.overflow = ''
  }

  const clearFieldErrors = () => {
    modalErrName.classList.remove('is-shown')
    modalErrCompany.classList.remove('is-shown')
    modalNameInput.classList.remove('is-error')
    modalCompanyInput.classList.remove('is-error')
    modalSubmitError.classList.remove('is-shown')
  }

  const openModal = () => {
    modal.classList.add('is-open')
    modalNameInput.value = state.contact.name
    modalCompanyInput.value = state.contact.company
    clearFieldErrors()
    lockScroll()
    setTimeout(() => modalNameInput.focus(), 60)
  }

  const closeModal = () => {
    modal.classList.remove('is-open')
    unlockScroll()
  }

  const validateForm = () => {
    clearFieldErrors()
    const name = modalNameInput.value.trim()
    const company = modalCompanyInput.value.trim()
    let ok = true
    if (!name) {
      modalNameInput.classList.add('is-error')
      modalErrName.classList.add('is-shown')
      ok = false
    }
    if (!company) {
      modalCompanyInput.classList.add('is-error')
      modalErrCompany.classList.add('is-shown')
      ok = false
    }
    return ok ? { name, company } : null
  }

  const buildSubmissionPayload = (contact) => {
    const fxRate = CONFIG.fx[state.currency]
    const symbol = CONFIG.currencySymbol[state.currency]
    const projectUSD = calcProjectSubtotalUSD()

    const components = COMPONENTS.filter(
      (c) => state.components[c.id].enabled && state.components[c.id].count > 0
    ).map((c) => {
      const s = state.components[c.id]
      const hours = calcComponentHours(c)
      const priceUSD = calcComponentUSD(c)
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
    })

    const totalHours = components.reduce((sum, c) => sum + c.hours, 0)

    let migration = null
    if (state.migrationEnabled) {
      const migUSD = calcMigrationUSD()
      const platDef =
        MIGRATION_PLATFORMS[state.migration.sourcePlatform] ||
        MIGRATION_PLATFORMS['Other']
      const surcharge = CONFIG.migration.surchargeBaseUSD * platDef.multiplier
      migration = {
        sourcePlatform: state.migration.sourcePlatform,
        ticketVolume: state.migration.ticketVolume,
        surchargeUSD: Math.round(surcharge),
        priceUSD: Math.round(migUSD),
        priceClient: Math.round(migUSD * fxRate),
      }
    }

    let retainer = null
    if (state.retainerSelected) {
      const tier = RETAINER_TIERS.find((t) => t.id === state.retainerSelected)
      if (tier) {
        retainer = {
          tierId: tier.id,
          tierName: tier.name,
          hoursPerMonth: tier.hoursPerMonth,
          priceUSD: tier.pricing.USD,
          priceClient: tier.pricing[state.currency] || tier.pricing.USD,
        }
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
  }

  const submitCalculation = async () => {
    const contact = validateForm()
    if (!contact) return

    modalSubmitError.classList.remove('is-shown')
    modalSubmitBtn.disabled = true
    modalSubmitBtn.textContent = 'Submitting...'

    const payload = buildSubmissionPayload(contact)

    try {
      const res = await fetch(CONFIG.submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        modalSubmitError.textContent =
          data.error ||
          'Could not submit. Please try again or email us directly.'
        modalSubmitError.classList.add('is-shown')
        modalSubmitBtn.disabled = false
        modalSubmitBtn.textContent = t('modalSubmit')
        return
      }
      state.contact = contact
      state.priceRevealed = true
      closeModal()
      renderAll()
      modalSubmitBtn.disabled = false
      modalSubmitBtn.textContent = t('modalSubmit')
    } catch (err) {
      console.error('Submission failed:', err)
      modalSubmitError.textContent =
        'Network error. Please check your connection and try again.'
      modalSubmitError.classList.add('is-shown')
      modalSubmitBtn.disabled = false
      modalSubmitBtn.textContent = t('modalSubmit')
    }
  }

  const wireModal = () => {
    modalCloseBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })
    modalSubmitBtn.addEventListener('click', submitCalculation)
    ;[modalNameInput, modalCompanyInput].forEach((el) => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitCalculation()
      })
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal()
      }
    })
  }

  // ----- PDF (lazy-loaded jsPDF) -----
  let jspdfLoadPromise = null
  const loadJsPDF = () => {
    if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF)
    if (jspdfLoadPromise) return jspdfLoadPromise
    jspdfLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = CONFIG.jspdfCdnUrl
      s.async = true
      s.onload = () => {
        if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF)
        else reject(new Error('jsPDF loaded but global not found'))
      }
      s.onerror = () => reject(new Error('Failed to load jsPDF from CDN'))
      document.head.appendChild(s)
    })
    // Reset on rejection so a future click can retry the load.
    jspdfLoadPromise.catch(() => {
      jspdfLoadPromise = null
    })
    return jspdfLoadPromise
  }

  async function generatePDF() {
    if (state.pdfLoading) return
    state.pdfLoading = true
    ctaPdf.disabled = true
    ctaPdf.textContent = 'Generating...'
    try {
      const jsPDF = await loadJsPDF()
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })

      const W = doc.internal.pageSize.getWidth()
      const H = doc.internal.pageSize.getHeight()
      const M = 40
      let y = M + 20

      const RED = [225, 6, 0]
      const DARK = [30, 41, 59]
      const MUTED = [100, 116, 139]
      const BODY = [51, 65, 85]

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...RED)
      doc.text('SABEL CUSTOMER SUCCESS', M, y)
      y += 8
      doc.setDrawColor(...RED)
      doc.setLineWidth(2)
      doc.line(M, y, M + 80, y)

      y += 30
      doc.setFontSize(24)
      doc.setTextColor(...DARK)
      doc.text('Engagement Estimate', M, y)

      y += 30
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...MUTED)
      doc.text(
        `Generated ${new Date().toLocaleDateString()} · Indicative pricing only · Final scope confirmed during discovery.`,
        M,
        y
      )

      y += 40
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...RED)
      doc.text('YOUR SETUP', M, y)
      y += 6
      doc.setLineWidth(1)
      doc.line(M, y, M + 60, y)
      y += 18

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(...BODY)
      const setupLabel =
        state.setup === 'new' ? 'New to Intercom' : 'Already live on Intercom'
      doc.text(
        `Intercom: ${setupLabel}${state.migrationEnabled ? ' · Migration required' : ''}`,
        M,
        y
      )
      y += 16
      doc.text(`Team size: ${state.teamSize} agents`, M, y)
      y += 16
      doc.text(`Currency: ${state.currency}`, M, y)

      y += 36
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...RED)
      doc.text('PROJECT COMPONENTS', M, y)
      y += 6
      doc.line(M, y, M + 100, y)
      y += 22

      const projectUSD = calcProjectSubtotalUSD()

      COMPONENTS.forEach((c) => {
        const s = state.components[c.id]
        if (s.enabled && s.count > 0) {
          const usd = calcComponentUSD(c)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(...DARK)
          doc.text(c.name, M, y)
          doc.text(fmtCurrency(usd), W - M, y, { align: 'right' })
          y += 14
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(...MUTED)
          doc.text(
            `${s.count} × ${s.complexity.toLowerCase()} · ${calcComponentHours(c).toFixed(1)} hrs`,
            M,
            y
          )
          y += 18
        }
      })

      if (state.migrationEnabled) {
        const usd = calcMigrationUSD()
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...DARK)
        doc.text('Migration', M, y)
        doc.text(fmtCurrency(usd), W - M, y, { align: 'right' })
        y += 14
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...MUTED)
        doc.text(
          `${fmtNumber(state.migration.ticketVolume)} tickets from ${state.migration.sourcePlatform} · via Migr8Now`,
          M,
          y
        )
        y += 18
      }

      y += 6
      doc.setDrawColor(200, 200, 200)
      doc.line(M, y, W - M, y)
      y += 22
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...DARK)
      doc.text('Project subtotal', M, y)
      doc.setTextColor(...RED)
      doc.text('From ' + fmtCurrency(projectUSD), W - M, y, { align: 'right' })

      if (state.retainerSelected) {
        y += 36
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...RED)
        doc.text('ONGOING RETAINER', M, y)
        y += 6
        doc.line(M, y, M + 100, y)
        y += 22

        const tier = RETAINER_TIERS.find((t) => t.id === state.retainerSelected)
        const usd = tier.pricing.USD
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...DARK)
        doc.text(`${tier.name} retainer`, M, y)
        doc.text(`${fmtCurrency(usd)} / mo`, W - M, y, { align: 'right' })
        y += 14
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...MUTED)
        doc.text(`${tier.hoursPerMonth} hrs/mo · pooled quarterly`, M, y)
        y += 14
        doc.text(`First-quarter commitment: ${fmtCurrency(usd * 3)}`, M, y)
      }

      const footY = H - 50
      doc.setFont('courier', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(
        'PERFECT MADE POSSIBLE  ·  sabelcustomersuccess.com',
        W / 2,
        footY,
        { align: 'center' }
      )
      doc.setFontSize(7)
      doc.text(
        'Indicative estimate only. Final scope and pricing confirmed during discovery.',
        W / 2,
        footY + 14,
        { align: 'center' }
      )

      doc.save(`Sabel_Estimate_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Could not generate PDF. Please try again or contact us directly.')
    } finally {
      ctaPdf.disabled = false
      ctaPdf.textContent = t('ctaPdf')
      state.pdfLoading = false
    }
  }

  // ----- Boot -----
  wireQualifier()
  wireCurrencyPill()
  wireCTAs()
  wireModal()
  renderAll()
}
