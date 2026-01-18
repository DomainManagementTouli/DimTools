# Installation Guide - Professional Music Visualizer

## For Windows Users

### Step 1: Install Python

1. Download Python 3.8 or higher from [python.org](https://www.python.org/downloads/)
2. **IMPORTANT**: During installation, check the box that says "Add Python to PATH"
3. Complete the installation

### Step 2: Install Dependencies

Open Command Prompt (cmd) or PowerShell in the `music_visualizer` folder and run:

```bash
pip install -r requirements.txt
```

This will install all required libraries:
- pygame (graphics and audio)
- librosa (audio analysis)
- opencv-python (video processing)
- PyQt5 (user interface)
- numpy, scipy (numerical processing)
- moviepy (video export)

### Step 3: Run the Application

**Easy Method (Windows):**
Simply double-click `run.bat`

**Manual Method:**
```bash
python main.py
```

## Troubleshooting

### Issue: "Python is not recognized"
**Solution**: Python is not in your PATH. Reinstall Python and check "Add Python to PATH"

### Issue: "No module named 'librosa'" or similar
**Solution**: Dependencies not installed. Run:
```bash
pip install -r requirements.txt
```

### Issue: Video export fails
**Solution**: Try installing ffmpeg:
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Add to system PATH
3. Restart the application

### Issue: Audio doesn't play
**Solution**:
- Make sure audio format is supported (MP3, WAV, FLAC, OGG)
- Try converting to WAV format if issues persist

### Issue: Performance is slow
**Solutions**:
- Reduce number of active visualizers
- Disable motion blur effect
- Close other applications
- Lower export resolution/FPS

## System Requirements

### Minimum:
- Windows 10 or higher
- Python 3.8+
- 4GB RAM
- Integrated graphics

### Recommended:
- Windows 10/11
- Python 3.10+
- 8GB RAM
- Dedicated GPU (NVIDIA/AMD)
- SSD for faster file loading

## First Run Guide

1. Launch the application using `run.bat`
2. Two windows will open:
   - Control panel (PyQt5 GUI)
   - Preview window (Pygame)
3. Click "Load Audio" and select a music file
4. Click visualizer type buttons to add visualizers (e.g., "+ Waveform")
5. Adjust position, size, colors in the properties panel
6. Click "Play" to preview
7. When satisfied, click "Export to Video"

## Advanced Features

### Custom Colors
1. Select a visualizer from the "Active Visualizers" list
2. Go to "Color/Opacity" tab
3. Click "Choose Color" and pick your color
4. Adjust opacity slider as needed

### Timing Control
1. Select a visualizer
2. Go to "Timing/Fades" tab
3. Set start/end times for when the visualizer appears
4. Add fade in/out for smooth transitions

### Multiple Visualizers
- Add multiple visualizers of different types
- Position them in different areas
- Use different colors and timing for each
- Create complex, layered effects

### Video Overlay
1. Load your video using "Load Video/Image"
2. Add visualizers on top
3. Adjust opacity for transparent effects
4. Export combined video

## Tips for Best Results

1. **Audio Quality**: Use high-quality audio files (320kbps MP3 or lossless FLAC)
2. **Colors**: Use complementary colors for multiple visualizers
3. **Layering**: Combine different visualizer types (bars + particles + waveform)
4. **Effects**: Enable sparkles and glow for professional look
5. **Timing**: Use fade in/out for smooth appearance/disappearance
6. **Export**: Use 1920x1080 @ 30fps for YouTube-ready videos

## Creating Professional Visuals

### Example Setup 1: Electronic Music
- Circular Spectrum (center, rainbow colors)
- Frequency Bars (bottom, bright colors)
- Particles (beat-reactive)
- Enable: Sparkles, Glow
- Background: Gradient or pulse

### Example Setup 2: Chill/Ambient
- Waveform (center, soft blue)
- Glow Orbs (floating)
- Radial Lines (slow rotation)
- Enable: Water Ripples, Glow
- Background: Dark gradient

### Example Setup 3: Energetic/Dance
- Frequency Bars (bottom, multi-color)
- Circular Spectrum (center)
- Particles (high count)
- Radial Lines (fast)
- Enable: Sparkles, Motion Blur
- Background: Pulse or video

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all dependencies are installed: `pip list`
3. Update dependencies: `pip install --upgrade -r requirements.txt`
4. Check console output for error messages

## Updates

To update the application:
1. Download the latest version
2. Run `pip install --upgrade -r requirements.txt`
3. Your visualizer configurations are not saved, so export videos before updating

Enjoy creating stunning music visualizations!
