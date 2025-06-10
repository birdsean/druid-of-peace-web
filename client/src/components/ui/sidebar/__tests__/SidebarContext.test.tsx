import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock mobile hook so tests don't depend on window size
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../";

function Consumer() {
  const { state, toggleSidebar } = useSidebar();
  return (
    <>
      <span data-testid="state">{state}</span>
      <button onClick={toggleSidebar}>toggle</button>
    </>
  );
}

describe("Sidebar context", () => {
  it("toggles state with toggleSidebar", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Consumer />
      </SidebarProvider>
    );

    const state = screen.getByTestId("state");
    expect(state.textContent).toBe("collapsed");
    fireEvent.click(screen.getByText("toggle"));
    expect(state.textContent).toBe("expanded");
  });

  it("SidebarTrigger toggles open state", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarTrigger data-testid="trigger" />
        <Consumer />
      </SidebarProvider>
    );

    const state = screen.getByTestId("state");
    expect(state.textContent).toBe("collapsed");
    fireEvent.click(screen.getByTestId("trigger"));
    expect(state.textContent).toBe("expanded");
  });
});
