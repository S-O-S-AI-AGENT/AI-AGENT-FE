# E2E 테스터 네트워크 에러 해결 가이드

## 문제점
클라우드 배포 환경에서 E2E 테스터 진행 도중 Network 에러가 발생하는 문제

### 주요 에러 타입
1. **ERR_INCOMPLETE_CHUNKED_ENCODING**: 청크 전송이 완료되지 않음
2. **Network Timeout**: 장시간 응답 없음
3. **Connection Reset**: 프록시/로드밸런서가 연결 강제 종료

## 주요 원인
1. **프록시/로드밸런서 타임아웃**: 클라우드 환경의 프록시가 장시간 SSE 연결을 끊음
2. **스트림 종료 불완전**: finally 블록에서 스트림이 정상적으로 닫히지 않음
3. **에러 정보 부족**: 기존 에러 처리가 간단해서 정확한 원인 파악 어려움
4. **API 호출 안정성**: GitHub API, Gemini API 호출 시 재시도 로직 부재
5. **네트워크 모니터링 부족**: 연결 상태 추적 불가

## 개선 사항 (2025-10-31 업데이트)

### 1. 프론트엔드 (src/app/e2e-tester/page.tsx)

#### 1.1 상세 로깅 추가
```typescript
- 요청 시작/종료 시간 기록
- 각 메시지 수신 시 상세 로그 출력
- 에러 타입별 분류 및 상세 정보 표시
- 수신된 메시지 수 추적
```

#### 1.2 ERR_INCOMPLETE_CHUNKED_ENCODING 에러 처리 ⭐ NEW
```typescript
// 청크 에러 발생 시 수신된 데이터로 계속 진행
- 에러 감지 시 즉시 중단하지 않음
- 지금까지 받은 메시지 수를 사용자에게 안내
- 경고 메시지 표시 후 정상 진행
- 에러를 던지지 않고 루프 종료
```

#### 1.3 네트워크 타임아웃 감지
```typescript
- 60초 동안 응답 없으면 경고
- 마지막 활동 시간 추적
- 타임아웃 원인 상세 안내
```

#### 1.4 Fetch 타임아웃 설정
```typescript
- AbortController로 5분 타임아웃 설정
- 타임아웃 시 명확한 에러 메시지
```

#### 1.5 에러 분류 및 상세 메시지
```typescript
- AbortError: 요청 시간 초과
- INCOMPLETE_CHUNKED: 청크 전송 중단
- Failed to fetch: 네트워크 연결 실패
- NetworkError: 서버 연결 끊김
- 각 에러별 해결 방법 제시
```

### 2. 백엔드 (src/app/api/deploy-e2e/route.ts)

#### 2.1 안전한 스트림 종료 ⭐ NEW
```typescript
// writer.close() 개선
- 스트림 종료 전 마지막 개행 추가 (청크 완료 신호)
- try-catch-finally로 안전한 종료 보장
- 종료 실패 시 controller.error() 호출
- streamClosed 플래그로 중복 종료 방지
```

#### 2.2 writer.write() 반환값 활용 ⭐ NEW
```typescript
// 쓰기 성공 여부 확인
- write() 실패 시 false 반환
- 실패 시 스트림을 닫힌 것으로 처리
- heartbeat 전송 실패 시 인터벌 중지
```

#### 2.3 요청 ID 기반 추적
```typescript
- 각 요청에 고유 ID 부여
- 모든 로그에 요청 ID 포함
- 시작/종료 시간 및 총 메시지 수 기록
```

#### 2.4 개선된 Heartbeat 메커니즘 ⭐ NEW
```typescript
- startHeartbeat(), stopHeartbeat() 함수 분리
- 15초마다 heartbeat 전송
- 전송 실패 시 자동 중지
- finally 블록에서 확실히 정리
```

#### 2.5 안전한 Finally 블록 ⭐ NEW
```typescript
1. Heartbeat 먼저 중지
2. 마지막 상태 메시지 전송 시도
3. 스트림 종료 (여러 번 호출해도 안전)
4. 요청 처리 완료 로그
```

#### 2.3 Gemini API 재시도 로직
```typescript
- 최대 3번 재시도
- 각 시도마다 타임아웃 2분 설정
- 재시도 간격: 2초, 4초, 6초
- 실패 시 상세 에러 정보 제공
```

#### 2.4 GitHub API 에러 처리
```typescript
- collectRepoSnapshot에 try-catch 추가
- API 호출 각 단계별 로깅
- 에러 발생 시 명확한 메시지
```

