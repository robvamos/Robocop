import 'package:flutter/material.dart';

import 'templates/app_templates.dart';

void main() {
  runApp(const RobocopApp());
}

class RobocopApp extends StatefulWidget {
  const RobocopApp({super.key});

  @override
  State<RobocopApp> createState() => _RobocopAppState();
}

class _RobocopAppState extends State<RobocopApp> {
  AppTemplate _template = appTemplates.first;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Robocop',
      debugShowCheckedModeBanner: false,
      theme: _template.toTheme(),
      home: RoverControlPage(
        template: _template,
        onTemplateChanged: (template) {
          setState(() => _template = template);
        },
      ),
    );
  }
}

class RoverControlPage extends StatefulWidget {
  const RoverControlPage({
    required this.template,
    required this.onTemplateChanged,
    super.key,
  });

  final AppTemplate template;
  final ValueChanged<AppTemplate> onTemplateChanged;

  @override
  State<RoverControlPage> createState() => _RoverControlPageState();
}

class _RoverControlPageState extends State<RoverControlPage> {
  String _mode = 'Manual';
  bool _microphone = false;
  bool _lights = false;
  bool _relayMedia = false;

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= 820;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Robocop'),
        actions: [
          IconButton(
            tooltip: 'Configurazione',
            onPressed: () => _showSettings(context),
            icon: const Icon(Icons.tune),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: isWide ? _wideLayout() : _compactLayout(),
        ),
      ),
    );
  }

  Widget _compactLayout() {
    return ListView(
      children: [
        _TopStatusBar(template: widget.template, relayMedia: _relayMedia),
        const SizedBox(height: 12),
        _VideoPanel(template: widget.template),
        const SizedBox(height: 12),
        _CommandStrip(
          template: widget.template,
          microphone: _microphone,
          lights: _lights,
          onMicrophoneChanged: (value) => setState(() => _microphone = value),
          onLightsChanged: (value) => setState(() => _lights = value),
          onStop: () {},
        ),
        const SizedBox(height: 12),
        _ModeSelector(
          value: _mode,
          onChanged: (value) => setState(() => _mode = value),
        ),
        const SizedBox(height: 12),
        _NikkoRemotePanel(template: widget.template),
        const SizedBox(height: 12),
        _TelemetryGrid(template: widget.template),
        const SizedBox(height: 12),
        _NetworkPanel(
          template: widget.template,
          relayMedia: _relayMedia,
          onRelayChanged: (value) => setState(() => _relayMedia = value),
        ),
      ],
    );
  }

  Widget _wideLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 7,
          child: ListView(
            children: [
              _TopStatusBar(template: widget.template, relayMedia: _relayMedia),
              const SizedBox(height: 12),
              _VideoPanel(template: widget.template),
              const SizedBox(height: 12),
              _TelemetryGrid(template: widget.template),
            ],
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 360,
          child: ListView(
            children: [
              _CommandStrip(
                template: widget.template,
                microphone: _microphone,
                lights: _lights,
                onMicrophoneChanged: (value) {
                  setState(() => _microphone = value);
                },
                onLightsChanged: (value) => setState(() => _lights = value),
                onStop: () {},
              ),
              const SizedBox(height: 12),
              _ModeSelector(
                value: _mode,
                onChanged: (value) => setState(() => _mode = value),
              ),
              const SizedBox(height: 12),
              _NikkoRemotePanel(template: widget.template),
              const SizedBox(height: 12),
              _NetworkPanel(
                template: widget.template,
                relayMedia: _relayMedia,
                onRelayChanged: (value) => setState(() => _relayMedia = value),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showSettings(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Template interfaccia',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              for (final template in appTemplates)
                RadioListTile<AppTemplate>(
                  value: template,
                  groupValue: widget.template,
                  onChanged: (value) {
                    if (value != null) {
                      widget.onTemplateChanged(value);
                      Navigator.pop(context);
                    }
                  },
                  title: Text(template.name),
                  subtitle: Text(template.description),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _TopStatusBar extends StatelessWidget {
  const _TopStatusBar({
    required this.template,
    required this.relayMedia,
  });

  final AppTemplate template;
  final bool relayMedia;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      template: template,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        alignment: WrapAlignment.spaceBetween,
        children: [
          _StatusChip(
            icon: Icons.directions_car,
            label: 'Rover online',
            color: template.success,
          ),
          _StatusChip(
            icon: Icons.cloud_done,
            label: 'Cloud ok',
            color: template.primary,
          ),
          _StatusChip(
            icon: relayMedia ? Icons.hub : Icons.link,
            label: relayMedia ? 'Media relay' : 'Media diretto',
            color: relayMedia ? template.warning : template.success,
          ),
          _StatusChip(
            icon: Icons.battery_5_bar,
            label: '82%',
            color: template.secondary,
          ),
        ],
      ),
    );
  }
}

class _VideoPanel extends StatelessWidget {
  const _VideoPanel({required this.template});

  final AppTemplate template;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.black,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: template.surfaceAlt),
        ),
        child: Stack(
          children: [
            Center(
              child: Icon(
                Icons.videocam,
                color: template.muted,
                size: 48,
              ),
            ),
            Positioned(
              left: 12,
              top: 12,
              child: _OverlayPill(
                icon: Icons.radio_button_checked,
                label: 'WEBRTC LIVE',
                color: template.danger,
              ),
            ),
            Positioned(
              right: 12,
              top: 12,
              child: _OverlayPill(
                icon: Icons.network_check,
                label: '42 ms',
                color: template.success,
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Row(
                children: [
                  _RoundButton(icon: Icons.photo_camera, onPressed: () {}),
                  const SizedBox(width: 8),
                  _RoundButton(icon: Icons.fiber_manual_record, onPressed: () {}),
                  const Spacer(),
                  _RoundButton(icon: Icons.fullscreen, onPressed: () {}),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CommandStrip extends StatelessWidget {
  const _CommandStrip({
    required this.template,
    required this.microphone,
    required this.lights,
    required this.onMicrophoneChanged,
    required this.onLightsChanged,
    required this.onStop,
  });

  final AppTemplate template;
  final bool microphone;
  final bool lights;
  final ValueChanged<bool> onMicrophoneChanged;
  final ValueChanged<bool> onLightsChanged;
  final VoidCallback onStop;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      template: template,
      child: Row(
        children: [
          Expanded(
            child: FilledButton.icon(
              style: FilledButton.styleFrom(backgroundColor: template.danger),
              onPressed: onStop,
              icon: const Icon(Icons.stop_circle),
              label: const Text('STOP'),
            ),
          ),
          const SizedBox(width: 8),
          _ToggleIconButton(
            active: microphone,
            icon: microphone ? Icons.mic : Icons.mic_off,
            tooltip: 'Microfono',
            onChanged: onMicrophoneChanged,
          ),
          const SizedBox(width: 8),
          _ToggleIconButton(
            active: lights,
            icon: lights ? Icons.flashlight_on : Icons.flashlight_off,
            tooltip: 'Luci',
            onChanged: onLightsChanged,
          ),
        ],
      ),
    );
  }
}

class _ModeSelector extends StatelessWidget {
  const _ModeSelector({
    required this.value,
    required this.onChanged,
  });

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(value: 'Manual', icon: Icon(Icons.gamepad), label: Text('Manual')),
        ButtonSegment(value: 'Patrol', icon: Icon(Icons.route), label: Text('Patrol')),
        ButtonSegment(value: 'Track', icon: Icon(Icons.center_focus_strong), label: Text('Track')),
      ],
      selected: {value},
      onSelectionChanged: (selection) => onChanged(selection.first),
    );
  }
}

class _NikkoRemotePanel extends StatelessWidget {
  const _NikkoRemotePanel({required this.template});

  final AppTemplate template;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      template: template,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(
                'Telecomando Nikko Super Dominator',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const Spacer(),
              _PowerLamp(template: template),
            ],
          ),
          Text(
            'Layout ispirato al trasmettitore originale: leva velocita, leva direzione e cursori di regolazione.',
            style: TextStyle(color: template.muted),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxWidth < 330;
              final controls = [
                Expanded(
                  child: _OriginalLever(
                    template: template,
                    title: 'Velocita',
                    topLabel: 'Avanti 2',
                    centerLabel: 'Stop',
                    bottomLabel: 'Retro',
                    valueLabel: '+60%',
                    icon: Icons.swap_vert,
                  ),
                ),
                SizedBox(width: compact ? 8 : 12),
                Expanded(
                  child: _OriginalLever(
                    template: template,
                    title: 'Direzione',
                    topLabel: 'Sinistra',
                    centerLabel: 'Centro',
                    bottomLabel: 'Destra',
                    valueLabel: '0 deg',
                    icon: Icons.compare_arrows,
                    horizontal: true,
                  ),
                ),
              ];

              return Row(children: controls);
            },
          ),
          const SizedBox(height: 12),
          _TrimSlider(
            template: template,
            icon: Icons.tune,
            label: 'Cursore regolazione velocita',
            value: 0,
          ),
          _TrimSlider(
            template: template,
            icon: Icons.settings_input_component,
            label: 'Cursore regolazione direzione',
            value: 0,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.power_settings_new),
                label: const Text('ON/OFF'),
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.settings_remote),
                label: const Text('Quartz 27 MHz'),
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.linear_scale),
                label: const Text('Antenna'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton.filledTonal(
                tooltip: 'Camera su',
                onPressed: () {},
                icon: const Icon(Icons.keyboard_arrow_up),
              ),
              IconButton.filledTonal(
                tooltip: 'Centro camera',
                onPressed: () {},
                icon: const Icon(Icons.control_camera),
              ),
              IconButton.filledTonal(
                tooltip: 'Camera giu',
                onPressed: () {},
                icon: const Icon(Icons.keyboard_arrow_down),
              ),
              const Spacer(),
              Text('Camera', style: TextStyle(color: template.muted)),
            ],
          ),
        ],
      ),
    );
  }
}

