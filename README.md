# kiosk-zsp4

## Wstępna konfiguracja

### Wymagania

- node >= 20.0.0
- PostgreSQL >= 15

### Baza danych

W pierwszej kolejności należy uruchomić bazę danych PostgreSQL 15 lub nowszą. Przykład za pomocą Dockera:

```bash
docker run --name kiosk-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres:15
```

Tworzymy użytkownika i bazę danych (użyte nazwy użytkownika i hasła są przykładowe):

```bash
docker exec -it -u postgres kiosk-postgres psql
```

```postgresql
CREATE USER kiosk WITH PASSWORD 'kiosk';
CREATE DATABASE kiosk WITH OWNER kiosk;
```

### Aplikacja

Instalujemy zależności, wpisując w głównym folderze projektu następujące polecenie:

```bash
npm ci
```

W głównym folderze projektu tworzymy plik `.env` z konfiguracją bazy danych i ścieżką do folderu, w którym będą
przechowywane pliki multimedialne:

```dotenv
DB_URL=postgres://kiosk:kiosk@localhost:5432/kiosk
ASSET_ROOT_DIR=/home/username/kiosk_media
```

**UWAGA:** Folder określony w `ASSET_ROOT_DIR` musi istnieć. Najlepiej żeby był pusty.

W następnej kolejności przeprowadzamy migrację aby utworzyć wymagane relacje w bazie danych i tworzymy wstępne konto
superużytkownika:

```bash
npm run db-migrate
npm run create-superuser
```

Budujemy i uruchamiamy aplikację:

```bash
npm run build
npm run start
```

### Korzystanie z aplikacji

- Aplikacja powinna być dostępna na porcie 3000. Port można skonfigurować zmienną środowiskową `APP_PORT`.
- Panel sterowania dostępny jest pod adresem `localhost:3000/dashboard`.
- Nazwa wygenerowanego wcześniej superużytkownika: `superuser`. Hasło: `superuser`.
- Aby wrzucane materiały multimedialne były dostępne w widoku kiosku, należy skonfigurować oś czasu.
  (`Ustawienia -> Oś czasu -> Dodaj okres`).
- Po wrzuceniu materiału należy przypisać mu odpowiednią datę i go opublikować.
