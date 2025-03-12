/**
 * Hyper-Platonic Character Network Visualization
 * 
 * This script creates an interactive visualization of the relationships
 * between characters across Plato's dialogues.
 */

// Store visualization data
let characterData = [];
let networkData = {
  nodes: [],
  links: []
};
let currentView = 'network';
let selectedCharacter = null;
let canvas, ctx;

// Initialize visualization
document.addEventListener('DOMContentLoaded', async () => {
  canvas = document.getElementById('network-canvas');
  ctx = canvas.getContext('2d');
  
  // Initialize canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Add event listeners for controls
  document.getElementById('dialogue-filter').addEventListener('change', updateVisualization);
  document.getElementById('relationship-filter').addEventListener('change', updateVisualization);
  
  document.getElementById('view-network').addEventListener('click', () => switchView('network'));
  document.getElementById('view-timeline').addEventListener('click', () => switchView('timeline'));
  document.getElementById('view-matrix').addEventListener('click', () => switchView('matrix'));
  
  // Add canvas interaction
  canvas.addEventListener('click', handleCanvasClick);
  
  // Load data and create visualization
  await loadData();
  createNetworkData();
  updateVisualization();
  
  // Hide loading overlay
  document.getElementById('loading-overlay').style.display = 'none';
});

// Resize canvas to fit container
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  // Redraw if data exists
  if (networkData.nodes.length > 0) {
    updateVisualization();
  }
}

// Load character data
async function loadData() {
  try {
    const response = await fetch('character_profiles.json');
    const data = await response.json();
    characterData = data.characters;
    
    // Create relationship data
    // For demo purposes, we'll generate synthetic relationship data
    // based on characters appearing in the same dialogues
    generateRelationships();
  } catch (error) {
    console.error('Error loading character data:', error);
  }
}

// Generate relationship data between characters
function generateRelationships() {
  // Create a mapping of dialogues to characters
  const dialogueCharacterMap = {};
  
  characterData.forEach(character => {
    if (character.dialogues) {
      character.dialogues.forEach(dialogue => {
        if (!dialogueCharacterMap[dialogue]) {
          dialogueCharacterMap[dialogue] = [];
        }
        dialogueCharacterMap[dialogue].push(character.name);
      });
    }
  });
  
  // Generate relationships based on characters appearing in the same dialogue
  const relationships = [];
  
  Object.keys(dialogueCharacterMap).forEach(dialogue => {
    const characters = dialogueCharacterMap[dialogue];
    
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        // Check if relationship already exists
        const existingRelationship = relationships.find(r => 
          (r.source === characters[i] && r.target === characters[j]) ||
          (r.source === characters[j] && r.target === characters[i])
        );
        
        if (existingRelationship) {
          // Add dialogue to existing relationship
          existingRelationship.dialogues.push(dialogue);
        } else {
          // Create new relationship
          relationships.push({
            source: characters[i],
            target: characters[j],
            dialogues: [dialogue],
            type: determineRelationshipType(characters[i], characters[j])
          });
        }
      }
    }
  });
  
  // Store relationships with characters
  characterData.forEach(character => {
    character.relationships = relationships.filter(r => 
      r.source === character.name || r.target === character.name
    );
  });
}

// Determine relationship type based on characters
function determineRelationshipType(char1, char2) {
  // This would ideally be determined by real data
  // For demo, we'll use some predefined relationships
  
  // Oppositional relationships
  const oppositions = [
    ['Socrates', 'Thrasymachus'],
    ['Socrates', 'Callicles'],
    ['Socrates', 'Protagoras'],
    ['Socrates', 'Gorgias']
  ];
  
  // Teacher-student relationships
  const teacherStudent = [
    ['Socrates', 'Plato'],
    ['Protagoras', 'Meno'],
    ['Gorgias', 'Callicles'],
    ['Socrates', 'Alcibiades']
  ];
  
  // Family relationships
  const family = [
    ['Plato', 'Glaucon'],
    ['Plato', 'Critias']
  ];
  
  // Check relationship types
  for (const pair of oppositions) {
    if ((pair[0] === char1 && pair[1] === char2) || (pair[0] === char2 && pair[1] === char1)) {
      return 'opposition';
    }
  }
  
  for (const pair of teacherStudent) {
    if ((pair[0] === char1 && pair[1] === char2) || (pair[0] === char2 && pair[1] === char1)) {
      return 'teacher';
    }
  }
  
  for (const pair of family) {
    if ((pair[0] === char1 && pair[1] === char2) || (pair[0] === char2 && pair[1] === char1)) {
      return 'family';
    }
  }
  
  return 'friend'; // Default relationship type
}

