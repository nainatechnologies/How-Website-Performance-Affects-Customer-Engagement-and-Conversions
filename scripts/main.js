/**
 * Naina Technologies - High-Performance Blog Interactions
 * Inspired by Blocksy Starter Sites Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgressBar();
  initThemeToggle();
  initTableOfContents();
  initReadMore();
  initSpeedCalculator();
  initCoreWebVitalsInteractive();
  initAuditChecklist();
  initSocialShareAndToast();
  initClapButton();
  initFontSizeAdjuster();
  initBackToTop();
  initSearchModal();
  initAuditForm();
  initCommentForm();
  initFeedbackWidget();
  initGuideReaderModal();
  initInstagramEmbeds();
});

/* 1. READING PROGRESS BAR */
function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }, { passive: true });
}

/* 2. THEME TOGGLE (DARK / LIGHT) */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  const html = document.documentElement;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('blocksy-naina-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const activeTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(activeTheme);
      showToast(activeTheme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
    });
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('blocksy-naina-theme', theme);
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
  }
}

/* 3. TABLE OF CONTENTS SCROLLSPY */
function initTableOfContents() {
  const tocLinks = document.querySelectorAll('.toc-item a');
  const headings = Array.from(document.querySelectorAll('.article-body h2[id], .intro-card h2[id], h2[id]'));
  if (!tocLinks.length || !headings.length) return;

  // Smooth scroll click
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      // If target is inside the introduction section (topics 1 to 6), ensure it is expanded
      const introTopics = [
        'introduction',
        'what-is-website-performance',
        'why-website-performance-matters-for-businesses',
        'how-website-speed-affects-customer-engagement',
        'the-relationship-between-website-performance-and-conversions',
        'how-slow-websites-affect-user-experience'
      ];

      if (introTopics.includes(targetId)) {
        const introMore = document.getElementById('intro-more-content');
        const btn = document.getElementById('btn-read-more');
        if (introMore && !introMore.classList.contains('expanded')) {
          introMore.classList.add('expanded');
          if (btn) {
            btn.textContent = 'Show Less';
            btn.setAttribute('aria-expanded', 'true');
          }
        }
      }

      setTimeout(() => {
        if (targetElement) {
          const offset = 90;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elemRect = targetElement.getBoundingClientRect().top;
          const elementPosition = elemRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 120);
    });
  });

  // Scrollspy observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocLinks.forEach(link => {
          const parentItem = link.parentElement;
          if (link.getAttribute('href') === `#${id}`) {
            parentItem.classList.add('active');
          } else {
            parentItem.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-100px 0px -65% 0px',
    threshold: 0
  });

  headings.forEach(heading => observer.observe(heading));
}

/* 3.1 READ MORE EXPANDER (Expands Topics 2 to 6 inside Introduction section only) */
function initReadMore() {
  const readMoreBtn = document.getElementById('btn-read-more');
  const introMoreContent = document.getElementById('intro-more-content');

  if (!readMoreBtn || !introMoreContent) return;

  function expandContent() {
    introMoreContent.classList.add('expanded');
    readMoreBtn.textContent = 'Show Less';
    readMoreBtn.setAttribute('aria-expanded', 'true');
  }

  function collapseContent() {
    introMoreContent.classList.remove('expanded');
    readMoreBtn.textContent = 'Read More';
    readMoreBtn.setAttribute('aria-expanded', 'false');
    const introCard = document.querySelector('.intro-card');
    if (introCard) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elemRect = introCard.getBoundingClientRect().top;
      window.scrollTo({
        top: elemRect - bodyRect - offset,
        behavior: 'smooth'
      });
    }
  }

  readMoreBtn.addEventListener('click', () => {
    if (introMoreContent.classList.contains('expanded')) {
      collapseContent();
    } else {
      expandContent();
    }
  });

  window.expandIntroMatter = expandContent;
  window.collapseIntroMatter = collapseContent;
}

