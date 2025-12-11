# 🎄 Christmas Event Webpage
> **다가오는 크리스마스를 기다리며 즐기는 종합 선물 세트 같은 웹페이지입니다.**

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-FF0000?style=for-the-badge&logo=firebase)](https://christmastree-dccfb.web.app/index.html)
<br/>
<img src="https://img.shields.io/badge/Christmas-D--Day-green?style=flat-square"/>
<img src="https://img.shields.io/badge/Event-Letter_%26_Game-red?style=flat-square"/>

</div>

<br/>

## 📖 프로젝트 소개
**'크리스마스 이벤트 웹페이지'**는 사용자가 크리스마스 시즌을 더욱 풍성하게 즐길 수 있도록 제작되었습니다.
편지 쓰기, 트리 꾸미기, 미니게임 등 다양한 인터랙티브 기능을 통해 따뜻한 연말 분위기를 웹상에서 경험할 수 있습니다.

**🔗 서버 주소:** [https://christmastree-dccfb.web.app/index.html](https://christmastree-dccfb.web.app/index.html)

<br/>

## 🛠 사용 기술 (Tech Stack)
* **Frontend:** HTML5, CSS3, JavaScript
* **Backend / DB:** Firebase (Real-time Database)
* **API:** EmailJS

<br/>

## ✨ 주요 기능 (Key Features)

### 1. 🌐 공통 기능 (Global)
모든 페이지에서 크리스마스 분위기를 느낄 수 있는 기능입니다. 우측 하단 버튼으로 제어 가능합니다.

| 아이콘 | 기능 | 설명 |
| :---: | :---: | :--- |
| 🔈/🔊 | **BGM** | 크리스마스 캐롤을 재생하거나 음소거할 수 있습니다. |
| ☁️/❄️ | **Snow** | 화면 전체에 눈이 내리는 효과를 켜거나 끌 수 있습니다. |

<br/>

### 2. 🏠 메인 페이지 (Main)
* **D-Day 카운트다운:** 크리스마스까지 남은 시간을 실시간으로 보여줍니다.
* **이벤트 네비게이션:** 각 이벤트 페이지로 이동할 수 있는 직관적인 카드형 버튼을 제공합니다.

<br/>

### 3. 💌 편지 보내기 (Letter)
> **EmailJS**를 활용하여 페이지 이탈 없이 실제 이메일을 전송합니다.

* **커스터마이징:** 사용자가 원하는 편지지 색상을 직접 선택할 수 있습니다.
* **실시간 전송:** 작성한 이름, 제목, 내용이 받는 사람의 메일함으로 즉시 전송됩니다.

<br/>

### 4. 🎄 트리 꾸미기 (Decorate Tree)
> **Firebase**를 연동하여 친구들과 트리를 공유해 보세요.

* **Drag & Drop:** 트리 장식을 원하는 위치에 자유롭게 배치할 수 있습니다.
* **메모 기능:** 장식을 트리에 놓으면 메시지를 작성할 수 있으며, 클릭 시 다시 확인 가능합니다.
* **삭제 기능:** 쓰레기통 아이콘으로 불필요한 장식을 삭제할 수 있습니다.
* **데이터 저장:** 꾸민 트리는 저장되며, 다른 사용자와 공유하여 함께 볼 수 있습니다.

<br/>

### 5. 🎮 미니 게임 (Mini Games)
크리스마스 테마의 3가지 미니게임을 즐기고 랭킹에 도전하세요.

* **게임 종류:**
    1. 🎁 **하늘에서 선물 받기**
    2. 🎅 **산타 피하기**
    3. ❄️ **눈송이 클릭**
* **랭킹 시스템:** Firebase를 이용해 최고 기록을 갱신하고 다른 사용자와 경쟁할 수 있습니다.

<br/>

## ⚠️ 참고 사항
* **랭킹/트리 공유:** Firebase 데이터베이스를 사용하므로 네트워크 상태가 불안정할 경우 데이터 로드에 지연이 발생할 수 있습니다.
* **모바일/PC:** 본 페이지는 [PC/모바일 등 최적화된 환경 기재]에서 가장 잘 작동합니다.

---
<p align="center">Copyright 2024. All rights reserved.</p>
