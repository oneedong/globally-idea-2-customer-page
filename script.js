// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('고객사용 로그인 페이지 로드');
    
    // 초기 디버깅: 저장된 사용자 데이터 확인
    const usersData = localStorage.getItem('kbSecCustomerUsers');
    console.log('초기 로드 시 저장된 고객사 사용자 데이터:', usersData);
    
    // 로그인 폼 이벤트 리스너
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('로그인 폼 이벤트 리스너 등록');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('폼 제출 이벤트 발생');
            login();
        });
    }
    
    // 2단계 인증 모달 닫기 버튼 이벤트
    const closeVerificationModalBtn = document.getElementById('close-verification-modal');
    if (closeVerificationModalBtn) {
        closeVerificationModalBtn.addEventListener('click', closeVerificationModal);
    }
    
    // 인증번호 재발송 버튼 이벤트
    const resendCodeBtn = document.getElementById('resend-code-btn');
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', resendVerificationCode);
    }
    
    // 인증하기 버튼 이벤트
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', verifyCode);
    }
    
    // 인증번호 입력 필드 이벤트 설정
    setupVerificationCodeInputs();
    
    // 계약 상태 조회 버튼 이벤트
    const checkContractBtn = document.querySelector('.check-contract-btn');
    if (checkContractBtn) {
        checkContractBtn.addEventListener('click', quickCheckContract);
    }
    
    // 계약 상태 조회 모달 닫기 버튼 이벤트
    const closeContractCheckModalBtn = document.getElementById('close-contract-check-modal');
    if (closeContractCheckModalBtn) {
        closeContractCheckModalBtn.addEventListener('click', closeContractCheckModal);
    }
    
    // 저장된 아이디가 있으면 입력
    const savedId = localStorage.getItem('kbSecSavedId');
    if (savedId) {
        const usernameInput = document.getElementById('login-id');
        const rememberIdCheckbox = document.getElementById('remember-id');
        
        if (usernameInput) usernameInput.value = savedId;
        if (rememberIdCheckbox) rememberIdCheckbox.checked = true;
    }
    
    // 테스트용 고객사 계정 생성 (실제 서비스에서는 제거)
    createTestCustomerAccounts();
});

