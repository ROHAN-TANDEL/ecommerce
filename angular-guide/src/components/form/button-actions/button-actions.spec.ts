import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonActions } from './button-actions';

describe('ButtonActions', () => {
  let component: ButtonActions;
  let fixture: ComponentFixture<ButtonActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
