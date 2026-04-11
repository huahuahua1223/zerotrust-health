import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RequiredNetworkGate, WrongNetworkScreen } from "@/components/web3/RequiredNetworkGate";

const useRequiredNetworkMock = vi.fn();

vi.mock("@/hooks/useRequiredNetwork", () => ({
  useRequiredNetwork: () => useRequiredNetworkMock(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("RequiredNetworkGate", () => {
  it("renders children when network is allowed", () => {
    useRequiredNetworkMock.mockReturnValue({
      currentChainId: 11155111,
      currentChainName: "Sepolia",
      requiredChainId: 11155111,
      requiredChainName: "Sepolia",
      isWrongNetwork: false,
      openNetworkPicker: vi.fn(),
      switchToRequiredChain: vi.fn(),
    });

    render(
      <RequiredNetworkGate>
        <div>app-content</div>
      </RequiredNetworkGate>
    );

    expect(screen.getByText("app-content")).toBeInTheDocument();
  });

  it("blocks children and shows wrong network screen", () => {
    useRequiredNetworkMock.mockReturnValue({
      currentChainId: 31337,
      currentChainName: "Hardhat",
      requiredChainId: 11155111,
      requiredChainName: "Sepolia",
      isWrongNetwork: true,
      openNetworkPicker: vi.fn(),
      switchToRequiredChain: vi.fn().mockResolvedValue(false),
    });

    render(
      <RequiredNetworkGate>
        <div>app-content</div>
      </RequiredNetworkGate>
    );

    expect(screen.queryByText("app-content")).not.toBeInTheDocument();
    expect(screen.getByText("networkGuard.title")).toBeInTheDocument();
    expect(screen.getByText("Hardhat (#31337)")).toBeInTheDocument();
  });
});

describe("WrongNetworkScreen", () => {
  it("tries switching to sepolia", async () => {
    const onSwitch = vi.fn().mockResolvedValue(true);

    render(
      <WrongNetworkScreen
        currentChainId={31337}
        currentChainName="Hardhat"
        requiredChainId={11155111}
        requiredChainName="Sepolia"
        onSwitch={onSwitch}
        onOpenNetworks={vi.fn()}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("networkGuard.switchButton"));
    });

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it("opens network picker from fallback button", () => {
    const onOpenNetworks = vi.fn();

    render(
      <WrongNetworkScreen
        currentChainId={31337}
        currentChainName="Hardhat"
        requiredChainId={11155111}
        requiredChainName="Sepolia"
        onSwitch={vi.fn().mockResolvedValue(true)}
        onOpenNetworks={onOpenNetworks}
      />
    );

    fireEvent.click(screen.getByText("networkGuard.openNetworksButton"));

    expect(onOpenNetworks).toHaveBeenCalledTimes(1);
  });
});
