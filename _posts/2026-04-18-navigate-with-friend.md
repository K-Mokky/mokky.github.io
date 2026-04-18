---
title: "Navigate 앱 제작기"
categories: [IT, App, APP 제작]
---

# Navigate 앱 제작기

---

Navigate 앱 제작기

최종 앱 이름은 **친추 : 친구 추적기** 로 정했다.

처음 아이디어는 간단했다.

친구들이 어디에 있는지 지도 위에서 보고 싶었다.

그냥 점 하나 찍는 지도 앱이 아니라,

게임 미니맵처럼 친구의 현재 위치,

이동 경로,

속도,

상태가 보이는 앱을 만들고 싶었다.


![사진1](/assets/img/navigate-1.png)


약간 이런 느낌이다.


~~~text
친구 위치 공유 + 게임 미니맵 + 네비게이션 느낌
~~~


그리고 iOS에서 쓸 앱이므로,

영상통화는 FaceTime 기반으로 연결하면 좋겠다고 생각했다.


---

## 처음 사용한 프롬프트

처음에는 Claude Code로 만들어둔 초기 구현이 있었다.

그 뒤에 Codex에게 다음처럼 요청했다.


~~~text
Claude Code를 이용해서 github에 제작했던 앱 초기 구현이야.
github 레포지터리의 Branch를 모두 다운로드 한거야.
구현하고자 하는 내용은 아래와 같아. 이를 참고해서 코드를 수정하고 완성해줘.

친구들의 실시간 위치와 이동 경로, 현재 속도 등을 지도상에 표시해주는 그런 앱을 만들려고 해.
약간 게임의 맵에서 같이 플레이중인 친구들의 상태와 이동 경로를 볼 수 있는 것 같이. 물론, 앱을 실행해야지 작동되는 방식으로. 핸드폰 네비게이션 앱 처럼.

추가로, 친구가 근처에 있을 시 알림이 오는 기능, 영상통화 ( Face Time )을 걸 수 있는 기능을 넣어줘
IOS 앱을 만들 예정이라서 영상 통화는 Face Time을 기반으로 해도 돼

프론트엔드로는 Flutter를, 백엔드로는 Supabase를 사용할 예정이야.
~~~


정리하면 이렇다.


| 영역 | 선택 |
| :---: | :--- |
| 프론트엔드 | Flutter |
| 백엔드 | Supabase |
| 지도 | Flutter Map / OSM 계열 |
| 실시간 위치 | Supabase Realtime |
| 영상통화 | FaceTime URL |
| 대상 | iOS 우선 |


Codex는 먼저 기존 Flutter 프로젝트 구조를 확인했다.


~~~text
lib/
  config/
  models/
  providers/
  screens/
  services/
  widgets/
supabase/
ios/
~~~


그리고 부족한 부분을 하나씩 채웠다.


---

## 처음 완성한 기능들

처음 보강한 기능은 꽤 많았다.


~~~text
Supabase 로그인/회원가입
사용자 프로필 생성
친구 검색
친구 요청/수락/거절
내 위치 업로드
친구 위치 지도 표시
친구 이동 경로 표시
근접 알림
FaceTime 연결
위치 공유 OFF 처리
Supabase RLS 보안 정책
README / SETUP 문서
~~~


이 정도면 벌써 앱 하나다.

하지만 실시간 위치 앱은 그냥 “보인다”에서 끝나면 안 된다.

위치 공유를 껐는데 마지막 위치가 남아있으면 위험하고,

친구 요청을 아무나 조작할 수 있으면 안 되고,

백엔드 정책도 맞아야 한다.

그래서 Supabase 쪽도 같이 만들었다.


~~~sql
create table public.profiles (...);
create table public.friendships (...);
create table public.locations (...);
create table public.location_history (...);
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
~~~


앱 코드만 만든 게 아니라,

DB 테이블과 RLS 정책도 같이 생성했다.


---

## Supabase 무료 플랜을 고민했다

실시간 위치 앱에서 가장 무서운 것은 용량이다.

그래서 내가 물었다.


~~~text
이 앱이 근데 Supabase 무료 버전 기준 500Mb 용량으로도 충분할까?
~~~


결론은 이랬다.


~~~text
소규모 MVP라면 가능하다.
하지만 이동 경로를 너무 자주, 너무 오래 저장하면 금방 찬다.
~~~


