// Pokemon card interactivity
const card = document.getElementById('pokemonCard');
const cardInner = document.querySelector('.card-inner');
const holoEffect = document.querySelectorAll('.holo-effect');
const holoOverlay = document.querySelectorAll('.holo-overlay');
const sparkles = document.querySelectorAll('.sparkles');

console.log('Pokemon Card Debug: Script loaded.');
console.log('Card elements detected:', { 
    card: card ? 'Found' : 'Missing', 
    cardInner: cardInner ? 'Found' : 'Missing', 
    holoEffect: holoEffect.length, 
    holoOverlay: holoOverlay.length, 
    sparkles: sparkles.length 
});

// Card flip functionality
function setupCardFlipping() {
    const pokemonCard = document.getElementById('pokemonCard');
    const cardInner = document.querySelector('.card-inner');
    
    if (!pokemonCard || !cardInner) {
        console.error('Pokemon card elements not found - unable to set up flip functionality');
        console.error('pokemonCard:', pokemonCard);
        console.error('cardInner:', cardInner);
        return;
    }
    
    console.log('Pokemon Card: Setting up flip functionality');
    
    // Method to check if an element is related to admin functionality
    function isAdminElement(element) {
        return (
            element.id === 'adminToggle' || 
            element.closest('#adminToggle') || 
            element.closest('#adminPanel') ||
            element.closest('.modal') ||
            element.closest('.admin-only') ||
            element.closest('.admin-panel') ||
            element.closest('button[id$="Btn"]') ||
            element.classList.contains('btn') ||
            element.closest('.btn')
        );
    }
    
    // Simple click handler for card flipping
    pokemonCard.addEventListener('click', function(event) {
        // Check if the click is on admin-related elements
        if (isAdminElement(event.target)) {
            // Do not process card flip for admin elements
            event.stopPropagation();
            console.log('Admin element clicked, ignoring card flip');
            return;
        }
        
        console.log('Card clicked for flipping');
        
        // Add a temporary class to prevent hover effects during flip
        cardInner.classList.add('flipping');
        
        // Toggle the flipped state
        cardInner.classList.toggle('flipped');
        console.log('Card flipped state:', cardInner.classList.contains('flipped'));
        
        // Play flip sound effect
        const flipSound = new Audio('assets/sounds/flip.mp3');
        flipSound.volume = 0.5;
        flipSound.play().catch(e => {
            console.log('Sound play error:', e);
            // If sound fails to play, add an additional visual effect as fallback
            cardInner.style.animation = 'none';
            setTimeout(() => {
                cardInner.style.animation = 'card-pulse 0.8s';
            }, 10);
        });
        
        // Remove the flipping class after animation completes
        setTimeout(() => {
            cardInner.classList.remove('flipping');
        }, 800); // Match the animation duration
    });
}

// Add method to manually reset card to front
window.resetCardToFront = function() {
    const cardInner = document.querySelector('.card-inner');
    if (cardInner && cardInner.classList.contains('flipped')) {
        cardInner.classList.remove('flipped');
        console.log('Card reset to front');
    }
};

// Make sure the card is defined in the DOM
document.addEventListener('DOMContentLoaded', function() {
    setupCardFlipping();
    
    // Initialize the pulse effect
    pulseEffect();
});

