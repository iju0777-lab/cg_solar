# 6주차 과제 — 재질을 읽고, 재질 변화를 코딩하기

## 1. 실습 1 — 단계별 PBR 재질 구현

### 1.1 구현 과정

**① TODO 1 — 색 텍스처**

`uColor`에서 UV 좌표에 해당하는 색상을 읽고, sRGB를 선형 색 공간으로 변환하여 기본 색상에 적용하였다. 회색 큐브에 녹슨 금속의 색상과 무늬가 나타났다.

![색 텍스처 적용 전](images/01_before_color.png)

![색 텍스처 적용 후](images/02_after_color.png)

**② TODO 2 — PBR 조명**

기존 Phong 조명을 D(GGX), F(Schlick), G(Smith-Schlick)를 이용한 PBR 계산으로 교체하였다. Roughness를 조절하면 반사 하이라이트의 퍼짐이 달라졌고, Metallic을 높이면 확산광이 줄어들어 큐브가 상대적으로 어두워졌다.

**③ TODO 3 — ARM 맵**

ARM 텍스처의 R 채널은 AO, G 채널은 Roughness, B 채널은 Metallic에 연결하였다. 이를 통해 녹슨 부분과 노출된 금속 부분에 서로 다른 재질 값이 적용되도록 하였다.

![ARM 적용 전](images/03_before_arm.png)

![ARM 적용 후](images/04_after_arm.png)

**④ TODO 4 — Normal Map**

접선 공간의 법선을 TBN 행렬을 이용하여 조명 계산에 적용하였다. Normal 강도를 0과 5로 변경했을 때 표면의 명암 차이는 미세했지만, 큐브의 외곽선은 동일하게 유지되었다.

![Normal 강도 0](images/05_normal_0.png)

![Normal 강도 5](images/06_normal_5.png)

**⑤ TODO 5 — 환경맵 반사**

반사 방향으로 환경 이미지를 조회하여 재질에 환경 반사를 추가하였다. 직접광과 Ambient를 모두 0으로 설정했을 때, 환경맵 반사 세기가 0이면 큐브가 검게 나타났지만 2로 높이면 환경 반사에 의해 표면이 보였다.

![환경맵 반사 세기 0](images/07_env_0.png)

![환경맵 반사 세기 2](images/08_env_2.png)

### 1.2 재질별 비교

동일한 큐브에 녹슨 금속, 나무, 돌 재질을 적용하여 비교하였다.

- **녹슨 금속:** 갈색 녹과 회색 금속 영역이 불규칙하게 구분되었다.
- **나무:** 갈색 나뭇결과 판자 사이의 선이 나타났다.
- **돌:** 회백색의 불규칙한 암석 무늬가 나타났다.

![녹슨 금속](images/09_metal.png)

![나무](images/10_wood.png)

![돌](images/11_rock.png)

### 1.3 텍스처 필터링 비교

교수님이 제공한 필터링 예제에서 NEAREST와 LINEAR_MIPMAP_LINEAR를 동일한 카메라 시점에서 비교하였다.

NEAREST에서는 멀리 있는 바닥의 격자무늬가 거칠고 불규칙하게 나타났지만, LINEAR_MIPMAP_LINEAR에서는 무늬가 상대적으로 부드럽게 표현되었다. 이를 통해 밉맵과 선형 보간이 텍스처 축소 시 발생하는 Aliasing을 완화한다는 것을 확인하였다.

![NEAREST](images/12_filter_nearest.png)

![LINEAR_MIPMAP_LINEAR](images/13_filter_mipmap.png)

### 1.4 텍스처 출처 및 라이선스

- **나무:** [Poly Haven — Wood Planks](https://polyhaven.com/a/wood_planks)
- **녹슨 금속:** [Poly Haven — Rusty Metal 04](https://polyhaven.com/a/rusty_metal_04)
- **돌:** [Poly Haven — Rock Boulder Dry](https://polyhaven.com/a/rock_boulder_dry)
- **환경 이미지:** [Poly Haven — Studio Small 09](https://polyhaven.com/a/studio_small_09)

라이선스: CC0 1.0

사용한 재질은 색상 맵(Diffuse), OpenGL 방식의 법선맵(nor_gl), ARM 맵으로 구성하였다. ARM 맵은 R(AO), G(Roughness), B(Metallic) 채널을 사용하였다.

상세 출처: `assets/week06/sources.json`

### 1.5 실행 주소

https://iju0777-lab.github.io/cg_solar/week6/task1.html

---

## 2. 실습 2 — 나만의 태양계에 새 행성 만들기

*실습 2 구현 및 검증 후 작성 예정*
