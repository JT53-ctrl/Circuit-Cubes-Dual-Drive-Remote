# Circuit Cubes Dual Drive Remote

A modified version of [CircuitCubesRemote](https://github.com/repkovsky/CircuitCubesRemote)
with support for **two simultaneously controlled drive motors**.

## Vehicle configuration

The vehicle uses three motors:

- **A = left drive motor**
- **B = right drive motor**
- **C = steering motor**

A and B form a differential drive. During a turn, the inside drive motor
is progressively slowed down. C is the physical steering motor.

### Steering motor C

C has a maximum outward movement of **140 ms**:

1. Press left/right: C turns away from center.
2. After 140 ms C stops and stays at the limit while the button remains held.
3. Release: C turns back for exactly the duration it turned outward.
4. C stops at center.

For example, 60 ms held means 60 ms out and 60 ms back. Holding for 200 ms
means 140 ms out and 140 ms back.

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