/* 4. INTERACTIVE SPEED & REVENUE IMPACT CALCULATOR */
function initSpeedCalculator() {
  const visitorsInput = document.getElementById('calc-visitors');
  const currentSpeedInput = document.getElementById('calc-current-speed');
  const targetSpeedInput = document.getElementById('calc-target-speed');
  const aovInput = document.getElementById('calc-aov');

  const visitorsVal = document.getElementById('val-visitors');
  const currentSpeedVal = document.getElementById('val-current-speed');
  const targetSpeedVal = document.getElementById('val-target-speed');
  const aovVal = document.getElementById('val-aov');

  const upliftRevenueEl = document.getElementById('calc-uplift-revenue');
  const conversionLiftEl = document.getElementById('calc-conversion-lift');
  const bounceReductionEl = document.getElementById('calc-bounce-reduction');

  if (!visitorsInput) return;

  function recalculate() {
    const monthlyVisitors = parseInt(visitorsInput.value, 10);
    const currentSpeed = parseFloat(currentSpeedInput.value);
    let targetSpeed = parseFloat(targetSpeedInput.value);
    const aov = parseFloat(aovInput.value);

    // Keep target speed less than current speed
    if (targetSpeed >= currentSpeed) {
      targetSpeed = Math.max(0.6, (currentSpeed - 0.5));
      targetSpeedInput.value = targetSpeed.toFixed(1);
    }

    // Update label displays
    visitorsVal.textContent = monthlyVisitors.toLocaleString();
    currentSpeedVal.textContent = `${currentSpeed.toFixed(1)}s`;
    targetSpeedVal.textContent = `${targetSpeed.toFixed(1)}s`;
    aovVal.textContent = `₹${aov.toLocaleString()}`;

    // Calculation model based on Google/Akamai speed research:
    // Every 1s reduction boosts conversion rate by ~7.2%
    // Base ecommerce conversion rate assumed at 2.4%
    const secondsSaved = Math.max(0, currentSpeed - targetSpeed);
    const liftPercentage = Math.min(38.0, secondsSaved * 7.8);
    const bounceReduction = Math.min(45.0, secondsSaved * 9.5);

    const baseConvRate = 0.024;
    const currentMonthlyOrders = monthlyVisitors * baseConvRate;
    const newMonthlyOrders = monthlyVisitors * (baseConvRate * (1 + (liftPercentage / 100)));
    const additionalMonthlyOrders = newMonthlyOrders - currentMonthlyOrders;
    const annualRevenueGain = additionalMonthlyOrders * aov * 12;

    // Format currency in Indian Lakhs/Crores if high
    let formattedRevenue = '';
    if (annualRevenueGain >= 10000000) {
      formattedRevenue = `₹${(annualRevenueGain / 10000000).toFixed(2)} Cr`;
    } else if (annualRevenueGain >= 100000) {
      formattedRevenue = `₹${(annualRevenueGain / 100000).toFixed(2)} Lakh`;
    } else {
      formattedRevenue = `₹${Math.round(annualRevenueGain).toLocaleString()}`;
    }

    upliftRevenueEl.textContent = `+${formattedRevenue}`;
    conversionLiftEl.textContent = `+${liftPercentage.toFixed(1)}%`;
    bounceReductionEl.textContent = `-${bounceReduction.toFixed(1)}%`;
  }

  [visitorsInput, currentSpeedInput, targetSpeedInput, aovInput].forEach(slider => {
    slider.addEventListener('input', recalculate);
  });

  recalculate();
}

