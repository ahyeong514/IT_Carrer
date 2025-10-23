window.addEventListener('load', () => {
  const goals = document.querySelector('.goals');
  const center = document.querySelector('.center-box');
  if (goals && center) {
    const maxHeight = Math.max(goals.offsetHeight, center.offsetHeight);
    goals.style.height = maxHeight + 'px';
    center.style.height = maxHeight + 'px';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', function() {
    window.location.href = '/login';
  });
  }
});
