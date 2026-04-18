---
title: "IpadBattery 앱 제작기"
categories: [IT, App, APP 제작]
---

# IpadBattery 앱 제작기

---

IpadBattery 앱 제작기

정확한 앱 이름은 나중에 **빠때리!** 로 정했다.

아이패드나 아이폰에서 배터리 효율을 확인하고 싶은데,

설정 화면에서 바로 보이는 값만으로는 뭔가 아쉬웠다.

그래서 이번에는 사용자가 직접 가져온

`분석 및 향상`의 Analytics 로그 파일을 읽어서

배터리 효율, 사이클 수, 용량, 남은 사용 시간 같은 정보를 보여주는 앱을 만들어보기로 했다.


![사진1](/assets/img/ipadbattery-1.png)


처음 목표는 단순했다.


~~~text
Analytics 파일을 넣으면,
배터리 정보를 보기 좋게 정리해주는 앱
~~~


근데 막상 만들다 보니,

이게 생각보다 단순한 앱이 아니었다.


---

## 처음 사용한 프롬프트

처음에는 이렇게 요청했다.


~~~text
아이패드나 아이폰 이용자가 '분석 및 향상'의 분석 데이터인 .ips.ca.synced 파일을 입력하면 해당 파일을 기반으로 기기의 배터리 효율이나, 총 용량, 현재 충전 가능한 최대 용량, 사이클은 얼마인지, 앞으로 몇 시간 더 사용할 수 있는지 등을 알려주는 IOS 전용 앱을 만들려고 해. 내가 미리 대충 만들어본 코든데 이를 활용하여 보충하거나 변경해줘.
~~~


한 문장으로 정리하면,

**내가 대충 만들어둔 iOS 앱을 기반으로 배터리 로그 분석 앱을 완성해줘** 라는 요청이었다.

나는 SwiftUI 프로젝트를 가지고 있었고,

Codex는 먼저 프로젝트 구조를 확인했다.


~~~text
BatteryLogInsight.xcodeproj
BatteryLogInsight/
Models/
Services/
Views/
Resources/
~~~


그리고 앱을 다음 구조로 정리했다.


| 영역 | 역할 |
| :---: | :--- |
| Models | 배터리 리포트, 배터리 지표 데이터 구조 |
| Services | Analytics 파일 파싱, 기록 저장, 현재 배터리 감시 |
| Views | 대시보드, 상세 화면, 히스토리, 가이드 |
| Resources | 데모 로그, 앱 아이콘 |


뭔가 앱 같아졌다.


---

## 핵심은 Analytics 파일 파싱이었다

이 앱에서 제일 중요한 부분은 당연히 파일 파싱이었다.

사용자가 가져오는 파일은 보통 이런 이름이다.


~~~text
Analytics-2026-04-16-090001.000.ips.ca.synced
~~~


나는 예시 파일도 넣어두었다.


~~~text
IpadBattery/Example/Analytics-2026-04-09-090010.000.ips.ca.synced
IpadBattery/Example/Analytics-2026-04-16-090001.000.ips.ca.synced
~~~


그리고 다시 이렇게 요청했다.


~~~text
예시파일을 Example 디렉토리 안에 넣어놨어. 이를 바탕으로 필요 정보들을 파악하고 코드를 보충해줘. 그리고, 업로드 된 파일 명이 Example 속에 있는 파일들과 이름 형식이 다르다면, "Analytics 파일을 원본 그대로 수정 없이 업로드 해주세요!"를 출력하는 부분도 구현해줘.
~~~


여기서 앱의 방향이 많이 정해졌다.

단순히 파일을 읽는 것이 아니라,

**원본 Analytics 파일인지 검사하고, 실제 로그에 들어있는 키를 기준으로 정보를 뽑아내는 방식**으로 바뀌었다.


~~~swift
enum BatteryAnalyticsParserError: LocalizedError {
    case unreadableFile
    case noBatteryMetrics
    case invalidOriginalAnalyticsFileName

