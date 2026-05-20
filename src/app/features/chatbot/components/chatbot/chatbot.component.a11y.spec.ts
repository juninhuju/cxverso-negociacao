import { TestBed } from '@angular/core/testing';
import { expectNoSeriousA11yViolations } from '../../../../../testing/axe-accessibility';
import { ChatbotComponent } from './chatbot.component';

describe('ChatbotComponent A11y', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotComponent],
    }).compileComponents();
  });

  it('deve atender regras WCAG A/AA sem violacoes graves', async () => {
    const fixture = TestBed.createComponent(ChatbotComponent);
    fixture.detectChanges();

    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
