document.addEventListener('DOMContentLoaded', () => {

  // Kiểm tra đăng nhập 
  const userData = localStorage.getItem('bookshelf_user');
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  const currentUser = JSON.parse(userData);


  const conversationsList = document.getElementById('conversationsList');
  const searchInput = document.getElementById('searchInput');
  const currentUserName = document.getElementById('currentUserName');
  const currentUserAvatar = document.getElementById('currentUserAvatar');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsDropdown = document.getElementById('settingsDropdown');
  const logoutBtn = document.getElementById('logoutBtn');
  const noChatView = document.getElementById('noChatView');
  const chatView = document.getElementById('chatView');
  const chatAvatar = document.getElementById('chatAvatar');
  const chatName = document.getElementById('chatName');
  const chatStatus = document.getElementById('chatStatus');
  const messagesContainer = document.getElementById('messagesContainer');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const typingIndicator = document.getElementById('typingIndicator');

  // Trạng thái
  let activeConversationId = null;
  let socket = null;

  // Dữ liệu demo 
  const demoConversations = [
    {
      id: 'conv1',
      name: "The Traveller's Bookshop",
      avatar: 'TB',
      avatarColor: 'avatar-orange',
      online: true,
      lastMessage: 'Sách còn hàng nha bạn!',
      unread: 2,
      messages: [
        { id: 'm1', sender: 'them', text: 'Chào bạn! Bên mình chuyên sách ngoại văn, bạn cần tìm cuốn nào nè?', time: '10:24' },
        { id: 'm2', sender: 'me', text: 'Mình muốn hỏi cuốn "Norwegian Wood" bản tiếng Anh còn hàng không ạ?', time: '10:25' },
        { id: 'm3', sender: 'them', text: 'Còn hàng nha bạn! Bản paperback nhé:', time: '10:26',
          book: { title: 'Norwegian Wood', author: 'Haruki Murakami', rating: '4.12', price: '185,000₫' }
        },
        { id: 'm4', sender: 'me', text: 'Đẹp quá! Mình lấy 1 cuốn nhé. Ship về Cầu Giấy được không ạ?', time: '10:27' },
        { id: 'm5', sender: 'them', text: 'Ship được luôn nha. Mình lên đơn cho bạn nhé?', time: '10:28' },
      ]
    },
    {
      id: 'conv2',
      name: 'InBook Bookstore',
      avatar: 'IB',
      avatarColor: 'avatar-khaki',
      online: true,
      lastMessage: 'Full 1 bộ đang có giá là 1,200,000₫',
      unread: 0,
      messages: [
        { id: 'm1', sender: 'them', text: 'Chào bạn! Bên mình có bộ Harry Potter tiếng Anh bản mới nhất nè', time: '09:15' },
        { id: 'm2', sender: 'me', text: 'Bao nhiêu 1 bộ vậy ạ?', time: '09:20' },
        { id: 'm3', sender: 'them', text: 'Full 1 bộ đang có giá là 1,200,000₫', time: '09:22' },
      ]
    },
    {
      id: 'conv3',
      name: 'Bookworm Hanoi',
      avatar: 'BW',
      avatarColor: 'avatar-beige',
      online: false,
      lastMessage: 'Cảm ơn bạn đã mua!',
      unread: 0,
      messages: [
        { id: 'm1', sender: 'them', text: 'Đơn hàng của bạn đã được gửi! Mã tracking: VN123456', time: 'Yesterday' },
        { id: 'm2', sender: 'me', text: 'Cảm ơn bạn!', time: 'Yesterday' },
        { id: 'm3', sender: 'them', text: 'Cảm ơn bạn đã mua!', time: 'Yesterday' },
      ]
    },
    {
      id: 'conv4',
      name: 'Nhà sách Lâm',
      avatar: 'SL',
      avatarColor: 'avatar-khaki',
      online: false,
      lastMessage: 'Bản mới về tuần sau nhé',
      unread: 0,
      messages: [
        { id: 'm1', sender: 'me', text: 'Bên bạn có cuốn "1984" của George Orwell không?', time: '2 days ago' },
        { id: 'm2', sender: 'them', text: 'Bản mới về tuần sau nhé', time: '2 days ago' },
      ]
    }
  ];

  // KẾT NỐI SOCKET.IO
  // bỏ comment khi backend chạy được
  // ==========================================

  // socket = io('http://localhost:3000', {
  //   auth: { token: localStorage.getItem('bookshelf_token') }
  // });

  // socket.on('connect', () => {
  //   console.log('socket connected:', socket.id);
  // });

  // socket.on('disconnect', () => {
  //   console.log('socket disconnected');
  // });

  // socket.on('receive_message', (data) => {
  //   // data: { id, from, text, timestamp, conversationId }
  //   addMessageToDOM({
  //     id: data.id,
  //     sender: 'them',
  //     text: data.text,
  //     time: formatTime(data.timestamp)
  //   });
  //   scrollToBottom();
  // });

  // socket.on('user_status', (data) => {
  //   // data: { userId, online }
  //   updateUserStatus(data.userId, data.online);
  // });

  // socket.on('user_typing', (data) => {
  //   if (data.conversationId === activeConversationId) {
  //     showTypingIndicator(data.isTyping);
  //   }
  // });

  // ==========================================
  // Khởi tạo giao diện 
  initUI();

  function initUI() {
    currentUserName.textContent = currentUser.displayName || currentUser.username;
    currentUserAvatar.textContent = currentUser.avatar || getInitials(currentUser.username);

    renderConversations(demoConversations);
    setupEventListeners();
  }

  // Hiển thị danh sách cuộc trò chuyện
  function renderConversations(conversations) {
    conversationsList.innerHTML = '';

    conversations.forEach(conv => {
      const el = document.createElement('div');
      el.className = `conv-item${conv.id === activeConversationId ? ' active' : ''}`;
      el.dataset.id = conv.id;

      el.innerHTML = `
        <div class="avatar ${conv.avatarColor}">
          ${conv.avatar}
          <div class="status-dot ${conv.online ? 'online' : 'offline'}"></div>
        </div>
        <div class="conv-info">
          <div class="conv-name">${conv.name}</div>
          <div class="conv-last">${conv.lastMessage}</div>
        </div>
        ${conv.unread > 0 ? `<div class="unread-badge">${conv.unread}</div>` : ''}
      `;

      el.addEventListener('click', () => openConversation(conv.id));
      conversationsList.appendChild(el);
    });
  }

  // Mở cuộc trò chuyện
  function openConversation(convId) {
    activeConversationId = convId;
    const conv = demoConversations.find(c => c.id === convId);
    if (!conv) return;

    // Xóa badge chưa đọc
    conv.unread = 0;

    // Cập nhật trạng thái active sidebar
    renderConversations(demoConversations);

    // Hiển thị khung chat
    noChatView.style.display = 'none';
    chatView.style.display = 'flex';

    chatAvatar.textContent = conv.avatar;
    chatAvatar.className = `avatar sm ${conv.avatarColor}`;
    chatName.textContent = conv.name;
    chatStatus.innerHTML = conv.online
      ? '<i class="ti ti-point-filled" style="font-size:12px;"></i> <span>online</span>'
      : '<span style="color:#9ca3af;">offline</span>';

    renderMessages(conv.messages);
    scrollToBottom();

    // Focus vào ô nhập tin nhắn
    messageInput.focus();
  }

  // Hiển thị tin nhắn
  function renderMessages(messages) {
    messagesContainer.innerHTML = '';

    // Thêm dòng ngày tháng
    const dateSep = document.createElement('div');
    dateSep.className = 'date-separator';
    dateSep.innerHTML = '<span>Today</span>';
    messagesContainer.appendChild(dateSep);

    messages.forEach(msg => {
      addMessageToDOM(msg);
    });
  }

  function addMessageToDOM(msg) {
    const el = document.createElement('div');
    el.className = `msg ${msg.sender === 'me' ? 'sent' : 'received'}`;

    let bookHTML = '';
    if (msg.book) {
      bookHTML = `
        <div class="msg-book">
          <div class="book-cover">
            <i class="ti ti-book"></i>
          </div>
          <div class="book-info">
            <div class="book-title">${msg.book.title}</div>
            <div class="book-author">${msg.book.author}</div>
            <div class="book-rating"><i class="ti ti-star" style="font-size:11px;"></i> ${msg.book.rating} — Goodreads</div>
            <div class="book-price">${msg.book.price}</div>
          </div>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="msg-bubble">${msg.text}</div>
      ${bookHTML}
      <div class="msg-time">${msg.time}</div>
    `;

    messagesContainer.appendChild(el);
  }

  // Gửi tin nhắn
  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !activeConversationId) return;

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                    now.getMinutes().toString().padStart(2, '0');

    const msg = {
      id: 'msg_' + Date.now(),
      sender: 'me',
      text: text,
      time: timeStr
    };

    // Thêm vào giao diện
    addMessageToDOM(msg);
    scrollToBottom();

    // Cập nhật tin nhắn cuối trong cuộc trò chuyện
    const conv = demoConversations.find(c => c.id === activeConversationId);
    if (conv) {
      conv.messages.push(msg);
      conv.lastMessage = text;
      renderConversations(demoConversations);
    }

    // Xóa ô nhập
    messageInput.value = '';
    messageInput.focus();

    // ==========================================
    // TODO: Send via Socket.io when backend ready
    //
    // socket.emit('send_message', {
    //   conversationId: activeConversationId,
    //   text: text,
    //   timestamp: now.toISOString()
    // });
    //
    // ==========================================

    // DEMO: Giả lập phản hồi sau 1.5s
    simulateReply(text);
  }

  // Demo: Giả lập phản hồi 
  function simulateReply(userText) {
    showTypingIndicator(true);

    setTimeout(() => {
      showTypingIndicator(false);

      const replies = [
        'Để mình kiểm tra kho hàng nhé!',
        'Cuốn này rất hay luôn, bạn sẽ thích!',
        'Mình có thể giảm giá 10% cho bạn nha!',
        'Ship trong 3-5 ngày nhé bạn!',
        'Bạn cần thêm cuốn nào không?',
        'Bên mình vừa nhập thêm sách mới nè!',
        'Mình sẽ đóng gói cẩn thận cho bạn!',
      ];

      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
                      now.getMinutes().toString().padStart(2, '0');

      const msg = {
        id: 'msg_' + Date.now(),
        sender: 'them',
        text: replyText,
        time: timeStr
      };

      addMessageToDOM(msg);
      scrollToBottom();

      const conv = demoConversations.find(c => c.id === activeConversationId);
      if (conv) {
        conv.messages.push(msg);
        conv.lastMessage = replyText;
        renderConversations(demoConversations);
      }
    }, 1500);
  }

  // Hiển thị trạng thái đang gõ
  function showTypingIndicator(show) {
    typingIndicator.classList.toggle('show', show);
    if (show) scrollToBottom();
  }

  // Cuộn xuống cuối 
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  // Gắn sự kiện 
  function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Typing event (for Socket.io)
    // let typingTimeout;
    // messageInput.addEventListener('input', () => {
    //   socket.emit('typing', {
    //     conversationId: activeConversationId,
    //     isTyping: true
    //   });
    //   clearTimeout(typingTimeout);
    //   typingTimeout = setTimeout(() => {
    //     socket.emit('typing', {
    //       conversationId: activeConversationId,
    //       isTyping: false
    //     });
    //   }, 1000);
    // });

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!settingsDropdown.contains(e.target)) {
        settingsDropdown.classList.remove('show');
      }
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('bookshelf_user');
      localStorage.removeItem('bookshelf_token');

      // Disconnect socket if connected
      // if (socket) socket.disconnect();

      window.location.href = 'index.html';
    });

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = demoConversations.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.lastMessage.toLowerCase().includes(query)
      );
      renderConversations(filtered);
    });
  }

  // Hàm tiện ích 
  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.getHours().toString().padStart(2, '0') + ':' +
           date.getMinutes().toString().padStart(2, '0');
  }
});