// Create network data for visualization
function createNetworkData() {
  // Create nodes
  networkData.nodes = characterData.map((character, index) => ({
    id: character.name,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: character.name === 'Socrates' ? 15 : 10,
    color: getCharacterColor(character),
    data: character
  }));
  
  // Create links
  networkData.links = [];
  
  characterData.forEach(character => {
    if (character.relationships) {
      character.relationships.forEach(relationship => {
        // Add link if it doesn't already exist
        const linkExists = networkData.links.some(link => 
          (link.source === relationship.source && link.target === relationship.target) ||
          (link.source === relationship.target && link.target === relationship.source)
        );
        
        if (!linkExists) {
          networkData.links.push({
            source: relationship.source,
            target: relationship.target,
            strength: relationship.dialogues.length,
            type: relationship.type,
            dialogues: relationship.dialogues
          });
        }
      });
    }
  });
}

// Get character color based on rank
function getCharacterColor(character) {
  if (!character.rank) return '#999';
  
  const rank = character.rank.toLowerCase();
  
  if (rank.includes('philosopher') || rank.includes('sage')) {
    return '#8B5A2B';
  } else if (rank.includes('sophist') || rank.includes('rhetorician')) {
    return '#6699BB';
  } else {
    return '#999';
  }
}

// Switch between visualization views
function switchView(view) {
  currentView = view;
  
  // Update active button state
  document.querySelectorAll('.view-button').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById(`view-${view}`).classList.add('active');
  
  // Update visualization
  updateVisualization();
}

// Update visualization based on current filters and view
function updateVisualization() {
  // Get filters
  const dialogueFilter = document.getElementById('dialogue-filter').value;
  const relationshipFilter = document.getElementById('relationship-filter').value;
  
  // Apply filters to data
  let filteredNodes = [...networkData.nodes];
  let filteredLinks = [...networkData.links];
  
  if (dialogueFilter !== 'all') {
    // Filter links by dialogue
    filteredLinks = filteredLinks.filter(link => {
      return link.dialogues.some(dialogue => dialogue.toLowerCase() === dialogueFilter);
    });
    
    // Filter nodes to only include those with connections
    const connectedNodes = new Set();
    filteredLinks.forEach(link => {
      connectedNodes.add(link.source);
      connectedNodes.add(link.target);
    });
    
    filteredNodes = filteredNodes.filter(node => connectedNodes.has(node.id));
  }
  
  if (relationshipFilter !== 'all') {
    // Filter links by relationship type
    filteredLinks = filteredLinks.filter(link => link.type === relationshipFilter);
    
    // Filter nodes to only include those with connections
    const connectedNodes = new Set();
    filteredLinks.forEach(link => {
      connectedNodes.add(link.source);
      connectedNodes.add(link.target);
    });
    
    filteredNodes = filteredNodes.filter(node => connectedNodes.has(node.id));
  }
  
  // Draw visualization based on current view
  switch (currentView) {
    case 'network':
      drawNetworkView(filteredNodes, filteredLinks);
      break;
    case 'timeline':
      drawTimelineView(filteredNodes);
      break;
    case 'matrix':
      drawMatrixView(filteredNodes, filteredLinks);
      break;
  }
}

// Draw network view
function drawNetworkView(nodes, links) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Position nodes using a simple force-directed algorithm
  simulateForces(nodes, links, 50);
  
  // Draw links
  links.forEach(link => {
    const sourceNode = nodes.find(node => node.id === link.source);
    const targetNode = nodes.find(node => node.id === link.target);
    
    if (sourceNode && targetNode) {
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      
      // Style based on relationship type
      if (link.type === 'opposition') {
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#E74C3C';
      } else if (link.type === 'teacher') {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#3498DB';
      } else if (link.type === 'family') {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2ECC71';
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#999';
      }
      
      // Line width based on strength
      ctx.lineWidth = Math.min(link.strength, 5);
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
  
  // Draw nodes
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    
    // Highlight selected node
    if (selectedCharacter === node.id) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw node label
    ctx.fillStyle = '#333';
    ctx.font = '10px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText(node.id, node.x, node.y + node.radius + 12);
  });
}

