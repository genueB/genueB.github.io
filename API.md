# WhatsTheTemper Server — API 명세

**Base URL**: `https://whatsthetemperserver.onrender.com`

**인증**: 불필요 (공개 API)

**CORS**: 전체 origin 허용

**응답 형식**: `Content-Type: application/json`

---

## 데이터 수집 주기

| 대상 | 주기 | 비고 |
|------|------|------|
| 관측소 목록 | 매 12시간 | 서버 시작 시 즉시 1회 수집 |
| 수온 관측 데이터 | 매시 `:10`, `:40` (30분 간격) | 서버 시작 시 즉시 1회 수집 |

> NIFS 원본 API 기준으로 수온 데이터는 1시간 단위 갱신이나, 서버는 30분마다 수집하여 최신성을 유지합니다.

---

## 엔드포인트 목록

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 확인 |
| GET | `/observers` | 전체 관측소 목록 |
| GET | `/observations` | 수온 관측 데이터 (전체 또는 관측소별) |
| GET | `/today-observations` | 특정 관측소의 당일 관측 데이터 (수심별, 시간 순) |
| GET | `/weekly-observations` | 특정 관측소의 최근 7일 수심별 일평균 수온 |

---

## GET `/health`

서버 상태 확인용 핑 엔드포인트.

### Response `200 OK`

```json
{ "status": "ok" }
```

---

## GET `/observers`

전체 관측소 메타 정보 목록을 반환합니다. 이름 오름차순으로 정렬됩니다.

### Response `200 OK`

```json
[
  {
    "sta_cde": "bgna3",
    "sta_nam_kor": "강릉",
    "gru_nam": "E",
    "lat": 37.799,
    "lon": 128.9492,
    "sur_tmp_yn": true,
    "mid_tmp_yn": false,
    "bot_tmp_yn": true,
    "sur_dep": 5,
    "mid_dep": null,
    "bot_dep": 30,
    "bld_dat": "2008-07-08",
    "end_dat": null,
    "sta_des": "강원도 강릉시 사천면 사천항"
  }
]
```

### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `sta_cde` | `string` | 관측소 코드 (고유 ID, PK) |
| `sta_nam_kor` | `string` | 관측소 한글 이름 |
| `gru_nam` | `string` | 권역 코드 — `"E"` 동해, `"W"` 서해, `"S"` 남해, `"EC"` 동중국해 |
| `lat` | `number` | 위도 (WGS84) |
| `lon` | `number` | 경도 (WGS84) |
| `sur_tmp_yn` | `boolean` | 표층 수온 수집 여부 |
| `mid_tmp_yn` | `boolean` | 중층 수온 수집 여부 |
| `bot_tmp_yn` | `boolean` | 저층 수온 수집 여부 |
| `sur_dep` | `number \| null` | 표층 수심 (m) |
| `mid_dep` | `number \| null` | 중층 수심 (m) |
| `bot_dep` | `number \| null` | 저층 수심 (m) |
| `bld_dat` | `string \| null` | 설치 일자 (`YYYY-MM-DD`) |
| `end_dat` | `string \| null` | 운영 종료일 (`YYYY-MM-DD`), 운영 중이면 `null` |
| `sta_des` | `string \| null` | 관측소 위치 설명 |

**정렬**: `sta_nam_kor` 오름차순

---

## GET `/observations`

수온 관측 데이터를 반환합니다. `sta_cde` 쿼리 파라미터로 특정 관측소 필터링 가능.

### Query Parameters

| 파라미터 | 필수 | 타입 | 설명 |
|---------|------|------|------|
| `sta_cde` | 선택 | `string` | 특정 관측소 코드로 필터링. 미입력 시 전체 반환. |

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
    "sta_cde": "bgna3",
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

### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 자동 증가 ID |
| `sta_cde` | `string` | 관측소 코드 (→ `/observers`의 `sta_cde`) |
| `obs_dat` | `string` | 관측 날짜 (`YYYY-MM-DD`, KST 기준) |
| `obs_tim` | `string` | 관측 시간 (`HH:MM:SS`, KST 기준) |
| `obs_lay` | `number` | 계층 — `1` 표층, `2` 중층, `3` 저층 |
| `wtr_tmp` | `number \| null` | 수온 (°C) |
| `sal` | `number \| null` | 염분 (psu) |
| `dox` | `number \| null` | 용존산소 (mg/L) |
| `repair_gbn` | `number` | 데이터 상태 — `1` 정상, `2` 점검 중 |
| `collected_at` | `string` | 서버 수집 시각 (UTC, ISO 8601) |

