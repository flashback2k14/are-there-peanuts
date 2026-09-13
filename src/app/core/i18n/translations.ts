const de = {
  'nav.language': 'Sprache',
  'nav.home': 'Zum Scanner',
  'nav.german': 'Deutsch',
  'nav.english': 'Englisch',
  'nav.langUnsaved':
    'Dein Browser erlaubt gerade keine Speicherung. Die Sprache gilt deshalb nur für diesen Besuch.',
  'nav.langUnsavedOk': 'OK',

  'scan.title': 'Barcode in den Rahmen halten.',
  'scan.hint': 'Striche quer, eine Handbreit Abstand.',
  'scan.start': 'Kamera starten',
  'scan.starting': 'Kamera startet …',
  'scan.stop': 'Kamera aus',
  'scan.torchOn': 'Licht an',
  'scan.torchOff': 'Licht aus',
  'scan.idle': 'Die Kamera ist aus.',
  'scan.denied':
    'Die Kamera ist blockiert. Erlaube den Zugriff in den Browser-Einstellungen oder gib die Nummer unten ein.',
  'scan.noCamera': 'Keine Kamera gefunden. Gib die Nummer unten ein.',
  'scan.insecure':
    'Die Kamera funktioniert nur über eine sichere Verbindung (HTTPS). Gib die Nummer unten ein.',
  'scan.failed': 'Die Kamera ließ sich nicht starten. Gib die Nummer unten ein.',
  'scan.found': 'Code {code} erkannt.',

  'manual.label': 'Barcode-Nummer',
  'manual.helper': 'Die 8 oder 13 Ziffern unter den Strichen.',
  'manual.submit': 'Prüfen',
  'manual.required': 'Gib die Ziffern unter dem Barcode ein.',
  'manual.invalid': 'Diese Nummer ist kein gültiger Barcode. Prüf die Ziffern noch einmal.',

  'history.title': 'Zuletzt geprüft',
  'history.countLabel': 'Produkte',
  'history.countLabelOne': 'Produkt',
  'history.empty': 'Noch nichts gescannt. Der Supermarkt wartet.',
  'history.remove': '{name} entfernen',
  'history.removed': '{name} entfernt.',
  'history.cleared': 'Verlauf geleert.',
  'history.clear': 'Verlauf leeren',
  'history.undo': 'Rückgängig',
  'history.unnamed': 'Produkt {code}',
  'history.unsaved':
    'Dein Browser erlaubt gerade keine Speicherung. Der Verlauf gilt deshalb nur für diesen Besuch.',

  'verdict.contains': 'Enthält Erdnüsse.',
  'verdict.may-contain': 'Kann Spuren enthalten.',
  'verdict.not-declared': 'Keine Erdnüsse angegeben.',
  'verdict.unknown': 'Zu wenig Daten.',
  'verdict.not-found': 'Nicht gefunden.',

  'verdictShort.contains': 'Erdnüsse',
  'verdictShort.may-contain': 'Spuren',
  'verdictShort.not-declared': 'Nicht angegeben',
  'verdictShort.unknown': 'Unklar',
  'verdictShort.not-found': 'Unbekannt',

  'note.contains': 'Laut Open Food Facts steckt Erdnuss in diesem Produkt.',
  'note.may-contain': 'Der Hersteller warnt vor möglichen Spuren von Erdnuss.',
  'note.not-declared':
    'In den Daten taucht keine Erdnuss auf. Lies trotzdem die Packung, Rezepturen ändern sich.',
  'note.unknown':
    'Für dieses Produkt fehlen Zutaten und Allergene. Die Packung ist hier die einzige Quelle.',
  'note.not-found':
    'Open Food Facts kennt den Code {code} noch nicht. Lies die Packung oder trag das Produkt dort ein.',
  'note.invalid': '„{code}“ ist kein gültiger Barcode.',

  'product.loading': 'Suche Produkt {code} …',
  'product.error':
    'Open Food Facts war nicht erreichbar. Prüf die Verbindung und versuch es noch einmal.',
  'product.rateLimited':
    'Zu viele Anfragen in kurzer Zeit. Warte eine Minute und versuch es dann noch einmal.',
  'product.retry': 'Erneut versuchen',
  'product.back': 'Zur Startseite',
  'product.reasons': 'Warum?',
  'product.ingredients': 'Zutaten',
  'product.noIngredients': 'Keine Zutatenliste hinterlegt.',
  'product.incomplete': 'Die Zutatenliste ist bei Open Food Facts als unvollständig markiert.',
  'product.code': 'Barcode',
  'product.brand': 'Marke',
  'product.viewOff': 'Bei Open Food Facts ansehen',
  'product.editOff': 'Bei Open Food Facts ergänzen',
  'product.scanNext': 'Nächstes Produkt scannen',
  'product.legend': 'Balken: Erdnuss als Zutat. Gepunktet: Erdnuss im Spurenhinweis.',

  'reason.allergen-tag': 'Als Allergen eingetragen.',
  'reason.trace-tag': 'Als mögliche Spur eingetragen.',
  'reason.text-contains': 'In den Zutaten steht „{term}“.',
  'reason.text-may-contain': 'Im Spurenhinweis steht „{term}“.',
  'reason.none': 'Weder Allergene noch Spuren noch Zutaten nennen Erdnuss.',

  'footer.statement': 'Im Zweifel zählt die Packung.',
  'footer.source': 'Produktdaten:',
  'footer.disclaimer':
    'Diese App ersetzt keine ärztliche Beratung und kann Fehler in den Daten nicht erkennen.',
};

