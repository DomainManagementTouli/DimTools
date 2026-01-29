
// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- APPLICATION STATE ---
const state = {
    pdfDoc: null,
    pdfBytes: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.5,
    currentTool: null,
    fields: [],
    selectedField: null,
    pendingSignature: null, // Holds signature data to be placed
    isPlacingSignature: false,
    fieldCounter: 0,
    history: [], // For undo functionality
    historyIndex: -1,
};

// --- DOM ELEMENTS ---
const pdfContainer = document.getElementById('pdfContainer');
const propertiesPanel = document.getElementById('propertiesPanel');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
const statusMessage = document.getElementById('statusMessage');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // PDF Upload
    document.getElementById('pdfUpload').addEventListener('change', handlePdfUpload);

    // Toolbar Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTool(btn.dataset.tool));
    });

    // Canvas Interaction
    pdfContainer.addEventListener('click', handleCanvasClick);

    // Properties Panel
    propertiesPanel.addEventListener('input', handlePropertyChange);
    document.getElementById('deleteFieldBtn').addEventListener('click', deleteSelectedField);

    // Actions
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);

    // Signature Modal
    document.getElementById('createSignatureBtn').addEventListener('click', openSignatureModal);
    document.getElementById('viewSignaturesBtn').addEventListener('click', viewSavedSignatures);
    document.getElementById('saveSignatureBtn').addEventListener('click', saveSignature);
    document.getElementById('clearSignatureBtn').addEventListener('click', clearSignature);

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyPress);

    showToast('App initialized. Upload a PDF to start.');
});


// --- PDF HANDLING ---
async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        showStatus('Please select a valid PDF file.', 'error');
        return;
    }

    showStatus('Loading PDF...', 'processing');
    try {
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
            state.pdfBytes = new Uint8Array(event.target.result);
            await loadPdf(state.pdfBytes);
            showStatus('PDF loaded successfully. You can now add fields.', 'success');
            uploadPlaceholder.style.display = 'none';
        };
        fileReader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Error reading file:', error);
        showStatus('Could not read the PDF file.', 'error');
    }
}

async function loadPdf(pdfBytes) {
    try {
        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
        state.pdfDoc = await loadingTask.promise;
        state.totalPages = state.pdfDoc.numPages;
        state.currentPage = 1;
        resetStateForNewPdf();
        await renderPage(state.currentPage);
    } catch (error) {
        console.error('Error loading PDF:', error);
        showStatus('This PDF is corrupted or not supported.', 'error');
    }
}

async function renderPage(pageNum) {
    if (!state.pdfDoc) return;
    try {
        const page = await state.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.scale });

        let canvas = document.getElementById('pdfCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'pdfCanvas';
            pdfContainer.appendChild(canvas);
        }
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        renderFields();
        updatePageControls();
    } catch (error) {
        console.error(`Error rendering page ${pageNum}:`, error);
        showStatus(`Error rendering page ${pageNum}.`, 'error');
    }
}

// --- FIELD MANIPULATION ---

function addField(type, x, y) {
    state.fieldCounter++;
    const id = `field_${Date.now()}_${state.fieldCounter}`;

    const newField = {
        id,
        type,
        page: state.currentPage,
        x,
        y,
        width: 150,
        height: 30,
        name: `field_${state.fieldCounter}`,
        // Type-specific properties
        ...(type === 'text' && { value: '', placeholder: 'Enter text...' }),
        ...(type === 'checkbox' && { value: false, width: 20, height: 20 }),
        ...(type === 'signature' && { value: null, width: 200, height: 60 }),
    };

    // If placing a pending signature, assign it
    if (type === 'signature' && state.pendingSignature) {
        newField.value = state.pendingSignature;
        state.pendingSignature = null;
        state.isPlacingSignature = false;
        document.body.classList.remove('placing-signature');
        showToast('Signature placed.');
    }

    saveStateForUndo();
    state.fields.push(newField);
    renderFields();
    selectField(id);
}

function selectTool(tool) {
    state.currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    document.body.style.cursor = 'crosshair';

    if (tool === 'signature') {
        const savedSignatures = getSavedSignatures();
        if (savedSignatures.length === 0 && !state.pendingSignature) {
            showToast('No saved signatures. Please create one first.', 'info');
            openSignatureModal();
        } else if (!state.pendingSignature) {
            showToast('Select a signature from the "Saved Signatures" list to place it.', 'info');
            viewSavedSignatures();
        }
    }
}

function handleCanvasClick(e) {
    if (!state.pdfDoc || !state.currentTool) return;
    if (e.target.id !== 'pdfCanvas') return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (state.currentTool === 'signature' && !state.pendingSignature) {
        showToast('Please create or select a signature before placing it.', 'error');
        return;
    }

    addField(state.currentTool, x, y);

    // Deactivate tool after placing a field
    state.currentTool = null;
    document.body.style.cursor = 'default';
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
}

