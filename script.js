// Import roughjs using esm.sh (converts npm packages to ES modules)
import roughjs from 'https://esm.sh/roughjs@latest';
// Handle different export formats
const rough = roughjs.default || roughjs.rough || roughjs;

// Audio and mute state management
let isMuted = false;
let audioContext = null;
let hasInteracted = false;

// Initialize audio context on user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Play squeak sound
function playSqueak() {
    if (isMuted || !hasInteracted) return;

    const audio = new Audio('assets/squeak.wav');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio play failed:', err));
}

// Unmute rat button interaction
function setupUnmuteRat() {
    const unmuteButton = document.getElementById('unmuteRat');
    const muteToggle = document.getElementById('muteToggle');

    if (!unmuteButton || !muteToggle) return;

    unmuteButton.addEventListener('click', () => {
        // Mark that user has interacted
        hasInteracted = true;

        // Initialize audio context
        initAudioContext();

        // Change to running rat image
        unmuteButton.classList.add('running');

        // Start animation after a brief moment
        setTimeout(() => {
            unmuteButton.classList.add('animate-fall');

            // Play squeak sound as rat starts scurrying (after it lands)
            setTimeout(() => {
                playSqueak();
            }, 350); // Play sound when rat starts scurrying horizontally

            // Remove button and show mute toggle after animation completes
            setTimeout(() => {
                unmuteButton.remove();
                muteToggle.classList.remove('hidden');
            }, 1000);
        }, 50);
    });
}

// Mute toggle functionality
function setupMuteToggle() {
    const muteToggle = document.getElementById('muteToggle');
    if (!muteToggle) return;

    muteToggle.addEventListener('click', () => {
        isMuted = !isMuted;

        if (isMuted) {
            muteToggle.classList.add('muted');
        } else {
            muteToggle.classList.remove('muted');
        }
    });
}

// Initialize Variables: 358
let ratsScore = 0;
let newyorkersScore = 0;
const processedSteps = new Set();


// Initialize Scrollama
const scroller = scrollama();

// Tally mark creation function with rough.js
function createTallyMark(group, index) {
    // Scale up positions by 25%
    const scale = 1.25;
    const baseX = 20;
    const spacing = 18;
    const x = baseX + (index % 5) * spacing * scale;
    const y1 = Math.floor(index / 5) * 30 * scale + 15;
    const y2 = y1 + 25 * scale;

    // Check if rough is available
    if (!rough) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('tally-mark');

        if ((index + 1) % 5 === 0 && index > 0) {
            const groupRow = Math.floor(index / 5);
            line.setAttribute('x1', baseX - 5);
            line.setAttribute('y1', groupRow * 30 * scale + 12);
            line.setAttribute('x2', baseX + (4 * spacing * scale) + 5);
            line.setAttribute('y2', groupRow * 30 * scale + 12 + (25 * scale));
            line.classList.add('diagonal');
        } else {
            line.setAttribute('x1', x);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y2);
            line.classList.add('vertical');
        }
        return line;
    }

    // Use rough.js to draw hand-drawn tally marks
    const rc = rough.svg(group);

    // Every 5th mark is diagonal
    if ((index + 1) % 5 === 0 && index > 0) {
        const groupRow = Math.floor(index / 5);
        const x1 = baseX - 5;
        const y1 = groupRow * 30 * scale + 12;
        const x2 = baseX + (4 * spacing * scale) + 5;
        const y2 = groupRow * 30 * scale + 12 + (25 * scale);

        const roughLine = rc.line(x1, y1, x2, y2, {
            stroke: 'currentColor',
            strokeWidth: 4,
            roughness: 1.2,
            bowing: 1.5,
        });
        roughLine.classList.add('tally-mark', 'diagonal');
        return roughLine;
    } else {
        // Vertical marks
        const roughLine = rc.line(x, y1, x, y2, {
            stroke: 'currentColor',
            strokeWidth: 4,
            roughness: 1.2,
            bowing: 1.5,
        });
        roughLine.classList.add('tally-mark', 'vertical');
        return roughLine;
    }
}



// Add tally function
function addTally(winner) {
    if (winner === 'rats') {
        const tallyContainer = document.querySelector('#ratsTally svg');
        const newMark = createTallyMark(tallyContainer, ratsScore);
        tallyContainer.appendChild(newMark);

        // Trigger animation
        setTimeout(() => {
            newMark.classList.add('animate');
        }, 50);

        ratsScore++;
        document.getElementById('ratsScore').textContent = ratsScore;
    } else if (winner === 'newyorkers') {
        const tallyContainer = document.querySelector('#newyorkersTally svg');
        const newMark = createTallyMark(tallyContainer, newyorkersScore);
        tallyContainer.appendChild(newMark);

        // Trigger animation
        setTimeout(() => {
            newMark.classList.add('animate');
        }, 50);

        newyorkersScore++;
        document.getElementById('newyorkersScore').textContent = newyorkersScore;
    }
}