export type TranslationKey = keyof typeof de;
export type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  'nav.language': 'Language',
  'nav.home': 'Back to scanner',
  'nav.german': 'German',
  'nav.english': 'English',
  'nav.langUnsaved':
    'Your browser isn’t allowing storage right now, so the language only applies to this visit.',
  'nav.langUnsavedOk': 'OK',

  'scan.title': 'Hold the barcode inside the frame.',
  'scan.hint': 'Bars across, a hand’s width away.',
  'scan.start': 'Start camera',
  'scan.starting': 'Starting camera…',
  'scan.stop': 'Camera off',
  'scan.torchOn': 'Light on',
  'scan.torchOff': 'Light off',
  'scan.idle': 'The camera is off.',
  'scan.denied':
    'The camera is blocked. Allow access in your browser settings, or type the number below.',
  'scan.noCamera': 'No camera found. Type the number below.',
  'scan.insecure': 'The camera only works over a secure connection (HTTPS). Type the number below.',
  'scan.failed': 'The camera didn’t start. Type the number below.',
  'scan.found': 'Found code {code}.',

  'manual.label': 'Barcode number',
  'manual.helper': 'The 8 or 13 digits under the bars.',
  'manual.submit': 'Check',
  'manual.required': 'Type the digits under the barcode.',
  'manual.invalid': 'That number isn’t a valid barcode. Check the digits again.',

  'history.title': 'Recently checked',
  'history.countLabel': 'products',
  'history.countLabelOne': 'product',
  'history.empty': 'Nothing scanned yet. The supermarket awaits.',
  'history.remove': 'Remove {name}',
  'history.removed': 'Removed {name}.',
  'history.cleared': 'History cleared.',
  'history.clear': 'Clear history',
  'history.undo': 'Undo',
  'history.unnamed': 'Product {code}',
  'history.unsaved':
    'Your browser isn’t allowing storage right now, so the history only lasts for this visit.',

  'verdict.contains': 'Contains peanuts.',
  'verdict.may-contain': 'May contain traces.',
  'verdict.not-declared': 'No peanuts listed.',
  'verdict.unknown': 'Not enough data.',
  'verdict.not-found': 'Not found.',

  'verdictShort.contains': 'Peanuts',
  'verdictShort.may-contain': 'Traces',
  'verdictShort.not-declared': 'Not listed',
  'verdictShort.unknown': 'Unclear',
  'verdictShort.not-found': 'Unknown',

  'note.contains': 'According to Open Food Facts, this product contains peanut.',
  'note.may-contain': 'The maker warns about possible traces of peanut.',
  'note.not-declared': 'Peanut doesn’t appear in the data. Read the label anyway, recipes change.',
  'note.unknown':
    'This product has no ingredients or allergens on file. The label is the only source here.',
  'note.not-found':
    'Open Food Facts doesn’t know the code {code} yet. Read the label, or add the product there.',
  'note.invalid': '“{code}” isn’t a valid barcode.',

  'product.loading': 'Looking up {code}…',
  'product.error': 'Couldn’t reach Open Food Facts. Check your connection and try again.',
  'product.rateLimited': 'Too many lookups in a short time. Wait a minute, then try again.',
  'product.retry': 'Try again',
  'product.back': 'Back to start',
  'product.reasons': 'Why?',
  'product.ingredients': 'Ingredients',
  'product.noIngredients': 'No ingredient list on file.',
  'product.incomplete': 'Open Food Facts marks this ingredient list as incomplete.',
  'product.code': 'Barcode',
  'product.brand': 'Brand',
  'product.viewOff': 'View on Open Food Facts',
  'product.editOff': 'Add details on Open Food Facts',
  'product.scanNext': 'Scan the next product',
  'product.legend': 'Solid marker: peanut as an ingredient. Dotted: peanut in a trace warning.',

  'reason.allergen-tag': 'Listed as an allergen.',
  'reason.trace-tag': 'Listed as a possible trace.',
  'reason.text-contains': 'The ingredients say “{term}”.',
  'reason.text-may-contain': 'The trace warning says “{term}”.',
  'reason.none': 'Neither allergens, traces nor ingredients mention peanut.',

  'footer.statement': 'When in doubt, trust the label.',
  'footer.source': 'Product data:',
  'footer.disclaimer': 'This app doesn’t replace medical advice and can’t spot errors in the data.',
};

export const DICTIONARIES = { de, en } satisfies Record<string, Dictionary>;