class _OriginalLever extends StatelessWidget {
  const _OriginalLever({
    required this.template,
    required this.title,
    required this.topLabel,
    required this.centerLabel,
    required this.bottomLabel,
    required this.valueLabel,
    required this.icon,
    this.horizontal = false,
  });

  final AppTemplate template;
  final String title;
  final String topLabel;
  final String centerLabel;
  final String bottomLabel;
  final String valueLabel;
  final IconData icon;
  final bool horizontal;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Icon(icon, color: template.primary, size: 18),
            const SizedBox(width: 6),
            Expanded(child: Text(title)),
          ],
        ),
        const SizedBox(height: 8),
        AspectRatio(
          aspectRatio: 0.78,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: template.surfaceAlt,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: horizontal ? _horizontalLever(context) : _verticalLever(context),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          valueLabel,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium,
        ),
      ],
    );
  }

  Widget _verticalLever(BuildContext context) {
    return Column(
      children: [
        Text(topLabel, style: TextStyle(color: template.muted)),
        Expanded(
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(width: 12, color: template.background),
              Positioned(
                top: 34,
                child: _LeverKnob(template: template),
              ),
            ],
          ),
        ),
        Text(centerLabel, style: TextStyle(color: template.muted)),
        const SizedBox(height: 6),
        Text(bottomLabel, style: TextStyle(color: template.muted)),
      ],
    );
  }

  Widget _horizontalLever(BuildContext context) {
    return Column(
      children: [
        Text(centerLabel, style: TextStyle(color: template.muted)),
        Expanded(
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(height: 12, color: template.background),
              _LeverKnob(template: template),
              Positioned(left: 0, child: Text(topLabel, style: TextStyle(color: template.muted))),
              Positioned(right: 0, child: Text(bottomLabel, style: TextStyle(color: template.muted))),
            ],
          ),
        ),
      ],
    );
  }
}

