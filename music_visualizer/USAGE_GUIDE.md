# Usage Guide - Professional Music Visualizer

## Quick Start (5 Minutes)

1. **Launch**: Double-click `run.bat` (Windows)
2. **Load Audio**: Click "Load Audio" → Select your music file
3. **Add Visualizer**: Click "+ Frequency Bars"
4. **Preview**: Click "Play" button
5. **Export**: Click "Export to Video" → Save your file

That's it! You've created your first music visualization.

## Detailed Walkthrough

### 1. Loading Media

#### Audio Files
- Supports: MP3, WAV, FLAC, OGG, M4A
- Click "Load Audio" button
- Navigate to your music file
- Wait for analysis to complete (shows BPM and duration)

#### Background Media
- **Images**: JPG, PNG (static background)
- **Videos**: MP4, AVI, MOV (video overlay mode)
- Click "Load Video/Image"
- Select your file
- Visualizers will overlay on top

#### Clear Background
- Click "Clear Background" to remove loaded media
- Returns to solid/gradient background

### 2. Background Settings

Choose your background type:

**Black** (default)
- Pure black background
- Best for vibrant visualizers
- Classic look

**Gradient**
- Smooth color gradient
- Click "Choose Color" to customize
- Professional appearance

**Pulse**
- Background pulses with music
- Subtle reactive effect
- Good for energetic music

**Custom Color**
- Solid color background
- Click "Choose Color" to select

### 3. Adding Visualizers

Click the "+" button for any visualizer type:

#### Waveform
- Classic oscilloscope style
- Shows audio amplitude over time
- **Best for**: Seeing the actual audio signal
- **Tip**: Use thin line for subtle effect, thick for bold

#### Frequency Bars
- Vertical bars for different frequencies
- Low frequencies (bass) on left, high on right
- **Best for**: Electronic, EDM, bass-heavy music
- **Tip**: Place at bottom of screen for classic look

#### Circular Spectrum
- Radial frequency visualization
- 360-degree spectrum display
- **Best for**: Center-focused compositions
- **Tip**: Use rainbow colors for disco effect

#### Particles
- Beat-reactive particle explosion
- Spawns particles on strong beats
- **Best for**: Energetic, rhythmic music
- **Tip**: Combine with other visualizers

#### Radial Lines
- Rotating lines that pulse with music
- Smooth, flowing motion
- **Best for**: Ambient, trance, meditative music
- **Tip**: Slow rotation for calm effect

#### Glow Orbs
- Pulsing glowing spheres
- Each orb reacts to different frequency
- **Best for**: Chill, lo-fi, ambient music
- **Tip**: Use soft colors with high opacity

### 4. Customizing Visualizers

Select a visualizer from "Active Visualizers" list to edit:

#### Position/Size Tab

**X Position** (0-1920)
- Horizontal position on screen
- 0 = left edge, 960 = center, 1920 = right edge

**Y Position** (0-1080)
- Vertical position
- 0 = top edge, 540 = center, 1080 = bottom

**Width** (50-1920)
- Visualizer width in pixels
- Larger = more screen coverage

**Height** (50-1080)
- Visualizer height in pixels
- Adjust based on type and position

**Common Layouts:**
- **Bottom bar**: X=160, Y=780, W=1600, H=200
- **Center**: X=340, Y=290, W=1200, H=500
- **Full width**: X=0, Y=0, W=1920, H=1080

#### Color/Opacity Tab

**Color**
- Click "Choose Color" to pick RGB color
- Preview shows selected color
- Each visualizer can have different color

**Opacity** (0-255)
- 0 = fully transparent
- 255 = fully opaque
- Use 180-220 for overlay effects
- Use 255 for bold visualizers

**Color Tips:**
- **Cyan/Blue**: Cool, calming, electronic
- **Red/Orange**: Warm, energetic, intense
- **Purple/Magenta**: Creative, artistic, unique
- **Green**: Natural, balanced, retro
- **Multi-colored**: Use different visualizers with complementary colors

#### Timing/Fades Tab

**Start Time** (seconds)
- When visualizer appears
- 0 = from beginning
- Example: 30.0 = appears at 30 seconds

**End Time** (seconds)
- When visualizer disappears
- 0 = never (infinite)
- Example: 60.0 = disappears at 1 minute

**Fade In** (seconds)
- Duration of fade-in effect
- 0 = instant appearance
- 0.5-2.0 = smooth fade in
- Example: 1.0 = fades in over 1 second

**Fade Out** (seconds)
- Duration of fade-out effect
- 0 = instant disappearance
- 0.5-2.0 = smooth fade out
- Example: 1.0 = fades out over 1 second

**Use Cases:**
- **Intro fade**: Start=0, Fade In=2.0
- **Drop effect**: Multiple visualizers start at drop time
- **Build-up**: Visualizers appear one by one
- **Outro**: Last visualizer fades out before song ends

### 5. Effects

Enable special effects with checkboxes:

#### Sparkles ✓ (Recommended)
- Twinkling particles on beats
- Adds magical, professional touch
- Spawns on strong beats
- **Best for**: Almost any visualization

#### Water Ripples
- Glistening water-like circles
- Radiates from random points
- Soft, organic feel
- **Best for**: Chill, ambient, downtempo

#### Ambient Glow ✓ (Recommended)
- Soft glow from center
- Pulses with music energy
- Adds depth and atmosphere
- **Best for**: All types, especially dark backgrounds

#### Motion Blur
- Trails behind moving elements
- Smooth, flowing effect
- Can impact performance
- **Best for**: Fast-paced, energetic music

### 6. Playback Controls

**Play/Pause Button**
- Start/pause preview
- Hotkey: Spacebar (in pygame window)

**Stop Button**
- Stop and reset to beginning
- Resets all visualizers

