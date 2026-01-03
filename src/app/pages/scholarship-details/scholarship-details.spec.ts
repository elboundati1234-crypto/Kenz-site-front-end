import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipDetailsComponent } from './scholarship-details';

describe('ScholarshipDetails', () => {
  let component: ScholarshipDetailsComponent;
  let fixture: ComponentFixture<ScholarshipDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScholarshipDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScholarshipDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