특히 문제가 되는 테이블은 `location_history`였다.

현재 위치 하나만 저장하는 `locations`는 괜찮다.

하지만 이동 경로를 계속 insert하는 `location_history`는 쌓이면 쌓일수록 커진다.

그래서 정책을 정했다.


~~~text
위치 업로드 주기: 10초에 한 번
기록 보관 기간: 최대 7일
기록 저장 거리/개수: 제한 없음
만난 친구 기준: 50m 이내
~~~


여기서 앱의 핵심 기능인 **기록 공유 방**이 생겼다.


---

## 기록 공유 방 기능

내가 원한 기록 방식은 이랬다.


~~~text
1. 한 명이 기록 공유 방을 생성한다.
2. 방 생성자가 링크나 코드를 친구에게 보낸다.
3. 친구들이 같은 방에 들어온다.
4. 기록 시작 버튼을 누르면 위치와 이동경로가 저장된다.
5. 기록 종료 버튼을 누르면 총 이동 거리와 만난 친구가 저장된다.
~~~


Codex는 이 구조를 위해 테이블을 추가했다.


| 테이블 | 역할 |
| :---: | :--- |
| recording_rooms | 기록 공유 방 |
| room_members | 방 참가자 |
| recording_sessions | 사용자의 기록 시작~종료 단위 |
| location_history | 방/세션에 연결된 위치 기록 |


그리고 앱에는 `Rooms` 화면이 추가되었다.


~~~text
방 생성
초대 코드 복사
링크/코드로 방 참여
기록 시작
기록 종료
총 이동 거리 확인
만난 친구 확인
~~~


기록 중 위치 업로드 주기는 코드에서 이렇게 고정했다.


~~~dart
static const Duration locationUploadInterval = Duration(seconds: 10);
~~~


만난 친구 기준은 따로 분리했다.


~~~dart
static const double encounterThresholdMeters = 50.0;
~~~


근접 알림은 500m,

기록방에서 “만났다” 판정은 50m.

둘을 분리한 것이 중요했다.


---

## Supabase 설정과 키

나중에 실제 Supabase 프로젝트를 만들고 URL과 publishable key를 전달했다.

블로그에 공개되는 글이라 실제 값은 가렸다.


~~~text
Supabase 프로젝트 URL은 아래와 같아.
<프로젝트 URL>

퍼블릭 키는 아래와 같아.
<publishable key>

Flutter는 설치 완료해서 이제 너가 빌드해주면 돼.
추가로, 만약 내 아이폰에서 이 앱을 테스트 해보려고 하는데 필요하면 XCode 코드도 작성해줘.
~~~


여기서 중요한 점은,

앱에는 **service_role key**를 절대 넣으면 안 된다는 것이다.

Flutter 앱에는 publishable key만 들어가야 한다.

코드는 이렇게 구성했다.


~~~dart
class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '<프로젝트 URL>',
  );

  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '<publishable key>',
  );
}
~~~


실제 저장소에는 내가 테스트하기 쉽게 기본값이 들어가 있었지만,

공개 블로그에는 이렇게 가리는 게 맞다.


---

## iPhone 테스트를 위한 iOS 설정

Flutter 앱이라고 해서 iOS 설정이 필요 없는 것은 아니었다.

오히려 위치 앱이라 iOS 설정이 꽤 중요했다.


~~~text
위치 권한 문구
백그라운드 위치 모드
FaceTime URL scheme
기록방 초대 링크 URL scheme
CocoaPods 설정
Xcode Signing
~~~


`Info.plist`에는 이런 종류의 값들이 들어갔다.


~~~xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>친구와 위치를 공유하기 위해 현재 위치가 필요합니다.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>기록 중 백그라운드에서도 위치를 저장하기 위해 필요합니다.</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
~~~


그리고 FaceTime을 열기 위해 URL scheme도 허용했다.


~~~text
facetime
facetime-audio
~~~


이런 iOS 설정은 앱 기능과 직접 연결된다.

위치 권한 문구가 없으면 빌드나 실행에서 문제가 생기고,

백그라운드 위치 모드가 없으면 기록 앱으로 쓰기 어렵다.


---

## 중간에 생긴 오류들

빌드 과정에서 오류도 있었다.

대표적으로 이런 것들이다.


