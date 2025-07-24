// 로컬 스토리지 초기화 및 테스트 데이터 추가
(function() {
    console.log('로컬 스토리지 초기화 시작');
    
    // 사용자 데이터 초기화 (로그인 문제 해결)
    // 기본 사용자만 남기고 모든 회원가입 정보 초기화
    const users = [
        { id: 'admin', password: 'admin', department: '관리자', isAdmin: true },
        { id: 'legal', password: 'legal', department: '법무팀', isAdmin: false },
        { id: 'sales1', password: 'sales1', department: '영업1팀', isAdmin: false },
        { id: 'sales2', password: 'sales2', department: '영업2팀', isAdmin: false },
        { id: 'sales3', password: 'sales3', department: '영업3팀', isAdmin: false }
    ];
    
    // 현재 사용자 설정
    const currentUser = {
        id: 'admin',
        department: '법무팀',
        isAdmin: true
    };
    
    // 계약 데이터 초기화
    const contracts = {
        2025: [
            {
                id: '1689123456789',
                contractNumber: 'KB-20250101-001',
                name: '테스트 계약서',
                type: '매매계약',
                company: '테스트 회사',
                date: '2025-01-01',
                status: '법무검토 완료',
                details: '테스트 계약 내용입니다.',
                department: '법무팀',
                createdAt: '2025-01-01T00:00:00.000Z',
                file: {
                    name: '테스트_계약서.pdf',
                    type: 'application/pdf',
                    size: 12345,
                    data: 'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSAxMCAwIFI+Pi9Qcm9jU2V0WzIgMCBSIDMgMCBSIDUgMCBSXT4+L01lZGlhQm94WzAgMCA1OTUgODQyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCAxNTI+PnN0cmVhbQowLjU3IHcKMCBHCkJUCi9GMSAxNiBUZgoxMjAgNzAwIFRkCihUaGlzIGlzIGEgdGVzdCBQREYgZG9jdW1lbnQpIFRqCkVUCkJUCi9GMSAxMiBUZgoxMjAgNjgwIFRkCihKdXN0IGEgc2ltcGxlIHRlc3QgZG9jdW1lbnQgZm9yIHRlc3RpbmcgcHVycG9zZXMuKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjEwIDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL05hbWUvRjEvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iagp4cmVmCjAgMTEKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE3IDAwMDAwIG4gCjAwMDAwMDAwNjYgMDAwMDAgbiAKMDAwMDAwMDEyMyAwMDAwMCBuIAowMDAwMDAwMjcxIDAwMDAwIG4gCjAwMDAwMDA0NzUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDExL1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNTkyCiUlRU9GCg=='
                }
            }
        ]
    };
    
    // 계약 번호 데이터 초기화
    const contractNumbers = {
        '20250101': 1
    };
    
    // 로컬 스토리지에 저장
    localStorage.setItem('kbSecUsers', JSON.stringify(users));
    localStorage.setItem('kbSecCurrentUser', JSON.stringify(currentUser));
    localStorage.setItem('kbSecContracts', JSON.stringify(contracts));
    localStorage.setItem('kbSecContractNumbers', JSON.stringify(contractNumbers));
    
    console.log('로컬 스토리지 초기화 완료');
    console.log('회원가입 정보 초기화 완료');
    console.log('테스트 계약 데이터 추가 완료');
    console.log('페이지를 새로고침하세요.');
})(); 
