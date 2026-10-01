import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalSection } from './vertical-section';

describe('VerticalSection', () => {
  let component: VerticalSection;
  let fixture: ComponentFixture<VerticalSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