**정렬**: `obs_dat` 내림차순 → `obs_tim` 내림차순 (최신 순)

---

## GET `/today-observations`

특정 관측소의 **당일(KST 기준)** 수온 관측 데이터를 반환합니다. 시간 순으로 정렬됩니다.

### Query Parameters

| 파라미터 | 필수 | 타입 | 설명 |
|---------|------|------|------|
| `sta_cde` | **필수** | `string` | 관측소 코드 |

### 예시

```
GET /today-observations?sta_cde=bgna3
```

### Response `200 OK`

```json
[
  {
    "id": 196,
    "sta_cde": "bgna3",
    "obs_dat": "2026-05-18",
    "obs_tim": "03:00:00",
    "obs_lay": 1,
    "wtr_tmp": 14.2,
    "sal": null,
    "dox": null,
    "repair_gbn": 1,
    "collected_at": "2026-05-18T18:10:02.065Z"
  }
]
```

> 당일 데이터가 아직 수집되지 않은 경우 빈 배열 `[]`을 반환합니다.

### Response `400 Bad Request`

`sta_cde` 파라미터 누락 시:

```json
{ "error": "sta_cde is required" }
```

**정렬**: `obs_tim` 오름차순 → `obs_lay` 오름차순 (시간 순)

---

## GET `/weekly-observations`

특정 관측소의 **최근 7일(오늘 포함, KST 기준)** 수심별 일평균 수온을 반환합니다.

서버에서 DB의 30분 간격 측정값(1일 최대 48회)을 `AVG`로 집계하여 반환합니다.

### Query Parameters

| 파라미터 | 필수 | 타입 | 설명 |
|---------|------|------|------|
| `sta_cde` | **필수** | `string` | 관측소 코드 |

### 예시

```
GET /weekly-observations?sta_cde=bgna3
```

### Response `200 OK`

날짜 오름차순으로 정렬됩니다. 해당 관측소가 수집하지 않는 수심은 `null`로 반환됩니다.

```json
[
  { "date": "2026-05-14", "lay1": 14.49, "lay2": 9.00, "lay3": 5.84 },
  { "date": "2026-05-15", "lay1": 14.73, "lay2": 7.53, "lay3": 4.57 },
  { "date": "2026-05-16", "lay1": 14.02, "lay2": 6.79, "lay3": 4.65 },
  { "date": "2026-05-17", "lay1": 14.44, "lay2": 7.31, "lay3": 4.86 },
  { "date": "2026-05-18", "lay1": 14.55, "lay2": 6.81, "lay3": 4.38 },
  { "date": "2026-05-19", "lay1": 15.25, "lay2": 6.50, "lay3": 4.13 }
]
```

### 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `date` | `string` | 관측 날짜 (`YYYY-MM-DD`, KST 기준) |
| `lay1` | `number \| null` | 표층 일평균 수온 (°C) |
| `lay2` | `number \| null` | 중층 일평균 수온 (°C) |
| `lay3` | `number \| null` | 저층 일평균 수온 (°C) |

> 해당 날짜에 데이터가 없는 경우 해당 날짜 항목 자체가 결과에서 제외됩니다.

### Response `400 Bad Request`

`sta_cde` 파라미터 누락 시:

```json
{ "error": "sta_cde is required" }
```

**정렬**: `date` 오름차순 (과거 → 최근)

---

## 공통 참고사항

### `repair_gbn` 해석

| 값 | 의미 |
|----|------|
| `1` | 정상 데이터 |
| `2` | 점검 중 (이상 데이터 가능성) |

### `obs_lay` 해석

| 값 | 의미 |
|----|------|
| `1` | 표층 (Surface) |
| `2` | 중층 (Middle) |
| `3` | 저층 (Bottom) |

관측소마다 수집 가능한 계층이 다릅니다 (`sur_tmp_yn`, `mid_tmp_yn`, `bot_tmp_yn` 참조).

### `gru_nam` 해석

| 값 | 의미 |
|----|------|
| `"E"` | 동해 |
| `"W"` | 서해 |
| `"S"` | 남해 |
| `"EC"` | 동중국해 |

### 시간대

- `obs_dat`, `obs_tim`: KST (UTC+9)
- `collected_at`: UTC (ISO 8601)
