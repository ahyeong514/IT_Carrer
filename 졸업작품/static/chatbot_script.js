// === DOM 요소 선택 ===
const chatArea = document.getElementById('chat-area');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.send-btn');
const sidebar = document.querySelector('.sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.querySelector('.chat-list'); // 채팅 목록을 담을 부모 요소

// === 상태 관리 변수 ===
let conversations = []; // 모든 대화 내용을 저장하는 배열
let activeChatId = null; // 현재 활성화된 채팅의 ID

// === 이벤트 리스너 ===

// 사이드바 토글 버튼
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleSidebarBtn.setAttribute('aria-expanded', !sidebar.classList.contains('collapsed'));
});

// 전송 버튼 클릭 또는 엔터 키 입력 시 메시지 전송
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessage();
    }
});

// '새 채팅' 버튼 클릭 시
newChatBtn.addEventListener('click', startNewChat);

// 채팅 목록(사이드바) 클릭 이벤트 (이벤트 위임)
chatList.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-list-item');
    if (chatItem) {
        const chatId = chatItem.dataset.chatId;
        
        // 메뉴 버튼이나 메뉴 자체를 클릭한 경우는 제외
        if (e.target.closest('.chat-item-menu-btn') || e.target.closest('.chat-item-menu')) {
            handleMenuInteraction(e.target, chatId);
            return;
        }
        
        // 다른 채팅 아이템을 클릭했을 때
        if (chatId !== activeChatId) {
            loadChat(chatId);
        }
    }
});

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    if (chatInput) chatInput.focus();
    startNewChat(); // 페이지 로드 시 새 채팅으로 시작
});


// === 메인 기능 함수 ===

/**
 * '새 채팅'을 시작하는 함수
 */
function startNewChat() {
    activeChatId = null; // 활성 채팅 ID 초기화
    chatArea.innerHTML = ''; // 채팅창 비우기
    clearInput();
    updateSidebar(); // 사이드바에서 활성 상태 제거
    addBotAnswer('안녕하세요! IT 커리어 빌더 챗봇입니다. 질문을 입력해 주세요.');
}

/**
 * 사용자 메시지를 가져와 백엔드 API로 전송하고 답변을 받아 처리하는 메인 함수
 */
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const currentHistory = getCurrentChatHistory();
    addUserQuestion(text);
    clearInput();

    const thinkingMessage = addBotAnswer('생각 중...');

    try {
        const response = await fetch('http://127.0.0.1:5000/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text, history: currentHistory }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '서버 응답 오류');
        }

        const data = await response.json();
        thinkingMessage.innerHTML = data.answer.replace(/\n/g, '<br>');

        // 대화 내용 저장 및 업데이트
        saveConversation(text, data.history);

    } catch (error) {
        console.error('Error fetching bot answer:', error);
        thinkingMessage.innerHTML = '죄송합니다, 답변을 가져오는 중 오류가 발생했습니다.<br>Ollama 서버가 실행 중인지 확인해주세요.';
    }
}

/**
 * 대화 내용을 저장하거나 업데이트하고, 사이드바를 갱신하는 함수
 * @param {string} firstQuestion - 대화의 첫 질문 (제목으로 사용)
 * @param {Array} history - 전체 대화 기록
 */
function saveConversation(firstQuestion, history) {
    if (activeChatId === null) {
        // 이 메시지가 새 채팅의 첫 메시지인 경우
        const newChatId = Date.now().toString();
        activeChatId = newChatId;
        const newConversation = {
            id: newChatId,
            title: firstQuestion.length > 20 ? firstQuestion.substring(0, 20) + '...' : firstQuestion,
            history: history,
        };
        conversations.unshift(newConversation); // 새 대화를 배열 맨 앞에 추가
    } else {
        // 기존 채팅에 메시지를 추가하는 경우
        const conversation = conversations.find(c => c.id === activeChatId);
        if (conversation) {
            conversation.history = history;
        }
    }
    updateSidebar(); // 변경사항을 사이드바에 반영
}

/**
 * 특정 채팅 ID의 대화 내용을 불러와 화면에 표시하는 함수
 * @param {string} chatId - 불러올 채팅의 ID
 */
