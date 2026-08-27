// ── SCROLL REVEAL ──
// This script makes elements fade in as you scroll down the page.
// It works by checking the position of each element on the screen
// every time the user scrolls.

// STEP 1: Collect all elements that have the class "reveal".
// These are the elements we want to animate into view.
var revealElements = document.querySelectorAll(".reveal");

// STEP 2: Define the function that checks which elements are visible.
function revealOnScroll() {
  // Loop through every reveal element one by one.
  revealElements.forEach(function (element) {
    // getBoundingClientRect() gives us the element's position
    // relative to the visible screen (the viewport).
    // .top = how many pixels from the top of the screen the element is.
    let distanceFromTop = element.getBoundingClientRect().top;

    // window.innerHeight = the total height of the visible screen area.
    // We subtract 80px so the element starts animating just
    // before it fully enters the screen — feels more natural.
    let triggerPoint = window.innerHeight - 80;

    // If the element is within the visible screen area, show it.
    if (distanceFromTop < triggerPoint) {
      element.classList.add("visible");
    }
  });
}

// STEP 3: Run the function once right away when the page loads.
// This makes sure any elements already on screen appear immediately
// without needing to scroll first.
revealOnScroll();

// STEP 4: Run the function every time the user scrolls.
// Each scroll event re-checks all elements and reveals any new ones.
window.addEventListener("scroll", revealOnScroll);
