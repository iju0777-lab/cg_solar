
# Week 3 — 떠 있는 공에서 살아 있는 행성까지

## 1. 실습 1 — 삼각형에서 3차원 장면까지

### 1.1 행렬 곱셈 순서에 따른 자전과 공전 비교

#### ① 자전

```javascript
const model = M4.multiply(
  M4.translate(0, 1.9, 0),
  M4.rotateY(time * 0.8)
);
```

이동 행렬과 회전 행렬을 `T × Ry` 순서로 적용하자 공이 바닥 위에 떠 있는 상태에서 제자리 자전하였다. 행렬은 오른쪽부터 적용되므로 공이 먼저 Y축을 중심으로 회전한 뒤 위로 이동한다.

![자전하는 공](images/01.%20task1_step6_rotation.png)

#### ② 행렬 순서 변경 및 공전 구현

```javascript
const model = M4.multiply(
  M4.rotateY(time * 0.8),
  M4.translate(0, 1.9, 0)
);
```

교수님이 제시한 코드에 따라 행렬의 곱셈 순서를 변경했지만 화면에 눈에 띄는 변화가 없었다. 이동 방향과 회전축이 모두 Y축이기 때문에 회전하더라도 공의 중심 위치가 달라지지 않았기 때문이다.

이후 이동 방향을 수정하였다.

```javascript
const model = M4.multiply(
  M4.rotateY(time * 0.8),
  M4.translate(1.9, 1.9, 0)
);
```

공을 회전축에서 떨어진 위치로 이동시키자 Y축을 중심으로 원을 그리며 공전하였다. 이를 통해 행렬의 곱셈 순서뿐 아니라 이동 방향과 회전축의 관계도 물체의 움직임에 영향을 준다는 것을 확인하였다.

![공전하는 공](images/02.%20task1_step6_orbit.png)

### 1.2 프래그먼트 셰이더 변경 실험

**선택한 실험: 법선 벡터를 색상으로 표현하기**

```glsl
void main() {
  vec3 N = normalize(vNormal);
  fragColor = vec4(N * 0.5 + 0.5, 1.0);
}
```

법선 벡터의 X, Y, Z 성분을 RGB 색상에 대응시켰다. `N * 0.5 + 0.5`는 -1부터 1 사이의 법선 성분을 0부터 1 사이의 색상 값으로 변환한다.

실행 결과, 구의 표면에는 여러 색상이 부드럽게 이어지는 무지갯빛이 나타났다. 반면 바닥은 각 면의 법선 방향이 일정하여 면마다 다른 단색으로 표현되었다.

![법선 색상 셰이더](images/03.%20task1_step8_shader.png)

---

## 2. 실습 2 — 살아 있는 행성 만들기

### 2.1 제작 의도

이번 실습에서는 현실에 존재하지 않는 메타버스 속 가상 항성계를 표현하고자 하였다. 실제 태양계의 행성을 재현하기보다 독특한 색상과 무늬, 움직임을 가진 두 행성을 제작하였다.

#### ① 홀로그램 행성 (Hologram Planet)

홀로그램 행성은 디지털 공간의 인공적인 분위기를 표현하기 위해 제작하였다. 어두운 청록색 표면에 민트색 네온 격자무늬를 적용하고, 행성을 비스듬히 감싸는 링을 추가하였다. 이를 통해 미래적인 가상세계의 느낌을 전달하고자 하였다.

#### ② 캔디 행성 (Candy Planet)

캔디 행성은 홀로그램 행성과 대비되는 밝고 부드러운 분위기를 표현하기 위해 제작하였다. 복숭아색과 노란색의 물결무늬가 천천히 움직이도록 하여 현실의 행성과 다른 환상적인 모습을 구현하였다.

교수님이 제시한 가스 행성, 바위 행성, 위성 예제와 달리 두 행성에 기하학적인 네온 격자와 밝은 색상의 물결무늬를 적용하였다. 또한 1주차에 선택했던 보라색 배경을 유지하여 메타버스 속 가상 항성계라는 주제가 드러나도록 하였다.

### 2.2 구현 방법

#### ① 홀로그램 행성 — 네온 격자무늬

```glsl
float lat = asin(clamp(S.y, -1.0, 1.0));
float lon = atan(S.z, S.x);

float gridLat = abs(sin(lat * 12.0));
float gridLon = abs(sin(lon * 12.0));

float lines = 1.0 - step(0.12, min(gridLat, gridLon));
```

구 표면의 법선 벡터에서 위도와 경도를 계산하였다. `sin()` 함수의 반복적인 특성을 활용하여 일정한 간격의 가로선과 세로선을 생성하였다.

`step()`을 사용하여 격자선과 그 외 영역을 구분하였다. 이후 `mix()`로 어두운 청록색과 민트색을 혼합하여 네온 격자무늬를 완성하였다.

#### ② 홀로그램 행성 — 네온 밝기 변화

```glsl
float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
color += neonColor * lines * pulse * 0.15;
```

`uTime`과 `sin()`을 활용하여 격자의 밝기가 시간에 따라 주기적으로 변하도록 설정하였다. `sin()` 함수의 출력값에 일정한 값을 더하고 곱하여 밝기 변화의 범위를 조절하였다.

이를 통해 고정된 격자무늬가 아니라 은은하게 빛나는 홀로그램 효과를 표현하였다.

#### ③ 캔디 행성 — 움직이는 물결무늬

