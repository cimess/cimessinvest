"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { BlockInstance, ColorSystemConfig } from "../types";
import { getComponentForTemplate, resolveComponentProps } from "../resolver";
import { AlertCircle } from "lucide-react";

// -----------------------------------------------------------------------------
// BLOCK ERROR BOUNDARY (Isolates component faults to protect page availability)
// -----------------------------------------------------------------------------

interface BlockErrorBoundaryProps {
  blockId: string;
  blockType: string;
  children: ReactNode;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): BlockErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[BlockErrorBoundary] Error in block "${this.props.blockId}" (${this.props.blockType}):`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-block-id={this.props.blockId}
          data-block-type={this.props.blockType}
          className="p-6 my-4 mx-auto max-w-4xl bg-red-950/20 border border-red-500/20 rounded-lg text-center text-red-300 text-xs"
        >
          <div className="flex items-center justify-center gap-2 mb-1 text-red-400 font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Component Display Fallback ({this.props.blockType})</span>
          </div>
          <p className="text-red-300/70 text-[11px]">
            This section is temporarily unavailable. The rest of the page remains functional.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// -----------------------------------------------------------------------------
// DECLARATIVE BLOCK RENDERER
// -----------------------------------------------------------------------------

export interface BlockRendererProps {
  sections: BlockInstance[];
  templateSlug: string;
  theme?: ColorSystemConfig;
  context?: {
    brandName?: string;
    whatsappNumber?: string;
    companySlug?: string;
  };
}

export default function BlockRenderer({
  sections,
  templateSlug,
  theme,
  context,
}: BlockRendererProps) {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  // Inject template scoped theme custom properties
  const themeStyle = theme
    ? ({
        "--color-primary": theme.primary,
        "--color-accent": theme.accent,
        "--color-bg": theme.background,
        "--color-surface": theme.surface,
        "--color-text-primary": theme.textPrimary,
        "--color-text-secondary": theme.textSecondary,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className="template-root w-full min-h-screen" style={themeStyle}>
      {sections.map((section) => {
        const Component = getComponentForTemplate(templateSlug, section.type);

        if (!Component) {
          console.warn(
            `[BlockRenderer] No component found for type "${section.type}" in template "${templateSlug}". Skipping block "${section.id}".`
          );
          return null;
        }

        const resolvedProps = resolveComponentProps(section, context);

        return (
          <BlockErrorBoundary
            key={section.id}
            blockId={section.id}
            blockType={section.type}
          >
            <Component {...resolvedProps} />
          </BlockErrorBoundary>
        );
      })}
    </div>
  );
}
