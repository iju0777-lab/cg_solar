Week 2 — 지구·달·인공위성의 변환 설계

1. 행렬 순서에 따른 변화

Q1. T를 Rz 앞으로 옮기면 달의 움직임이 어떻게 달라지는가?

Rz · T · S에서는 달이 지구를 중심으로 공전한다. 그러나 T · Rz · S로 순서를 변경하면 달의 중심 위치가 고정되고, 달이 그 자리에서 자전하게 된다. 이는 행렬의 곱셈 순서에 따라 변환 결과가 달라지기 때문이다.

Q2. S를 맨 앞으로 옮기면 무엇이 달라지는가?

S · Rz · T에서는 크기 변환이 달의 크기뿐 아니라 지구로부터의 거리에도 영향을 미친다. 따라서 달의 공전 궤도 반지름까지 작아진다.

Q3. 세 행렬의 6가지 배열 중 달의 공전을 올바르게 표현하는 것은 몇 가지인가?

공전 자체가 발생하는 배열은 Rz · T · S와 Rz · S · T, 총 2가지이다. 다만 Rz · S · T는 크기 변환이 공전 거리에도 적용되므로, 원래 의도한 거리와 크기를 유지하는 배열은 Rz · T · S이다.

2. Task 1 — 실제 비율로 만들기

선택한 인공위성: ISS(국제우주정거장)

거리 단위: 지구 반지름 = 1

실제 물리값 및 변환값

지구 반지름: 6,371 km → 1

달 반지름: 1,737 km → 0.273

지구–달 거리: 384,400 km → 60.3

ISS 궤도 반지름: 약 6,771 km → 1.063

ISS 크기: 약 109 m → 0.0000171

거리 단위 설정: 지구 반지름을 기준 단위 1로 정하고, 다른 천체의 실제 물리값을 지구 반지름으로 나누어 변환하였다. 이를 통해 실제 크기와 거리의 상대적인 비율을 유지하면서 계산에 사용되는 숫자를 간단하게 표현하였다.

변환 설계

지구: 단위행렬

달: Rz(t*20) · T(60.3,0,0) · S(0.273) · Rz(180)

ISS: Rz(t*90) · T(1.063,0,0) · S(0.0000171)· Rz(180)

축 범위: x, y, z 모두 ±70

Q1. 거리 단위를 무엇으로 정했으며, 그 이유는 무엇인가?

지구 반지름을 1로 정하였다. 실제 거리와 크기를 같은 기준으로 환산하면 천체 간 비율을 유지하면서도 지나치게 큰 숫자를 사용하지 않을 수 있기 때문이다.

Q2. 숫자가 커서 생긴 문제가 있었는가?

지구와 달 사이의 거리가 지구 반지름의 약 60배이기 때문에 기본 축 범위 ±3에서는 달을 표시할 수 없었다. 이를 해결하기 위해 축 범위를 ±70으로 확대하였다. 또한 ISS는 지구에 비해 매우 작아서 실제 크기 비율로 표현하면 화면에서 구별하기 어려웠다.

Q3. 달과 ISS가 지구를 향하게 만든 변환은 무엇인가?

Rz · T의 조합을 통해 달과 ISS가 지구를 중심으로 공전하도록 하였다. 이때 Rz가 물체의 방향도 함께 회전시키므로 공전 중에도 일정한 면을 지구 쪽으로 향하게 할 수 있다. 다만 로컬 +X 방향은 기본적으로 지구 반대쪽을 향하기 때문에, 맨 오른쪽에 Rz(180)을 추가하여 화살표가 지구를 향하도록 설정하였다.

실습 설정 및 결과