/* 5. CORE WEB VITALS INTERACTIVE CARDS */
function initCoreWebVitalsInteractive() {
  const cards = document.querySelectorAll('.cwv-card');
  const detailBox = document.getElementById('cwv-active-detail');
  if (!cards.length || !detailBox) return;

  const metricDetails = {
    lcp: {
      title: "Largest Contentful Paint (LCP)",
      desc: "Measures perceived loading speed. Marks the point in page load timeline when the main content (hero image, heading, or banner) has likely loaded.",
      tip: "💡 Naina's Playbook: Use AVIF image compression, implement server-side caching, and preload the hero image with <link rel='preload'> to stay under 1.8s."
    },
    inp: {
      title: "Interaction to Next Paint (INP)",
      desc: "Replaced FID in 2024 as Google's official responsiveness metric. Evaluates all click, tap, and keyboard interactions throughout the entire page lifecycle.",
      tip: "💡 Naina's Playbook: Offload heavy computation from the main thread to Web Workers, reduce JavaScript execution bundles, and break long tasks (<50ms)."
    },
    cls: {
      title: "Cumulative Layout Shift (CLS)",
      desc: "Measures visual stability. Prevents sudden shifts in layout where buttons or text jump while an image or dynamic ad finishes rendering.",
      tip: "💡 Naina's Playbook: Always define explicit width & height attributes on <img> and <video> tags, and reserve aspect-ratio placeholders for dynamic UI."
    }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const metric = card.getAttribute('data-metric');
      const data = metricDetails[metric];
      if (data) {
        detailBox.innerHTML = `<strong>${data.title}:</strong> ${data.desc}<br><span style="color: var(--brand-primary); margin-top: 6px; display: inline-block;">${data.tip}</span>`;
      }
    });
  });
}

/* 6. AUDIT CHECKLIST TOGGLE */
function initAuditChecklist() {
  const checklistItems = document.querySelectorAll('.checklist-item');
  const counterEl = document.getElementById('checklist-counter');
  if (!checklistItems.length || !counterEl) return;

  function updateCounter() {
    const checked = document.querySelectorAll('.checklist-item.checked').length;
    counterEl.textContent = `${checked} / ${checklistItems.length} Implemented`;
  }

  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      updateCounter();
      if (item.classList.contains('checked')) {
        showToast('🎯 Step marked as optimized!');
      }
    });
  });

  updateCounter();
}

/* 7. SOCIAL SHARING & TOAST MESSAGES */
function initSocialShareAndToast() {
  const pageUrl = window.location.href;
  const pageTitle = encodeURIComponent("How Website Performance Affects Customer Engagement and Conversions - Naina Technologies");

  const linkedinBtn = document.querySelector('.share-linkedin');
  const twitterBtn = document.querySelector('.share-twitter');
  const whatsappBtn = document.querySelector('.share-whatsapp');
  const copyBtn = document.querySelector('.share-copy');

  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, '_blank', 'width=600,height=500');
    });
  }

  if (twitterBtn) {
    twitterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${pageTitle}`, '_blank', 'width=600,height=400');
    });
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://api.whatsapp.com/send?text=${pageTitle}%20${encodeURIComponent(pageUrl)}`, '_blank');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('🔗 Article link copied to clipboard!');
      }).catch(() => {
        showToast('🔗 Link ready: ' + window.location.href);
      });
    });
  }

  // Copy code blocks
  document.querySelectorAll('.copy-code-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block-wrapper').querySelector('pre code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>✓ Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
          showToast('📋 Code copied to clipboard!');
        });
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* 8. CLAP BUTTON COUNTER */
function initClapButton() {
  const clapBtn = document.getElementById('btn-clap');
  const countEl = document.getElementById('clap-count');
  if (!clapBtn || !countEl) return;

  let claps = parseInt(localStorage.getItem('naina-blog-claps') || '148', 10);
  countEl.textContent = claps;

  clapBtn.addEventListener('click', () => {
    claps++;
    countEl.textContent = claps;
    localStorage.setItem('naina-blog-claps', claps);

    clapBtn.style.transform = 'scale(1.25)';
    setTimeout(() => {
      clapBtn.style.transform = 'scale(1)';
    }, 200);

    showToast('👏 Thanks for the support!');
  });
}