    var errorDescription: String? {
        switch self {
        case .unreadableFile:
            return "파일을 텍스트로 읽지 못했습니다."
        case .noBatteryMetrics:
            return "배터리 관련 키를 찾지 못했습니다. Analytics 또는 aggregated log 파일인지 확인해 주세요."
        case .invalidOriginalAnalyticsFileName:
            return "Analytics 파일을 원본 그대로 수정 없이 업로드 해주세요!"
        }
    }
}
~~~


이 문구가 들어가면서,

사용자가 이름을 바꾼 파일을 업로드했을 때도 안내할 수 있게 되었다.


---

## 실제로 찾은 배터리 키들

예시 Analytics 파일을 기준으로 확인한 키는 이런 것들이었다.


~~~text
last_value_AppleRawMaxCapacity
last_value_BatteryHealthMetric
last_value_CycleCount
last_value_CycleCountLastQmax
last_value_MaximumCapacityPercent
last_value_NominalChargeCapacity
last_value_OriginalBattery
last_value_batteryServiceFlags
UnpluggedDurationEnergyViewNew.daily_total_Duration
UnpluggedDurationEnergyViewNew.daily_total_Energy
UnpluggedDurationEnergyViewNew.daily_total_unplugged_count
~~~


이게 머선 소리고?

처음 보면 이름부터 길고 어렵다.

그래도 하나씩 보면 꽤 직관적이다.


| 키 | 의미 |
| :--- | :--- |
| MaximumCapacityPercent | 배터리 최대 용량 퍼센트 |
| CycleCount | 충전 사이클 수 |
| NominalChargeCapacity | 현재 충전 가능한 최대 용량 |
| AppleRawMaxCapacity | Raw 기준 최대 용량 |
| BatteryHealthMetric | 배터리 건강 관련 참고 지표 |
| batteryServiceFlags | 서비스 상태 관련 플래그 |


Codex는 이 키들을 여러 별칭으로 찾도록 파서를 만들었다.

왜냐하면 iOS 버전이나 기기마다 키 이름이 조금씩 다를 수 있기 때문이다.


~~~swift
maximumCapacityPercent: findInt(
    in: normalized,
    aliases: [
        "com.apple.power.battery.MaximumCapacityPercent",
        "MaximumCapacityPercent",
        "batteryMaximumCapacityPercent",
        "last_value_MaximumCapacityPercent",
        "last_value_BatteryMaximumCapacityPercent",
        "BatteryMaximumCapacityPercent"
    ],
    matchedKeys: &matchedKeys,
    fieldKey: "maximumCapacityPercent"
)
~~~


하나의 값만 믿지 않고,

비슷한 이름들을 모두 확인하는 구조다.

이런 방식이 실제 로그 기반 앱에는 훨씬 안전하다.


---

## 총 용량은 어떻게 계산했을까?

예시 파일에는 항상 `DesignCapacity`가 명확히 들어있지 않았다.

그 대신 이런 값들이 있었다.


~~~text
MaximumCapacityPercent
NominalChargeCapacity
AppleRawMaxCapacity
~~~


그래서 총/설계 용량이 없을 때는 역산했다.


~~~text
총/설계 용량 ≈ 현재 충전 가능한 최대 용량 / MaximumCapacityPercent
~~~


코드로는 이런 느낌이다.


~~~swift
var totalCapacityValue: Int? {
    if let designCapacity {
        return designCapacity
    }

    guard let maximumChargeCapacityValue,
          let maximumCapacityPercent,
          maximumCapacityPercent > 0 else {
        return nil
    }

    return Int((Double(maximumChargeCapacityValue) / (Double(maximumCapacityPercent) / 100.0)).rounded())
}
~~~


즉,

현재 최대 충전 가능 용량이 6429이고,

배터리 효율이 84%라면,

대략적인 총 설계 용량을 계산할 수 있다.


