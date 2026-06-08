# The Bookshelf — Live Chat Frontend

Website bán sách ngoại văn với tính năng Live Chat real-time.  
Tech: HTML/CSS/JS thuần + Socket.io client.

---

## Chạy thử (không cần backend)

1. Clone repo về máy
2. Mở `index.html` bằng Live Server (VS Code) hoặc thẳng trình duyệt
3. Nhập bất kỳ username + password → Sign In
4. Chọn conversation bên trái → gõ tin nhắn → Enter
5. Sau 1.5 giây sẽ có tin nhắn tự reply để test UI

---


## Cấu trúc thư mục
```
bookshelf-chat/
├── index.html       ← trang login
├── chat.html        ← trang chat chính
├── css/
│   └── styles.css   ← toàn bộ styles
├── js/
│   ├── config.js    ← URL server + tên Socket.io events
│   ├── auth.js      ← xử lý login / logout
│   └── chat.js      ← UI chat + Socket.io (đã comment sẵn chờ backend)
└── .gitignore
```


---

## Design

| | |
|---|---|
| **Font serif** | Merriweather — tiêu đề, tên sách |
| **Font sans-serif** | Lato — body text, UI |
| **Gunmetal** `#3C5A5A` | sidebar, header, bubble tin nhắn |
| **Dark Khaki** `#9E9B63` | label, muted text |
| **Rust Brown** `#933710` | button, accent |
| **Dull Orange** `#D99450` | highlight, trạng thái active |
| **Light Gray** `#E2D6BB` | background |

---

## Kết nối Backend

### Cài dependencies

```bash
npm init -y
npm install express socket.io cors jsonwebtoken
```

### Uncomment 3 chỗ trong frontend

**`chat.html`** — bỏ comment dòng load Socket.io:
```html
<script src="http://localhost:3000/socket.io/socket.io.js"></script>
```

**`js/chat.js`** — bỏ comment phần `KẾT NỐI SOCKET.IO` và phần `send_message`

**`js/auth.js`** — bỏ comment phần `fetch()` login API

---

### API cần build

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user }` |
| POST | `/api/auth/register` | `{ username, password }` | `{ token, user }` |

**User object:**
```json
{
  "id": "user_123",
  "username": "pam",
  "displayName": "Pam",
  "avatar": "PM"
}
```

---

### Socket.io Events

Tên events định nghĩa trong `js/config.js` — backend dùng đúng tên này.

**Client → Server:**
```javascript
// gửi tin nhắn
socket.emit('send_message', {
  conversationId: 'conv1',
  text: 'Hello!',
  timestamp: '2026-06-08T10:24:00.000Z'
});

// đang gõ
socket.emit('user_typing', {
  conversationId: 'conv1',
  isTyping: true
});
```

**Server → Client:**
```javascript
// nhận tin nhắn mới
socket.on('receive_message', (data) => {
  // data: { id, from, text, timestamp, conversationId }
});

// cập nhật trạng thái online/offline
socket.on('user_status', (data) => {
  // data: { userId, online }
});

// hiển thị đang gõ
socket.on('user_typing', (data) => {
  // data: { conversationId, isTyping }
});
```

---

### Yêu cầu demo live

- Mở 2 tab trình duyệt, đăng nhập 2 tài khoản khác nhau → chat được với nhau
- Tin nhắn hiện ngay, không cần refresh trang
- Hiển thị trạng thái online/offline theo thời gian thực
