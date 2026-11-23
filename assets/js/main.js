
/* Mama Imelda's Kitchen - small front-end interactions (Vanilla JavaScript) */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ==========================================
  // FOOTER YEAR
  // ==========================================

  // Keep the footer year current without repeating it in every HTML page.
  document.querySelectorAll('.current-year').forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });


  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================

  var navToggle = document.querySelector('.nav-toggle');
  var primaryNav = document.querySelector('#primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';

      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navToggle.setAttribute(
        'aria-label',
        isOpen ? 'Open navigation' : 'Close navigation'
      );

      primaryNav.classList.toggle('is-open', !isOpen);
    });

    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation');

        primaryNav.classList.remove('is-open');
      });
    });
  }


  // ==========================================
  // MENU SEARCH AND PRICE FILTERS
  // ==========================================

  var menuGrid = document.querySelector('#menu-grid');

  if (menuGrid) {
    var activeFilter = 'all';
    var menuSearch = document.querySelector('#menu-search');
    var menuCards = menuGrid.querySelectorAll('.menu-card');
    var noResults = document.querySelector('#no-results');
    var filterButtons = document.querySelectorAll('[data-filter]');

    function filterMenu() {
      var query = (menuSearch ? menuSearch.value : '').trim().toLowerCase();
      var visibleCount = 0;

      menuCards.forEach(function (card) {
        var categoryMatches =
          activeFilter === 'all' ||
          card.getAttribute('data-category') === activeFilter;

        var nameMatches =
          (card.getAttribute('data-name') || '')
            .toLowerCase()
            .indexOf(query) !== -1;

        var shouldShow = categoryMatches && nameMatches;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter');

        filterButtons.forEach(function (filterButton) {
          filterButton.classList.remove('active');
          filterButton.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        filterMenu();
      });
    });

    if (menuSearch) {
      menuSearch.addEventListener('input', filterMenu);
    }


    // ==========================================
    // ORDER LIST
    // ==========================================

    // An on-page order list is a planning aid only; it never sends an order.
    var order = {};

    function formatPeso(amount) {
      return '₱' + Number(amount).toLocaleString('en-PH');
    }

    function orderTotals() {
      var quantity = 0;
      var total = 0;

      Object.values(order).forEach(function (item) {
        quantity += item.quantity;
        total += item.price * item.quantity;
      });

      return {
        quantity: quantity,
        total: total
      };
    }

    function renderOrder() {
      var items = document.querySelector('#drawer-items');
      var totals = orderTotals();

      if (!items) {
        return;
      }

      items.replaceChildren();

      if (totals.quantity === 0) {
        var emptyMessage = document.createElement('p');

        emptyMessage.className = 'drawer-empty';
        emptyMessage.textContent =
          'Your list is looking a little hungry. Add a bite from the menu.';

        items.appendChild(emptyMessage);

      } else {
        Object.entries(order).forEach(function (entry) {
          var name = entry[0];
          var item = entry[1];

          var line = document.createElement('div');
          line.className = 'order-line';

          var left = document.createElement('div');

          var itemName = document.createElement('div');
          itemName.className = 'order-line-name';
          itemName.textContent = name;

          left.appendChild(itemName);

          var controls = document.createElement('div');
          controls.className = 'order-line-controls';

          var decreaseButton = document.createElement('button');
          decreaseButton.type = 'button';
          decreaseButton.textContent = '−';
          decreaseButton.setAttribute('aria-label', 'Remove one ' + name);
          decreaseButton.setAttribute('data-change-item', name);
          decreaseButton.setAttribute('data-change-by', '-1');

          controls.appendChild(decreaseButton);

          var quantity = document.createElement('span');
          quantity.textContent = item.quantity;
          quantity.setAttribute('aria-label', 'Quantity');

          controls.appendChild(quantity);

          var increaseButton = document.createElement('button');
          increaseButton.type = 'button';
          increaseButton.textContent = '+';
          increaseButton.setAttribute('aria-label', 'Add one ' + name);
          increaseButton.setAttribute('data-change-item', name);
          increaseButton.setAttribute('data-change-by', '1');

          controls.appendChild(increaseButton);

          var removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.textContent = 'Remove';
          removeButton.className = 'remove-line';
          removeButton.setAttribute('data-remove-item', name);

          controls.appendChild(removeButton);
          left.appendChild(controls);

          var price = document.createElement('strong');
          price.className = 'order-line-price';
          price.textContent = formatPeso(item.price * item.quantity);

          line.appendChild(price);
          line.appendChild(left);

          items.appendChild(line);
        });
      }

      var orderCount = document.querySelector('#order-count');
      var orderTotal = document.querySelector('#order-total');
      var drawerTotal = document.querySelector('#drawer-total');
      var orderNudge = document.querySelector('#order-nudge');

      if (orderCount) {
        orderCount.textContent = totals.quantity;
      }

      if (orderTotal) {
        orderTotal.textContent = formatPeso(totals.total);
      }

      if (drawerTotal) {
        drawerTotal.textContent = formatPeso(totals.total);
      }

      if (orderNudge) {
        orderNudge.hidden = totals.quantity === 0;
      }
    }

    document.querySelectorAll('[data-add-item]').forEach(function (button) {
      button.addEventListener('click', function () {
        var name = String(button.getAttribute('data-name') || '');
        var price = Number(button.getAttribute('data-price'));

        if (!name || !Number.isFinite(price) || price < 0) {
          return;
        }

        if (!order[name]) {
          order[name] = {
            price: price,
            quantity: 0
          };
        }

        order[name].quantity += 1;

        renderOrder();

        button.classList.add('was-added');
        button.textContent = 'Added to list ✓';

        window.setTimeout(function () {
          button.classList.remove('was-added');
          button.innerHTML = 'Add to order <span>＋</span>';
        }, 950);
      });
    });

    // Event delegation handles buttons created when the order list is rendered.
    document.addEventListener('click', function (event) {
      var changeButton = event.target.closest('[data-change-item]');

      if (!changeButton) {
        return;
      }

      var name = String(changeButton.getAttribute('data-change-item'));
      var delta = Number(changeButton.getAttribute('data-change-by'));

      if (!order[name]) {
        return;
      }

      order[name].quantity += delta;

      if (order[name].quantity <= 0) {
        delete order[name];
      }

      renderOrder();
    });

    document.addEventListener('click', function (event) {
      var removeButton = event.target.closest('[data-remove-item]');

      if (!removeButton) {
        return;
      }

      delete order[String(removeButton.getAttribute('data-remove-item'))];

      renderOrder();
    });

    document.querySelectorAll('[data-open-order]').forEach(function (button) {
      button.addEventListener('click', openOrderDrawer);
    });

    document.querySelectorAll('[data-close-order]').forEach(function (button) {
      button.addEventListener('click', closeOrderDrawer);
    });
  }


  // ==========================================
  // ORDER DRAWER FUNCTIONS
  // ==========================================

  function openOrderDrawer() {
    var orderDrawer = document.querySelector('#order-drawer');

    if (!orderDrawer) {
      return;
    }

    orderDrawer.classList.add('is-open');
    orderDrawer.setAttribute('aria-hidden', 'false');

    document.body.classList.add('drawer-active');

    var closeButton = orderDrawer.querySelector('.drawer-close');

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeOrderDrawer() {
    var orderDrawer = document.querySelector('#order-drawer');

    if (!orderDrawer) {
      return;
    }

    orderDrawer.classList.remove('is-open');
    orderDrawer.setAttribute('aria-hidden', 'true');

    document.body.classList.remove('drawer-active');
  }


  // ==========================================
  // REVIEWS
  // ==========================================

  // Reviews are stored locally in this browser.
  // No server or review service is connected.

  var reviewForm = document.querySelector('#review-form');

  if (reviewForm) {
    var reviewStorageKey = 'mamaImeldasKitchenReviews';
    var reviewList = document.querySelector('#review-list');
    var reviewMessage = document.querySelector('#review-message');
    var reviewCharCount = document.querySelector('#review-char-count');
    var reviewStatus = document.querySelector('#review-status');

    function safeReviewList() {
      try {
        var parsed = JSON.parse(
          window.localStorage.getItem(reviewStorageKey) || '[]'
        );

        return Array.isArray(parsed)
          ? parsed.filter(function (entry) {
              return (
                entry &&
                typeof entry.name === 'string' &&
                typeof entry.message === 'string' &&
                Number.isInteger(entry.rating) &&
                entry.rating >= 1 &&
                entry.rating <= 5
              );
            })
          : [];

      } catch (error) {
        return [];
      }
    }

    function renderReviews() {
      var reviews = safeReviewList();

      if (!reviewList) {
        return;
      }

      reviewList.replaceChildren();

      if (!reviews.length) {
        var emptyReviews = document.createElement('div');
        emptyReviews.className = 'empty-reviews';

        var emptyStar = document.createElement('span');
        emptyStar.className = 'empty-star';
        emptyStar.textContent = '☆';

        var emptyHeading = document.createElement('h3');
        emptyHeading.textContent = "It's a fresh page.";

        var emptyText = document.createElement('p');
        emptyText.textContent =
          'No reviews have been added yet. Your note can be the first.';

        emptyReviews.appendChild(emptyStar);
        emptyReviews.appendChild(emptyHeading);
        emptyReviews.appendChild(emptyText);

        reviewList.appendChild(emptyReviews);

        return;
      }

      reviews.slice().reverse().forEach(function (review) {
        var entry = document.createElement('article');
        entry.className = 'review-entry';

        var head = document.createElement('div');
        head.className = 'review-entry-head';

        var nameGroup = document.createElement('div');

        var name = document.createElement('div');
        name.className = 'review-entry-name';
        name.textContent = review.name;

        var date = document.createElement('div');
        date.className = 'review-entry-date';
        date.textContent = review.date || 'Community note';

        nameGroup.appendChild(name);
        nameGroup.appendChild(date);

        var stars = document.createElement('div');
        stars.className = 'review-entry-stars';
        stars.textContent =
          '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        stars.setAttribute(
          'aria-label',
          review.rating + ' out of 5 stars'
        );

        head.appendChild(nameGroup);
        head.appendChild(stars);

        var message = document.createElement('p');
        message.textContent = review.message;

        entry.appendChild(head);
        entry.appendChild(message);

        reviewList.appendChild(entry);
      });
    }

    if (reviewMessage && reviewCharCount) {
      reviewMessage.addEventListener('input', function () {
        reviewCharCount.textContent =
          reviewMessage.value.length + ' / 400';
      });
    }

    reviewForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var nameInput = document.querySelector('#review-name');
      var ratingInput = document.querySelector(
        'input[name="rating"]:checked'
      );

      var name = nameInput ? nameInput.value.trim() : '';
      var message = reviewMessage ? reviewMessage.value.trim() : '';
      var rating = Number(ratingInput ? ratingInput.value : 5);

      if (!name || !message) {
        if (reviewStatus) {
          reviewStatus.textContent =
            'Please add your name and a short note first.';
        }

        return;
      }

      if (
        name.length > 40 ||
        message.length > 400 ||
        rating < 1 ||
        rating > 5
      ) {
        if (reviewStatus) {
          reviewStatus.textContent =
            'Please check your details and try again.';
        }

        return;
      }

      var reviews = safeReviewList();

      reviews.push({
        name: name,
        message: message,
        rating: rating,
        date: new Date().toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      });

      try {
        window.localStorage.setItem(
          reviewStorageKey,
          JSON.stringify(reviews)
        );

        renderReviews();

        reviewForm.reset();

        if (reviewCharCount) {
          reviewCharCount.textContent = '0 / 400';
        }

        if (reviewStatus) {
          reviewStatus.textContent =
            'Thanks for leaving a note! It is saved in this browser only.';
        }

      } catch (error) {
        if (reviewStatus) {
          reviewStatus.textContent =
            'Your browser could not save this note. Please check its storage settings.';
        }
      }
    });

    renderReviews();
  }


  // ==========================================
  // GALLERY LIGHTBOX
  // ==========================================

  // Click an image, then browse with arrows or keyboard.

  var galleryLightbox = document.querySelector('#gallery-lightbox');

  if (galleryLightbox) {
    var galleryButtons = document.querySelectorAll('.gallery-open');

    var galleryImages = Array.from(galleryButtons).map(function (button) {
      var image = button.querySelector('img');
      var card = button.closest('.gallery-card');
      var caption = card
        ? card.querySelector('figcaption strong')
        : null;

      return {
        src: image ? image.getAttribute('src') : '',
        alt: image ? image.getAttribute('alt') : '',
        caption: caption ? caption.textContent : ''
      };
    });

    var galleryIndex = 0;
    var lightboxImage = galleryLightbox.querySelector('img');
    var lightboxCaption = document.querySelector('#lightbox-caption');

    function showGalleryImage(index) {
      if (!galleryImages.length) {
        return;
      }

      galleryIndex =
        (index + galleryImages.length) % galleryImages.length;

      var image = galleryImages[galleryIndex];

      if (lightboxImage) {
        lightboxImage.setAttribute('src', image.src);
        lightboxImage.setAttribute('alt', image.alt);
      }

      if (lightboxCaption) {
        lightboxCaption.textContent =
          image.caption + ' · ' +
          (galleryIndex + 1) + ' / ' + galleryImages.length;
      }
    }

    function closeGallery() {
      galleryLightbox.classList.remove('is-open');
      galleryLightbox.setAttribute('aria-hidden', 'true');

      document.body.classList.remove('drawer-active');
    }

    galleryButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        galleryIndex = index;

        showGalleryImage(galleryIndex);

        galleryLightbox.classList.add('is-open');
        galleryLightbox.setAttribute('aria-hidden', 'false');

        document.body.classList.add('drawer-active');
      });
    });

    var nextButton = galleryLightbox.querySelector('.lightbox-next');
    var previousButton = galleryLightbox.querySelector('.lightbox-prev');
    var closeGalleryButton = galleryLightbox.querySelector('.lightbox-close');

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showGalleryImage(galleryIndex + 1);
      });
    }

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        showGalleryImage(galleryIndex - 1);
      });
    }

    if (closeGalleryButton) {
      closeGalleryButton.addEventListener('click', closeGallery);
    }

    galleryLightbox.addEventListener('click', function (event) {
      if (event.target === galleryLightbox) {
        closeGallery();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!galleryLightbox.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'ArrowRight') {
        showGalleryImage(galleryIndex + 1);
      }

      if (event.key === 'ArrowLeft') {
        showGalleryImage(galleryIndex - 1);
      }
    });
  }


  // ==========================================
  // CONTACT FORM
  // ==========================================

  // Front-end validation and a clear demo-only message.

  var contactForm = document.querySelector('#contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var nameInput = document.querySelector('#contact-name');
      var emailInput = document.querySelector('#contact-email');
      var messageInput = document.querySelector('#contact-message');
      var contactStatus = document.querySelector('#contact-status');

      var name = nameInput ? nameInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var message = messageInput ? messageInput.value.trim() : '';

      if (!name || !message) {
        if (contactStatus) {
          contactStatus.textContent =
            'Please enter your name and message.';
        }

        return;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (contactStatus) {
          contactStatus.textContent =
            'Please enter a valid email address, or leave it blank.';
        }

        if (emailInput) {
          emailInput.focus();
        }

        return;
      }

      if (contactStatus) {
        contactStatus.textContent =
          'Thanks, ' + name +
          '! This demo is not connected to an inbox, so your message has not been sent. Please visit the stall in person.';
      }

      contactForm.reset();
    });
  }


  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (navToggle && primaryNav) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation');

        primaryNav.classList.remove('is-open');
      }

      closeOrderDrawer();

      if (
        galleryLightbox &&
        galleryLightbox.classList.contains('is-open')
      ) {
        closeGallery();
      }
    }
  });

});
