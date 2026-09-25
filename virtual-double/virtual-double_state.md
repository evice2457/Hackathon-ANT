# VirtualDouble — Local Project State & Design System Tracker
> **Lưu ý**: File này được tạo và lưu trữ độc quyền tại máy local để theo dõi toàn bộ trạng thái chi tiết, bảng màu, typography, icons, components và luồng dữ liệu của dự án VirtualDouble.

---

## 1. TỔNG QUAN & TRIẾT LÝ DỰ ÁN (PROJECT CORE)

- **Tên dự án**: **VirtualDouble** — *AI Cognitive Body Doubler* (Mã hiệu: **ANT**)
- **Mascot chính thức**: **Chú kiến ANT** — Trợ lý ảo thân thiện, đáng yêu (3D cartoon animated mascot), chuyển động vẫy tay chào chào đón người dùng, đồng hành tâm lý nhẹ nhàng, giảm kích thích căng thẳng cho người dùng có đặc điểm ADHD / Neurodivergent.
- **Sứ mệnh**: Đồng hành hỗ trợ tập trung công việc thông qua mô hình "Virtual Coworker" (Người bạn đồng hành ảo) thay vì bộ đếm giờ kiểm soát truyền thống.
- **Triết lý cốt lõi**:
  1. **Support, not surveillance** (Hỗ trợ, không giám sát): AI đồng hành nhẹ nhàng, không phán xét, không chấm điểm năng suất.
  2. **Observe behaviour, do not diagnose emotion** (Quan sát hành vi, không gán nhãn cảm xúc): Nhận diện tín hiệu rời mắt, vắng mặt để gợi ý kiểm tra nhẹ nhàng, không khẳng định "bạn đang mất tập trung".
  3. **Recovery instead of punishment** (Phục hồi thay vì trừng phạt): Chu trình `Focus → Disengagement → Support → Re-entry → Focus`. Quan trọng nhất là hỗ trợ người dùng quay lại công việc dễ dàng nhất.
  4. **Floating presence** (Hiện diện linh hoạt & Decoupled Architecture): Widget có thể tách ra cửa sổ nổi luôn trên cùng (Document Picture-in-Picture) để đi cùng người dùng sang VS Code, Figma, Docs... với thiết kế tối giản, loại bỏ các nút dư thừa.

---

## 2. HỆ THỐNG THIẾT KẾ & TÀI NGUYÊN (DESIGN SYSTEM & TOKENS)