#### 2.5 스트림 에러 처리 강화
```typescript
- ECONNRESET: 연결 재설정 감지
- ETIMEDOUT: 연결 시간 초과 감지
- ENOTFOUND: DNS 조회 실패 감지
- socket hang up: 소켓 연결 종료 감지
```

#### 2.6 HTTP 헤더 최적화
```typescript
- X-Accel-Buffering: no (Nginx 버퍼링 비활성화)
- Transfer-Encoding: chunked
- Cache-Control: no-cache, no-transform
```

## 로그 모니터링 방법

### 프론트엔드 (브라우저)
```javascript
// 개발자 도구 콘솔에서 확인
[E2E Tester] 요청 시작
[E2E Tester] 응답 수신
[E2E Tester] 메시지 #1
[E2E Tester] 스트림 읽기 에러
[E2E Tester] 최종 에러
```

### 백엔드 (서버 로그)
```javascript
// 서버 콘솔/로그 파일에서 확인
[req-123456-abc] POST 요청 시작
[req-123456-abc] 요청 본문 파싱 완료
[req-123456-abc] 메시지 #1
[req-123456-abc] Gemini API 호출 시도 1/3
[collectRepoSnapshot] 저장소 메타데이터 조회
```

## 클라우드 배포 시 주의사항

### 1. 로드밸런서 설정
```yaml
# Kubernetes Ingress 예시
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    # Nginx timeout 설정
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    # 버퍼링 비활성화
    nginx.ingress.kubernetes.io/proxy-buffering: "off"
```

### 2. 프록시 타임아웃 확인
- Nginx: `proxy_read_timeout`, `proxy_send_timeout`
- Apache: `ProxyTimeout`
- AWS ALB: `idle_timeout` (기본 60초)
- GCP Load Balancer: `timeout` 설정

### 3. 환경 변수 확인
```bash
# Gemini API 키 설정 확인
kubectl get secret -n <namespace>
kubectl describe deployment -n <namespace>
```

## 디버깅 체크리스트

### ERR_INCOMPLETE_CHUNKED_ENCODING 에러 발생 시 ⭐ NEW
1. ✅ **서버 로그 확인**
   ```bash
   # 요청 ID로 전체 흐름 추적
   kubectl logs deployment/ai-agent-fe | grep "req-xxxxx"
   
   # 스트림 종료 로그 확인
   kubectl logs deployment/ai-agent-fe | grep "스트림 종료"
   ```

2. ✅ **Finally 블록 실행 확인**
   - "Finally 블록 진입" 로그 확인
   - "Heartbeat 중지" 로그 확인
   - "스트림 정상 종료" 또는 "스트림 종료 실패" 확인

3. ✅ **프록시 타임아웃 설정 확인**
   ```bash
   # Nginx Ingress 설정 확인
   kubectl get ingress -o yaml
   
   # 타임아웃 값 확인 (600초 이상 권장)
   grep -i timeout
   ```

4. ✅ **수신된 메시지 수 확인**
   - 브라우저 콘솔: "[E2E Tester] 스트림 종료: totalMessages"
   - 에러 발생해도 일부 진행 가능한지 확인

### 로컬 환경에서 테스트
1. ✅ `npm run dev` 실행
2. ✅ 브라우저 개발자 도구 열기
3. ✅ E2E 테스터 페이지 접속
4. ✅ GitHub 저장소 URL 입력
5. ✅ 콘솔 로그 확인

### 클라우드 환경에서 테스트
1. ✅ 서버 로그 스트림 확인
   ```bash
   # Kubernetes
   kubectl logs -f deployment/<deployment-name> -n <namespace>
   
   # Docker
   docker logs -f <container-id>
   ```

2. ✅ 네트워크 타임아웃 확인
   - 브라우저 Network 탭에서 요청 시간 확인
   - 60초 이상 걸리면 타임아웃 경고 확인

3. ✅ 에러 메시지 분석
   - "ERR_INCOMPLETE_CHUNKED_ENCODING" → 스트림 종료 불완전 (아래 해결책 참고)
   - "연결이 재설정되었습니다" → 프록시 타임아웃
   - "요청 시간이 초과되었습니다" → 5분 초과
   - "API 호출 실패" → Gemini/GitHub API 문제

4. ✅ Heartbeat 확인
   - 서버 로그에서 15초마다 heartbeat 전송 확인
   - 프록시가 연결을 유지하는지 확인

## 문제 해결 순서

### ERR_INCOMPLETE_CHUNKED_ENCODING 해결 ⭐ NEW

