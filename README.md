# opa-handler-fe

Frontend Angular della POC **RBAC + OPA**. È un unico progetto con **due facce**:

- **Dashboard admin** — CRUD di permessi, ruoli, utenti e delle loro associazioni. Ogni modifica finisce su Oracle attraverso il backend Quarkus.
- **App di test** — login simulato e una pagina applicativa dove un pulsante (es. *Elimina report*) **appare solo se OPA autorizza** l'utente collegato.

Il frontend non contiene logica di autorizzazione: chiede al backend Quarkus (porta `8080`), che a sua volta interroga OPA. La catena completa è:

```
Dashboard  ->  Oracle  ->  Bundle dati  ->  OPA  ->  Decisione  ->  UI
```

L'admin tocca solo il database; il resto (bundle, decisione, pulsante che compare o sparisce) fluisce da solo.

---

## Stack

- Angular (standalone components) + TypeScript
- `HttpClient` per le chiamate REST verso Quarkus
- Router con una **guardia** (`authGuard`) che protegge l'app di test
- `localStorage` per la sessione (login simulato)

---

## Prerequisiti

**Ambiente di sviluppo**

- Node.js 18.19+ oppure 20+ e npm — verifica con `node --version`
- Angular CLI — `npm install -g @angular/cli` (o usa `npx @angular/cli`)

**Backend in esecuzione**

Il frontend da solo non fa nulla: chiama `http://localhost:8080`. Devono essere attivi i tre container della POC, sulla rete `rbac-net`:

| Container | Ruolo | Porta |
|---|---|---|
| `oracle-poc` | Database (fonte di verità) | 1521 |
| `rbac-opa` | Backend Quarkus (CRUD + proxy `/authz`) | 8080 |
| `opa-bundles` | Motore di policy OPA | 8181 |

Verifica che siano tutti **Up**:

```powershell
nerdctl ps
```

Se il backend non è avviato, i comandi essenziali (dalla POC) sono:

```powershell
# 1. Rete condivisa
nerdctl network create rbac-net

# 2. Oracle
nerdctl run -d --name oracle-poc --network rbac-net -p 1521:1521 `
  -e ORACLE_PASSWORD=poc -e APP_USER=pocuser -e APP_USER_PASSWORD=pocpass `
  gvenzl/oracle-free
# attendere "DATABASE IS READY TO USE!" in: nerdctl logs -f oracle-poc

# 3. Quarkus
nerdctl run -d --name rbac-opa --network rbac-net -p 8080:8080 poc/rbac-opa:latest

# 4. OPA (opa-bundles, porta 8181) — vedi il README del backend / opa-config.yaml
#    per il comando esatto e la config dei due bundle (policy + dati).
```

> Il comando di avvio di OPA e la sua configurazione (`opa-config.yaml`, sorgenti dei bundle) appartengono al progetto backend: fai riferimento al suo README per la versione autoritativa.

---

## Avvio del frontend

Dalla cartella del progetto `opa-handler-fe`:

```powershell
npm install
ng serve
```

Apri **http://localhost:4200** — vieni reindirizzato a `/permissions` (la dashboard).

> Il frontend chiama `http://localhost:8080`, cablato nei service sotto `src/app/services/`. Perché il browser possa farlo serve il **CORS** abilitato lato Quarkus per l'origine `http://localhost:4200` (già configurato nel backend con `quarkus.http.cors.enabled=true`).

---

## Struttura del progetto

```
src/app/
├── models/            # forme dei dati
│   ├── permission.ts
│   ├── role.ts
│   └── user.ts
├── services/          # chiamate al backend + sessione
│   ├── permission.service.ts
│   ├── role.service.ts
│   ├── user.service.ts
│   ├── authz.service.ts     # GET /authz  -> decisione di OPA
│   └── session.service.ts   # login simulato (localStorage)
├── guards/
│   └── auth.guard.ts        # protegge /test
├── permissions/       # dashboard: sezione Permessi
├── roles/             # dashboard: sezione Ruoli
├── users/             # dashboard: sezione Utenti
├── login/             # app di test: schermata di accesso
├── test-app/          # app di test: portale con il pulsante gestito da OPA
├── app.routes.ts
└── app.config.ts
```

**Rotte**

| Rotta | Sezione | Protetta |
|---|---|---|
| `/permissions` | Dashboard — permessi | no |
| `/roles` | Dashboard — ruoli | no |
| `/users` | Dashboard — utenti | no |
| `/login` | App di test — accesso | no |
| `/test` | App di test — portale | sì (`authGuard`) |

---

## Contratti API usati dal frontend

Backend Quarkus, porta `8080`:

