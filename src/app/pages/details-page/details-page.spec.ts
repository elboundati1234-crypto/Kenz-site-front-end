import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPageComponent } from './details-page';

describe('DetailsPage', () => {
  let component: DetailsPageComponent;
  let fixture: ComponentFixture<DetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
