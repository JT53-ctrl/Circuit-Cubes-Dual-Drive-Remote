# CircuitCubesDualDrive – Remote-Fix v4

## Änderungen
- Beibehaltung der funktionierenden LEGO Powered Up 88010-Anbindung aus Remote-Fix v3.
- Lenkung C: maximal 240 ms je Lenkimpuls; nach Loslassen oder Sicherheitsabschaltung folgt ein fester 10-ms-Gegenimpuls. Dieser ist unabhängig von der Länge des vorherigen Impulses.
- Alle Motorbefehle werden geordnet über eine Schreibwarteschlange gesendet; künstliche 4-ms-Verzögerungen wurden entfernt. A/B-Fahrbefehle werden paarweise und geordnet verarbeitet.
- Pointer Events ersetzen die parallelen Touch-/Mouse-Handler, damit ein physischer Tastendruck nicht doppelt ausgelöst wird.
- Der alte Video-Trick zur Wachhaltung wurde entfernt. Stattdessen wird, soweit vom Browser unterstützt, die Screen Wake Lock API verwendet, solange die Seite sichtbar ist.

## Wichtige Plattformgrenzen
Diese Version kann Hintergrundbetrieb nur bestmöglich unterstützen, aber nicht erzwingen. Browser dürfen JavaScript und Bluetooth im Hintergrund drosseln oder pausieren. Web Bluetooth wird in Chromium-Browsern wie Chrome auf Android sowie Chrome/Edge auf macOS unterstützt. Safari auf iOS und macOS unterstützt Web Bluetooth derzeit nicht nativ. Eine reine GitHub-Pages-Webseite kann diese Plattformgrenzen nicht umgehen.

## Testhinweise
1. Alle Dateien des Ordners auf GitHub Pages hochladen.
2. In einem Web-Bluetooth-fähigen Browser zuerst die Circuit Cubes, danach die LEGO-Fernbedienung verbinden.
3. Zunächst aufgebockt testen: Lenkimpuls kurz und lang auslösen und prüfen, ob nach jedem Impuls ein kurzer Gegenimpuls folgt.
4. Anschließend mehrere schnelle Tastendrücke sowie gleichzeitiges Lenken und Fahren testen.
5. Hintergrundbetrieb separat testen. Bei gesperrtem Bildschirm oder in Safari ist er nicht garantiert.

Die 10 ms Rückstellzeit ist ein vorsichtiger Startwert. Ohne Positionssensor lässt sich die tatsächliche Mittelstellung nicht messen oder garantieren.