| Service (FE) | Metodo e path | Note |
|---|---|---|
| `permission.service` | `GET/POST/DELETE /permissions` | oggetto `{ id, action, resource }`; POST invia `{ action, resource }` |
| `role.service` | `GET/POST/DELETE /roles` | GET restituisce `{ id, name, permissions:[…] }`; POST invia `{ name, permissionIds:[…] }` |
| `user.service` | `GET/POST/DELETE /users` | GET restituisce `{ id, username, roles:[…] }`; POST invia `{ username, roleIds:[…] }` |
| `authz.service` | `GET /authz?user=&action=&resource=` | restituisce `{ "result": true|false }` |

**Asimmetria lettura/scrittura da ricordare:** in lettura ricevi oggetti annidati (`role.permissions`, `user.roles`), in scrittura invii solo id (`permissionIds`, `roleIds`). L'utente eredita i permessi *attraverso* i ruoli — non li ha diretti.

---

## Scenario d'uso (demo)

**Regola d'oro:** si costruisce dal basso — **permessi → ruoli → utenti**. Un ruolo non può collegare un permesso inesistente; un utente non può ricevere un ruolo non ancora creato. Se salti l'ordine, la checkbox che ti serve non esiste.

### 1. Permessi (`/permissions`)

Crea:

- `read` / `report`
- `delete` / `report`

### 2. Ruoli (`/roles`)

- `viewer` → spunta **solo** `read:report`
- `editor` → spunta `read:report` **e** `delete:report`

### 3. Utenti (`/users`)

- `mario` → assegna il ruolo `editor`
- `luigi` → assegna il ruolo `viewer`

Controprova che i dati siano coerenti:

```powershell
curl.exe http://localhost:8080/users
```

Deve mostrare `mario` con `editor` (read + delete) e `luigi` con `viewer` (solo read).

### 4. Prova l'app (`/test`)

- **Accedi come `mario`.** Attendi ~15 s dopo la creazione dei dati (OPA deve scaricare il bundle aggiornato), poi premi **↻ ricarica permessi** → compare il pulsante **Elimina** (OPA autorizza `delete:report`).
- **Esci e accedi come `luigi`.** Stesso documento, ma **nessun** pulsante Elimina — OPA nega la delete.

### 5. Il colpo di scena (la parte che vale la POC)

Con `mario` loggato e il pulsante Elimina visibile:

1. In dashboard cambia il ruolo di `mario` da `editor` a `viewer` (nella UI non c'è l'update in-place: elimina e ricrea l'utente con il ruolo nuovo, oppure ricrea il ruolo `editor` senza `delete:report`).
2. Torna su `/test`, attendi ~15 s, premi **↻ ricarica permessi**.
3. Il pulsante Elimina **sparisce** — senza aver ricompilato né toccato l'app: è cambiato solo un dato nel database.

Dettaglio da far notare: il pannello *profilo* legge da Oracle (aggiornamento **immediato**), mentre il pulsante dipende da OPA (aggiornamento dopo ~15 s del polling). Per qualche secondo vedi il ruolo già cambiato ma il pulsante ancora "vecchio": è il disaccoppiamento tra dati e decisione, visibile a occhio.

---

## Note importanti

- **Login simulato.** Non c'è autenticazione reale: scegli *chi essere*, senza password. OPA riguarda l'autorizzazione (*cosa puoi fare*), non l'autenticazione (*dimostrare chi sei*). In produzione lo username arriverebbe da un identity provider.
- **Ritardo di ~15 s.** È il polling con cui OPA ricarica il bundle dati da Quarkus. Dopo ogni modifica in dashboard, attendi qualche secondo e usa *↻ ricarica permessi*.
- **Gli id non ripartono da 1.** Le sequenze Oracle continuano da dove erano, anche dopo aver svuotato le tabelle. È normale e non impatta il funzionamento.

---

## Risoluzione dei problemi

| Sintomo | Causa probabile | Rimedio |
|---|---|---|
| Errore rosso `Http failure … : 0 Unknown Error` | Quarkus spento **o** CORS non attivo | `nerdctl ps` (backend Up?); verifica il CORS lato Quarkus |
| `404 Not Found` su `/authz` | L'endpoint non è nell'immagine in esecuzione | Ricompila e ribuilda l'immagine del backend |
| Il pulsante Elimina non appare mai | L'utente non ha il permesso, o polling non atteso | L'utente ha `delete:report`? Hai atteso ~15 s e premuto *↻ ricarica*? |
| Profilo vuoto dopo il login | Username non combaciante | Deve corrispondere **esatto** a quello nel DB (maiuscole/spazi) |
| `500` eliminando un ruolo/utente dalla UI | Violazione di foreign key (record ancora collegato) | Per svuotare tutto, cancella via SQL nell'ordine ponti → entità (`user_roles`, `role_permissions`, poi `app_users`, `app_roles`, `permissions`) |

---

## Build di produzione (opzionale)

```powershell
ng build
```

Genera i file statici in `dist/`. Ricorda che l'URL del backend è cablato a `http://localhost:8080` nei service: per un deploy reale andrebbe spostato in un file di *environment*.