// Draw timeline view
function drawTimelineView(nodes) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw timeline (simplified for demo)
  const timelineY = canvas.height / 2;
  const startYear = 500; // BCE
  const endYear = 350; // BCE
  const timelineWidth = canvas.width - 100;
  
  // Draw timeline axis
  ctx.beginPath();
  ctx.moveTo(50, timelineY);
  ctx.lineTo(50 + timelineWidth, timelineY);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw year markers
  for (let year = startYear; year >= endYear; year -= 25) {
    const x = 50 + (startYear - year) / (startYear - endYear) * timelineWidth;
    
    ctx.beginPath();
    ctx.moveTo(x, timelineY - 5);
    ctx.lineTo(x, timelineY + 5);
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Verdana';
    ctx.textAlign = 'center';
    ctx.fillText(year + ' BCE', x, timelineY + 20);
  }
  
  // Plot characters on timeline (using birth date from join_date)
  nodes.forEach(node => {
    const character = node.data;
    if (character.join_date) {
      // Extract year from join date (format: "circa 470 BCE")
      const yearMatch = character.join_date.match(/(\d+)/);
      
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        const x = 50 + (startYear - year) / (startYear - endYear) * timelineWidth;
        
        // Alternate y position to prevent overlap
        const nodeIndex = nodes.indexOf(node);
        const yOffset = (nodeIndex % 2 === 0) ? -40 : 40;
        const y = timelineY + yOffset;
        
        // Draw connection to timeline
        ctx.beginPath();
        ctx.moveTo(x, timelineY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#CCC';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw character node
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Highlight selected node
        if (selectedCharacter === node.id) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Draw character name
        ctx.fillStyle = '#333';
        ctx.font = '10px Verdana';
        ctx.textAlign = 'center';
        const labelY = y + (yOffset > 0 ? 25 : -15);
        ctx.fillText(node.id, x, labelY);
      }
    }
  });
}

