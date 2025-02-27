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
    
    console.log('Card flip setup initialized');
    
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
    
    // Add click handlers to multiple elements for better coverage
    function handleCardClick(event) {
        // Check if the click is on admin-related elements
        if (isAdminElement(event.target)) {
            // Do not process card flip for admin elements
            console.log('Admin element clicked, ignoring card flip');
            return;
        }
        
        console.log('Card clicked for flipping');
        flipCardAnimation();
    }
    
    // Separate the flip animation logic for reusability
    function flipCardAnimation() {
        // Add a temporary class to prevent hover effects during flip
        cardInner.classList.add('flipping');
        
        // Toggle the flipped state
        cardInner.classList.toggle('flipped');
        
        // Also add/remove the card-flipped class for compatibility with debug.js
        pokemonCard.classList.toggle('card-flipped');
        
        console.log('Card flipped state:', cardInner.classList.contains('flipped'));
        
        // Play flip sound effect if available
        try {
            const flipSound = new Audio('/assets/sounds/flip.mp3');
            flipSound.volume = 0.5;
            flipSound.play().catch(e => console.log('Sound play error:', e));
        } catch (error) {
            console.log('Could not play flip sound:', error);
        }
        
        // Remove the flipping class after animation completes
        setTimeout(() => {
            cardInner.classList.remove('flipping');
        }, 800); // Match the animation duration
    }
    
    // Add click handlers to multiple elements for better coverage
    pokemonCard.addEventListener('click', handleCardClick);
    
    // Also add click handlers to child elements for better coverage
    const cardFront = pokemonCard.querySelector('.card-front');
    const cardBack = pokemonCard.querySelector('.card-back');
    
    if (cardFront) {
        cardFront.addEventListener('click', function(e) {
            if (!isAdminElement(e.target)) {
                e.stopPropagation(); // Prevent multiple triggers
                handleCardClick(e);
            }
        });
    }
    
    if (cardBack) {
        cardBack.addEventListener('click', function(e) {
            if (!isAdminElement(e.target)) {
                e.stopPropagation(); // Prevent multiple triggers
                handleCardClick(e);
            }
        });
    }
    
    // Add a direct method on the card element itself
    pokemonCard.flip = flipCardAnimation;
    
    // Add a direct flip method to the window for external calls
    window.flipCard = function() {
        if (!cardInner || !pokemonCard) return;
        
        console.log('Manual card flip triggered');
        flipCardAnimation();
    };
}

// Add method to manually reset card to front
window.resetCardToFront = function() {
    const cardInner = document.querySelector('.card-inner');
    const pokemonCard = document.getElementById('pokemonCard');
    
    if (cardInner && cardInner.classList.contains('flipped')) {
        cardInner.classList.remove('flipped');
        if (pokemonCard) pokemonCard.classList.remove('card-flipped');
        console.log('Card reset to front');
    }
};

// Make sure the card is defined in the DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up card flip');
    setupCardFlipping();
    
    // Add a debug helper button if in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const flipButton = document.createElement('button');
        flipButton.textContent = 'Test Flip Card';
        flipButton.style.position = 'fixed';
        flipButton.style.bottom = '80px';
        flipButton.style.left = '20px';
        flipButton.style.zIndex = '9999';
        flipButton.onclick = function() {
            window.flipCard();
        };
        document.body.appendChild(flipButton);
    }
    
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
        
        // Apply effect based on mouse position
        holoEffect.forEach(effect => {
            // Shift the linear gradient based on mouse position
            const gradientX = 50 + (mouseX * 30);
            const gradientY = 50 + (mouseY * 30);
            
            // Check if the card has legendary styling
            const isLegendary = card.classList.contains('legendary-type');
            const opacityLevel = isLegendary ? '0.8' : '0.7';
            const contrastLevel = isLegendary ? '140%' : '130%';
            const brightnessLevel = isLegendary ? '120%' : '110%';
            
            effect.style.background = `
              linear-gradient(
                ${135 + mouseX * 30}deg, 
                rgba(192, 28, 39, 0.7) 0%,    /* ISU Cardinal */
                rgba(0, 0, 0, 0.5) 30%,       /* Black */
                rgba(241, 190, 72, 0.7) 50%,  /* ISU Gold (only for tint) */
                rgba(0, 0, 0, 0.5) 70%,       /* Black */
                rgba(192, 28, 39, 0.7) 100%   /* ISU Cardinal */
              )
            `;
            effect.style.backgroundPosition = `${gradientX}% ${gradientY}%`;
            effect.style.opacity = opacityLevel;
            effect.style.filter = `contrast(${contrastLevel}) brightness(${brightnessLevel})`;
        });
        
        // Show sparkles with mouse movement - enhanced for legendary cards
        sparkles.forEach(sparkle => {
            const isLegendary = card.classList.contains('legendary-type');
            sparkle.style.opacity = isLegendary ? '0.5' : '0.3';
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
            const isLegendary = card && card.classList.contains('legendary-type');
            
            holoEffect.forEach(effect => {
                if (isLegendary) {
                    // Enhanced legendary fallback effect with ISU colors
                    effect.style.background = `
                      linear-gradient(
                        ${angle}deg, 
                        rgba(192, 28, 39, 0.6) 0%,    /* ISU Cardinal */
                        rgba(0, 0, 0, 0.5) 25%,       /* Black */
                        rgba(241, 190, 72, 0.6) 50%,  /* ISU Gold */
                        rgba(0, 0, 0, 0.5) 75%,       /* Black */
                        rgba(192, 28, 39, 0.6) 100%   /* ISU Cardinal */
                      )
                    `;
                    effect.style.opacity = '0.5';
                } else {
                    // Standard fallback
                    effect.style.background = `
                      linear-gradient(
                        ${angle}deg, 
                        rgba(192, 28, 39, 0.5) 0%,    /* ISU Cardinal */
                        rgba(0, 0, 0, 0.4) 30%,       /* Black */
                        rgba(241, 190, 72, 0.5) 50%,  /* ISU Gold */
                        rgba(0, 0, 0, 0.4) 70%,       /* Black */
                        rgba(192, 28, 39, 0.5) 100%   /* ISU Cardinal */
                      )
                    `;
                }
            });
        }
    }, 50);
} 