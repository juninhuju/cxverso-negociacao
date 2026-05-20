import * as axe from 'axe-core';

const CRITICAL_IMPACTS: ReadonlySet<string> = new Set(['critical', 'serious']);

function formatViolations(violations: readonly axe.Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => node.target.join(', '))
        .join(' | ');
      return `${violation.id} [${violation.impact ?? 'unknown'}]: ${nodes}`;
    })
    .join('\n');
}

export async function expectNoSeriousA11yViolations(element: Element): Promise<void> {
  const results = await axe.run(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
    // In headless testing this rule can be noisy due to missing computed styles/fonts.
    rules: {
      'color-contrast': { enabled: false },
    },
  });

  const seriousViolations = results.violations.filter((violation) =>
    CRITICAL_IMPACTS.has(violation.impact ?? ''),
  );

  expect(seriousViolations)
    .withContext(`Violacoes de acessibilidade encontradas:\n${formatViolations(seriousViolations)}`)
    .toEqual([]);
}
