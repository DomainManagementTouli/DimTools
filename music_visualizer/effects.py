"""
Special Effects Module
Sparkles, water effects, glow, and other visual effects
"""

import numpy as np
import pygame
from pygame import gfxdraw


class SparkleEffect:
    """Twinkling sparkle particles on beats"""

    def __init__(self, width, height, color=(255, 255, 200), max_sparkles=100):
        self.width = width
        self.height = height
        self.color = color
        self.max_sparkles = max_sparkles
        self.sparkles = []
        self.enabled = True
        self.alpha = 255

    def update(self, audio_data, current_time):
        """Update sparkle positions and spawn new ones on beats"""
        if not self.enabled:
            return

        beat_intensity = audio_data.get('beat_intensity', 0)
        onset_strength = audio_data.get('onset_strength', 0)

        # Spawn sparkles on strong beats
        if beat_intensity > 0.6 and len(self.sparkles) < self.max_sparkles:
            n_new = int(beat_intensity * 15)
            for _ in range(n_new):
                self.sparkles.append({
                    'x': np.random.randint(0, self.width),
                    'y': np.random.randint(0, self.height),
                    'life': 1.0,
                    'size': np.random.randint(2, 6),
                    'twinkle_phase': np.random.random() * 2 * np.pi
                })

        # Update sparkles
        sparkles_to_remove = []
        for sparkle in self.sparkles:
            sparkle['life'] -= 0.015
            sparkle['twinkle_phase'] += 0.3

            if sparkle['life'] <= 0:
                sparkles_to_remove.append(sparkle)

        for sparkle in sparkles_to_remove:
            self.sparkles.remove(sparkle)

    def draw(self, surface):
        """Draw sparkles"""
        if not self.enabled:
            return

        for sparkle in self.sparkles:
            # Twinkling effect
            twinkle = (np.sin(sparkle['twinkle_phase']) + 1) / 2
            opacity = int(self.alpha * sparkle['life'] * twinkle)

            if opacity > 10:
                x, y = int(sparkle['x']), int(sparkle['y'])
                size = sparkle['size']

                # Draw sparkle with glow
                color_with_alpha = (*self.color, opacity)
                gfxdraw.filled_circle(surface, x, y, size, color_with_alpha)

                # Add bright center
                if size > 2:
                    center_color = (255, 255, 255, min(255, opacity + 50))
                    gfxdraw.filled_circle(surface, x, y, size // 2, center_color)


class WaterRippleEffect:
    """Glistening water ripple effects"""

    def __init__(self, width, height, color=(100, 200, 255), max_ripples=20):
        self.width = width
        self.height = height
        self.color = color
        self.max_ripples = max_ripples
        self.ripples = []
        self.enabled = True
        self.alpha = 180

    def update(self, audio_data, current_time):
        """Update ripples and spawn new ones"""
        if not self.enabled:
            return

        beat_intensity = audio_data.get('beat_intensity', 0)

        # Spawn ripples on beats
        if beat_intensity > 0.5 and len(self.ripples) < self.max_ripples:
            self.ripples.append({
                'x': np.random.randint(0, self.width),
                'y': np.random.randint(0, self.height),
                'radius': 5,
                'max_radius': 50 + beat_intensity * 100,
                'life': 1.0
            })

        # Update ripples
        ripples_to_remove = []
        for ripple in self.ripples:
            ripple['radius'] += 3
            ripple['life'] -= 0.01

            if ripple['life'] <= 0 or ripple['radius'] > ripple['max_radius']:
                ripples_to_remove.append(ripple)

        for ripple in ripples_to_remove:
            self.ripples.remove(ripple)

    def draw(self, surface):
        """Draw water ripples"""
        if not self.enabled:
            return

        for ripple in self.ripples:
            opacity = int(self.alpha * ripple['life'])

            if opacity > 10:
                x, y = int(ripple['x']), int(ripple['y'])
                radius = int(ripple['radius'])

                # Draw ripple rings
                for i in range(3):
                    ring_radius = radius + i * 5
                    if ring_radius > 2:
                        ring_opacity = opacity // (i + 1)
                        color_with_alpha = (*self.color, ring_opacity)

                        # Draw circle outline
                        gfxdraw.circle(surface, x, y, ring_radius, color_with_alpha)


class GlowEffect:
    """Soft glow effect that pulses with music"""

    def __init__(self, width, height, color=(255, 100, 200)):
        self.width = width
        self.height = height
        self.color = color
        self.enabled = True
        self.intensity = 0.5

    def draw(self, surface, audio_data):
        """Draw ambient glow"""
        if not self.enabled:
            return

        rms = audio_data.get('rms', 0)
        beat_intensity = audio_data.get('beat_intensity', 0)

        # Calculate glow intensity
        glow_strength = (rms * 0.5 + beat_intensity * 0.5) * self.intensity

        if glow_strength > 0.1:
            # Create radial gradient glow from center
            center_x = self.width // 2
            center_y = self.height // 2
            max_radius = int(min(self.width, self.height) * 0.6)

            # Draw multiple glow layers
            for i in range(5, 0, -1):
                radius = int(max_radius * i / 5 * glow_strength)
                opacity = int(100 * glow_strength / i)

                if radius > 0 and opacity > 5:
                    color_with_alpha = (*self.color, opacity)
                    gfxdraw.filled_circle(surface, center_x, center_y, radius, color_with_alpha)


class MotionBlurEffect:
    """Motion blur trail effect"""

    def __init__(self, width, height, trail_length=5):
        self.width = width
        self.height = height
        self.trail_length = trail_length
        self.trail_surfaces = []
        self.enabled = True

    def add_frame(self, surface):
        """Add current frame to trail"""
        if not self.enabled:
            return

        # Copy current surface
        frame_copy = surface.copy()
        self.trail_surfaces.append(frame_copy)

        # Keep only recent frames
        if len(self.trail_surfaces) > self.trail_length:
            self.trail_surfaces.pop(0)

    def draw(self, surface):
        """Draw motion blur trail"""
        if not self.enabled or not self.trail_surfaces:
            return

        # Blend trail frames with decreasing opacity
        for i, trail_surface in enumerate(self.trail_surfaces[:-1]):
            opacity = int(128 * (i + 1) / len(self.trail_surfaces))
            trail_surface.set_alpha(opacity)
            surface.blit(trail_surface, (0, 0), special_flags=pygame.BLEND_ALPHA_SDL2)


class ColorCycleEffect:
    """Automatic color cycling based on music"""

    def __init__(self):
        self.enabled = True
        self.hue = 0
        self.saturation = 0.8
        self.value = 1.0

    def update(self, audio_data, current_time):
        """Update color based on music"""
        if not self.enabled:
            return

        # Cycle hue based on time and music
        beat_intensity = audio_data.get('beat_intensity', 0)
        dominant_hue = audio_data.get('dominant_hue', 0)

        # Smooth transition between time-based and music-based hue
        time_hue = (current_time * 20) % 360
        target_hue = time_hue * 0.7 + dominant_hue * 0.3

        # Smooth hue transition
        hue_diff = target_hue - self.hue
        if hue_diff > 180:
            hue_diff -= 360
        elif hue_diff < -180:
            hue_diff += 360

        self.hue = (self.hue + hue_diff * 0.1) % 360

        # Pulse saturation on beats
        target_saturation = 0.8 + beat_intensity * 0.2
        self.saturation = self.saturation * 0.9 + target_saturation * 0.1

    def get_color(self):
        """Get current RGB color"""
        import colorsys
        r, g, b = colorsys.hsv_to_rgb(self.hue / 360, self.saturation, self.value)
        return (int(r * 255), int(g * 255), int(b * 255))


class BackgroundEffect:
    """Dynamic background effects"""

    def __init__(self, width, height, bg_type='black'):
        self.width = width
        self.height = height
        self.bg_type = bg_type  # 'black', 'gradient', 'pulse', 'image', 'video'
        self.image = None
        self.color1 = (10, 10, 30)
        self.color2 = (50, 10, 50)

    def set_image(self, image_path):
        """Set background image"""
        try:
            self.image = pygame.image.load(image_path)
            self.image = pygame.transform.scale(self.image, (self.width, self.height))
            self.bg_type = 'image'
        except Exception as e:
            print(f"Error loading background image: {e}")

    def draw(self, surface, audio_data):
        """Draw background"""
        if self.bg_type == 'black':
            surface.fill((0, 0, 0))

        elif self.bg_type == 'gradient':
            # Vertical gradient
            for y in range(self.height):
                ratio = y / self.height
                r = int(self.color1[0] * (1 - ratio) + self.color2[0] * ratio)
                g = int(self.color1[1] * (1 - ratio) + self.color2[1] * ratio)
                b = int(self.color1[2] * (1 - ratio) + self.color2[2] * ratio)
                pygame.draw.line(surface, (r, g, b), (0, y), (self.width, y))

        elif self.bg_type == 'pulse':
            # Pulsing background
            beat_intensity = audio_data.get('beat_intensity', 0)
            intensity = beat_intensity * 0.3
            color = (
                int(self.color1[0] * (1 + intensity)),
                int(self.color1[1] * (1 + intensity)),
                int(self.color1[2] * (1 + intensity))
            )
            surface.fill(color)

        elif self.bg_type == 'image' and self.image:
            surface.blit(self.image, (0, 0))
