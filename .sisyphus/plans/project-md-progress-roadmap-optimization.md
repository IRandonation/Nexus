# PROJECT.md 进度更新与后续优化工作计划

## TL;DR

> **Quick Summary**: 基于当前代码真实状态，更新 `docs/PROJECT.md` 的进度相关内容（当前进度、接下来工作、优化工作），不做超范围文档重写。
>
> **Deliverables**:
> - 更新后的进度章节（已完成/进行中/未连接）
> - 分层的 P0/P1/P2 后续工作清单
> - 优化工作清单（性能/质量/技术债）
>
> **Estimated Effort**: Short
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: T1 → T4 → T7 → T8

---

## Context

### Original Request
用户要求：
1) 更新目前进度；
2) 提出接下来的工作；
3) 加入优化的工作。

### Interview Summary
**Key Discussions**:
- Widget 当前并未“完全完成”，仅显示完成，拖拽未实现。
- 更新范围限定为“进度+后续+优化”，不做全文件一致性大修。
- 输出粒度按 P0/P1/P2 分层。
- 校验模式采用标准模式（不启用高精度审查）。

**Research Findings**:
- `src/components/widget/Widget.tsx` 无拖拽事件，仅有抓手样式。
- `src-tauri/src/main.rs` 未接入/启动 Insight/Scheduler 生命周期。
- FTS5 未在代码中实现。
- 未发现测试文件。

### Metis Review
**Identified Gaps** (addressed):
- 进度百分比主观风险：在计划中加入“口径校准任务”，避免数字误导。
- “优化工作”边界模糊：按性能/质量/技术债分组并给证据来源。
- 作用域蔓延风险：显式禁止修改非进度相关章节（尤其 2.2 Schema）。

---

## Work Objectives

### Core Objective
在不越界修改的前提下，使 `docs/PROJECT.md` 的进度信息与代码现实一致，并给出可执行的下一步与优化路线。

### Concrete Deliverables
- `docs/PROJECT.md` 的进度相关章节完成更新。
- P0/P1/P2 后续工作项可直接执行。
- 优化工作项具备优先级、理由与代码证据来源。

### Definition of Done
- [ ] `docs/PROJECT.md` 仅在约定章节发生修改（进度/后续/优化相关）
- [ ] Widget、Insight/Scheduler、FTS5、测试现状与代码一致
- [ ] P0/P1/P2 均包含具体动作与验证方式

### Must Have
- 只基于代码证据更新进度，不做主观推测。
- 更新包含“当前进度 + 接下来工作 + 优化工作”三部分。

### Must NOT Have (Guardrails)
- 不修改产品定位、系统架构说明、Schema 细节章节（2.2）
- 不在本计划中实现功能代码（仅文档更新）
- 不引入无证据的“已完成”描述

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO（未发现测试文件）
- **Automated tests**: None（本任务为文档更新）
- **Framework**: none

### QA Policy
每个任务均包含 agent-executed QA 场景，证据保存至 `.sisyphus/evidence/`。

- **文档验证**: Bash（git diff / grep）+ Read
- **代码事实核验**: Grep / Read

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately — 证据与边界):
├── Task 1: 证据基线核验（Widget/服务接线/FTS5/测试） [quick]
├── Task 2: 进度口径校准（百分比与状态标签统一） [writing]
├── Task 3: 章节边界锁定（仅进度/后续/优化） [quick]
└── Task 4: 草拟“当前进度”更新文本 [writing]

Wave 2 (After Wave 1 — 并行写入主要内容):
├── Task 5: 更新“接下来的工作”（P0/P1/P2） [writing]
├── Task 6: 更新“优化工作”（性能/质量/技术债） [writing]
└── Task 7: 一致性检查与术语对齐（仅约定范围） [quick]

