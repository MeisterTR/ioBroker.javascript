
Der javascript-Adapter dient dazu komfortabel Skripte zu erstellen, editieren und zu verwalten.


## [](https://github.com/ioBroker/ioBroker/wiki/ioBroker-Adapter-javascript#konfiguration)Konfiguration


![Einstellungsmen� Javascript Adapter](img/javascript_Einstellungen-Javascript.png)
   Die eigentliche Konfiguration besteht aus der Eingabe von zus�tzlichen zu ladenden npm-Module (durch Komma getrennt), sowie der Geo-Koordinaten, die f�r diverse Berechnungen benutzt werden sollen. Um die Koordinaten zu erhalten, kann man z.B. _google maps_ ziemlich weit aufzoomen und an der gew�nschten Stelle anklicken. Die Koordinaten werden dann angezeigt. Nach dem Speichern muss der Adapter noch �ber die rote Play-Taste aktiviert werden aktiviert werden.

* * *

## Bedienung

Bei der Installation wird ein weiterer Reiter _Scripte_ in der _Admin_-Oberfl�che gezeigt. Hier wird ein neuer Ordner angelegt indem auf das (+) in der Symbolleiste (roter Kreis) geklickt wird.  Ein neues Skript wird �ber das "leere Blatt"-Icon links davon angelegt. Ein Fenster �ffnet sich und fragt den Namen und Speicherort in der Ordnerstruktur ab. 
![Javascript Adapter](img/javascript_Javascript-Adapter.png)


### Ordner- und Dateiliste

Die Ordnerstruktur kann nach eigenem Wunsch angelegt werden. Der Speicherort hat keine Auswirkungen auf die Funktionalit�t des Skriptes. Neben der Baumstruktur gibt es eine Listenansicht. Ein Suchfeld erleichtert das Wiederfinden von Skripten. Damit ein Skript l�uft, muss es links in der Ordnerstruktur durch klick auf den roten _Play_-Knopf aktiviert werden. Zum Stoppen auf den gr�nen _Pause_-Knopf dr�cken. F�r jedes Skript wird ein neues Objekt angelegt. Es tr�gt den Skriptnamen mit dem Zusatz `_enabled` und liegt im Ordner `javascript.Instanz.ScriptEnabled`. Das Objekt zeigt mit (`true/false`) an, ob das Skript l�uft. Der Zustand kann auch gesetzt werden, um das Skript ein-/auszuschalten. Skripte, die im Ordner _global_ gespeichert wurden, sind globale Skripte. Diese werden intern vor jedes andere Skript kopiert, also vorher abgearbeitet. Somit lassen sich globale Funktionen auf mehrere Skripte anwenden. Variablen in globalen Skripten k�nnen in anderen Skripten benutzt werden. Aber Achtung: Jedes Skript hat seinen eigenen Variablen-Raum. Man kann Variablen in globalen Skripten also nicht dazu benutzen um Werte zwischen Skripten auszutauschen. Dazu m�ssen zwingend Objekte (States) genutzt werden.  

### Editor

Nach dem Anlegen �ffnet sich rechts der Editor f�r _Javascript_. Einige Beispielskripte finden sich [hier](http://www.iobroker.net/?page_id=2786&lang=de).

#### Name

Hat man vorher einen Namen vergeben, wird dieser hier angezeigt und kann ge�ndert werden.

#### Speicherort

In diesem Dropdown werden alle angelegten Ordner angezeigt. Zur Zeit sind sie in der chronologischen Folge ihrer Erstellung sortiert.

#### Enginetyp

hier kann ausgew�hlt werden, ob mit der _javascript_ oder der _coffeescript_ engine gearbeitet werden soll.

#### Log

Rechts unten findet sich das Log-Fenster f�r die Ausgabe aller das markierte Skript betreffende Logs. Die Logs werden nach dem Abspeichern/Neustart des Skriptes angezeigt.

* * *

## Tipps

### Backup

Um Skripte im Zweifel wiederherstellen zu k�nnen, sei die Sicherung per _Copy & Paste_ empfohlen.

### Test-Instanz

Es hat sich bew�hrt, zum Testen von neuen Skripten, eine weitere Javascript-Instanz anzulegen und das Skript in dieser Instanz zu starten. 
Hinter dem Skriptnamen l�sst sich per Dropdown die gew�nschtes Instanz einstellen. 
Sollte im Skript ein schwerwiegender Fehler sein, beendet sich nur diese zus�tzliche Testinstanz, nicht die Produktivinstanz. 

![Instanz Javascript Adapter w�hlen](img/screen.jpg)