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

## 2. 실습 2 — Local / Ray / Path Tracing 화질·성능 비교

*실습 2 진행 후 작성 예정*