Wave 3 (After Wave 2 — 集成与收口):
└── Task 8: 最终差异审计与完成判定 [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: T1 → T4 → T7 → T8 → F1-F4
Parallel Speedup: ~55% faster than sequential
Max Concurrent: 4

### Dependency Matrix

- **1**: — → 4,5,6,8
- **2**: — → 4,5,6,7
- **3**: — → 7,8
- **4**: 1,2 → 7
- **5**: 1,2 → 8
- **6**: 1,2 → 8
- **7**: 2,3,4 → 8
- **8**: 3,5,6,7 → FINAL

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1 `quick`, T2 `writing`, T3 `quick`, T4 `writing`
- **Wave 2**: 3 tasks — T5 `writing`, T6 `writing`, T7 `quick`
- **Wave 3**: 1 task — T8 `unspecified-high`
- **FINAL**: 4 tasks — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. 证据基线核验（Widget/服务接线/FTS5/测试）

  **What to do**:
  - 核验 `Widget.tsx` 是否存在真实拖拽事件实现。
  - 核验 `main.rs` 是否接入 Insight/Scheduler 生命周期。
  - 核验代码中是否存在 FTS5 与测试文件实现。
  - 形成“事实→证据路径”映射用于后续文案更新。

  **Must NOT do**:
  - 不修改任何源码或业务逻辑。
  - 不根据文档描述倒推实现状态。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 以事实核验为主，工作量小且结构化。
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `git-master`: 非 git 历史追溯任务，无需。

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2,3,4)
  - **Blocks**: 4,5,6
  - **Blocked By**: None

  **References**:
  - `src/components/widget/Widget.tsx` - 校验拖拽事件是否存在（onMouseDown/onPointerDown/data-tauri-drag）。
  - `src-tauri/src/main.rs` - 校验是否注册/启动 Insight/Scheduler。
  - `src-tauri/src/services/insight_service.rs` - 证明洞察服务代码已存在。
  - `src-tauri/src/services/scheduler.rs` - 证明调度服务代码已存在。
  - `src-tauri/src/db/mod.rs` - 校验 FTS5 是否落地于数据库层。

  **Acceptance Criteria**:
  - [ ] 能输出 4 个事实结论：Widget 拖拽、Insight/Scheduler 接线、FTS5、测试状态。
  - [ ] 每个结论均绑定至少 1 个文件路径证据。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 事实核验 happy path
    Tool: Bash (rg)
    Preconditions: 仓库位于 D:\Project\Nexus
    Steps:
      1. 执行 rg "onMouseDown|onPointerDown|data-tauri-drag|drag" src/components/widget/Widget.tsx
      2. 执行 rg "InsightService|SchedulerService|app.manage|invoke_handler|setup\(" src-tauri/src/main.rs
      3. 执行 rg "fts5|FTS5|CREATE VIRTUAL TABLE" src-tauri/src
      4. 执行 rg "\.test\.|\.spec\." src src-tauri
    Expected Result: 输出可判断“存在/不存在”的明确证据。
    Failure Indicators: 输出为空且无法判断；证据与结论不一致。
    Evidence: .sisyphus/evidence/task-1-baseline-check.txt

  Scenario: 错误路径（路径错误）
    Tool: Bash (rg)
    Preconditions: 故意传入不存在路径
    Steps:
      1. 执行 rg "InsightService" src-tauri/src/not-exist.rs
      2. 校验命令返回错误并被记录
    Expected Result: 错误被识别并不写入“已核验”结论。
    Evidence: .sisyphus/evidence/task-1-baseline-check-error.txt
  ```

  **Commit**: NO

- [x] 2. 进度口径校准（百分比与状态标签）

  **What to do**:
  - 对“总体进度/Phase 完成度”给出一致口径（保留或弱化百分比）。
  - 保证状态标签（✅/🟡/⏳/❌）与当前代码现实一致。

  **Must NOT do**:
  - 不虚构完成度数字。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 属于文案规范化与口径统一。
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `document-skills`: 当前仅 markdown 文档，不涉及 Office 文档管线。

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1,3,4)
  - **Blocks**: 4,5,6,7
  - **Blocked By**: None

  **References**:
  - `docs/PROJECT.md` - 当前口径与状态标签分布。
  - Task 1 的证据输出 - 用于回填口径，避免主观描述。

  **Acceptance Criteria**:
  - [ ] 状态标签与 Task 1 证据完全一致。
  - [ ] 不出现“代码未接入但标记完成”的冲突陈述。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 文案口径一致性 happy path
    Tool: Read + Bash (rg)
    Preconditions: 已完成 Task 1 证据
    Steps:
      1. 读取 docs/PROJECT.md 进度相关段落
      2. 用 rg 定位 Widget/Insight/Scheduler/FTS5/测试关键词
      3. 与 task-1 证据逐项比对
    Expected Result: 无冲突项。
    Evidence: .sisyphus/evidence/task-2-progress-rubric.txt

  Scenario: 冲突检测（故意注入错误口径）
    Tool: 人工构造检查脚本（Bash）
    Preconditions: 若出现“完成”与证据冲突文本
    Steps:
      1. grep -n "完成" docs/PROJECT.md
      2. 对照 task-1 证据检查冲突
    Expected Result: 冲突被识别并回退修改。
    Evidence: .sisyphus/evidence/task-2-progress-rubric-error.txt
  ```

  **Commit**: NO

