// contact.js - Form submission handling for WhiskersWander contact page

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get references to both forms
    const contactForm = document.getElementById('contact-form');
    const mailingForm = document.getElementById('mailing-form');

    // Contact form submission handler
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Collect form data
            const firstName = document.getElementById('contactFirstName').value;
            const lastName = document.getElementById('contactLastName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Format email body with line breaks for better readability
            const emailBody = `First Name: ${encodeURIComponent(firstName)}%0D%0A` +
                             `Last Name: ${encodeURIComponent(lastName)}%0D%0A` +
                             `Email: ${encodeURIComponent(email)}%0D%0A` +
                             `%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;
            
            // Create mailto link with form data
            const mailtoLink = `mailto:evaisveryverygood@gmail.com?subject=${encodeURIComponent(subject)}&body=${emailBody}`;
            
            // Open the email client
            window.location.href = mailtoLink;
            
            // Reset form after submission
            contactForm.reset();
            
            // Optional: Show confirmation message
            alert('Thank you for your message! Your email client will open to send this information.');
        });
    }

    // Mailing list form submission handler
    if (mailingForm) {
        mailingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Collect form data
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value || 'Not provided';
            
            // Format email body
            const emailBody = `First Name: ${encodeURIComponent(firstName)}%0D%0A` +
                             `Last Name: ${encodeURIComponent(lastName)}%0D%0A` +
                             `Email: ${encodeURIComponent(email)}%0D%0A` +
                             `Phone: ${encodeURIComponent(phone)}%0D%0A` +
                             `%0D%0APlease add me to your mailing list.`;
            
            // Create mailto link for subscription
            const mailtoLink = `mailto:evaisveryverygood@gmail.com?subject=New Mailing List Subscription&body=${emailBody}`;
            
            // Open the email client
            window.location.href = mailtoLink;
            
            // Reset form after submission
            mailingForm.reset();
            
            // Optional: Show confirmation message
            alert('Thank you for subscribing to our mailing list!');
        });
    }

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});