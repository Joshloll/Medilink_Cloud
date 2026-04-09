// Touch Reader Debug Tool for MediLink Healthcare System
// Global click detection and element identification system

class TouchReader {
    constructor() {
        this.isEnabled = false;
        this.debugPanel = null;
        this.toggleButton = null;
        this.lastClickedElements = [];
        this.maxHistory = 5;
        this.init();
    }

    init() {
        this.createToggleButton();
        this.createDebugPanel();
        this.setupGlobalListener();
        this.setupKeyboardShortcuts();
    }

    createToggleButton() {
        // Create toggle button
        this.toggleButton = document.createElement('div');
        this.toggleButton.id = 'touch-reader-toggle';
        this.toggleButton.innerHTML = `
            <div class="touch-reader-toggle-btn">
                <span class="material-symbols-outlined">touch_app</span>
                <span>Touch Reader</span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .touch-reader-toggle-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: linear-gradient(135deg, #137fec, #0ea5e9);
                color: white;
                border: none;
                border-radius: 12px;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(19, 126, 236, 0.3);
                transition: all 0.3s ease;
                opacity: 0.8;
            }
            
            .touch-reader-toggle-btn:hover {
                opacity: 1;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(19, 126, 236, 0.4);
            }
            
            .touch-reader-toggle-btn.active {
                background: linear-gradient(135deg, #10b981, #059669);
                opacity: 1;
            }
            
            .touch-reader-toggle-btn .material-symbols-outlined {
                font-size: 18px;
            }
            
            .touch-reader-debug-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                width: 350px;
                max-height: 400px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                font-family: 'Inter', sans-serif;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                transform: translateY(10px);
            }
            
            .touch-reader-debug-panel.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .touch-reader-debug-header {
                padding: 16px;
                border-bottom: 1px solid #e2e8f0;
                background: #f8fafc;
                border-radius: 12px 12px 0 0;
                font-weight: 600;
                color: #1e293b;
            }
            
            .touch-reader-debug-content {
                padding: 16px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .touch-reader-debug-item {
                padding: 12px;
                margin-bottom: 8px;
                background: #f1f5f9;
                border-radius: 8px;
                border-left: 4px solid #137fec;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .touch-reader-debug-item:last-child {
                margin-bottom: 0;
            }
            
            .touch-reader-debug-label {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 4px;
                word-break: break-all;
            }
            
            .touch-reader-debug-type {
                color: #64748b;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            
            .touch-reader-debug-id {
                color: #059669;
                font-family: 'Monaco', 'Courier New', monospace;
                font-size: 10px;
                background: #f0f9f0;
                padding: 2px 4px;
                border-radius: 4px;
                margin-bottom: 2px;
                display: inline-block;
            }
            
            .touch-reader-debug-class {
                color: #6366f1;
                font-size: 10px;
                background: #f8f9fa;
                padding: 2px 4px;
                border-radius: 4px;
                margin-bottom: 2px;
                display: inline-block;
                word-break: break-all;
            }
            
            .touch-reader-debug-text {
                color: #374151;
                font-size: 11px;
                line-height: 1.4;
                word-break: break-all;
            }
            
            .touch-reader-history {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid #e2e8f0;
            }
            
            .touch-reader-history-title {
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 8px;
                font-size: 12px;
            }
            
            .touch-reader-history-item {
                font-size: 10px;
                color: #64748b;
                padding: 4px 8px;
                background: #f8fafc;
                border-radius: 4px;
                margin-bottom: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .touch-reader-history-item:hover {
                background: #e2e8f0;
            }
            
            .touch-reader-highlight {
                outline: 2px solid #137fec !important;
                outline-offset: 2px !important;
                border-radius: 4px;
                box-shadow: 0 0 0 4px rgba(19, 126, 236, 0.3);
                animation: pulse 0.5s ease-in-out;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(19, 126, 236, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 8px rgba(19, 126, 236, 0.2);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(19, 126, 236, 0);
                }
            }
            
            .dark .touch-reader-toggle-btn {
                background: linear-gradient(135deg, #1e293b, #334155);
                color: white;
            }
            
            .dark .touch-reader-debug-panel {
                background: #1e293b;
                border-color: #475569;
                color: #f1f5f9;
            }
            
            .dark .touch-reader-debug-header {
                background: #334155;
                color: #f1f5f9;
            }
            
            .dark .touch-reader-debug-item {
                background: #374151;
                border-left-color: #10b981;
                color: #f1f5f9;
            }
            
            .dark .touch-reader-history {
                border-top-color: #475569;
            }
            
            .dark .touch-reader-history-item {
                background: #1f2937;
                color: #d1d5db;
            }
            
            .dark .touch-reader-history-item:hover {
                background: #374151;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.toggleButton);
        
        // Add click listener to toggle
        this.toggleButton.addEventListener('click', () => this.toggle());
    }

    createDebugPanel() {
        // Create debug panel
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'touch-reader-debug-panel';
        this.debugPanel.innerHTML = `
            <div class="touch-reader-debug-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Touch Reader Debug</span>
                    <button onclick="touchReader.clearHistory()" style="background: none; border: none; color: inherit; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 12px;">Clear</button>
                </div>
            </div>
            <div class="touch-reader-debug-content" id="debug-content">
                <div class="touch-reader-debug-item">
                    <div class="touch-reader-debug-label">Click an element to see its details</div>
                </div>
            </div>
            <div class="touch-reader-history">
                <div class="touch-reader-history-title">Recent Clicks</div>
                <div id="debug-history"></div>
            </div>
        `;
        
        document.body.appendChild(this.debugPanel);
    }

    setupGlobalListener() {
        // Setup global click listener
        document.addEventListener('click', (event) => {
            if (!this.isEnabled) return;
            
            event.stopPropagation();
            
            const element = event.target;
            const elementInfo = this.getElementInfo(element);
            
            // Update debug panel
            this.updateDebugPanel(elementInfo);
            
            // Add to history
            this.addToHistory(elementInfo);
            
            // Visual feedback
            this.highlightElement(element);
            
            // Auto-copy to clipboard
            this.copyToClipboard(elementInfo);
            
            // Log to console
            this.logToConsole(elementInfo);
        });
    }

    getElementInfo(element) {
        const info = {
            text: '',
            ariaLabel: '',
            id: '',
            className: '',
            tagName: '',
            innerText: '',
            textContent: ''
        };
        
        // Extract text content with priority
        if (element.innerText) {
            info.innerText = element.innerText.trim();
        } else if (element.textContent) {
            info.textContent = element.textContent.trim();
        }
        
        // Extract aria-label
        if (element.getAttribute('aria-label')) {
            info.ariaLabel = element.getAttribute('aria-label').trim();
        }
        
        // Extract id
        if (element.id) {
            info.id = element.id;
        }
        
        // Extract className
        if (element.className) {
            info.className = element.className;
        }
        
        // Extract tag name
        info.tagName = element.tagName.toLowerCase();
        
        // Set main text (priority order)
        info.text = info.innerText || info.textContent || '';
        
        return info;
    }

    updateDebugPanel(elementInfo) {
        const content = document.getElementById('debug-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="touch-reader-debug-item">
                <div class="touch-reader-debug-label">${elementInfo.text || 'No text found'}</div>
                ${elementInfo.ariaLabel ? `<div class="touch-reader-debug-type">Aria-Label: ${elementInfo.ariaLabel}</div>` : ''}
                ${elementInfo.id ? `<div class="touch-reader-debug-id">ID: ${elementInfo.id}</div>` : ''}
                ${elementInfo.className ? `<div class="touch-reader-debug-class">Class: ${elementInfo.className}</div>` : ''}
                ${elementInfo.tagName ? `<div class="touch-reader-debug-type">Type: ${elementInfo.tagName}</div>` : ''}
                ${elementInfo.innerText ? `<div class="touch-reader-debug-text">${elementInfo.innerText}</div>` : ''}
                ${elementInfo.textContent ? `<div class="touch-reader-debug-text">${elementInfo.textContent}</div>` : ''}
            </div>
        `;
    }