function loadChat(chatId) {
    const conversation = conversations.find(c => c.id === chatId);
    if (!conversation) return;

    activeChatId = chatId;
    chatArea.innerHTML = ''; // 채팅창 비우기

    // 저장된 대화 기록을 화면에 다시 그리기
    conversation.history.forEach(message => {
        if (message.role === 'user') {
            addUserQuestion(message.content);
        } else if (message.role === 'assistant') {
            addBotAnswer(message.content);
        }
    });

    updateSidebar(); // 활성화된 채팅 표시를 위해 사이드바 업데이트
}


// === UI 헬퍼 및 보조 함수 ===

/**
 * 현재 활성화된 채팅의 대화 기록을 가져오는 함수
 * @returns {Array} - 현재 채팅의 대화 기록
 */
function getCurrentChatHistory() {
    if (activeChatId) {
        const conversation = conversations.find(c => c.id === activeChatId);
        return conversation ? conversation.history : [];
    }
    return [];
}

/**
 * 대화 목록(사이드바)을 현재 상태에 맞게 다시 그리는 함수
 */
function updateSidebar() {
    chatList.innerHTML = ''; // 목록 비우기
    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.dataset.chatId = conv.id;
        if (conv.id === activeChatId) {
            item.classList.add('active');
        }
        // 채팅 아이템의 내용 (제목, 메뉴 버튼 등)
        item.innerHTML = `
            <span>${conv.title}</span>
            <div class="chat-item-menu-container">
                <button class="chat-item-menu-btn" aria-label="메뉴 열기">⋯</button>
                <div class="chat-item-menu">
                    <button class="chat-item-action-btn" data-action="rename">이름 변경</button>
                    <button class="chat-item-action-btn" data-action="delete">삭제</button>
                </div>
            </div>
        `;
        chatList.appendChild(item);
    });
}

/**
 * 채팅 메시지 DOM 요소를 생성하고 채팅창에 추가하는 함수
 * @param {string} text - 메시지 텍스트
 * @param {boolean} isUser - 사용자 메시지 여부
 * @returns {HTMLElement} - 생성된 메시지 div 요소
 */
function createChatMessage(text, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-question' : 'bot-answer';
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatArea.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

// 사용자 질문/봇 답변 추가 함수
function addUserQuestion(text) { createChatMessage(text, true); }
function addBotAnswer(text) { return createChatMessage(text, false); }

// 입력창 비우기 및 포커스 함수
function clearInput() {
    chatInput.value = '';
    chatInput.focus();
}

// 채팅창을 맨 아래로 스크롤하는 함수
function scrollToBottom() {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

/**
 * 사이드바 메뉴(이름 변경, 삭제) 상호작용을 처리하는 함수
 * @param {HTMLElement} target - 클릭된 요소
 * @param {string} chatId - 해당 채팅의 ID
 */
function handleMenuInteraction(target, chatId) {
    const menuBtn = target.closest('.chat-item-menu-btn');
    const actionBtn = target.closest('.chat-item-action-btn');

    if (menuBtn) {
        const menu = menuBtn.nextElementSibling;
        // 다른 모든 메뉴를 닫고 현재 메뉴의 상태를 토글
        document.querySelectorAll('.chat-item-menu.show').forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
    }

    if (actionBtn) {
        const action = actionBtn.dataset.action;
        const conversationIndex = conversations.findIndex(c => c.id === chatId);
        if (conversationIndex === -1) return;

        if (action === 'delete') {
            if (confirm('정말 이 채팅을 삭제하시겠습니까?')) {
                conversations.splice(conversationIndex, 1);
                // 삭제한 채팅이 현재 활성화된 채팅이었다면 새 채팅 시작
                if (activeChatId === chatId) {
                    startNewChat();
                } else {
                    updateSidebar();
                }
            }
        } else if (action === 'rename') {
            const currentName = conversations[conversationIndex].title;
            const newName = prompt('새 채팅 이름을 입력하세요.', currentName);
            if (newName && newName.trim() !== '') {
                conversations[conversationIndex].title = newName.trim();
                updateSidebar();
            }
        }
        // 메뉴 닫기
        actionBtn.closest('.chat-item-menu').classList.remove('show');
    }
}

// 문서의 다른 곳을 클릭하면 열려있는 메뉴를 닫는 이벤트 리스너
document.addEventListener('click', (e) => {
    if (!e.target.closest('.chat-item-menu-container')) {
        document.querySelectorAll('.chat-item-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

