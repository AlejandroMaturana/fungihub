# SMFB (Single Multi-Function Button) — Wiring Instructions

**Board:** ESP32-S3 DevKit v1.0
**GPIO:** GPIO6
**Firmware:** `button_driver.cpp` / `button_fsm.cpp` / `button_handler.cpp`

---

## Pin Mapping

| Pin on Button | Connects to | Notes |
|---------------|-------------|-------|
| **Terminal A** (any) | **GPIO6** | Signal line — internal pull-up enabled in firmware |
| **Terminal B** (any) | **GND** | Active LOW — pressing shorts to GND |

> **No external pull-up resistor required.** The firmware configures `INPUT_PULLUP` on GPIO6 at init.

---

## Wiring Diagram

```
  ESP32-S3 DevKit v1.0
  ┌─────────────────────┐
  │                     │
  │  GPIO6 (Pin 6) ─────┼───────┐
  │                     │       │
  │  GND            ─────┼────┐  │
  │                     │   │  │
  └─────────────────────┘   │  │
                            │  │
                       ┌────┴──┴────┐
                       │   BUTTON   │
                       │  (tactile) │
                       └────────────┘
```

**Schematic:**

```
  GPIO6 ──┬── [BUTTON] ── GND
          │
          └── (internal pull-up ~45kΩ to 3.3V)
```

---

## Step-by-Step Connection

1. **Identify GPIO6** on the ESP32-S3 DevKit. It is pin **6** on the board header.
2. **Solder/connect one leg** of the tactile button to GPIO6.
3. **Solder/connect the other leg** to any **GND** pin on the board.
4. **No other components needed** — no resistors, no capacitors (software debounce at 20ms handles noise).
5. **Verify with multimeter**: continuity between button terminals when pressed; open circuit when released.

---

## Pin Safety Notes (ESP32-S3)

- GPIO6 is a **valid GPIO** on the ESP32-S3. It does **not** have boot-strapping restrictions (unlike GPIO0, GPIO2, etc.).
- The internal pull-up is approximately **45kΩ**. For noisy environments, add an **external 10kΩ pull-up** to 3.3V in parallel (optional).
- GPIO6 is **not** used by PSRAM or Flash — safe for general GPIO use.
- Max sink current: **40mA** per GPIO. A tactile button draws negligible current — no concern.

---

## Optional: External Pull-Up (Noisy Environments)

If the button cable is long (>20cm) or runs near noisy lines:

```
  3.3V ─── [10kΩ] ──┬── GPIO6
                     │
                 [BUTTON]
                     │
                    GND
```

This reinforces the internal pull-up and improves noise immunity.

---

## Optional: Hardware Debounce Capacitor

For extra-tough environments (industrial, long cables), add a **0.1µF ceramic capacitor** between GPIO6 and GND:

```
  GPIO6 ──┬── [BUTTON] ── GND
          │
       [100nF]
          │
         GND
```

> The firmware already implements 20ms software debounce. This capacitor is **optional** for most use cases.

---

## Test Procedure

After wiring, flash the test sketch to validate hardware:

```
firmware/test/S3_test-button/S3_test-button.ino
```

This runs 7 automated tests:

| # | Test | What to do |
|---|------|------------|
| 1 | Debounce raw | Press and release once |
| 2 | Click (< 300ms) | Quick press and release |
| 3 | Double-click | Two quick presses |
| 4 | Hold 3s | Hold for 3+ seconds |
| 5 | Hold 10s | Hold for 10+ seconds (no factory reset in test) |
| 6 | Cancellation | Hold ~2s, release before 3s |
| 7 | GPIO config | Verifies pull-up is active (HIGH when idle) |

Open Serial Monitor at **115200 baud** to see results. All 7 tests should pass (LED flashes green).

---

## Gesture Reference

| Gesture | Duration | LED Feedback | Action |
|---------|----------|--------------|--------|
| Click | < 300ms | White flash | Device status |
| Double-click | 2x < 300ms, gap < 300ms | 2x cyan flash | Force sensor refresh |
| Hold 3s | ≥ 3000ms | Blue ramp + double flash | Enter/exit BLE provisioning |
| Hold 10s | ≥ 10000ms | Red ramp + 5x red flash | **Factory reset** (erases WiFi + config) |

---

## Config Reference

From `config.example.h`:

```c
#define BUTTON_PIN             GPIO_NUM_6
#define BUTTON_DEBOUNCE_MS     20
#define BUTTON_CLICK_MAX_MS    300
#define BUTTON_DOUBLE_GAP_MS   300
#define BUTTON_HOLD_3S_MS      3000
#define BUTTON_HOLD_10S_MS     10000
#define BUTTON_TASK_STACK      3072
#define BUTTON_TASK_PRIORITY   2
#define BUTTON_TASK_DELAY_MS   10
```

---

*Generated from firmware source: `button_driver.cpp`, `button_fsm.cpp`, `button_handler.cpp`, `config.example.h`*
