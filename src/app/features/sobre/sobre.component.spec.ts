import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SobreComponent } from './sobre.component';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

describe('SobreComponent', () => {
  let component: SobreComponent;
  let fixture: ComponentFixture<SobreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreComponent, MatIconModule],
    }).compileComponents();
    fixture = TestBed.createComponent(SobreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o título principal', () => {
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1.nativeElement.textContent).toContain('Sobre o sistema');
  });

  it('deve exibir o subtítulo institucional', () => {
    const subtitle = fixture.debugElement.query(By.css('.sobre-subtitle'));
    expect(subtitle.nativeElement.textContent).toContain('propósito');
  });

  it('deve exibir dois cards institucionais', () => {
    const cards = fixture.debugElement.queryAll(By.css('.sobre-card'));
    expect(cards.length).toBe(2);
  });

  it('deve exibir ícones institucionais nos cards', () => {
    const icons = fixture.debugElement.queryAll(By.css('.sobre-card__icon mat-icon'));
    expect(icons.length).toBe(2);
    expect(icons[0].nativeElement.textContent).toContain('flag');
    expect(icons[1].nativeElement.textContent).toContain('auto_graph');
  });

  it('deve aplicar classes de cor nos cards', () => {
    const azul = fixture.debugElement.query(By.css('.sobre-card--azul'));
    const laranja = fixture.debugElement.query(By.css('.sobre-card--laranja'));
    expect(azul).toBeTruthy();
    expect(laranja).toBeTruthy();
  });

  it('deve exibir o texto do objetivo', () => {
    const objetivo = fixture.debugElement.query(By.css('.sobre-card--azul p'));
    expect(objetivo.nativeElement.textContent).toContain('viabilizar a renegociação');
  });

  it('deve exibir o texto de soluções futuras', () => {
    const futuro = fixture.debugElement.query(By.css('.sobre-card--laranja p'));
    expect(futuro.nativeElement.textContent).toContain('A solução foi concebida');
  });
});
