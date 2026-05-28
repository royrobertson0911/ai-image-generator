/**
 * AI Image Generator Application
 * Uses Arwes.js for UI styling and OpenAI API for image generation
 */

class AIImageGenerator {
  constructor() {
    this.apiEndpoint = '/api/generate-image';
    this.currentImageUrl = null;
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createUI();
    this.attachEventListeners();
    this.checkServerHealth();
  }

  createUI() {
    const root = document.getElementById('root');

    // Build the HTML structure
    root.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>⚛ AI IMAGE GENERATOR</h1>
          <p>Powered by OpenAI & Arwes</p>
        </div>

        <div class="content-wrapper">
          <!-- Input Panel -->
          <div class="panel input-panel">
            <form id="generatorForm">
              <div class="form-group">
                <label class="form-label">✦ Image Prompt</label>
                <textarea
                  id="promptInput"
                  class="form-input"
                  placeholder="Describe the image you want to generate... (e.g., 'A cyberpunk city at night with neon lights and flying cars')"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">⚙ Image Size</label>
                <select id="sizeSelect" class="form-select">
                  <option value="1024x1024">1024 × 1024</option>
                  <option value="1792x1024">1792 × 1024 (Landscape)</option>
                  <option value="1024x1792">1024 × 1792 (Portrait)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">◆ Quality</label>
                <select id="qualitySelect" class="form-select">
                  <option value="standard">Standard</option>
                  <option value="hd">HD (Higher Cost)</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary" id="generateBtn">
                ▶ GENERATE IMAGE
              </button>
            </form>

            <div id="inputStatus" style="margin-top: 20px;"></div>
          </div>

          <!-- Output Panel -->
          <div class="panel output-panel">
            <div class="output-content">
              <div class="image-container" id="imageContainer">
                <div class="placeholder-text">
                  <div class="placeholder-icon">🖼</div>
                  <p>Your generated image will appear here</p>
                </div>
              </div>

              <div id="outputStatus" style="width: 100%;"></div>

              <div id="revisedPromptContainer" style="width: 100%; display: none;">
                <div class="revised-prompt">
                  <div class="revised-prompt-label">✓ Revised Prompt:</div>
                  <div class="revised-prompt-text" id="revisedPromptText"></div>
                </div>
              </div>

              <button
                id="downloadBtn"
                class="download-btn"
                style="display: none;"
              >
                ⬇ DOWNLOAD IMAGE
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Apply Arwes styling if available
    this.applyArwesStyles();
  }

  applyArwesStyles() {
    // Check if Arwes is loaded and apply additional styling
    if (window.Arwes) {
      console.log('✓ Arwes.js loaded successfully');
      document.querySelectorAll('.panel').forEach((panel) => {
        panel.classList.add('arwes-frame');
      });
    }
  }

  attachEventListeners() {
    const form = document.getElementById('generatorForm');
    form.addEventListener('submit', (e) => this.handleGenerateImage(e));

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.addEventListener('click', () => this.downloadImage());

    // Auto-focus on prompt input
    document.getElementById('promptInput').focus();
  }

  async checkServerHealth() {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        console.log('✓ Server is healthy');
      }
    } catch (error) {
      console.warn('⚠ Server health check failed:', error);
    }
  }

  async handleGenerateImage(e) {
    e.preventDefault();

    if (this.isLoading) return;

    const prompt = document.getElementById('promptInput').value.trim();
    const size = document.getElementById('sizeSelect').value;
    const quality = document.getElementById('qualitySelect').value;

    if (!prompt) {
      this.showInputStatus('Please enter a prompt', 'error');
      return;
    }

    this.isLoading = true;
    this.showInputStatus('🔄 Generating image...', 'loading');
    this.showOutputStatus('🔄 Processing...', 'loading');
    this.showLoadingSpinner();

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          size: size,
          quality: quality,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // Success!
      this.currentImageUrl = data.imageUrl;
      this.displayImage(data.imageUrl);
      this.showInputStatus('✓ Image generated successfully!', 'success');
      this.showOutputStatus('✓ Ready for download', 'success');
      this.showRevisedPrompt(data.revisedPrompt);
      this.showDownloadButton();
    } catch (error) {
      console.error('Error:', error);
      this.showInputStatus(`✗ Error: ${error.message}`, 'error');
      this.showOutputStatus(`✗ ${error.message}`, 'error');
      this.clearImageContainer();
    } finally {
      this.isLoading = false;
    }
  }

  displayImage(imageUrl) {
    const container = document.getElementById('imageContainer');
    container.innerHTML = `<img src="${imageUrl}" alt="Generated Image" />`;
  }

  showLoadingSpinner() {
    const container = document.getElementById('imageContainer');
    container.innerHTML = `
      <div style="text-align: center;">
        <div class="spinner"></div>
        <p style="margin-top: 20px; color: var(--secondary-color);">Generating your masterpiece...</p>
      </div>
    `;
  }

  clearImageContainer() {
    const container = document.getElementById('imageContainer');
    container.innerHTML = `
      <div class="placeholder-text">
        <div class="placeholder-icon">🖼</div>
        <p>Your generated image will appear here</p>
      </div>
    `;
    this.currentImageUrl = null;
  }

  showInputStatus(message, type) {
    const statusDiv = document.getElementById('inputStatus');
    if (message) {
      statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    } else {
      statusDiv.innerHTML = '';
    }
  }

  showOutputStatus(message, type) {
    const statusDiv = document.getElementById('outputStatus');
    if (message) {
      statusDiv.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    } else {
      statusDiv.innerHTML = '';
    }
  }

  showRevisedPrompt(revisedPrompt) {
    const container = document.getElementById('revisedPromptContainer');
    const text = document.getElementById('revisedPromptText');
    if (revisedPrompt) {
      text.textContent = revisedPrompt;
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  showDownloadButton() {
    const btn = document.getElementById('downloadBtn');
    if (this.currentImageUrl) {
      btn.style.display = 'block';
    }
  }

  downloadImage() {
    if (!this.currentImageUrl) return;

    const link = document.createElement('a');
    link.href = this.currentImageUrl;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showInputStatus('✓ Image downloading...', 'success');
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing AI Image Generator...');
  new AIImageGenerator();
});