### 2.1. Nền Gradient Dịu Mắt & Bụi Sáng (Subtle Ambient Gradient & Peaceful Particles)
- **Đã bỏ hoàn toàn ảnh nền dãy núi**: Thay thế bằng hệ màu gradient tinh khiết, êm dịu, không gây nhiễu thị giác hay xao nhãng.
- **Đã bỏ hiệu ứng lướt trên mặt nước (Water Ripples)**: Hoàn trả tương tác rê chuột về trạng thái bình thường, yên tĩnh.
- **Dark Mode Gradient**:
  - `bg-gradient-to-b from-[#0B132B] via-[#0E1A38] to-[#070F26]`.
  - Ánh sáng tỏa tâm: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(14,165,233,0.12), transparent 75%)`.
  - Viền mờ vignette: `radial-gradient(ellipse at center, transparent 50%, rgba(7,15,38,0.6) 100%)`.
- **Light Mode Gradient**:
  - `bg-gradient-to-b from-[#F8FAFC] via-[#F0F9FF] to-[#E2E8F0]`.
  - Ánh sáng tỏa tâm: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(56,189,248,0.14), transparent 75%)`.
  - Viền mờ vignette: `radial-gradient(ellipse at center, transparent 60%, rgba(226,232,240,0.5) 100%)`.
- **Bụi sáng bình yên (Floating Ambient Particles)**:
  - Các đốm sáng nhỏ li ti màu Cyan/Sapphire trôi chậm rãi từ dưới lên trên, nhẹ nhàng nhường đường khi chuột di chuyển tới gần (repulsion mềm mại), duy trì sinh khí thanh bình cho trang web.

### 2.2. Mascot Trợ lý Ảo Con Kiến ANT (3D Animated Waving Mascot)
- **Tài sản chuyển động**: `/ant-waving.webp` (chuyển đổi từ `ANT.mp4`, đặt trong `public/`).
- **Đặc tính kỹ thuật**:
  - **100% Transparent Alpha Channel (RGBA)**: Tách sạch hoàn toàn nền đen của video bằng thuật toán flood-fill + Gaussian feathering bảo toàn mắt, miệng và chi tiết phát sáng.
  - **Loại bỏ 100% Watermark & Prompt Box**: Cắt bỏ triệt để logo KlingAI góc trên cùng bên phải và hộp thoại prompt ở đáy video gốc.
  - **Dung lượng tối ưu**: 151 frames chuyển động 30fps siêu mượt, dung lượng nén chỉ 1.99 MB, tự động lặp vô tận không cần player video hay lo ngại chính sách autoplay của trình duyệt.
- **Bố cục Không Khung Viền (Frameless Center Stage)**:
  - Đã xóa bỏ hoàn toàn khung tròn và viền hộp (`border`, `bg-[#0B132B]`).
  - Chú kiến vẫy tay đứng trực tiếp ở trung tâm website, lơ lửng bồng bềnh tự nhiên trên nền gradient của cả Dark Mode và Light Mode.
  - Đổ bóng sàn elip chuyển động co giãn đồng bộ (`animate-mascot-shadow`).
  - Speech bubble lơ lửng: `👋 I'm here to double with you!`.
- **Tích hợp thương hiệu trên Header**:
  - Logo trên Header hiển thị avatar tĩnh gốc `/ant-mascot.png` của Mascot ANT kèm badge chữ `ANT` nổi bật.

### 2.3. Màn hình Chào đón Mới (Welcome / Onboarding View)
- **Component**: [AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx).
- **Luồng người dùng (User Flow)**:
  - Khi người dùng mới vào website (trạng thái `idle` và chưa bấm Start): Mascot ANT vẫy tay chào xuất hiện đầu tiên cùng lời chào:
    - Tiêu đề: **"Hello, this is ANT."** (Chữ ANT font serif nghiêng, màu Cyan phát sáng).
    - Phụ đề: *"Your gentle, judgment-free coworker. Ready to break down barriers and get into your flow?"*
  - **Nút "Let's GET STARTED!"**:
    - Thiết kế nút lớn nổi bật với dải gradient `from-cyan-500 via-sky-500 to-blue-600`, đổ bóng phát sáng cyan và icon mũi tên `ArrowRight` trượt nhẹ khi hover.
    - Khi bấm: Kích hoạt `onStart()`, chuyển cảnh mượt mà sang Landing Page nhập nhiệm vụ ([MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx)).

### 2.4. Vòng tròn đếm ngược Breathing Aura
- **Dark Mode**: Nền cầu đêm sapphire `#071329`, viền phát sáng cyan và số đếm `text-cyan-200` có hiệu ứng neon rõ nét.
- **Light Mode**: Nền ngọc lam nhạt thanh thoát, chữ số xám xanh tương phản cao.

---

## 3. BẢN ĐỒ COMPONENT & FILE HIỆN TẠI

```
virtual-double/
├── app/
│   ├── globals.css               # Tailwind v4, CSS custom variables, keyframes mascot-float & mascot-shadow
│   ├── layout.tsx                # Root layout, MascotNameProvider, Google Fonts (Inter, Playfair Display)
│   └── page.tsx                  # AppShell điều phối: AntWelcomeView → MicroCommitmentView → SmileRitualView → DeepPresenceView + VisionMonitor
├── components/
│   ├── AntWelcomeView.tsx        # Màn hình chào đón với Mascot ANT vẫy tay động (không nền) và nút "Let's GET STARTED!"
│   ├── SmileRitualView.tsx       # Màn hình trung gian nghi thức tích cực: Mascot ANT (ant-mascot-removebg), comic speech bubble, MediaPipe smile detection, audio chào
│   ├── AntCheckIn.tsx            # [MỚI TỪ PR #3] Modal đồng hành nhẹ nhàng dựa trên episode check-in (thay thế DistractionNudgeModal cũ)
│   ├── VisionMonitor.tsx         # [MỚI TỪ PR #3] Component giám sát tập trung qua camera thời gian thực với MediaPipe FaceLandmarker
│   ├── InteractiveBackground.tsx # Nền Gradient dịu mắt (Dark/Light) + Bụi sáng (bỏ ảnh núi, bỏ water ripple)
│   ├── BreathingAura.tsx         # Quả cầu đếm ngược Dark Mode độ tương phản cao, số phát sáng
│   ├── DeepPresenceView.tsx      # Màn hình tập trung chuyên sâu: chuẩn height h-11, nút End now xác nhận nhẹ, phím tắt Space/Esc
│   ├── FloatingMiniWidget.tsx    # Widget PiP thu gọn: nút Return tự động focus cửa sổ web chính
│   ├── FocusStateIndicator.tsx   # Badge trạng thái tập trung (Focused/Checking in/Away)
│   ├── Header.tsx                # Header với Avatar gốc ant-mascot.png, tính năng đổi tên Mascot linh hoạt lưu LocalStorage
│   ├── MicroCommitmentView.tsx   # Khởi tạo cam kết: 3 quick suggestions 1 hàng tự điền input, tích hợp Web Speech-to-Text
│   ├── PipWindow.tsx             # React Portal vào Document Picture-in-Picture window
│   ├── SessionCompletionModal.tsx# Modal chúc mừng sau phiên tập trung, chuẩn tương phản cao
│   └── ui/                       # Base UI primitives (button, input)
├── lib/
│   ├── mascot-name.tsx           # [MỚI TỪ PR #3] React Context Provider cho tên Mascot tùy biến, lưu bền vững LocalStorage
│   ├── ant-voice.ts              # Audio engine: Web Speech API & Web Audio API chime sounds cho ANT
│   ├── check-in-episode.ts       # [MỚI TỪ PR #3] State Machine quản lý các episode check-in đồng hành
│   ├── check-in.ts               # [MỚI TỪ PR #3] Phân loại tín hiệu hỗ trợ và recovery
│   ├── session-clock.ts          # [MỚI TỪ PR #3] Đồng hồ thời gian thực độc lập cho session
│   ├── floating-companion.tsx    # Provider & Context cho Floating Companion, hook useNativeClick
│   ├── focus-session.tsx         # State Machine, Timer, Reconciler (tích hợp CV presence signals)
│   ├── task-breakdown.ts         # Logic phân rã nhiệm vụ (AI placeholder)
│   ├── use-distraction-watch.ts  # Theo dõi xao nhãng để kích hoạt AntCheckIn
│   ├── use-document-pip.ts       # Hook PiP: cải tiến focus window khi đóng/return
│   ├── utils.ts                  # Tiện ích cn (clsx + tailwind-merge)
│   └── vision/                   # [MỚI TỪ PR #3] Hệ thống Computer Vision MediaPipe On-Device
│       ├── config.ts             # Cấu hình ngưỡng góc nghiêng đầu, độ mở mắt, thời gian dwell
│       ├── face-landmarker.ts    # Tải và khởi tạo MediaPipe FaceLandmarker từ local WASM
│       ├── head-pose.ts          # Ước lượng góc xoay đầu (yaw, pitch, roll) từ 478 facial landmarks
│       ├── signals.ts            # Trích xuất tín hiệu nhìn đi hướng khác, nhắm mắt, vắng mặt, mỉm cười
│       ├── smile-ritual.ts       # Bộ trích xuất nụ cười từ blendshapes mouthSmileLeft/Right
│       ├── temporal-filter.ts    # Lọc nhiễu theo thời gian để loại trừ cử động thoáng qua
│       ├── types.ts              # Định nghĩa kiểu dữ liệu FaceLandmarkObservation, VisionState
│       ├── use-smile-ritual.ts   # Hook nhận diện nụ cười dùng chung mô hình FaceLandmarker
│       └── use-vision-monitor.ts # Hook giám sát video thời gian thực phân loại trạng thái tập trung
├── public/
│   ├── ant-mascot-removebg.png   # Mascot ANT không nền dùng cho Comic Speech Bubble trong SmileRitualView
│   ├── ant-waving.webp           # Animation chú kiến ANT vẫy tay động 100% trong suốt (RGBA)
│   ├── ant-mascot.png            # Mascot chú kiến tĩnh chất lượng cao bảo lưu trên Header
│   └── mediapipe/                # [MỚI TỪ PR #3] Mô hình AI và WASM nhúng cục bộ (100% on-device)
│       ├── models/face_landmarker.task
│       └── wasm/                 # vision_wasm_internal (.js và .wasm)
└── virtual-double_state.md        # File theo dõi trạng thái local này (Local Only)
```

---

## 4. KIẾN TRÚC FLOATING COMPANION & DOCUMENT PICTURE-IN-PICTURE

### 4.1. Tối ưu Bố cục Nút FloatingMiniWidget
- **Xóa bỏ nút dấu X đỏ (`stopSession`)**:
  - Vì cửa sổ Document PiP của trình duyệt đã tích hợp sẵn nút đóng X ở góc trên cùng bên phải thanh tiêu đề OS/browser.
  - Bố cục 2 nút đối xứng thanh lịch: `Pause / Resume` và `Return` (đóng cửa sổ PiP và quay lại tab chính) sử dụng `flex-1`.

### 4.2. Cơ chế Native User Activation (`useNativeClick`)
- Hook `useNativeClick` trong `lib/floating-companion.tsx` gắn trực tiếp `addEventListener('click', ...)` vào phần tử DOM thật để vượt qua hạn chế của React Synthetic Events đối với Chromium `documentPictureInPicture.requestWindow()`.

---

## 5. NHẬT KÝ THAY ĐỔI (CHANGELOG)

### Version 3.0.0 — Editorial Polish: Borderless Hero, 100% English Views, Executive Copilot & Ultra-Smooth Hover Physics
- **1. Borderless Hero Section ([AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx))**:
  - Loại bỏ hoàn toàn bounding box bao quanh khối nội dung hero.
  - Dòng chữ *"Flow state by design."*, lời giới thiệu và mascot ANT 3D vẫy tay nay trôi tự do, thanh thoát và nổi bật trực tiếp trên nền fluid canvas.
  - Bỏ thanh banner chữ nhỏ *"VIRTUAL DOUBLE ARCHITECTURE"* và badge phụ không cần thiết, giúp màn hình đầu tiên thoáng đãng, sang trọng.
- **2. 100% English & Chuẩn Typography Plus Jakarta Sans ([DashboardView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DashboardView.tsx), [RecoveryView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/RecoveryView.tsx), [layout.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/layout.tsx))**:
  - Toàn bộ nội dung Dashboard và Recovery chuyển đổi 100% sang tiếng Anh tự nhiên, học thuật và chuyên nghiệp.
  - Tích hợp font **Plus Jakarta Sans** (`next/font/google`) làm body font mặc định (`--font-sans`), thay thế Inter để mang lại cảm giác hiện đại, dễ đọc và tinh tế.
- **3. Tinh Giản Tối Đa: Zero Sparkles & Zero Emojis**:
  - Loại bỏ toàn bộ các ký hiệu trang trí thừa: sparkle (`✦`), emoji lửa (`🔥`), emoji âm nhạc/cảm xúc ở các đầu mục.
  - Xóa bỏ các khẩu hiệu chữ in hoa dài dòng (*"AI COGNITIVE ANALYTICS & INSIGHTS"*, *"NEURO-COGNITIVE RECOVERY & SOUNDSCAPES"*).
- **4. Tái Thiết Kế Trợ Lý Nhận Thức Executive AI Copilot ([ChatWithAntModal.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/ChatWithAntModal.tsx))**:
  - Nâng cấp từ pop-up modal thông thường thành slide-over drawer chuẩn điều hành hiện đại.
  - Danh mục gợi ý (prompt chips) tối giản, không icon rườm rà.
  - Cấu trúc phản hồi 3 pha khoa học: *Cognitive Diagnosis*, *Micro-Action (Immediate 2-min step)*, *Sustained Momentum*.
- **5. Tương Phản Cao Cho Light Mode ([DashboardView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DashboardView.tsx), [RecoveryView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/RecoveryView.tsx))**:
  - Khắc phục triệt để lỗi chữ tiêu đề mờ trên nền sáng: áp dụng mã màu xanh đen `#0A1128` có độ tương phản cao đạt chuẩn WCAG AAA.
- **6. Loại Bỏ Bounding Box Dư Thừa**:
  - Dashboard: Bỏ bounding box bao quanh mục *"Age Cohort Benchmark"*, đưa danh sách phiên gần đây về dạng clean list tối giản không viền hộp thô.
  - Recovery: Các soundscape card (*"Binaural Alpha Wave"*, *"Tokyo Midnight Rain"*, *"Deep Abyss Brown Noise"*, *"Neo-Classical Echoes"*) chuyển sang dạng borderless layout phẳng, nhẹ nhàng, hòa vào nền.
- **7. Tinh Chỉnh Vật Lý Di Chuột Ultra-Smooth ([InteractiveBackground.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/InteractiveBackground.tsx))**:
  - Áp dụng bộ làm mượt tọa độ con trỏ chuột kép (Double-exponential lerp filter).
  - Tích hợp hàm suy giảm Cubic Hermite smoothstep (`3t^2 - 2t^3`), mang lại cảm giác lượn sóng phản hồi mịn màng, tự nhiên tuyệt đối khi rê chuột.

### Version 2.0.0 — Calm Editorial Redesign, Navigation Tabs & Science-Backed Modules
- **Hệ thống điều hướng 3 phân hệ**: `Focus` (Luồng tập trung chính), `Dashboard` (Phân tích chỉ số nhận thức), `Recovery` (Phục hồi nhận thức bằng âm thanh & hít thở 4-7-8).
- **Phân tích chỉ số nhận thức (Cognitive Analytics)**: Tính toán Focus Score (88/100), Streak, biểu đồ cột năng suất theo giờ và phân tích so sánh độ tuổi.
- **Phòng hồi phục Neuro-Cognitive**: Trình phát sóng âm Binaural Beats, Ambient Rain, Brown Noise kèm bộ đếm nhịp thở 4-7-8 thư giãn sâu.
- **Nền tương tác sóng nước dạng lưới hạt (Interactive Fluid Canvas)**: Kế thừa hiệu ứng di chuột chuyển động vi mô trên nền màu Navy/Cyan sang trọng.

### Version 1.9.0 — MediaPipe Computer Vision Integration & Unified Mascot Context (Merged PR #2 & PR #3)
- **Tích hợp MediaPipe On-Device Computer Vision Pipeline (`@mediapipe/tasks-vision`)**:
  - Nhúng mô hình AI cục bộ 100% chạy trên máy người dùng (`public/mediapipe/models/face_landmarker.task` và bộ WASM WebAssembly `public/mediapipe/wasm/`).
  - [face-landmarker.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/face-landmarker.ts): Dynamic import `@mediapipe/tasks-vision` và khởi tạo singleton pipeline.
  - [head-pose.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/head-pose.ts): Tính toán góc nghiêng đầu 3 chiều (yaw, pitch, roll) từ 478 điểm mốc khuôn mặt (facial landmarks) bằng phép biến đổi hình học Euler.
  - [signals.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/signals.ts): Trích xuất tín hiệu nhìn đi hướng khác (gaze deviation), nhắm mắt (eye closure), vắng mặt khỏi camera (absence), và phát hiện nụ cười qua blendshapes (`mouthSmileLeft`, `mouthSmileRight`).
  - [temporal-filter.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/temporal-filter.ts): Bộ lọc làm mịn thời gian với ngưỡng dwell time chống nhiễu cử động chớp nhoáng.
  - [VisionMonitor.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/VisionMonitor.tsx) & [use-vision-monitor.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/use-vision-monitor.ts): Giám sát trạng thái tập trung liên tục qua video webcam chạy song song với phiên đếm ngược.
- **Nâng cấp Nghi thức Nụ cười bằng MediaPipe Blendshapes ([use-smile-ritual.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/use-smile-ritual.ts))**:
  - Hợp nhất cơ chế phát hiện nụ cười của [SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx) sang dùng chung model MediaPipe FaceLandmarker, đạt độ nhạy và chính xác cao hơn phân tích pixel canvas cũ.
- **Thay thế Nudge bằng AntCheckIn Episode-Based ([AntCheckIn.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntCheckIn.tsx))**:
  - Chuyển đổi modal nhắc nhở cũ thành hệ thống check-in thông minh dựa trên các tập (episodes) đồng hành nhẹ nhàng của chú kiến ANT (`lib/check-in-episode.ts` và `lib/check-in.ts`).
  - Cung cấp các phương án phục hồi tâm lý tích cực: *"Take a short break"*, *"Need a hand with next step"*, *"I'm still here, keep going"*.
- **Hợp nhất Toàn cục Tên Mascot tùy biến ([mascot-name.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/mascot-name.tsx))**:
  - Tạo `MascotNameProvider` bao bọc toàn bộ ứng dụng tại `layout.tsx`, cho phép mọi màn hình (Header, AntWelcomeView, AntCheckIn, DeepPresenceView) cùng hiển thị đồng nhất tên chú kiến do người dùng tự đặt và lưu bền vững trong `localStorage`.
- **Cài đặt Thư viện Phụ thuộc**:
  - Bổ sung `@mediapipe/tasks-vision@1.0.1` vào `package.json` và hoàn tất cài đặt vào `node_modules` bằng `npm install`.

### Version 1.8.0 — Quick Suggestions Single Row, Speech-to-Text & Customizable Mascot Name
- **Rút gọn Quick Suggestions thành 3 mục trên 1 hàng ([MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx))**:
  - Tinh giản còn đúng 3 gợi ý vi mô trọng tâm (`Review 3 priority emails`, `Outline key bullet points`, `Finish draft introduction`).
  - Bố trí trên 1 hàng ngang duy nhất (`grid-cols-1 sm:grid-cols-3 gap-3`).
  - **Cải tiến Hành vi Click**: Khi bấm vào suggestion pill, chỉ tự động điền chuỗi ký tự vào ô *"Tell me what you'll do..."*, **KHÔNG** tự động nhảy sang màn hình trung gian hay start session ngay. Người dùng chủ động xem lại nội dung, chỉnh sửa nếu muốn và bấm *"Start with Me"* hoặc nhấn Enter khi thực sự sẵn sàng.
  - Bổ sung nút *"Clear input"* nhanh khi đang có văn bản trong ô nhập.
- **Tích hợp Speech-to-Text cho nút Microphone ([MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx))**:
  - Kích hoạt tính năng nhận dạng giọng nói tự nhiên thông qua Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`).
  - Khi bấm icon micro: chuyển sang trạng thái ghi âm phát sáng nhấp nháy đỏ (`animate-pulse`), yêu cầu cấp quyền micro, chuyển giọng nói của người dùng thành chữ và tự động điền vào ô *"Tell me what you'll do..."* theo thời gian thực.
  - Tự động ngắt khi người dùng dừng nói hoặc bấm lại vào micro; có thông báo hướng dẫn và cơ chế bắt lỗi thân thiện.
- **Loại bỏ cụm Focus State Pills trên Header ([Header.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/Header.tsx))**:
  - Xóa bỏ hoàn toàn thanh chọn trạng thái *"Focused, Possibly distracted, Away"* ở giữa Header nhằm tinh giản thị giác tối đa, tránh gây phân tâm cho người dùng.
- **Tùy biến Tên Nhân vật Mascot Linh Hoạt ([Header.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/Header.tsx))**:
  - Chuyển đổi tên thương hiệu "VirtualDouble" ở góc trên cùng bên trái thành tính năng cho phép người dùng tự do đặt tên cho người bạn đồng hành ANT của riêng mình.
  - Giao diện inline edit trực quan với icon bút chì (`Pencil`), phím `Enter` / nút check để lưu và phím `Escape` để hủy.
  - Tên được lưu trữ bền vững trong `localStorage` (`ant_mascot_name`) và tự động nạp lại khi người dùng truy cập lại trang web. Tên mặc định ban đầu vẫn là "VirtualDouble".

### Version 3.0.0 — Editorial Design Evolution, Ambient Fluid Wave Canvas, Focus Dashboard, Recovery Soundscapes & AI Consultation
- **1. Khôi phục hoàn toàn Hệ Màu Xanh / Cyan / Deep Navy (`#06B6D4`, `#0284C7`, `#0B132B`, `#070F26`)**:
  - Loại bỏ toàn bộ gam màu đỏ/crimson thử nghiệm trước đây trên toàn bộ các tệp cấu hình và giao diện ([globals.css](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/globals.css), [InteractiveBackground.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/InteractiveBackground.tsx), [Header.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/Header.tsx), [AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx), [MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx), [SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx), [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx), [StepTransitionView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/StepTransitionView.tsx), [SessionCompletionModal.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SessionCompletionModal.tsx), [FocusGlassCard.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/FocusGlassCard.tsx), [FloatingMiniWidget.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/FloatingMiniWidget.tsx), [AntCheckIn.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntCheckIn.tsx), [BreathingAura.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/BreathingAura.tsx)).
  - Đảm bảo độ tương phản cao đạt chuẩn WCAG AAA: Tiêu đề sử dụng màu xanh đen sâu thẳm `#0A1128` ở Light Mode và trắng sáng tinh khôi ở Dark Mode.
- **2. Hiệu ứng Nền Sóng Nước Đa Tần Siêu Mịn (Ultra-Smooth Fluid Wave Canvas)**:
  - Tích hợp giải thuật nội suy kép (Dual-Lerp Cursor Easing) với hàm mượt Smoothstep Hermite bậc ba `3t^2 - 2t^3` trong [InteractiveBackground.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/InteractiveBackground.tsx).
  - Khử hoàn toàn cảm giác giật khựng; con trỏ chuột di chuyển tạo nên các dải sóng lụa (wave marble ripples) và ánh sáng phát quang cyan mờ ảo, dịu mắt và cực kỳ thư thái.
- **3. Màn hình Focus Khối Nổi Tự Do Không Khung Hộp (Borderless Floating Hero)**:
  - Bỏ hoàn toàn bounding box bao quanh khối nội dung trong [AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx). Nội dung nổi bật tự nhiên và thanh lịch trực tiếp trên nền canvas động.
  - Loại bỏ toàn bộ icon emoji và tag thừa (`✦`, `VIRTUAL DOUBLE ARCHITECTURE`).
  - Giữ vững tỷ lệ vàng typography: Tiêu đề *"Flow state by design."*, subtitle in nghiêng thanh nhã, các nút điều hướng capsule đối xứng và Mascot ANT vẫy tay với bóng sàn 3D.
- **4. Phân hệ Focus Intelligence Dashboard (Chuẩn Tiếng Anh 100% & Font Plus Jakarta Sans)**:
  - Chuyển đổi toàn bộ font chữ văn bản sang **Plus Jakarta Sans** ([app/layout.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/layout.tsx)) tăng cường độ hiện đại và tính dễ đọc.
  - Đồng hồ đo Focus Score (94/100 Flow State) với vòng cung tiến trình phát sáng.
  - Biểu đồ thời gian thực (Real-Time Focus Timeline) ghi nhận nhịp độ tập trung trong ngày với Live Telemetry Pulse.
  - 4 thẻ đo lường chuẩn hóa: Total Focused (4h 25m), Completed Sessions (7 sprints), Distraction Rescues (96% trong 10s), Average Sprint Block (28 mins).
  - Hồ sơ cá nhân với Họ tên, Email, Số điện thoại, Tuổi tác có khả năng chỉnh sửa và lưu trữ bền vững vào `localStorage`.
  - Phân tích tương quan theo nhóm độ tuổi (Age Cohort Benchmark) được tinh giản dạng đường nhấn biên trái, loại bỏ hoàn toàn các khung hộp lồng nhau gây rối mắt.
  - Lịch sử nhiệm vụ hoàn thành (Completed Tasks History) thiết kế dạng danh sách phẳng, thoáng đãng và sang trọng.
- **5. Phân hệ Recovery & Cognitive Reset (Soundscape Khoa Học Theo Độ Khó)**:
  - Hướng dẫn thở 4-7-8 (Inhale 4s -> Hold 7s -> Exhale 8s) kèm hiệu ứng co giãn vòng tròn phục hồi hệ thần kinh đối giao cảm.
  - Gợi ý soundscape theo 4 cấp độ: Light (Lo-Fi Chill Hop 76 BPM), Moderate (Binaural Alpha Waves 10Hz), Deep (Deep Brown Noise & Ambient Drone), Creative (Cinematic Modern Piano).
  - Tối giản hóa bộ lọc với text thuần túy (không icon, không emoji), loại bỏ các khung hộp lồng nhau bao quanh từng bản nhạc.
  - Tích hợp bộ tổng hợp âm thanh thời gian thực (Web Audio Synthesizer) phát âm thanh trực tiếp trên trình duyệt kèm sóng equalizer chuyển động và nút *"Apply to Focus"*.
- **6. Cửa sổ Trợ lý Nhận thức ANT Chuyên nghiệp (Executive Copilot Drawer)**:
  - Tái thiết kế giao diện [ChatWithAntModal.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/ChatWithAntModal.tsx) theo phong cách Copilot cao cấp.
  - Các chip gợi ý được tinh giản không emoji (*"Break down a complex task"*, *"Optimal sprint duration for coding"*, v.v.).
  - Phản hồi phân tích cấu trúc 3 giai đoạn kèm nút kích hoạt nhanh phiên làm việc tương ứng (*"Apply 25-Min Initiation Sprint"*).
- **7. Vận hành Đội ngũ 7 Agents & Pipeline Kiểm thử Tự động**:
  - Điều phối bởi 3 Kỹ sư, 2 Dò lỗi sai và 2 Tracking Coordinator.
  - Biên dịch kiểm thử tự động `npm run build` hoàn thành với **0 lỗi (100% Success)**.
  - Kiểm thử giao diện E2E bằng Browser Subagent xác nhận trọn vẹn toàn bộ 7 yêu cầu của người dùng, không phát sinh lỗi layout hay regression.

### Version 1.7.0 — Impeccable Design Refinements & Neuroinclusive Polish
- **Khắc phục Triệt để Cảnh báo Phối màu (`gray-on-color` Clean Scan)**:
  - Cập nhật [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx): Thay đổi chữ nút *"Completed early"* sang `dark:text-emerald-950` trên nền `dark:bg-emerald-400`, loại bỏ hoàn toàn chữ xám `slate-950` chát màu.
  - Cập nhật [SessionCompletionModal.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SessionCompletionModal.tsx): Nút *"Done"* chuẩn hóa sang `text-white bg-emerald-500` ở Light Mode và `dark:text-emerald-950 dark:bg-emerald-400` ở Dark Mode.
  - Chạy `impeccable detect` đạt kết quả **100% Clean (0 findings, 0 warnings)**.
- **Xác nhận Nhẹ Nhàng khi Dừng Phiên (Soft Confirmation for "End now")**:
  - Khi người dùng bấm nút *"End now"* trên [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx), giao diện hiển thị inline xác nhận an toàn: *"End session? Yes, end / Cancel"*.
  - Ngăn ngừa tình trạng bấm nhầm (accidental misclick) gây đứt gãy luồng tập trung của người dùng có đặc điểm ADHD, đồng thời đảm bảo cảm giác kiểm soát nhẹ nhàng, không trừng phạt.
- **Đồng bộ Viền Comic Bubble cho Light Mode ([SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx))**:
  - Chuyển màu viền bóng thoại truyện tranh từ màu nâu `#261810` sang `border-slate-900` và `text-slate-900`, đồng bộ hoàn hảo với hệ thống typography và theme màu hiện đại của trang.
- **Bổ sung Phím Tắt Nhanh (Accessibility & Power User Shortcuts)**:
  - [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx): Phím `Space` tự động Tạm dừng / Tiếp tục (`Pause/Resume`); phím `Escape` hủy xác nhận dừng phiên. Kèm nhãn chỉ dẫn phím tắt trực quan ở chân trang.
  - [SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx): Phím `Escape` quay lại nhập task; phím `Enter` kích hoạt ngay nụ cười để vào phiên.

### Version 2.4.0 — Asset Generation: Distracted/Sad Mascot ANT (ant-sad.png & ant-sad-removebg.png)
- **1. Tạo Hình Ảnh Chú Kiến Buồn/Lo Lắng Khi Người Dùng Mất Tập Trung (`ant-sad.png`)**:
  - Tạo ảnh chú kiến robot ANT 3D Pixar nguyên bản theo phong cách nhận diện thương hiệu, trong trạng thái buồn bã, van nài khi người dùng bị xao nhãng (sau 15s).
  - Điểm nhấn cảm xúc: đôi mắt cún con long lanh ngấn lệ, khóe miệng chúm mím buồn, hai râu rủ xuống với đầu phát sáng xanh neon cyan, hai tay đan chắp trước ngực van nài người dùng quay lại tập trung.
  - Lưu tệp độ phân giải cao 1024x1024 tại: [ant-sad.png](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/public/ant-sad.png).
- **2. Tách Nền Trong Suốt Chuẩn RGBA (`ant-sad-removebg.png`)**:
  - Sử dụng AI Neural Network (`rembg` / `bria-rmbg-2.0`) bóc tách hoàn toàn lớp nền màu, chỉ giữ lại chi tiết chú kiến với độ sắc nét tuyệt đối, bảo toàn trọn vẹn dải viền phát sáng cyan và râu ăng-ten mỏng.
  - Định dạng xuất: PNG 32-bit RGBA (1024x1024) trong suốt 100%, sẵn sàng nhúng trực tiếp vào các modal, banner thông báo hoặc pop-up cảnh báo mất tập trung trên cả nền Dark Mode và Light Mode.
  - Lưu tệp tại: [ant-sad-removebg.png](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/public/ant-sad-removebg.png).
- **3. Tuân Thủ Ràng Buộc**:
  - Không thay đổi bất kỳ dòng mã logic hoặc giao diện nào của ứng dụng; chỉ tạo tài nguyên hình ảnh và cập nhật tệp trạng thái dự án, dừng lại đợi chỉ thị tiếp theo từ người dùng.

### Version 2.3.0 — GitHub Sync & Signature Serif Typography Restoration
- **1. Ghi nhận Đồng bộ Mã Nguồn Mới Nhất từ GitHub (`git pull`)**:
  - **Commit `0a7e9b5` (Merge branch 'tuan-nghia' into main)**:
    - Bổ sung tài liệu theo dõi thiết kế [UI_CHANGES.md](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/UI_CHANGES.md).
    - Cập nhật giao diện màn hình chuẩn bị [SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx) theo layout thẻ camera tỷ lệ 4:3 hiện đại, bổ sung thanh đo độ sẵn sàng (Ready Meter).
    - Bổ sung nút bấm chính *"I'm Ready"* cho phép người dùng kích hoạt phiên làm việc ngay lập tức không phụ thuộc vào camera, đồng thời duy trì bảo toàn MediaPipe hook `useSmileRitual`, tên linh hoạt `mascotName`, priming audio và phím tắt `Enter`.
  - **Commit `98dddb2` (feat: add check-in quick actions)**:
    - Mở rộng chức năng cho hộp thoại kiểm tra độ tập trung [AntCheckIn.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntCheckIn.tsx): bổ sung các nút chọn phản hồi nhanh (*"Give me 5 more minutes"*, *"Just got distracted"*, v.v.) giúp phản hồi tức thì bằng 1 chạm.
    - Đồng bộ các nút phản hồi nhanh này lên cả giao diện cửa sổ nổi Picture-in-Picture [PipWindow.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/PipWindow.tsx) và [app/page.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/page.tsx).
- **2. Khôi Phục Typography Chữ Nhận Diện Thương Hiệu (`font-serif`)**:
  - **Vấn đề**: Trong quá trình merge nhánh, tiêu đề *"What will you focus on next?"* tại [MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx) bị mất class `font-serif`, khiến cụm từ *"focus on"* hiển thị bằng font không chân (sans-serif) in nghiêng thông thường thay vì font có chân thanh lịch Playfair Display.
  - **Khắc phục**: Khôi phục chuẩn xác `className="font-serif italic font-normal text-cyan-600 dark:text-cyan-300"` cho cụm từ *"focus on"*, lấy lại trọn vẹn điểm nhấn thẩm mỹ và đồng bộ 100% với phong cách typography đặc trưng của phiên bản *"will you conquer"* trước đó.

### Version 2.2.1 — 5-Agent Engineering: Elimination of Initial Dark Mode Auto-PiP Activation Barrier
- **Đội Ngũ 5 Agents Thực Thi & Phân Công Nhiệm Vụ**:
  - **Agent 1: Tracking Coordinator**: Điều phối toàn diện tiến độ, quản lý breakdown công việc thành các bước nhỏ, giám sát nghiệm thu và ghi nhận state.
  - **Agent 2: Dò Lỗi Sai 1 (State & Activation Tracer)**: Điều tra và định vị chính xác nguyên nhân transient activation bị expire sau 3.4s celebration delay; chứng minh vì sao click vào nút đổi theme Light Mode lại tình cờ tạo ra gesture mới mở khóa được PiP.
  - **Agent 3: Dò Lỗi Sai 2 (Browser & Auto-PiP Auditor)**: Rà soát điều kiện khắt khe của Chromium đối với Document PiP và Auto-PiP: phát hiện cảnh báo React DOM prop trên thẻ video (`autoPictureInPicture`), thẻ video bị ẩn tại vị trí `-9999px` không đáp ứng tiêu chuẩn compositor, và AudioContext bị suspended nếu khởi tạo sau `setTimeout`.
  - **Agent 4: Kỹ Sư 1 (Core Audio & MediaSession Architecture)**: Thiết kế giải pháp Audio Keep-Alive lưỡng thể (Hybrid Web Audio + HTML5 Audio Silent PCM Loop); triển khai `primeAudioOnGesture()` kích hoạt đồng bộ 100% trong mọi cú click của người dùng từ Welcome, MicroCommitment, đến SmileRitual.
  - **Agent 5: Kỹ Sư 2 (UI, Video & PiP Lifecycle Specialist)**: Tái thiết kế thẻ `<video>` trong [VisionMonitor.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/VisionMonitor.tsx) với `autopictureinpicture` chuẩn DOM, fallback `canvas.captureStream(5)` khi không bật camera, layout viewport hợp lệ (`fixed bottom-0 right-0 size-2 opacity-[0.01] -z-50`); tích hợp pointerdown/keydown listener trên [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx).
- **Chi Tiết Các Bước Breakdown Đã Hoàn Thành (100% Completed)**:
  - **[x] Bước 1 (Dò lỗi & Khảo sát)**: Hai agent Dò lỗi sai hoàn thiện báo cáo phân tích chi tiết nguyên nhân gốc rễ và cơ chế kích hoạt của Chrome.
  - **[x] Bước 2 (Kỹ sư 1 - Core Audio Keep-Alive)**: Tái cấu trúc [lib/ant-voice.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/ant-voice.ts) với `SILENT_WAV_DATA_URI`, `primeAudioOnGesture()`, và `startAudioKeepAlive()` chạy cả Web Audio và HTML5 Audio silent loop.
  - **[x] Bước 3 (Kỹ sư 2 - Video & PiP Lifecycle)**: Sửa lỗi React prop trên `<video>` trong [components/VisionMonitor.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/VisionMonitor.tsx), bổ sung canvas stream fallback để Chrome công nhận luồng video hoạt động dù người dùng chọn "Start without camera".
  - **[x] Bước 4 (Kỹ sư 1 & 2 - Gesture Propagation & Page Orchestration)**: Tích hợp khởi động âm thanh / arming PiP ngay trong các cú click của [AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx), [MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx), [SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx), và [DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx).
  - **[x] Bước 5 (Kiểm thử Toàn diện với Browser)**: Dùng `browser_subagent` kiểm tra kịch bản default Dark Mode từ đầu đến cuối: tải trang ban đầu ở Dark Mode -> Start session -> minimize tab -> xác nhận không có lỗi React DOM prop, AudioContext trạng thái `running`, MediaSession metadata và handlers đăng ký hoàn hảo, không còn phụ thuộc switch Light Mode.
  - **[x] Bước 6 (Tracking & Lưu Trạng thái)**: Agent Tracking ghi lại toàn bộ nhật ký Version 2.2.1 vào `virtual-double_state.md`, xác nhận hoàn thành và đợi chỉ thị tiếp theo.

### Version 2.2.0 — Polish Suite v2.2: Seamless Auto-PiP on Minimize in Default Dark Mode via MediaSession Audio Keep-Alive & Blur Minimize Trigger
- **1. Khắc Phục Triệt Để Auto-PiP Cho Default Dark Mode (Không Cần Click Switch Light Mode)**:
  - **Phát hiện cốt lõi**: Trong trình duyệt Chromium/Chrome, hàm `documentPictureInPicture.requestWindow()` yêu cầu **transient user activation** (thao tác click trong vòng 5 giây gần nhất). Khi người dùng bắt đầu ở chế độ Dark Mode mặc định, sau khi vào màn hình đếm ngược qua nghi thức nụ cười (vốn chờ 3.4 giây phát âm), transient activation đã hết hạn. Khi người dùng bấm nút minimize trên thanh tiêu đề Windows, Chrome từ chối cấp quyền nếu trang web không đáp ứng 1 trong 2 tiêu chuẩn:
    - *Tiêu chuẩn 1 (Media Session Active)*: Đang phát media với `navigator.mediaSession.playbackState = 'playing'`.
    - *Tiêu chuẩn 2 (Title Bar Click Trigger)*: Bắt sự kiện ngay khi chuột nhấn nút minimize qua sự kiện `window.onblur`.
  - Khi người dùng click nút đổi theme sang Light Mode, chính cú click đó đã tạo transient activation mới, khiến PiP pop ra được.
- **2. Giải Pháp Toàn Diện Đã Thực Thi**:
  - **A. Audio Keep-Alive Engine ([lib/ant-voice.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/ant-voice.ts))**:
    - Xây dựng `startAudioKeepAlive()` và `stopAudioKeepAlive()` tạo một luồng audio tần số thấp siêu êm (gain `0.00001`, tai người hoàn toàn không nghe thấy) qua Web Audio API.
    - Cập nhật `navigator.mediaSession.playbackState = 'playing'` khi phiên đếm ngược chạy. Điều này chứng thực với Chrome rằng trang web đang trong một phiên đồng hành tương tác hợp lệ, cho phép trình duyệt kích hoạt Auto-PiP tự động 100% không phụ thuộc click.
  - **B. Dual-Trigger: Window Blur + Visibility Change ([app/page.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/page.tsx))**:
    - Kích hoạt `openPipWindow()` ngay trong `handleWindowBlur`: Trên Windows, khi click nút minimize trên title bar, `window.blur` nổ ra lập tức ngay trong tích tắc nhấn chuột, bảo toàn trọn vẹn user gesture trước khi cửa sổ thu nhỏ.
    - Duy trì kích hoạt dự phòng trong `handleVisibilityChange` (`document.visibilityState === 'hidden'`).
  - **C. Chống Trùng Lặp Trạng Thái Mở PiP ([lib/use-document-pip.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/use-document-pip.ts))**:
    - Bổ sung cờ `isOpeningRef` ngăn chặn 2 lệnh mở PiP chạy song song gây lỗi `InvalidStateError: A Picture-in-Picture window is already being opened`.
  - **D. Cập nhật Thẻ Video Hợp Lệ Cho Chrome Auto-PiP ([components/VisionMonitor.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/VisionMonitor.tsx))**:
    - Thay thế `className="hidden"` (`display: none` vốn bị Chrome loại khỏi pipeline media) thành `fixed -top-[9999px] -left-[9999px] size-1 opacity-0 pointer-events-none` kèm thuộc tính `autoPictureInPicture`.
- **3. Kết quả nghiệm thu**:
  - Người dùng tải trang ban đầu ở chế độ Dark Mode mặc định, nhập task, hoàn thành nghi thức nụ cười và minimize trình duyệt: **Floating widget lập tức tự động bung ra ngoài màn hình** một cách mượt mà và chuẩn xác, không cần click bất kỳ nút nào hay phải chuyển qua Light Mode.

### Version 2.1.0 — Polish Suite v2.1: Default Dark Mode Auto-PiP Race Fix, Favicon Override, Dialogue Quotes Removal & WASM Error Filter
- **1. Khắc Phục Triệt Để Logo Tab Trình Duyệt (Favicon Override)**:
  - Thay thế trực tiếp `app/favicon.ico` và `public/favicon.ico` bằng nội dung tệp mascot `public/ant-mascot.png`, xóa bỏ hoàn toàn icon mặc định hình tam giác của Vercel/Next.js.
  - Bổ sung `<link rel="icon" type="image/png" href="/ant-mascot.png" sizes="any">` trực tiếp trong thẻ `<head>` của [app/layout.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/layout.tsx).
- **2. Khắc Phục Lỗi Auto-PiP Khi Minimize ở Default Dark Mode ([app/page.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/page.tsx), [use-document-pip.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/use-document-pip.ts))**:
  - **Nguyên nhân gốc rễ**: Khi minimize trên Windows, sự kiện focus thoáng qua từ hệ điều hành kích hoạt `handleWindowFocus`. Do không kiểm tra `document.visibilityState === 'visible'`, mã nguồn cũ ngỡ người dùng đã quay lại web nên lập tức đóng PiP window vừa mở.
  - **Giải pháp**: Thêm điều kiện `if (document.visibilityState !== 'visible') return` trong `handleWindowFocus`, nâng thời gian bảo vệ debounce lên 1200ms.
  - Thêm `className="dark"` ngay trên thẻ `<html>` trong `app/layout.tsx` đảm bảo trạng thái theme đồng nhất từ SSR sang hydration.
  - Bọc `copyStylesIntoPip` trong `try...catch` ngăn chặn các lỗi stylesheet làm sập luồng mở PiP.
  - Đăng ký `navigator.mediaSession.setActionHandler('enterpictureinpicture')` kích hoạt tính năng Auto-PiP tự nhiên của trình duyệt Chrome.
- **3. Loại Bỏ Dấu Ngoặc Kép Trong Câu Thoại ([SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx))**:
  - Xóa bỏ 2 thực thể HTML `&ldquo;` và `&rdquo;` bao quanh câu thoại `INITIAL_DIALOGUE` trong bóng thoại truyện tranh của Mascot ANT, giúp câu hiển thị tự nhiên: *Hey, are you ready? Let's smile whenever you're about to start the task!*.
- **4. Xử Lý Triệt Để Lỗi Overlay Đỏ Của TensorFlow Lite WASM ([face-landmarker.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/face-landmarker.ts), [use-vision-monitor.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/vision/use-vision-monitor.ts), [layout.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/layout.tsx))**:
  - **Nguyên nhân gốc rễ**: Khi TensorFlow Lite WASM khởi tạo XNNPACK delegate trên CPU, C++ ghi dòng thông tin `INFO: Created TensorFlow Lite XNNPACK delegate for CPU.` ra `stderr`. Emscripten chuyển `stderr` thành `console.error()`, khiến cơ chế Turbopack dev error overlay của Next.js hiển thị bảng báo lỗi màu đỏ dù chương trình không hề bị crash.
  - **Giải pháp**: Chặn và điều hướng các thông báo lành tính từ C++ WASM sang `console.info()`, đồng thời bọc an toàn `landmarker.detectForVideo` với điều kiện timestamp đơn điệu và `try...catch`. Không còn xuất hiện bất kỳ overlay đỏ nào trong quá trình sử dụng.

### Version 2.0.0 — Polish Suite v2: Favicon Branding, 10s Fast Check-in, 50m Preset, Audio Chimes, Auto-PiP, PiP Light Mode & Extended Ritual Speech
- **1. Thay Đổi Logo Tab Trình Duyệt (Favicon & Icons Branding)**:
  - Cập nhật `metadata.icons` trong [app/layout.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/layout.tsx) trỏ trực tiếp tới hình ảnh `/ant-mascot.png` cho cả `icon`, `shortcut`, và `apple`.
  - Đồng bộ `ant-mascot.png` sang `public/icon-dark-32x32.png`, `public/icon-light-32x32.png`, `public/apple-icon.png` và loại bỏ `public/icon.svg` cũ của V0.
- **2. Rút Ngắn Thời Gian Kích Hoạt Check-in Xuống 10s (Fast Demo & Quick Nudge)**:
  - Cập nhật hằng số `CHECK_IN_THRESHOLD_MS = 10_000` (thay vì 30_000ms) trong [lib/check-in-episode.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/check-in-episode.ts).
  - Khi camera không nhận diện được khuôn mặt liên tục trong 10 giây (vắng mặt hoặc quay đi), hệ thống lập tức kích hoạt modal [AntCheckIn.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntCheckIn.tsx) kèm âm thanh nhắc nhở, tối ưu hóa việc demo nhanh chóng và thực tế.
- **3. Bổ Sung Option 50 Phút (50 min Preset)**:
  - Thêm `50` vào mảng `DURATION_PRESETS = [5, 10, 15, 25, 50] as const` trong [lib/focus-session.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/focus-session.tsx).
  - Option `50 min` tự động hiển thị ngay giữa `25 min` và `Custom min` trên giao diện [MicroCommitmentView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/MicroCommitmentView.tsx).
- **4. Tín Hiệu Âm Thanh Tinh Tế (Delicate Chimes Engine)**:
  - Mở rộng [lib/ant-voice.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/ant-voice.ts) với 2 loại âm thanh Web Audio API thuần (không cần tệp mp3 bên ngoài, chống độ trễ):
    - `'nudge'`: Chuông sóng sin 2 nốt ấm (D5 587.3Hz → A5 880Hz) phát ra khi pop-up `AntCheckIn` xuất hiện sau 10s mất tập trung.
    - `'complete'`: Hợp âm sóng tam giác 4 giai đoạn (G4 392Hz → C5 523.25Hz → E5 659.25Hz → G5 783.99Hz) tôn vinh thành quả khi đếm ngược kết thúc trong [SessionCompletionModal.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SessionCompletionModal.tsx).
- **5. Tự Động Pop-out và Tự Động Đóng Floating Companion (Auto-PiP like Google Meet)**:
  - Tích hợp theo dõi `visibilitychange` và `window.focus/blur` trong [app/page.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/page.tsx):
    - Khi người dùng minimize Chrome hoặc chuyển sang cửa sổ khác (`visibilityState === 'hidden'`), hệ thống tự động gọi `openPipWindow()` bung floating widget ra ngoài màn hình.
    - Khi người dùng quay trở lại màn hình countdown trên tab web (`visibilityState === 'visible'` hoặc nhận `focus`), hệ thống tự động gọi `closePip()`, đóng widget nổi và tập trung vào đồng hồ chính.
- **6. Hỗ Trợ Light Mode Cho Floating Widget & Đồng Bộ Theme ([FloatingMiniWidget.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/FloatingMiniWidget.tsx), [use-document-pip.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/use-document-pip.ts))**:
  - `copyStylesIntoPip` tự động gắn class `dark` hoặc xóa class `dark` trên `pipDocument.documentElement` và đổi `backgroundColor` (`#0B132B` trong Dark Mode, `#F8FAFC` trong Light Mode).
  - Tích hợp `MutationObserver` đồng bộ theme tức thời giữa trang web và cửa sổ PiP khi người dùng bật tắt Light/Dark mode.
  - Cập nhật toàn bộ màu nền, viền và chữ trong `FloatingMiniWidget` và `FocusStateIndicator` đảm bảo độ tương phản cao, rõ ràng ở cả hai chế độ.
- **7. Kéo Dài Thời Gian Nói Câu Chúc Mừng Thêm 2 Giây ([SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx))**:
  - Kéo dài thời gian chuyển cảnh từ 1.4s lên **3.4s** (`3400ms`), cho phép giọng nói mascot ANT phát âm trọn vẹn câu: *"Nice — we're ready. Let's start now!"* trước khi chuyển sang màn hình đếm ngược.

### Version 1.6.0 — Positive Start Smile Ritual, Comic Speech Bubble & UI Button Alignment
- **Đồng bộ Chiều cao Nút Countdown ([DeepPresenceView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/DeepPresenceView.tsx))**:
  - Khắc phục sự bất đối xứng kích thước của nút "Open floating companion" (vốn bị phình to do padding/button wrapper không đồng bộ).
  - Chuẩn hóa toàn bộ 5 nút hành động (`Resume`, `Take a pause`, `Completed early`, `Open floating companion`, `End now`) về cùng chuẩn kích thước `h-11 rounded-xl px-5 text-sm font-semibold`.
- **Cải tiến Nút "Return" của Floating Companion ([FloatingMiniWidget.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/FloatingMiniWidget.tsx), [use-document-pip.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/use-document-pip.ts), [page.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/app/page.tsx))**:
  - Sửa lỗi khi bấm "Return" từ cửa sổ PiP không điều hướng hoặc không active lại màn hình countdown trên tab web.
  - Bổ sung `window.opener?.focus()` và `window.focus()` trước và sau khi `pipWindow.close()`.
  - Thêm `window.scrollTo({ top: 0, behavior: 'smooth' })` đảm bảo giao diện web ngay lập tức hiện diện đếm ngược trong tầm mắt người dùng.
- **Màn hình Nghi thức Tích cực Trung gian ([SmileRitualView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/SmileRitualView.tsx))**:
  - Chèn bước trung gian tương tác tâm lý sau khi người dùng bấm "Start with Me" trên `MicroCommitmentView.tsx` trước khi vào đếm ngược.
  - Hiển thị Mascot ANT sử dụng ảnh tách nền trong suốt `ant-mascot-removebg.png` (`public/ant-mascot-removebg.png`).
  - **Khung Thoại Truyện Tranh (Comic Speech Bubble)**: Thiết kế ô thoại cong với đuôi trỏ SVG đặc trưng truyện tranh (theo mẫu người dùng gửi đính kèm), chứa câu thoại: *"Hey, are you ready? Let's smile whenever you're about to start the task!"*.
  - **Computer Vision Nhận diện Nụ Cười ([use-smile-detector.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/use-smile-detector.ts))**:
    - Tự động kích hoạt webcam người dùng qua `navigator.mediaDevices.getUserMedia`.
    - Phân tích khung hình thời gian thực qua Canvas 2D (tỷ lệ mở rộng khóe môi MAR, độ tương phản sắc tố môi và độ sáng hàm răng).
    - Hiển thị thanh tiến độ **Smile Meter (0-100%)** với phản hồi trực quan sinh động.
    - Cung cấp nút fallback tức thì: *"I'm smiling! (Start now)"* dành cho môi trường thiếu sáng hoặc thiết bị không có webcam.
  - **Phản hồi Tích cực & Chuyển tiếp Đếm ngược**:
    - Khi phát hiện nụ cười, ANT đổi biểu cảm, chuyển bóng thoại sang: *"You look so energetic! Let's start now!!!"*.
    - Tự động kích hoạt đếm ngược chuyển mượt mà vào `DeepPresenceView.tsx`.
- **Hệ thống Giọng nói & Âm thanh Tương tác ([ant-voice.ts](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/lib/ant-voice.ts))**:
  - Tích hợp giọng nói TTS sống động cho chú kiến ANT bằng Web Speech API (tinh chỉnh `pitch: 1.3`, `rate: 1.05`).
  - Tích hợp hợp âm chuông ngọc (crystal chimes) qua Web Audio API khi chào đón và khi nụ cười được nhận diện thành công.
  - Có nút bật/tắt âm thanh (`Sound on` / `Muted`) cho trải nghiệm tự do, thoải mái.

### Version 1.5.2 — Header Avatar Reverted to Original Static Mascot
- **Hoàn trả Avatar góc trái ([Header.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/Header.tsx))**:
  - Revert DUY NHẤT avatar thương hiệu góc trên cùng bên trái của Header về lại hình ảnh tĩnh ban đầu `/ant-mascot.png` theo đúng yêu cầu của người dùng.
  - Bảo toàn 100% hoạt ảnh chú kiến vẫy tay động không nền ở chính giữa màn hình chào đón ([AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx)).

### Version 1.5.1 — Animated Waving Mascot Integration & Frameless Transparency
- **Tích hợp Video Chuyển động Vẫy tay ([ANT.mp4](file:///c:/My-Project/ADC_Hackathon--ANT/ANT.mp4))**:
  - Trích xuất và tối ưu 151 frames hoạt ảnh chú kiến vẫy tay nhịp nhàng.
  - Xóa bỏ triệt để watermark KlingAI góc trên bên phải và prompt box ở đáy video.
  - Tách sạch nền đen thành độ trong suốt 100% (RGBA Alpha channel) với kỹ thuật flood-fill viền ngoài kết hợp Gaussian feathering, giúp các đường nét phát sáng và ánh mắt long lanh không bị lem hay đục màu.
  - Xuất ra tệp `public/ant-waving.webp` chuẩn web nhẹ chỉ 1.99 MB, tương thích toàn diện mọi trình duyệt mà không gặp lỗi autoplay của thẻ video.
- **Xóa bỏ toàn bộ viền và nền hộp của Mascot ([AntWelcomeView.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/AntWelcomeView.tsx))**:
  - Xóa bỏ hoàn toàn khung tròn và viền hộp (`border-2`, `bg-[#0B132B]`).
  - Chú kiến chuyển động đứng tự do và nổi bật trực tiếp tại trung tâm website, hòa quyện tự nhiên trên nền gradient của cả Dark Mode lẫn Light Mode.
- **Nâng cấp Avatar Header ([Header.tsx](file:///c:/My-Project/ADC_Hackathon--ANT/virtual-double/components/Header.tsx))**:
  - Logo trên Header chuyển sang sử dụng hoạt ảnh vẫy tay động của chú kiến ANT.

### Version 1.5.0 — ANT Mascot, Ambient Gradient & Floating Widget Streamline
- Mascot chú kiến ANT 3D và màn hình chào đón `AntWelcomeView.tsx`.
- Thay ảnh nền núi bằng gradient dịu mắt Dark/Light mode, bỏ hiệu ứng lướt sóng nước (water ripples).
- Tinh giản Floating Widget: xóa nút X đỏ.

### Version 1.4.0 — Floating Companion Architecture & Document PiP Decoupling
- Tách rời `displayMode` khỏi State Model trong `focus-session.tsx`.
- Bổ sung module `floating-companion.tsx` với hook `useNativeClick`.

### Version 1.3.1 — Dark Mode Background Tone Alignment
- Đồng bộ tone nền với Header `#0B132B`.

### Version 1.3.0 — Water Ripple Physics & High-Contrast Countdown
- Sửa màu countdown sphere sang sapphire `#071329` với số Cyan phát sáng.
