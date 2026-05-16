# Project Identity & Design System

Keep this configuration to ensure consistency in all future modifications.

## Brand Identity
- **Name:** REALIZE
- **Vibe:** Professional, Administrative, Clean, Trustworthy
- **Context:** Real Estate / Property Management System (Gestão de Aluguéis)

## Visual Architecture

### 1. Layout
- **Sidebar Navigation:** Fixed left sidebar.
  - White/Light Gray background.
  - Blue active state (`#2563EB` or similar vibrant blue) for menu items with rounded corners.
  - Logo at the top ("REALIZE." with a house icon).
  - User profile section at the bottom.
- **Top Bar:** Breadcrumbs (e.g., Workspace > Dashboard) in light gray, small text.
- **Main Heading:** Bold, Italicized, and Large (e.g., *Overview*, *CONTRATOS*). Use a font like Inter with `font-bold italic`.

### 2. Typography
- **Primary Font:** Sans-serif (Inter/Geist).
- **Headings:** Italicized and heavyweight for emphasis.
- **Body:** Clean, high legibility.

### 3. Color Palette
- **Primary Blue:** Used for branding, active navigation, and primary actions (e.g., "NOVO CONTRATO").
- **Success:** Green for "RECEBIDO" or "CONTRATO ATIVO".
- **Danger:** Red for "INADIMPLÊNCIA", "EXCLUIR", and "VENCIDOS".
- **Warning:** Amber for alerts.

### 4. Components & Patterns
- **Cards:** White background, subtle gray border, light shadow.
- **Stats Cards:** Contain an icon in a colored square background, title in light gray caps, and large bold values.
- **Lists (Contratos/Imóveis):**
  - Item cards spanning the full width of the container.
  - Large titles followed by sub-details (Locatário, Proprietário, Datas).
  - Action buttons in the top right of the card (VISUALIZAR, EDITAR, EXCLUIR, etc.).
- **Badges:** Pill-shaped badges with background colors for status.
- **Interaction:** Maintain high contrast and clear call-to-action buttons in the top right of sections.

## Guardrails
- **Preserve Structure:** Do NOT change the sidebar navigation or overall layout when adding features.
- **Consistent Styling:** Always apply the bold-italic style to new page headings.
- **Iconography:** Use `lucide-react` for all icons, matching the weights seen in the design.