- [x] 3. 章节边界锁定（防止越界修改）

  **What to do**:
  - 明确允许修改范围：进度、后续工作、优化工作相关段落。
  - 明确禁止修改范围：产品定位、架构总览、2.2 Schema。

  **Must NOT do**:
  - 不改动非目标章节内容。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 规则检查任务，低复杂高约束。
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1,2,4)
  - **Blocks**: 7,8
  - **Blocked By**: None

  **References**:
  - `docs/PROJECT.md` - 目标章节与非目标章节边界。

  **Acceptance Criteria**:
  - [ ] 形成“可改/不可改”清单并在执行前确认。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 边界检查 happy path
    Tool: Bash (git diff -- docs/PROJECT.md)
    Preconditions: 完成文档修改后
    Steps:
      1. 查看 diff hunk 所在章节
      2. 校验是否仅落在目标章节
    Expected Result: 无越界 hunk。
    Evidence: .sisyphus/evidence/task-3-scope-guard.txt

  Scenario: 越界检测（负例）
    Tool: Bash (grep + diff)
    Preconditions: 若 diff 出现 2.2 Schema 变更
    Steps:
      1. grep -n "## 2.2" -n docs/PROJECT.md
      2. 检查该区段是否出现在 diff
    Expected Result: 若出现则判失败并回退。
    Evidence: .sisyphus/evidence/task-3-scope-guard-error.txt
  ```

  **Commit**: NO

- [x] 4. 草拟并更新“当前进度”文本

  **What to do**:
  - 更新“已完成/进行中/未连接”条目，使之与代码一致。
  - 明确 Widget 当前是“显示完成、拖拽未实现”。

  **Must NOT do**:
  - 不把未接线服务标记为完成。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需高一致性的中文技术文档改写。
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1,2,3)
  - **Blocks**: 7
  - **Blocked By**: 1,2

  **References**:
  - `docs/PROJECT.md` - 现有进度章节模板。
  - `src/components/widget/Widget.tsx` - Widget 拖拽现状。
  - `src-tauri/src/main.rs` - 服务接线现状。

  **Acceptance Criteria**:
  - [ ] 进度段落中的关键状态与代码事实逐项一致。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 当前进度更新 happy path
    Tool: Read + Bash (grep)
    Preconditions: 任务文本已写入
    Steps:
      1. 读取进度章节
      2. grep "Widget|InsightService|SchedulerService|FTS5"
      3. 对照 task-1 证据比对
    Expected Result: 关键项全部一致。
    Evidence: .sisyphus/evidence/task-4-current-progress.txt

  Scenario: 误标完成负例
    Tool: Bash (grep)
    Preconditions: 检查是否误写“Insight/Scheduler 完成”
    Steps:
      1. grep -n "Insight.*完成\|Scheduler.*完成" docs/PROJECT.md
      2. 若命中则判失败
    Expected Result: 无命中。
    Evidence: .sisyphus/evidence/task-4-current-progress-error.txt
  ```

  **Commit**: NO

