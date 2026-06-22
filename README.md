# The Bookshelf Live Chat

Du an live chat thoi gian thuc giua `user` va `admin`.
Nguoi dung dang nhap bang tai khoan mac dinh, sau do duoc chuyen vao man hinh chat voi doi tuong con lai. Tin nhan duoc gui va hien thi realtime bang Socket.IO, khong can refresh trang.

## Cong nghe su dung

- Node.js: moi truong chay backend.
- Express.js: xay dung REST API va serve frontend static.
- Socket.IO: gui/nhan tin nhan realtime.
- JWT: xac thuc dang nhap va bao ve API/socket.
- Supabase: database PostgreSQL de luu tin nhan.
- HTML/CSS/JavaScript: frontend hien tai sau khi merge giao dien The Bookshelf.

Ghi chu: frontend hien tai chua phai ReactJS. Neu nang cap len ReactJS, backend hien tai van dung duoc vi da co REST API va Socket.IO ro rang.

## Tai khoan mac dinh

```text
User:  user  / 123456
Admin: admin / 98765
```

Sau khi dang nhap:

- Neu dang nhap bang `user`, khung chat se hien doi tuong `admin`.
- Neu dang nhap bang `admin`, khung chat se hien doi tuong `user`.

## Cau truc du an

```text
.
|-- public/
|   |-- index.html          # Trang dang nhap
|   |-- chat.html           # Trang chat
|   |-- css/styles.css      # Giao dien The Bookshelf
|   |-- js/auth.js          # Login bang REST API + JWT
|   |-- js/chat.js          # Load tin nhan + Socket.IO realtime
|   |-- js/config.js        # Cau hinh frontend
|   `-- assets/logo.svg
|-- src/
|   |-- server.js           # Tao HTTP server + Socket.IO
|   |-- app.js              # Cau hinh Express
|   |-- socket.js           # Xu ly realtime event
|   |-- config/             # Env, Supabase, tai khoan mac dinh
|   |-- middleware/auth.js  # JWT middleware
|   |-- routes/             # REST API routes
|   `-- services/           # Xu ly message voi Supabase
|-- supabase/schema.sql     # SQL tao bang messages
|-- .env.example
|-- package.json
`-- nodemon.json
```

## Can chuan bi truoc khi chay

1. Cai Node.js.
2. Tao mot project Supabase moi.
3. Lay `Project URL` va `service_role secret key` trong Supabase.
4. Chay SQL tao bang `messages`.
5. Cai dependencies va chay server local.

## Cau hinh Supabase

Mo Supabase SQL Editor va chay file:

```text
supabase/schema.sql
```

File nay se tao bang:

```text
public.messages
```

Bang nay dung de luu:

- nguoi gui: `sender`
- nguoi nhan: `receiver`
- noi dung tin nhan: `content`
- thoi gian gui: `created_at`

## Tao file moi truong

Tao file `.env` tu file mau:

```powershell
Copy-Item .env.example .env
```

Sau do dien thong tin:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:3000

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=1d

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

DEFAULT_USER_PASSWORD=123456
DEFAULT_ADMIN_PASSWORD=98765
```

Quan trong:

- `SUPABASE_URL` la Project URL.
- `SUPABASE_SERVICE_ROLE_KEY` phai la `service_role secret key`.
- Khong dung `anon public key` cho backend nay.
- Khong dua `service_role key` vao frontend hoac public repository.

## Cai dat dependencies

```powershell
npm install
```

Neu PowerShell chan lenh `npm`, dung:

```powershell
npm.cmd install
```

## Chay du an

```powershell
npm run dev
```

Hoac neu PowerShell chan script:

```powershell
npm.cmd run dev
```

Mo trinh duyet:

```text
http://localhost:3000
```

## Cach test realtime local

Khong nen dang nhap 2 tai khoan bang 2 tab thuong trong cung mot trinh duyet, vi chung co the dung chung `localStorage`.

Nen test bang:

```text
Chrome thuong: user / 123456
Chrome an danh hoac Edge: admin / 98765
```

Sau do:

1. Gui tin nhan tu user.
2. Man hinh admin se hien ngay.
3. Gui tin nhan tu admin.
4. Man hinh user se hien ngay.

