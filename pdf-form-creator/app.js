// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Application state
const state = {
    pdfDoc: null,
    pdfBytes: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.5,
    currentTool: null,
    fields: [],
    selectedField: null,
    isDrawing: false,
    canvas: null,
    ctx: null,
    canvasOffset: { x: 0, y: 0 },
    fieldCounter: 0  // Counter for unique field names
};

// PDF-safe ASCII symbols (compatible with standard PDF fonts)
const PDF_SAFE_SYMBOLS = {
    checkmark: 'X',      // Use X as checkmark (universally supported)
    cross: 'X',          // X for cross
    arrow: '->',         // ASCII arrow
    star: '*',           // Asterisk for star
    exclamation: '!'     // Standard exclamation
};

// Initialize signature canvas
let signatureCanvas, signatureCtx;
let isSignatureDrawing = false;

// Load saved signatures from localStorage
function loadSavedSignatures() {
    const signatures = localStorage.getItem('pdfFormSignatures');
    return signatures ? JSON.parse(signatures) : [];
}

function saveSignatureToStorage(signatureData) {
    const signatures = loadSavedSignatures();
    signatures.push({
        id: Date.now(),
        data: signatureData,
        created: new Date().toISOString()
    });
    localStorage.setItem('pdfFormSignatures', JSON.stringify(signatures));
}

function deleteSavedSignature(id) {
    const signatures = loadSavedSignatures();
    const filtered = signatures.filter(sig => sig.id !== id);
    localStorage.setItem('pdfFormSignatures', JSON.stringify(filtered));
}

// PDF Upload Handler
document.getElementById('pdfUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        state.pdfBytes = new Uint8Array(event.target.result);
        await loadPDF(state.pdfBytes);
    };
    reader.readAsArrayBuffer(file);
});

// Load and render PDF
async function loadPDF(pdfBytes) {
    try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        state.pdfDoc = await loadingTask.promise;
        state.totalPages = state.pdfDoc.numPages;
        state.currentPage = 1;

        await renderPage(state.currentPage);

        // Clear placeholder
        document.querySelector('.upload-placeholder').style.display = 'none';
    } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. Please try again.');
    }
}

// Render PDF page
async function renderPage(pageNum) {
    const page = await state.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: state.scale });

    // Create or get canvas
    let canvas = document.getElementById('pdfCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'pdfCanvas';
        document.getElementById('pdfContainer').appendChild(canvas);

        // Add page controls
        if (state.totalPages > 1) {
            addPageControls();
        }
    }

    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Update canvas offset for field positioning
    const rect = canvas.getBoundingClientRect();
    state.canvasOffset = {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
    };

    const renderContext = {
        canvasContext: state.ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;

    // Re-render fields on this page
    renderFields();
}

// Add page navigation controls
function addPageControls() {
    const controls = document.createElement('div');
    controls.className = 'page-controls';
    controls.innerHTML = `
        <button onclick="previousPage()" id="prevPage">Previous</button>
        <span>Page <span id="pageNum">${state.currentPage}</span> of <span id="pageCount">${state.totalPages}</span></span>
        <button onclick="nextPage()" id="nextPage">Next</button>
    `;
    document.querySelector('.canvas-wrapper').appendChild(controls);
}

function nextPage() {
    if (state.currentPage < state.totalPages) {
        state.currentPage++;
        renderPage(state.currentPage);
        updatePageControls();
    }
}

function previousPage() {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderPage(state.currentPage);
        updatePageControls();
    }
}

function updatePageControls() {
    document.getElementById('pageNum').textContent = state.currentPage;
    document.getElementById('prevPage').disabled = state.currentPage === 1;
    document.getElementById('nextPage').disabled = state.currentPage === state.totalPages;
}

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        e.target.classList.add('active');

        // Set current tool
        state.currentTool = e.target.dataset.tool;
    });
});

// Canvas click handler for adding fields
document.addEventListener('click', (e) => {
    if (!state.canvas) return;

    const canvas = state.canvas;
    const rect = canvas.getBoundingClientRect();

    if (e.target === canvas && state.currentTool) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        addField(state.currentTool, x, y);
    }
});

