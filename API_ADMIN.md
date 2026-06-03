# WhatsTheTemper Server — Admin Stats API 명세

**Base URL**: `https://whatsthetemperserver.onrender.com`

**인증**: 로그인 후 발급받은 토큰을 `X-Admin-Key` 헤더로 사용

**응답 형식**: `Content-Type: application/json`

---

## 인증 흐름

1. `POST /admin/login`으로 로그인 → `token` 발급
2. 이후 모든 stats 요청에 `X-Admin-Key: <token>` 헤더 포함

헤더가 없거나 값이 다르면 `401`을 반환합니다.

```json
{ "error": "unauthorized" }
```

---

## 엔드포인트 목록

| Method | Path | 파라미터 | 설명 |
|--------|------|----------|------|
| POST | `/admin/login` | — | 로그인 및 토큰 발급 |
| GET | `/admin/stats/overview` | — | 전체 요약 (디바이스 수, DAU, MAU, 총 이벤트 수) |
| GET | `/admin/stats/dau` | `days` | 일별 활성 디바이스 수 추이 |
| GET | `/admin/stats/stations` | `limit` | 인기 관측소 TOP N |
| GET | `/admin/stats/events` | `days` | 이벤트 종류별 발생 횟수 |
| GET | `/admin/stats/tabs` | `days` | 탭별 진입 횟수 |
| GET | `/admin/stats/searches` | `limit` | 인기 검색어 TOP N |

---

## POST `/admin/login`

관리자 로그인 후 토큰을 발급합니다. 발급받은 `token`을 이후 모든 stats 요청의 `X-Admin-Key` 헤더에 사용하세요.

### Request Body

