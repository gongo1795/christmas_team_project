// js/tree-decorator.js

document.addEventListener('DOMContentLoaded', () => {
    const treeArea = document.getElementById('tree-area');
    const resetButton = document.getElementById('reset-button');

    const inputModal = document.getElementById('input-modal');
    const viewModal = document.getElementById('view-modal');
    const inputForm = document.getElementById('memo-input-form');
    const inputMemoText = document.getElementById('input-memo-text');
    const viewMemoText = document.getElementById('view-memo-text');

    const closeInputModal = document.getElementById('close-input-modal');
    const closeViewModal = document.getElementById('close-view-modal');

    let draggedData = null;
    let memoDropPosition = { left: 0, top: 0, type: null };
    let currentZIndex = 10;
    let unsubscribe = null;

    const ornamentsCollection = () =>
        window.db ? window.db.collection('tree-ornaments') : null;

    function ensureDb() {
        if (!window.db) {
            alert('Firebase 설정이 필요합니다. tree-decorator.html의 firebaseConfig를 확인해주세요.');
            return false;
        }
        return true;
    }

    // -----------------------------
    // 장식 DOM 생성 & 드래그(위치 이동)
    // -----------------------------
    function createOrnamentElement(id, data) {
        const ornament = document.createElement('div');
        ornament.classList.add('ornament', data.type); // type: bell / cookie / ...
        ornament.setAttribute('data-id', id);
        ornament.style.zIndex = data.zIndex || 10;

        if (data.memo) {
            ornament.setAttribute('data-memo', data.memo);
            ornament.addEventListener('click', () => {
                viewMemoText.textContent = data.memo;
                viewModal.style.display = 'block';
            });
        }

        addDragListeners(ornament, id);
        return ornament;
    }

    function addDragListeners(ornament, docId) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        ornament.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;

            const rect = ornament.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            ornament.style.cursor = 'grabbing';
            ornament.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const treeRect = treeArea.getBoundingClientRect();
            const newX = e.clientX - treeRect.left - offset.x;
            const newY = e.clientY - treeRect.top - offset.y;

            let newLeftPercent = (newX / treeRect.width) * 100;
            let newTopPercent = (newY / treeRect.height) * 100;

            newLeftPercent = Math.max(0, Math.min(100, newLeftPercent));
            newTopPercent = Math.max(0, Math.min(100, newTopPercent));

            ornament.style.left = `${newLeftPercent}%`;
            ornament.style.top = `${newTopPercent}%`;
        });

        document.addEventListener('mouseup', async () => {
            if (!isDragging) return;
            isDragging = false;
            ornament.style.cursor = 'grab';
            ornament.style.transition = '';

            const left = ornament.style.left;
            const top = ornament.style.top;
            const newZ = currentZIndex + 1;
            currentZIndex = newZ;
            ornament.style.zIndex = newZ;

            if (!ensureDb()) return;
            try {
                await ornamentsCollection().doc(docId).update({ left, top, zIndex: newZ });
            } catch (error) {
                console.error('Failed to update position', error);
                alert('위치를 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
            }
        });
    }

    // -----------------------------
    // 왼쪽 팔레트 → 드래그해서 트리로
    // -----------------------------
    document.querySelectorAll('.ornaments-list .ornament').forEach((paletteOrnament) => {
        // div도 드래그가 되도록 설정
        paletteOrnament.setAttribute('draggable', 'true');

        paletteOrnament.addEventListener('dragstart', (e) => {
            const type = paletteOrnament.getAttribute('data-type');
            draggedData = { type };
            e.dataTransfer.setData('text/plain', type);
        });
    });

    treeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    treeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!draggedData || !draggedData.type) return;

        const rect = treeArea.getBoundingClientRect();
        const dropX = ((e.clientX - rect.left) / rect.width) * 100;
        const dropY = ((e.clientY - rect.top) / rect.height) * 100;

        memoDropPosition = {
            type: draggedData.type,
            left: `${dropX}%`,
            top: `${dropY}%`,
        };

        inputModal.style.display = 'block';
        inputMemoText.value = '';
        inputMemoText.focus();

        draggedData = null;
    });

    // -----------------------------
    // 메모 입력 & 저장
    // -----------------------------
    inputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const memo = inputMemoText.value.trim();
        if (!memo) {
            alert('메모 내용을 입력해주세요.');
            return;
        }
        await addOrnamentToTree(
            memoDropPosition.type,
            memoDropPosition.left,
            memoDropPosition.top,
            memo
        );
        inputModal.style.display = 'none';
    });

    async function addOrnamentToTree(type, left, top, memo) {
        if (!ensureDb()) return;

        currentZIndex += 1;
        const payload = {
            type,          // bell / cookie / ...
            left,
            top,
            memo,
            zIndex: currentZIndex,
            createdAt: window.firestoreTimestamp
                ? window.firestoreTimestamp()
                : Date.now(),
        };

        try {
            await ornamentsCollection().add(payload);
        } catch (error) {
            console.error('Failed to add ornament', error);
            alert('장식을 추가하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    // -----------------------------
    // 트리 전체 리셋
    // -----------------------------
    resetButton.addEventListener('click', async () => {
        if (!ensureDb()) return;
        if (!confirm('트리의 모든 장식과 메모를 초기화할까요?')) return;

        try {
            const snapshot = await ornamentsCollection().get();
            const batch = window.db.batch();
            snapshot.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            treeArea.innerHTML = '<div class="main-tree"></div>';
            currentZIndex = 10;
            alert('트리가 초기화되었습니다.');
        } catch (error) {
            console.error('Failed to reset tree', error);
            alert('초기화 중 오류가 발생했습니다.');
        }
    });

    // -----------------------------
    // Firestore 실시간 동기화
    // -----------------------------
    function startRealtimeSync() {
        if (!ensureDb()) return;
        if (unsubscribe) unsubscribe();

        unsubscribe = ornamentsCollection()
            .orderBy('createdAt')
            .onSnapshot(
                (snapshot) => {
                    treeArea.innerHTML = '<div class="main-tree"></div>';
                    let maxZ = 10;

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const ornament = createOrnamentElement(doc.id, data);
                        ornament.style.left = data.left;
                        ornament.style.top = data.top;
                        ornament.style.zIndex = data.zIndex || 10;
                        treeArea.appendChild(ornament);
                        if (data.zIndex && data.zIndex > maxZ) {
                            maxZ = data.zIndex;
                        }
                    });

                    currentZIndex = maxZ;
                },
                (error) => {
                    console.error('Realtime sync error', error);
                    alert('실시간 동기화 중 오류가 발생했습니다.');
                }
            );
    }

    // -----------------------------
    // 모달 닫기 처리
    // -----------------------------
    closeInputModal.onclick = () => {
        inputModal.style.display = 'none';
    };
    closeViewModal.onclick = () => {
        viewModal.style.display = 'none';
    };

    window.addEventListener('click', (event) => {
        if (event.target === inputModal) {
            inputModal.style.display = 'none';
        }
        if (event.target === viewModal) {
            viewModal.style.display = 'none';
        }
    });

    // 시작 시 기존 장식들 불러오기
    startRealtimeSync();
});
