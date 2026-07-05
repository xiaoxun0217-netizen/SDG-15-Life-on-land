    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    mobileMenuBtn.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.header-inner') && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.classList.remove('active');
      }
    });
    
    // Progress bar
    window.onscroll = function() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.getElementById("progressBar").style.width = scrolled + "%";
      
      // Show/hide back to top button
      const backToTop = document.querySelector('.back-to-top');
      if (winScroll > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };
    
    // Animate stats
    function animateStats() {
      const statItems = document.querySelectorAll('.stat-item');
      statItems.forEach(item => {
        const numberElement = item.querySelector('.stat-number');
        const target = parseInt(numberElement.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          numberElement.textContent = Math.floor(current);
        }, 30);
      });
    }
    
    // Intersection Observer for stats animation
    const statsSection = document.querySelector('.stats');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    if (statsSection) {
      observer.observe(statsSection);
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('.newsletter-input').value;
        alert(`Thank you for subscribing with ${email}! We'll keep you updated on our conservation efforts.`);
        this.reset();
      });
    }

    // Donation Modal Functions (Global)
    function openDonationModal() {
      const modal = document.getElementById('donationModal');
      if (modal) {
        modal.style.display = 'block';
      }
    }

    function closeDonationModal() {
      const modal = document.getElementById('donationModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }

    function processDonation() {
      const input = document.getElementById('modalAmountInput');
      const amount = input ? input.value : '';
      if (amount && amount > 0) {
        alert(`Thank you so much! ❤️\n\nWe have registered your support of RM ${amount}.\n\nYour contribution goes directly towards terrestrial ecosystem protection!`);
        closeDonationModal();
        if (input) input.value = '';
      } else {
        alert('Please enter a valid donation amount.');
      }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
      const modal = document.getElementById('donationModal');
      if (modal && event.target === modal) {
        modal.style.display = 'none';
      }
    };