```json
{
  "id": "admin",
  "password": "your-password"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `id` | **필수** | 관리자 ID (`ADMIN_ID` 환경 변수) |
| `password` | **필수** | 관리자 비밀번호 (`ADMIN_PASSWORD` 환경 변수) |

### Response `200 OK`

```json
{ "token": "<ADMIN_API_KEY 값>" }
```

### Response `400 Bad Request`

`id` 또는 `password` 누락 시:

```json
{ "error": "id and password are required" }
```

### Response `401 Unauthorized`

자격증명 불일치 시:

```json
{ "error": "invalid credentials" }
```

---

## GET `/admin/stats/overview`

전체 통계 요약을 반환합니다.

### Response `200 OK`

```json
{
  "total_devices": 1024,
  "total_events": 58302,
  "dau": 87,
  "mau": 412
}
```

| 필드 | 설명 |
|------|------|
| `total_devices` | 전체 기간 누적 고유 디바이스 수 |
| `total_events` | 전체 기간 누적 이벤트 수 |
| `dau` | 오늘(KST 기준) `app_open`을 보낸 고유 디바이스 수 |
| `mau` | 최근 30일 `app_open`을 보낸 고유 디바이스 수 |

---

## GET `/admin/stats/dau`

일별 활성 디바이스 수(`app_open` 기준) 추이를 반환합니다.

### Query Parameters

| 파라미터 | 필수 | 기본값 | 범위 | 설명 |
|---------|------|--------|------|------|
| `days` | 선택 | `30` | 1~365 | 조회할 최근 N일 |

### 예시

```
GET /admin/stats/dau
GET /admin/stats/dau?days=7
GET /admin/stats/dau?days=90
```

### Response `200 OK`

```json
[
  { "date": "2026-05-28", "count": 74 },
  { "date": "2026-05-29", "count": 81 },
  { "date": "2026-05-30", "count": 93 },
  { "date": "2026-05-31", "count": 88 },
  { "date": "2026-06-01", "count": 102 },
  { "date": "2026-06-02", "count": 97 },
  { "date": "2026-06-03", "count": 87 }
]
```

| 필드 | 설명 |
|------|------|
| `date` | 날짜 (`YYYY-MM-DD`, KST 기준) |
| `count` | 해당 날짜 고유 디바이스 수 |

**정렬**: 날짜 오름차순 (과거 → 최근)

> 해당 날짜에 `app_open` 이벤트가 없으면 해당 날짜 항목이 결과에서 제외됩니다.

---

## GET `/admin/stats/stations`

조회수 기준 인기 관측소 TOP N을 반환합니다. 즐겨찾기 증감도 함께 제공합니다.

### Query Parameters

| 파라미터 | 필수 | 기본값 | 범위 | 설명 |
|---------|------|--------|------|------|
| `limit` | 선택 | `10` | 1~100 | 반환할 관측소 수 |

### 예시

```
GET /admin/stats/stations
GET /admin/stats/stations?limit=20
```

### Response `200 OK`

```json
[
  {
    "station_id": "DT_0001",
    "station_name": "속초",
    "sea_name": "동해",
    "view_count": 1240,
    "favorite_add": 312,
    "favorite_remove": 48,
    "favorite_net": 264
  },
  {
    "station_id": "bgna3",
    "station_name": "강릉",
    "sea_name": "동해",
    "view_count": 987,
    "favorite_add": 201,
    "favorite_remove": 33,
    "favorite_net": 168
  }
]
```

| 필드 | 설명 |
|------|------|
| `station_id` | 관측소 코드 |
| `station_name` | 관측소 한글명 |
| `sea_name` | 권역명 |
| `view_count` | 전체 기간 상세 화면 진입 횟수 |
| `favorite_add` | 전체 기간 즐겨찾기 추가 횟수 |
| `favorite_remove` | 전체 기간 즐겨찾기 제거 횟수 |
| `favorite_net` | `favorite_add - favorite_remove` (현재 즐겨찾기 추정치) |

**정렬**: `view_count` 내림차순

---

## GET `/admin/stats/events`

이벤트 종류별 발생 횟수를 반환합니다.

### Query Parameters

| 파라미터 | 필수 | 기본값 | 범위 | 설명 |
|---------|------|--------|------|------|
| `days` | 선택 | `7` | 1~365 | 조회할 최근 N일 |

### 예시

```
GET /admin/stats/events
GET /admin/stats/events?days=30
```

### Response `200 OK`

```json
[
  { "name": "station_view",       "count": 8420 },
  { "name": "app_open",           "count": 3201 },
  { "name": "tab_view",           "count": 2984 },
  { "name": "search",             "count": 1532 },
  { "name": "favorite_add",       "count": 874 },
  { "name": "sea_filter_select",  "count": 631 },
  { "name": "favorite_remove",    "count": 210 },
  { "name": "weekly_chart_navigate", "count": 188 }
]
```

| 필드 | 설명 |
|------|------|
| `name` | 이벤트 이름 |
| `count` | 해당 기간 내 발생 횟수 |

**정렬**: `count` 내림차순

---

## GET `/admin/stats/tabs`

탭별 진입 횟수를 반환합니다 (`tab_view` 이벤트 기준).

### Query Parameters

| 파라미터 | 필수 | 기본값 | 범위 | 설명 |
|---------|------|--------|------|------|
| `days` | 선택 | `7` | 1~365 | 조회할 최근 N일 |

### 예시

```
GET /admin/stats/tabs
GET /admin/stats/tabs?days=30
```

### Response `200 OK`

```json
[
  { "tab_name": "list",     "count": 1402 },
  { "tab_name": "home",     "count": 1184 },
  { "tab_name": "map",      "count": 731 },
  { "tab_name": "settings", "count": 203 }
]
```

| `tab_name` | 화면 |
|------------|------|
| `"home"` | 홈 |
| `"list"` | 수온 목록 |
| `"map"` | 지도 |
| `"settings"` | 설정 |

**정렬**: `count` 내림차순

---

## GET `/admin/stats/searches`

검색어별 사용 횟수 TOP N을 반환합니다.

### Query Parameters

| 파라미터 | 필수 | 기본값 | 범위 | 설명 |
|---------|------|--------|------|------|
| `limit` | 선택 | `20` | 1~100 | 반환할 검색어 수 |

### 예시

```
GET /admin/stats/searches
GET /admin/stats/searches?limit=50
```

### Response `200 OK`

```json
[
  { "query": "속초",  "count": 312, "avg_result_count": 1.0 },
  { "query": "강릉",  "count": 287, "avg_result_count": 1.0 },
  { "query": "제주",  "count": 241, "avg_result_count": 3.2 },
  { "query": "동해",  "count": 198, "avg_result_count": 8.7 }
]
```

| 필드 | 설명 |
|------|------|
| `query` | 검색어 |
| `count` | 전체 기간 검색 횟수 |
| `avg_result_count` | 평균 검색 결과 수 (소수점 1자리) |

**정렬**: `count` 내림차순