class _LeverKnob extends StatelessWidget {
  const _LeverKnob({required this.template});

  final AppTemplate template;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 62,
      height: 62,
      decoration: BoxDecoration(
        color: template.primary,
        shape: BoxShape.circle,
        border: Border.all(color: template.text, width: 2),
      ),
      child: const Icon(Icons.open_with, color: Colors.black),
    );
  }
}

class _TrimSlider extends StatelessWidget {
  const _TrimSlider({
    required this.template,
    required this.icon,
    required this.label,
    required this.value,
  });

  final AppTemplate template;
  final IconData icon;
  final String label;
  final double value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: template.secondary),
        const SizedBox(width: 8),
        Expanded(
          child: Slider(
            value: value,
            min: -1,
            max: 1,
            divisions: 20,
            label: '0',
            onChanged: (_) {},
          ),
        ),
        SizedBox(
          width: 96,
          child: Text(
            label,
            style: TextStyle(color: template.muted),
          ),
        ),
      ],
    );
  }
}

class _PowerLamp extends StatelessWidget {
  const _PowerLamp({required this.template});

  final AppTemplate template;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: template.success,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: template.success.withOpacity(0.5),
                blurRadius: 8,
              ),
            ],
          ),
        ),
        const SizedBox(width: 6),
        Text(
          'ON',
          style: TextStyle(color: template.success),
        ),
      ],
    );
  }
}
              decoration: BoxDecoration(
                color: template.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.open_with, color: Colors.black),
            ),
          ],
        ),
      ),
    );
  }
}

