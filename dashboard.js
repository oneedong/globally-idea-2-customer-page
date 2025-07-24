// 사용자 데이터를 로컬 스토리지에 저장
let currentUser = JSON.parse(localStorage.getItem('kbSecCurrentUser')) || null;
let contracts = {};
let contractNumbers = {};
let selectedYear = new Date().getFullYear().toString();

// 전역 변수로 페이지네이션 상태 관리
let currentPage = 1;
const itemsPerPage = 30;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('고객사용 대시보드 페이지 로드됨');
    
    // 로그인 상태 확인
    if (currentUser) {
        console.log('로그인 상태:', currentUser.id);
        
        // 고객사 이름 표시
        document.getElementById('user-name').textContent = currentUser.companyName + ' 계정';
        
        // 계약 데이터 로드
        loadContractsFromLocalStorage();
    } else {
        console.log('로그인되지 않음');
        window.location.href = 'index.html';
    }
    
    // 이벤트 리스너 설정
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 로그아웃 버튼 이벤트 설정
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // 계약 검색 이벤트 설정
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchContracts);
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchContracts();
            }
        });
    }
    
    // 필터 적용 버튼 이벤트 설정
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // 필터 초기화 버튼 이벤트 설정
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // 계약 추가 버튼 이벤트 설정
    const addContractBtn = document.getElementById('add-contract-btn');
    if (addContractBtn) {
        addContractBtn.addEventListener('click', showAddContractModal);
    }
    
    // 계약 추가 모달 닫기 버튼 이벤트 설정
    const closeAddContractModalBtn = document.getElementById('close-add-contract-modal');
    if (closeAddContractModalBtn) {
        closeAddContractModalBtn.addEventListener('click', closeAddContractModal);
    }
    
    // 계약 추가 폼 제출 이벤트 설정
    const addContractForm = document.getElementById('add-contract-form');
    if (addContractForm) {
        addContractForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addContract();
        });
    }
    
    // 계약 상세 모달 닫기 버튼 이벤트 설정
    const closeContractDetailModalBtn = document.getElementById('close-contract-detail-modal');
    if (closeContractDetailModalBtn) {
        closeContractDetailModalBtn.addEventListener('click', closeContractDetailModal);
    }
    
    // 계약 수정 버튼 이벤트 설정
    const editContractBtn = document.getElementById('edit-contract-btn');
    if (editContractBtn) {
        editContractBtn.addEventListener('click', function() {
            const modal = document.getElementById('contract-detail-modal');
            const contractId = modal.getAttribute('data-contract-id');
            const year = modal.getAttribute('data-contract-year');
            showEditContractModal(contractId, year);
        });
    }
    
    // 계약 삭제 버튼 이벤트 설정
    const deleteContractBtn = document.getElementById('delete-contract-btn');
    if (deleteContractBtn) {
        deleteContractBtn.addEventListener('click', function() {
            const modal = document.getElementById('contract-detail-modal');
            const contractId = modal.getAttribute('data-contract-id');
            const year = modal.getAttribute('data-contract-year');
            deleteContract(contractId, year);
        });
    }
    
    // 계약 수정 모달 닫기 버튼 이벤트 설정
    const closeEditContractModalBtn = document.getElementById('close-edit-contract-modal');
    if (closeEditContractModalBtn) {
        closeEditContractModalBtn.addEventListener('click', function() {
            document.getElementById('edit-contract-modal').style.display = 'none';
        });
    }
    
    // 계약 수정 폼 제출 이벤트 설정
    const editContractForm = document.getElementById('edit-contract-form');
    if (editContractForm) {
        editContractForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateContract();
        });
    }
    
    // 파일 업로드 영역 설정
    setupFileUploadArea();
}

// 고객 발송 모달 이벤트 설정
function setupNotificationModalEvents() {
    // 발송 방법 변경 이벤트
    const notificationMethod = document.getElementById('notification-method');
    if (notificationMethod) {
        notificationMethod.addEventListener('change', function() {
            const emailGroup = document.getElementById('email-input-group');
            const kakaoGroup = document.getElementById('kakao-input-group');
            
            if (this.value === 'email') {
                emailGroup.style.display = 'block';
                kakaoGroup.style.display = 'none';
            } else {
                emailGroup.style.display = 'none';
                kakaoGroup.style.display = 'block';
            }
        });
    }
    
    // 발송 폼 제출 이벤트
    const sendNotificationForm = document.getElementById('send-notification-form');
    if (sendNotificationForm) {
        sendNotificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendNotification();
        });
    }
    
    // 모달 닫기 이벤트
    const closeSendNotificationModalBtn = document.querySelector('#send-notification-modal .close');
    if (closeSendNotificationModalBtn) {
        closeSendNotificationModalBtn.addEventListener('click', closeSendNotificationModal);
    }
}

