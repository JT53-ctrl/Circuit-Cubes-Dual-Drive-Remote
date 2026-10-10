# CircuitCubesDualDrive

Modified browser remote based on the original CircuitCubesRemote project.

## Vehicle configuration

- A = left drive motor
- B = right drive motor
- C = steering motor
- A and B always receive the same drive speed. Differential steering has been removed.
- C runs only while the steering button is held.
- Releasing the steering button stops C immediately; C does not automatically return.
- C has a hard maximum run time of 240 ms per steering command.
- Steering speed is adjustable from the Settings panel.
- Drive speed is adjustable from the Settings panel.
- Individual inversion for A, B and C is available.
- Manual center correction is available because C has no position feedback.

## Original functionality

LEGO 88010 Remote support and Circuit Cubes Bluetooth communication are retained.

The project is based on `repkovsky/CircuitCubesRemote` and retains its MIT license.
