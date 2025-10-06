import { HTMLAttributes } from 'react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  wrapperProps?: HTMLAttributes<HTMLElement>;
}

export function SectionHeading({ eyebrow, title, description, id, wrapperProps }: SectionHeadingProps) {
  return (
    <header className="section-heading" id={id} {...wrapperProps}>
      <span className="tag" aria-hidden="true">
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