---

- [x] 5. 更新“接下来的工作”为 P0/P1/P2

  **What to do**:
  - 在“下一步计划”中按 P0/P1/P2 分层重写工作项。
  - P0 聚焦可用性阻塞项（Widget 拖拽、服务接线）；P1/P2 放入增强与优化。

  **Must NOT do**:
  - 不写无法从当前代码推导的功能承诺。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 规划型文案重构，强调可执行性。
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6,7)
  - **Blocks**: 8
  - **Blocked By**: 1,2

  **References**:
  - `docs/PROJECT.md` - 原有 P0/P1/P2/P3 结构。
  - `src-tauri/src/main.rs` - Insight/Scheduler 未接线证据来源。
  - `src/components/widget/Widget.tsx` - Widget 拖拽缺失证据来源。

  **Acceptance Criteria**:
  - [ ] 新路线图包含 P0/P1/P2 三层。
  - [ ] 每层至少 2 项，且具备“做什么+为何现在做”。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: P0/P1/P2 分层完整性 happy path
    Tool: Read + Bash (grep)
    Preconditions: 已写入下一步计划
    Steps:
      1. grep -n "P0\|P1\|P2" docs/PROJECT.md
      2. 检查每层条目数量与内容可执行性
    Expected Result: 三层完整且条目可执行。
    Evidence: .sisyphus/evidence/task-5-roadmap-p012.txt

  Scenario: 层级缺失负例
    Tool: Bash (grep)
    Preconditions: 若某层未出现
    Steps:
      1. 对 P0/P1/P2 分别 grep
      2. 缺失任一层即失败
    Expected Result: 无缺失。
    Evidence: .sisyphus/evidence/task-5-roadmap-p012-error.txt
  ```

  **Commit**: NO

- [x] 6. 加入“优化工作”并分组（性能/质量/技术债）

  **What to do**:
  - 将优化项按“性能/质量/技术债”分组写入文档。
  - 优先纳入当前已暴露的高价值项：日志治理、错误边界、硬编码位置配置化、测试补齐。

  **Must NOT do**:
  - 不把“新功能开发”伪装成优化项。

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 需要结构化表达与优先级叙述。
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5,7)
  - **Blocks**: 8
  - **Blocked By**: 1,2

  **References**:
  - `src-tauri/src/main.rs` / `src-tauri/src/services/task_service.rs` - 日志现状。
  - `src-tauri/src/commands/window.rs` - Widget 位置硬编码。
  - `package.json` / 测试文件检索结果 - 测试缺失现状。

  **Acceptance Criteria**:
  - [ ] 优化项至少覆盖性能/质量/技术债三组。
  - [ ] 每组至少 1 项且有优先级。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 优化分组完整性 happy path
    Tool: Read + Bash (grep)
    Preconditions: 已写入优化工作
    Steps:
      1. grep -n "性能\|质量\|技术债" docs/PROJECT.md
      2. 逐组检查是否存在对应条目
    Expected Result: 三组齐全。
    Evidence: .sisyphus/evidence/task-6-optimization-groups.txt

  Scenario: 空组负例
    Tool: Bash (grep)
    Preconditions: 某组无条目
    Steps:
      1. 检查分组标题后 5 行是否有列表项
      2. 无则失败
    Expected Result: 无空组。
    Evidence: .sisyphus/evidence/task-6-optimization-groups-error.txt
  ```

  **Commit**: NO