**Timeline Slider**
- Click to seek to any position
- Shows current time / total duration
- Drag while paused for precise positioning

### 7. Exporting Videos

#### Export Settings

**Resolution**
- **1920x1080** (Full HD) - Recommended for YouTube
- **1280x720** (HD) - Faster export, smaller file
- **3840x2160** (4K) - Ultra high quality, large file
- **Custom** - Use current window size

**FPS (Frames Per Second)**
- **24** - Cinematic, smaller file
- **30** - Standard, recommended
- **60** - Ultra smooth, large file, best for gaming content

**Export Process**
1. Click "Export to Video"
2. Choose save location and filename
3. Wait for progress bar (may take time)
4. Video saved as MP4

**Export Tips:**
- Close other applications for faster export
- Higher resolution + FPS = longer export time
- 3-minute song @ 1080p/30fps ≈ 2-5 minutes export
- Always preview before exporting

### 8. Advanced Techniques

#### Layering Multiple Visualizers

Create depth by layering:
1. **Background layer**: Large, low opacity (alpha=100-150)
2. **Middle layer**: Medium size, medium opacity (alpha=180-220)
3. **Foreground layer**: Small/focused, full opacity (alpha=255)

Example:
- Layer 1: Circular Spectrum (center, large, alpha=120, purple)
- Layer 2: Frequency Bars (bottom, alpha=200, cyan)
- Layer 3: Particles (full screen, alpha=255, yellow)

#### Creating Professional Transitions

**Build-up section**:
- 0-30s: Waveform only (fade in 2s)
- 30-45s: Add Glow Orbs (fade in 1s)
- 45-60s: Add Frequency Bars (fade in 1s)
- 60s: Drop - Add Particles (instant)

**Verse/Chorus variation**:
- Verse: Subtle visualizers (waveform + glow)
- Chorus: Add bars + particles (fade in on chorus start)
- Bridge: Different color scheme (use timing to swap)

#### Color Schemes

**Monochromatic** (Professional)
- All visualizers use shades of one color
- Vary opacity and size
- Example: All blue (light blue to dark blue)

**Complementary** (Vibrant)
- Use opposite colors on color wheel
- Blue + Orange
- Purple + Yellow
- Red + Cyan

**Analogous** (Harmonious)
- Use adjacent colors
- Blue + Cyan + Green
- Red + Orange + Yellow
- Purple + Pink + Magenta

**Rainbow** (Energetic)
- Multiple bright colors
- Each visualizer different color
- Best for EDM, party music

#### Video Overlay Techniques

**Subtle overlay** (alpha=150-200)
- Visualizers blend with video
- Don't overpower the video content
- Good for music videos

**Bold overlay** (alpha=230-255)
- Visualizers are prominent
- Video is backdrop
- Good for lyric videos

**Synchronized overlay**
- Match visualizer colors to video colors
- Place visualizers to avoid important video elements
- Professional production look

### 9. Common Workflows

#### YouTube Music Upload
1. Load audio (high quality MP3/FLAC)
2. Load background image (album art)
3. Add: Circular Spectrum (center) + Frequency Bars (bottom)
4. Enable: Sparkles, Glow
5. Colors: Match album art
6. Export: 1920x1080, 30fps
7. Upload to YouTube

#### Video Enhancement
1. Load your video
2. Load same audio (or extract from video)
3. Add subtle visualizers (low opacity)
4. Position to not block faces/important content
5. Enable: Glow, Sparkles
6. Export: Same resolution as source video

#### Pure Visualization
1. Load audio only
2. Background: Gradient or Pulse
3. Add 3-4 different visualizers
4. Use bold colors and effects
5. Enable all effects
6. Export: 1920x1080, 30-60fps

#### Podcast/Spoken Word
1. Load audio
2. Background: Static color or gradient
3. Add: Waveform (centered, smooth)
4. Subtle colors (not distracting)
5. No particles/sparkles
6. Export: 1280x720, 30fps

### 10. Performance Tips

**For Smooth Preview:**
- Limit to 3-4 visualizers
- Disable motion blur
- Close other applications
- Lower preview window size

**For Faster Export:**
- Export at 720p instead of 1080p
- Use 24 or 30 fps (not 60)
- Close all other programs
- Use SSD for output file

**For Quality:**
- Use lossless audio (FLAC) as source
- Export at 1080p or 4K
- Use 30-60 fps
- High quality background images/videos

## Keyboard Shortcuts

(In Pygame preview window)
- **Space**: Play/Pause
- **Escape**: Close preview window

## Best Practices

1. **Always preview before exporting** - Saves time
2. **Save configuration mentally** - No save feature yet
3. **Experiment with timing** - Creates dynamic videos
4. **Match colors to music mood** - Enhances experience
5. **Use reference videos** - Look at professional visualizations
6. **Less is often more** - Don't overcrowd the screen
7. **Test on different devices** - Check how it looks

## Example Presets

### "Neon Dreams"
- Background: Black
- Circular Spectrum: Center, rainbow, alpha=200
- Frequency Bars: Bottom, cyan, alpha=220
- Particles: Full screen, magenta
- Effects: Sparkles, Glow
- Style: Futuristic, EDM

### "Chill Vibes"
- Background: Gradient (dark blue to purple)
- Waveform: Center, soft blue, alpha=180
- Glow Orbs: Floating, pastel colors
- Effects: Water Ripples, Glow
- Style: Relaxing, lo-fi

### "Energy Blast"
- Background: Pulse (red)
- Frequency Bars: Bottom, yellow-orange, alpha=255
- Radial Lines: Center, white, fast rotation
- Particles: High count, white
- Effects: Sparkles, Motion Blur
- Style: Intense, workout music

Now you're ready to create professional music visualizations! Experiment and have fun!
