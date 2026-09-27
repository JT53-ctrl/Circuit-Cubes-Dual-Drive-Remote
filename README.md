# Circuit Cubes Dual Drive Remote

A modified version of [CircuitCubesRemote](https://github.com/repkovsky/CircuitCubesRemote)
with support for **two simultaneously controlled drive motors**.

## What is different?

The original project provides one configurable drive motor and one configurable
steering motor.

This version adds:

- Drive motor 1
- Optional drive motor 2
- Separate output channel selection for both drive motors
- Separate direction inversion for both drive motors
- Separate speed setting for both drive motors
- Synchronized drive control from the same forward/reverse buttons
- Original steering functionality
- Original LEGO 88010 remote support

When drive motor 2 is enabled, a forward command is sent to both configured
Circuit Cubes outputs. The same applies to reverse and stop.

Example:

```text
Drive motor 1 -> channel A
Drive motor 2 -> channel B

Forward:
+255a
+255b

Reverse:
-255a
-255b

Stop:
+000a
+000b
```

The Circuit Cubes protocol uses commands in the form `dNNNc`, where `d` is
`+` or `-`, `NNN` is a speed from 000 to 255, and `c` is output channel
`a`, `b`, or `c`.

## Important

The two commands are transmitted one after another over Bluetooth. They are
treated as one logical drive action by this application, but the Bluetooth
protocol itself still receives individual motor commands.

For a vehicle with two mechanically coupled drive motors, test the direction
of each motor separately first. If one motor rotates in the opposite direction,
enable **Reverse** for that motor.

Do not configure the same Circuit Cubes output channel for both drive motors.
Use two different outputs, for example A+B.

## Browser

The application uses Web Bluetooth, just like the original project. A browser
and operating system combination with Web Bluetooth support is required.

## Based on

This project is based on:

https://github.com/repkovsky/CircuitCubesRemote

The original project is licensed under the MIT License.

## License

This repository keeps the original MIT license and copyright notice. Modified
code is provided under the same license.

Copyright (c) 2024 Dominik Rzepka

See `LICENSE`.

## Files

- `index.html` – application and controls
- `interface.js` – settings and persistent configuration
- `ble_nus.js` – Circuit Cubes Bluetooth communication
- `ble_lwp.js` – LEGO 88010 remote communication
- `style.css` – user interface styling

`ble_nus.js` and `ble_lwp.js` can be copied unchanged from the upstream
project because the dual-drive behavior is implemented at the application
layer.
