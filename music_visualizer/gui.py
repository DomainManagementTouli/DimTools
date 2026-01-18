"""
GUI Module using PyQt5
Main interface for the music visualizer
"""

from PyQt5.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                              QPushButton, QLabel, QSlider, QComboBox, QFileDialog,
                              QColorDialog, QSpinBox, QDoubleSpinBox, QGroupBox,
                              QListWidget, QCheckBox, QTabWidget, QScrollArea,
                              QMessageBox, QProgressBar)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QColor
import os


class VisualizerGUI(QMainWindow):
    """Main GUI window"""

    def __init__(self, app_controller):
        super().__init__()
        self.app = app_controller
        self.init_ui()

    def init_ui(self):
        """Initialize the user interface"""
        self.setWindowTitle("Professional Music Visualizer")
        self.setGeometry(100, 100, 1400, 900)

        # Main widget
        main_widget = QWidget()
        self.setCentralWidget(main_widget)

        # Main layout
        main_layout = QHBoxLayout()
        main_widget.setLayout(main_layout)

        # Left panel - Controls
        left_panel = self.create_left_panel()
        main_layout.addWidget(left_panel, stretch=1)

        # Right panel - Preview
        right_panel = self.create_right_panel()
        main_layout.addWidget(right_panel, stretch=2)

        self.show()

    def create_left_panel(self):
        """Create left control panel"""
        panel = QWidget()
        layout = QVBoxLayout()
        panel.setLayout(layout)

        # File loading section
        file_group = QGroupBox("Media Files")
        file_layout = QVBoxLayout()

        self.audio_label = QLabel("No audio loaded")
        file_layout.addWidget(self.audio_label)

        btn_load_audio = QPushButton("Load Audio")
        btn_load_audio.clicked.connect(self.load_audio)
        file_layout.addWidget(btn_load_audio)

        self.video_label = QLabel("No video/image")
        file_layout.addWidget(self.video_label)

        btn_load_video = QPushButton("Load Video/Image")
        btn_load_video.clicked.connect(self.load_video)
        file_layout.addWidget(btn_load_video)

        btn_clear_video = QPushButton("Clear Background")
        btn_clear_video.clicked.connect(self.clear_background)
        file_layout.addWidget(btn_clear_video)

        file_group.setLayout(file_layout)
        layout.addWidget(file_group)

        # Background settings
        bg_group = QGroupBox("Background")
        bg_layout = QVBoxLayout()

        self.bg_type_combo = QComboBox()
        self.bg_type_combo.addItems(['Black', 'Gradient', 'Pulse', 'Custom Color'])
        self.bg_type_combo.currentTextChanged.connect(self.change_background_type)
        bg_layout.addWidget(QLabel("Background Type:"))
        bg_layout.addWidget(self.bg_type_combo)

        btn_bg_color = QPushButton("Choose Color")
        btn_bg_color.clicked.connect(self.choose_background_color)
        bg_layout.addWidget(btn_bg_color)

        bg_group.setLayout(bg_layout)
        layout.addWidget(bg_group)

        # Visualizers section
        viz_group = QGroupBox("Visualizers")
        viz_layout = QVBoxLayout()

        viz_label = QLabel("Add Visualizer:")
        viz_layout.addWidget(viz_label)

        visualizer_types = [
            "Waveform",
            "Frequency Bars",
            "Circular Spectrum",
            "Particles",
            "Radial Lines",
            "Glow Orbs"
        ]

        for viz_type in visualizer_types:
            btn = QPushButton(f"+ {viz_type}")
            btn.clicked.connect(lambda checked, vt=viz_type: self.add_visualizer(vt))
            viz_layout.addWidget(btn)

        viz_group.setLayout(viz_layout)
        layout.addWidget(viz_group)

        # Effects section
        effects_group = QGroupBox("Effects")
        effects_layout = QVBoxLayout()

        self.sparkles_check = QCheckBox("Sparkles")
        self.sparkles_check.setChecked(True)
        self.sparkles_check.stateChanged.connect(self.toggle_sparkles)
        effects_layout.addWidget(self.sparkles_check)

        self.water_check = QCheckBox("Water Ripples")
        self.water_check.setChecked(False)
        self.water_check.stateChanged.connect(self.toggle_water)
        effects_layout.addWidget(self.water_check)

        self.glow_check = QCheckBox("Ambient Glow")
        self.glow_check.setChecked(True)
        self.glow_check.stateChanged.connect(self.toggle_glow)
        effects_layout.addWidget(self.glow_check)

        self.blur_check = QCheckBox("Motion Blur")
        self.blur_check.setChecked(False)
        self.blur_check.stateChanged.connect(self.toggle_blur)
        effects_layout.addWidget(self.blur_check)

        effects_group.setLayout(effects_layout)
        layout.addWidget(effects_group)

        # Active visualizers list
        list_group = QGroupBox("Active Visualizers")
        list_layout = QVBoxLayout()

        self.visualizer_list = QListWidget()
        self.visualizer_list.itemClicked.connect(self.select_visualizer)
        list_layout.addWidget(self.visualizer_list)

        btn_remove = QPushButton("Remove Selected")
        btn_remove.clicked.connect(self.remove_visualizer)
        list_layout.addWidget(btn_remove)

        list_group.setLayout(list_layout)
        layout.addWidget(list_group)

        layout.addStretch()

        return panel

    def create_right_panel(self):
        """Create right panel with preview and controls"""
        panel = QWidget()
        layout = QVBoxLayout()
        panel.setLayout(layout)

        # Preview placeholder
        self.preview_label = QLabel("Preview Window\n(Pygame window will appear)")
        self.preview_label.setStyleSheet("background-color: #222; color: white; font-size: 18px;")
        self.preview_label.setAlignment(Qt.AlignCenter)
        self.preview_label.setMinimumHeight(500)
        layout.addWidget(self.preview_label)

        # Playback controls
        controls_layout = QHBoxLayout()

        self.btn_play = QPushButton("Play")
        self.btn_play.clicked.connect(self.toggle_playback)
        controls_layout.addWidget(self.btn_play)

        self.btn_stop = QPushButton("Stop")
        self.btn_stop.clicked.connect(self.stop_playback)
        controls_layout.addWidget(self.btn_stop)

        layout.addLayout(controls_layout)

        # Timeline slider
        timeline_layout = QHBoxLayout()
        self.time_label = QLabel("0:00 / 0:00")
        timeline_layout.addWidget(self.time_label)

        self.timeline_slider = QSlider(Qt.Horizontal)
        self.timeline_slider.setMinimum(0)
        self.timeline_slider.setMaximum(1000)
        self.timeline_slider.sliderPressed.connect(self.timeline_pressed)
        self.timeline_slider.sliderReleased.connect(self.timeline_released)
        timeline_layout.addWidget(self.timeline_slider)

        layout.addLayout(timeline_layout)

        # Visualizer properties (tabs)
        self.properties_tabs = QTabWidget()

        # Position/Size tab
        pos_tab = QWidget()
        pos_layout = QVBoxLayout()

        pos_layout.addWidget(QLabel("X Position:"))
        self.x_spin = QSpinBox()
        self.x_spin.setRange(0, 1920)
        self.x_spin.setValue(100)
        self.x_spin.valueChanged.connect(self.update_visualizer_property)
        pos_layout.addWidget(self.x_spin)

        pos_layout.addWidget(QLabel("Y Position:"))
        self.y_spin = QSpinBox()
        self.y_spin.setRange(0, 1080)
        self.y_spin.setValue(100)
        self.y_spin.valueChanged.connect(self.update_visualizer_property)
        pos_layout.addWidget(self.y_spin)

        pos_layout.addWidget(QLabel("Width:"))
        self.width_spin = QSpinBox()
        self.width_spin.setRange(50, 1920)
        self.width_spin.setValue(800)
        self.width_spin.valueChanged.connect(self.update_visualizer_property)
        pos_layout.addWidget(self.width_spin)

        pos_layout.addWidget(QLabel("Height:"))
        self.height_spin = QSpinBox()
        self.height_spin.setRange(50, 1080)
        self.height_spin.setValue(400)
        self.height_spin.valueChanged.connect(self.update_visualizer_property)
        pos_layout.addWidget(self.height_spin)

        pos_layout.addStretch()
        pos_tab.setLayout(pos_layout)
        self.properties_tabs.addTab(pos_tab, "Position/Size")

        # Color/Alpha tab
        color_tab = QWidget()
        color_layout = QVBoxLayout()

        btn_color = QPushButton("Choose Color")
        btn_color.clicked.connect(self.choose_visualizer_color)
        color_layout.addWidget(btn_color)

        color_layout.addWidget(QLabel("Opacity:"))
        self.alpha_slider = QSlider(Qt.Horizontal)
        self.alpha_slider.setRange(0, 255)
        self.alpha_slider.setValue(255)
        self.alpha_slider.valueChanged.connect(self.update_visualizer_property)
        color_layout.addWidget(self.alpha_slider)

        color_layout.addStretch()
        color_tab.setLayout(color_layout)
        self.properties_tabs.addTab(color_tab, "Color/Opacity")

        # Timing tab
        timing_tab = QWidget()
        timing_layout = QVBoxLayout()

        timing_layout.addWidget(QLabel("Start Time (seconds):"))
        self.start_time_spin = QDoubleSpinBox()
        self.start_time_spin.setRange(0, 1000)
        self.start_time_spin.setValue(0)
        self.start_time_spin.valueChanged.connect(self.update_visualizer_property)
        timing_layout.addWidget(self.start_time_spin)

        timing_layout.addWidget(QLabel("End Time (seconds, 0=infinite):"))
        self.end_time_spin = QDoubleSpinBox()
        self.end_time_spin.setRange(0, 1000)
        self.end_time_spin.setValue(0)
        self.end_time_spin.valueChanged.connect(self.update_visualizer_property)
        timing_layout.addWidget(self.end_time_spin)

        timing_layout.addWidget(QLabel("Fade In (seconds):"))
        self.fade_in_spin = QDoubleSpinBox()
        self.fade_in_spin.setRange(0, 10)
        self.fade_in_spin.setValue(0)
        self.fade_in_spin.setSingleStep(0.1)
        self.fade_in_spin.valueChanged.connect(self.update_visualizer_property)
        timing_layout.addWidget(self.fade_in_spin)

        timing_layout.addWidget(QLabel("Fade Out (seconds):"))
        self.fade_out_spin = QDoubleSpinBox()
        self.fade_out_spin.setRange(0, 10)
        self.fade_out_spin.setValue(0)
        self.fade_out_spin.setSingleStep(0.1)
        self.fade_out_spin.valueChanged.connect(self.update_visualizer_property)
        timing_layout.addWidget(self.fade_out_spin)

        timing_layout.addStretch()
        timing_tab.setLayout(timing_layout)
        self.properties_tabs.addTab(timing_tab, "Timing/Fades")

        layout.addWidget(self.properties_tabs)

        # Export section
        export_group = QGroupBox("Export")
        export_layout = QVBoxLayout()

        export_info = QHBoxLayout()
        export_info.addWidget(QLabel("Resolution:"))
        self.resolution_combo = QComboBox()
        self.resolution_combo.addItems(['1920x1080', '1280x720', '3840x2160', 'Custom'])
        export_info.addWidget(self.resolution_combo)
        export_layout.addLayout(export_info)

        export_info2 = QHBoxLayout()
        export_info2.addWidget(QLabel("FPS:"))
        self.fps_spin = QSpinBox()
        self.fps_spin.setRange(24, 60)
        self.fps_spin.setValue(30)
        export_info2.addWidget(self.fps_spin)
        export_layout.addLayout(export_info2)

        self.export_progress = QProgressBar()
        self.export_progress.setVisible(False)
        export_layout.addWidget(self.export_progress)

        btn_export = QPushButton("Export to Video")
        btn_export.clicked.connect(self.export_video)
        export_layout.addWidget(btn_export)

        export_group.setLayout(export_layout)
        layout.addWidget(export_group)

        return panel

    # Event handlers
    def load_audio(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Load Audio", "",
            "Audio Files (*.mp3 *.wav *.flac *.ogg *.m4a);;All Files (*)"
        )
        if file_path:
            self.app.load_audio(file_path)
            self.audio_label.setText(os.path.basename(file_path))

    def load_video(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Load Video/Image", "",
            "Media Files (*.mp4 *.avi *.mov *.mkv *.jpg *.png *.jpeg);;All Files (*)"
        )
        if file_path:
            self.app.load_background(file_path)
            self.video_label.setText(os.path.basename(file_path))

    def clear_background(self):
        self.app.clear_background()
        self.video_label.setText("No video/image")

    def change_background_type(self, bg_type):
        self.app.change_background_type(bg_type.lower())

    def choose_background_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            rgb = (color.red(), color.green(), color.blue())
            self.app.set_background_color(rgb)

    def add_visualizer(self, viz_type):
        self.app.add_visualizer(viz_type)
        self.update_visualizer_list()

    def remove_visualizer(self):
        current_item = self.visualizer_list.currentRow()
        if current_item >= 0:
            self.app.remove_visualizer(current_item)
            self.update_visualizer_list()

    def select_visualizer(self, item):
        index = self.visualizer_list.row(item)
        self.app.select_visualizer(index)
        self.load_visualizer_properties()

    def update_visualizer_list(self):
        self.visualizer_list.clear()
        for i, viz in enumerate(self.app.visualizers):
            self.visualizer_list.addItem(f"{i+1}. {viz.__class__.__name__}")

    def load_visualizer_properties(self):
        """Load selected visualizer properties into controls"""
        viz = self.app.get_selected_visualizer()
        if viz:
            self.x_spin.setValue(int(viz.x))
            self.y_spin.setValue(int(viz.y))
            self.width_spin.setValue(int(viz.width))
            self.height_spin.setValue(int(viz.height))
            self.alpha_slider.setValue(int(viz.alpha))
            self.start_time_spin.setValue(viz.start_time)
            self.fade_in_spin.setValue(viz.fade_in_duration)
            self.fade_out_spin.setValue(viz.fade_out_duration)
            if viz.end_time != float('inf'):
                self.end_time_spin.setValue(viz.end_time)

    def update_visualizer_property(self):
        """Update selected visualizer properties"""
        viz = self.app.get_selected_visualizer()
        if viz:
            viz.x = self.x_spin.value()
            viz.y = self.y_spin.value()
            viz.width = self.width_spin.value()
            viz.height = self.height_spin.value()
            viz.alpha = self.alpha_slider.value()
            viz.start_time = self.start_time_spin.value()
            viz.fade_in_duration = self.fade_in_spin.value()
            viz.fade_out_duration = self.fade_out_spin.value()

            end_time = self.end_time_spin.value()
            viz.end_time = end_time if end_time > 0 else float('inf')

    def choose_visualizer_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            viz = self.app.get_selected_visualizer()
            if viz:
                viz.color = (color.red(), color.green(), color.blue())

    def toggle_sparkles(self, state):
        self.app.toggle_effect('sparkles', state == Qt.Checked)

    def toggle_water(self, state):
        self.app.toggle_effect('water', state == Qt.Checked)

    def toggle_glow(self, state):
        self.app.toggle_effect('glow', state == Qt.Checked)

    def toggle_blur(self, state):
        self.app.toggle_effect('blur', state == Qt.Checked)

    def toggle_playback(self):
        if self.app.is_playing:
            self.app.pause()
            self.btn_play.setText("Play")
        else:
            self.app.play()
            self.btn_play.setText("Pause")

    def stop_playback(self):
        self.app.stop()
        self.btn_play.setText("Play")

    def timeline_pressed(self):
        self.app.seeking = True

    def timeline_released(self):
        position = self.timeline_slider.value() / 1000.0
        self.app.seek(position)
        self.app.seeking = False

    def update_timeline(self, current_time, duration):
        """Update timeline from app"""
        if not self.app.seeking:
            progress = int((current_time / duration) * 1000) if duration > 0 else 0
            self.timeline_slider.setValue(progress)

        # Update time label
        current_str = f"{int(current_time // 60)}:{int(current_time % 60):02d}"
        duration_str = f"{int(duration // 60)}:{int(duration % 60):02d}"
        self.time_label.setText(f"{current_str} / {duration_str}")

    def export_video(self):
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Export Video", "visualization.mp4",
            "Video Files (*.mp4);;All Files (*)"
        )
        if file_path:
            resolution = self.resolution_combo.currentText()
            if resolution == 'Custom':
                # Use current window size
                width, height = 1920, 1080
            else:
                width, height = map(int, resolution.split('x'))

            fps = self.fps_spin.value()

            self.export_progress.setVisible(True)
            self.export_progress.setValue(0)

            # Start export
            self.app.export_video(file_path, width, height, fps, self.export_progress)

    def show_error(self, title, message):
        """Show error dialog"""
        QMessageBox.critical(self, title, message)

    def show_info(self, title, message):
        """Show info dialog"""
        QMessageBox.information(self, title, message)