// Add form field
function addField(type, x, y) {
    state.fieldCounter++;  // Increment counter for unique names
    const field = {
        id: Date.now() + state.fieldCounter,  // Ensure unique ID
        type: type,
        x: x,
        y: y,
        page: state.currentPage,
        width: type === 'checkbox' ? 20 : 150,
        height: type === 'checkbox' ? 20 : 30,
        fontSize: 12,
        fontFamily: 'Helvetica',
        textColor: '#000000',
        bgColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        name: `field_${Date.now()}_${state.fieldCounter}`,  // Unique name with counter
        value: type === 'checkmark' ? '✓' :
               type === 'cross' ? '✗' :
               type === 'arrow' ? '→' :
               type === 'star' ? '★' :
               type === 'exclamation' ? '❗' : ''
    };

    state.fields.push(field);
    renderFields();
}

// Render all fields
function renderFields() {
    // Remove existing field elements
    document.querySelectorAll('.form-field').forEach(el => el.remove());

    // Render fields for current page
    state.fields.filter(f => f.page === state.currentPage).forEach(field => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'form-field';
        fieldEl.dataset.fieldId = field.id;

        if (field.type === 'checkbox') {
            fieldEl.classList.add('checkbox');
        } else if (field.type === 'signature') {
            fieldEl.classList.add('signature');
            fieldEl.textContent = 'Signature';
        } else if (['checkmark', 'cross', 'arrow', 'star', 'exclamation'].includes(field.type)) {
            fieldEl.classList.add('indicator');
            fieldEl.textContent = field.value;
        } else {
            fieldEl.textContent = 'Text Field';
        }

        fieldEl.style.left = field.x + 'px';
        fieldEl.style.top = field.y + 'px';
        fieldEl.style.width = field.width + 'px';
        fieldEl.style.height = field.height + 'px';
        fieldEl.style.color = field.textColor;
        fieldEl.style.backgroundColor = field.bgColor;
        fieldEl.style.borderColor = field.borderColor;
        fieldEl.style.borderWidth = field.borderWidth + 'px';
        fieldEl.style.fontSize = field.fontSize + 'px';

        // Make field draggable and selectable
        fieldEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectField(field.id);

            const startX = e.clientX - field.x;
            const startY = e.clientY - field.y;

            function onMouseMove(e) {
                const canvas = state.canvas;
                const rect = canvas.getBoundingClientRect();
                field.x = e.clientX - rect.left - startX;
                field.y = e.clientY - rect.top - startY;
                renderFields();
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        document.getElementById('pdfContainer').appendChild(fieldEl);
    });
}

// Select field
function selectField(fieldId) {
    state.selectedField = state.fields.find(f => f.id === fieldId);

    // Update UI
    document.querySelectorAll('.form-field').forEach(el => {
        el.classList.remove('selected');
    });

    const fieldEl = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (fieldEl) {
        fieldEl.classList.add('selected');
    }

    // Show properties panel
    showProperties();
}

// Show properties panel
function showProperties() {
    if (!state.selectedField) return;

    const panel = document.getElementById('propertiesPanel');
    panel.style.display = 'block';

    const field = state.selectedField;
    document.getElementById('propWidth').value = field.width;
    document.getElementById('propHeight').value = field.height;
    document.getElementById('propFontSize').value = field.fontSize;
    document.getElementById('propFontFamily').value = field.fontFamily;
    document.getElementById('propTextColor').value = field.textColor;
    document.getElementById('propBgColor').value = field.bgColor;
    document.getElementById('propBorderColor').value = field.borderColor;
    document.getElementById('propBorderWidth').value = field.borderWidth;
    document.getElementById('propFieldName').value = field.name;

    // Add event listeners for property changes
    const propertyInputs = ['propWidth', 'propHeight', 'propFontSize', 'propFontFamily',
                           'propTextColor', 'propBgColor', 'propBorderColor', 'propBorderWidth', 'propFieldName'];

    propertyInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        input.onchange = () => updateFieldProperties();
    });
}

