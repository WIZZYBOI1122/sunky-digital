(function () {
  'use strict';

  const CART_KEY = 'sunkyDigitalsCart';
  const WHATSAPP_CHECKOUT = 'https://api.whatsapp.com/send?phone=2349025222961';
  const PAYMENT_ACCOUNT = {
    bankName: 'OPay',
    accountName: 'SUNKY DIGITAL ENTERPRISES',
    accountNumber: '9025222961'
  };
  const pages = [
    ['Home', 'index.html'],
    ['Electricity Bills', 'electricity.html'],
    ['Cable TV', 'cable.html'],
    ['Data Plans', 'data.html'],
    ['Airtime', 'airtime.html'],
    ['Contact', 'contact.html']
  ];
  const cablePlans = {
    DStv: [
      ['DStv Premium', '1 Month', 44500],
      ['DStv Premium + French', '1 Month', 69000],
      ['SELECTE36', '1 Month', 11000],
      ['STARTERE36', '1 Month', 6000],
      ['SPORTSE36', '1 Month', 21000],
      ['DStv Premium Streaming Subscription', '1 Month', 44500],
      ['SPORTSOTT', '1 Month', 21000],
      ['STARTEROTT', '1 Month', 6000],
      ['DStv Movie Bundle Add-on E36', '1 Month', 3500],
      ['DStv French 11', '1 Month', 10800],
      ['DStv MOVIESE36 - Movie Bundle Add-on', '1 Month', 3500],
      ['HDPVR Access Service', '1 Month', 6000],
      ['DStv French Touch Add-on Bouquet E36', '1 Month', 7000],
      ['DStv French Plus Add-on Bouquet E36', '1 Month', 24500],
      ['DStv Great Wall standalone Bouquet', '1 Month', 3800]
    ],
    GOtv: [
      ['GOEASY', '1 Month', 4000],
      ['GOSTARTER', '1 Month', 6000],
      ['GOSELECT', '1 Month', 11000],
      ['GOSPORTS', '1 Month', 21000]
    ],
    StarTimes: [
      ['DTT_Classic', '7 Days', 2000],
      ['DTH_Super', '7 Days', 3300],
      ['DTH_Basic', '7 Days', 1700],
      ['DTH_Nova', '7 Days', 700],
      ['DTH_Classic', '7 Days', 2500],
      ['DTT_Nova', '7 Days', 700],
      ['DTT_Basic', '7 Days', 1400],
      ['Combo_Basic', '7 Days', 1700],
      ['DTT_Super', '7 Days', 3200],
      ['Combo_Super', '7 Days', 3300],
      ['Combo_Classic', '7 Days', 2500],
      ['DTH_Global', '7 Days', 7000],
      ['DTT_Basic', '1 Month', 4000],
      ['DTT_Classic', '1 Month', 6000],
      ['DTH_Nova', '1 Month', 2100],
      ['DTH_Basic', '1 Month', 5100],
      ['DTH_Super', '1 Month', 9800],
      ['DTH_Classic', '1 Month', 7400],
      ['DTH_Chinese', '1 Month', 21000],
      ['DTT_Nova', '1 Month', 2100],
      ['Combo_Basic', '1 Month', 5100],
      ['DTT_Super', '1 Month', 9500],
      ['Combo_Super', '1 Month', 9800],
      ['Combo_Classic', '1 Month', 7400],
      ['DTH_Global', '1 Month', 21000],
      ['DTT_Mini', '90 Days', 3000]
    ]
  };
  const dataPlans = {
    MTN: {
      weekly: [
        ['500 MB', 400], ['1 GB', 500], ['2 GB', 1000], ['3 GB', 1200], ['6 GB', 2700], ['11 GB', 3600]
      ],
      monthly: [
        ['500 MB', 500], ['1 GB', 600], ['2 GB', 1100], ['3 GB', 1400], ['5 GB', 1700], ['10 GB', 3200], ['15 GB', 4900]
      ]
    },
    Airtel: {
      weekly: [
        ['500 MB', 600], ['1 GB', 900], ['7 GB', 2300], ['10 GB', 3400], ['18 GB', 5400]
      ],
      monthly: [
        ['2 GB', 1600], ['3 GB', 2100], ['4 GB', 2600], ['8 GB', 3100], ['10 GB', 4100],
        ['13 GB', 5100], ['18 GB', 6100], ['25 GB', 8000], ['35 GB', 10100], ['60 GB', 15000],
        ['100 GB', 20000], ['160 GB', 30000], ['210 GB', 39500], ['300 GB', 49500], ['650 GB', 98500]
      ]
    },
    Glo: {
      weekly: [
        ['1 GB', 500], ['3 GB', 1300], ['5 GB', 2200]
      ],
      monthly: [
        ['500 MB', 400], ['1 GB', 600], ['2 GB', 1000], ['3 GB', 1400], ['5 GB', 2300], ['10 GB', 4400]
      ]
    }
  };

  let cart = readCart();
  let toastTimer;
  let paymentStep = false;

  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(isValidCartItem) : [];
    } catch (error) {
      showToast('Cart storage is unavailable. Your current cart will not persist after leaving this page.');
      return [];
    }
  }

  function isValidCartItem(item) {
    return item && typeof item.id === 'string' && typeof item.serviceName === 'string' &&
      typeof item.details === 'string' && Number.isFinite(item.price) && item.price >= 0;
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      return true;
    } catch (error) {
      showToast('Could not save your cart on this device. Keep this page open while ordering.');
      return false;
    }
  }

  function formatNaira(value) {
    return '₦' + Number(value).toLocaleString('en-NG');
  }

  function isServiceChargeExempt(item) {
    return item.serviceType === 'data' ||
      item.serviceType === 'airtime' ||
      (!item.serviceType && /\bdata$/i.test(item.serviceName.trim()));
  }

  function getServiceCharge(item) {
    return isServiceChargeExempt(item) ? 0 : 100;
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  function createDrawers() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.setAttribute('data-close-drawers', '');
    backdrop.setAttribute('aria-hidden', 'true');

    const nav = document.createElement('aside');
    nav.className = 'drawer drawer-nav';
    nav.setAttribute('aria-label', 'Site navigation');
    nav.setAttribute('aria-hidden', 'true');
    nav.innerHTML = '<div class="drawer-header"><button class="drawer-close" type="button" aria-label="Close navigation" data-close-drawers>×</button><a class="brand" href="index.html"><span class="brand-mark">S</span><span>Sunky <b>Digitals</b></span></a></div>';
    const navLinks = document.createElement('nav');
    navLinks.className = 'nav-links';
    navLinks.setAttribute('aria-label', 'Main navigation');
    pages.forEach(function (page) {
      const link = document.createElement('a');
      link.href = page[1];
      link.textContent = page[0];
      if (page[1] === currentPage) link.setAttribute('aria-current', 'page');
      navLinks.appendChild(link);
    });
    nav.appendChild(navLinks);
    const navNote = document.createElement('div');
    navNote.className = 'drawer-note';
    navNote.innerHTML = '<b>● All Services Active</b>Choose a service and send your request to our team.';
    nav.appendChild(navNote);

    const drawer = document.createElement('aside');
    drawer.className = 'drawer drawer-cart';
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = '<div class="drawer-header"><h2><span data-drawer-title>Your cart</span> <span data-drawer-count></span></h2><button class="drawer-close" type="button" aria-label="Close cart" data-close-drawers>×</button></div><div class="cart-items" data-cart-items></div><section class="payment-panel" data-payment-panel hidden aria-label="Payment details"><button class="payment-back" type="button" data-back-to-cart>← Back to cart</button><p class="payment-intro">Transfer the order total to this account, then confirm your payment to send your order details to our team on WhatsApp.</p><div class="payment-account"><div><span>Bank</span><strong data-bank-name></strong></div><div><span>Account name</span><strong data-account-name></strong></div><div><span>Account number</span><div class="account-number-details"><strong class="account-number" data-account-number></strong><button class="copy-account" type="button" data-copy-account aria-label="Copy account number">Copy</button></div></div></div><p class="payment-notice">Payment is not verified automatically. Our team will confirm receipt before processing your order.</p></section><div class="cart-footer"><div class="cart-totals"><div class="cart-subtotal"><span>Items subtotal</span><strong data-cart-subtotal>₦0</strong></div><div class="cart-subtotal"><span>Service charge (₦100 × <span data-cart-fee-count>0</span> chargeable items)</span><strong data-cart-fee>₦0</strong></div><div class="cart-subtotal cart-total"><span>Total to pay</span><strong data-cart-total>₦0</strong></div></div><button class="button button-primary" type="button" data-checkout disabled>Proceed to payment <span>→</span></button><button class="button button-primary" type="button" data-confirm-payment hidden>Confirm payment <span>↗</span></button><p class="checkout-note">Data and airtime have no service charge; other services incur ₦100 per item. Your order will be sent to WhatsApp for confirmation.</p></div>';
    drawer.querySelector('[data-bank-name]').textContent = PAYMENT_ACCOUNT.bankName;
    drawer.querySelector('[data-account-name]').textContent = PAYMENT_ACCOUNT.accountName;
    drawer.querySelector('[data-account-number]').textContent = PAYMENT_ACCOUNT.accountNumber;
    drawer.querySelector('[data-copy-account]').addEventListener('click', copyAccountNumber);
    document.body.appendChild(backdrop);
    document.body.appendChild(nav);
    document.body.appendChild(drawer);
    document.querySelectorAll('[data-open-nav]').forEach(function (button) {
      button.addEventListener('click', function () { openDrawer(nav, button); });
    });
    document.querySelectorAll('[data-open-cart]').forEach(function (button) {
      button.addEventListener('click', function () { openDrawer(drawer, button); });
    });
    document.querySelectorAll('[data-close-drawers]').forEach(function (button) {
      button.addEventListener('click', closeDrawers);
    });
    document.querySelector('[data-checkout]').addEventListener('click', showPaymentStep);
    document.querySelector('[data-confirm-payment]').addEventListener('click', confirmPayment);
    document.querySelector('[data-back-to-cart]').addEventListener('click', function () {
      setPaymentStep(false);
    });
    document.querySelector('[data-cart-items]').addEventListener('click', function (event) {
      const button = event.target.closest('[data-remove-item]');
      if (!button) return;
      cart = cart.filter(function (item) { return item.id !== button.dataset.removeItem; });
      saveCart();
      renderCart();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawers();
    });
    renderCart();
  }

  function openDrawer(drawer, trigger) {
    closeDrawers();
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.querySelector('.drawer-backdrop').classList.add('is-visible');
    document.body.classList.add('drawer-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const closeButton = drawer.querySelector('.drawer-close');
    if (closeButton) closeButton.focus();
  }

  function closeDrawers() {
    document.querySelectorAll('.drawer.is-open').forEach(function (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    });
    const backdrop = document.querySelector('.drawer-backdrop');
    if (backdrop) backdrop.classList.remove('is-visible');
    document.body.classList.remove('drawer-open');
    document.querySelectorAll('[data-open-nav], [data-open-cart]').forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function copyAccountNumber() {
    const accountNumber = PAYMENT_ACCOUNT.accountNumber;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(accountNumber).then(function () {
        showToast('Account number copied.');
      }).catch(function () {
        showToast(copyTextFallback(accountNumber)
          ? 'Account number copied.'
          : 'Could not copy the account number. Please copy it manually.');
      });
      return;
    }
    showToast(copyTextFallback(accountNumber)
      ? 'Account number copied.'
      : 'Could not copy the account number. Please copy it manually.');
  }

  function copyTextFallback(text) {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    let copied = false;
    try {
      input.select();
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    } finally {
      input.remove();
    }
    return copied;
  }

  function renderCart() {
    document.querySelectorAll('[data-cart-count]').forEach(function (badge) {
      badge.textContent = String(cart.length);
    });
    const drawerCount = document.querySelector('[data-drawer-count]');
    if (!drawerCount) return;
    drawerCount.textContent = cart.length ? '(' + cart.length + ')' : '';
    const items = document.querySelector('[data-cart-items]');
    const subtotal = cart.reduce(function (sum, item) { return sum + item.price; }, 0);
    const chargeableItemCount = cart.filter(function (item) { return getServiceCharge(item) > 0; }).length;
    const serviceCharge = cart.reduce(function (sum, item) { return sum + getServiceCharge(item); }, 0);
    document.querySelector('[data-cart-subtotal]').textContent = formatNaira(subtotal);
    document.querySelector('[data-cart-fee-count]').textContent = String(chargeableItemCount);
    document.querySelector('[data-cart-fee]').textContent = formatNaira(serviceCharge);
    document.querySelector('[data-cart-total]').textContent = formatNaira(subtotal + serviceCharge);
    document.querySelector('[data-checkout]').disabled = cart.length === 0;
    if (!cart.length) {
      setPaymentStep(false);
      items.innerHTML = '<div class="cart-empty"><span class="cart-empty-icon">🛒</span><h3>Your cart is waiting</h3><p>Choose a service or bundle and it will show up here.</p></div>';
      return;
    }

    items.replaceChildren();
    cart.forEach(function (item) {
      const row = document.createElement('article');
      row.className = 'cart-item';
      const content = document.createElement('div');
      const name = document.createElement('h3');
      name.textContent = item.serviceName;
      const details = document.createElement('p');
      details.textContent = item.details;
      const price = document.createElement('strong');
      price.textContent = formatNaira(item.price);
      content.append(name, details, price);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-item';
      remove.dataset.removeItem = item.id;
      remove.setAttribute('aria-label', 'Remove ' + item.serviceName);
      remove.textContent = 'Remove';
      row.append(content, remove);
      items.appendChild(row);
    });
  }

  function setPaymentStep(showPayment) {
    paymentStep = showPayment;
    const drawer = document.querySelector('.drawer-cart');
    if (!drawer) return;
    drawer.querySelector('[data-drawer-title]').textContent = paymentStep ? 'Payment details' : 'Your cart';
    drawer.querySelector('[data-cart-items]').hidden = paymentStep;
    drawer.querySelector('[data-payment-panel]').hidden = !paymentStep;
    drawer.querySelector('[data-checkout]').hidden = paymentStep;
    drawer.querySelector('[data-confirm-payment]').hidden = !paymentStep;
  }

  function showPaymentStep() {
    if (!cart.length) return;
    setPaymentStep(true);
  }

  function addItem(item) {
    const cartItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      serviceName: item.serviceName,
      details: item.details,
      price: Number(item.price),
      serviceType: item.serviceType === 'data' || item.serviceType === 'airtime' ? item.serviceType : 'standard'
    };
    if (!isValidCartItem(cartItem)) {
      showToast('This item could not be added. Check the details and try again.');
      return false;
    }
    cart.push(cartItem);
    saveCart();
    renderCart();
    showToast(item.serviceName + ' added to your cart.');
    return true;
  }

  function renderDataPlans() {
    const catalog = document.querySelector('[data-plan-catalog]');
    if (!catalog) return;
    catalog.querySelectorAll('[data-network-card]').forEach(function (card) {
      const plansByPeriod = dataPlans[card.dataset.networkCard];
      const planList = card.querySelector('[data-plan-list]');
      const periodButtons = card.querySelectorAll('[data-plan-period]');
      if (!plansByPeriod || !planList) return;

      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'button button-primary plan-add-button';
      addButton.dataset.addItem = '';
      addButton.dataset.addSelectedPlan = '';
      addButton.disabled = true;
      addButton.textContent = 'Add selected plan to cart';
      planList.after(addButton);

      function showPlans(period) {
        planList.replaceChildren();
        addButton.disabled = true;
        delete addButton.dataset.service;
        delete addButton.dataset.serviceType;
        delete addButton.dataset.details;
        delete addButton.dataset.price;
        periodButtons.forEach(function (button) {
          const isActive = button.dataset.planPeriod === period;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        });
        plansByPeriod[period].forEach(function (plan) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'plan-row';
          button.dataset.selectPlan = '';
          button.setAttribute('aria-pressed', 'false');
          button.dataset.service = card.dataset.networkCard + ' Data';
          button.dataset.serviceType = 'data';
          button.dataset.details = plan[0] + ' ' + period + ' data plan';
          button.dataset.price = String(plan[1]);

          const description = document.createElement('span');
          const size = document.createElement('b');
          size.textContent = plan[0];
          const validity = document.createElement('small');
          validity.textContent = period.charAt(0).toUpperCase() + period.slice(1) + ' plan';
          description.append(size, validity);

          const price = document.createElement('strong');
          price.textContent = formatNaira(plan[1]);
          const add = document.createElement('span');
          add.className = 'add-symbol';
          add.setAttribute('aria-hidden', 'true');
          add.textContent = '○';
          button.append(description, price, add);
          planList.appendChild(button);
        });
      }

      periodButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          showPlans(button.dataset.planPeriod);
        });
      });
      showPlans('weekly');
    });
  }

  function confirmPayment() {
    if (!cart.length) return;
    const lines = [
      'Hello Sunky Digitals, I have made payment for this order. Please verify the transfer and process my order:',
      ''
    ];
    cart.forEach(function (item, index) {
      lines.push((index + 1) + '. ' + item.serviceName);
      lines.push('   ' + item.details.replace(/\n/g, '\n   '));
      lines.push('   Amount: ' + formatNaira(item.price));
      lines.push('');
    });
    const subtotal = cart.reduce(function (sum, item) { return sum + item.price; }, 0);
    const serviceCharge = cart.reduce(function (sum, item) { return sum + getServiceCharge(item); }, 0);
    lines.push('Items subtotal: ' + formatNaira(subtotal));
    lines.push('Total to pay: ' + formatNaira(subtotal + serviceCharge));
    lines.push('');
    lines.push('Thank you.');
    const url = WHATSAPP_CHECKOUT + '&text=' + encodeURIComponent(lines.join('\n'));
    cart = [];
    saveCart();
    renderCart();
    closeDrawers();
    window.location.assign(url);
  }

  function bindQuickAddButtons() {
    document.addEventListener('click', function (event) {
      const planButton = event.target.closest('[data-select-plan]');
      if (planButton) {
        const networkCard = planButton.closest('[data-network-card]');
        networkCard.querySelectorAll('[data-select-plan]').forEach(function (option) {
          const isSelected = option === planButton;
          option.classList.toggle('is-selected', isSelected);
          option.setAttribute('aria-pressed', String(isSelected));
        });
        const addButton = networkCard.querySelector('[data-add-selected-plan]');
        addButton.dataset.service = planButton.dataset.service;
        addButton.dataset.serviceType = planButton.dataset.serviceType;
        addButton.dataset.details = planButton.dataset.details;
        addButton.dataset.price = planButton.dataset.price;
        addButton.disabled = false;
        return;
      }

      const button = event.target.closest('[data-add-item]');
      if (!button) return;
      const networkCard = button.closest('[data-network-card]');
      const recipientInput = networkCard && networkCard.querySelector('[data-network-recipient]');
      if (recipientInput && !recipientInput.reportValidity()) return;
      const added = addItem({
        serviceName: button.dataset.service,
        details: button.dataset.details + (recipientInput ? '\nPhone: ' + recipientInput.value.trim() : ''),
        price: Number(button.dataset.price),
        serviceType: button.dataset.serviceType
      });
      if (added && button.hasAttribute('data-add-selected-plan')) {
        button.disabled = true;
        delete button.dataset.service;
        delete button.dataset.serviceType;
        delete button.dataset.details;
        delete button.dataset.price;
        networkCard.querySelectorAll('[data-select-plan]').forEach(function (option) {
          option.classList.remove('is-selected');
          option.setAttribute('aria-pressed', 'false');
        });
      }
    });
  }

  function bindElectricityForm(form) {
    const amountInput = form.elements.amount;
    amountInput.addEventListener('input', function () {
      amountInput.setCustomValidity('');
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const amount = Number(values.get('amount'));
      if (!Number.isFinite(amount) || amount < 500) {
        amountInput.setCustomValidity('Enter an amount of at least ₦500.');
        amountInput.reportValidity();
        return;
      }
      addItem({
        serviceName: 'Electricity token',
        details: 'Provider: ' + values.get('disco') + '\nMeter type: ' + values.get('meterType') + '\nMeter number: ' + values.get('meter'),
        price: amount
      });
      form.reset();
    });
  }

  function bindAirtimeForm(form) {
    const amountInput = form.elements.amount;
    amountInput.addEventListener('input', function () {
      amountInput.setCustomValidity('');
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const amount = Number(values.get('amount'));
      if (!Number.isFinite(amount) || amount < 500) {
        amountInput.setCustomValidity('Enter an airtime amount of at least ₦500.');
        amountInput.reportValidity();
        return;
      }
      addItem({
        serviceName: values.get('network') + ' Airtime',
        details: 'Phone: ' + values.get('phone') + '\nAirtime amount: ' + formatNaira(amount),
        price: amount,
        serviceType: 'airtime'
      });
      form.reset();
    });
  }

  function bindCableForm(form) {
    const provider = form.elements.provider;
    const bouquet = form.elements.bouquet;
    const priceOutput = form.querySelector('[data-selected-price]');
    function updatePrice() {
      const plans = cablePlans[provider.value] || [];
      bouquet.replaceChildren();
      const prompt = document.createElement('option');
      prompt.value = '';
      prompt.textContent = plans.length ? 'Choose a bouquet' : 'Select a provider first';
      bouquet.appendChild(prompt);
      plans.forEach(function (plan, index) {
        const option = document.createElement('option');
        option.value = String(index);
        option.dataset.name = plan[0];
        option.dataset.duration = plan[1];
        option.dataset.price = String(plan[2]);
        option.textContent = plan[0] + ' — ' + plan[1] + ' — ' + formatNaira(plan[2]);
        bouquet.appendChild(option);
      });
      bouquet.disabled = !plans.length;
      priceOutput.hidden = true;
      priceOutput.textContent = '';
    }
    provider.addEventListener('change', updatePrice);
    bouquet.addEventListener('change', function () {
      const option = bouquet.selectedOptions[0];
      if (!option || !option.dataset.price) {
        priceOutput.hidden = true;
        return;
      }
      priceOutput.textContent = 'Guide price: ' + formatNaira(option.dataset.price) + ' for ' + option.dataset.duration + ' — final price confirmed on WhatsApp.';
      priceOutput.hidden = false;
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const selected = bouquet.selectedOptions[0];
      const plans = cablePlans[values.get('provider')] || [];
      const plan = plans[Number(values.get('bouquet'))];
      if (!selected || !plan) return;
      addItem({
        serviceName: values.get('provider') + ' subscription',
        details: 'Bouquet: ' + plan[0] + '\nDuration: ' + plan[1] + '\nSmartcard / IUC number: ' + values.get('iuc'),
        price: plan[2]
      });
      form.reset();
      updatePrice();
    });
  }

  function init() {
    document.querySelectorAll('[data-year]').forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
    createDrawers();
    renderDataPlans();
    bindQuickAddButtons();
    document.querySelectorAll('[data-order-form="airtime"]').forEach(bindAirtimeForm);
    document.querySelectorAll('[data-order-form="electricity"]').forEach(bindElectricityForm);
    document.querySelectorAll('[data-order-form="cable"]').forEach(bindCableForm);
  }

  init();
}());