~~~text
dart:ui Path 와 latlong2 Path 이름 충돌
AppleSettings const 오류
기본 widget_test.dart의 오래된 MyApp 참조
CocoaPods / Xcode 설정 문제
~~~


Codex는 코드를 확인하고 수정했다.


~~~text
map_screen.dart에서 Path 이름 충돌 수정
location_service.dart에서 잘못된 const 제거
widget_test.dart를 현재 앱에 맞게 교체
Podfile에 Flutter iOS plugin 설정 추가
~~~


그리고 가능한 검증을 돌렸다.


~~~bash
flutter pub get
flutter analyze
flutter test
flutter build bundle
plutil -lint ios/Runner/Info.plist
ruby -c ios/Podfile
~~~


결과는 이랬다.


~~~text
flutter analyze: No issues found
flutter test: All tests passed
flutter build bundle: 성공
Info.plist: OK
Podfile: Syntax OK
~~~


처음에는 Xcode와 CocoaPods가 완전히 준비되지 않아 iOS 네이티브 빌드가 막혔고,

나중에 환경을 정리하면서 iPhone 테스트 방향을 잡았다.


---

## 앱 이름과 브랜딩

처음 앱 이름은 `Friend Tracker`나 `RADAR` 계열로 남아 있었다.

하지만 나는 최종 이름을 한국어로 정하고 싶었다.

그래서 이렇게 요청했다.


~~~text
아이콘은 아주 좋은거 같아. 너가 새로 제작한거지? 최고야! 근데, 이름은 Friend Tracker말고 '친추 : 친구 추적기'로 변경해줘.
앱을 처음 실행하면 로딩 화면에, RADAR라고 써 있던데, 이것도 '친추'로 바꿔주고 아래 나오는 문구는 '친구를 추적하자!'로 변경해줘.
~~~


그 결과 앱 이름과 문구가 이렇게 바뀌었다.


~~~text
Friend Tracker → 친추 : 친구 추적기
RADAR → 친추
친구들의 실시간 위치 → 친구를 추적하자!
~~~


그리고 나중에는 로고도 통일했다.


~~~text
앱을 실행했을 때 나오는 로고를 F 모양의 현재 앱 아이콘으로 변경해줘.
인 앱 화면에서도 지금 앱 아이콘을 로고로 설정해줘.
모든 이 앱의 로고는 지금 설정돼있는 F 모양의 앱 아이콘으로 통일해줘.
~~~


지도 왼쪽 위에 있던 `로고 + 친추` 표시도

그냥 로고만 보이도록 바꿨다.


![사진2](/assets/img/navigate-icon.png)


앱 이름을 지우고 아이콘만 남기니,

미니맵 느낌이 더 강해졌다.


---

## 사용된 이미지

Navigate 앱에서 사용한 대표 이미지는 F 모양 앱 아이콘이다.


~~~text
Navigate Map/assets/branding/app_icon.png
Navigate Map/ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png
Navigate Map/ios/Runner/Assets.xcassets/LaunchImage.imageset/LaunchImage.png
~~~


블로그에 올릴 때는 아래처럼 복사해서 쓰면 된다.


~~~text
/assets/img/navigate-icon.png
/assets/img/navigate-map.png
/assets/img/navigate-rooms.png
~~~


![사진3](/assets/img/navigate-map.png)


이 이미지는 앱 아이콘,

스플래시 화면,

로그인 화면,

지도 상단 로고,

인앱 로고에 통일해서 사용했다.


---

## 속도 단위도 추가했다

처음에는 속도 단위가 한 가지였다.

하지만 나중에 mph도 쓸 수 있게 해달라고 요청했다.


~~~text
속도 단위도 mph로도 변경할 수 있게 코딩해주고.
~~~


그래서 설정 화면에 속도 단위 선택이 추가되었다.


~~~text
설정 > 지도 > 속도 단위
km/h
mph
~~~


적용된 위치는 여러 곳이었다.


~~~text
지도 우측 속도계
친구 마커 위 속도 배지
친구 목록의 이동 속도
친구 정보 시트의 속도 카드
~~~


이런 설정은 `SharedPreferences`에 저장되도록 했다.

즉 앱을 껐다 켜도 선택한 단위가 유지된다.


---

## 보안 검토도 했다

위치 앱은 보안이 중요하다.

그래서 마지막에 키가 노출되어 있지 않은지,

