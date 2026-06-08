//The Bookshelf — Auth (Login/Logout)

document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // nếu đã đăng nhập rồi thì chuyển thẳng vào chat
  const currentUser = localStorage.getItem('bookshelf_user');
  if (currentUser) {
    window.location.href = 'chat.html';
    return;
  }

  loginBtn.addEventListener('click', handleLogin);

  // bấm Enter ở ô password thì login luôn
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // bấm Enter ở ô username thì nhảy sang password
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
  });

  function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    loginError.classList.remove('show');

    if (!username || !password) {
      showError('Please enter both username and password');
      return;
    }

    if (username.length < 2) {
      showError('Username must be at least 2 characters');
      return;
    }

    // ==========================================
    // TODO: thay bằng API call khi backend xong
    //
    // fetch('http://localhost:3000/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password })
    // })
    // .then(res => res.json())
    // .then(data => {
    //   if (data.token) {
    //     localStorage.setItem('bookshelf_token', data.token);
    //     localStorage.setItem('bookshelf_user', JSON.stringify(data.user));
    //     window.location.href = 'chat.html';
    //   } else {
    //     showError(data.message || 'Login failed');
    //   }
    // })
    // .catch(err => showError('Cannot connect to server'));
    // ==========================================

    // tạm thời nhận bất kỳ tài khoản nào để test UI
    const user = {
      id: generateId(),
      username: username,
      displayName: username,
      avatar: getInitials(username)
    };

    localStorage.setItem('bookshelf_user', JSON.stringify(user));
    window.location.href = 'chat.html';
  }

  function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');

    // shake nhẹ cho rõ lỗi
    loginError.style.animation = 'none';
    loginError.offsetHeight;
    loginError.style.animation = 'shake 0.4s ease';
  }

  function getInitials(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }
});