/* 9. FONT SIZE ADJUSTER */
function initFontSizeAdjuster() {
  const decreaseBtn = document.getElementById('btn-font-decrease');
  const increaseBtn = document.getElementById('btn-font-increase');
  if (!decreaseBtn || !increaseBtn) return;

  let currentScale = 1;

  increaseBtn.addEventListener('click', () => {
    if (currentScale < 1.25) {
      currentScale += 0.08;
      document.documentElement.style.setProperty('--font-size-scale', currentScale);
      showToast(`🔍 Font size: ${Math.round(currentScale * 100)}%`);
    }
  });

  decreaseBtn.addEventListener('click', () => {
    if (currentScale > 0.88) {
      currentScale -= 0.08;
      document.documentElement.style.setProperty('--font-size-scale', currentScale);
      showToast(`🔍 Font size: ${Math.round(currentScale * 100)}%`);
    }
  });
}

/* 10. BACK TO TOP BUTTON */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* 11. SEARCH MODAL */
function initSearchModal() {
  const searchModal = document.getElementById('search-modal');
  const openBtns = document.querySelectorAll('.trigger-search');
  const closeBtn = document.getElementById('close-search-btn');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  if (!searchModal) return;

  const searchableItems = [
    { title: "Core Web Vitals Breakdown (LCP, INP, CLS)", hash: "#what-is-website-performance", tag: "Engineering" },
    { title: "Why Website Performance Matters for Businesses", hash: "#why-website-performance-matters-for-businesses", tag: "Business Impact" },
    { title: "How Website Speed Affects Customer Engagement", hash: "#how-website-speed-affects-customer-engagement", tag: "UX & Engagement" },
    { title: "The Relationship Between Website Performance and Conversions", hash: "#the-relationship-between-website-performance-and-conversions", tag: "Conversions & CRO" },
    { title: "How Slow Websites Affect User Experience", hash: "#how-slow-websites-affect-user-experience", tag: "User Experience" },
    { title: "Speed vs. Revenue Interactive Calculator", hash: "#speed-revenue-calculator", tag: "Interactive Tool" },
    { title: "10-Point Website Speed Audit Checklist", hash: "#checklist-items-list", tag: "Actionable" },
    { title: "How Naina Technologies Helps Businesses Build High-Performance Websites", hash: "#how-naina-technologies-helps-businesses", tag: "Naina Services" },
    { title: "Conclusion & Key Takeaways for Business Leaders", hash: "#conclusion", tag: "Summary" }
  ];

  function openSearch() {
    searchModal.classList.add('open');
    if (searchInput) {
      searchInput.value = '';
      renderResults(searchableItems);
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  function closeSearch() {
    searchModal.classList.remove('open');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openSearch));
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Close on backdrop click
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // Shortcut Ctrl/Cmd + K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape' && searchModal.classList.contains('open')) {
      closeSearch();
    }
  });

  if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = searchableItems.filter(item => 
        item.title.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
      );
      renderResults(filtered);
    });
  }

  if (resultsContainer) {
    resultsContainer.addEventListener('click', (e) => {
      const link = e.target.closest('a.search-result-item');
      if (link && typeof window.expandBlogArticle === 'function') {
        window.expandBlogArticle();
      }
    });
  }

  function renderResults(items) {
    if (!resultsContainer) return;
    if (items.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No matching topics found.</div>';
      return;
    }
    resultsContainer.innerHTML = items.map(item => `
      <a href="${item.hash}" class="search-result-item" onclick="document.getElementById('search-modal').classList.remove('open')">
        <span style="font-size: 0.6875rem; text-transform: uppercase; font-weight: 700; color: var(--brand-primary);">${item.tag}</span>
        <h6>${item.title}</h6>
        <p>Jump to this section in the article →</p>
      </a>
    `).join('');
  }
}

