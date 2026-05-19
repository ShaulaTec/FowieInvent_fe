import { ComponentFixture, TestBed } from "@angular/core/testing";

import { INav } from "./i-nav";

describe("INav", () => {
  let component: INav;
  let fixture: ComponentFixture<INav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [INav],
    }).compileComponents();

    fixture = TestBed.createComponent(INav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