// 고객 발송 모달 표시
function showSendNotificationModal(contractId, year) {
    console.log('고객 발송 모달 표시:', contractId, year);
    
    // 계약 찾기
    const contract = contracts[year].find(c => c.id === contractId);
    if (!contract) {
        console.error('계약을 찾을 수 없음');
        alert('계약 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 계약 정보 저장
    const modal = document.getElementById('send-notification-modal');
    modal.setAttribute('data-contract-id', contractId);
    modal.setAttribute('data-contract-year', year);
    
    // 기본 메시지 설정
    const messageTemplate = 
        `안녕하세요, ${contract.company} 담당자님\n\n` +
        `${contract.name} 계약의 현재 상태는 "${contract.status}"입니다.\n` +
        `계약 번호: ${contract.contractNumber || '미정'}\n` +
        `체결일자: ${formatDate(contract.date)}\n\n` +
        `추가 문의사항이 있으시면 연락 주시기 바랍니다.\n\n` +
        `KB증권 드림`;
    
    document.getElementById('notification-message').value = messageTemplate;
    
    // 이메일 입력란 초기화
    document.getElementById('recipient-email').value = '';
    
    // 연락처 입력란 초기화
    document.getElementById('recipient-phone').value = '';
    
    // 모달 표시
    modal.style.display = 'block';
}

// 고객 발송 모달 닫기
function closeSendNotificationModal() {
    document.getElementById('send-notification-modal').style.display = 'none';
}

// 고객 발송 처리
function sendNotification() {
    console.log('고객 발송 처리 시작');
    
    // 모달에서 계약 정보 가져오기
    const modal = document.getElementById('send-notification-modal');
    const contractId = modal.getAttribute('data-contract-id');
    const year = modal.getAttribute('data-contract-year');
    
    // 계약 찾기
    const contract = contracts[year].find(c => c.id === contractId);
    if (!contract) {
        console.error('계약을 찾을 수 없음');
        alert('계약 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 발송 방법
    const method = document.getElementById('notification-method').value;
    
    // 수신자 정보
    let recipient = '';
    if (method === 'email') {
        recipient = document.getElementById('recipient-email').value;
        if (!recipient || !isValidEmail(recipient)) {
            alert('유효한 이메일 주소를 입력해주세요.');
            return;
        }
    } else {
        recipient = document.getElementById('recipient-phone').value;
        if (!recipient || !isValidPhone(recipient)) {
            alert('유효한 연락처를 입력해주세요.');
            return;
        }
    }
    
    // 메시지
    const message = document.getElementById('notification-message').value;
    if (!message) {
        alert('메시지를 입력해주세요.');
        return;
    }
    
    // 발송 기록 저장
    saveNotificationHistory(contract, method, recipient, message);
    
    // 모달 닫기
    closeSendNotificationModal();
    
    // 성공 메시지
    if (method === 'email') {
        alert(`${recipient}로 이메일이 발송되었습니다.`);
    } else {
        alert(`${recipient}로 카카오톡 메시지가 발송되었습니다.`);
    }
}

// 이메일 유효성 검사
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 연락처 유효성 검사
function isValidPhone(phone) {
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return phoneRegex.test(phone);
}

// 발송 기록 저장
function saveNotificationHistory(contract, method, recipient, message) {
    // 계약에 발송 기록 배열이 없으면 초기화
    if (!contract.notifications) {
        contract.notifications = [];
    }
    
    // 발송 기록 객체 생성
    const notification = {
        id: Date.now().toString(),
        method: method,
        recipient: recipient,
        message: message,
        sentAt: new Date().toISOString(),
        sentBy: currentUser.id
    };
    
    // 발송 기록 추가
    contract.notifications.push(notification);
    
    // 로컬 스토리지에 저장
    saveContractsToLocalStorage();
    
    console.log('발송 기록 저장 완료:', notification);
}

// 로컬 스토리지에서 계약 데이터 로드
function loadContractsFromLocalStorage() {
    console.log('로컬 스토리지에서 계약 데이터 로드 시작');
    
    // 계약 데이터 초기화
    contracts = JSON.parse(localStorage.getItem('kbSecContracts')) || {};
    
    // 계약 번호 데이터 로드
    contractNumbers = JSON.parse(localStorage.getItem('kbSecContractNumbers')) || {};
    
    console.log('계약 데이터 로드 완료');
    
    // 연도 목록 생성
    createYearList();
    
    // 최신 연도 선택
    const years = Object.keys(contracts).sort((a, b) => b - a);
    if (years.length > 0) {
        loadContractsByYear(years[0]);
    } else {
        loadContractsByYear(new Date().getFullYear().toString());
    }
}

// 로그아웃 처리
function logout() {
    localStorage.removeItem('kbSecCurrentUser');
    window.location.href = 'index.html';
}

// 계약 추가 처리
function addContract() {
    console.log('계약 추가 시작');
    
    // 폼 데이터 가져오기
    const name = document.getElementById('add-contract-name').value;
    const type = document.getElementById('add-contract-type').value;
    const company = document.getElementById('add-contract-company').value;
    const date = document.getElementById('add-contract-date').value;
    const status = document.getElementById('add-contract-status').value;
    const details = document.getElementById('add-contract-details').value;
    const fileInput = document.getElementById('contract-file-input');
    
    // 필수 입력 확인
    if (!name || !company || !date) {
        alert('계약명, 거래 상대방, 체결일자는 필수 입력 항목입니다.');
        return;
    }
    
    // 계약 날짜에서 연도 추출
    const contractYear = new Date(date).getFullYear();
    
    // 해당 연도의 계약 배열이 없으면 초기화
    if (!contracts[contractYear]) {
        contracts[contractYear] = [];
    }
    
    // 계약 번호 생성
    const contractNumber = generateContractNumber(date);
    
    console.log('파일 입력 확인:', fileInput ? '있음' : '없음');
    console.log('파일 존재 확인:', fileInput && fileInput.files && fileInput.files.length > 0 ? '있음' : '없음');
    
    if (fileInput) {
        console.log('파일 입력 정보:', fileInput.id, fileInput.type, fileInput.files?.length);
    }
    
    // 계약 ID 생성 (현재 시간 기준)
    const contractId = Date.now().toString();
    
    // 계약 객체 생성 (기본 정보)
    const contract = {
        id: contractId,
        contractNumber: contractNumber,
        name: name,
        type: type,
        company: company,
        date: date,
        status: status,
        details: details,
        department: currentUser.department,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 파일 데이터 처리
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log('파일 선택됨:', file.name, file.type, file.size);
        
        // 파일 유효성 검사
        if (!validateFile(file)) {
            return;
        }
        
        // 파일을 Base64로 인코딩하여 저장
        const reader = new FileReader();
        reader.onload = function(e) {
            // 파일 데이터 저장 (Base64 형식)
            contract.file = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            
            // 계약 배열에 추가
            contracts[contractYear].push(contract);
            
            // 로컬 스토리지에 저장
            saveContractsToLocalStorage();
            
            // 모달 닫기
            closeAddContractModal();
            
            // 현재 연도의 계약 목록 다시 로드
            loadContractsByYear(contractYear.toString());
            
            // 성공 메시지
            alert('계약이 추가되었습니다.');
        };
        
        reader.onerror = function(error) {
            console.error('파일 읽기 오류:', error);
            alert('파일 읽기 중 오류가 발생했습니다.');
        };
        
        // 파일을 Base64로 인코딩
        reader.readAsDataURL(file);
    } else {
        // 파일 없이 계약 추가
        // 계약 배열에 추가
        contracts[contractYear].push(contract);
        
        // 로컬 스토리지에 저장
        saveContractsToLocalStorage();
        
        // 모달 닫기
        closeAddContractModal();
        
        // 현재 연도의 계약 목록 다시 로드
        loadContractsByYear(contractYear.toString());
        
        // 성공 메시지
        alert('계약이 추가되었습니다.');
    }
}

// 로컬 스토리지에 계약 정보 저장
function saveContractsToLocalStorage() {
    localStorage.setItem('kbSecContracts', JSON.stringify(contracts));
    localStorage.setItem('kbSecContractNumbers', JSON.stringify(contractNumbers));
    console.log('로컬 스토리지에 계약 데이터 저장 완료');
}

// Firestore에 계약 정보 저장
function saveContractToFirestore(contract) {
    return firebase.firestore().collection('contracts').add(contract)
        .then(docRef => {
            console.log('Firestore에 계약 저장 완료:', docRef.id);
            
            // 계약 번호 데이터 업데이트
            return firebase.firestore().collection('contractNumbers').doc('numbers').set(contractNumbers, { merge: true })
                .then(() => {
                    console.log('계약 번호 데이터 업데이트 완료');
                    return docRef;
                });
        });
}

// 계약 수정 처리
function updateContract() {
    console.log('계약 수정 시작');
    
    // 수정할 계약 찾기
    const contractIndex = contracts[selectedYear].findIndex(c => c.id === contractId);
    if (contractIndex === -1) {
        console.error('수정할 계약을 찾을 수 없음');
        alert('수정할 계약을 찾을 수 없습니다.');
        return;
    }
    
    const oldContract = contracts[selectedYear][contractIndex];
    console.log('기존 계약 정보:', oldContract);
    
    // 폼 데이터 가져오기
    const name = document.getElementById('add-contract-name').value;
    const type = document.getElementById('add-contract-type').value;
    const company = document.getElementById('add-contract-company').value;
    const date = document.getElementById('add-contract-date').value;
    const status = document.getElementById('add-contract-status').value;
    const details = document.getElementById('add-contract-details').value;
    const fileInput = document.getElementById('contract-file-input');
    
    // 필수 입력 확인
    if (!name || !company || !date) {
        alert('계약명, 거래 상대방, 체결일자는 필수 입력 항목입니다.');
        return;
    }
    
    // 날짜에서 연도 추출
    const newYear = new Date(date).getFullYear();
    
    // 파일 데이터 처리
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        // 새 파일이 선택된 경우
        const file = fileInput.files[0];
        console.log('새 파일 선택됨:', file.name);
        
        // 파일 유효성 검사
        if (!validateFile(file)) {
            return;
        }
        
        // 파일 읽기
        const reader = new FileReader();
        reader.onload = function(e) {
            // 파일 데이터를 base64로 저장
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            
            console.log('파일 데이터 생성 완료:', file.name);
            
            // 수정된 계약 객체
            const updatedContract = {
                ...oldContract,
                name: name,
                type: type,
                company: company,
                date: date,
                status: status,
                details: details,
                file: fileData,
                updatedAt: new Date().toISOString()
            };
            
            console.log('업데이트된 계약 정보:', updatedContract);
            console.log('파일 정보:', updatedContract.file ? updatedContract.file.name : '없음');
            finishUpdateContract(updatedContract, contractIndex, selectedYear, newYear);
        };
        
        reader.onerror = function(error) {
            console.error('파일 읽기 오류:', error);
            alert('파일 읽기 중 오류가 발생했습니다.');
        };
        
        // 파일을 base64로 읽기
        reader.readAsDataURL(file);
    } else {
        // 파일이 선택되지 않은 경우, 기존 파일 유지
        const updatedContract = {
            ...oldContract,
            name: name,
            type: type,
            company: company,
            date: date,
            status: status,
            details: details,
            updatedAt: new Date().toISOString()
        };
        
        console.log('기존 파일 유지, 업데이트된 계약 정보:', updatedContract);
        console.log('파일 정보:', updatedContract.file ? updatedContract.file.name : '없음');
        finishUpdateContract(updatedContract, contractIndex, selectedYear, newYear);
    }
}

// 계약 수정 완료 처리
function finishUpdateContract(updatedContract, contractIndex, oldYear, newYear) {
    console.log('계약 수정 완료 처리 시작');
    console.log('업데이트된 계약 정보:', updatedContract);
    console.log('파일 정보:', updatedContract.file);
    
    // 연도가 변경된 경우
    if (oldYear !== newYear) {
        // 기존 연도에서 계약 제거
        contracts[oldYear].splice(contractIndex, 1);
        
        // 새 연도 배열이 없으면 초기화
        if (!contracts[newYear]) {
            contracts[newYear] = [];
        }
        
        // 새 연도에 계약 추가
        contracts[newYear].push(updatedContract);
    } else {
        // 같은 연도 내에서 업데이트
        contracts[oldYear][contractIndex] = updatedContract;
    }
    
    // 로컬 스토리지에 저장
    saveContractsToLocalStorage();
    
    console.log('계약 수정 완료:', updatedContract);
    
    // 모달 닫기
    document.getElementById('add-contract-modal').style.display = 'none';
    
    // 현재 연도의 계약 목록 다시 로드
    loadContractsByYear(newYear);
    
    // 연도가 변경된 경우 이전 연도의 목록도 다시 로드
    if (oldYear !== newYear) {
        loadContractsByYear(oldYear);
    }
    
    // 성공 메시지
    alert('계약이 수정되었습니다.');
}

// 계약 상세 모달에서 수정 버튼 클릭 시 처리
function editContract() {
    console.log('계약 상세 모달에서 수정 버튼 클릭');
    
    try {
        const modal = document.getElementById('contract-detail-modal');
        const contractId = modal.getAttribute('data-contract-id');
        const year = modal.getAttribute('data-contract-year');
        
        if (!contractId || !year) {
            console.error('계약 ID 또는 연도 정보가 없습니다.');
            alert('수정할 계약 정보를 찾을 수 없습니다.');
            return;
        }
        
        console.log('수정할 계약 정보:', { contractId, year });
        
        // 상세 모달 닫기
        closeContractDetailModal();
        
        // 수정 모달 열기
        showEditContractModal(contractId, year);
    } catch (error) {
        console.error('계약 수정 버튼 처리 중 오류:', error);
        alert('계약 수정 버튼 처리 중 오류가 발생했습니다.');
    }
}

// 계약 번호 생성
function generateContractNumber(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // 해당 연월의 계약 번호 카운터 가져오기
    const yearMonth = `${year}${month}`;
    contractNumbers[yearMonth] = (contractNumbers[yearMonth] || 0) + 1;
    
    // 계약 번호 포맷: YYYYMM-XXXX (XXXX는 일련번호)
    const counter = String(contractNumbers[yearMonth]).padStart(4, '0');
    const contractNumber = `${yearMonth}-${counter}`;
    
    console.log('계약 번호 생성:', contractNumber);
    return contractNumber;
}

// 계약 삭제
function deleteContract(contractId, year) {
    console.log('계약 삭제 시작:', { contractId, year });
    
    try {
        // 계약 ID와 연도가 전달되지 않은 경우 모달에서 가져오기
        if (!contractId || !year) {
            const modal = document.getElementById('contract-detail-modal');
            contractId = modal.getAttribute('data-contract-id');
            year = modal.getAttribute('data-contract-year');
            
            if (!contractId || !year) {
                console.error('삭제할 계약 정보를 찾을 수 없음');
                alert('삭제할 계약 정보를 찾을 수 없습니다.');
                return;
            }
        }
        
        // 로컬 계약 데이터에서 계약 찾기
        const contractIndex = contracts[year].findIndex(c => c.id === contractId);
        if (contractIndex === -1) {
            console.error('삭제할 계약을 찾을 수 없음');
            alert('삭제할 계약을 찾을 수 없습니다.');
            return;
        }
        
        const contract = contracts[year][contractIndex];
        
        // 관리자이거나 자신의 부서 계약만 삭제 가능
        if (!currentUser.isAdmin && contract.department !== currentUser.department) {
            alert('권한이 없습니다.');
            return;
        }
        
        if (confirm('정말로 이 계약을 삭제하시겠습니까?')) {
            console.log('계약 삭제 확인됨');
            
            // 로컬 계약 데이터에서 삭제
            contracts[year].splice(contractIndex, 1);
            
            // 로컬 스토리지에 저장
            saveContractsToLocalStorage();
            
            // 계약 목록 새로고침
            loadContractsByYear(year);
            
            // 상세 모달이 열려있는 경우 닫기
            closeContractDetailModal();
            
            alert('계약이 삭제되었습니다.');
        }
    } catch (error) {
        console.error('계약 삭제 처리 중 오류:', error);
        alert('계약 삭제 처리 중 오류가 발생했습니다.');
    }
}

// 계약 검색
function searchContracts() {
    const selectedYear = document.querySelector('#year-list a.active')?.getAttribute('data-year');
    if (!selectedYear) return;
    
    displayContracts(selectedYear);
}

// 날짜 포맷팅 (YYYY-MM-DD 또는 YYYY-MM)
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // 일자가 1일(기본값)인 경우 연-월 형식으로 표시
    if (date.getDate() === 1 && dateString.length <= 7) {
        return `${year}-${month}`;
    }
    
    // 그 외의 경우 연-월-일 형식으로 표시
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
} 

// 파일 업로드 영역 설정
function setupFileUploadArea() {
    console.log('파일 업로드 영역 설정 시작');
    
    const fileArea = document.getElementById('add-contract-file-area');
    if (!fileArea) {
        console.error('파일 업로드 영역을 찾을 수 없음');
        return;
    }
    
    // 기존 파일 입력 요소 제거
    const oldFileInput = document.getElementById('contract-file-input');
    if (oldFileInput) {
        oldFileInput.remove();
    }
    
    // 파일 입력 요소 생성
    const fileInput = createFileInput();
    fileArea.appendChild(fileInput);
    
    // 계약명 입력 요소
    const contractNameInput = document.getElementById('add-contract-name');
    
    // 파일 선택 이벤트 처리
    fileInput.onchange = function(e) {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            console.log('파일 선택됨:', file.name);
            
            // 파일 유효성 검사
            if (validateFile(file)) {
                // 파일 정보 표시
                displayFileInfo(fileArea, file);
                
                // 계약명 자동 입력
                if (contractNameInput && (!contractNameInput.value || contractNameInput.value.trim() === '')) {
                    const fileName = file.name.replace(/\.[^/.]+$/, "");
                    contractNameInput.value = fileName;
                    console.log('계약명 자동 입력:', fileName);
                }
            }
        }
    };
    
    // 드래그 앤 드롭 이벤트 처리
    fileArea.ondragover = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-over');
        console.log('드래그 오버');
        return false;
    };
    
    fileArea.ondragleave = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        console.log('드래그 리브');
        return false;
    };
    
    fileArea.ondrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        console.log('드롭 이벤트 발생');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            console.log('파일 드롭됨:', file.name);
            
            // 파일 유효성 검사
            if (validateFile(file)) {
                try {
                    // DataTransfer 객체 생성
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    
                    // 새 파일 입력 요소 생성
                    const newFileInput = createFileInput();
                    
                    // 파일 입력 요소에 파일 설정
                    newFileInput.files = dataTransfer.files;
                    
                    // 기존 파일 입력 요소 교체
                    fileInput.parentNode.replaceChild(newFileInput, fileInput);
                    
                    // 파일 정보 표시
                    displayFileInfo(fileArea, file);
                    
                    // 계약명 자동 입력
                    if (contractNameInput && (!contractNameInput.value || contractNameInput.value.trim() === '')) {
                        const fileName = file.name.replace(/\.[^/.]+$/, "");
                        contractNameInput.value = fileName;
                        console.log('계약명 자동 입력:', fileName);
                    }
                } catch (error) {
                    console.error('파일 드롭 처리 오류:', error);
                    alert('파일 업로드 중 오류가 발생했습니다.');
                    
                    // 대체 방법: 파일 정보만 표시하고 사용자에게 파일 선택 요청
                    fileArea.innerHTML = `
                        <div class="file-info">
                            <i class="fas fa-exclamation-triangle" style="color: #f57c00; font-size: 32px; margin-bottom: 8px;"></i>
                            <span class="file-name">파일을 다시 선택해주세요</span>
                        </div>
                    `;
                    
                    // 파일 입력 요소 추가
                    fileArea.appendChild(createFileInput());
                }
            }
        }
        
        return false;
    };
    
    // 클릭 이벤트 처리
    fileArea.onclick = function(e) {
        // 이미 input 요소를 클릭한 경우 중복 실행 방지
        if (e.target !== fileInput) {
            console.log('파일 영역 클릭됨');
            fileInput.click();
        }
    };
    
    console.log('파일 업로드 영역 설정 완료');
}