// 테스트용 고객사 계정 생성 (실제 서비스에서는 제거)
function createTestCustomerAccounts() {
    // 기존 데이터 삭제
    localStorage.removeItem('kbSecCustomerAccountsCreated');
    localStorage.removeItem('kbSecCustomerUsers');
    
    const testAccounts = [
        {
            id: 'samsung',
            password: 'samsung123',
            companyName: '삼성전자',
            phoneNumber: '010-1234-5678',
            createdAt: new Date().toISOString()
        },
        {
            id: 'hyundai',
            password: 'hyundai123',
            companyName: '현대자동차',
            phoneNumber: '010-2345-6789',
            createdAt: new Date().toISOString()
        },
        {
            id: 'sk',
            password: 'sk123',
            companyName: 'SK하이닉스',
            phoneNumber: '010-3456-7890',
            createdAt: new Date().toISOString()
        },
        {
            id: 'timefolio',
            password: 'timefolio',
            companyName: '타임폴리오자산운용',
            phoneNumber: '010-9876-5432',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('kbSecCustomerUsers', JSON.stringify(testAccounts));
    localStorage.setItem('kbSecCustomerAccountsCreated', 'true');
    console.log('테스트용 고객사 계정 생성 완료');
}

// 로그인 처리
function login() {
    console.log('고객사 로그인 시도');
    const username = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;
    
    console.log('입력된 아이디:', username);
    
    // 유효성 검사
    if (!username || !password) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    // 아이디 저장 처리
    const rememberIdCheckbox = document.getElementById('remember-id');
    if (rememberIdCheckbox && rememberIdCheckbox.checked) {
        localStorage.setItem('kbSecSavedId', username);
    } else {
        localStorage.removeItem('kbSecSavedId');
    }
    
    // 고객사 사용자 등록 여부 확인 (로컬 스토리지에서)
    const usersStr = localStorage.getItem('kbSecCustomerUsers');
    console.log('저장된 고객사 사용자 데이터(문자열):', usersStr);
    
    let users = [];
    
    try {
        if (usersStr && usersStr !== "undefined" && usersStr !== "null") {
            users = JSON.parse(usersStr);
        }
    } catch (e) {
        console.error('고객사 사용자 데이터 파싱 오류:', e);
        users = [];
    }
    
    console.log('파싱된 고객사 사용자 데이터(배열):', users);
    
    // 배열에서 사용자 찾기
    const foundUser = users.find(user => user.id === username);
    console.log('찾은 고객사 사용자:', foundUser);
    
    if (foundUser) {
        // 비밀번호 확인
        if (foundUser.password === password) {
            // 로그인 1단계 성공 - 2단계 인증으로 진행
            // 현재 사용자 정보를 세션 스토리지에 임시 저장
            sessionStorage.setItem('kbSecTempUser', JSON.stringify({
                id: foundUser.id,
                companyName: foundUser.companyName,
                phoneNumber: foundUser.phoneNumber
            }));
            
            // 인증번호 생성 및 저장
            generateAndSendVerificationCode();
            
            // 2단계 인증 모달 표시
            showVerificationModal();
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    } else {
        console.error('고객사 사용자를 찾을 수 없음:', username);
        alert('존재하지 않는 아이디입니다.');
    }
}

// 인증번호 생성 및 발송
function generateAndSendVerificationCode() {
    // 6자리 랜덤 숫자 생성 대신 고정된 인증번호 사용
    const verificationCode = "123456";
    
    // 인증번호 저장 (실제로는 서버에 저장하고 SMS로 발송)
    sessionStorage.setItem('kbSecVerificationCode', verificationCode);
    sessionStorage.setItem('kbSecVerificationExpiry', Date.now() + 180000); // 3분 유효시간
    
    console.log('고정된 인증번호 사용:', verificationCode);
    
    // 타이머 시작
    startVerificationTimer();
    
    // 실제 서비스에서는 여기에 SMS 발송 API 호출 코드 추가
    alert('테스트를 위한 인증번호는 123456 입니다.');
    return verificationCode;
}

// 인증번호 재발송
function resendVerificationCode() {
    const code = generateAndSendVerificationCode();
    alert('인증번호가 재발송되었습니다.');
}

// 인증번호 확인
function verifyCode() {
    // 입력된 인증번호 가져오기
    const inputDigits = document.querySelectorAll('.code-digit');
    let inputCode = '';
    
    inputDigits.forEach(input => {
        inputCode += input.value;
    });
    
    // 입력값 확인
    if (inputCode.length !== 6) {
        alert('6자리 인증번호를 모두 입력해주세요.');
        return;
    }
    
    // 테스트를 위해 항상 123456으로 검증
    const savedCode = "123456";
    const expiryTime = parseInt(sessionStorage.getItem('kbSecVerificationExpiry') || '0');
    
    // 만료 시간 확인
    if (Date.now() > expiryTime) {
        alert('인증번호가 만료되었습니다. 인증번호를 재발송해주세요.');
        return;
    }
    
    // 인증번호 확인 (항상 123456이 맞는 것으로 처리)
    if (inputCode === savedCode || inputCode === "123456") {
        // 인증 성공
        const tempUser = JSON.parse(sessionStorage.getItem('kbSecTempUser') || '{}');
        
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('kbSecCurrentUser', JSON.stringify({
            id: tempUser.id,
            companyName: tempUser.companyName,
            phoneNumber: tempUser.phoneNumber,
            role: 'customer'
        }));
        
        // 임시 데이터 삭제
        sessionStorage.removeItem('kbSecTempUser');
        sessionStorage.removeItem('kbSecVerificationCode');
        sessionStorage.removeItem('kbSecVerificationExpiry');
        
        // 대시보드로 이동
        window.location.href = 'dashboard.html';
    } else {
        alert('인증번호가 일치하지 않습니다. 테스트를 위해 123456을 입력해주세요.');
    }
}

// 인증 타이머 시작
function startVerificationTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    const expiryTime = parseInt(sessionStorage.getItem('kbSecVerificationExpiry') || '0');
    
    // 이전 타이머가 있으면 제거
    if (window.verificationTimer) {
        clearInterval(window.verificationTimer);
    }
    
    // 타이머 설정
    window.verificationTimer = setInterval(() => {
        const remainingTime = expiryTime - Date.now();
        
        if (remainingTime <= 0) {
            // 타이머 종료
            clearInterval(window.verificationTimer);
            timerElement.textContent = '00:00';
            return;
        }
        
        // 남은 시간 계산
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        // 시간 표시 업데이트
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 인증번호 입력 필드 설정
function setupVerificationCodeInputs() {
    const codeInputs = document.querySelectorAll('.code-digit');
    
    codeInputs.forEach((input, index) => {
        // 숫자만 입력 가능하도록 설정
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // 입력 후 다음 필드로 포커스 이동
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        // 백스페이스 처리
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
}

// 2단계 인증 모달 표시
function showVerificationModal() {
    const modal = document.getElementById('verification-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // 첫 번째 입력 필드에 포커스
        const firstInput = document.querySelector('.code-digit[data-index="1"]');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

// 2단계 인증 모달 닫기
function closeVerificationModal() {
    const modal = document.getElementById('verification-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 타이머 정지
    if (window.verificationTimer) {
        clearInterval(window.verificationTimer);
    }
}

// 빠른 계약 상태 조회 (로그인 페이지에서)
function quickCheckContract() {
    console.log('계약 상태 조회 시도');
    const contractNumber = document.getElementById('quick-contract-number').value;
    
    if (!contractNumber) {
        alert('계약번호를 입력해주세요.');
        return;
    }
    
    // 계약 데이터 가져오기
    const allContracts = JSON.parse(localStorage.getItem('kbSecContracts')) || {};
    let foundContract = null;
    
    // 모든 연도의 계약 검색
    Object.values(allContracts).forEach(yearContracts => {
        const found = yearContracts.find(contract => contract.contractNumber === contractNumber);
        if (found) foundContract = found;
    });
    
    if (foundContract) {
        // 계약 정보 표시
        showContractCheckModal();
        displayContractInfo(foundContract);
    } else {
        alert('해당 계약번호의 계약을 찾을 수 없습니다.');
    }
}

// 계약 정보 표시
function displayContractInfo(contract) {
    const contractInfo = document.getElementById('contract-info');
    if (!contractInfo) return;
    
    contractInfo.innerHTML = `
        <p><strong>계약번호:</strong> ${contract.contractNumber || '없음'}</p>
        <p><strong>계약명:</strong> ${contract.name || '없음'}</p>
        <p><strong>계약 종류:</strong> ${contract.type || '없음'}</p>
        <p><strong>거래 상대방:</strong> ${contract.company || '없음'}</p>
        <p><strong>체결일자:</strong> ${formatDate(contract.date) || '없음'}</p>
        <p><strong>체결 현황:</strong> ${contract.status || '없음'}</p>
    `;
    
    // 진행 상태 표시
    updateProgressBar(contract.status);
}

// 진행 상태 표시
function updateProgressBar(status) {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    
    // 초기화
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    line1.classList.remove('active');
    line2.classList.remove('active');
    
    // 상태에 따라 진행 상태 표시
    if (status === '법무검토 완료') {
        step1.classList.add('active');
    } else if (status === '체결 진행중') {
        step1.classList.add('active');
        step2.classList.add('active');
        line1.classList.add('active');
    } else if (status === '체결 완료') {
        step1.classList.add('active');
        step2.classList.add('active');
        step3.classList.add('active');
        line1.classList.add('active');
        line2.classList.add('active');
    }
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 계약 상태 조회 모달 표시
function showContractCheckModal() {
    document.getElementById('contract-check-modal').style.display = 'block';
}

// 계약 상태 조회 모달 닫기
function closeContractCheckModal() {
    document.getElementById('contract-check-modal').style.display = 'none';
}