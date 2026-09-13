// Молниеносное появление страницы (50мс)
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.05s ease-out";
    setTimeout(() => {
        document.body.style.opacity = "1";
    }, 10);

    // Моментальный перехват кликов для быстрого перехода без задержек
    document.querySelectorAll('.nav-menu a, .logo').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            e.preventDefault();
            document.body.style.opacity = "0";
            setTimeout(() => {
                window.location.href = href;
            }, 50); // Мгновенный переход за 50мс
        });
    });
});

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
            
            // Восстанавливаем то же время воспроизведения при переходе между вкладками
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
