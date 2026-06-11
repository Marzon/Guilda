import React from "react";

interface FAQAnswerProps {
  content: string | React.ReactNode;
}

/**
 * Renders FAQ answer content with proper formatting and visual styling.
 */
export function FAQAnswer({ content }: FAQAnswerProps) {
  // If it's already a ReactNode (JSX), render directly
  if (React.isValidElement(content)) {
    return <div className="prose prose-sm max-w-none">{content}</div>;
  }

  // If it's not a string, just render it
  if (typeof content !== "string") {
    return <>{content}</>;
  }

  // Parse text for bold, quotes, and keywords
  const parseText = (text: string): React.ReactNode[] => {
    // First handle **bold** markers
    const parts = text.split(/(\*\*[^*]+\*\*|"[^"]+"|'[^']+')/g);
    
    return parts.map((part, index) => {
      // Bold text
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Quoted text - highlight it
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        return (
          <span key={index} className="font-medium text-primary">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Highlight important keywords
  const highlightKeywords = (text: string): string => {
    // Keywords to highlight (will be wrapped later)
    return text;
  };

  // Check if content has explicit formatting (newlines, bullets, etc.)
  const hasExplicitFormatting = content.includes("\n") || 
    /^[•\-\d\)\.✅⚠️🔍📋💬📊💡🚀🔧🎯💰🤖✨🤝📈🛡️💼⚙️🚩🧪]/m.test(content);

  // For simple text without formatting
  if (!hasExplicitFormatting) {
    // Split by sentences for better readability
    const sentences = content.split(/(?<=[.!?])\s+/);
    
    if (sentences.length <= 2) {
      return (
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <p className="text-sm leading-relaxed text-foreground/90">
            {parseText(content)}
          </p>
        </div>
      );
    }

    // Group sentences into logical chunks
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    
    sentences.forEach((sentence, index) => {
      currentChunk.push(sentence);
      // Create new chunk every 2 sentences or at the end
      if (currentChunk.length >= 2 || index === sentences.length - 1) {
        chunks.push([...currentChunk]);
        currentChunk = [];
      }
    });

    return (
      <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-2">
        {chunks.map((chunk, index) => (
          <p key={index} className="text-sm leading-relaxed text-foreground/90">
            {parseText(chunk.join(" "))}
          </p>
        ))}
      </div>
    );
  }

  // Split content into sections by double newlines
  const sections = content.split("\n\n");

  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-3">
      {sections.map((section, sectionIndex) => {
        const lines = section.split("\n").filter(line => line.trim());
        
        // Check if first line is a header (starts with ** or ends with :)
        const firstLine = lines[0]?.trim() || "";
        const isHeaderSection = (firstLine.startsWith("**") && firstLine.includes(":**")) ||
          (firstLine.endsWith(":") && !firstLine.includes("."));

        if (isHeaderSection) {
          const headerText = firstLine
            .replace(/^\*\*/, "")
            .replace(/:\*\*$/, "")
            .replace(/:$/, "");
          const bodyLines = lines.slice(1);
          
          return (
            <div key={sectionIndex} className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {headerText}
              </h4>
              {bodyLines.length > 0 && (
                <ul className="space-y-1 pl-4">
                  {bodyLines.map((line, lineIndex) => {
                    const trimmed = line.trim();
                    const cleanedLine = trimmed
                      .replace(/^[•\-]\s*/, "")
                      .replace(/^\d+[\)\.]\s*/, "");
                    
                    return (
                      <li key={lineIndex} className="flex items-start gap-2 text-sm text-foreground/90">
                        <span className="shrink-0 text-primary/70 mt-1">
                          {getListIcon(trimmed)}
                        </span>
                        <span>{parseText(cleanedLine || trimmed)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        }

        // Check if this section is a list
        const isListSection = lines.length > 1 && lines.every(line => {
          const trimmed = line.trim();
          return (
            /^[•\-✅⚠️🔍📋💬📊💡🚀🔧🎯💰🤖✨🤝📈🛡️💼⚙️🚩🧪]/.test(trimmed) ||
            /^\d+[\)\.]\s/.test(trimmed)
          );
        });

        if (isListSection && lines.length > 0) {
          return (
            <ul key={sectionIndex} className="space-y-1.5 pl-1">
              {lines.map((line, lineIndex) => {
                const trimmed = line.trim();
                const cleanedLine = trimmed
                  .replace(/^[•\-]\s*/, "")
                  .replace(/^\d+[\)\.]\s*/, "");
                
                return (
                  <li key={lineIndex} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span className="shrink-0 text-primary/70">
                      {getListIcon(trimmed)}
                    </span>
                    <span>{parseText(cleanedLine || trimmed)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph(s)
        return (
          <div key={sectionIndex} className="space-y-1.5">
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className="text-sm leading-relaxed text-foreground/90">
                {parseText(line)}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function getListIcon(line: string): string {
  const trimmed = line.trim();
  
  // Return the emoji if line starts with one
  const emojiMatch = trimmed.match(/^([\u{1F300}-\u{1F9FF}]|[✅⚠️🔍📋💬📊💡🚀🔧🎯💰🤖✨🤝📈🛡️💼⚙️🚩🧪])/u);
  if (emojiMatch) {
    return emojiMatch[1];
  }
  
  // Check for numbered list
  if (/^\d+[\)\.]\s/.test(trimmed)) {
    const num = trimmed.match(/^(\d+)/)?.[1];
    return `${num}.`;
  }
  
  // Default bullet
  return "•";
}