```glsl
float wave = sin(
  S.y * 15.0 +
  sin(S.x * 5.0) * 0.8 +
  uTime * 0.5
);

vec3 peach = vec3(1.0, 0.48, 0.38);
vec3 yellow = vec3(1.0, 0.88, 0.42);

float blend = smoothstep(-0.25, 0.25, wave);
color = mix(peach, yellow, blend);
```

`sin(S.y * 15.0)`을 사용하여 반복적인 가로 줄무늬를 만들었다. 여기에 `sin(S.x * 5.0) * 0.8`을 더해 줄무늬가 물결처럼 휘어지도록 하였다.

`smoothstep()`을 통해 두 색상 사이의 경계를 부드럽게 만들고, `mix()`로 복숭아색과 노란색을 혼합하였다. 또한 `uTime * 0.5`를 추가하여 무늬가 시간에 따라 천천히 움직이도록 하였다.

#### ④ 공통 조명 계산

```glsl
vec3 L = normalize(vec3(0.45, 0.8, 0.35));
float diff = max(dot(N, L), 0.0);
color *= 0.15 + 0.85 * diff;
```

두 행성 모두 법선 벡터와 광원 방향의 내적을 사용하여 표면의 밝기를 계산하였다.

`dot(N, L)` 값이 클수록 밝게 나타나며, 빛을 받지 않는 부분은 어둡게 표현된다. 이를 통해 행성의 낮과 밤의 차이를 드러냈다.

#### ⑤ 홀로그램 행성의 링 구현

```javascript
const ring = createMesh(makeRing(1.5, 2.1, 96));
```

`makeRing()` 함수를 이용해 안쪽과 바깥쪽 반지름을 가진 고리 형태의 메시를 생성하였다.

```javascript
const ringModel = M4.multiply(
  M4.translate(-2.5, 0, 0),
  M4.rotateX(0.45)
);
```

링을 홀로그램 행성과 같은 위치로 이동시킨 뒤 X축으로 기울여 행성을 비스듬히 감싸도록 하였다.

### 2.3 시행착오 및 수정 과정

#### ① 링 추가 후 검은 화면 발생

두 행성을 구현한 뒤 링을 추가했을 때 화면 전체가 검은색으로 나타나는 문제가 발생하였다.

처음에는 링 생성 함수의 위치를 수정했지만 문제가 해결되지 않았다. 이후 코드를 다시 확인하면서 `makeSphere()`와 `makeRing()`의 코드가 서로 섞여 있다는 점을 발견하였다.

두 함수를 분리하고 링을 그리는 코드를 `render()` 함수 안으로 옮기자 정상적으로 실행되었다.

![링 구현 중 오류](images/06.%20task2_process_2.png)

#### ② 행성 크기와 간격 수정

처음에는 두 행성이 화면에 작게 나타났고 링과 캔디 행성의 거리가 가까웠다.

이를 해결하기 위해 두 행성의 X축 위치를 각각 `-1.8`, `1.8`에서 `-2.5`, `2.5`로 변경하였다. 카메라 크기 조절 값도 `3.4`에서 `2.8`로 수정하여 행성을 확대하였다.

그 결과 두 행성의 특징이 더욱 뚜렷하게 드러났다.

### 2.4 행성별 제작 결과

#### ① 홀로그램 행성 초기 구현

![홀로그램 행성](images/05.%20task2_process_1.png)

#### ② 두 행성 구현 과정

![두 행성 구현 과정](images/07.%20task2_process_3.png)

#### ③ 두 행성의 최종 결과

![홀로그램 링 행성과 캔디 행성](images/04.%20task2_planets.png)

### 2.5 프래그먼트 셰이더 전체 코드

```glsl
#version 300 es
precision highp float;

in vec3 vColor;
in vec3 vNormal;
in vec3 vSurf;

uniform float uTime;
uniform int uPlanetType;

out vec4 fragColor;

void main() {
  vec3 S = normalize(vSurf);
  vec3 N = normalize(vNormal);

  vec3 color;

  if (uPlanetType == 0) {
    // 홀로그램 행성
    float lat = asin(clamp(S.y, -1.0, 1.0));
    float lon = atan(S.z, S.x);

    float gridLat = abs(sin(lat * 12.0));
    float gridLon = abs(sin(lon * 12.0));

    float lines = 1.0 -
      step(0.12, min(gridLat, gridLon));

    vec3 baseColor = vec3(0.02, 0.10, 0.15);
    vec3 neonColor = vec3(0.20, 1.0, 0.80);

    color = mix(baseColor, neonColor, lines);

    float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
    color += neonColor * lines * pulse * 0.15;

  } else if (uPlanetType == 1) {
    // 캔디 행성
    float wave = sin(
      S.y * 15.0 +
      sin(S.x * 5.0) * 0.8 +
      uTime * 0.5
    );

    vec3 peach = vec3(1.0, 0.48, 0.38);
    vec3 yellow = vec3(1.0, 0.88, 0.42);

    float blend = smoothstep(-0.25, 0.25, wave);
    color = mix(peach, yellow, blend);

  } else {
    // 홀로그램 행성의 링
    color = vec3(0.30, 1.0, 0.85);
  }

  vec3 L = normalize(vec3(0.45, 0.8, 0.35));
  float diff = max(dot(N, L), 0.0);
  color *= 0.15 + 0.85 * diff;

  fragColor = vec4(color, 1.0);
}
```

---

## 3. 실행 링크

- [실습 1 — 바닥 위에서 자전하는 공](https://iju0777-lab.github.io/cg_solar/week3/task1.html)
- [실습 2 — 홀로그램 행성과 캔디 행성](https://iju0777-lab.github.io/cg_solar/week3/task2.html)
