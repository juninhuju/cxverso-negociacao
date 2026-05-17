import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();
  });

  it('deve mapear status APTO para label e css corretos', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('status', 'APTO');
    fixture.detectChanges();

    expect(component.config.label).toBe('Apto');
    expect(component.config.cssClass).toBe('status-apto');
  });

  it('deve mapear status CEDIDO para label e css corretos', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    const component = fixture.componentInstance;

    fixture.componentRef.setInput('status', 'CEDIDO');
    fixture.detectChanges();

    expect(component.config.label).toBe('Cedido');
    expect(component.config.cssClass).toBe('status-cedido');
  });
});
