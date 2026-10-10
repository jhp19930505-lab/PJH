# GitHub Pages 배포용 — Park Ji Hye Portfolio (V6)

이 저장소는 **사용자가 수정한 V6 ZIP의 `site/` 폴더 내용 그대로**를 저장소 루트로 옮긴 배포용 패키지입니다. 기존 HTML 문구, 이미지, CSS, JavaScript, 영상 내용을 수정하지 않았습니다.

## GitHub에 올리는 방법 (웹 브라우저)
1. 이 ZIP을 **압축 해제**합니다. ZIP 파일 자체를 GitHub에 1개 파일로 올리지 마세요.
2. GitHub에서 새 저장소(예: `portfolio`)를 만들고 **Add file → Upload files**를 선택합니다.
3. 압축을 푼 폴더 안의 `index.html`, `assets/`, `projects/`, `.nojekyll`을 **저장소 최상위**에 업로드합니다. `site/`로 한 번 더 감싸지 마세요.
4. **Commit changes**로 저장합니다.
5. 저장소 **Settings → Pages → Build and deployment → Deploy from a branch**를 선택하고 Branch를 `main`, Folder를 **`/(root)`**로 지정해 저장합니다.
6. 배포가 완료되면 `https://계정명.github.io/저장소명/`에서 확인합니다. 저장소 이름을 정확히 `계정명.github.io`로 만들었다면 `https://계정명.github.io/`입니다.

## 폴더 구조
- `index.html`: 메인 페이지
- `projects/<slug>/index.html`: 각 프로젝트 상세페이지
- `assets/css/site.css`: 전체 스타일과 반응형
- `assets/js/site.js`: 메뉴·필터·영상·모달 동작
- `assets/js/film-config.js`: KOLL/HANUL의 MP4 파일 경로
- `assets/video/`: 실제 재생용 720p/1080p MP4 파일
- `assets/originals/`: 작품 원본 이미지
- `.nojekyll`: GitHub Pages에서 파일을 그대로 서비스하도록 지정

## 주의할 점
- **개인정보·저작권·회사 자료 공개 가능 여부**를 배포 전에 최종 확인하세요. GitHub에 올리면 공개 범위 설정에 따라 누구나 볼 수 있습니다.
- 동영상은 사이트에 포함된 MP4를 사용합니다. 영상 자동재생 및 오디오는 방문자 브라우저 정책에 따라 제한될 수 있습니다.
- MP4 파일을 수정할 경우 `assets/video/`에서 교체하거나 `assets/js/film-config.js`의 경로를 변경하세요.
- GitHub Pages는 정적 사이트를 배포합니다. Python CMD 실행 파일은 업로드할 필요가 없습니다.
- GitHub 저장소가 기존에 존재한다면, 오래된 `site/` 폴더와 새 파일이 섞이지 않도록 최상위 파일 구조를 확인하세요.

## 검증
`DEPLOY_VALIDATION.json`은 사이트 파일 개수, 해시 일치, 링크/자산 경로 등 제작 당시 수행한 정적 검수 결과입니다. 실제 GitHub 원격 배포는 포함되지 않습니다.
