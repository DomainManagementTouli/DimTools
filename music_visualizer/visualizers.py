"""
Visualizer Components
Various music visualizer implementations
"""

import numpy as np
import pygame
from pygame import gfxdraw
import colorsys


class Visualizer:
    """Base class for visualizers"""

    def __init__(self, x, y, width, height, color=(255, 100, 200), alpha=255):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.color = color
        self.alpha = alpha
        self.fade_in_duration = 0.0
        self.fade_out_duration = 0.0
        self.start_time = 0.0
        self.end_time = float('inf')

    def get_opacity(self, current_time):
        """Calculate opacity based on fade in/out"""
        opacity = self.alpha

        # Fade in
        if current_time < self.start_time + self.fade_in_duration:
            progress = (current_time - self.start_time) / self.fade_in_duration
            opacity = int(self.alpha * progress)

        # Fade out
        if self.end_time != float('inf') and current_time > self.end_time - self.fade_out_duration:
            progress = (self.end_time - current_time) / self.fade_out_duration
            opacity = int(self.alpha * progress)

        return max(0, min(255, opacity))

    def draw(self, surface, audio_data, current_time):
        """Override this in subclasses"""
        pass


class WaveformVisualizer(Visualizer):
    """Classic waveform oscilloscope visualization"""

    def __init__(self, x, y, width, height, color=(100, 255, 200), alpha=255, thickness=2):
        super().__init__(x, y, width, height, color, alpha)
        self.thickness = thickness
        self.smoothing = 0.3

    def draw(self, surface, audio_data, current_time):
        waveform = audio_data.get('waveform', np.zeros(1024))
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        # Create surface for alpha blending
        wave_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        points = []
        step = len(waveform) // min(self.width, len(waveform))
        if step == 0:
            step = 1

        for i in range(0, len(waveform), step):
            if len(points) >= self.width:
                break

            # Normalize waveform value
            value = waveform[i]
            y_pos = int(self.height / 2 + value * self.height / 2 * 0.8)
            y_pos = max(0, min(self.height - 1, y_pos))

            x_pos = len(points)
            points.append((x_pos, y_pos))

        # Draw the waveform
        if len(points) > 1:
            color_with_alpha = (*self.color, opacity)
            pygame.draw.lines(wave_surface, color_with_alpha, False, points, self.thickness)

        surface.blit(wave_surface, (self.x, self.y))


class FrequencyBarsVisualizer(Visualizer):
    """Vertical frequency bars visualization"""

    def __init__(self, x, y, width, height, color=(255, 150, 50), alpha=255, n_bars=64, spacing=2):
        super().__init__(x, y, width, height, color, alpha)
        self.n_bars = n_bars
        self.spacing = spacing
        self.bar_heights = np.zeros(n_bars)
        self.smoothing = 0.7

    def draw(self, surface, audio_data, current_time):
        spectrum = audio_data.get('spectrum', np.zeros(self.n_bars))
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        # Smooth the bar heights
        target_heights = spectrum * self.height * 0.9
        self.bar_heights = self.bar_heights * self.smoothing + target_heights * (1 - self.smoothing)

        bar_width = (self.width - (self.n_bars - 1) * self.spacing) / self.n_bars

        bar_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        for i in range(self.n_bars):
            bar_height = max(2, int(self.bar_heights[i]))
            x_pos = i * (bar_width + self.spacing)
            y_pos = self.height - bar_height

            # Color gradient based on height
            intensity = min(1.0, self.bar_heights[i] / self.height)
            r = int(self.color[0] * (0.5 + 0.5 * intensity))
            g = int(self.color[1] * (0.5 + 0.5 * intensity))
            b = int(self.color[2] * (0.5 + 0.5 * intensity))

            color_with_alpha = (r, g, b, opacity)

            pygame.draw.rect(
                bar_surface,
                color_with_alpha,
                (x_pos, y_pos, bar_width, bar_height),
                border_radius=2
            )

        surface.blit(bar_surface, (self.x, self.y))


class CircularSpectrumVisualizer(Visualizer):
    """Circular radial spectrum visualization"""

    def __init__(self, x, y, width, height, color=(150, 100, 255), alpha=255, n_bars=64):
        super().__init__(x, y, width, height, color, alpha)
        self.n_bars = n_bars
        self.bar_heights = np.zeros(n_bars)
        self.smoothing = 0.6
        self.inner_radius = min(width, height) * 0.1
        self.outer_radius = min(width, height) * 0.45

    def draw(self, surface, audio_data, current_time):
        spectrum = audio_data.get('spectrum', np.zeros(self.n_bars))
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        # Smooth the bar heights
        self.bar_heights = self.bar_heights * self.smoothing + spectrum * (1 - self.smoothing)

        circle_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        center_x = self.width // 2
        center_y = self.height // 2

        for i in range(self.n_bars):
            angle = (i / self.n_bars) * 2 * np.pi
            intensity = self.bar_heights[i]

            # Calculate bar endpoints
            inner_x = center_x + int(self.inner_radius * np.cos(angle))
            inner_y = center_y + int(self.inner_radius * np.sin(angle))

            bar_length = self.inner_radius + intensity * (self.outer_radius - self.inner_radius)
            outer_x = center_x + int(bar_length * np.cos(angle))
            outer_y = center_y + int(bar_length * np.sin(angle))

            # Color based on angle for rainbow effect
            hue = i / self.n_bars
            rgb = colorsys.hsv_to_rgb(hue, 0.8, 1.0)
            r, g, b = int(rgb[0] * 255), int(rgb[1] * 255), int(rgb[2] * 255)

            color_with_alpha = (r, g, b, opacity)

            pygame.draw.line(circle_surface, color_with_alpha, (inner_x, inner_y), (outer_x, outer_y), 3)

        surface.blit(circle_surface, (self.x, self.y))