// 파일 유효성 검사
function validateFile(file) {
    console.log('파일 유효성 검사:', file.name);
    
    // 파일 확장자 확인
    const fileExt = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['docx', 'doc', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'txt'];
    
    if (!allowedExtensions.includes(fileExt)) {
        alert('지원되는 파일 형식: docx, doc, pdf, xls, xlsx, ppt, pptx, hwp, txt');
        return false;
    }
    
    // 파일 크기 제한 (20MB)
    if (file.size > 20 * 1024 * 1024) {
        alert('파일 크기는 20MB를 초과할 수 없습니다.');
        return false;
    }
    
    console.log('파일 유효성 검사 통과');
    return true;
}

// 파일 정보 표시
function displayFileInfo(fileArea, file) {
    console.log('파일 정보 표시:', file.name);
    
    // 파일 아이콘 정보 가져오기
    const iconInfo = getFileIconInfo(file.name);
    
    // 파일 크기 포맷팅
    const fileSize = formatFileSize(file.size);
    
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    // 파일 정보 HTML 생성
    const fileInfoHtml = `
        <div class="file-info">
            <i class="${iconInfo.className}" style="color: ${iconInfo.color}; font-size: 38px; margin-bottom: 10px;"></i>
            <span class="file-name" style="font-weight: 500; font-size: 14px; margin-bottom: 5px; display: block; text-align: center;">${file.name}</span>
            <span class="file-ext" style="font-weight: bold; font-size: 12px; color: #0a2e5c; background-color: #f0f7ff; padding: 2px 6px; border-radius: 4px; margin-bottom: 5px;">${fileExt.toUpperCase()}</span>
            <span class="file-size" style="color: #666; font-size: 12px;">${fileSize}</span>
        </div>
    `;
    
    // 파일 영역에 정보 표시
    fileArea.innerHTML = fileInfoHtml;
    
    // 파일 입력 요소 추가 (숨김)
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'contract-file-input';
    input.className = 'file-upload-input';
    input.style.display = 'none';
    input.accept = '.docx,.doc,.pdf,.xls,.xlsx,.ppt,.pptx,.hwp,.txt';
    
    // 선택된 파일 설정
    try {
        // DataTransfer 객체를 사용하여 파일 설정
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        console.log('파일 입력 요소에 파일 설정 완료:', file.name);
    } catch (error) {
        console.error('파일 설정 오류:', error);
    }
    
    fileArea.appendChild(input);
    console.log('파일 정보 표시 완료');
    
    return input;
}