    addToHistory(elementInfo) {
        this.lastClickedElements.unshift(elementInfo);
        if (this.lastClickedElements.length > this.maxHistory) {
            this.lastClickedElements = this.lastClickedElements.slice(0, this.maxHistory);
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('debug-history');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = this.lastClickedElements.map((item, index) => `
            <div class="touch-reader-history-item" onclick="touchReader.copyHistoryItem(${index})">
                <div style="font-weight: 500; margin-bottom: 2px;">${item.text || 'No text'}</div>
                <div style="font-size: 10px; color: #64748b;">${item.id ? `#${item.id}` : item.tagName}</div>
                <div style="font-size: 9px; color: #9ca3af;">${new Date().toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    highlightElement(element) {
        // Add highlight class
        element.classList.add('touch-reader-highlight');
        
        // Remove highlight after animation
        setTimeout(() => {
            element.classList.remove('touch-reader-highlight');
        }, 500);
    }

    copyToClipboard(elementInfo) {
        const textToCopy = elementInfo.text || elementInfo.ariaLabel || elementInfo.id || elementInfo.tagName || 'No text found';
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Success feedback
            if (this.debugPanel && this.debugPanel.classList.contains('active')) {
                const content = document.getElementById('debug-content');
                if (content) {
                    const firstItem = content.querySelector('.touch-reader-debug-label');
                    if (firstItem) {
                        const originalText = firstItem.textContent;
                        firstItem.textContent = 'Copied to clipboard!';
                        setTimeout(() => {
                            firstItem.textContent = originalText;
                        }, 1500);
                    }
                }
            }
        }).catch(err => {
            console.error('Failed to copy text to clipboard:', err);
        });
    }

    logToConsole(elementInfo) {
        console.log('Touch Reader Debug:', {
            text: elementInfo.text,
            ariaLabel: elementInfo.ariaLabel,
            id: elementInfo.id,
            className: elementInfo.className,
            tagName: elementInfo.tagName,
            timestamp: new Date().toISOString()
        });
    }

    copyHistoryItem(index) {
        if (index >= 0 && index < this.lastClickedElements.length) {
            const item = this.lastClickedElements[index];
            this.copyToClipboard(item);
        }
    }

    clearHistory() {
        this.lastClickedElements = [];
        this.updateHistoryDisplay();
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        
        // Update toggle button state
        this.toggleButton.classList.toggle('active');
        
        // Update debug panel state
        this.debugPanel.classList.toggle('active');
        
        // Update cursor style
        document.body.style.cursor = this.isEnabled ? 'crosshair' : '';
        
        // Log state change
        console.log(`Touch Reader ${this.isEnabled ? 'ENABLED' : 'DISABLED'}`);
    }

    setupKeyboardShortcuts() {
        // Add keyboard shortcut (Ctrl/Cmd + Shift + R)
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.toggle();
            }
        });
    }
}

// Initialize Touch Reader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.touchReader = new TouchReader();
    console.log('Touch Reader Debug Tool initialized. Press Ctrl+Shift+R to toggle or use the floating button.');
});

// Export for global access
window.TouchReader = TouchReader;