// Remove tally function
function removeTally(winner) {
    if (winner === 'rats') {
        const tallyContainer = document.querySelector('#ratsTally svg');
        const marks = tallyContainer.querySelectorAll('.tally-mark');
        if (marks.length > 0) {
            marks[marks.length - 1].remove();
            ratsScore--;
            document.getElementById('ratsScore').textContent = ratsScore;
        }
    } else if (winner === 'newyorkers') {
        const tallyContainer = document.querySelector('#newyorkersTally svg');
        const marks = tallyContainer.querySelectorAll('.tally-mark');
        if (marks.length > 0) {
            marks[marks.length - 1].remove();
            newyorkersScore--;
            document.getElementById('newyorkersScore').textContent = newyorkersScore;
        }
    }
}

// Reset tallies function
function resetTallies() {
    // Clear SVG containers
    document.querySelector('#ratsTally svg').innerHTML = '';
    document.querySelector('#newyorkersTally svg').innerHTML = '';

    // Reset scores
    ratsScore = 0;
    newyorkersScore = 0;
    document.getElementById('ratsScore').textContent = '0';
    document.getElementById('newyorkersScore').textContent = '0';

    // Clear processed steps
    processedSteps.clear();
}

// Rebuild tallies up to current step
// Rebuild tallies up to current step
function rebuildTallies(currentStep) {
    const events = document.querySelectorAll('.timeline-event');

    events.forEach((event) => {
        const step = parseInt(event.dataset.step);

        if (step <= currentStep && !processedSteps.has(step)) {
            const winner = event.dataset.winner;
            addTally(winner);
            processedSteps.add(step);
        }
    });
}

// Handle step enter
function handleStepEnter(response) {
    const { element, index, direction } = response;

    // Add active class to current step
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('is-active'));
    element.classList.add('is-active');

    const currentStep = parseInt(element.dataset.step);

    // Rebuild tallies based on current position
    rebuildTallies(currentStep);
}

// Handle step exit
// Handle step exit
function handleStepExit(response) {
    const { element, index, direction } = response;

    // If scrolling up and exiting from top, remove this step's tally
    if (direction === 'up') {
        const currentStep = parseInt(element.dataset.step);
        const winner = element.dataset.winner;

        // Remove this step's tally if it was processed
        if (processedSteps.has(currentStep)) {
            removeTally(winner);
            processedSteps.delete(currentStep);
        }
    }
}

// Initialize Scrollama
function init() {
    // Setup the scroller
    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);

    // Setup resize event
    window.addEventListener('resize', scroller.resize);
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Draw timeline line with rough.js
function drawTimelineLine() {
    const timelineLine = document.getElementById('timelineLine');
    if (!timelineLine) {
        console.warn('Timeline line element not found');
        return;
    }

    const container = timelineLine.closest('.timeline-container');
    if (!container) return;

    const events = container.querySelectorAll('.timeline-event');
    if (events.length === 0) return;

    // Get container dimensions and rect
    const containerHeight = container.scrollHeight;
    const containerWidth = container.offsetWidth;
    const containerRect = container.getBoundingClientRect();

    // Get first and last dots
    const firstEvent = events[0];
    const firstDot = firstEvent.querySelector('.event-dot');
    if (!firstDot) return;

    const lastEvent = events[events.length - 1];
    const lastDot = lastEvent.querySelector('.event-dot');
    if (!lastDot) return;

    // Calculate line X position (center of dots) relative to container
    const firstDotRect = firstDot.getBoundingClientRect();
    const lineX = firstDotRect.left + firstDotRect.width / 2 - containerRect.left;

    // Get relative positions within container
    const lastDotRect = lastDot.getBoundingClientRect();
    const firstDotTop = firstDotRect.top + firstDotRect.height / 2 - containerRect.top;
    const lastDotTop = lastDotRect.top + lastDotRect.height / 2 - containerRect.top;

    // Set SVG dimensions to match container
    timelineLine.setAttribute('width', containerWidth);
    timelineLine.setAttribute('height', containerHeight);
    timelineLine.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    // Clear previous line
    timelineLine.innerHTML = '';

    // Check if rough is available
    if (!rough) {
        // Fallback to normal line if rough.js not available
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', lineX);
        line.setAttribute('y1', firstDotTop);
        line.setAttribute('x2', lineX);
        line.setAttribute('y2', lastDotTop);
        line.setAttribute('stroke', '#bdc3c7');
        line.setAttribute('stroke-width', '3');
        timelineLine.appendChild(line);
        return;
    }

    // Use rough.js to draw thick sketchy timeline with wander
    const rc = rough.svg(timelineLine);

    // Draw rough vertical line - single line with subtle sketch
    const roughLine = rc.line(lineX, firstDotTop, lineX, lastDotTop, {
        stroke: '#bdc3c7',
        strokeWidth: 3,
        roughness: 0.8,
        bowing: 1,
    });
    timelineLine.appendChild(roughLine);

    // Draw dots at each event point
    events.forEach((event) => {
        const dot = event.querySelector('.event-dot');
        if (!dot) return;

        const dotRect = dot.getBoundingClientRect();
        const dotCenterX = dotRect.left + dotRect.width / 2 - containerRect.left;
        const dotCenterY = dotRect.top + dotRect.height / 2 - containerRect.top;

        // Check if this event is active
        const isActive = event.classList.contains('is-active');

        // Draw a simple rough circle
        const roughCircle = rc.circle(dotCenterX, dotCenterY, isActive ? 14 : 12, {
            stroke: isActive ? '#242424' : '#bdc3c7',
            strokeWidth: 2,
            roughness: 0.8,
            fill: isActive ? '#242424' : 'white',
            fillStyle: 'solid',
        });
        timelineLine.appendChild(roughCircle);
    });
}