// 파일 크기 포맷팅 함수
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 파일 입력 요소 생성
function createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'contract-file-input';
    input.className = 'file-upload-input';
    input.accept = '.docx,.doc,.pdf,.xls,.xlsx,.ppt,.pptx,.hwp,.txt';
    return input;
} 

// 파일 형식에 따른 아이콘 클래스와 색상 반환
function getFileIconInfo(fileName) {
    if (!fileName) return { className: 'far fa-file', color: '#aaa' };
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
        case 'pdf':
            return { className: 'far fa-file-pdf', color: '#f40f02' }; // Adobe PDF 색상
        case 'doc':
        case 'docx':
            return { className: 'far fa-file-word', color: '#2b579a' }; // Microsoft Word 색상
        case 'xls':
        case 'xlsx':
            return { className: 'far fa-file-excel', color: '#217346' }; // Microsoft Excel 색상
        case 'ppt':
        case 'pptx':
            return { className: 'far fa-file-powerpoint', color: '#d24726' }; // Microsoft PowerPoint 색상
        case 'hwp':
            return { className: 'far fa-file-alt', color: '#0048ff' }; // 한글 파일 색상
        case 'txt':
            return { className: 'far fa-file-alt', color: '#333333' };
        case 'zip':
        case 'rar':
        case '7z':
            return { className: 'far fa-file-archive', color: '#ffa000' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
            return { className: 'far fa-file-image', color: '#26a69a' };
        default:
            return { className: 'far fa-file', color: '#666' };
    }
} 