Luong realtime:

```text
Client gui tin
-> Socket.IO event message:send
-> Backend validate JWT
-> Backend luu tin vao Supabase
-> Backend emit message:new den user va admin
-> Hai giao dien cap nhat ngay
```

## REST API

### POST `/api/auth/login`

Body:

```json
{
  "username": "user",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt",
  "user": {
    "id": "user",
    "username": "user",
    "displayName": "User",
    "role": "user"
  },
  "peer": {
    "id": "admin",
    "username": "admin",
    "displayName": "Admin",
    "role": "admin"
  }
}
```

### GET `/api/messages`

Lay lich su tin nhan cua user hien tai voi doi tuong con lai.

Header:

```text
Authorization: Bearer <token>
```

### POST `/api/messages`

Gui tin nhan qua REST API.

Header:

```text
Authorization: Bearer <token>
```

Body:

```json
{
  "content": "Xin chao"
}
```

## Socket.IO events

Client ket noi socket voi JWT:

```js
const socket = io({
  auth: {
    token
  }
});
```

Gui tin nhan:

```js
socket.emit('message:send', { content: 'Hello' });
```

Nhan tin nhan realtime:

```js
socket.on('message:new', (message) => {
  console.log(message);
});
```

## Vi sao chon Supabase

Supabase phu hop voi du an live chat vi:

- Dung PostgreSQL that, de mo rong va truy van du lieu ve sau.
- Co dashboard quan ly database truc quan.
- Co SQL Editor, de tao bang va debug nhanh.
- Ho tro Row Level Security, giup tang do an toan khi mo rong he thong.
- SDK JavaScript de ket noi nhanh tu backend Node.js.
- Phu hop cho prototype, do an, MVP va ca san pham can mo rong.

Trong du an nay, Supabase duoc dung lam database luu lich su tin nhan. Socket.IO xu ly realtime, con Supabase dam bao tin nhan khong bi mat khi reload hoac dang nhap lai.

## Vi sao ReactJS la lua chon tot cho frontend

Neu nang cap frontend tu HTML/CSS/JS thuan len ReactJS, ReactJS co cac uu diem:

- Chia UI thanh component, de quan ly cac phan nhu login form, sidebar, message list, message bubble.
- State management tot hon cho ung dung realtime, vi chat co nhieu trang thai: user hien tai, peer, socket status, danh sach tin nhan, unread count.
- De tai su dung component va mo rong them tinh nang nhu typing indicator, upload anh, profile, search message.
- Phu hop voi SPA, giup dieu huong giua login/chat muot hon.
- He sinh thai lon, de ket hop voi React Router, TanStack Query, Zustand hoac Redux khi du an lon hon.
- Ket hop tot voi Supabase SDK neu sau nay can auth, storage, realtime database hoac dashboard rieng.

Tom lai:

```text
ReactJS phu hop de xay giao dien chat phuc tap.
Supabase phu hop de luu tru va quan ly du lieu nhanh.
Socket.IO phu hop de dam bao tin nhan realtime thuc su.
Express + JWT giup backend kiem soat bao mat va luong du lieu.
```

## Luu y bao mat

- Khong commit file `.env`.
- Khong dua `SUPABASE_SERVICE_ROLE_KEY` len frontend.
- Nen doi `JWT_SECRET` thanh chuoi dai va kho doan.
- Tai khoan mac dinh hien chi phu hop cho demo/local. Neu dua len production, can thay bang he thong user/auth that.

## Loi thuong gap

### `new row violates row-level security policy`

Nguyen nhan thuong gap:

- Dang dung nham `anon public key`.
- Server chua restart sau khi doi `.env`.

Cach sua:

```powershell
Ctrl + C
npm.cmd run dev
```

Kiem tra lai `.env`, dam bao:

```env
SUPABASE_SERVICE_ROLE_KEY=service_role_secret_key
```

### PowerShell chan `npm`

Dung lenh:

```powershell
npm.cmd run dev
```

### Khong thay realtime khi test 2 tab

Hay dung 2 session rieng:

```text
Chrome thuong + Chrome an danh
```

hoac:

```text
Chrome + Edge
```