class _TelemetryGrid extends StatelessWidget {
  const _TelemetryGrid({required this.template});

  final AppTemplate template;

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Batteria', '82%', Icons.battery_5_bar, template.success),
      ('RSSI', '-58 dBm', Icons.wifi, template.primary),
      ('Velocita', '0.32 m/s', Icons.speed, template.secondary),
      ('Ostacolo', '46 cm', Icons.warning_amber, template.warning),
      ('Heading', '142 deg', Icons.explore, template.primary),
      ('CPU rover', '38%', Icons.memory, template.secondary),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 190,
        mainAxisExtent: 86,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (context, index) {
        final item = items[index];
        return _Panel(
          template: template,
          child: Row(
            children: [
              Icon(item.$3, color: item.$4),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.$1, style: TextStyle(color: template.muted)),
                    Text(
                      item.$2,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _NetworkPanel extends StatelessWidget {
  const _NetworkPanel({
    required this.template,
    required this.relayMedia,
    required this.onRelayChanged,
  });

  final AppTemplate template;
  final bool relayMedia;
  final ValueChanged<bool> onRelayChanged;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      template: template,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('Rete e setup', style: Theme.of(context).textTheme.titleMedium),
              const Spacer(),
              Switch(value: relayMedia, onChanged: onRelayChanged),
            ],
          ),
          Text(
            relayMedia ? 'TURN fallback attivo' : 'WebRTC diretto preferito',
            style: TextStyle(color: relayMedia ? template.warning : template.success),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.wifi_find),
                label: const Text('Scansiona WiFi'),
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.bluetooth),
                label: const Text('Setup BT'),
              ),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.usb),
                label: const Text('Setup USB'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({
    required this.template,
    required this.child,
  });

  final AppTemplate template;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: template.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: template.surfaceAlt),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: child,
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 18, color: color),
      label: Text(label),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _OverlayPill extends StatelessWidget {
  const _OverlayPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.62),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 14),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Colors.white)),
          ],
        ),
      ),
    );
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({
    required this.icon,
    required this.onPressed,
  });

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton.filledTonal(
      onPressed: onPressed,
      icon: Icon(icon),
      tooltip: '',
    );
  }
}

class _ToggleIconButton extends StatelessWidget {
  const _ToggleIconButton({
    required this.active,
    required this.icon,
    required this.tooltip,
    required this.onChanged,
  });

  final bool active;
  final IconData icon;
  final String tooltip;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return IconButton.filledTonal(
      tooltip: tooltip,
      isSelected: active,
      onPressed: () => onChanged(!active),
      icon: Icon(icon),
    );
  }
}
