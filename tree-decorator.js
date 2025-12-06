// js/tree-decorator.js
document.addEventListener("DOMContentLoaded", () => {
  const treeArea = document.getElementById("tree-area");
  const paletteOrnaments = document.querySelectorAll(
    ".ornament-palette .ornament"
  );
  const resetButton = document.getElementById("reset-button");

  // 메모 모달 관련 요소
  const inputModal = document.getElementById("input-modal");
  const closeInputModalBtn = document.getElementById("close-input-modal");
  const memoInputForm = document.getElementById("memo-input-form");
  const memoInputTextarea = document.getElementById("input-memo-text");

  const viewModal = document.getElementById("view-modal");
  const closeViewModalBtn = document.getElementById("close-view-modal");
  const viewMemoText = document.getElementById("view-memo-text");

  const STORAGE_KEY = "treeDecorations_v2";
  let currentEditingOrnament = null;

  /* ===============================
   *  공통 유틸
   * =============================== */

  function openInputModal(ornament) {
    currentEditingOrnament = ornament;
    memoInputTextarea.value = ornament.dataset.memo || "";
    inputModal.style.display = "block";
    memoInputTextarea.focus();
  }

  function closeInputModal() {
    inputModal.style.display = "none";
    currentEditingOrnament = null;
  }

  function openViewModal(memoText) {
    viewMemoText.textContent = memoText;
    viewModal.style.display = "block";
  }

  function closeViewModal() {
    viewModal.style.display = "none";
  }

  // 바깥 클릭 시 모달 닫기
  window.addEventListener("click", (e) => {
    if (e.target === inputModal) closeInputModal();
    if (e.target === viewModal) closeViewModal();
  });

  closeInputModalBtn.addEventListener("click", closeInputModal);
  closeViewModalBtn.addEventListener("click", closeViewModal);

  memoInputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentEditingOrnament) return;

    const text = memoInputTextarea.value.trim();
    if (text) {
      currentEditingOrnament.dataset.memo = text;
    } else {
      delete currentEditingOrnament.dataset.memo;
    }
    saveState();
    closeInputModal();
  });

  /* ===============================
   *  트리 위 장식 생성 / 드래그
   * =============================== */

  const ORNAMENT_SIZE = 60; // tree.css의 .ornament 크기와 맞춰서 사용

  function createTreeOrnament(type, x, y, memo = "", fromState = false) {
    const ornament = document.createElement("div");
    ornament.className = `ornament ${type}`;
    ornament.dataset.type = type;
    ornament.style.position = "absolute";

    const left = fromState ? x : x - ORNAMENT_SIZE / 2;
    const top = fromState ? y : y - ORNAMENT_SIZE / 2;
    ornament.style.left = `${left}px`;
    ornament.style.top = `${top}px`;

    if (memo) {
      ornament.dataset.memo = memo;
    }

    ornament.addEventListener("mousedown", handleTreeOrnamentMouseDown);
    ornament.addEventListener("click", handleTreeOrnamentClick);
    ornament.addEventListener("dblclick", handleTreeOrnamentDblClick);

    treeArea.appendChild(ornament);
    return ornament;
  }

  function handleTreeOrnamentMouseDown(e) {
    if (e.button !== 0) return;
    const ornament = e.currentTarget;
    const treeRect = treeArea.getBoundingClientRect();
    const ornamentRect = ornament.getBoundingClientRect();

    const offsetX = e.clientX - ornamentRect.left;
    const offsetY = e.clientY - ornamentRect.top;

    let moved = false;

    function onMouseMove(ev) {
      moved = true;
      const x = ev.clientX - treeRect.left - offsetX;
      const y = ev.clientY - treeRect.top - offsetY;
      ornament.style.left = `${x}px`;
      ornament.style.top = `${y}px`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (moved) {
        ornament.dataset.movedRecently = "1";
        setTimeout(() => {
          delete ornament.dataset.movedRecently;
        }, 0);
        saveState();
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    e.preventDefault();
  }

  // 클릭: 메모가 있으면 보기 모달
  function handleTreeOrnamentClick(e) {
    const ornament = e.currentTarget;
    if (ornament.dataset.movedRecently === "1") return;
    const memo = ornament.dataset.memo;
    if (!memo) return;
    openViewModal(memo);
  }

  // 더블클릭: 메모 작성/수정
  function handleTreeOrnamentDblClick(e) {
    const ornament = e.currentTarget;
    openInputModal(ornament);
  }

  /* ===============================
   *  팔레트 → 트리 추가
   * =============================== */

  // 1) 팔레트 장식을 클릭하면 트리 가운데에 추가
  paletteOrnaments.forEach((item) => {
    const type = item.dataset.type;
    item.addEventListener("click", () => {
      const rect = treeArea.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      createTreeOrnament(type, centerX, centerY);
      saveState();
    });
  });

  // 2) 드래그해서 추가
  paletteOrnaments.forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", item.dataset.type);
    });
  });

  treeArea.addEventListener("dragover", (e) => {
    e.preventDefault(); // drop 허용
  });

  treeArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (!type) return;

    const rect = treeArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createTreeOrnament(type, x, y);
    saveState();
  });

  /* ===============================
   *  상태 저장 / 복원 (localStorage)
   * =============================== */

  function saveState() {
    const ornaments = Array.from(
      treeArea.querySelectorAll(".ornament")
    ).map((ornament) => {
      const type = ornament.dataset.type || "";
      return {
        type,
        left: parseFloat(ornament.style.left) || 0,
        top: parseFloat(ornament.style.top) || 0,
        memo: ornament.dataset.memo || "",
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ornaments));
    } catch (e) {
      console.warn("트리 상태 저장 실패:", e);
    }
  }

  function restoreState() {
    let data = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      data = JSON.parse(raw);
    } catch (e) {
      console.warn("트리 상태 불러오기 실패:", e);
      return;
    }

    if (!Array.isArray(data)) return;

    data.forEach((item) => {
      createTreeOrnament(
        item.type,
        item.left,
        item.top,
        item.memo,
        true // fromState
      );
    });
  }

  /* ===============================
   *  모두 지우기
   * =============================== */

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const ornamentsOnTree = treeArea.querySelectorAll(".ornament");
      ornamentsOnTree.forEach((o) => o.remove());
      localStorage.removeItem(STORAGE_KEY);
    });
  }

  /* ===============================
   *  초기 복원
   * =============================== */
  restoreState();
});
