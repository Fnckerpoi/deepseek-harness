# Agent Note: Collapsible Question Composer Content

Status: implemented

[English](2026-09-27-collapsible-question-composer-content.md) | 中文

## Problem

当智能体调用 `ask_user_question` 且带有较长的 `question` 题干或在 `detail` 中提供大量补充说明时，渲染出的提问卡片会几乎占满整个可用视口。由于卡片自身设定了 `min(60vh, 520px)` 的最大高度上限，且 `.header` 设定为 `flex-shrink: 0` 且无高度限制，长题干直接撑大头部并将下面的 `.options` 容器压缩至 0px，将选项和底部按钮推到卡片裁剪区域之外。用户既无法看到选项，也无法滚动查看和选择答案。

## Decision

提问卡片布局将头部、补充说明、选项列表与底部操作区解耦为相互独立的受控区域：

1. **题干折叠与独立滚动**：`.headingBlock` 容器将默认静止高度限制在 `min(10vh, 52px)` 并设置 `overflow: hidden`。当文本溢出该区域时，显示本地化折叠/展开按钮（`nav.expandQuestion` / `nav.collapseQuestion`），允许用户将题干展开为限高 `min(60vh, 360px)` 且带独立滚动条（`overflow-y: auto`）的区域。
2. **补充说明折叠与独立滚动**：问题说明区块（`.detail`）默认限高 `min(12vh, 72px)`，并在内容溢出时提供折叠按钮（`nav.expandDetail` / `nav.collapseDetail`），展开后拥有最大 `min(48vh, 320px)` 的独立滚动容器。
3. **独立的选项滚动区与固定底部**：正文弹性容器 `.body` 保持 `min-height: 0; overflow: hidden`，将滚动职责完全交由 `.options` 容器（`flex: 1 1 auto; min-height: 0; overflow-y: auto`）。卡片底部 `.footer` 保持 `flex-shrink: 0` 固定在卡片底部，保证无论题干多长，翻页、跳过和提交操作均始终可见且可点击。
4. **响应式与无障碍折叠控制**：按钮遵循标准 `aria-expanded` 与 `aria-label` 属性，并在 `locales.ts` 中提供中英文双语字典支持。容器尺寸变动通过 `ResizeObserver` 结合降级测量机制进行监听。

## Verification

改动已在多个测试层级中完成验证：
- `composer-styles.client.spec.ts` 验证了题干高度上限、独立滚动边界与固定底部操作栏的 CSS Module 样式契约声明。
- `user-questions-composer.client.spec.tsx` 验证了长文本下的折叠展开交互、单选多选操作与批量提交功能，涵盖模拟布局指标环境。
- `apps/web/tests/question-composer.e2e.ts` 在真实 Chromium 浏览器环境下测试了 380px、440px 与 520px 视口高度场景，验证了选项列表始终可滚动且底部操作保持在可视区域内。
- `packages/client/ui-user-questions` 的全部 54 项单元与组件测试及 Playwright 浏览器端到端测试均顺利通过无回归。

## Alternatives considered

**仅调大卡片的 `max-height`**。将卡片上限从 520px 放大并不能在小屏幕、移动端视口或模型输出上千字题干时解决问题，无限制膨胀的头部依然会挤压选项区。

**将长问题放入 `detail` 字段**。把长文本移入 `detail` 依然位于同一布局流的选项上方。若没有独立的滚动区域分割，过长的说明同样会导致选项行被挤压甚至隐藏。

## Consequences

超长问题不再遮挡选项或阻碍用户提交答复。题干和说明区域通过显式的折叠展开控件保持完整可读性，同时保证选项与提交按钮即时可用。