공유 링크: https://cg.catholic.ac.kr/~mgchoi/CG/demos/d02-transform-lab.html?d=eyJyYW5nZSI6eyJ4IjoiNzAiLCJ5IjoiNzAiLCJ6IjoiNzAifSwib2JqZWN0cyI6W3siaWQiOiJlYXJ0aCIsIm5hbWUiOiLsp4DqtawiLCJjb2xvciI6WzAuMzUsMC42LDAuOTVdLCJzdGVwcyI6W119LHsiaWQiOiJtb29uIiwibmFtZSI6IuuLrCIsImNvbG9yIjpbMC43OCwwLjc4LDAuODJdLCJzdGVwcyI6W3sidHlwZSI6IlJ6IiwiYXJncyI6WyJ0KjIwIl19LHsidHlwZSI6IlQiLCJhcmdzIjpbIjYwLjMiLCIwIiwiMCJdfSx7InR5cGUiOiJTdSIsImFyZ3MiOlsiMC4yNzMiXX0seyJ0eXBlIjoiUnoiLCJhcmdzIjpbIjE4MCJdfV19LHsiaWQiOiJzYXQiLCJuYW1lIjoi7J246rO17JyE7ISxIiwiY29sb3IiOlswLjk1LDAuNzIsMC4zNV0sInN0ZXBzIjpbeyJ0eXBlIjoiUnoiLCJhcmdzIjpbInQqOTAiXX0seyJ0eXBlIjoiVCIsImFyZ3MiOlsiMS4wNjMiLCIwIiwiMCJdfSx7InR5cGUiOiJTdSIsImFyZ3MiOlsiMC4wMDAwNzEiXX0seyJ0eXBlIjoiUnoiLCJhcmdzIjpbIjE4MCJdfV19XX0%3D

