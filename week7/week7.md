# 7주차 과제 — 전역 조명과 Ray Tracing·Path Tracing

## 1. 실습 1 — 기본 Ray Tracing으로 일식·월식 구현

### 1.1 공전 위치와 그림자 광선

위성의 공전 위치가 **0°**일 때는 별–위성–행성 순서로 배치되어 일식이, **약 180°**일 때는 별–행성–위성 순서로 배치되어 월식이 발생한다. 그림자 광선은 표면에서 별 방향으로 광선을 보내 다른 천체가 빛을 가리는지 확인하고, 가려진 곳의 직접광을 제외하는 역할을 한다.

### 1.2 일식·월식 비교

**① 일식 — 공전 위치 0°**

그림자 광선을 켜면 위성 그림자가 행성에 나타나고, 끄면 해당 그림자가 사라진다.

![일식 — 그림자 광선 켬](images/01_task1_solar_shadow_on.png)

![일식 — 그림자 광선 끔](images/02_task1_solar_shadow_off.png)

**② 월식 — 공전 위치 약 180°**

그림자 광선을 켜면 행성 뒤의 위성이 어두워지고, 끄면 다시 밝아진다.

![월식 — 그림자 광선 켬](images/03_task1_lunar_shadow_on.png)

![월식 — 그림자 광선 끔](images/04_task1_lunar_shadow_off.png)

### 1.3 실행 주소

https://iju0777-lab.github.io/cg_solar/week7/task1.html

---

## 실습 2. 기기별 렌더링 성능 비교

### 1. 기기별 성능 측정

| 기기·브라우저·조건 | 설정 (해상도 / 표본 / 반사 / 고급 효과) | Local | Ray tracing | Path tracing | 화질·반응 관찰 |
|---|---|---:|---:|---:|---|
| 노트북 Chrome · 공통 | 640×360 / 8 / 2 / 켬 | 0.15 ms | 0.38 ms | 5.65 ms | 기본 화질에서 빠르게 렌더링됨 |
| iPhone Safari · 공통 | 640×360 / 8 / 2 / 켬 | 1 ms | 2 ms | 5 ms | Path tracing에서 노이즈가 관찰됨 |
| 노트북 Chrome · 고부하 | 1920×1080 / 8 / 2 / 켬 | 1.00 ms | 3.86 ms | 43.85 ms | 해상도 증가로 렌더링 시간 증가 |
| iPhone Safari · 고부하 | 1920×1080 / 8 / 2 / 켬 | 1 ms | 4 ms | 36 ms | 고해상도에서 Path tracing 처리 시간 증가 |
| 노트북 Chrome · 적정 | 960×540 / 16 / 2 / 켬 | 0.19 ms | 0.54 ms | 10.70 ms | 화질과 처리 시간의 균형을 고려 |
| iPhone Safari · 적정 | 640×360 / 8 / 2 / 켬 | 1 ms | 2 ms | 5 ms | 모바일 환경에서 처리 부담을 낮춤 |

※ 측정값은 각 브라우저에서 표시된 실행 시간이며, 브라우저별 측정 방식의 차이가 있을 수 있다. GPU 모델은 확인 불가.

### 2. 결과 분석

Local 방식은 가장 빠르지만 그림자와 반사 표현이 단순했다. Ray tracing은 비교적 짧은 처리 시간으로 반사를 표현했으며, Path tracing은 간접광과 색 반사를 표현하는 대신 가장 긴 시간이 필요했다.

해상도와 표본 수가 증가할수록 특히 Path tracing의 처리 시간이 증가했다. 따라서 노트북은 화질을 고려하여 960×540 해상도와 16표본을 선택하고, iPhone은 처리 부담을 줄이기 위해 640×360 해상도와 8표본을 선택하였다. 두 기기 모두 최대 반사 2회와 고급 효과 켬을 유지하였다.

### 3. 기기별 자동 설정 적용

**노트북 (Chrome)**

![노트북 자동 설정 화면](images/task2_laptop_auto_profile.png)

**iPhone (Safari)**

![iPhone 자동 설정 화면](images/task2_iphone_auto_profile.png)

`task2.js`에 기기별 설정을 저장하고 자동으로 적용하는 기능을 구현하였다. 두 기기에서 GitHub Pages에 접속하고 새로고침한 후에도 각각의 설정이 유지되는 것을 확인하였다.

### 4. 실행 주소

- [실습 1 실행](https://iju0777-lab.github.io/cg_solar/week7/task1.html)
- [실습 2 실행](https://iju0777-lab.github.io/cg_solar/week7/task2.html)
- [GitHub 저장소](https://github.com/iju0777-lab/cg_solar)
