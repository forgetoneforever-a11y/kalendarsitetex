// Показываем красивый индикатор загрузки («Ожидание...») при переходе
(function() {
    // Создаем элемент лоадера прямо в DOM
    const loader = document.createElement('div');
    loader.id = 'pageTransitionLoader';
    loader.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #60a5fa; border-radius: 50%; animation: spinLoader 0.6s linear infinite;"></div>
            <span style="font-size: 0.9rem; color: #94a3b8; font-family: system-ui, sans-serif; letter-spacing: 0.5px;">Загрузка...</span>
        </div>
        <style>
            @keyframes spinLoader { to { transform: rotate(360deg); } }
        </style>
    `;
    loader.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(11, 15, 25, 0.7);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
    `;
    document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(loader);

        // Плавное появление страницы при загрузке
        setTimeout(() => {
            loader.style.opacity = "0";
        }, 100);
    });

    // Перехват кликов по меню с активацией лоадера
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-menu a, .logo');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;

        e.preventDefault();
        loader.style.opacity = "1"; // Мгновенно показываем красивый экран ожидания
        
        setTimeout(() => {
            window.location.href = href;
        }, 120); // Небольшая задержка для плавности анимации
    });
})();

// Глобальная отрисовка фона с сохранением времени видео в sessionStorage
function renderBackground(dataUrl, fileType = '') {
    const bgContainer = document.getElementById('bgContainer');
    if (!bgContainer) return;

    bgContainer.innerHTML = '';

    if (dataUrl) {
        const isVideo = fileType.startsWith('video') || (typeof dataUrl === 'string' && (dataUrl.includes('data:video') || dataUrl.endsWith('.mp4')));
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = dataUrl;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);';
            
            const savedTime = sessionStorage.getItem('bgVideoTime');
            if (savedTime) {
                video.currentTime = parseFloat(savedTime);
            }

            video.play().catch(() => {});

            video.addEventListener('timeupdate', () => {
                sessionStorage.setItem('bgVideoTime', video.currentTime);
            });

            bgContainer.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);';
            bgContainer.appendChild(img);
        }
    } else {
        const video = document.createElement('video');
        video.src = 'assets/background.mp4';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);';
        
        const savedTime = sessionStorage.getItem('bgVideoTime');
        if (savedTime) {
            video.currentTime = parseFloat(savedTime);
        }
        video.play().catch(() => {});

        video.addEventListener('timeupdate', () => {
            sessionStorage.setItem('bgVideoTime', video.currentTime);
        });

        bgContainer.appendChild(video);
    }
}

async function saveBackgroundToDB(bgData) {
    return new Promise((resolve) => {
        const dbOpen = indexedDB.open('OrganizerDB', 2);
        dbOpen.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
        };
        dbOpen.onsuccess = () => {
            const db = dbOpen.result;
            const tx = db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            store.put(bgData, 'backgroundData');
            tx.oncomplete = () => resolve(true);
        };
    });
}

// Загрузка фона из IndexedDB при старте любой страницы
(function loadBackgroundFromDB() {
    const dbOpen = indexedDB.open('OrganizerDB', 2);
    dbOpen.onsuccess = () => {
        const db = dbOpen.result;
        if (!db.objectStoreNames.contains('files')) return;
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const req = store.get('backgroundData');
        req.onsuccess = () => {
            if (req.result) {
                renderBackground(req.result.data, req.result.type);
            } else {
                renderBackground(null);
            }
        };
    };
    dbOpen.onerror = () => renderBackground(null);
})();
