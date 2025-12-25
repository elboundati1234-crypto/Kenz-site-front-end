import { TestBed } from '@angular/core/testing';

import { OpportunityService } from './opportunity';

describe('Opportunity', () => {
  let service: OpportunityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