~~~text
6429 / 0.84 ≒ 7654
~~~


띠용?

생각보다 그럴듯하게 나온다.


---

## 앱 화면에 보여준 정보들

대시보드와 상세 화면에는 이런 값들을 보여주도록 했다.


~~~text
배터리 효율
충전 사이클 수
총/설계 용량
현재 충전 가능한 최대 용량
설계 대비 감소율
BatteryHealthMetric
batteryServiceFlags
최근 언플러그 누적 시간
로그 기반 완충 환산 사용 시간
~~~


그리고 사용자가 헷갈리지 않도록 안내 문구도 추가했다.


~~~text
로그 기반 사용 시간은 대기 시간이 포함될 수 있어 실제 화면 켜짐 사용 시간과 차이가 날 수 있습니다.
~~~


이 문구도 나중에 내가 따로 요청해서 결과 화면 하단에 넣었다.


![사진2](/assets/img/ipadbattery-2.png)


배터리 앱에서 중요한 건 숫자만 보여주는 게 아니라,

그 숫자가 어느 정도 믿을 수 있는지 알려주는 것이라고 생각했다.


---

## 파일 넣는 곳 아래 Tip 문구

처음 앱을 쓰는 사람은 Analytics 파일을 어디서 가져와야 하는지 모를 수 있다.

그래서 파일 업로드 버튼 아래에 Tip을 넣었다.


~~~text
Tip! 설정 앱 --> 개인정보 보호 및 보안 --> 분석 및 향상 --> 분석 데이터에 있는 'Analytics' 파일들 중 가장 최근 파일을 해당 창에 업로드 해주세요.
~~~


이 문구를 넣어달라고 요청했고,

대시보드와 가이드 화면 모두에 반영했다.


~~~text
분석 로그 가져오기
데모 로그
Tip! 설정 앱 --> 개인정보 보호 및 보안 --> 분석 및 향상 --> 분석 데이터...
~~~


이런 사소한 안내가 실제 앱에서는 꽤 중요하다.

사용자가 파일을 찾지 못하면,

아무리 기능이 좋아도 앱을 못 쓰기 때문이다.


---

## 앱 이름은 빠때리!

처음 프로젝트 이름은 `BatteryLogInsight`에 가까웠다.

하지만 최종 앱 이름은 더 기억하기 쉽게 바꾸고 싶었다.

그래서 이렇게 요청했다.


~~~text
앱 이름을 '빠때리!'로 수정해줘.
~~~


나중에는 맥북에서 앱 아이콘에 커서를 올렸을 때 이름이 이상하게 보이는 것도 수정했다.


~~~text
맥북에서 테스트해볼 때, 아이콘에 커서를 올려놓으면 빠때리!라는 이름이 안 뜨고 BatteryIpad 비슷한 이름으로 떠. 그것도 빠때리!로 변경해줘.
~~~


이때 수정된 파일은 주로 `Info.plist`와 Xcode 프로젝트 설정이었다.


~~~text
CFBundleName = 빠때리!
CFBundleDisplayName = 빠때리!
CFBundleGetInfoString = 빠때리!
~~~


이름 하나 바꾸는 것도,

앱 내부 문자열,

Finder 표시 이름,

번들 정보,

Xcode 설정이 모두 얽혀 있었다.


---

## 사용된 이미지


![사진3](/assets/img/ipadbattery-icon.png)


나중에 나는 아이콘에 있는 글씨가 더 꽉 차게 보이도록 수정해달라고 했다.


~~~text
앱 아이콘을 글씨가 아이콘을 꽉 채울 수 있도록 확대해줘.
그리고, 앱 내부에 있는 배터리 잔량, 저장된 로그 수, 남은 사용 시간, 배터리 효율 등 정보가 들어있는 네모의 크기를 모두 동일하게 바꿔줘.
가장 큰 네모를 기준으로 해서 그거에 맞춰서 동일하도록.
~~~


