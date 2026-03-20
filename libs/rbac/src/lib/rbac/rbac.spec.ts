import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rbac } from './rbac';

describe('Rbac', () => {
  let component: Rbac;
  let fixture: ComponentFixture<Rbac>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rbac],
    }).compileComponents();

    fixture = TestBed.createComponent(Rbac);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