- [x] 7. 一致性检查与术语对齐（仅目标范围）

  **What to do**:
  - 校验“当前进度、下一步、优化工作”三处表述一致。
  - 统一 Widget/洞察/调度/FTS5 的状态用词。

  **Must NOT do**:
  - 不扩展到全文件术语大修。

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 一致性巡检与小修正。
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5,6)
  - **Blocks**: 8
  - **Blocked By**: 2,3,4

  **References**:
  - `docs/PROJECT.md` 进度相关段落。

  **Acceptance Criteria**:
  - [ ] 同一事项在不同章节无冲突状态。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 术语一致性 happy path
    Tool: Bash (grep)
    Preconditions: 文档更新完成
    Steps:
      1. grep -n "Widget\|InsightService\|SchedulerService\|FTS5" docs/PROJECT.md
      2. 人工规则脚本检查是否同词多状态冲突
    Expected Result: 无冲突。
    Evidence: .sisyphus/evidence/task-7-term-consistency.txt

  Scenario: 冲突状态负例
    Tool: Bash (grep)
    Preconditions: 若同事项出现“完成/未完成”并存
    Steps:
      1. 抽取相关行并比对
      2. 发现冲突即失败
    Expected Result: 无冲突状态。
    Evidence: .sisyphus/evidence/task-7-term-consistency-error.txt
  ```

  **Commit**: NO

- [x] 8. 最终差异审计与完成判定

  **What to do**:
  - 运行最终 diff 审计，确认仅目标章节变更。
  - 生成完成报告：更新了什么、为何更新、证据何在。

  **Must NOT do**:
  - 不遗漏任何强约束检查。

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要系统性审计与归档。
  - **Skills**: [`git-master`]
    - `git-master`: 用于精确差异核验与变更范围确认。
  - **Skills Evaluated but Omitted**:
    - `writing`: 该任务核心是审计而非撰写。

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential)
  - **Blocks**: FINAL
  - **Blocked By**: 3,5,6,7

  **References**:
  - `docs/PROJECT.md` - 目标文件。
  - `.sisyphus/evidence/task-*.txt` - 各任务证据。

  **Acceptance Criteria**:
  - [ ] `git diff -- docs/PROJECT.md` 显示仅目标章节变更。
  - [ ] 生成最终审计摘要并引用证据文件。

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: 最终审计 happy path
    Tool: Bash (git diff + grep)
    Preconditions: 前置任务全部完成
    Steps:
      1. git diff -- docs/PROJECT.md > .sisyphus/evidence/task-8-final-diff.txt
      2. grep -n "## 1\|## 2\.2" .sisyphus/evidence/task-8-final-diff.txt
      3. 确认无越界章节改动
    Expected Result: 仅目标章节改动。
    Evidence: .sisyphus/evidence/task-8-final-diff.txt

  Scenario: 越界改动负例
    Tool: Bash (grep)
    Preconditions: 若 diff 中出现非目标章节
    Steps:
      1. 检测越界 hunk
      2. 记录并阻止完成判定
    Expected Result: 无越界。
    Evidence: .sisyphus/evidence/task-8-final-diff-error.txt
  ```

  **Commit**: YES
  - Message: `docs(project): update progress, next steps and optimization roadmap`
  - Files: `docs/PROJECT.md`
  - Pre-commit: `git diff -- docs/PROJECT.md`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  对照计划逐条核验：是否仅修改目标章节；是否所有“当前状态”有代码证据；是否无越界更新。
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  运行 `git diff -- docs/PROJECT.md`，检查 Markdown 结构、表格完整性、术语一致性。
  Output: `Doc Structure [PASS/FAIL] | Scope [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  执行计划内每个 QA Scenario，检查证据文件存在于 `.sisyphus/evidence/final-qa/`。
  Output: `Scenarios [N/N pass] | Evidence [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  校验变更是否仅覆盖“进度/后续/优化”相关内容，无 Schema/产品定位等越界修改。
  Output: `Tasks [N/N compliant] | Scope Creep [NONE/FOUND] | VERDICT`

---

## Commit Strategy

- **1**: `docs(project): sync progress and roadmap with code reality`
  - Files: `docs/PROJECT.md`
  - Pre-commit: `git diff -- docs/PROJECT.md`

---

## Success Criteria

### Verification Commands
```bash
git diff -- docs/PROJECT.md
grep -n "Widget\|InsightService\|SchedulerService\|FTS5\|测试" docs/PROJECT.md
```

### Final Checklist
- [ ] 进度叙述与代码一致
- [ ] P0/P1/P2 明确且可执行
- [ ] 优化工作已纳入并分层
- [ ] 无越界修改