설정 JSON: {
  "range": {
    "x": "70",
    "y": "70",
    "z": "70"
  },
  "objects": [
    {
      "id": "earth",
      "name": "지구",
      "color": [
        0.35,
        0.6,
        0.95
      ],
      "steps": []
    },
    {
      "id": "moon",
      "name": "달",
      "color": [
        0.78,
        0.78,
        0.82
      ],
      "steps": [
        {
          "type": "Rz",
          "args": [
            "t*20"
          ]
        },
        {
          "type": "T",
          "args": [
            "60.3",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.273"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    },
    {
      "id": "sat",
      "name": "인공위성",
      "color": [
        0.95,
        0.72,
        0.35
      ],
      "steps": [
        {
          "type": "Rz",
          "args": [
            "t*90"
          ]
        },
        {
          "type": "T",
          "args": [
            "1.063",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.000071"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    }
  ]
}

실행 코드: https://iju0777-lab.github.io/cg_solar/week2/task1.html

조사 자료 출처: 지구 및 달의 크기와 거리: NASA, Planetary Fact Sheet
https://nssdc.gsfc.nasa.gov/planetary/factsheet/

ISS의 크기 및 궤도 정보: NASA, International Space Station
https://www.nasa.gov/international-space-station/

실제 물리값의 적용 방법

지구 반지름 6,371km를 기준 단위 1로 설정하고, 달의 반지름과 지구–달 거리, ISS의 궤도 반지름 및 크기를 동일한 기준으로 환산하였다. 이동 행렬 T에는 지구 중심으로부터의 실제 거리 비율을 적용하고, 크기 행렬 S에는 물체의 실제 크기 비율을 적용하였다. 단, t*20과 t*90은 실제 공전 주기를 환산한 값이 아니라 실습에서 움직임을 확인하기 위해 설정한 회전 속도이다.


3. Task 2 — NDC 범위에 맞추기

공통 축소 배율: 0.015

변환 설계

지구: S(0.015)

달: S(0.015) · Rz(t*20) · T(60.3,0,0) · S(0.273) · Rz(180)

ISS: S(0.015) · Rz(t*90) · T(1.063,0,0) · S(0.0000171) · Rz(180)

축 범위: x, y, z 모두 ±1

Q1. 축소 배율을 얼마로 정했고, 어떻게 계산했는가?

지구에서 가장 먼 지점은 달의 바깥쪽 가장자리이므로 60.3 + 0.273 = 60.573이다. 따라서 배율은 1 ÷ 60.573 ≈ 0.0165 이하로 정해야 한다. 화면 가장자리에 여유를 두기 위해 0.015를 선택하였다.

Q2. 배율 행렬을 맨 앞에 넣은 이유는 무엇인가?

행렬은 오른쪽부터 적용된다. 배율 행렬을 맨 앞에 배치하면 물체의 크기뿐 아니라 이동한 위치까지 함께 축소된다. 반면 맨 뒤에 배치하면 물체의 크기만 줄어들어 달은 여전히 화면 밖에 있게 된다.

Q3. 세 물체에 같은 배율을 사용한 이유는 무엇인가?

모든 물체에 동일한 배율을 적용해야 실제 거리와 크기의 상대적인 비율을 유지할 수 있기 때문이다.

Q4. 비율을 유지한 결과 지구와 ISS는 어떻게 보이는가?

달까지 화면에 표시하기 위해 전체 장면을 축소하였으므로 지구는 매우 작아졌고 ISS는 사실상 구별하기 어려웠다. 실제 비율이 정확하더라도 시각적으로 정보를 전달하기에는 한계가 있다는 것을 확인하였다.

실습 설정 및 결과

공유 링크: https://cg.catholic.ac.kr/~mgchoi/CG/demos/d02-transform-lab.html?d=eyJyYW5nZSI6eyJ4IjoiMSIsInkiOiIxIiwieiI6IjEifSwib2JqZWN0cyI6W3siaWQiOiJlYXJ0aCIsIm5hbWUiOiLsp4DqtawiLCJjb2xvciI6WzAuMzUsMC42LDAuOTVdLCJzdGVwcyI6W3sidHlwZSI6IlN1IiwiYXJncyI6WyIwLjAxNSJdfV19LHsiaWQiOiJtb29uIiwibmFtZSI6IuuLrCIsImNvbG9yIjpbMC43OCwwLjc4LDAuODJdLCJzdGVwcyI6W3sidHlwZSI6IlN1IiwiYXJncyI6WyIwLjAxNSJdfSx7InR5cGUiOiJSeiIsImFyZ3MiOlsidCoyMCJdfSx7InR5cGUiOiJUIiwiYXJncyI6WyI2MC4zIiwiMCIsIjAiXX0seyJ0eXBlIjoiU3UiLCJhcmdzIjpbIjAuMjczIl19LHsidHlwZSI6IlJ6IiwiYXJncyI6WyIxODAiXX1dfSx7ImlkIjoic2F0IiwibmFtZSI6IuyduOqzteychOyEsSIsImNvbG9yIjpbMC45NSwwLjcyLDAuMzVdLCJzdGVwcyI6W3sidHlwZSI6IlN1IiwiYXJncyI6WyIwLjAxNSJdfSx7InR5cGUiOiJSeiIsImFyZ3MiOlsidCo5MCJdfSx7InR5cGUiOiJUIiwiYXJncyI6WyIxLjA2MyIsIjAiLCIwIl19LHsidHlwZSI6IlN1IiwiYXJncyI6WyIwLjAwMDA3MSJdfSx7InR5cGUiOiJSeiIsImFyZ3MiOlsiMTgwIl19XX1dfQ%3D%3D

설정 JSON: {
  "range": {
    "x": "1",
    "y": "1",
    "z": "1"
  },
  "objects": [
    {
      "id": "earth",
      "name": "지구",
      "color": [
        0.35,
        0.6,
        0.95
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        }
      ]
    },
    {
      "id": "moon",
      "name": "달",
      "color": [
        0.78,
        0.78,
        0.82
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "t*20"
          ]
        },
        {
          "type": "T",
          "args": [
            "60.3",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.273"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    },
    {
      "id": "sat",
      "name": "인공위성",
      "color": [
        0.95,
        0.72,
        0.35
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "t*90"
          ]
        },
        {
          "type": "T",
          "args": [
            "1.063",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.000071"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    }
  ]
}

실행 코드: Task 2



4. Task 3 — 보는 사람을 위한 표현

표현 방법: 크기 과장 및 ISS 궤도 거리 조정

Task 2에서는 실제 비율을 유지했기 때문에 지구와 ISS를 알아보기 어려웠다. 이를 개선하기 위해 지구와 달의 크기를 10배 확대하고, ISS는 10,000배 확대하였다.

또한 지구가 확대되면서 ISS의 기존 궤도가 지구 내부에 위치하는 문제가 발생하였다. 따라서 ISS의 이동 거리를 1.063에서 15로 변경하였다.

변환 설계

지구: S(0.015) · S(10)

달: S(0.015) · Rz(t*20) · T(60.3,0,0) · S(0.273) · S(10) · Rz(180)

ISS: S(0.015) · Rz(t*90) · T(15,0,0) · S(0.0000171) · S(10000) · Rz(180)

축 범위: x, y, z 모두 ±1

Q1. 실제 비율이 정보를 전달하기에 적합한가?

실제 비율은 물체의 상대적인 크기와 거리를 정확하게 표현하는 데 적합하지만, 크기 차이가 매우 큰 경우 작은 물체를 관찰하기 어렵다는 문제가 있다. 따라서 학습자가 세 물체의 구조와 움직임을 이해하는 데에는 한계가 있다고 판단하였다.

Q2. 제안한 개선 방법은 무엇인가?

지구와 달은 10배, ISS는 10,000배 확대하여 각 물체를 쉽게 구분할 수 있도록 하였다. 또한 ISS의 궤도 거리를 조정하여 지구 바깥에서 공전하는 모습이 드러나도록 하였다.

Q3. 제안한 방법의 장점과 한계는 무엇인가?

장점은 작은 ISS까지 화면에서 확인할 수 있어 세 물체의 위치와 공전 움직임을 쉽게 이해할 수 있다는 것이다. 반면 실제 천체의 크기 비율과 ISS의 궤도 거리가 왜곡되므로, 정확한 물리적 배치를 보여 주는 데에는 적합하지 않다.

실습 설정 및 결과

공유 링크: https://cg.catholic.ac.kr/~mgchoi/CG/demos/d02-transform-lab.html?d=eyJyYW5nZSI6eyJ4IjoiMSIsInkiOiIxIiwieiI6IjEifSwib2JqZWN0cyI6W3siaWQiOiJlYXJ0aCIsIm5hbWUiOiLsp4DqtawiLCJjb2xvciI6WzAuMzUsMC42LDAuOTVdLCJzdGVwcyI6W3sidHlwZSI6IlN1IiwiYXJncyI6WyIwLjAxNSJdfSx7InR5cGUiOiJTdSIsImFyZ3MiOlsiMTAiXX1dfSx7ImlkIjoibW9vbiIsIm5hbWUiOiLri6wiLCJjb2xvciI6WzAuNzgsMC43OCwwLjgyXSwic3RlcHMiOlt7InR5cGUiOiJTdSIsImFyZ3MiOlsiMC4wMTUiXX0seyJ0eXBlIjoiUnoiLCJhcmdzIjpbInQqMjAiXX0seyJ0eXBlIjoiVCIsImFyZ3MiOlsiNjAuMyIsIjAiLCIwIl19LHsidHlwZSI6IlN1IiwiYXJncyI6WyIwLjI3MyJdfSx7InR5cGUiOiJTdSIsImFyZ3MiOlsiMTAiXX0seyJ0eXBlIjoiUnoiLCJhcmdzIjpbIjE4MCJdfV19LHsiaWQiOiJzYXQiLCJuYW1lIjoi7J246rO17JyE7ISxIiwiY29sb3IiOlswLjk1LDAuNzIsMC4zNV0sInN0ZXBzIjpbeyJ0eXBlIjoiU3UiLCJhcmdzIjpbIjAuMDE1Il19LHsidHlwZSI6IlJ6IiwiYXJncyI6WyJ0KjkwIl19LHsidHlwZSI6IlQiLCJhcmdzIjpbIjE1IiwiMCIsIjAiXX0seyJ0eXBlIjoiU3UiLCJhcmdzIjpbIjAuMDAwMDcxIl19LHsidHlwZSI6IlN1IiwiYXJncyI6WyIxMDAwMCJdfSx7InR5cGUiOiJSeiIsImFyZ3MiOlsiMTgwIl19XX1dfQ%3D%3D

설정 JSON: {
  "range": {
    "x": "1",
    "y": "1",
    "z": "1"
  },
  "objects": [
    {
      "id": "earth",
      "name": "지구",
      "color": [
        0.35,
        0.6,
        0.95
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        },
        {
          "type": "Su",
          "args": [
            "10"
          ]
        }
      ]
    },
    {
      "id": "moon",
      "name": "달",
      "color": [
        0.78,
        0.78,
        0.82
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "t*20"
          ]
        },
        {
          "type": "T",
          "args": [
            "60.3",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.273"
          ]
        },
        {
          "type": "Su",
          "args": [
            "10"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    },
    {
      "id": "sat",
      "name": "인공위성",
      "color": [
        0.95,
        0.72,
        0.35
      ],
      "steps": [
        {
          "type": "Su",
          "args": [
            "0.015"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "t*90"
          ]
        },
        {
          "type": "T",
          "args": [
            "15",
            "0",
            "0"
          ]
        },
        {
          "type": "Su",
          "args": [
            "0.000071"
          ]
        },
        {
          "type": "Su",
          "args": [
            "10000"
          ]
        },
        {
          "type": "Rz",
          "args": [
            "180"
          ]
        }
      ]
    }
  ]
}

실행 코드: Task 3



5. 실습을 통해 알게 된 점

이번 실습을 통해 행렬의 곱셈 순서가 물체의 위치와 움직임에 직접적인 영향을 미친다는 것을 확인하였다. 또한 실제 물리적 비율을 유지하는 것과 관찰자가 쉽게 이해할 수 있도록 시각화하는 것이 서로 다른 목표라는 점을 알게 되었다.
