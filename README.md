# CircuitCubesDualDrive – Remote-Fix v5

## Änderungen
- Beibehaltung der funktionierenden LEGO Powered Up 88010-Anbindung aus Remote-Fix v3.
- Lenkung C: maximal 240 ms je Lenkimpuls. Nach Loslassen wird C zunächst gestoppt und anschließend kurz in Gegenrichtung angesteuert.
- Rückstellstrategie wieder näher am Originalprojekt: Die Rückstellzeit folgt normalerweise der gemessenen Tastendruckdauer, ist aber auf 90 ms begrenzt. Für sehr kurze Impulse gilt eine Mindestzeit von 25 ms, damit BLE- und Motor-Anlaufzeiten den Rückimpuls nicht vollständig aufzehren.
- Lenkungsereignisse werden in ihrer Reihenfolge abgearbeitet. Jeder Tastendruck und jedes Loslassen erzeugt einen eigenen Motorbefehl; Lenkung und Antrieb besitzen getrennte Ereigniswarteschlangen und teilen sich nur die serielle BLE-Schreibwarteschlange.
- A/B-Fahrmotoren laufen weiterhin gemeinsam. Die beiden Befehle werden geordnet gesendet.
- Pointer Events vermeiden doppelte Touch-/Mouse-Auslösungen.
- Screen Wake Lock wird, soweit unterstützt, verwendet. Hintergrundausführung kann der Browser weiterhin einschränken.

## Hinweise
- Ohne Positionssensor kann die Software keine exakte Mittelstellung erkennen. Die Rückstellung ist zeitbasiert und muss am aufgebockten Fahrzeug geprüft werden.
- Die 25-ms-Mindestzeit ist ein Startwert. Falls der LKW nach kurzen Impulsen zu weit zurücklenkt, kann dieser Wert reduziert werden; falls die Rückstellung nicht zuverlässig greift, kann er vorsichtig erhöht werden.
- Die Motorbefehle werden durch die BLE-Schreibbestätigung serialisiert. Die reale Reaktionszeit hängt zusätzlich von Bluetooth-Verbindung, Circuit-Cubes-Firmware und Motor ab.
- Eine GitHub-Pages-Webseite kann Hintergrundbetrieb nicht plattformübergreifend garantieren. Browser und Betriebssystem können JavaScript oder Bluetooth im Hintergrund pausieren.

## Test
1. Fahrzeug aufbocken und alle Dateien aus diesem Ordner auf GitHub Pages hochladen.
2. Circuit Cubes und anschließend die LEGO-Fernbedienung verbinden.
3. Kurze und lange Lenkimpulse testen. Im Terminal werden gemessene Impuls- und Rückstellzeiten ausgegeben.
4. Schnelle Richtungswechsel sowie gleichzeitiges Lenken und Fahren testen.
5. Erst danach mit aufgesetztem Fahrzeug vorsichtig fahren.
