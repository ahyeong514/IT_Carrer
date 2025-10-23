import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCE4Te2Hop-jz3UhRk_yU0AJor0pUBkaeA",
  authDomain: "ai-2025-d70c3.firebaseapp.com",
  projectId: "ai-2025-d70c3",
  storageBucket: "ai-2025-d70c3.firebasestorage.app",
  messagingSenderId: "860143117743",
  appId: "1:860143117743:web:13701e330d48a891893b5a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeBtn');
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const goSignup = document.getElementById('goSignup');
  const goLogin = document.getElementById('goLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  // 탭 전환 함수
  function switchTab(tab) {
    if (tab === 'login') {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
    } else {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
    }
  }

  goSignup.addEventListener('click', () => switchTab('signup'));
  goLogin.addEventListener('click', () => switchTab('login'));

  closeBtn.addEventListener('click', () => {
    window.history.back();
  });

  // Firebase 로그인
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        alert("로그인 성공: " + userCredential.user.email);
        
        // [수정됨] 로컬 파일 경로 대신, 서버의 루트 URL로 이동합니다.
        window.location.href = "/"; 
        
      })
      .catch(error => alert("로그인 실패: " + error.message));

  });

  // Firebase 회원가입
  signupBtn.addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value.trim();
    if (!email || !password || !passwordConfirm) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        alert("회원가입 성공: " + userCredential.user.email);
        switchTab('login');
      })
      .catch(error => alert("회원가입 실패: " + error.message));
  });

  // 로그인 상태 체크 (콘솔 출력)
  onAuthStateChanged(auth, (user) => {
    if (user) console.log("로그인 상태:", user.email);
    else console.log("로그아웃 상태");
  });
});
