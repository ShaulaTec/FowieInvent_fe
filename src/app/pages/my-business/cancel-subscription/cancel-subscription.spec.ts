import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelSubscription } from './cancel-subscription';

describe('CancelSubscription', () => {
  let component: CancelSubscription;
  let fixture: ComponentFixture<CancelSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelSubscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
