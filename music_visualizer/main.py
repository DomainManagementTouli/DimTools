"""
Main Application
Professional Music Visualizer
"""

import sys
import os
import pygame
import numpy as np
from PyQt5.QtWidgets import QApplication
from PyQt5.QtCore import QTimer
import cv2

from audio_analyzer import AudioAnalyzer
from visualizers import (WaveformVisualizer, FrequencyBarsVisualizer,
                          CircularSpectrumVisualizer, ParticleVisualizer,
                          RadialLinesVisualizer, GlowOrbsVisualizer)
from effects import (SparkleEffect, WaterRippleEffect, GlowEffect,
                     MotionBlurEffect, ColorCycleEffect, BackgroundEffect)
from gui import VisualizerGUI


class MusicVisualizerApp:
    """Main application controller"""

    def __init__(self):
        # Initialize Pygame
        pygame.init()
        pygame.mixer.init()

        # Window settings
        self.width = 1280
        self.height = 720
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Music Visualizer - Preview")

        # Application state
        self.audio_analyzer = None
        self.audio_file = None
        self.is_playing = False
        self.current_time = 0.0
        self.duration = 0.0
        self.seeking = False

        # Visualizers and effects
        self.visualizers = []
        self.selected_visualizer_index = -1

        # Effects
        self.sparkle_effect = SparkleEffect(self.width, self.height)
        self.water_effect = WaterRippleEffect(self.width, self.height)
        self.glow_effect = GlowEffect(self.width, self.height)
        self.blur_effect = MotionBlurEffect(self.width, self.height)
        self.color_cycle = ColorCycleEffect()
        self.background = BackgroundEffect(self.width, self.height, 'black')

        # Video/image background
        self.background_video = None
        self.background_video_cap = None
        self.background_image = None
        self.has_video_background = False

        # Clock for frame rate
        self.clock = pygame.time.Clock()
        self.fps = 60

        # Create GUI
        self.qt_app = QApplication(sys.argv)
        self.gui = VisualizerGUI(self)

        # Update timer
        self.update_timer = QTimer()
        self.update_timer.timeout.connect(self.update)
        self.update_timer.start(16)  # ~60 FPS

    def load_audio(self, file_path):
        """Load audio file for visualization"""
        try:
            print(f"Loading audio: {file_path}")
            self.audio_file = file_path
            self.audio_analyzer = AudioAnalyzer(file_path)
            self.duration = self.audio_analyzer.duration

            # Load into pygame mixer
            pygame.mixer.music.load(file_path)

            print("Audio loaded successfully!")
            self.gui.show_info("Success", "Audio loaded successfully!")

        except Exception as e:
            print(f"Error loading audio: {e}")
            self.gui.show_error("Error", f"Failed to load audio:\n{str(e)}")

    def load_background(self, file_path):
        """Load video or image background"""
        try:
            ext = os.path.splitext(file_path)[1].lower()

            if ext in ['.jpg', '.jpeg', '.png', '.bmp']:
                # Load image
                self.background_image = pygame.image.load(file_path)
                self.background_image = pygame.transform.scale(
                    self.background_image, (self.width, self.height)
                )
                self.has_video_background = False
                self.background.bg_type = 'image'
                print(f"Loaded image background: {file_path}")

            elif ext in ['.mp4', '.avi', '.mov', '.mkv']:
                # Load video
                self.background_video = file_path
                self.background_video_cap = cv2.VideoCapture(file_path)
                self.has_video_background = True
                print(f"Loaded video background: {file_path}")

            self.gui.show_info("Success", "Background loaded successfully!")

        except Exception as e:
            print(f"Error loading background: {e}")
            self.gui.show_error("Error", f"Failed to load background:\n{str(e)}")

    def clear_background(self):
        """Clear video/image background"""
        self.background_image = None
        self.background_video = None
        if self.background_video_cap:
            self.background_video_cap.release()
        self.background_video_cap = None
        self.has_video_background = False
        self.background.bg_type = 'black'

    def change_background_type(self, bg_type):
        """Change background type"""
        type_map = {
            'black': 'black',
            'gradient': 'gradient',
            'pulse': 'pulse',
            'custom color': 'black'
        }
        self.background.bg_type = type_map.get(bg_type, 'black')

    def set_background_color(self, color):
        """Set background color"""
        self.background.color1 = color

    def add_visualizer(self, viz_type):
        """Add a new visualizer"""
        # Default position and size
        x = 100 + len(self.visualizers) * 50
        y = 100 + len(self.visualizers) * 30
        width = 800
        height = 300

        viz_map = {
            'Waveform': WaveformVisualizer,
            'Frequency Bars': FrequencyBarsVisualizer,
            'Circular Spectrum': CircularSpectrumVisualizer,
            'Particles': ParticleVisualizer,
            'Radial Lines': RadialLinesVisualizer,
            'Glow Orbs': GlowOrbsVisualizer
        }

        # Default colors for each type
        color_map = {
            'Waveform': (100, 255, 200),
            'Frequency Bars': (255, 150, 50),
            'Circular Spectrum': (150, 100, 255),
            'Particles': (255, 200, 50),
            'Radial Lines': (100, 255, 255),
            'Glow Orbs': (255, 100, 255)
        }

        if viz_type in viz_map:
            color = color_map.get(viz_type, (255, 255, 255))
            visualizer = viz_map[viz_type](x, y, width, height, color=color)
            self.visualizers.append(visualizer)
            print(f"Added {viz_type} visualizer")

    def remove_visualizer(self, index):
        """Remove visualizer at index"""
        if 0 <= index < len(self.visualizers):
            self.visualizers.pop(index)
            if self.selected_visualizer_index >= len(self.visualizers):
                self.selected_visualizer_index = len(self.visualizers) - 1

    def select_visualizer(self, index):
        """Select visualizer for editing"""
        if 0 <= index < len(self.visualizers):
            self.selected_visualizer_index = index

    def get_selected_visualizer(self):
        """Get currently selected visualizer"""
        if 0 <= self.selected_visualizer_index < len(self.visualizers):
            return self.visualizers[self.selected_visualizer_index]
        return None

    def toggle_effect(self, effect_name, enabled):
        """Toggle effect on/off"""
        if effect_name == 'sparkles':
            self.sparkle_effect.enabled = enabled
        elif effect_name == 'water':
            self.water_effect.enabled = enabled
        elif effect_name == 'glow':
            self.glow_effect.enabled = enabled
        elif effect_name == 'blur':
            self.blur_effect.enabled = enabled

    def play(self):
        """Start playback"""
        if self.audio_analyzer:
            pygame.mixer.music.play(start=self.current_time)
            self.is_playing = True

    def pause(self):
        """Pause playback"""
        if self.is_playing:
            pygame.mixer.music.pause()
            self.is_playing = False

    def stop(self):
        """Stop playback"""
        pygame.mixer.music.stop()
        self.is_playing = False
        self.current_time = 0.0

    def seek(self, position):
        """Seek to position (0.0 to 1.0)"""
        if self.audio_analyzer:
            self.current_time = position * self.duration
            if self.is_playing:
                pygame.mixer.music.play(start=self.current_time)

    def get_audio_data(self):
        """Get current audio analysis data"""
        if not self.audio_analyzer:
            return {
                'waveform': np.zeros(1024),
                'spectrum': np.zeros(64),
                'beat_intensity': 0,
                'onset_strength': 0,
                'rms': 0,
                'dominant_hue': 0
            }

        waveform = self.audio_analyzer.get_waveform_at_time(self.current_time)
        spectrum = self.audio_analyzer.get_spectrum_at_time(self.current_time, n_bands=64)
        beat_intensity = self.audio_analyzer.get_beat_intensity(self.current_time)
        onset_strength = self.audio_analyzer.get_onset_strength_at_time(self.current_time)
        rms = self.audio_analyzer.get_rms_at_time(self.current_time)
        dominant_hue = self.audio_analyzer.get_dominant_frequency_color(self.current_time)

        return {
            'waveform': waveform,
            'spectrum': spectrum,
            'beat_intensity': beat_intensity,
            'onset_strength': onset_strength,
            'rms': rms,
            'dominant_hue': dominant_hue
        }

    def update(self):
        """Main update loop"""
        # Handle pygame events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.quit()

        # Update current time
        if self.is_playing:
            self.current_time += 1.0 / self.fps
            if self.current_time >= self.duration:
                self.current_time = self.duration
                self.is_playing = False
                pygame.mixer.music.stop()

        # Get audio data
        audio_data = self.get_audio_data()

        # Update effects
        self.sparkle_effect.update(audio_data, self.current_time)
        self.water_effect.update(audio_data, self.current_time)
        self.color_cycle.update(audio_data, self.current_time)

        # Render
        self.render(audio_data)

        # Update GUI timeline
        self.gui.update_timeline(self.current_time, self.duration)

        # Maintain frame rate
        self.clock.tick(self.fps)

    def render(self, audio_data):
        """Render frame"""
        # Draw background
        if self.has_video_background and self.background_video_cap:
            # Get video frame
            self.background_video_cap.set(cv2.CAP_PROP_POS_MSEC, self.current_time * 1000)
            ret, frame = self.background_video_cap.read()

            if ret:
                # Convert OpenCV BGR to RGB
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = np.rot90(frame)
                frame = pygame.surfarray.make_surface(frame)
                frame = pygame.transform.scale(frame, (self.width, self.height))
                self.screen.blit(frame, (0, 0))
            else:
                self.screen.fill((0, 0, 0))

        elif self.background_image:
            self.screen.blit(self.background_image, (0, 0))

        else:
            self.background.draw(self.screen, audio_data)

        # Create effects surface
        effects_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        # Draw visualizers
        for visualizer in self.visualizers:
            # Check if visualizer should be visible at current time
            if (self.current_time >= visualizer.start_time and
                    self.current_time <= visualizer.end_time):
                visualizer.draw(effects_surface, audio_data, self.current_time)

        # Draw effects
        self.glow_effect.draw(effects_surface, audio_data)
        self.sparkle_effect.draw(effects_surface)
        self.water_effect.draw(effects_surface)

        # Blit effects to screen
        self.screen.blit(effects_surface, (0, 0))

        # Update display
        pygame.display.flip()

    def export_video(self, output_path, width, height, fps, progress_bar):
        """Export visualization to video file"""
        try:
            print(f"Exporting to {output_path} at {width}x{height} @ {fps}fps")

            # Temporarily resize
            original_size = (self.width, self.height)
            self.width, self.height = width, height
            self.screen = pygame.display.set_mode((width, height))

            # Recreate effects with new size
            self.sparkle_effect = SparkleEffect(width, height)
            self.water_effect = WaterRippleEffect(width, height)
            self.glow_effect = GlowEffect(width, height)
            self.background = BackgroundEffect(width, height, self.background.bg_type)

            # Initialize video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

            # Render all frames
            frame_count = int(self.duration * fps)
            dt = 1.0 / fps

            for frame_idx in range(frame_count):
                self.current_time = frame_idx * dt

                # Get audio data
                audio_data = self.get_audio_data()

                # Update effects
                self.sparkle_effect.update(audio_data, self.current_time)
                self.water_effect.update(audio_data, self.current_time)

                # Render
                self.render(audio_data)

                # Convert pygame surface to OpenCV format
                frame_string = pygame.image.tostring(self.screen, 'RGB')
                frame = np.frombuffer(frame_string, dtype=np.uint8)
                frame = frame.reshape((height, width, 3))
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

                # Write frame
                out.write(frame)

                # Update progress
                progress = int((frame_idx / frame_count) * 100)
                progress_bar.setValue(progress)
                QApplication.processEvents()

            # Cleanup
            out.release()

            # Restore original size
            self.width, self.height = original_size
            self.screen = pygame.display.set_mode(original_size)

            # Recreate effects
            self.sparkle_effect = SparkleEffect(self.width, self.height)
            self.water_effect = WaterRippleEffect(self.width, self.height)
            self.glow_effect = GlowEffect(self.width, self.height)
            self.background = BackgroundEffect(self.width, self.height, self.background.bg_type)

            progress_bar.setVisible(False)
            self.gui.show_info("Success", f"Video exported to:\n{output_path}")
            print("Export completed!")

        except Exception as e:
            print(f"Error exporting video: {e}")
            progress_bar.setVisible(False)
            self.gui.show_error("Error", f"Failed to export video:\n{str(e)}")

    def run(self):
        """Run the application"""
        sys.exit(self.qt_app.exec_())

    def quit(self):
        """Clean up and quit"""
        if self.background_video_cap:
            self.background_video_cap.release()
        pygame.quit()
        self.qt_app.quit()


def main():
    """Main entry point"""
    print("=" * 60)
    print("Professional Music Visualizer")
    print("=" * 60)

    app = MusicVisualizerApp()
    app.run()


if __name__ == "__main__":
    main()