// 테이블 열 너비 조절 기능 초기화
function initializeTableResizing() {
    console.log('테이블 열 너비 조절 기능 초기화 시작');
    const table = document.getElementById('contract-table');
    if (!table) {
        console.error('테이블 요소를 찾을 수 없음');
        return;
    }
    
    const headers = table.querySelectorAll('th');
    if (headers.length === 0) {
        console.error('테이블 헤더를 찾을 수 없음');
        return;
    }
    
    console.log('테이블 헤더 수:', headers.length);
    
    // 이미 추가된 리사이저 제거
    const existingResizers = table.querySelectorAll('.column-resizer');
    existingResizers.forEach(resizer => resizer.remove());
    
    headers.forEach((header, index) => {
        if (index < headers.length - 1) { // 마지막 열에는 리사이저를 추가하지 않음
            // 리사이저 요소 생성
            const resizer = document.createElement('div');
            resizer.classList.add('column-resizer');
            resizer.style.position = 'absolute';
            resizer.style.right = '0';
            resizer.style.top = '0';
            resizer.style.width = '8px';
            resizer.style.height = '100%';
            resizer.style.cursor = 'col-resize';
            resizer.style.zIndex = '1';
            resizer.style.backgroundColor = 'transparent';
            
            // 헤더에 상대 위치 설정
            header.style.position = 'relative';
            header.appendChild(resizer);
            
            // 리사이저에 이벤트 리스너 추가
            let startX, startWidth, nextStartWidth;
            
            resizer.addEventListener('mousedown', function(e) {
                startX = e.pageX;
                startWidth = header.offsetWidth;
                
                // 다음 열의 시작 너비
                const nextHeader = headers[index + 1];
                if (nextHeader) {
                    nextStartWidth = nextHeader.offsetWidth;
                }
                
                // 마우스 이동 및 마우스 업 이벤트 추가
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                
                // 텍스트 선택 방지
                e.preventDefault();
                
                // 리사이저 스타일 변경
                resizer.style.backgroundColor = 'rgba(0, 123, 255, 0.5)';
            });
            
            // 마우스 이동 이벤트 핸들러
            function onMouseMove(e) {
                const diffX = e.pageX - startX;
                
                // 현재 열 너비 조정
                const newWidth = Math.max(50, startWidth + diffX);
                header.style.width = newWidth + 'px';
                
                console.log('열 너비 조정:', index, newWidth);
                
                // 다음 열 너비 조정 (선택 사항)
                // const nextHeader = headers[index + 1];
                // if (nextHeader && nextStartWidth) {
                //     const newNextWidth = Math.max(50, nextStartWidth - diffX);
                //     nextHeader.style.width = newNextWidth + 'px';
                // }
            }
            
            // 마우스 업 이벤트 핸들러
            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // 리사이저 스타일 복원
                resizer.style.backgroundColor = 'transparent';
                
                // 열 너비 저장 (선택 사항)
                // localStorage.setItem('columnWidth_' + index, header.offsetWidth);
            }
            
            // 호버 효과
            resizer.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
            });
            
            resizer.addEventListener('mouseout', function() {
                if (!this.isResizing) {
                    this.style.backgroundColor = 'transparent';
                }
            });
        }
    });
    
    console.log('테이블 열 너비 조절 기능 초기화 완료');
} 

