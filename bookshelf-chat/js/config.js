/*The Bookshelf — Config
   Thay đổi URL ở đây khi backend sẵn sàng
*/

const CONFIG = {
  SERVER_URL: 'http://localhost:3000',
  API_BASE:   'http://localhost:3000/api',

  // Socket.io events — đã thống nhất với frontend
  // Backend cần dùng đúng tên này
  EVENTS: {
    // Client → Server
    SEND_MESSAGE: 'send_message',
    TYPING:       'user_typing',

    // Server → Client
    RECEIVE_MESSAGE: 'receive_message',
    USER_STATUS:     'user_status',
    USER_TYPING:     'user_typing',
  }
};
