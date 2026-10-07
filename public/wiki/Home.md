# T2Climb Timer System User Manual

Welcome to the official **T2Climb Timer System User Manual**. The T2Climb ecosystem provides professional climbing competition timing, automated rotation management, and training tools for climbing gyms, event directors, route setters, and athletes.

---

## 📖 Manual Structure (By Discipline & Mode)

This user manual is organized by **Climbing Discipline & Timer Mode**. Each chapter provides a unified workflow combining hardware control unit operations, physical button triggers, and the web app interface (`timer-ctrl`).

Select a mode below to view detailed operating instructions, configuration parameters, audio/visual behavior, and control mappings:

1. **[Speed Climbing (`Speed.md`)](Speed.md)**
   - IFSC standard 15m Speed climbing sequence.
   - 3-beep start countdown (880Hz pips + 1760Hz GO tone).
   - False start detection & 100ms grace period.
   - Dual-lane referee controls & manual winner/fall overrides.

2. **[Lead Climbing (`Lead.md`)](Lead.md)**
   - IFSC standard 6-minute Lead climbing attempts.
   - Silent start (feet leave ground) and silent top/fall finish lockdown.
   - 40-second athlete preparation countdown & DNS detection.
   - 1-minute warning tone (1760Hz) & 360s timeout buzzer.

3. **[Bouldering (`Bouldering.md`)](Bouldering.md)**
   - IFSC Qualifications & Finals rotation management.
   - Automated `Climb` ➔ `Transition` ➔ `Climb` interval looping.
   - IFSC competition audio profile (523Hz start tone, 1760Hz 1-min warning, 440Hz 5s countdown pips, 880Hz end tone).
   - Pause, resume, and manual rotation controls.

4. **[Circuit Training (`Circuit.md`)](Circuit.md)**
   - Multi-step High Intensity Interval Training (HIIT) & workout routines.
   - Interactive step configuration (`CS` command / `circ_seq` pairs).
   - Initial preparation warning countdown (`N`).
   - Single-cycle (`Q0`) vs continuous auto-looping (`Q1`).

5. **[Clock / Stopwatch Mode (`Clock.md`)](Clock.md)**
   - Standard count-up stopwatch & wall clock function.
   - Split time recording and dual-lane timekeeping.
   - System timezone (`TZ`), RTC browser sync, and display formatting.

---

## 🎛️ Control Interfaces Overview

The system can be operated simultaneously via:
- **Physical Hardware Control Unit**: ESP32 unit with OLED display, rotary encoder, push buttons, and TWAI CAN bus.
- **Web App Interface (`timer-ctrl`)**: PWA connected via Bluetooth (NUS) or Wi-Fi (SSE/HTTP) for real-time telemetry and full configuration.

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)
