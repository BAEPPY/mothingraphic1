# 한라초 CHARM 홍보 영상

한라초등학교 홍보용 25초 모션그래픽 (1920x1080, 60fps, 음악 없음).

로고 → 교훈 → CHARM(창의, 건강, 감성, 소통, 인성) → 꿈 I-E.U.M 진로연계 교육 모델 → 로고 순서로, 컷 없이 한 컷으로 이어져요.

## 파일

- `index.html`: 영상 전체. `seek(t)`가 시간 t의 화면을 그려요. 문구, 색, 타이밍(`T`), 재생 속도(`SPEED`)가 모두 여기 있어요.
- `render.mjs`: Playwright로 프레임을 찍어 ffmpeg로 MP4를 만들어요.
- `popcheck.py`: 렌더된 영상에서 한 프레임만 튀는 곳을 찾아요.
- `glyphs.js`: CHARM 글자 윤곽 (Archivo, 폭 125, 굵기 800에서 추출).
- `fonts/`: Pretendard, Archivo (둘 다 SIL Open Font License).
- `vendor/flubber.min.js`: 글자가 그림으로 변하는 모양 보간.

## 렌더

Node, Playwright(Chromium), ffmpeg가 필요해요.

```sh
node render.mjs film out.mp4                 # 전체 영상 (25초)
node render.mjs stills 1.5,10,20 stills/     # 특정 시간의 스틸
python3 popcheck.py out.mp4                  # 튀는 프레임 검사
```

`SUB` 환경 변수로 프레임당 섞는 서브프레임 수(기본 4), `DUR`로 길이(기본 25초)를 바꿀 수 있어요.