// Update field properties
function updateFieldProperties() {
    if (!state.selectedField) return;

    state.selectedField.width = parseInt(document.getElementById('propWidth').value);
    state.selectedField.height = parseInt(document.getElementById('propHeight').value);
    state.selectedField.fontSize = parseInt(document.getElementById('propFontSize').value);
    state.selectedField.fontFamily = document.getElementById('propFontFamily').value;
    state.selectedField.textColor = document.getElementById('propTextColor').value;
    state.selectedField.bgColor = document.getElementById('propBgColor').value;
    state.selectedField.borderColor = document.getElementById('propBorderColor').value;
    state.selectedField.borderWidth = parseInt(document.getElementById('propBorderWidth').value);
    state.selectedField.name = document.getElementById('propFieldName').value;

    renderFields();
}

// Delete selected field
function deleteSelectedField() {
    if (!state.selectedField) return;

    state.fields = state.fields.filter(f => f.id !== state.selectedField.id);
    state.selectedField = null;
    document.getElementById('propertiesPanel').style.display = 'none';
    renderFields();
}

// Clear all fields
function clearAll() {
    if (confirm('Are you sure you want to clear all fields?')) {
        state.fields = [];
        state.selectedField = null;
        document.getElementById('propertiesPanel').style.display = 'none';
        renderFields();
    }
}

// Signature Modal Functions
function openSignatureModal() {
    const modal = document.getElementById('signatureModal');
    modal.style.display = 'block';

    signatureCanvas = document.getElementById('signatureCanvas');
    signatureCtx = signatureCanvas.getContext('2d');

    // Set up drawing
    signatureCanvas.addEventListener('mousedown', startSignatureDrawing);
    signatureCanvas.addEventListener('mousemove', drawSignature);
    signatureCanvas.addEventListener('mouseup', stopSignatureDrawing);
    signatureCanvas.addEventListener('mouseleave', stopSignatureDrawing);

    // Touch support
    signatureCanvas.addEventListener('touchstart', handleTouchStart);
    signatureCanvas.addEventListener('touchmove', handleTouchMove);
    signatureCanvas.addEventListener('touchend', stopSignatureDrawing);
}

function closeSignatureModal() {
    document.getElementById('signatureModal').style.display = 'none';
}

function startSignatureDrawing(e) {
    isSignatureDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.beginPath();
    signatureCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function drawSignature(e) {
    if (!isSignatureDrawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    signatureCtx.strokeStyle = '#000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.stroke();
}

function stopSignatureDrawing() {
    isSignatureDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    isSignatureDrawing = true;
    signatureCtx.beginPath();
    signatureCtx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isSignatureDrawing) return;
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    signatureCtx.strokeStyle = '#000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.stroke();
}

function clearSignature() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
}

function saveSignature() {
    const signatureData = signatureCanvas.toDataURL();
    saveSignatureToStorage(signatureData);
    alert('Signature saved successfully!');
    closeSignatureModal();
}

