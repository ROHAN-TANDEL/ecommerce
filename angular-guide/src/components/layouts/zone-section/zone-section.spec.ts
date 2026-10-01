import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneSection } from './zone-section';

describe('ZoneSection', () => {
  let component: ZoneSection;
  let fixture: ComponentFixture<ZoneSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
