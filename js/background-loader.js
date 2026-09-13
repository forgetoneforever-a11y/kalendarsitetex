// Универсальный загрузчик фона для всех страниц
(function() {
    // Создаем контейнер для фона, если его еще нет на странице
    let bgContainer = document.getElementById('bgContainer');
    if (!bgContainer) {
        bgContainer = document.createElement('div');
        bgContainer.id = 'bgContainer';
        bgContainer.style.cssText = 'position: fixed; inset: 0; z-index: -2; overflow: hidden;';
        document.body.prepend(bgContainer);
    }

    // Создаем подложку-затемнение, если её нет
    let overlay = document.querySelector('.video-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.style.cssText = 'position: fixed; inset: 0; z-index: -1; background: rgba(11, 15, 25, 0.85);';
        document.body.insertBefore(overlay, bgContainer.nextSibling);
    }

    // Применяем сохраненный шрифт и свечение
    const savedFont = localStorage.getItem('appFontStyle') || 'modern';
    document.body.classList.add(`font-${savedFont}`);

    const savedGlow = localStorage.getItem('appGlow') === 'true';
    const savedGlowColor = localStorage.getItem('appGlowColor') || 'blue';
    const savedCustomColor = localStorage.getItem('appCustomGlowColor') || '#3b82f6';

    if (savedGlow && savedGlowColor !== 'none') {
        document.body.classList.add('glow-enabled', `glow-${savedGlowColor}`);
    }

    if (savedGlowColor === 'custom') {
        let r = parseInt(savedCustomColor.slice(1, 3), 16) || 59;
        let g = parseInt(savedCustomColor.slice(3, 5), 16) || 130;
        let b = parseInt(savedCustomColor.slice(5, 7), 16) || 246;
        document.documentElement.style.setProperty('--custom-glow-border', `rgba(${r}, ${g}, ${b}, 0.5)`);
        document.documentElement.style.setProperty('--custom-glow-shadow', `rgba(${r}, ${g}, ${b}, 0.35)`);
    }

    // Функция отрисовки фона
    function renderBackground(dataUrl, fileType = '') {
        bgContainer.innerHTML = '';
        if (dataUrl) {
            const isVideo = fileType.startsWith('video') || (typeof dataUrl === 'string' && (dataUrl.includes('data:video') || dataUrl.endsWith('.mp4')));
            
            if (isVideo) {
                const video = document.createElement('video');
                video.src = dataUrl;
                video.autoplay = true;
                video.muted = true;
                video.loop = true;
                video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                bgContainer.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = dataUrl;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
                bgContainer.appendChild(img);
            }
        } else {
            const video = document.createElement('video');
            video.src = 'assets/background.mp4';
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
            bgContainer.appendChild(video);
        }
    }

    // Читаем фон из IndexedDB на каждой странице
    const dbPromise = indexedDB.open('OrganizerDB', 2);
    dbPromise.onsuccess = () => {
        const db = dbPromise.result;
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
    dbPromise.onerror = () => {
        renderBackground(null);
    };
})();