/* 12. AUDIT FORM SIMULATION */
function initAuditForm() {
  const auditForms = document.querySelectorAll('.audit-sidebar-form');
  auditForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="url"], input[type="text"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (input && input.value) {
        const val = input.value;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Analyzing... ⏳';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '✓ Audit Scheduled!';
          showToast(`🚀 Speed audit initiated for ${val}! Our performance engineering team will contact you.`);
          form.reset();
        }, 1200);
      }
    });
  });
}

/* 13. COMMENT FORM SIMULATION */
function initCommentForm() {
  const commentForm = document.getElementById('comment-form');
  const commentsList = document.getElementById('comments-list');
  const commentCountEl = document.getElementById('comment-count-badge');

  if (!commentForm || !commentsList) return;

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('comment-author-name').value.trim();
    const message = document.getElementById('comment-author-text').value.trim();

    if (name && message) {
      const newComment = document.createElement('div');
      newComment.className = 'comment-card';
      newComment.innerHTML = `
        <div class="comment-header">
          <div class="comment-user">
            <div class="comment-avatar">${name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="comment-name">${name}</div>
              <div class="comment-time">Just now</div>
            </div>
          </div>
        </div>
        <p class="comment-text">${escapeHTML(message)}</p>
      `;

      commentsList.prepend(newComment);
      commentForm.reset();

      if (commentCountEl) {
        const currentCount = parseInt(commentCountEl.textContent, 10) || 14;
        commentCountEl.textContent = `${currentCount + 1} Comments`;
      }

      showToast('💬 Your comment has been posted!');
    }
  });

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

/* 14. ARTICLE FEEDBACK WIDGET */
function initFeedbackWidget() {
  const yesBtn = document.getElementById('feedback-yes');
  const noBtn = document.getElementById('feedback-no');
  const container = document.getElementById('feedback-container');

  if (yesBtn && noBtn && container) {
    yesBtn.addEventListener('click', () => {
      container.innerHTML = `<span style="color: var(--color-success); font-weight: 700;">🎉 Thank you for your feedback! We're glad you enjoyed this guide.</span>`;
      showToast('Thank you for rating this article!');
    });

    noBtn.addEventListener('click', () => {
      container.innerHTML = `<span style="color: var(--text-muted); font-weight: 600;">Thank you for your honesty. We are constantly improving our engineering guides!</span>`;
      showToast('Feedback noted. We will keep refining our research!');
    });
  }
}

