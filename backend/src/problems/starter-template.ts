export function stripStarterTemplateImplementation(starterTemplate: string): string {
  const match = starterTemplate.match(
    /^(?<prefix>[\s\S]*?function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\([^)]*\)\s*)\{[\s\S]*\}\s*$/u,
  );

  if (!match?.groups?.prefix) {
    return starterTemplate;
  }

  return `${match.groups.prefix}{\n}`;
}