// Draw matrix view
function drawMatrixView(nodes, links) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const margin = 120;
  const cellSize = Math.min(
    (canvas.width - margin * 2) / nodes.length,
    (canvas.height - margin * 2) / nodes.length
  );
  
  // Sort nodes alphabetically
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  
  // Draw row labels
  sortedNodes.forEach((node, i) => {
    ctx.fillStyle = '#333';
    ctx.font = '10px Verdana';
    ctx.textAlign = 'right';
    ctx.fillText(node.id, margin - 5, margin + i * cellSize + cellSize / 2 + 3);
    
    // Draw small colored circle for character type
    ctx.beginPath();
    ctx.arc(margin - 15, margin + i * cellSize + cellSize / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
  });
  
  // Draw column labels
  sortedNodes.forEach((node, i) => {
    ctx.save();
    ctx.translate(margin + i * cellSize + cellSize / 2, margin - 5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#333';
    ctx.font = '10px Verdana';
    ctx.textAlign = 'right';
    ctx.fillText(node.id, 0, 0);
    ctx.restore();
    
    // Draw small colored circle for character type
    ctx.beginPath();
    ctx.arc(margin + i * cellSize + cellSize / 2, margin - 15, 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
  });
  
  // Draw matrix cells
  sortedNodes.forEach((sourceNode, i) => {
    sortedNodes.forEach((targetNode, j) => {
      // Find link between these nodes
      const link = links.find(l => 
        (l.source === sourceNode.id && l.target === targetNode.id) ||
        (l.source === targetNode.id && l.target === sourceNode.id)
      );
      
      const x = margin + j * cellSize;
      const y = margin + i * cellSize;
      
      // Draw cell background
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(x, y, cellSize, cellSize);
      
      // Draw cell border
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);
      
      // If there's a link, fill the cell
      if (link) {
        // Color based on relationship type
        let cellColor;
        switch (link.type) {
          case 'opposition':
            cellColor = 'rgba(231, 76, 60, 0.7)';
            break;
          case 'teacher':
            cellColor = 'rgba(52, 152, 219, 0.7)';
            break;
          case 'family':
            cellColor = 'rgba(46, 204, 113, 0.7)';
            break;
          default:
            cellColor = 'rgba(153, 153, 153, 0.7)';
        }
        
        ctx.fillStyle = cellColor;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Show strength (number of dialogues)
        if (cellSize > 15) {
          ctx.fillStyle = '#FFF';
          ctx.font = '10px Verdana';
          ctx.textAlign = 'center';
          ctx.fillText(link.dialogues.length, x + cellSize / 2, y + cellSize / 2 + 3);
        }
      }
      
      // Highlight selected character
      if (selectedCharacter === sourceNode.id || selectedCharacter === targetNode.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    });
  });
}

// Simulate forces for force-directed layout
function simulateForces(nodes, links, iterations) {
  const repulsionForce = 250;
  const attractionForce = 0.1;
  const centerForce = 0.01;
  
  for (let i = 0; i < iterations; i++) {
    // Apply repulsion between nodes
    for (let j = 0; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const nodeA = nodes[j];
        const nodeB = nodes[k];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Avoid division by zero
        if (distance === 0) continue;
        
        const force = repulsionForce / (distance * distance);
        
        const forceX = dx / distance * force;
        const forceY = dy / distance * force;
        
        nodeA.x -= forceX;
        nodeA.y -= forceY;
        nodeB.x += forceX;
        nodeB.y += forceY;
      }
    }
    
    // Apply attraction along links
    links.forEach(link => {
      const sourceNode = nodes.find(node => node.id === link.source);
      const targetNode = nodes.find(node => node.id === link.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Avoid division by zero
        if (distance === 0) return;
        
        const force = distance * attractionForce * link.strength;
        
        const forceX = dx / distance * force;
        const forceY = dy / distance * force;
        
        sourceNode.x += forceX;
        sourceNode.y += forceY;
        targetNode.x -= forceX;
        targetNode.y -= forceY;
      }
    });
    
    // Apply centering force to keep nodes within view
    nodes.forEach(node => {
      const dx = canvas.width / 2 - node.x;
      const dy = canvas.height / 2 - node.y;
      
      node.x += dx * centerForce;
      node.y += dy * centerForce;
      
      // Keep within bounds
      node.x = Math.max(node.radius * 2, Math.min(canvas.width - node.radius * 2, node.x));
      node.y = Math.max(node.radius * 2, Math.min(canvas.height - node.radius * 2, node.y));
    });
  }
}

// Handle canvas click to select node
function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Find clicked node
  let clickedNode = null;
  
  if (currentView === 'network') {
    // Check for clicked node in network view
    for (const node of networkData.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= node.radius) {
        clickedNode = node;
        break;
      }
    }
  } else if (currentView === 'timeline') {
    // Check for clicked node in timeline view
    const timelineY = canvas.height / 2;
    const startYear = 500; // BCE
    const endYear = 350; // BCE
    const timelineWidth = canvas.width - 100;
    
    for (const node of networkData.nodes) {
      const character = node.data;
      if (character.join_date) {
        const yearMatch = character.join_date.match(/(\d+)/);
        
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          const nodeX = 50 + (startYear - year) / (startYear - endYear) * timelineWidth;
          
          const nodeIndex = networkData.nodes.indexOf(node);
          const yOffset = (nodeIndex % 2 === 0) ? -40 : 40;
          const nodeY = timelineY + yOffset;
          
          const dx = nodeX - x;
          const dy = nodeY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance <= 15) {
            clickedNode = node;
            break;
          }
        }
      }
    }
  } else if (currentView === 'matrix') {
    // Matrix view clicking not implemented for demo
  }
  
  if (clickedNode) {
    // Toggle selection
    if (selectedCharacter === clickedNode.id) {
      selectedCharacter = null;
      document.getElementById('character-info').classList.remove('visible');
    } else {
      selectedCharacter = clickedNode.id;
      document.getElementById('character-info').classList.add('visible');
      
      // Update character info panel
      updateCharacterInfo(clickedNode.data);
    }
    
    // Redraw visualization
    updateVisualization();
  }
}

// Update character info panel with selected character data
function updateCharacterInfo(character) {
  document.getElementById('character-name').textContent = character.name;
  document.getElementById('character-title').textContent = character.rank || '';
  document.getElementById('character-bio').textContent = character.bio || '';
  
  // Update avatar
  const avatarElement = document.getElementById('character-avatar');
  const avatarFilename = character.name.toLowerCase().replace(/ /g, '_') + '.png';
  
  avatarElement.innerHTML = `<img src="avatars/${avatarFilename}" alt="${character.name}" onerror="this.style.display='none'; this.parentNode.textContent='${character.name.charAt(0)}';">`;
  
  // Update relationship list
  const relationshipList = document.getElementById('relationship-list');
  relationshipList.innerHTML = '';
  
  if (character.relationships && character.relationships.length > 0) {
    character.relationships.forEach(relationship => {
      const otherCharacter = relationship.source === character.name ? relationship.target : relationship.source;
      const dialogues = relationship.dialogues.join(', ');
      
      const listItem = document.createElement('li');
      listItem.textContent = `${otherCharacter} (${relationship.dialogues.length} dialogue${relationship.dialogues.length !== 1 ? 's' : ''})`;
      relationshipList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement('li');
    listItem.textContent = 'No relationships recorded';
    relationshipList.appendChild(listItem);
  }
}