    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuBtn && mainNav) {
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
    }
    
    // Progress bar
    window.onscroll = function() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const progressBar = document.getElementById("progressBar");
      
      if (progressBar) {
        progressBar.style.width = scrolled + "%";
      }
      
      // Show/hide back to top button
      const backToTop = document.querySelector('.back-to-top');
      if (backToTop && winScroll > 300) {
        backToTop.classList.add('visible');
      } else if (backToTop) {
        backToTop.classList.remove('visible');
      }
    };
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const firstName = document.getElementById('first-name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        
        // In a real implementation, you would send this data to a server
        // For this demo, we'll just show a success message
        alert(`Thank you ${firstName}! Your message has been received. We'll respond to you at ${email} regarding your ${subject} inquiry.`);
        
        // Reset the form
        contactForm.reset();
      });
    }