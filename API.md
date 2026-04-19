# WhatsTheTemper Server API 명세

**Base URL**: `https://whatsthetemperserver.onrender.com`

---

## GET `/health`

서버 상태 확인

**Response**
```json
{ "status": "ok" }
```

---

## GET `/observers`

전체 관측소 목록 반환

**Response** `200 OK`
```json
[
  {
    "sta_cde": "bgna3",
    "sta_nam_kor": "강릉",
    "gru_nam": "동해",
    "lat": 37.799,
    "lon": 128.9492,
    "sur_tmp_yn": true,
    "mid_tmp_yn": false,
    "bot_tmp_yn": true,
    "sur_dep": 5,
    "mid_dep": 20,
    "bot_dep": 30,
    "bld_dat": "2008-07-08",
    "end_dat": null,
    "sta_des": "강원도 강릉시 사천면 사천항"
  }
]
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `sta_cde` | string | 관측소 코드 (고유 ID) |
| `sta_nam_kor` | string | 관측소 이름 |
| `gru_nam` | string | 권역 (동해 / 서해 / 남해 / 동중국해) |
| `lat` | number | 위도 |
| `lon` | number | 경도 |
| `sur_tmp_yn` | boolean | 표층 수온 수집 여부 |
| `mid_tmp_yn` | boolean | 중층 수온 수집 여부 |
| `bot_tmp_yn` | boolean | 저층 수온 수집 여부 |
| `sur_dep` | number \| null | 표층 수심 (m) |
| `mid_dep` | number \| null | 중층 수심 (m) |
| `bot_dep` | number \| null | 저층 수심 (m) |
| `bld_dat` | string \| null | 설치 일자 (YYYY-MM-DD) |
| `end_dat` | string \| null | 운영 종료일 (YYYY-MM-DD) |
| `sta_des` | string \| null | 관측소 설명 |

---

## GET `/observations`

수온 관측 데이터 반환. 매시 `:10`, `:40` 수집 (30분 간격).

### Query Parameters

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| `sta_cde` | 선택 | 특정 관측소 코드로 필터링 |

### 예시

```
GET /observations
GET /observations?sta_cde=bgna3
```

### Response `200 OK`

```json
[
  {
    "id": 196,
    "sta_cde": "wn087",
    "obs_dat": "2026-04-20",
    "obs_tim": "03:00:00",
    "obs_lay": 1,
    "wtr_tmp": 12.8,
    "sal": null,
    "dox": null,
    "repair_gbn": 1,
    "collected_at": "2026-04-19T18:10:02.065Z"
  }
]
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | 자동 증가 ID |
| `sta_cde` | string | 관측소 코드 |
| `obs_dat` | string | 관측 날짜 (YYYY-MM-DD) |
| `obs_tim` | string | 관측 시간 (HH:MM:SS) |
| `obs_lay` | number | 계층 (1: 표층, 2: 중층, 3: 저층) |
| `wtr_tmp` | number \| null | 수온 (°C) |
| `sal` | number \| null | 염분 (psu) |
| `dox` | number \| null | 용존산소 (mg/L) |
| `repair_gbn` | number | 상태 (1: 정상, 2: 점검) |
| `collected_at` | string | 서버 수집 시각 (UTC, ISO 8601) |

**정렬**: `obs_dat`, `obs_tim` 내림차순 (최신 순)