// Holographic effect on mouse move
document.addEventListener('mousemove', function(e) {
    // Skip if card or cardInner are not defined
    if (!card || !cardInner) return;
    
    // Don't apply hover effects during flip animation
    if (cardInner.classList.contains('flipping')) return;
    
    const cardRect = card.getBoundingClientRect();
    
    // Check if mouse is over or near the card
    const isNearCard = 
        e.clientX >= cardRect.left - 50 && 
        e.clientX <= cardRect.right + 50 && 
        e.clientY >= cardRect.top - 50 && 
        e.clientY <= cardRect.bottom + 50;
    
    // Skip if card is flipped
    if (cardInner.classList.contains('flipped')) {
        return;
    }
    
    if (isNearCard) {
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        
        // Calculate mouse position relative to card center (-1 to 1)
        const mouseX = ((e.clientX - cardCenterX) / (cardRect.width / 2));
        const mouseY = ((e.clientY - cardCenterY) / (cardRect.height / 2));
        
        // Calculate rotation based on mouse position (max ±12 degrees - softer rotation)
        const rotateY = mouseX * 12;
        const rotateX = -mouseY * 12;
        
        // Apply the transform to the card with smoother easing
        card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.03, 1.03, 1.03)`;
        
        // Apply holographic effect based on mouse position
        holoEffect.forEach(effect => {
            // Shift the linear gradient based on mouse position
            const gradientX = 50 + (mouseX * 20);
            const gradientY = 50 + (mouseY * 20);
            
            // Create a teal/blue/gold gradient for professional look
            effect.style.background = `
              linear-gradient(
                ${135 + mouseX * 25}deg, 
                rgba(10, 126, 164, 0.5) 0%,    /* Teal */
                rgba(0, 51, 78, 0.5) 20%,      /* Deep blue */
                rgba(255, 193, 7, 0.6) 40%,    /* Gold */
                rgba(10, 126, 164, 0.5) 60%,   /* Teal */
                rgba(0, 51, 78, 0.5) 80%,      /* Deep blue */
                rgba(255, 193, 7, 0.5) 100%    /* Gold */
              )
            `;
            effect.style.backgroundPosition = `${gradientX}% ${gradientY}%`;
            effect.style.opacity = '0.6';
            effect.style.filter = 'contrast(120%) brightness(110%)';
        });
        
        // Show sparkles with mouse movement
        sparkles.forEach(sparkle => {
            sparkle.style.opacity = '0.3';
            sparkle.style.backgroundPosition = `${50 + mouseX * 30}% ${50 + mouseY * 30}%`;
        });
        
        // Enhance holographic overlay
        holoOverlay.forEach(overlay => {
            overlay.style.opacity = '0.4';
            overlay.style.backgroundPosition = `${-mouseX * 10}px ${-mouseY * 10}px`;
        });
    } else {
        // Reset card when mouse is far away with smoother transition
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
        
        holoEffect.forEach(effect => {
            effect.style.opacity = '0.2';
        });
        
        sparkles.forEach(sparkle => {
            sparkle.style.opacity = '0';
        });
        
        holoOverlay.forEach(overlay => {
            overlay.style.opacity = '0.1';
        });
    }
});

// Reset when mouse leaves the window
document.addEventListener('mouseleave', function() {
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    
    holoEffect.forEach(effect => {
        effect.style.opacity = '0.3';
    });
    
    sparkles.forEach(sparkle => {
        sparkle.style.opacity = '0';
    });
});

// For mobile - add touch events to simulate hover
if (card) {
    card.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        
        const touchX = ((touch.clientX - cardCenterX) / (cardRect.width / 2));
        const touchY = ((touch.clientY - cardCenterY) / (cardRect.height / 2));
        
        holoEffect.forEach(effect => {
            effect.style.opacity = '0.7';
            effect.style.filter = 'contrast(150%) brightness(110%)';
        });
        
        sparkles.forEach(sparkle => {
            sparkle.style.opacity = '0.3';
        });
    });
}

// Add fallback animation for non-interactive environments
function pulseEffect() {
    if (!card || !holoEffect.length) return;
    
    let angle = 0;
    
    setInterval(() => {
        angle = (angle + 1) % 360;
        
        if (!card.matches(':hover')) {
            holoEffect.forEach(effect => {
                effect.style.background = `
                  linear-gradient(
                    ${angle}deg, 
                    rgba(10, 126, 164, 0.4) 0%,    /* Teal */
                    rgba(0, 51, 78, 0.5) 25%,      /* Deep blue */
                    rgba(255, 193, 7, 0.5) 50%,    /* Gold */
                    rgba(0, 51, 78, 0.5) 75%,      /* Deep blue */
                    rgba(10, 126, 164, 0.4) 100%   /* Teal */
                  )
                `;
            });
        }
    }, 50);
} 