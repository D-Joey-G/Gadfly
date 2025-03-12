/**
 * Hyper-Platonic Tooltip Integration
 * 
 * This script automatically scans forum post content for philosophical terms
 * from the glossary and adds tooltips with definitions.
 */

// Load the philosophical glossary
let philosophicalTerms = [];

async function loadGlossary() {
  try {
    const response = await fetch('philosophical_glossary.json');
    const data = await response.json();
    philosophicalTerms = data.terms;
    processForumPosts();
  } catch (error) {
    console.error('Error loading philosophical glossary:', error);
  }
}

// Process all forum posts to add tooltips
function processForumPosts() {
  const postBodies = document.querySelectorAll('.post-body');
  
  postBodies.forEach(postBody => {
    const content = postBody.innerHTML;
    let newContent = content;
    
    // Sort terms by length (longest first) to prevent partial matches
    const sortedTerms = [...philosophicalTerms].sort((a, b) => 
      b.term.length - a.term.length
    );
    
    // Replace terms with tooltip spans
    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.term}\\b`, 'gi');
      newContent = newContent.replace(regex, match => 
        `<span class="philosophical-term" 
              data-definition="${term.definition}" 
              data-related-dialogues="${term.related_dialogues.join(', ')}">
          ${match}
        </span>`
      );
    });
    
    postBody.innerHTML = newContent;
  });
  
  // Add event listeners for tooltip interactions
  document.querySelectorAll('.philosophical-term').forEach(term => {
    term.addEventListener('click', (e) => {
      e.preventDefault();
      showDetailedTooltip(term);
    });
  });
}

// Show a more detailed tooltip in a modal when clicked
function showDetailedTooltip(termElement) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('term-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'term-modal';
    modal.classList.add('term-modal');
    modal.innerHTML = `
      <div class="term-modal-content">
        <span class="term-modal-close">&times;</span>
        <h3 class="term-modal-title"></h3>
        <p class="term-modal-definition"></p>
        <div class="term-modal-dialogues">
          <h4>Related Dialogues:</h4>
          <ul class="term-modal-dialogue-list"></ul>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add close functionality
    modal.querySelector('.term-modal-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Populate modal with term data
  const term = termElement.textContent.trim();
  const definition = termElement.getAttribute('data-definition');
  const relatedDialogues = termElement.getAttribute('data-related-dialogues').split(', ');
  
  modal.querySelector('.term-modal-title').textContent = term;
  modal.querySelector('.term-modal-definition').textContent = definition;
  
  const dialogueList = modal.querySelector('.term-modal-dialogue-list');
  dialogueList.innerHTML = '';
  relatedDialogues.forEach(dialogue => {
    const li = document.createElement('li');
    li.textContent = dialogue;
    dialogueList.appendChild(li);
  });
  
  // Show the modal
  modal.style.display = 'block';
}

// Add CSS for the modal
function addModalStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .term-modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .term-modal-content {
      background-color: #F5F5F5;
      margin: 15% auto;
      padding: 20px;
      border: 1px solid #8B5A2B;
      border-radius: 5px;
      width: 70%;
      max-width: 500px;
      position: relative;
    }
    
    .term-modal-close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .term-modal-title {
      color: #8B5A2B;
      border-bottom: 1px solid #DDD;
      padding-bottom: 8px;
      margin-top: 0;
    }
    
    .term-modal-definition {
      margin: 15px 0;
      line-height: 1.5;
    }
    
    .term-modal-dialogues h4 {
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .term-modal-dialogue-list {
      margin: 0;
      padding-left: 20px;
    }
    
    .term-modal-dialogue-list li {
      margin-bottom: 3px;
    }
  `;
  document.head.appendChild(styleSheet);
}

// Add forum enhancement functions
function enhanceForumExperience() {
  // Add user reputation indicators
  document.querySelectorAll('.post-sidebar').forEach(sidebar => {
    const username = sidebar.querySelector('.username').textContent.trim();
    
    // Calculate reputation based on character's importance
    let reputation = 1; // Default
    
    // Philosophers get more reputation
    if (username === 'Socrates') reputation = 5;
    else if (['Parmenides', 'Protagoras', 'Gorgias'].includes(username)) reputation = 4;
    else if (['Glaucon', 'Phaedrus', 'Timaeus'].includes(username)) reputation = 3;
    else if (['Crito', 'Cebes', 'Simmias'].includes(username)) reputation = 2;
    
    // Create reputation indicators
    const reputationDiv = document.createElement('div');
    reputationDiv.className = 'user-reputation';
    
    for (let i = 0; i < reputation; i++) {
      const point = document.createElement('div');
      point.className = 'reputation-point';
      
      // Add different colors based on level
      if (i >= 4) point.classList.add('gold');
      else if (i >= 2) point.classList.add('silver');
      
      reputationDiv.appendChild(point);
    }
    
    // Insert after username
    const usernameEl = sidebar.querySelector('.username');
    usernameEl.parentNode.insertBefore(reputationDiv, usernameEl.nextSibling);
  });
  
  // Add Greek iconography to categories
  document.querySelectorAll('.category-header').forEach(header => {
    const category = header.textContent.trim();
    let iconClass = 'icon-column'; // Default
    
    if (category.includes('Ethics')) iconClass = 'icon-owl';
    else if (category.includes('Metaphysics')) iconClass = 'icon-scroll';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'greek-icon-wrapper';
    iconSpan.innerHTML = `<span class="greek-icon ${iconClass}"></span>`;
    
    header.insertBefore(iconSpan, header.firstChild);
  });
  
  // Add timestamps that show relative time
  document.querySelectorAll('.post-header').forEach(header => {
    const timeSpan = header.querySelector('span:first-child');
    if (timeSpan) {
      const originalTime = timeSpan.textContent;
      timeSpan.setAttribute('title', originalTime);
      timeSpan.textContent = `Posted: ${originalTime} (2400 years ago)`;
    }
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  addModalStyles();
  loadGlossary();
  enhanceForumExperience();
});