위치 정보가 잘 보호되는지 검토했다.


~~~text
보안 측면에서 마지막으로 검증 한번만 부탁할게 gemini와 함께 팀을 이뤄서 검수해줘. 키가 오픈돼있지는 않은지 이런것들.
~~~


검토 결과,

위험한 비밀키는 발견되지 않았다.

하지만 Supabase publishable key는 코드에 있고,

이 키 자체는 공개 가능한 키지만,

RLS가 약하면 문제가 될 수 있다는 결론이 나왔다.

특히 `profiles`에서 이메일이나 전화번호 같은 개인정보가 넓게 보이지 않도록 조심해야 했다.


~~~text
service_role key 없음
Supabase publishable key 있음
RLS 보완 필요
.omx 로그는 공유/커밋 금지
radar:// auth redirect는 배포 전 개선 권장
~~~


그래서 `.omx/`는 `.gitignore`에 추가했다.


~~~gitignore
.omx/
~~~


AI 작업 로그에는 프롬프트나 설정 조각이 들어갈 수 있기 때문이다.

이런 건 절대 GitHub에 올리면 안 된다.


---

## 용량 정리

개발하다 보니 프로젝트 폴더가 엄청 커졌다.

그래서 마지막에는 필요 없는 산출물을 정리했다.


~~~text
build/
.dart_tool/
ios/Pods/
ios/.symlinks/
ios/Flutter/Generated.xcconfig
ios/Flutter/flutter_export_environment.sh
.omx/
.DS_Store
~~~


삭제 전 프로젝트 폴더는 약 748MB였고,

삭제 후에는 약 616KB 수준까지 줄었다.

추가로 Xcode DerivedData도 약 365MB 정리했다.


~~~text
프로젝트 내부 약 747MB 회수
Xcode DerivedData 약 365MB 회수
합계 약 1.1GB 회수
~~~


소스 코드는 지우지 않고,

다시 생성 가능한 빌드 산출물만 지웠다.

다시 실행하려면 아래처럼 하면 된다.


~~~bash
flutter pub get
cd ios
pod install
cd ..
flutter run
~~~


---

## 최종 구조

최종적으로 Navigate 앱은 이런 기능을 가진 앱이 되었다.


~~~text
Supabase 이메일 로그인/회원가입
친구 검색/요청/수락/삭제
실시간 위치 업로드
친구 위치 마커
이동 경로 폴리라인
현재 속도 표시
근접 알림
FaceTime 영상/음성 연결
위치 공유 OFF
기록 공유 방
10초마다 위치 기록
최대 7일 보관
50m 이내 만난 친구 기록
km/h / mph 속도 단위 선택
F 모양 앱 아이콘 브랜딩
~~~


중심 파일은 아래와 같다.


~~~text
lib/config/supabase_config.dart
lib/providers/auth_provider.dart
lib/providers/location_provider.dart
lib/providers/friends_provider.dart
lib/providers/rooms_provider.dart
lib/screens/map/map_screen.dart
lib/screens/rooms/rooms_screen.dart
lib/screens/friends/friends_screen.dart
lib/screens/settings/settings_screen.dart
lib/services/supabase_service.dart
lib/services/location_service.dart
lib/services/facetime_service.dart
supabase/schema.sql
supabase/rls_policies.sql
assets/branding/app_icon.png
~~~


앱 하나를 만들기 위해 Flutter 코드만 필요한 게 아니었다.

Supabase SQL,

iOS 권한,

CocoaPods,

Xcode Signing,

보안 정책,

아이콘,

문서까지 전부 필요했다.


---

## 느낀 점

처음에는 “친구 위치를 지도에 보여주는 앱” 정도로 생각했다.

하지만 실제로 만들어보니,

실시간 위치 앱은 생각보다 고려할 게 많았다.


~~~text
위치 권한
백그라운드 기록
친구 관계
Realtime 구독
DB 용량
RLS 보안
초대 링크
기록 보관 기간
앱스토어 개인정보 고지
~~~


그래도 AI와 대화하면서 하나씩 쪼개니까,

아이디어가 실제 프로젝트 구조로 변했다.


![사진4](/assets/img/navigate-rooms.png)


처음 프롬프트는 단순한 상상이었고,

마지막 결과는 실제 iPhone에서 테스트할 수 있는 Flutter/Supabase 앱이 되었다.


끗
