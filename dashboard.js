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
        
        // 고객사 이름 표시 (고객사명 계정)
        document.getElementById('user-name').textContent = currentUser.companyName + ' 계정';
        
        // 계약 데이터 로드
        loadContractsFromLocalStorage();
        
        // 고객사 전용 UI 설정
        setupCustomerUI();
    } else {
        console.log('로그인되지 않음');
        window.location.href = 'index.html';
    }
    
    // 이벤트 리스너 설정
    setupEventListeners();
});

// 고객사 전용 UI 설정
function setupCustomerUI() {
    // 계약 추가 버튼 숨기기 (이미 HTML에서 제거됨)
    const addContractBtn = document.querySelector('.add-contract-btn');
    if (addContractBtn) {
        addContractBtn.style.display = 'none';
    }
}

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
    
    // 계약 상세 모달 닫기 버튼 이벤트 설정
    const closeContractDetailModalBtn = document.getElementById('close-contract-detail-modal');
    if (closeContractDetailModalBtn) {
        closeContractDetailModalBtn.addEventListener('click', closeContractDetailModal);
    }
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

// 계약 목록 테이블 업데이트
function updateContractTable(contracts) {
    const tableBody = document.getElementById('contract-list');
    if (!tableBody) return;
    
    // 테이블 초기화
    tableBody.innerHTML = '';
    
    // 계약이 없는 경우
    if (contracts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="no-data">계약 정보가 없습니다.</td>';
        tableBody.appendChild(row);
        
        // 페이지네이션 숨김
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // 고객사 ID로 필터링 (현재 로그인한 고객사의 계약만 표시)
    const filteredContracts = contracts.filter(contract => 
        contract.company === currentUser.companyName
    );
    
    // 필터링 후 계약이 없는 경우
    if (filteredContracts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="no-data">귀사의 계약 정보가 없습니다.</td>';
        tableBody.appendChild(row);
        
        // 페이지네이션 숨김
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = 1;
    }
    
    // 현재 페이지의 계약 목록
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredContracts.length);
    const currentPageContracts = filteredContracts.slice(startIndex, endIndex);
    
    // 계약 목록 표시
    currentPageContracts.forEach((contract, index) => {
        const row = document.createElement('tr');
        
        // 계약 상태에 따른 스타일 클래스
        let statusClass = '';
        if (contract.status === '법무검토 완료') {
            statusClass = 'status-review';
        } else if (contract.status === '체결 진행중') {
            statusClass = 'status-progress';
        } else if (contract.status === '체결 완료') {
            statusClass = 'status-complete';
        }
        
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
            <td>${contract.type || '-'}</td>
            <td>${contract.company || '-'}</td>
            <td>${formatDate(contract.date)}</td>
            <td class="${statusClass}">${contract.status || '-'}</td>
            <td>${fileIconHtml}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 페이지네이션 업데이트
    updatePagination(totalPages);
}

// 여기서부터 기존 코드 계속...