/* ═══════════════════════════════════════════════════════════
   WRAP-TEXT-TOOL - ADDED SQUARE & TRIANGLE
   ═══════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════
const state = {
    canvas: null,
    ctx: null,
    
    // Mode
    mode: 'shape', // 'shape' or 'circleText'
    
    // Shape Settings
    currentShape: 'flower', // 'circle', 'square', 'triangle', 'polygon', 'flower'
    shapeSize: 250,
    shapeBorderColor: '#8B4513',
    shapeBgColor: '#FFFFFF',
    
    // Wrap Settings
    wrapMode: 'left', // 'left' or 'right'
    
    // Text Settings
    text: '',
    fontSize: 24,
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
    
    // Circle Text Settings
    circleTextSize: 300,
    
    // Image Settings
    uploadedImage: null,
    imageX: 0,
    imageY: 0,
    imageScale: 1,
    imageZoom: 100,
    
    // Drag State
    isDragging: false,
    lastTouchX: 0,
    lastTouchY: 0,
    
    // Watermark
    showWatermark: true
};

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════
function init() {
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    resizeCanvas();
    loadDefaultText();
    setupEventListeners();
    render();
}

function resizeCanvas() {
    const wrapper = state.canvas.parentElement;
    const width = wrapper.clientWidth;
    const height = Math.max(500, width * 1.0);
    state.canvas.width = width;
    state.canvas.height = height;
    render();
}

function loadDefaultText() {
    const defaultText = `తెలుగు భాష భారతదేశంలోని అత్యంత పురాతన భాషల్లో ఒకటి. ఇది ద్రావిడ భాష కుటుంబానికి చెందినది. తెలుగు ప్రవంచంలోని అతి వేగంగా వృద్ధి చెందుతున్న భాషల్లో ఒకటిగా గుర్తించబడింది. ఈ భాష దాదాపు 8 కోట్ల మంది మాతృభాషగా మాట్లాడుతున్నారు. తెలుగు లిపి సుందరమైన వృత్తాకార రూపాలతో ప్రసిద్ధి చెందింది. ఇది చాలా శాస్త్రీయమైన లిపి. తెలుగు సాహిత్యం చాలా గొప్పది. అనేక మహాకవులు తెలుగు భాషకు కీర్తి తెచ్చారు. నన్నయ, తిక్కన, ఎర్రప్రగడ వంటి కవులు తెలుగు సాహిత్యానికి గొప్ప సేవ చేశారు. తెలుగు సినిమా పరిశ్రమ భారతదేశంలో అతిపెద్ద పరిశ్రమలలో ఒకటి.`;
    state.text = defaultText;
    document.getElementById('textInput').value = defaultText;
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
function setupEventListeners() {
    // SHAPE BUTTONS
    const setShapeBtn = (id, shape) => {
        document.getElementById(id).addEventListener('click', () => setShape(shape));
    };
    setShapeBtn('btnCircleShape', 'circle');
    setShapeBtn('btnSquareShape', 'square');
    setShapeBtn('btnTriangleShape', 'triangle');
    setShapeBtn('btnPolygonShape', 'polygon');
    setShapeBtn('btnFlowerShape', 'flower');
    
    // Image
    document.getElementById('btnUploadImage').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    
    // Modes
    document.getElementById('btnCircleText').addEventListener('click', toggleCircleTextMode);
    document.getElementById('btnLeftWrap').addEventListener('click', () => setWrapMode('left'));
    document.getElementById('btnRightWrap').addEventListener('click', () => setWrapMode('right'));
    
    // Sliders
    const bindSlider = (id, prop, unit = '', scaleFn) => {
        document.getElementById(id).addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            state[prop] = val;
            if(scaleFn) scaleFn(val);
            document.getElementById(id.replace('Slider', 'Value')).textContent = val + unit;
            render();
        });
    };

    bindSlider('shapeSizeSlider', 'shapeSize');
    bindSlider('circleTextSizeSlider', 'circleTextSize');
    bindSlider('imageZoomSlider', 'imageZoom', '%', (v) => state.imageScale = v/100);
    bindSlider('fontSizeSlider', 'fontSize', 'px');
    
    // Colors & Text
    document.getElementById('textInput').addEventListener('input', (e) => { state.text = e.target.value; render(); });
    document.getElementById('textColorPicker').addEventListener('input', (e) => { state.textColor = e.target.value; render(); });
    document.getElementById('shapeBorderColorPicker').addEventListener('input', (e) => { state.shapeBorderColor = e.target.value; render(); });
    document.getElementById('bgColorPicker').addEventListener('input', (e) => { state.backgroundColor = e.target.value; render(); });
    document.getElementById('shapeBgPicker').addEventListener('input', (e) => { state.shapeBgColor = e.target.value; render(); });

    // Download
    document.getElementById('btnDownloadAuto').addEventListener('click', () => downloadCanvas('auto'));
    document.getElementById('btnDownloadPortrait').addEventListener('click', () => downloadCanvas('portrait'));
    document.getElementById('btnDownloadLandscape').addEventListener('click', () => downloadCanvas('landscape'));
    
    // Drag
    state.canvas.addEventListener('mousedown', startDrag);
    state.canvas.addEventListener('mousemove', drag);
    state.canvas.addEventListener('mouseup', endDrag);
    state.canvas.addEventListener('mouseleave', endDrag);
    state.canvas.addEventListener('touchstart', startDrag);
    state.canvas.addEventListener('touchmove', drag);
    state.canvas.addEventListener('touchend', endDrag);

    window.addEventListener('resize', resizeCanvas);
}

// ═══════════════════════════════════════════════════════════
// STATE HELPERS
// ═══════════════════════════════════════════════════════════
function setShape(shape) {
    state.currentShape = shape;
    document.querySelectorAll('.shape-buttons .control-btn').forEach(btn => btn.classList.remove('active'));
    
    let btnId = 'btnCircleShape';
    if(shape === 'square') btnId = 'btnSquareShape';
    if(shape === 'triangle') btnId = 'btnTriangleShape';
    if(shape === 'polygon') btnId = 'btnPolygonShape';
    if(shape === 'flower') btnId = 'btnFlowerShape';
    
    document.getElementById(btnId).classList.add('active');
    render();
}

function toggleCircleTextMode() {
    state.mode = state.mode === 'circleText' ? 'shape' : 'circleText';
    const isCircle = state.mode === 'circleText';
    document.getElementById('btnCircleText').classList.toggle('active', isCircle);
    document.getElementById('circleTextSizeSection').style.display = isCircle ? 'block' : 'none';
    document.getElementById('imageZoomSection').style.display = isCircle ? 'none' : 'block';
    render();
}

function setWrapMode(mode) {
    state.wrapMode = mode;
    document.getElementById('btnLeftWrap').classList.toggle('active', mode === 'left');
    document.getElementById('btnRightWrap').classList.toggle('active', mode === 'right');
    render();
}

// ═══════════════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════════════
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            state.uploadedImage = img;
            state.imageX = 0; state.imageY = 0; state.imageScale = 1; state.imageZoom = 100;
            document.getElementById('imageZoomValue').textContent = '100%';
            document.getElementById('imageZoomSlider').value = 100;
            render();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function startDrag(e) {
    if (!state.uploadedImage || state.mode === 'circleText') return;
    state.isDragging = true;
    const pos = getMousePos(e);
    state.lastTouchX = pos.x; state.lastTouchY = pos.y;
}
function drag(e) {
    if (!state.isDragging) return;
    e.preventDefault();
    const pos = getMousePos(e);
    state.imageX += pos.x - state.lastTouchX;
    state.imageY += pos.y - state.lastTouchY;
    state.lastTouchX = pos.x; state.lastTouchY = pos.y;
    render();
}
function endDrag() { state.isDragging = false; }
function getMousePos(e) {
    const rect = state.canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - rect.left, y: y - rect.top };
}

// ═══════════════════════════════════════════════════════════
// RENDER LOOP
// ═══════════════════════════════════════════════════════════
function render() {
    const ctx = state.ctx;
    const w = state.canvas.width;
    const h = state.canvas.height;

    // 1. FILL BACKGROUND
    ctx.fillStyle = state.backgroundColor;
    ctx.fillRect(0, 0, w, h);
    
    // 2. Watermark
    if (state.showWatermark) drawWatermark();
    
    // 3. Render Mode
    if (state.mode === 'circleText') {
        renderCircleText();
    } else {
        renderShapeWrap();
    }
}

function drawWatermark() {
    const ctx = state.ctx;
    ctx.save();
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = 'rgba(100, 100, 100, 0.08)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const text = 'wrap-text-tool';
    for (let y = -50; y < state.canvas.height + 100; y += 150) {
        for (let x = -100; x < state.canvas.width + 200; x += 300) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6);
            ctx.fillText(text, 0, 0);
            ctx.restore();
        }
    }
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// MODE 1: SHAPE WRAP
// ═══════════════════════════════════════════════════════════
function renderShapeWrap() {
    const margin = 30;
    const centerX = state.wrapMode === 'left' 
        ? state.shapeSize / 2 + margin 
        : state.canvas.width - state.shapeSize / 2 - margin;
    
    const centerY = state.shapeSize / 2 + margin + 10;
    const radius = state.shapeSize / 2;

    const ctx = state.ctx;

    // 1. Shape Fill & Image
    ctx.save();
    ctx.beginPath();
    drawShapePath(ctx, centerX, centerY, radius);
    ctx.clip();
    ctx.fillStyle = state.shapeBgColor;
    ctx.fill();
    if (state.uploadedImage) {
        const img = state.uploadedImage;
        const w = img.width * state.imageScale;
        const h = img.height * state.imageScale;
        ctx.drawImage(img, centerX - w/2 + state.imageX, centerY - h/2 + state.imageY, w, h);
    }
    ctx.restore();

    // 2. Shape Border
    ctx.save();
    ctx.strokeStyle = state.shapeBorderColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    drawShapePath(ctx, centerX, centerY, radius);
    ctx.stroke();
    ctx.restore();

    // 3. Wrapped Text
    drawWrappedText(centerX, centerY, radius);
}

// ═══════════════════════════════════════════════════════════
// SHAPE ALGORITHMS (UPDATED FOR SQUARE & TRIANGLE)
// ═══════════════════════════════════════════════════════════
function drawShapePath(ctx, cx, cy, r) {
    const s = state.currentShape;
    
    if (s === 'circle') {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } 
    else if (s === 'square') {
        // Rounded Square: 4 sides, rotated 45 deg to be flat
        drawRoundedPolygon(ctx, cx, cy, r, 4, Math.PI / 4);
    }
    else if (s === 'triangle') {
        // Rounded Triangle: 3 sides, no rotation (points up)
        drawRoundedPolygon(ctx, cx, cy, r, 3, 0);
    }
    else if (s === 'polygon') {
        // Rounded Dodecagon
        drawRoundedPolygon(ctx, cx, cy, r, 12, 0);
    } 
    else if (s === 'flower') {
        // Scalloped Badge
        drawScallopedFlower(ctx, cx, cy, r);
    }
}

// Generic Rounded Polygon Function (Handles Triangle, Square, Polygon)
function drawRoundedPolygon(ctx, cx, cy, r, sides, angleOffset = 0) {
    const cornerRadius = 25; // Soft corners
    const angleStep = (Math.PI * 2) / sides;
    const vertices = [];

    // Calculate vertices
    for (let i = 0; i < sides; i++) {
        // -PI/2 to start at top, plus custom offset
        const angle = i * angleStep - Math.PI / 2 + angleOffset;
        vertices.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle)
        });
    }

    // Draw path with rounded corners
    const pLast = vertices[sides - 1];
    const pFirst = vertices[0];
    // Start at midpoint of the last side
    ctx.moveTo((pLast.x + pFirst.x) / 2, (pLast.y + pFirst.y) / 2);

    for (let i = 0; i < sides; i++) {
        const pCurr = vertices[i];
        const pNext = vertices[(i + 1) % sides];
        const midNextX = (pCurr.x + pNext.x) / 2;
        const midNextY = (pCurr.y + pNext.y) / 2;
        
        ctx.arcTo(pCurr.x, pCurr.y, midNextX, midNextY, cornerRadius);
        ctx.lineTo(midNextX, midNextY);
    }
    ctx.closePath();
}

function drawScallopedFlower(ctx, cx, cy, r) {
    const petals = 12;
    const variance = 0.08;
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
        const scale = 1 - variance + variance * Math.cos(petals * angle);
        const currentR = r * scale;
        const x = cx + currentR * Math.cos(angle - Math.PI/2);
        const y = cy + currentR * Math.sin(angle - Math.PI/2);
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}

// ═══════════════════════════════════════════════════════════
// TEXT WRAPPING (UPDATED FOR SQUARE & TRIANGLE)
// ═══════════════════════════════════════════════════════════
function drawWrappedText(shapeCenterX, shapeCenterY, radius) {
    const lines = state.text.split('\n');
    const fontSize = state.fontSize;
    const lineHeight = fontSize * 1.6;
    
    state.ctx.save();
    state.ctx.font = `${fontSize}px 'Noto Sans Telugu', Arial`;
    state.ctx.fillStyle = state.textColor;
    state.ctx.textAlign = 'left';
    state.ctx.textBaseline = 'top';
    
    let currentY = 20;
    
    lines.forEach(line => {
        const words = line.split(' ');
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            
            // Calculate layout for this line
            const layout = getLineLayout(currentY, lineHeight, shapeCenterX, shapeCenterY, radius);
            const metrics = state.ctx.measureText(testLine);
            
            if (metrics.width > layout.width && currentLine !== '') {
                if (layout.width > 0) state.ctx.fillText(currentLine, layout.x, currentY);
                currentLine = word;
                currentY += lineHeight;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            const layout = getLineLayout(currentY, lineHeight, shapeCenterX, shapeCenterY, radius);
            if (layout.width > 0) state.ctx.fillText(currentLine, layout.x, currentY);
            currentY += lineHeight;
        }
    });
    
    state.ctx.restore();
}

// Calculates text margins based on Shape Type
function getLineLayout(y, lineHeight, cx, cy, r) {
    const canvasW = state.canvas.width;
    const margin = 15;
    
    let xOffset = -9999; // Default: No obstruction
    const dy = y + (lineHeight/2) - cy; // Vertical distance from center
    
    // --- COLLISION LOGIC ---
    
    if (state.currentShape === 'square') {
        // BOX COLLISION (Rounded Square)
        // A square rotated 45deg in polygon logic with r is roughly width 2r*cos(45).
        // Actually, my rounded square drawing uses radius to corners. 
        // Distance to side is r * cos(45) ~= 0.707 * r.
        const halfSize = r * Math.cos(Math.PI/4); // Distance from center to flat side
        
        // Simple Box Check
        if (Math.abs(dy) < halfSize + margin) {
            xOffset = halfSize + margin; // Constant width
        }
    } 
    else if (state.currentShape === 'triangle') {
        // TRIANGLE COLLISION
        // Triangle points UP. Top is at y = cy - r. Bottom is roughly cy + 0.5r.
        // Bounds for text wrapping
        const topY = -r;
        const bottomY = 0.5 * r; // Base of equilateral roughly
        
        if (dy > topY - margin && dy < bottomY + margin) {
            // Calculate width at this Y
            // At top (-r), width is 0. At bottom (0.5r), width is ~0.866r
            // Linear interpolation
            // Width factor goes from 0 to 1 as Y goes from Top to Bottom
            const totalH = bottomY - topY;
            const currentH = dy - topY;
            const factor = Math.max(0, currentH / totalH);
            
            const maxHalfWidth = r * 0.866; // cos(30)
            const currentHalfWidth = maxHalfWidth * factor;
            
            xOffset = currentHalfWidth + margin;
        }
    }
    else {
        // CIRCULAR COLLISION (Circle, Polygon, Flower)
        let collisionR = r;
        if (state.currentShape === 'polygon') collisionR = r * 0.96;
        if (state.currentShape === 'flower') collisionR = r * 0.95;
        
        if (Math.abs(dy) < collisionR + margin) {
            xOffset = Math.sqrt(Math.pow(collisionR + margin, 2) - Math.pow(dy, 2));
        }
    }

    // --- WRAP LOGIC ---
    
    let startX, maxWidth;
    const isObstructed = xOffset !== -9999;
    
    if (state.wrapMode === 'left') {
        // LEFT WRAP: Shape on Left
        if (isObstructed) {
            startX = cx + xOffset;
            maxWidth = canvasW - startX - margin;
        } else {
            startX = margin;
            maxWidth = canvasW - (margin * 2);
        }
    } else {
        // RIGHT WRAP: Shape on Right
        if (isObstructed) {
            startX = margin;
            maxWidth = (cx - xOffset) - margin;
        } else {
            startX = margin;
            maxWidth = canvasW - (margin * 2);
        }
    }
    
    return { x: Math.max(0, startX), width: Math.max(0, maxWidth) };
}

// ═══════════════════════════════════════════════════════════
// CIRCLE TEXT MODE
// ═══════════════════════════════════════════════════════════
function renderCircleText() {
    const cx = state.canvas.width / 2;
    const cy = state.canvas.height / 2;
    const r = state.circleTextSize / 2;
    
    state.ctx.save();
    state.ctx.fillStyle = state.shapeBgColor;
    state.ctx.beginPath();
    state.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    state.ctx.fill();
    state.ctx.restore();
    
    state.ctx.save();
    state.ctx.strokeStyle = state.shapeBorderColor;
    state.ctx.lineWidth = 3;
    state.ctx.setLineDash([10, 5]);
    state.ctx.beginPath();
    state.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    state.ctx.stroke();
    state.ctx.restore();
    
    drawTextInsideCircle(cx, cy, r);
}

function drawTextInsideCircle(cx, cy, r) {
    const lines = state.text.split('\n');
    const fontSize = state.fontSize;
    const lineHeight = fontSize * 1.5;
    
    state.ctx.save();
    state.ctx.font = `${fontSize}px 'Noto Sans Telugu', Arial`;
    state.ctx.fillStyle = state.textColor;
    state.ctx.textAlign = 'center';
    state.ctx.textBaseline = 'middle';
    
    let currentY = cy - r + (r * 0.3);
    
    lines.forEach(line => {
        const words = line.split(' ');
        let currentLine = '';
        for (let word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const dy = Math.abs(currentY - cy);
            if (dy >= r - 20) break;
            const availableWidth = 2 * Math.sqrt(r*r - dy*dy) - 40;
            
            if (state.ctx.measureText(testLine).width > availableWidth && currentLine) {
                state.ctx.fillText(currentLine, cx, currentY);
                currentLine = word;
                currentY += lineHeight;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            state.ctx.fillText(currentLine, cx, currentY);
            currentY += lineHeight;
        }
    });
    state.ctx.restore();
}

// ═══════════════════════════════════════════════════════════
// DOWNLOAD
// ═══════════════════════════════════════════════════════════
function downloadCanvas(orientation) {
    state.showWatermark = false;
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    if (orientation === 'portrait') { exportCanvas.width = 1080; exportCanvas.height = 1920; }
    else if (orientation === 'landscape') { exportCanvas.width = 1920; exportCanvas.height = 1080; }
    else { exportCanvas.width = state.canvas.width * 2; exportCanvas.height = state.canvas.height * 2; }
    
    const oldC = state.canvas; const oldCtx = state.ctx;
    state.canvas = exportCanvas; state.ctx = exportCtx;
    
    render(); // Draw with background fill
    
    exportCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wrap-text-${orientation}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
    });
    
    state.canvas = oldC; state.ctx = oldCtx;
    state.showWatermark = true;
    render();
}

document.addEventListener('DOMContentLoaded', init);