Codex는 AppIcon 세트의 PNG들을 다시 만들고,

대시보드의 `MetricCard` 높이를 동일하게 맞췄다.


~~~text
현재 배터리 잔량
저장된 로그 수
남은 사용 시간
배터리 효율
~~~


이 카드들이 서로 높이가 다르면 은근히 거슬리는데,

맞춰놓으니 훨씬 앱 같아졌다.


---

## 배포 준비도 같이 했다

앱을 만들고 나니 자연스럽게 다음 질문이 생겼다.


~~~text
너가 아이패드, 아이폰 배터리 효율 확인하는 프로그램을 만들어줬잖아. 이제 그걸 배포하려면 내가 뭘 어떻게 하면 돼?
~~~


이때 정리한 배포 준비는 아래와 같았다.


~~~text
Apple Developer Program 가입
Xcode 설치 및 로그인
Bundle ID 설정
Signing Team 지정
앱 아이콘 교체
개인정보 처리방침 URL 준비
App Store Connect 메타데이터 작성
TestFlight 배포
App Store 심사 제출
~~~


그리고 실제 프로젝트에는 이런 문서들도 만들어졌다.


~~~text
APP_STORE_***_KO.md
APP_STORE_**N*S.md
PRIVACY_POLICY_T******.md
~~~


특히 이 앱은 배터리 정보를 다루기 때문에,

앱 설명을 조심해야 했다.


~~~text
사용자가 직접 선택한 분석 로그를 로컬에서 정리합니다.
앱은 설정 앱 내부 데이터를 자동으로 읽지 않습니다.
원본 로그는 서버로 업로드하지 않습니다.
~~~


이런 식으로 표현하는 게 안전하다.


---

## 검증은 어떻게 했나?

코드를 생성한 뒤에는 가능한 범위에서 검증했다.

확인한 내용은 이런 것들이었다.


~~~text
Info.plist 문법 확인
Xcode project 파일 확인
Swift 모델/파서 타입 체크
Example Analytics 파일 파싱 확인
잘못된 파일명 에러 메시지 확인
~~~


예시 파일 파싱 결과는 이런 느낌이었다.


~~~text
Analytics-2026-04-09-090010.000.ips.ca.synced
health=84, cycle=351, total=7588, max=6374

Analytics-2026-04-16-090001.000.ips.ca.synced
health=84, cycle=354, total=7654, max=6429
~~~


전체 iOS 빌드는 환경에 따라 Xcode 플랫폼 설치 상태가 필요했다.

그래서 최종적으로는 실제 Xcode에서 한 번 더 확인하는 흐름으로 정리했다.


---

## 만들어진 주요 파일들

최종적으로 앱의 중심 파일의 내용은 아래와 같다.

파서는 로그를 읽고,

모델은 값을 계산하고,

화면은 사용자가 이해할 수 있게 보여준다.


---

## 느낀 점

이번 앱은 AI에게 “앱 하나 만들어줘”라고 한 번에 던진 작업이라기보다는,

내가 기능을 하나씩 말하고,

Codex가 코드를 수정하고,

다시 내가 실제 사용 흐름을 보고,

부족한 부분을 다시 요청하는 방식으로 만들어졌다.


~~~text
기능 요청
→ 프로젝트 구조 확인
→ 파서/모델/화면 코드 생성
→ 예시 파일로 검증
→ UI 문구 수정
→ 앱 이름/아이콘 수정
→ 배포 준비 문서 정리
~~~


이런 흐름이었다.

처음에는 단순한 배터리 효율 확인 앱이라고 생각했는데,

실제로는 파일 검증,

로그 키 호환성,

앱스토어 심사 문구,

아이콘,

배포 준비까지 전부 필요했다.


![사진4](/assets/img/ipadbattery-result.png)


그래도 결과적으로,

아이패드 Analytics 파일을 직접 넣고,

배터리 정보를 정리해서 볼 수 있는 앱이 만들어졌다.


끗
