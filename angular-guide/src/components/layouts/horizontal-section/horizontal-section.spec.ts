import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalSection } from './horizontal-section';

describe('HorizontalSection', () => {
  let component: HorizontalSection;
  let fixture: ComponentFixture<HorizontalSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorizontalSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizontalSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
