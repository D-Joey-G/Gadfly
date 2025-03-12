/**
 * Hyper-Platonic Search Functionality
 * 
 * This script handles searching across all Plato's dialogues
 * for specific terms, characters, or philosophical concepts.
 */

// Data storage for search
let dialogueData = {};
let characterData = [];
let glossaryData = [];
let dialogueMetadata = {};

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeSearch();
  
  // Add event listeners
  document.getElementById('search-button').addEventListener('click', performSearch);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
});

// Load all necessary data for searching
async function initializeSearch() {
  try {
    // Load character profiles
    const charactersResponse = await fetch('character_profiles.json');
    const charactersData = await charactersResponse.json();
    characterData = charactersData.characters;
    
    // Load philosophical glossary
    const glossaryResponse = await fetch('philosophical_glossary.json');
    const glossaryData = await glossaryResponse.json();
    glossaryData = glossaryData.terms;
    
    // Load dialogue metadata
    const metadataResponse = await fetch('dialogue_metadata.json');
    dialogueMetadata = await metadataResponse.json();
    
    // Preload dialogue JSON files
    // We'll load dialogues on demand to improve initial performance
    console.log('Search functionality initialized');
  } catch (error) {
    console.error('Error initializing search:', error);
    document.getElementById('search-results').innerHTML = `
      <div class="error-message">
        Error loading search data. Please try refreshing the page.
      </div>
    `;
  }
}

// Perform the search based on user input
async function performSearch() {
  const searchInput = document.getElementById('search-input').value.trim();
  if (!searchInput) return;
  
  const searchType = document.querySelector('input[name="search-type"]:checked').value;
  
  // Show loading indicator
  document.getElementById('loading-indicator').style.display = 'block';
  document.getElementById('search-results').innerHTML = '';
  
  // Get selected filters
  const selectedCategories = Array.from(
    document.querySelectorAll('.filter-group:first-child input[type="checkbox"]:checked')
  ).map(checkbox => checkbox.value);
  
  const selectedPeriods = Array.from(
    document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]:checked')
  ).map(checkbox => checkbox.value);
  
  try {
    let results = [];
    
    // Different search approaches based on search type
    switch (searchType) {
      case 'speaker':
        results = await searchBySpeaker(searchInput, selectedCategories, selectedPeriods);
        break;
      case 'concept':
        results = await searchByPhilosophicalConcept(searchInput, selectedCategories, selectedPeriods);
        break;
      case 'all':
      default:
        results = await searchAllContent(searchInput, selectedCategories, selectedPeriods);
        break;
    }
    
    // Display results
    displaySearchResults(results, searchInput);
  } catch (error) {
    console.error('Error performing search:', error);
    document.getElementById('search-results').innerHTML = `
      <div class="error-message">
        Error performing search. Please try again.
      </div>
    `;
  } finally {
    // Hide loading indicator
    document.getElementById('loading-indicator').style.display = 'none';
  }
}

// Search all content across dialogues
async function searchAllContent(query, categories, periods) {
  const results = [];
  const dialogues = Object.keys(dialogueMetadata.dialogues);
  
  // For demo purposes, we'll simulate search results with sample data
  // In a real implementation, we would load each dialogue JSON and search through it
  
  // Example simulated results
  const simulatedResults = [
    {
      dialogue: "Republic",
      title: "Republic - Book I",
      speaker: "Socrates",
      excerpt: "And now, I said, let me show in a figure how far our nature is enlightened or unenlightened:—Behold! human beings living in an underground den, which has a mouth open towards the light and reaching all along the den; here they have been from their childhood...",
      matches: 3,
      category: "Politics"
    },
    {
      dialogue: "Phaedo",
      title: "Phaedo - On the Soul",
      speaker: "Socrates",
      excerpt: "For the body is a source of endless trouble to us by reason of the mere requirement of food; and is liable also to diseases which overtake and impede us in the search after true being: it fills us full of loves, and lusts, and fears, and fancies of all kinds...",
      matches: 2,
      category: "Metaphysics"
    },
    {
      dialogue: "Symposium",
      title: "Symposium - Socrates' Speech",
      speaker: "Socrates",
      excerpt: "This is that life above all others which man should live, in the contemplation of beauty absolute; a beauty which if you once beheld, you would see not to be after the measure of gold, and garments, and fair boys and youths, whose presence now entrances you...",
      matches: 5,
      category: "Love and Relationships"
    }
  ];
  
  return simulatedResults.filter(result => {
    // Apply category filter
    const matchesCategory = categories.some(category => 
      result.category.toLowerCase().includes(category.toLowerCase())
    );
    
    // In real implementation, we would also filter by time period
    
    return matchesCategory;
  });
}

