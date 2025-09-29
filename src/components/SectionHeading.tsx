interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, id }: SectionHeadingProps) {
  return (
    <header className="section-heading" id={id}>
      <span className="tag" aria-hidden="true">
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
