"""
Audio Analysis Module
Handles audio loading, beat detection, and frequency analysis
"""

import numpy as np
import librosa
import soundfile as sf
from scipy import signal


class AudioAnalyzer:
    def __init__(self, audio_path):
        """Initialize audio analyzer with audio file"""
        self.audio_path = audio_path
        self.y, self.sr = librosa.load(audio_path, sr=44100)
        self.duration = librosa.get_duration(y=self.y, sr=self.sr)

        # Pre-compute analysis data
        self._compute_features()

    def _compute_features(self):
        """Pre-compute audio features for smooth playback"""
        # Compute mel spectrogram for frequency visualization
        self.mel_spec = librosa.feature.melspectrogram(
            y=self.y, sr=self.sr, n_mels=128, fmax=8000, hop_length=512
        )
        self.mel_spec_db = librosa.power_to_db(self.mel_spec, ref=np.max)

        # Detect beats and tempo
        self.tempo, self.beat_frames = librosa.beat.beat_track(
            y=self.y, sr=self.sr, units='frames'
        )
        self.beat_times = librosa.frames_to_time(self.beat_frames, sr=self.sr)

        # Onset strength for reactive effects
        self.onset_env = librosa.onset.onset_strength(y=self.y, sr=self.sr)

        # Compute RMS energy for amplitude visualization
        self.rms = librosa.feature.rms(y=self.y, hop_length=512)[0]

        # Compute chroma features for color mapping
        self.chroma = librosa.feature.chroma_stft(y=self.y, sr=self.sr)

        # Spectral centroid for brightness mapping
        self.spectral_centroid = librosa.feature.spectral_centroid(
            y=self.y, sr=self.sr, hop_length=512
        )[0]

        print(f"Audio loaded: {self.duration:.2f}s, Tempo: {self.tempo:.1f} BPM")

    def get_waveform_at_time(self, time, window_size=2048):
        """Get waveform samples at specific time"""
        frame = int(time * self.sr)
        start = max(0, frame - window_size // 2)
        end = min(len(self.y), frame + window_size // 2)

        waveform = self.y[start:end]

        # Pad if needed
        if len(waveform) < window_size:
            waveform = np.pad(waveform, (0, window_size - len(waveform)))

        return waveform

    def get_spectrum_at_time(self, time, n_bands=64):
        """Get frequency spectrum at specific time"""
        frame_idx = librosa.time_to_frames(time, sr=self.sr, hop_length=512)
        frame_idx = min(frame_idx, self.mel_spec_db.shape[1] - 1)

        # Get mel spectrum and normalize
        spectrum = self.mel_spec_db[:, frame_idx]

        # Resample to desired number of bands
        if len(spectrum) != n_bands:
            spectrum = signal.resample(spectrum, n_bands)

        # Normalize to 0-1 range
        spectrum = (spectrum - spectrum.min()) / (spectrum.max() - spectrum.min() + 1e-6)

        return spectrum

    def get_beat_intensity(self, time, window=0.1):
        """Get beat intensity at specific time"""
        # Check if we're near a beat
        beat_distances = np.abs(self.beat_times - time)
        nearest_beat_dist = beat_distances.min()

        if nearest_beat_dist < window:
            # Exponential decay from beat
            intensity = np.exp(-nearest_beat_dist / (window / 3))
            return intensity

        return 0.0

    def get_onset_strength_at_time(self, time):
        """Get onset strength (energy) at specific time"""
        frame_idx = librosa.time_to_frames(time, sr=self.sr, hop_length=512)
        frame_idx = min(frame_idx, len(self.onset_env) - 1)

        # Normalize onset strength
        onset = self.onset_env[frame_idx]
        onset_normalized = onset / (self.onset_env.max() + 1e-6)

        return onset_normalized

    def get_rms_at_time(self, time):
        """Get RMS energy at specific time"""
        frame_idx = librosa.time_to_frames(time, sr=self.sr, hop_length=512)
        frame_idx = min(frame_idx, len(self.rms) - 1)

        rms = self.rms[frame_idx]
        rms_normalized = rms / (self.rms.max() + 1e-6)

        return rms_normalized

    def get_chroma_at_time(self, time):
        """Get chroma (pitch class) features at specific time"""
        frame_idx = librosa.time_to_frames(time, sr=self.sr, hop_length=512)
        frame_idx = min(frame_idx, self.chroma.shape[1] - 1)

        return self.chroma[:, frame_idx]

    def get_dominant_frequency_color(self, time):
        """Get a color based on dominant frequency"""
        chroma = self.get_chroma_at_time(time)
        dominant_note = np.argmax(chroma)

        # Map 12 pitch classes to hue values (0-360)
        hue = (dominant_note / 12.0) * 360

        return hue

    def get_audio_samples(self, start_time, duration):
        """Get raw audio samples for a time range"""
        start_frame = int(start_time * self.sr)
        end_frame = int((start_time + duration) * self.sr)

        return self.y[start_frame:end_frame]