/* 15. PERFORMANCE GUIDES READER MODAL */
function initGuideReaderModal() {
  const modal = document.getElementById('guide-modal');
  const closeBtn = document.getElementById('guide-modal-close');
  const footerCloseBtn = document.getElementById('guide-modal-footer-close');
  const modalTitle = document.getElementById('guide-modal-title');
  const modalCategory = document.getElementById('guide-modal-category');
  const modalBody = document.getElementById('guide-modal-body');

  if (!modal) return;

  const guidesData = {
    seo: {
      category: 'SEO & Search Rankings',
      title: 'How Website Performance Influences SEO Rankings',
      content: `
        <div class="guide-modal-callout">
          <strong>Key Takeaway:</strong> Google confirms that page speed and Core Web Vitals are direct ranking factors. Fast pages rank higher, crawl more efficiently, and minimize organic bounce rates.
        </div>

        <h3>1. Core Web Vitals as Official Ranking Signals</h3>
        <p>
          Since Google's Page Experience update, Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift) have served as direct algorithmic ranking signals for desktop and mobile search results.
        </p>
        <p>
          Google evaluates these metrics using real-world user data from the Chrome User Experience Report (CrUX). Websites that fall into the "Good" threshold across all three vitals enjoy a confirmed competitive edge over slower competitors targeting the same keywords.
        </p>

        <h3>2. Maximizing Crawl Budget Efficiency</h3>
        <p>
          Search engine bots (Googlebot, Bingbot) assign a finite "crawl budget" to every domain based on server responsiveness. When server responses (TTFB) are slow or page sizes are bloated, search spiders can only crawl a fraction of your website before their timeout quota expires.
        </p>
        <ul>
          <li><strong>Sub-200ms TTFB:</strong> Enables Googlebot to index thousands of new pages and product updates in real time.</li>
          <li><strong>Efficient Asset Delivery:</strong> Reduces bandwidth waste during crawler rendering passes.</li>
        </ul>

        <h3>3. Mobile-First Indexing & Connection Parity</h3>
        <p>
          Google predominantly indexes websites using mobile smartphone user-agents operating on simulated 4G connections. If a site relies on heavy desktop-only assets or uncompressed media, its mobile speed score drops, pulling down organic rankings across both mobile and desktop SERPs.
        </p>

        <h3>4. User Intent Signals & Dwell Time</h3>
        <p>
          When searchers click an organic result and experience an immediate delay (>3 seconds), over 53% abandon the tab and click back to Google search results (pogo-sticking). Google's ranking systems interpret rapid bounce-backs as an indicator that the page failed to fulfill user intent, progressively demoting its ranking position.
        </p>

        <h3>Actionable SEO Performance Checklist</h3>
        <ul>
          <li>Maintain LCP under 2.5 seconds on real mobile devices.</li>
          <li>Eliminate Cumulative Layout Shift (CLS &lt; 0.1) by setting explicit aspect ratios on all media.</li>
          <li>Keep server response times (TTFB) below 200ms with Redis edge caching.</li>
          <li>Leverage structured data and clean semantic HTML for lightning-fast DOM parsing.</li>
        </ul>
      `
    },
    practices: {
      category: 'Speed Optimization',
      title: 'Best Practices to Improve Website Performance',
      content: `
        <div class="guide-modal-callout">
          <strong>Key Takeaway:</strong> Modern web performance is achieved through efficient asset pipelines, global edge caching, and optimizing the critical rendering path.
        </div>

        <h3>1. Next-Gen Image Compression (AVIF & WebP)</h3>
        <p>
          Images typically account for 60% to 75% of total page weight. Replacing outdated JPEG and PNG files with AVIF and WebP reduces payload sizes by up to 85% with zero perceptible loss in visual fidelity.
        </p>
        <ul>
          <li>Use the HTML <code>&lt;picture&gt;</code> element to provide fallback support for legacy browsers.</li>
          <li>Implement responsive <code>srcset</code> attributes to serve appropriately scaled dimensions for mobile displays.</li>
          <li>Always specify explicit <code>width</code> and <code>height</code> to eliminate layout shifts.</li>
        </ul>

        <h3>2. Global CDN Edge Caching & HTTP/3</h3>
        <p>
          Deploying your website across a global Content Delivery Network (Cloudflare, AWS CloudFront, or Fastly) ensures that visitors receive cached static assets from the server geographically nearest to them, slashing network round-trip time (RTT).
        </p>
        <p>
          Enabling HTTP/3 with QUIC protocol reduces connection handshakes, overcomes packet loss over mobile connections, and delivers multiplexed asset streaming without head-of-line blocking.
        </p>

        <h3>3. Optimizing the Critical Rendering Path</h3>
        <p>
          Render-blocking resources delay the browser from painting the first pixel. Optimize your critical path using these standards:
        </p>
        <ul>
          <li><strong>Inline Critical CSS:</strong> Extract and inline the styles required for above-the-fold content directly into the <code>&lt;head&gt;</code>.</li>
          <li><strong>Defer Non-Critical CSS:</strong> Load supplementary stylesheets asynchronously using <code>rel="preload"</code> and <code>onload="this.rel='stylesheet'"</code>.</li>
          <li><strong>Defer JavaScript Execution:</strong> Add the <code>defer</code> attribute to all non-essential script tags or load them as ES Modules.</li>
        </ul>

        <h3>4. Server Response Time (TTFB &lt; 200ms)</h3>
        <p>
          Time to First Byte (TTFB) is the foundation of all subsequent loading stages. Implement server-side micro-caching (Redis, Memcached), optimize database SQL queries, and activate Brotli compression (which compresses text assets 20% more efficiently than standard Gzip).
        </p>
      `
    },
    tools: {
      category: 'Testing & Telemetry Tools',
      title: 'Tools to Measure Website Performance',
      content: `
        <div class="guide-modal-callout">
          <strong>Key Takeaway:</strong> Accurate performance engineering requires combining synthetic lab tests (diagnostics) with Real User Monitoring (field data).
        </div>

        <h3>1. Google PageSpeed Insights & Lighthouse</h3>
        <p>
          Google PageSpeed Insights is the definitive industry tool for testing Core Web Vitals. It combines two vital data perspectives:
        </p>
        <ul>
          <li><strong>Lab Data (Lighthouse):</strong> Analyzes performance in a controlled simulated mobile environment, providing actionable diagnostic suggestions.</li>
          <li><strong>Field Data (CrUX):</strong> Reports real-world experience metrics gathered from millions of actual Chrome users over the past 28-day rolling window.</li>
        </ul>

        <h3>2. WebPageTest: Deep Waterfall Forensics</h3>
        <p>
          WebPageTest remains the gold standard for deep architectural debugging. It allows performance engineers to:
        </p>
        <ul>
          <li>Test from dozens of real device locations around the globe on various network speeds (3G, 4G, Cable).</li>
          <li>Inspect detailed request waterfalls to identify blocking third-party scripts, DNS lookup latencies, and TLS negotiation overhead.</li>
          <li>Generate visual frame-by-frame filmstrips to evaluate perceived visual completion.</li>
        </ul>

        <h3>3. GTmetrix: Structure & Speed Grading</h3>
        <p>
          GTmetrix combines Lighthouse performance audits with structural page architecture checks. It generates comprehensive summary reports, tracks historical speed trends over time, and highlights uncompressed assets and missing cache headers.
        </p>

        <h3>4. Chrome DevTools (Performance & Network Panels)</h3>
        <p>
          Built directly into the Google Chrome browser, DevTools provides real-time profiling capabilities:
        </p>
        <ul>
          <li><strong>Performance Panel:</strong> Identifies Long Tasks (&gt;50ms) blocking the main thread, helping optimize Interaction to Next Paint (INP).</li>
          <li><strong>Network Panel:</strong> Shows resource transfer sizes, HTTP response codes, and cache hit/miss status.</li>
          <li><strong>Coverage Tab:</strong> Pinpoints unused CSS and JavaScript that can be safely tree-shaken.</li>
        </ul>

        <h3>5. Real User Monitoring (RUM)</h3>
        <p>
          For enterprise applications, integrating continuous Real User Monitoring via services like Datadog, New Relic, or SpeedCurve ensures that every performance regression in production is detected and alerted immediately before impacting revenue.
        </p>
      `
    }
  };

  // Open modal handlers
  document.querySelectorAll('.guide-open-btn, .guide-trigger-link').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const guideKey = trigger.getAttribute('data-guide');
      const data = guidesData[guideKey];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalCategory.textContent = data.category;
      modalBody.innerHTML = data.content;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      showToast(`📖 Reading: ${data.title}`);
    });
  });

  // Close modal handlers
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* 16. INSTAGRAM EMBED PROCESSING */
function initInstagramEmbeds() {
  if (window.instgrm && window.instgrm.Embeds) {
    try {
      window.instgrm.Embeds.process();
    } catch (e) {
      console.warn('Instagram embeds initialization:', e);
    }
  } else {
    window.addEventListener('load', () => {
      if (window.instgrm && window.instgrm.Embeds) {
        try {
          window.instgrm.Embeds.process();
        } catch (e) {
          console.warn('Instagram embeds load:', e);
        }
      }
    });
  }
}
