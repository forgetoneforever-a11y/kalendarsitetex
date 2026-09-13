// Глобальный скрипт фонов для мгновенной синхронизации без моргания
function renderBackground(dataUrl, fileType = '') {
    const bgContainer = document.getElementById('bgContainer');
    if (!bgContainer) return;
    
    // Если фон уже отрисован и это то же самое видео, не пересоздаем его (избегаем перезапуска видео)
    if (bgContainer.dataset.loaded === "true" && bgContainer.dataset.src === dataUrl) return;

    bgContainer.innerHTML = '';
    bgContainer.dataset.loaded = "true";
    bgContainer.dataset.src = dataUrl || "default";

    if (dataUrl) {
        const isVideo = fileType.startsWith('video') || (typeof dataUrl === 'string' && (dataUrl.includes('data:video') || dataUrl.endsWith('.mp4')));
        if (isVideo) {
            const video = document.createElement('video');
            video.src = dataUrl;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);';
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
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; transform: scale(1.02);';
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

// Запускаем чтение из IndexedDB немедленно
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