// Rat Swarm
let ratSwarmTriggered = false;

function createRatSwarm() {
    if (ratSwarmTriggered) return;
    ratSwarmTriggered = true;

    const swarmContainer = document.getElementById('ratSwarm');
    if (!swarmContainer) return;

    // 15-20 rats
    const numRats = 15 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numRats; i++) {
        setTimeout(() => {
            const rat = document.createElement('img');
            rat.src = 'assets/running-rat.png';
            rat.className = 'rat-swarm-rat';

            // bottom 5% of screen
            const bottomPosition = Math.random() * 5;
            rat.style.bottom = `${bottomPosition}vh`;

            const delay = Math.random() * 0.5;
            const duration = 0.8 + Math.random() * 0.7;

            rat.style.animation = `ratScurry ${duration}s cubic-bezier(0.4, 0, 0.6, 1) ${delay}s forwards`;

            swarmContainer.appendChild(rat);

            setTimeout(() => {
                rat.remove();
            }, (delay + duration) * 1000 + 100);
        }, i * 50);
    }
}

function setupBottomScrollDetection() {
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const clientHeight = window.innerHeight;

                // Check if user is near bottom (within 100px)
                if (scrollTop + clientHeight >= scrollHeight - 100) {
                    createRatSwarm();
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}


// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize unmute rat and mute toggle
    setupUnmuteRat();
    setupMuteToggle();

    // Initialize bottom scroll detection for rat swarm
    setupBottomScrollDetection();

    init();

    // Draw timeline line after layout is complete
    // Use requestAnimationFrame to ensure layout is calculated
    requestAnimationFrame(() => {
        setTimeout(() => {
            drawTimelineLine();
            // Redraw on resize
            window.addEventListener('resize', () => {
                setTimeout(drawTimelineLine, 100);
            });
        }, 300);
    });
});

// Optional: Add intersection observer for fade-in effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe intro text
document.addEventListener('DOMContentLoaded', () => {
    const introText = document.querySelector('.intro-text');
    if (introText) {
        observer.observe(introText);
    }

    // Set up scroll animation for contestant images
    setupContestantImageAnimation();
});

// Animate contestant images from intro to tally sections
function setupContestantImageAnimation() {
    const introSection = document.querySelector('.intro');
    const scrollySection = document.querySelector('.scrolly');
    const ratImageIntro = document.getElementById('ratImage');
    const nyImageIntro = document.getElementById('nyImage');
    const ratImageTally = document.getElementById('ratImageTally');
    const nyImageTally = document.getElementById('nyImageTally');
    const ratTallySection = document.querySelector('.tally-rats');
    const nyTallySection = document.querySelector('.tally-newyorkers');

    let bellsPlayed = false; // Track if bells have been played

    if (!introSection || !scrollySection || !ratImageIntro || !nyImageIntro) return;

    // Create intersection observer for when scrolly section comes into view
    const scrollyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When scrolly section is visible, move images to tally sections
                introSection.classList.add('images-moved');
                if (ratTallySection) ratTallySection.classList.add('images-moved');
                if (nyTallySection) nyTallySection.classList.add('images-moved');

                // Play bells sound once when images expand
                if (!bellsPlayed && hasInteracted && !isMuted) {
                    const bellsAudio = new Audio('assets/bells.wav');
                    bellsAudio.volume = 0.6;
                    bellsAudio.play().catch(err => console.log('Bells audio play failed:', err));
                    bellsPlayed = true;
                }
            } else {
                // When scrolly section is not visible, show images in intro
                introSection.classList.remove('images-moved');
                if (ratTallySection) ratTallySection.classList.remove('images-moved');
                if (nyTallySection) nyTallySection.classList.remove('images-moved');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    scrollyObserver.observe(scrollySection);
}