function renderFields() {
    // Clear existing fields
    document.querySelectorAll('.form-field').forEach(el => el.remove());

    const fieldsOnCurrentPage = state.fields.filter(f => f.page === state.currentPage);

    fieldsOnCurrentPage.forEach(field => {
        const el = document.createElement('div');
        el.className = `form-field ${field.type}-field`;
        el.dataset.fieldId = field.id;
        el.style.left = `${field.x}px`;
        el.style.top = `${field.y}px`;
        el.style.width = `${field.width}px`;
        el.style.height = `${field.height}px`;

        if (field.type === 'signature' && field.value) {
            el.innerHTML = `<img src="${field.value}" alt="Signature" style="width: 100%; height: 100%;" />`;
        } else if (field.type === 'checkbox') {
             el.innerHTML = '✔';
             el.style.fontSize = '20px';
             el.style.textAlign = 'center';
        } else {
            el.textContent = field.placeholder || field.type;
        }

        makeDraggable(el, field);
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            selectField(field.id);
        });

        pdfContainer.appendChild(el);
    });
}

function selectField(fieldId) {
    state.selectedField = state.fields.find(f => f.id === fieldId);
    document.querySelectorAll('.form-field').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-field-id="${fieldId}"]`).classList.add('selected');
    updatePropertiesPanel();
}

function deleteSelectedField() {
    if (!state.selectedField) {
        showToast('No field selected.', 'error');
        return;
    }
    saveStateForUndo();
    state.fields = state.fields.filter(f => f.id !== state.selectedField.id);
    state.selectedField = null;
    propertiesPanel.style.display = 'none';
    renderFields();
    showToast('Field deleted.');
}


// --- UI & UX ---

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, duration);
}

function updatePropertiesPanel() {
    if (!state.selectedField) {
        propertiesPanel.style.display = 'none';
        return;
    }
    const { name, width, height } = state.selectedField;
    document.getElementById('propName').value = name;
    document.getElementById('propWidth').value = width;
    document.getElementById('propHeight').value = height;
    propertiesPanel.style.display = 'block';
}

function handlePropertyChange(e) {
    if (!state.selectedField) return;

    saveStateForUndo();
    const { id, value } = e.target;
    const prop = id.replace('prop', '').toLowerCase();
    state.selectedField[prop] = (prop === 'name') ? value : parseInt(value, 10);

    // Live update the field element
    const fieldEl = document.querySelector(`[data-field-id="${state.selectedField.id}"]`);
    if (fieldEl) {
        fieldEl.style.width = `${state.selectedField.width}px`;
        fieldEl.style.height = `${state.selectedField.height}px`;
    }
}

function makeDraggable(element, field) {
    let offsetX, offsetY;

    const onMouseDown = (e) => {
        e.preventDefault();
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        selectField(field.id);
    };

    const onMouseMove = (e) => {
        const parentRect = pdfContainer.getBoundingClientRect();
        field.x = e.clientX - parentRect.left - offsetX;
        field.y = e.clientY - parentRect.top - offsetY;
        element.style.left = `${field.x}px`;
        element.style.top = `${field.y}px`;
    };

    const onMouseUp = () => {
        saveStateForUndo();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    element.addEventListener('mousedown', onMouseDown);
}


// --- SIGNATURE HANDLING ---

let signaturePad;

function openSignatureModal() {
    const modal = document.getElementById('signatureModal');
    modal.style.display = 'block';
    if (!signaturePad) {
        const canvas = document.getElementById('signatureCanvas');
        signaturePad = new SignaturePad(canvas, {
             backgroundColor: 'rgb(255, 255, 255)'
        });
    }
    signaturePad.clear();
}

function closeSignatureModal() {
    document.getElementById('signatureModal').style.display = 'none';
}

function clearSignature() {
    signaturePad.clear();
}

function saveSignature() {
    if (signaturePad.isEmpty()) {
        showToast('Please provide a signature first.', 'error');
        return;
    }
    const dataURL = signaturePad.toDataURL('image/png');
    const signatures = getSavedSignatures();
    signatures.push({ id: Date.now(), data: dataURL });
    localStorage.setItem('pdfSignatures', JSON.stringify(signatures));
    showToast('Signature saved!', 'success');
    closeSignatureModal();
    viewSavedSignatures(); // Refresh list
}

function getSavedSignatures() {
    return JSON.parse(localStorage.getItem('pdfSignatures') || '[]');
}

function viewSavedSignatures() {
    const list = document.getElementById('savedSignaturesList');
    list.innerHTML = '';
    const signatures = getSavedSignatures();
    if (signatures.length === 0) {
        list.innerHTML = '<p>No saved signatures.</p>';
        return;
    }
    signatures.forEach(sig => {
        const item = document.createElement('div');
        item.className = 'saved-signature-item';
        item.innerHTML = `
            <img src="${sig.data}" alt="Saved Signature" />
            <div class="actions">
                <button class="use-sig-btn">Use</button>
                <button class="del-sig-btn">Delete</button>
            </div>
        `;
        item.querySelector('.use-sig-btn').onclick = () => {
            state.pendingSignature = sig.data;
            selectTool('signature');
            closeSavedSignaturesModal();
            showToast('Click on the PDF to place the signature.', 'info');
        };
        item.querySelector('.del-sig-btn').onclick = () => {
            deleteSignature(sig.id);
        };
        list.appendChild(item);
    });
    document.getElementById('savedSignaturesModal').style.display = 'block';
}

function deleteSignature(id) {
    let signatures = getSavedSignatures();
    signatures = signatures.filter(sig => sig.id !== id);
    localStorage.setItem('pdfSignatures', JSON.stringify(signatures));
    viewSavedSignatures(); // Refresh list
    showToast('Signature deleted.');
}

function closeSavedSignaturesModal() {
    document.getElementById('savedSignaturesModal').style.display = 'none';
}


// --- PDF GENERATION ---

async function downloadPDF() {
    if (!state.pdfDoc) {
        showToast('No PDF loaded.', 'error');
        return;
    }
    if (state.fields.length === 0) {
        showToast('Please add at least one field.', 'error');
        return;
    }

    showStatus('Generating your PDF...', 'processing');

    try {
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.load(state.pdfBytes);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        for (const field of state.fields) {
            const page = pages[field.page - 1];
            if (!page) continue;

            const { width, height } = page.getSize();
            const fieldX = field.x / state.scale;
            const fieldY = height - (field.y / state.scale) - (field.height / state.scale);
            const fieldWidth = field.width / state.scale;
            const fieldHeight = field.height / state.scale;

            if (field.type === 'text') {
                const textField = pdfDoc.getForm().createTextField(field.name);
                textField.setText(field.value || '');
                textField.addToPage(page, {
                    x: fieldX,
                    y: fieldY,
                    width: fieldWidth,
                    height: fieldHeight,
                    font,
                    textColor: rgb(0, 0, 0),
                    backgroundColor: rgb(1, 1, 1),
                    borderWidth: 1,
                    borderColor: rgb(0.5, 0.5, 0.5),
                });
            } else if (field.type === 'checkbox') {
                const checkBox = pdfDoc.getForm().createCheckBox(field.name);
                if (field.value) checkBox.check();
                checkBox.addToPage(page, {
                    x: fieldX,
                    y: fieldY,
                    width: fieldWidth,
                    height: fieldHeight,
                    borderWidth: 1,
                    borderColor: rgb(0, 0, 0),
                });
            } else if (field.type === 'signature' && field.value) {
                const pngImage = await pdfDoc.embedPng(field.value);
                page.drawImage(pngImage, {
                    x: fieldX,
                    y: fieldY,
                    width: fieldWidth,
                    height: fieldHeight,
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'filled-form.pdf';
        link.click();

        showStatus('PDF downloaded successfully!', 'success');

    } catch (error) {
        console.error('Error during PDF generation:', error);
        showStatus('Failed to generate PDF. See console for details.', 'error');
    }
}


// --- UTILITY & STATE MANAGEMENT ---

function resetStateForNewPdf() {
    state.fields = [];
    state.selectedField = null;
    state.history = [];
    state.historyIndex = -1;
    document.querySelectorAll('.form-field').forEach(el => el.remove());
    propertiesPanel.style.display = 'none';
}

function updatePageControls() {
    const pageNumEl = document.getElementById('pageNum');
    const pageCountEl = document.getElementById('pageCount');
    if(pageNumEl){
        pageNumEl.textContent = state.currentPage;
    }
    if(pageCountEl){
        pageCountEl.textContent = state.totalPages;
    }
}

function clearAll() {
    if (confirm('Are you sure you want to clear all fields on this PDF?')) {
        saveStateForUndo();
        state.fields = [];
        state.selectedField = null;
        renderFields();
        propertiesPanel.style.display = 'none';
        showToast('All fields cleared.');
    }
}

function saveStateForUndo() {
    // Truncate history if we've undone
    state.history = state.history.slice(0, state.historyIndex + 1);
    // Deep copy of fields
    state.history.push(JSON.parse(JSON.stringify(state.fields)));
    state.historyIndex++;
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.fields = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        renderFields();
        state.selectedField = null;
        propertiesPanel.style.display = 'none';
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.fields = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        renderFields();
        state.selectedField = null;
        propertiesPanel.style.display = 'none';
    }
}

function handleKeyPress(e) {
    // Undo (Ctrl+Z)
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    // Redo (Ctrl+Y)
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
    }
    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedField && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            deleteSelectedField();
        }
    }
}

// Close modals
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
