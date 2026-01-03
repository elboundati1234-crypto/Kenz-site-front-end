import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipsComponent } from './scholarships';

describe('ScholarshipsComponent', () => {
  let component: ScholarshipsComponent;
  let fixture: ComponentFixture<ScholarshipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScholarshipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScholarshipsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