// 계약 저장 (수정하지 않고 저장만 하는 기능)
function saveContract(contract, year) {
    console.log('계약 저장 시작:', contract);
    
    try {
        // 저장할 계약 데이터 복사
        const savedContract = JSON.parse(JSON.stringify(contract));
        
        // 저장 시간 추가
        savedContract.savedAt = new Date().toISOString();
        
        // 로컬 스토리지에서 저장된 계약 목록 가져오기
        let savedContracts = JSON.parse(localStorage.getItem('kbSecSavedContracts')) || {};
        
        // 해당 연도의 저장된 계약 목록이 없으면 생성
        if (!savedContracts[year]) {
            savedContracts[year] = [];
        }
        
        // 이미 저장된 계약인지 확인
        const existingIndex = savedContracts[year].findIndex(c => c.id === savedContract.id);
        
        if (existingIndex !== -1) {
            // 이미 저장된 계약이면 업데이트
            savedContracts[year][existingIndex] = savedContract;
        } else {
            // 새로 저장
            savedContracts[year].push(savedContract);
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem('kbSecSavedContracts', JSON.stringify(savedContracts));
        
        console.log('계약 저장 완료');
        alert('계약이 저장되었습니다.');
    } catch (error) {
        console.error('계약 저장 중 오류:', error);
        alert('계약 저장 중 오류가 발생했습니다.');
    }
} 

// 모달에서 계약 저장 (수정하지 않고 저장만 하는 기능)
function saveContractFromModal(originalContract, year) {
    console.log('모달에서 계약 저장 시작');
    
    try {
        // 폼 데이터 가져오기
        const name = document.getElementById('add-contract-name').value;
        const type = document.getElementById('add-contract-type').value;
        const company = document.getElementById('add-contract-company').value;
        const date = document.getElementById('add-contract-date').value;
        const status = document.getElementById('add-contract-status').value;
        const details = document.getElementById('add-contract-details').value;
        const fileInput = document.getElementById('contract-file-input');
        
        // 필수 입력 확인
        if (!name || !company || !date) {
            alert('계약명, 거래 상대방, 체결일자는 필수 입력 항목입니다.');
            return;
        }
        
        // 저장할 계약 데이터 생성
        const savedContract = {
            ...originalContract,
            name: name,
            type: type,
            company: company,
            date: date,
            status: status,
            details: details,
            savedAt: new Date().toISOString()
        };
        
        // 파일 데이터 처리
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            // 새 파일이 선택된 경우
            const file = fileInput.files[0];
            console.log('새 파일 선택됨:', file.name);
            
            // 파일 읽기
            const reader = new FileReader();
            reader.onload = function(e) {
                // 파일 데이터를 base64로 저장
                savedContract.file = {
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                };
                
                // 저장 완료
                finishSaveContractFromModal(savedContract, year);
            };
            
            // 파일을 base64로 읽기
            reader.readAsDataURL(file);
        } else {
            // 파일이 선택되지 않은 경우, 기존 파일 유지
            finishSaveContractFromModal(savedContract, year);
        }
    } catch (error) {
        console.error('계약 저장 중 오류:', error);
        alert('계약 저장 중 오류가 발생했습니다.');
    }
}

// 모달에서 계약 저장 완료 처리
function finishSaveContractFromModal(savedContract, year) {
    // 로컬 스토리지에서 저장된 계약 목록 가져오기
    let savedContracts = JSON.parse(localStorage.getItem('kbSecSavedContracts')) || {};
    
    // 해당 연도의 저장된 계약 목록이 없으면 생성
    if (!savedContracts[year]) {
        savedContracts[year] = [];
    }
    
    // 이미 저장된 계약인지 확인
    const existingIndex = savedContracts[year].findIndex(c => c.id === savedContract.id);
    
    if (existingIndex !== -1) {
        // 이미 저장된 계약이면 업데이트
        savedContracts[year][existingIndex] = savedContract;
    } else {
        // 새로 저장
        savedContracts[year].push(savedContract);
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem('kbSecSavedContracts', JSON.stringify(savedContracts));
    
    console.log('계약 저장 완료');
    alert('계약이 저장되었습니다.');
    
    // 모달 닫기
    closeAddContractModal();
} 

// 임시저장 처리
function tempSaveContract() {
    console.log('계약 임시저장 시작');
    
    // 폼 데이터 가져오기
    const name = document.getElementById('add-contract-name').value;
    const type = document.getElementById('add-contract-type').value;
    const company = document.getElementById('add-contract-company').value;
    const date = document.getElementById('add-contract-date').value;
    const status = document.getElementById('add-contract-status').value;
    const details = document.getElementById('add-contract-details').value;
    const fileInput = document.getElementById('contract-file-input');
    
    // 계약 ID 생성 (현재 시간 기준)
    const contractId = 'temp_' + Date.now().toString();
    
    // 임시저장 계약 객체 생성
    const tempContract = {
        id: contractId,
        name: name || '(제목 없음)',
        type: type || '',
        company: company || '',
        date: date || '',
        status: status || '',
        details: details || '',
        department: currentUser.department,
        createdAt: new Date().toISOString(),
        isTemp: true
    };
    
    // 파일 데이터 처리
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        
        // 파일 읽기
        const reader = new FileReader();
        reader.onload = function(e) {
            // 파일 데이터를 base64로 저장
            tempContract.file = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            
            finishTempSave(tempContract);
        };
        
        // 파일을 base64로 읽기
        reader.readAsDataURL(file);
    } else {
        finishTempSave(tempContract);
    }
}

// 임시저장 완료 처리
function finishTempSave(tempContract) {
    // 로컬 스토리지에서 임시저장 계약 목록 가져오기
    let tempContracts = JSON.parse(localStorage.getItem('kbSecTempContracts')) || [];
    
    // 임시저장 계약 추가
    tempContracts.push(tempContract);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('kbSecTempContracts', JSON.stringify(tempContracts));
    
    console.log('계약 임시저장 완료:', tempContract);
    
    // 모달 닫기
    document.getElementById('add-contract-modal').style.display = 'none';
    
    // 성공 메시지
    alert('계약이 임시저장되었습니다.');
} 

// 로컬 스토리지 초기화 함수
function resetLocalStorage() {
    console.log('로컬 스토리지 초기화 시작');
    
    // 기존 데이터 백업
    const oldContracts = localStorage.getItem('kbSecContracts');
    
    // 로컬 스토리지 초기화
    localStorage.removeItem('kbSecContracts');
    localStorage.removeItem('kbSecContractNumbers');
    
    // 초기 데이터 설정
    contracts = {};
    contractNumbers = {};
    
    console.log('로컬 스토리지 초기화 완료');
    
    // 현재 연도 계약 목록 다시 로드
    loadContractsByYear(new Date().getFullYear());
    
    alert('계약 데이터가 초기화되었습니다.');
}

// 로그인 체크 함수
function checkLogin() {
    console.log('로그인 체크');
    
    // 로컬 스토리지에서 현재 사용자 정보 로드
    const userData = localStorage.getItem('kbSecCurrentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('로그인 사용자:', currentUser.department);
        
        // 사용자 정보 표시
        document.getElementById('user-name').textContent = currentUser.department + ' 계정';
        
        // 연도 목록 생성 (2025년부터 15년 전까지)
        const yearList = document.getElementById('year-list');
        const currentYear = 2025;
        
        console.log('연도 목록 생성 시작');
        
        for (let i = 0; i < 15; i++) {
            const year = currentYear - i;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = year + '년';
            a.setAttribute('data-year', year);
            a.addEventListener('click', function(e) {
                e.preventDefault();
                loadContractsByYear(year);
            });
            li.appendChild(a);
            yearList.appendChild(li);
            
            // 해당 연도의 계약 데이터가 없으면 초기화
            if (!contracts[year]) {
                contracts[year] = [];
            }
        }
        
        console.log('연도 목록 생성 완료');
        
        // 기본적으로 최신 연도(2025년) 계약 목록 로드
        loadContractsByYear(currentYear);
    } else {
        console.log('로그인되지 않음, 로그인 페이지로 이동');
        window.location.href = 'index.html';
    }
} 