#### 증상
- 브라우저 콘솔: `net::ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK)`
- 서버는 200 응답을 보냈지만 스트림이 정상 종료되지 않음
- 일부 데이터는 수신됨

#### 원인
1. **서버 스트림 종료 불완전**: finally 블록에서 에러 발생
2. **프록시 강제 종료**: 타임아웃으로 중간 연결 끊김
3. **네트워크 불안정**: 일시적 연결 문제

#### 해결 방법 (우선순위순)

**1단계: 코드 개선 (✅ 이미 적용됨)**
- writer.close()에 마지막 개행 추가
- try-catch-finally로 안전한 종료
- write() 반환값 확인
- heartbeat 안전한 중지

**2단계: 프록시 설정 조정**
```yaml
# Nginx Ingress (권장)
nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
nginx.ingress.kubernetes.io/proxy-buffering: "off"
nginx.ingress.kubernetes.io/proxy-request-buffering: "off"
```

**3단계: 클라이언트 재시도 로직**
- 현재는 에러 발생 시 경고만 표시
- 향후 개선: 마지막 step부터 자동 재시도

**4단계: 서버 로그 분석**
```bash
# 스트림 종료 로그 확인
kubectl logs deployment/ai-agent-fe | grep -A 5 "Finally 블록 진입"

# 에러 발생 확인
kubectl logs deployment/ai-agent-fe | grep "스트림 종료 실패"
```

### 일반 네트워크 에러 해결

#### 1단계: 로그 수집
```bash
# 프론트엔드: 브라우저 콘솔 복사
# 백엔드: 서버 로그 저장
kubectl logs deployment/<name> > e2e-error.log
```

### 2단계: 에러 타입 확인
- Network Error → 프록시/로드밸런서 설정
- Timeout Error → API 응답 시간 확인
- API Error → GitHub/Gemini API 키 확인

### 3단계: 설정 조정
- 프록시 타임아웃 증가 (600초 권장)
- Heartbeat 간격 조정 (필요 시 10초로 단축)
- Gemini API 재시도 횟수 증가

### 4단계: 재테스트
- 동일한 저장소로 재시도
- 더 작은 저장소로 테스트
- 단계별 로그 확인

## 성능 최적화 팁

1. **저장소 크기 제한**: 너무 큰 저장소는 처리 시간 증가
2. **파일 선택 최적화**: collectRepoSnapshot에서 20개 파일만 선택
3. **프롬프트 크기 제한**: Gemini API 입력 크기 관리
4. **병렬 처리**: GitHub API 호출 최적화 고려

## 추가 개선 가능 사항

- [x] **스트림 안전한 종료** (2025-10-31 완료)
  - writer.close()에 마지막 개행 추가
  - try-catch-finally 개선
  - write() 반환값 확인
- [x] **청크 에러 우아한 처리** (2025-10-31 완료)
  - ERR_INCOMPLETE_CHUNKED_ENCODING 감지
  - 수신된 데이터로 계속 진행
  - 사용자에게 명확한 안내
- [x] **Heartbeat 안전한 관리** (2025-10-31 완료)
  - startHeartbeat/stopHeartbeat 분리
  - 전송 실패 시 자동 중지
  - finally 블록에서 확실한 정리
- [ ] WebSocket으로 SSE 대체 고려
- [ ] 진행 상태를 Redis/DB에 저장하여 재연결 시 복구
- [ ] 청크 단위 처리로 메모리 사용량 감소
- [ ] GitHub API Rate Limit 모니터링
- [ ] Gemini API Quota 모니터링

## 버전 이력

### 2025-10-31 (v2.0) - ERR_INCOMPLETE_CHUNKED_ENCODING 해결
- ✅ 스트림 종료 안전성 대폭 개선
- ✅ writer.write() 반환값 활용
- ✅ 청크 에러 우아한 처리
- ✅ heartbeat 메커니즘 개선
- ✅ finally 블록 안전성 강화

### 2025-10-31 (v1.0) - 초기 버전
- ✅ 상세 로깅 추가
- ✅ Gemini API 재시도 로직
- ✅ 네트워크 에러 분류
- ✅ Heartbeat 메커니즘

## 관련 파일
- `/src/app/e2e-tester/page.tsx` - 프론트엔드 로직
- `/src/app/api/deploy-e2e/route.ts` - 백엔드 API
- `/k8s/deployment.yaml` - Kubernetes 배포 설정
- `/k8s/service.yaml` - Kubernetes 서비스 설정
