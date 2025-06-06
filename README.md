# It's a Fake

Prosta platforma społecznościowa do weryfikacji fake newsów. Projekt w Node.js z Express oraz czystym HTML/CSS/JS.

## Instalacja

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom serwer:
   ```bash
   npm start
   ```

Aplikacja nasłuchuje domyślnie na porcie `3000`.

## Struktura
- `server.js` – backend Express i API
- `public/` – statyczne pliki frontend (HTML, CSS, JS)
- `data/` – lokalne pliki JSON do przechowywania danych

## Funkcjonalności
- Rejestracja i logowanie użytkowników
- Dodawanie zgłoszeń do weryfikacji (tekst lub link)
- Lista zgłoszeń z głosowaniem i komentarzami
- Prosty system sesji poprzez token w LocalStorage
- Profil użytkownika z historią zgłoszeń i możliwością usunięcia konta

> Aplikacja nie posiada prawdziwego algorytmu wykrywania fake newsów – wynik jest tylko przykładowy.

