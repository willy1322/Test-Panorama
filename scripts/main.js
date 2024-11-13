
scrdocument.addEventListener('DOMContentLoaded', function() {
  const sceneEl = document.querySelector('a-scene');

  // Ensure A-Frame is loaded
  if (!sceneEl || !sceneEl.components.raycaster) {
    console.error('A-Frame or raycaster component not loaded');
    return;
  }

  // UI Controls
  const toggleUIButton = document.getElementById('toggle-ui');
  const uiPanel = document.getElementById('ui-panel');
  const addObjectButton = document.getElementById('add-object');
  const clearObjectsButton = document.getElementById('clear-objects');
  const objectType = document.getElementById('object-type');
  const scaleSlider = document.getElementById('scale');
  const scaleValue = document.getElementById('scale-value');
  const rotationSlider = document.getElementById('rotation');
  const rotationValue = document.getElementById('rotation-value');
  const posX = document.getElementById('pos-x');
  const posY = document.getElementById('pos-y');
  const posZ = document.getElementById('pos-z');
  const toggleSphereButton = document.getElementById('toggle-sphere');
  const modelFile = document.getElementById('model-file');
  const fileName = document.getElementById('file-name');
  const pasteButton = document.getElementById('paste-url');
  const modelUrlInput = document.getElementById('model-url');
  const audioButton = document.getElementById('toggle-audio');
  const savePositionsButton = document.getElementById('save-positions');
  const toggleGyroButton = document.getElementById('toggle-gyroscope');

  // Load video textures
  const videos = document.querySelectorAll('a-video');
  const totalVideos = videos.length;
  let loadedVideos = 0;

  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      loadedVideos++;
      updateProgressBar(loadedVideos / totalVideos);
      if (loadedVideos === totalVideos) {
        fadeOutLoadingScreen();
      }
    });

    video.addEventListener('error', (e) => {
      console.error(`Error loading video ${video.src}:`, e);
    });
  });

  function updateProgressBar(progress) {
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-text');
    const percentage = Math.round(progress * 100);
    progressBar.style.width = `${percentage}%`;
    loadingText.textContent = `Loading Experience... ${percentage}%`;
  }

  function fadeOutLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');
    setupBackgroundAudio();
  }

  function setupBackgroundAudio() {
    const backgroundAudio = document.getElementById('background-audio');
    backgroundAudio.play().catch(error => {
      console.warn("Auto-play failed, will try on user interaction:", error);
    });
    audioButton.addEventListener('click', () => {
      if (backgroundAudio.paused) {
        backgroundAudio.play().catch(error => {
          console.warn("Auto-play failed:", error);
        });
        audioButton.textContent = 'Mute Audio';
      } else {
        backgroundAudio.pause();
        audioButton.textContent = 'Play Audio';
      }
    });
  }

  // UI Interaction
  toggleUIButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isCollapsed = uiPanel.classList.toggle('collapsed');
    toggleUIButton.textContent = isCollapsed ? '◀ Controls' : '▼ Controls';
    localStorage.setItem('uiPanelCollapsed', isCollapsed);
  });

  const wasCollapsed = localStorage.getItem('uiPanelCollapsed') === 'true';
  if (wasCollapsed) {
    uiPanel.classList.add('collapsed');
    toggleUIButton.textContent = '◀ Controls';
  }

  pasteButton.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      modelUrlInput.value = text;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  });

  savePositionsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    saveVideoPositionsToFile();
  });

  modelUrlInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        modelUrlInput.value = text;
      }).catch(err => {
        console.error('Failed to read clipboard:', err);
      });
    }
  });

  const uiPanel2 = document.querySelector('.ui-controls');
  const stopEvent = (e) => {
    e.stopPropagation();
  };

  [uiPanel2, objectType, scaleSlider, rotationSlider, posX, posY, posZ, addObjectButton, clearObjectsButton].forEach(element => {
    element.addEventListener('mousedown', stopEvent);
    element.addEventListener('mousemove', stopEvent);
    element.addEventListener('mouseup', stopEvent);
    element.addEventListener('touchstart', stopEvent);
    element.addEventListener('touchmove', stopEvent);
    element.addEventListener('touchend', stopEvent);
    element.addEventListener('wheel', stopEvent);
    element.addEventListener('click', stopEvent);
  });

  // Add Object
  addObjectButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const type = objectType.value;
    const x = parseFloat(posX.value) || 0;
    const y = parseFloat(posY.value) || 0;
    const z = parseFloat(posZ.value) || -3;
    const scale = parseFloat(scaleSlider.value);
    const rotation = parseFloat(rotationSlider.value);

    if (type === 'custom') {
      const modelUrl = modelUrlInput.value;
      if (!modelUrl) return;

      const entity = document.createElement('a-entity');
      entity.setAttribute('gltf-model', modelUrl);
      entity.setAttribute('position', `${x} ${y} ${z}`);
      entity.setAttribute('rotation', `0 ${rotation} 0`);
      entity.setAttribute('scale', `${scale} ${scale} ${scale}`);
      sceneEl.appendChild(entity);
    } else if (type === 'fbx') {
      alert('FBX format is not natively supported in A-Frame. Consider converting to GLB.');
    } else {
      let primitive;
      if (type === 'cube') {
        primitive = 'a-box';
      } else if (type === 'sphere') {
        primitive = 'a-sphere';
      }

      const entity = document.createElement(primitive);
      entity.setAttribute('position', `${x} ${y} ${z}`);
      entity.setAttribute('rotation', `0 ${rotation} 0`);
      entity.setAttribute('scale', `${scale} ${scale} ${scale}`);
      sceneEl.appendChild(entity);
    }
  });

  // Clear Objects
  clearObjectsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const entities = sceneEl.querySelectorAll('a-box, a-sphere, a-gltf-model');
    entities.forEach(entity => {
      sceneEl.removeChild(entity);
    });
  });

  // Toggle Sphere
  toggleSphereButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const sky = sceneEl.querySelector('a-sky');
    if (sky) {
      sky.setAttribute('visible', !sky.getAttribute('visible'));
      toggleSphereButton.textContent = sky.getAttribute('visible') ? 'Hide Sphere' : 'Show Sphere';
    }
  });

  // Scale and Rotation
  scaleSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    const newScale = parseFloat(e.target.value);
    scaleValue.textContent = newScale.toFixed(1);
    const entities = sceneEl.querySelectorAll('a-box, a-sphere, a-gltf-model');
    entities.forEach(entity => {
      entity.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
    });
  });

  rotationSlider.addEventListener('input', (e) => {
    e.stopPropagation();
    const degrees = parseFloat(e.target.value);
    rotationValue.textContent = `${degrees}°`;
    const entities = sceneEl.querySelectorAll('a-box, a-sphere, a-gltf-model');
    entities.forEach(entity => {
      entity.setAttribute('rotation', `0 ${degrees} 0`);
    });
  });

  // Position Inputs
  [posX, posY, posZ].forEach(input => {
    input.addEventListener('input', (e) => {
      e.stopPropagation();
      const x = parseFloat(posX.value) || 0;
      const y = parseFloat(posY.value) || 0;
      const z = parseFloat(posZ.value) || -3;
      const entities = sceneEl.querySelectorAll('a-box, a-sphere, a-gltf-model');
      entities.forEach(entity => {
        entity.setAttribute('position', `${x} ${y} ${z}`);
      });
    });
  });

  // Position Buttons
  const positionButtons = document.querySelectorAll('.position-btn');
  positionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const inputId = this.dataset.input;
      const action = this.dataset.action;
      const input = document.getElementById(inputId);
      const currentValue = parseFloat(input.value) || 0;
      
      if (action === 'increment') {
        input.value = (currentValue + 0.1).toFixed(1);
      } else {
        input.value = (currentValue - 0.1).toFixed(1);
      }
      
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });
  });

  const positionInputs = document.querySelectorAll('.position-input');
  positionInputs.forEach(input => {
    input.addEventListener('input', function() {
      let value = this.value.replace(/[^\d.-]/g, '');
      if (value === '' || value === '-') return;
      
      const number = parseFloat(value);
      if (!isNaN(number)) {
        this.value = number.toFixed(1);
      }
    });
    
    input.addEventListener('blur', function() {
      if (this.value === '' || this.value === '-') {
        this.value = '0.0';
      }
    });
  });

  // Save Video Positions
  function saveVideoPositionsToFile() {
    const positions = {};
    videos.forEach(video => {
      const position = video.getAttribute('position');
      const rotation = video.getAttribute('rotation');
      positions[video.getAttribute('src')] = {
        x: position.x,
        y: position.y,
        z: position.z,
        rotationY: rotation.y
      };
    });
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(positions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "video_positions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // Gyroscope
  let isGyroActive = false;
  toggleGyroButton.addEventListener('click', () => {
    isGyroActive = !isGyroActive;
    toggleGyroButton.textContent = isGyroActive ? 'Disable Gyroscope' : 'Enable Gyroscope';
    if (isGyroActive) {
      enableGyroscope();
    } else {
      disableGyroscope();
    }
  });

  function enableGyroscope() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      }).catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }

  function disableGyroscope() {
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
  }

  function handleDeviceOrientation(event) {
    if (!isGyroActive) return;

    const alpha = event.alpha;
    const beta = event.beta;
    const gamma = event.gamma;

    if (alpha === null || beta === null || gamma === null) return;

    const phi = THREE.MathUtils.degToRad(90 - beta);
    const theta = THREE.MathUtils.degToRad(alpha);

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    const camera = sceneEl.camera;
    camera.object3D.lookAt(x, y, z);
  }

  // Mobile Handling
  sceneEl.addEventListener('enter-vr', () => {
    console.log('Entered VR Mode');
  });

  sceneEl.addEventListener('exit-vr', () => {
    console.log('Exited VR Mode');
  });

  // Additional Enhancements
  // Prevent default touch actions on UI elements
  uiPanel.addEventListener('touchstart', (e) => {
    e.preventDefault();
  });

  uiPanel.addEventListener('touchmove', (e) => {
    e.preventDefault();
  });

  // Ensure audio plays on user interaction
  document.body.addEventListener('click', () => {
    const backgroundAudio = document.getElementById('background-audio');
    backgroundAudio.play().catch(error => {
      console.warn("Auto-play failed, will try on user interaction:", error);
    });
  }, { once: true });

  // Raycaster Performance Improvement
  const raycaster = sceneEl.components.raycaster;
  if (raycaster) {
    raycaster.data.objects = '[data-raycastable]';
    sceneEl.setAttribute('raycaster', raycaster.data);
  } else {
    console.error('Raycaster component not found');
  }
});