class ParticleVisualizer(Visualizer):
    """Beat-reactive particle system"""

    def __init__(self, x, y, width, height, color=(255, 200, 50), alpha=255, max_particles=200):
        super().__init__(x, y, width, height, color, alpha)
        self.particles = []
        self.max_particles = max_particles
        self.last_beat_intensity = 0

    def draw(self, surface, audio_data, current_time):
        beat_intensity = audio_data.get('beat_intensity', 0)
        onset_strength = audio_data.get('onset_strength', 0)
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        # Spawn particles on beats
        if beat_intensity > 0.5 and len(self.particles) < self.max_particles:
            n_new_particles = int(beat_intensity * 20)
            for _ in range(n_new_particles):
                angle = np.random.random() * 2 * np.pi
                speed = 2 + onset_strength * 8
                self.particles.append({
                    'x': self.width / 2,
                    'y': self.height / 2,
                    'vx': np.cos(angle) * speed,
                    'vy': np.sin(angle) * speed,
                    'life': 1.0,
                    'size': 2 + int(onset_strength * 6)
                })

        # Update and draw particles
        particle_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        particles_to_remove = []
        for particle in self.particles:
            # Update position
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['life'] -= 0.02
            particle['vy'] += 0.2  # Gravity

            if particle['life'] <= 0:
                particles_to_remove.append(particle)
                continue

            # Draw particle
            x, y = int(particle['x']), int(particle['y'])
            if 0 <= x < self.width and 0 <= y < self.height:
                particle_opacity = int(opacity * particle['life'])
                color_with_alpha = (*self.color, particle_opacity)
                gfxdraw.filled_circle(particle_surface, x, y, particle['size'], color_with_alpha)

        # Remove dead particles
        for particle in particles_to_remove:
            self.particles.remove(particle)

        surface.blit(particle_surface, (self.x, self.y))


class RadialLinesVisualizer(Visualizer):
    """Rotating radial lines synced to music"""

    def __init__(self, x, y, width, height, color=(100, 255, 255), alpha=255, n_lines=12):
        super().__init__(x, y, width, height, color, alpha)
        self.n_lines = n_lines
        self.rotation = 0
        self.pulse = 0

    def draw(self, surface, audio_data, current_time):
        beat_intensity = audio_data.get('beat_intensity', 0)
        rms = audio_data.get('rms', 0)
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        # Update rotation and pulse
        self.rotation += 0.5 + beat_intensity * 2
        self.pulse = rms * 0.3

        lines_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        center_x = self.width // 2
        center_y = self.height // 2
        radius = min(self.width, self.height) * (0.4 + self.pulse)

        for i in range(self.n_lines):
            angle = np.radians(self.rotation + (i / self.n_lines) * 360)

            end_x = center_x + int(radius * np.cos(angle))
            end_y = center_y + int(radius * np.sin(angle))

            # Gradient color
            intensity = 0.5 + 0.5 * np.sin(angle + current_time)
            r = int(self.color[0] * intensity)
            g = int(self.color[1] * intensity)
            b = int(self.color[2] * intensity)

            color_with_alpha = (r, g, b, opacity)

            pygame.draw.line(lines_surface, color_with_alpha, (center_x, center_y), (end_x, end_y), 3)

        surface.blit(lines_surface, (self.x, self.y))


class GlowOrbsVisualizer(Visualizer):
    """Pulsing glowing orbs following the beat"""

    def __init__(self, x, y, width, height, color=(255, 100, 255), alpha=255, n_orbs=5):
        super().__init__(x, y, width, height, color, alpha)
        self.n_orbs = n_orbs
        self.orb_positions = []
        self.orb_phases = []

        # Initialize orb positions
        for i in range(n_orbs):
            self.orb_positions.append({
                'x': (i + 1) * self.width / (n_orbs + 1),
                'y': self.height / 2
            })
            self.orb_phases.append(i * (2 * np.pi / n_orbs))

    def draw(self, surface, audio_data, current_time):
        beat_intensity = audio_data.get('beat_intensity', 0)
        spectrum = audio_data.get('spectrum', np.zeros(64))
        opacity = self.get_opacity(current_time)

        if opacity == 0:
            return

        orb_surface = pygame.Surface((self.width, self.height), pygame.SRCALPHA)

        for i in range(self.n_orbs):
            # Get frequency band for this orb
            band_idx = int((i / self.n_orbs) * len(spectrum))
            band_value = spectrum[band_idx] if band_idx < len(spectrum) else 0

            # Calculate orb size and position
            base_size = 20
            size = int(base_size + band_value * 40 + beat_intensity * 20)

            # Floating motion
            self.orb_phases[i] += 0.05
            y_offset = np.sin(self.orb_phases[i]) * 30

            x = int(self.orb_positions[i]['x'])
            y = int(self.orb_positions[i]['y'] + y_offset)

            # Draw glow layers
            for layer in range(3, 0, -1):
                layer_size = size * layer // 2
                layer_opacity = opacity // (layer * 2)
                color_with_alpha = (*self.color, layer_opacity)
                gfxdraw.filled_circle(orb_surface, x, y, layer_size, color_with_alpha)

            # Draw core
            core_color = tuple(min(255, c + 50) for c in self.color)
            color_with_alpha = (*core_color, opacity)
            gfxdraw.filled_circle(orb_surface, x, y, size // 3, color_with_alpha)

        surface.blit(orb_surface, (self.x, self.y))