// Search for speeches by specific characters
async function searchBySpeaker(speakerName, categories, periods) {
  // Find the character in our data
  const character = characterData.find(char => 
    char.name.toLowerCase().includes(speakerName.toLowerCase())
  );
  
  if (!character) {
    return [{
      type: 'info',
      message: `No character found matching "${speakerName}". Try searching for "Socrates", "Glaucon", etc.`
    }];
  }
  
  // In a real implementation, we would load dialogues where this character appears
  // For demo, return simulated results
  const characterDialogues = character.dialogues || [];
  
  const simulatedResults = characterDialogues.slice(0, 3).map(dialogueName => ({
    dialogue: dialogueName,
    title: `${dialogueName} - Notable Speech`,
    speaker: character.name,
    excerpt: `This is where ${character.name} would be explaining an important concept about ${character.philosophical_position.split('.')[0].toLowerCase()}.`,
    matches: Math.floor(Math.random() * 5) + 1,
    category: getRandomCategory()
  }));
  
  return simulatedResults.filter(result => {
    // Apply category filter (simplified for demo)
    return true;
  });
}

// Search for philosophical concepts
async function searchByPhilosophicalConcept(concept, categories, periods) {
  // Find matching concepts
  const matchingConcepts = glossaryData.filter(term => 
    term.term.toLowerCase().includes(concept.toLowerCase()) ||
    term.definition.toLowerCase().includes(concept.toLowerCase())
  );
  
  if (matchingConcepts.length === 0) {
    return [{
      type: 'info',
      message: `No philosophical concept found matching "${concept}". Try searching for "Aretē", "Forms", "Dialectic", etc.`
    }];
  }
  
  // Create results based on related dialogues for these concepts
  const results = [];
  
  matchingConcepts.forEach(concept => {
    concept.related_dialogues.forEach(dialogue => {
      results.push({
        dialogue: dialogue,
        title: `${dialogue} - Concerning ${concept.term}`,
        speaker: "Socrates", // Default speaker for simplicity
        excerpt: `Discussion about ${concept.term}: ${concept.definition}`,
        matches: 1,
        category: getRandomCategory() // In real implementation, get actual category
      });
    });
  });
  
  return results.slice(0, 5); // Limit to 5 results for demo
}

// Display search results in the results container
function displaySearchResults(results, searchTerm) {
  const resultsContainer = document.getElementById('search-results');
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        No results found for "${searchTerm}". Try different search terms or filters.
      </div>
    `;
    return;
  }
  
  // Check if results contains an info message
  if (results[0].type === 'info') {
    resultsContainer.innerHTML = `
      <div class="no-results">
        ${results[0].message}
      </div>
    `;
    return;
  }
  
  // Build HTML for results
  let resultsHTML = `
    <h3>Found ${results.length} results for "${searchTerm}"</h3>
  `;
  
  results.forEach(result => {
    // Highlight search term in excerpt
    const highlightedExcerpt = highlightSearchTerm(result.excerpt, searchTerm);
    
    resultsHTML += `
      <div class="result-item">
        <div class="result-title">
          <a href="${result.dialogue.toLowerCase()}_forum.html">${result.title}</a>
        </div>
        <div class="result-context">
          Speaker: <strong>${result.speaker}</strong> | 
          Dialogue: <strong>${result.dialogue}</strong> | 
          Category: <strong>${result.category}</strong>
        </div>
        <div class="result-excerpt">
          ${highlightedExcerpt}
        </div>
        <div class="result-meta">
          ${result.matches} match${result.matches !== 1 ? 'es' : ''} found | 
          <a href="${result.dialogue.toLowerCase()}_forum.html">View full dialogue &raquo;</a>
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = resultsHTML;
}

// Helper function to highlight search term in text
function highlightSearchTerm(text, term) {
  if (!term) return text;
  
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to get random category for demo purposes
function getRandomCategory() {
  const categories = ['Ethics', 'Metaphysics', 'Epistemology', 'Politics', 'Love and Relationships'];
  return categories[Math.floor(Math.random() * categories.length)];
}