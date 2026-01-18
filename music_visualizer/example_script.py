"""
Example Script - Programmatic Visualization Creation
This shows how to create visualizations without the GUI
"""

import sys
import pygame
import numpy as np
from audio_analyzer import AudioAnalyzer
from visualizers import (WaveformVisualizer, FrequencyBarsVisualizer,
                          CircularSpectrumVisualizer, ParticleVisualizer)
from effects import SparkleEffect, GlowEffect, BackgroundEffect


def create_visualization(audio_file, output_file, duration=30):
    """
    Create a visualization programmatically

    Args:
        audio_file: Path to audio file
        output_file: Path to save video
        duration: Duration in seconds (or None for full song)
    """

    # Initialize
    pygame.init()
    width, height = 1920, 1080
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption("Rendering Visualization...")

    # Load audio
    print(f"Loading audio: {audio_file}")
    analyzer = AudioAnalyzer(audio_file)

    if duration is None:
        duration = analyzer.duration

    # Create visualizers
    visualizers = [
        # Circular spectrum in center
        CircularSpectrumVisualizer(
            x=width//2 - 300, y=height//2 - 300,
            width=600, height=600,
            color=(150, 100, 255), alpha=200
        ),

        # Frequency bars at bottom
        FrequencyBarsVisualizer(
            x=100, y=height - 250,
            width=width - 200, height=200,
            color=(255, 150, 50), alpha=220
        ),

        # Waveform at top
        WaveformVisualizer(
            x=100, y=50,
            width=width - 200, height=150,
            color=(100, 255, 200), alpha=180
        ),

        # Particles
        ParticleVisualizer(
            x=0, y=0,
            width=width, height=height,
            color=(255, 200, 50), alpha=255
        )
    ]

    # Create effects
    sparkles = SparkleEffect(width, height)
    glow = GlowEffect(width, height)
    background = BackgroundEffect(width, height, 'gradient')
    background.color1 = (10, 10, 30)
    background.color2 = (50, 10, 50)

    # Render frames
    fps = 30
    frame_count = int(duration * fps)
    dt = 1.0 / fps

    print(f"Rendering {frame_count} frames at {fps} fps...")

    try:
        import cv2

        # Video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))

        for frame_idx in range(frame_count):
            current_time = frame_idx * dt

            # Get audio data
            audio_data = {
                'waveform': analyzer.get_waveform_at_time(current_time),
                'spectrum': analyzer.get_spectrum_at_time(current_time, n_bands=64),
                'beat_intensity': analyzer.get_beat_intensity(current_time),
                'onset_strength': analyzer.get_onset_strength_at_time(current_time),
                'rms': analyzer.get_rms_at_time(current_time),
                'dominant_hue': analyzer.get_dominant_frequency_color(current_time)
            }

            # Update effects
            sparkles.update(audio_data, current_time)

            # Draw background
            background.draw(screen, audio_data)

            # Create effects surface
            effects_surface = pygame.Surface((width, height), pygame.SRCALPHA)

            # Draw visualizers
            for viz in visualizers:
                viz.draw(effects_surface, audio_data, current_time)

            # Draw effects
            glow.draw(effects_surface, audio_data)
            sparkles.draw(effects_surface)

            # Composite
            screen.blit(effects_surface, (0, 0))

            # Convert to video frame
            frame_string = pygame.image.tostring(screen, 'RGB')
            frame = np.frombuffer(frame_string, dtype=np.uint8)
            frame = frame.reshape((height, width, 3))
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

            out.write(frame)

            # Progress
            if frame_idx % 30 == 0:
                progress = (frame_idx / frame_count) * 100
                print(f"Progress: {progress:.1f}%")

        out.release()
        print(f"Video saved to: {output_file}")

    except ImportError:
        print("Error: opencv-python not installed. Install with: pip install opencv-python")
    except Exception as e:
        print(f"Error during rendering: {e}")

    pygame.quit()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python example_script.py <audio_file> [output_file] [duration]")
        print("\nExample:")
        print("  python example_script.py song.mp3")
        print("  python example_script.py song.mp3 output.mp4")
        print("  python example_script.py song.mp3 output.mp4 30")
        sys.exit(1)

    audio_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "visualization.mp4"
    duration = float(sys.argv[3]) if len(sys.argv) > 3 else None

    create_visualization(audio_file, output_file, duration)
