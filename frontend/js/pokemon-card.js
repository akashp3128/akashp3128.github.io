// Pokemon card interactivity
const card = document.getElementById('pokemonCard');
const cardInner = document.querySelector('.card-inner');
const holoEffect = document.querySelectorAll('.holo-effect');
const holoOverlay = document.querySelectorAll('.holo-overlay');
const sparkles = document.querySelectorAll('.sparkles');

console.log('Card elements:', { 
    card: card, 
    cardInner: cardInner, 
    holoEffect: holoEffect.length, 
    holoOverlay: holoOverlay.length, 
    sparkles: sparkles.length 
});

// Card flip functionality
function setupCardFlipping() {
    const pokemonCard = document.getElementById('pokemonCard');
    const cardInner = document.querySelector('.card-inner');
    
    if (!pokemonCard || !cardInner) {
        console.error('Pokemon card elements not found');
        return;
    }
    
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
        
        // Calculate rotation based on mouse position (max ±15 degrees)
        const rotateY = mouseX * 15;
        const rotateX = -mouseY * 15;
        
        // Apply the transform to the card
        card.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.05, 1.05, 1.05)`;
        
        // Apply rainbow effect based on mouse position
        holoEffect.forEach(effect => {
            // Shift the linear gradient based on mouse position
            const gradientX = 50 + (mouseX * 30);
            const gradientY = 50 + (mouseY * 30);
            
            effect.style.background = `
              linear-gradient(
                ${135 + mouseX * 30}deg, 
                rgba(255, 0, 0, 0.5) 0%, 
                rgba(255, 255, 0, 0.5) 10%, 
                rgba(0, 255, 0, 0.5) 20%, 
                rgba(0, 255, 255, 0.5) 30%, 
                rgba(0, 0, 255, 0.5) 40%, 
                rgba(255, 0, 255, 0.5) 50%, 
                rgba(255, 0, 0, 0.5) 60%, 
                rgba(255, 255, 0, 0.5) 70%, 
                rgba(0, 255, 0, 0.5) 80%, 
                rgba(0, 255, 255, 0.5) 90%, 
                rgba(0, 0, 255, 0.5) 100%
              )
            `;
            effect.style.backgroundPosition = `${gradientX}% ${gradientY}%`;
            effect.style.opacity = '0.5';
            effect.style.filter = 'contrast(140%) brightness(120%)';
        });
        
        // Show sparkles with mouse movement
        sparkles.forEach(sparkle => {
            sparkle.style.opacity = '0.3';
            sparkle.style.backgroundPosition = `${50 + mouseX * 50}% ${50 + mouseY * 50}%`;
        });
        
        // Enhance holographic overlay
        holoOverlay.forEach(overlay => {
            overlay.style.opacity = '0.4';
            overlay.style.backgroundPosition = `${-mouseX * 20}px ${-mouseY * 20}px`;
        });
    } else {
        // Reset card when mouse is far away
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
        
        holoEffect.forEach(effect => {
            effect.style.opacity = '0.3';
        });
        
        sparkles.forEach(sparkle => {
            sparkle.style.opacity = '0';
        });
        
        holoOverlay.forEach(overlay => {
            overlay.style.opacity = '0.2';
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
                    rgba(255, 0, 0, 0.3) 0%, 
                    rgba(255, 255, 0, 0.3) 10%, 
                    rgba(0, 255, 0, 0.3) 20%, 
                    rgba(0, 255, 255, 0.3) 30%, 
                    rgba(0, 0, 255, 0.3) 40%, 
                    rgba(255, 0, 255, 0.3) 50%, 
                    rgba(255, 0, 0, 0.3) 60%, 
                    rgba(255, 255, 0, 0.3) 70%, 
                    rgba(0, 255, 0, 0.3) 80%, 
                    rgba(0, 255, 255, 0.3) 90%, 
                    rgba(0, 0, 255, 0.3) 100%
                  )
                `;
            });
        }
    }, 50);
} 