import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterFormBuilder } from './master-form-builder';

describe('MasterFormBuilder', () => {
  let component: MasterFormBuilder;
  let fixture: ComponentFixture<MasterFormBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterFormBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterFormBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