// View saved signatures
function viewSavedSignatures() {
    const modal = document.getElementById('savedSignaturesModal');
    modal.style.display = 'block';

    const signatures = loadSavedSignatures();
    const list = document.getElementById('savedSignaturesList');
    list.innerHTML = '';

    if (signatures.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #6c757d;">No saved signatures</p>';
        return;
    }

    signatures.forEach(sig => {
        const item = document.createElement('div');
        item.className = 'saved-signature-item';
        item.innerHTML = `
            <img src="${sig.data}" alt="Signature">
            <div class="signature-actions-small">
                <button class="use-btn" onclick="useSavedSignature('${sig.data}')">Use</button>
                <button class="delete-btn" onclick="deleteSig(${sig.id})">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function closeSavedSignaturesModal() {
    document.getElementById('savedSignaturesModal').style.display = 'none';
}

function useSavedSignature(signatureData) {
    // Store signature data for the next signature field click
    state.pendingSignature = signatureData;
    state.currentTool = 'signature';

    // Activate signature tool
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const sigBtn = document.querySelector('[data-tool="signature"]');
    if (sigBtn) sigBtn.classList.add('active');

    closeSavedSignaturesModal();
    alert('Click on the PDF where you want to place the signature');
}

function deleteSig(id) {
    if (confirm('Delete this signature?')) {
        deleteSavedSignature(id);
        viewSavedSignatures();
    }
}

// Download PDF with form fields
async function downloadPDF() {
    if (!state.pdfBytes) {
        alert('Please upload a PDF first');
        return;
    }

    if (state.fields.length === 0) {
        alert('Please add at least one field before downloading');
        return;
    }

    // Check if pdf-lib is loaded
    if (typeof PDFLib === 'undefined') {
        alert('PDF library not loaded. Please refresh the page and try again.');
        console.error('PDFLib is undefined - CDN may have failed to load');
        return;
    }

    try {
        // Load the PDF with pdf-lib with multiple fallback options
        let pdfDoc;
        try {
            pdfDoc = await PDFLib.PDFDocument.load(state.pdfBytes, {
                ignoreEncryption: true,
                updateMetadata: false
            });
        } catch (loadError) {
            console.error('Failed to load PDF with default options:', loadError);
            // Try without any options as fallback
            try {
                pdfDoc = await PDFLib.PDFDocument.load(state.pdfBytes);
            } catch (fallbackError) {
                console.error('Failed to load PDF with fallback:', fallbackError);
                alert('This PDF format is not supported for editing. Try a different PDF.');
                return;
            }
        }

        const pages = pdfDoc.getPages();

        // Check for XFA forms (not supported by pdf-lib) - wrapped in try-catch
        // as the internal API may vary between pdf-lib versions
        try {
            const acroForm = pdfDoc.catalog.get(PDFLib.PDFName.of('AcroForm'));
            if (acroForm && acroForm.get) {
                const xfa = acroForm.get(PDFLib.PDFName.of('XFA'));
                if (xfa) {
                    alert('This PDF contains XFA forms which are not supported. Try a different PDF.');
                    return;
                }
            }
        } catch (xfaCheckError) {
            // XFA check failed - continue anyway, will fail later if truly incompatible
            console.warn('XFA check skipped:', xfaCheckError.message);
        }

        // Get form - wrap in try-catch as some PDFs have issues with forms
        let form;
        try {
            form = pdfDoc.getForm();
        } catch (formError) {
            console.error('Error getting form:', formError);
            alert('Error accessing PDF form structure. Try a different PDF.');
            return;
        }

        // Get existing field names to avoid conflicts
        const existingFieldNames = new Set();
        try {
            const existingFields = form.getFields();
            existingFields.forEach(f => existingFieldNames.add(f.getName()));
        } catch (e) {
            // Ignore - PDF might not have existing fields
        }

        // Embed font for text drawing
        let helveticaFont;
        try {
            helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        } catch (fontError) {
            console.error('Error embedding font:', fontError);
            alert('Error preparing PDF. Please try a different PDF.');
            return;
        }

        // Process each field
        for (const field of state.fields) {
            // Validate page index
            if (field.page < 1 || field.page > pages.length) {
                console.warn(`Skipping field with invalid page: ${field.page}`);
                continue;
            }

            const page = pages[field.page - 1];
            const { width, height } = page.getSize();

            // Convert coordinates (PDF coordinates start from bottom-left)
            // Account for canvas scale factor
            const scaledX = field.x / state.scale;
            const scaledY = field.y / state.scale;
            const scaledWidth = field.width / state.scale;
            const scaledHeight = field.height / state.scale;

            const pdfX = Math.max(0, Math.min(scaledX, width - scaledWidth));
            const pdfY = Math.max(0, Math.min(height - scaledY - scaledHeight, height - scaledHeight));

            // Parse colors with fallback
            const rgb = hexToRgb(field.textColor) || { r: 0, g: 0, b: 0 };
            const bgRgb = hexToRgb(field.bgColor) || { r: 255, g: 255, b: 255 };
            const borderRgb = hexToRgb(field.borderColor) || { r: 0, g: 0, b: 0 };

            // Generate unique field name if conflict exists
            let fieldName = field.name;
            let nameCounter = 1;
            while (existingFieldNames.has(fieldName)) {
                fieldName = `${field.name}_${nameCounter}`;
                nameCounter++;
            }
            existingFieldNames.add(fieldName);

            try {
                if (field.type === 'text') {
                    const textField = form.createTextField(fieldName);
                    textField.addToPage(page, {
                        x: pdfX,
                        y: pdfY,
                        width: scaledWidth,
                        height: scaledHeight,
                        textColor: PDFLib.rgb(rgb.r / 255, rgb.g / 255, rgb.b / 255),
                        backgroundColor: PDFLib.rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255),
                        borderColor: PDFLib.rgb(borderRgb.r / 255, borderRgb.g / 255, borderRgb.b / 255),
                        borderWidth: field.borderWidth,
                    });
                    textField.setFontSize(field.fontSize / state.scale);
                } else if (field.type === 'checkbox') {
                    const checkBox = form.createCheckBox(fieldName);
                    checkBox.addToPage(page, {
                        x: pdfX,
                        y: pdfY,
                        width: scaledWidth,
                        height: scaledHeight,
                        borderColor: PDFLib.rgb(borderRgb.r / 255, borderRgb.g / 255, borderRgb.b / 255),
                        borderWidth: field.borderWidth,
                    });
                } else if (field.type === 'signature') {
                    // Draw signature area
                    page.drawRectangle({
                        x: pdfX,
                        y: pdfY,
                        width: scaledWidth,
                        height: scaledHeight,
                        borderColor: PDFLib.rgb(borderRgb.r / 255, borderRgb.g / 255, borderRgb.b / 255),
                        borderWidth: field.borderWidth,
                        color: PDFLib.rgb(bgRgb.r / 255, bgRgb.g / 255, bgRgb.b / 255),
                    });

                    // Add a text field for signature
                    const sigField = form.createTextField(fieldName);
                    sigField.addToPage(page, {
                        x: pdfX,
                        y: pdfY,
                        width: scaledWidth,
                        height: scaledHeight,
                    });
                } else if (['checkmark', 'cross', 'arrow', 'star', 'exclamation'].includes(field.type)) {
                    // Draw indicator symbols using PDF-safe ASCII characters with embedded font
                    const pdfSafeSymbol = PDF_SAFE_SYMBOLS[field.type] || 'X';
                    page.drawText(pdfSafeSymbol, {
                        x: pdfX,
                        y: pdfY + 5,
                        size: (field.fontSize * 1.5) / state.scale,
                        font: helveticaFont,
                        color: PDFLib.rgb(rgb.r / 255, rgb.g / 255, rgb.b / 255),
                    });
                }
            } catch (fieldError) {
                console.error(`Error adding field ${fieldName}:`, fieldError);
                // Continue with other fields even if one fails
            }
        }

        // Save the PDF with fallback options
        let pdfBytes;
        try {
            pdfBytes = await pdfDoc.save();
        } catch (saveError) {
            console.error('Error saving with default options:', saveError);
            // Try with different save options
            try {
                pdfBytes = await pdfDoc.save({
                    useObjectStreams: false,
                    updateFieldAppearances: false
                });
            } catch (fallbackSaveError) {
                console.error('Error saving with fallback options:', fallbackSaveError);
                alert('Error saving PDF. The PDF structure may be incompatible.');
                return;
            }
        }

        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fillable-form.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('PDF downloaded successfully!');
    } catch (error) {
        console.error('Error creating PDF:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error creating PDF: ' + (error.message || 'Unknown error. Check console for details.'));
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Close modals when clicking outside
window.onclick = function(event) {
    const signatureModal = document.getElementById('signatureModal');
    const savedSignaturesModal = document.getElementById('savedSignaturesModal');

    if (event.target === signatureModal) {
        closeSignatureModal();
    }
    if (event.target === savedSignaturesModal) {
        closeSavedSignaturesModal();
    }
}

// Initialize
console.log('PDF Form Builder initialized');