// 계약 추가 모달 표시
function showAddContractModal() {
    // 모달 초기화
    document.getElementById('add-contract-form').reset();
    
    // 오늘 날짜 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('add-contract-date').value = today;
    
    // 파일 업로드 영역 초기화
    const fileArea = document.getElementById('add-contract-file-area');
    if (fileArea) {
        fileArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>파일을 드래그하거나 클릭하여 업로드</span>
            <input type="file" id="contract-file-input" class="file-upload-input" accept=".docx,.doc,.pdf,.xls,.xlsx,.ppt,.pptx,.hwp,.txt">
        `;
    }
    
    // 파일 업로드 영역 이벤트 설정
    setupFileUploadArea();
    
    // 모달 표시
    document.getElementById('add-contract-modal').style.display = 'block';
}

// 계약 추가 모달 닫기
function closeAddContractModal() {
    document.getElementById('add-contract-modal').style.display = 'none';
}

// 계약 상세 모달 표시
function showContractDetailModal(contract, year) {
    // 모달에 계약 정보 설정
    document.getElementById('detail-contract-name').textContent = contract.name;
    document.getElementById('detail-contract-number').textContent = contract.contractNumber || '없음';
    document.getElementById('detail-contract-type').textContent = contract.type || '없음';
    document.getElementById('detail-company').textContent = contract.company || '없음';
    document.getElementById('detail-date').textContent = formatDate(contract.date) || '없음';
    document.getElementById('detail-status').textContent = contract.status || '없음';
    document.getElementById('detail-content').textContent = contract.details || '없음';
    
    // 파일 정보 표시
    const fileInfoElement = document.createElement('div');
    fileInfoElement.classList.add('file-info-container');
    
    if (contract.file) {
        const fileIconInfo = getFileIconInfo(contract.file.name);
        const fileSize = formatFileSize(contract.file.size);
        
        fileInfoElement.innerHTML = `
            <div class="file-info-detail">
                <i class="${fileIconInfo.className}" style="color: ${fileIconInfo.color}; font-size: 24px; margin-right: 10px;"></i>
                <div class="file-info-text">
                    <div class="file-name">${contract.file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <button class="file-download-btn" onclick="downloadContractFile('${contract.id}', '${year}')">
                    <i class="fas fa-download"></i> 다운로드
                </button>
            </div>
        `;
    } else {
        fileInfoElement.innerHTML = '<p>첨부된 파일이 없습니다.</p>';
    }
    
    // 기존 파일 정보 요소 제거
    const existingFileInfo = document.querySelector('.file-info-container');
    if (existingFileInfo) {
        existingFileInfo.remove();
    }
    
    // 파일 정보 요소 추가
    const detailContent = document.getElementById('detail-content');
    detailContent.parentNode.insertBefore(fileInfoElement, detailContent.nextSibling);
    
    // 계약 ID와 연도 저장
    const modal = document.getElementById('contract-detail-modal');
    modal.setAttribute('data-contract-id', contract.id);
    modal.setAttribute('data-contract-year', year);
    
    // 모달 표시
    modal.style.display = 'block';
}

// 계약 상세 모달 닫기
function closeContractDetailModal() {
    document.getElementById('contract-detail-modal').style.display = 'none';
}

// 연도별 계약 목록 로드
function loadContractsByYear(year) {
    console.log('연도별 계약 목록 로드:', year);
    
    // 선택된 연도 표시
    const yearLinks = document.querySelectorAll('#year-list a');
    yearLinks.forEach(link => {
        if (link.getAttribute('data-year') === year) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // 선택된 연도 저장
    selectedYear = year;
    
    // 제목 업데이트
    document.getElementById('selected-year').textContent = year + '년 계약 목록';
    
    // 계약 목록 표시
    displayContracts(year);
}

// 계약 목록 표시
function displayContracts(year) {
    console.log('계약 목록 표시:', year);
    
    // 계약 목록 가져오기
    const yearContracts = contracts[year] || [];
    
    // 검색어
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // 필터링
    let filteredContracts = yearContracts;
    
    // 검색어로 필터링
    if (searchTerm) {
        filteredContracts = filteredContracts.filter(contract => {
            return (
                (contract.name && contract.name.toLowerCase().includes(searchTerm)) ||
                (contract.company && contract.company.toLowerCase().includes(searchTerm)) ||
                (contract.contractNumber && contract.contractNumber.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // 필터 적용
    const filterName = document.getElementById('filter-name').value;
    
    if (filterName) {
        filteredContracts = filteredContracts.filter(contract => contract.name === filterName);
    }
    
    // 계약 목록 테이블 업데이트
    updateContractTable(filteredContracts);
}

// 파일 다운로드
function downloadContractFile(contractId, year) {
    console.log('파일 다운로드 시작:', contractId, year);
    
    // 계약 찾기
    const contract = contracts[year].find(c => c.id === contractId);
    if (!contract || !contract.file) {
        console.error('파일을 찾을 수 없음');
        alert('파일을 찾을 수 없습니다.');
        return;
    }
    
    try {
        // 파일 데이터 가져오기
        const fileData = contract.file.data;
        const fileName = contract.file.name;
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.href = fileData;
        link.download = fileName;
        
        // 링크 클릭하여 다운로드 시작
        document.body.appendChild(link);
        link.click();
        
        // 링크 제거
        document.body.removeChild(link);
        
        console.log('파일 다운로드 완료:', fileName);
    } catch (error) {
        console.error('파일 다운로드 오류:', error);
        alert('파일 다운로드 중 오류가 발생했습니다.');
    }
}

// 계약 목록 테이블 업데이트
function updateContractTable(contracts) {
    const tableBody = document.getElementById('contract-list');
    if (!tableBody) return;
    
    // 테이블 초기화
    tableBody.innerHTML = '';
    
    // 계약이 없는 경우
    if (contracts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="no-data">계약 정보가 없습니다.</td>';
        tableBody.appendChild(row);
        
        // 페이지네이션 숨김
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // 페이지네이션 계산
    const totalPages = Math.ceil(contracts.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = 1;
    }
    
    // 현재 페이지의 계약 목록
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, contracts.length);
    const currentPageContracts = contracts.slice(startIndex, endIndex);
    
    // 계약 목록 표시
    currentPageContracts.forEach((contract, index) => {
        const row = document.createElement('tr');
        
        // 파일 아이콘 HTML
        let fileIconHtml = '-';
        if (contract.file) {
            const fileIconInfo = getFileIconInfo(contract.file.name);
            fileIconHtml = `
                <button class="file-download-btn" onclick="downloadContractFile('${contract.id}', '${selectedYear}')">
                    <i class="${fileIconInfo.className}" style="color: ${fileIconInfo.color};"></i>
                </button>
            `;
        }
        
        // 행 내용 설정
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${contract.contractNumber || '-'}</td>
            <td class="contract-name">
                <a href="#" onclick="showContractDetail('${contract.id}', '${selectedYear}'); return false;">
                    ${contract.name}
                </a>
            </td>
            <td>${formatDate(contract.date)}</td>
            <td>${fileIconHtml}</td>
            <td>
                <button class="edit-btn" onclick="showEditContractModal('${contract.id}', '${selectedYear}'); return false;">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteContract('${contract.id}', '${selectedYear}'); return false;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 페이지네이션 업데이트
    updatePagination(totalPages);
}

// 계약 상세 정보 표시
function showContractDetail(contractId, year) {
    console.log('계약 상세 정보 표시:', contractId, year);
    
    // 계약 찾기
    const contract = contracts[year].find(c => c.id === contractId);
    if (!contract) {
        console.error('계약을 찾을 수 없음');
        alert('계약 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 계약 상세 모달 표시
    showContractDetailModal(contract, year);
} 

// 연도 목록 생성
function createYearList() {
    console.log('연도 목록 생성 시작');
    
    // 연도 목록 요소
    const yearList = document.getElementById('year-list');
    if (!yearList) return;
    
    // 연도 목록 초기화
    yearList.innerHTML = '';
    
    // 현재 연도
    const currentYear = new Date().getFullYear();
    
    // 계약 데이터에서 연도 목록 가져오기
    const contractYears = Object.keys(contracts).map(Number).sort((a, b) => b - a);
    
    // 최근 15년 연도 목록 생성
    for (let i = 0; i < 15; i++) {
        const year = currentYear - i;
        const yearStr = year.toString();
        
        // 연도 목록 항목 생성
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = yearStr + '년';
        a.setAttribute('data-year', yearStr);
        
        // 계약이 있는 연도 강조
        if (contractYears.includes(year)) {
            a.classList.add('has-contracts');
        }
        
        // 클릭 이벤트 설정
        a.addEventListener('click', function(e) {
            e.preventDefault();
            loadContractsByYear(yearStr);
        });
        
        // 목록에 추가
        li.appendChild(a);
        yearList.appendChild(li);
        
        // 해당 연도의 계약 배열이 없으면 초기화
        if (!contracts[yearStr]) {
            contracts[yearStr] = [];
        }
    }
    
    console.log('연도 목록 생성 완료');
}

// 페이지네이션 업데이트
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // 페이지네이션 초기화
    pagination.innerHTML = '';
    
    // 페이지가 1페이지인 경우 페이지네이션 표시하지 않음
    if (totalPages <= 1) return;
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevBtn = document.createElement('a');
        prevBtn.href = '#';
        prevBtn.textContent = '이전';
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage--;
            displayContracts(selectedYear);
        });
        pagination.appendChild(prevBtn);
    }
    
    // 페이지 번호
    const maxPageButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('a');
        pageBtn.href = '#';
        pageBtn.textContent = i;
        
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        
        pageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            displayContracts(selectedYear);
        });
        
        pagination.appendChild(pageBtn);
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('a');
        nextBtn.href = '#';
        nextBtn.textContent = '다음';
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage++;
            displayContracts(selectedYear);
        });
        pagination.appendChild(nextBtn);
    }
}

// 필터 적용
function applyFilters() {
    displayContracts(selectedYear);
}

// 필터 초기화
function resetFilters() {
    // 필터 초기화
    document.getElementById('filter-name').value = '';
    
    // 검색어 초기화
    document.getElementById('search-input').value = '';
    
    // 계약 목록 다시 표시
    displayContracts(selectedYear);
} 

// 계약 수정 모달 표시
function showEditContractModal(contractId, year) {
    console.log('계약 수정 모달 표시:', contractId, year);
    
    // 계약 찾기
    const contract = contracts[year].find(c => c.id === contractId);
    if (!contract) {
        console.error('수정할 계약을 찾을 수 없음');
        alert('수정할 계약 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 계약 ID 저장
    contractId = contract.id;
    selectedYear = year;
    
    // 계약 추가 모달 재사용
    const modal = document.getElementById('add-contract-modal');
    
    // 모달 제목 변경
    modal.querySelector('h2').textContent = '계약 수정';
    
    // 폼 데이터 설정
    document.getElementById('add-contract-name').value = contract.name || '';
    document.getElementById('add-contract-type').value = contract.type || '매매계약';
    document.getElementById('add-contract-company').value = contract.company || '';
    document.getElementById('add-contract-date').value = contract.date ? new Date(contract.date).toISOString().split('T')[0] : '';
    document.getElementById('add-contract-status').value = contract.status || '법무검토 완료';
    document.getElementById('add-contract-details').value = contract.details || '';
    
    // 파일 업로드 영역 초기화
    const fileArea = document.getElementById('add-contract-file-area');
    if (fileArea) {
        if (contract.file) {
            // 기존 파일 정보 표시
            const fileIconInfo = getFileIconInfo(contract.file.name);
            const fileSize = formatFileSize(contract.file.size);
            
            fileArea.innerHTML = `
                <div class="file-info">
                    <i class="${fileIconInfo.className}" style="color: ${fileIconInfo.color}; font-size: 38px; margin-bottom: 10px;"></i>
                    <span class="file-name" style="font-weight: 500; font-size: 14px; margin-bottom: 5px; display: block; text-align: center;">${contract.file.name}</span>
                    <span class="file-size" style="color: #666; font-size: 12px;">${fileSize}</span>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">다른 파일로 변경하려면 클릭하세요.</p>
                </div>
            `;
            
            // 파일 입력 요소 추가 (숨김)
            const input = document.createElement('input');
            input.type = 'file';
            input.id = 'contract-file-input';
            input.className = 'file-upload-input';
            input.style.display = 'none';
            input.accept = '.docx,.doc,.pdf,.xls,.xlsx,.ppt,.pptx,.hwp,.txt';
            fileArea.appendChild(input);
        } else {
            // 파일 없음 - 기본 업로드 영역 표시
            fileArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <span>파일을 드래그하거나 클릭하여 업로드</span>
                <input type="file" id="contract-file-input" class="file-upload-input" accept=".docx,.doc,.pdf,.xls,.xlsx,.ppt,.pptx,.hwp,.txt">
            `;
        }
    }
    
    // 파일 업로드 영역 이벤트 설정
    setupFileUploadArea();
    
    // 제출 버튼 텍스트 변경
    const submitButton = modal.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = '수정';
    }
    
    // 모달 표시
    modal.style.display = 'block';
} 