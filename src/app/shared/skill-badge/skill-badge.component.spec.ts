import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillBadgeComponent } from './skill-badge.component';

describe('SkillBadgeComponent', () => {
  let component: SkillBadgeComponent;
  let fixture: ComponentFixture<SkillBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
