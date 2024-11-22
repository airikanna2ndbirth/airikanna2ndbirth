let currentResultIndex = 0;
let searchResults = [];

function initializeWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    const closeBtn = document.getElementById('welcomeCloseBtn');

    // 3초 후에 닫기 버튼 표시
    setTimeout(() => {
        closeBtn.style.display = 'inline-block';
    }, 1500);

    // 닫기 버튼 클릭 이벤트
    closeBtn.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
    }, 1500);

    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function searchSponsor() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    if (searchTerm === '') {
        showNotification('검색어를 입력해주세요.');
        return;
    }

    const tables = document.getElementsByClassName('sponsor-table');
    searchResults = [];
    currentResultIndex = 0;

    for (let t = 0; t < tables.length; t++) {
        const cells = tables[t].getElementsByTagName('td');

        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.remove('highlight');
            const cellContent = cells[i].textContent.toLowerCase();
            if (cellContent.includes(searchTerm)) {
                searchResults.push(cells[i]);
            }
        }
    }

    if (searchResults.length > 0) {
        highlightResult(0);
        showResultNavigation();
    } else {
        showNotification('검색 결과가 없습니다.');
        hideResultNavigation();
    }
}

function highlightResult(index) {
    searchResults.forEach(cell => cell.classList.remove('highlight'));
    searchResults[index].classList.add('highlight');
    searchResults[index].scrollIntoView({behavior: 'smooth', block: 'center'});
    updateResultCount();
}

function showResultNavigation() {
    const nav = document.getElementById('resultNavigation');
    nav.style.display = 'block';
    updateResultCount();
}

function hideResultNavigation() {
    const nav = document.getElementById('resultNavigation');
    nav.style.display = 'none';
}

function updateResultCount() {
    const countSpan = document.getElementById('resultCount');
    countSpan.textContent = `${currentResultIndex + 1} / ${searchResults.length}`;
}

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}

function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    const images = document.querySelectorAll('.sponsor-image');
    images.forEach(img => observer.observe(img));
}

async function loadSponsors() {
    try {
        const response = await fetch('sponsors.json');
        const data = await response.json();
        const container = document.getElementById('sponsorContainer');

        data.groups.forEach((group, index) => {
            const section = document.createElement('div');
            section.className = 'sponsor-section';

            if (index === 0) {
                // 첫 번째 그룹에는 새로운 유튜브 비디오 추가
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-container';
                videoContainer.innerHTML = `
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/gq3gzxPBOK0?si=SgkJyFoGgfSnVEs6"
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen>
                    </iframe>
                `;
                section.appendChild(videoContainer);

                // 네비게이션 버튼과 검색바 추가
                const navButtons = document.createElement('div');
//                navButtons.className = 'nav-buttons';
//                navButtons.innerHTML = `
//                    <button class="nav-button" onclick="window.open('', '_blank')">링크1</button>
//                    <button class="nav-button" onclick="window.open('', '_blank')">링크2</button>
//                    <button class="nav-button" onclick="window.open('', '_blank')">링크3</button>
//                `;

                const searchContainer = document.createElement('div');
                searchContainer.className = 'search-container';
                searchContainer.innerHTML = `
                    <input type="text" id="searchInput" placeholder="닉네임으로 검색...">
                    <button id="searchButton">검색</button>
                `;

                section.appendChild(navButtons);
                section.appendChild(searchContainer);
            } else {
                // 나머지 그룹은 기존처럼 이미지 표시
                const imageDiv = document.createElement('div');
                imageDiv.className = 'sponsor-image';
                const img = document.createElement('img');
                img.src = group.image;
                img.alt = `사진 ${index + 1}`;
                img.className = 'cover-image';
                imageDiv.appendChild(img);
                section.appendChild(imageDiv);
            }

            const table = document.createElement('table');
            table.className = 'sponsor-table';

            // 후원자 이름을 3열로 나누어 표시
            for (let i = 0; i < group.sponsors.length; i += 3) {
                const row = table.insertRow();
                for (let j = 0; j < 3; j++) {
                    if (i + j < group.sponsors.length) {
                        const cell = row.insertCell();
                        cell.textContent = group.sponsors[i + j];
                    }
                }
            }

            section.appendChild(table);
            container.appendChild(section);
        });

        wrapNicknamesInSpan();
        setupIntersectionObserver();

        // 검색 기능 초기화
        document.getElementById('searchButton').addEventListener('click', searchSponsor);
        document.getElementById('searchInput').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchSponsor();
            }
        });
    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

function wrapNicknamesInSpan() {
    const cells = document.querySelectorAll('.sponsor-table td');
    cells.forEach(cell => {
        const nickname = cell.textContent;
        cell.innerHTML = `<span class="nickname">${nickname}</span>`;
    });
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        topButton.style.opacity = "1";
    } else {
        topButton.style.opacity = "0";
    }
}

// 이벤트 리스너 설정
function initializeEventListeners() {

    initializeWelcomeOverlay();

    // 이전 및 다음 결과 버튼 이벤트 리스너
    document.getElementById('prevResult').addEventListener('click', function() {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    document.getElementById('nextResult').addEventListener('click', function() {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex + 1) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    // 닫기 버튼 이벤트 리스너 추가
    document.getElementById('closeNavigation').addEventListener('click', function() {
        hideResultNavigation();
        // 하이라이트 제거
        searchResults.forEach(cell => cell.classList.remove('highlight'));
        searchResults = [];
        currentResultIndex = 0;
    });

    // Top 버튼 이벤트 리스너
    const topButton = document.getElementById("topButton");
    topButton.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', scrollFunction);

    // 페이지 로드 시 후원자 데이터 불러오기
    window.addEventListener('load', loadSponsors);
}

// 초기화 함수 실행
initializeEventListeners();